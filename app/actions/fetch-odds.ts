"use server"

import { revalidatePath } from "next/cache"
import { fetchOddsFromApi, transformOddsData } from "@/lib/api/odds-api"
import { getServerClient } from "@/lib/supabase"

export async function fetchOdds() {
  try {
    // Get all active sports
    const supabase = getServerClient()

    // Define the specific sport keys for basketball, football, and baseball
    const targetSportKeys = [
      "basketball_nba",       // NBA Basketball
      "americanfootball_nfl", // NFL Football
      "baseball_mlb"          // MLB Baseball
      // You can add more specific keys here if you track other leagues,
      // e.g., "americanfootball_ncaaf", "basketball_ncaab"
    ];

    const { data: sports, error: sportsError } = await supabase
      .from("sports")
      .select("key, name, has_outrights")
      .eq("active", true)
      .in("key", targetSportKeys); // Filter by the specified sport keys

    if (sportsError) {
      console.error("Error fetching sports:", sportsError);
      return { success: false, error: `Failed to fetch sports: ${sportsError.message}` };
    }

    // Use the filtered sports directly. If no matching sports are found (or none are active),
    // sportsToFetch will be an empty array.
    const sportsToFetch = sports || [];

    if (sportsToFetch.length === 0) {
      console.log(
        "No active sports found matching the desired keys (basketball_nba, americanfootball_nfl, baseball_mlb). No odds will be fetched."
      );
      // Revalidate the path to ensure the UI reflects that no new odds were fetched.
      revalidatePath("/");
      return {
        success: true,
        message:
          "No active sports found for basketball, football, or baseball. Zero betting opportunities fetched.",
        results: [],
      };
    }

    let totalBets = 0
    const results = []

    // Fetch odds for each sport
    for (const sport of sportsToFetch) {
      try {
        console.log(`Fetching odds for ${sport.name}...`)

        // Determine market types based on sport properties
        let marketQueryParam = "h2h,spreads,totals" // Default for most sports
        // Assuming 'sport' now has a 'has_outrights' boolean property
        // or we infer from the key.
        const isOutrightSport =
          sport.has_outrights || sport.key.includes("_winner") || sport.key.includes("futures") || sport.key.startsWith("politics_")

        if (isOutrightSport) {
          marketQueryParam = "outrights" // Use 'outrights' for sports like election winner, tournament winner
        }

        // Fetch odds directly from the API with dynamic markets
        const response = await fetchOddsFromApi(sport.key, marketQueryParam)

        if (!response.success) {
          console.error(`Failed to fetch odds for ${sport.name}:`, response)
          results.push({
            sport: sport.name,
            success: false,
            message: "Failed to fetch odds from API",
          })
          continue
        }

        // Transform the data
        const rawBets = transformOddsData(response.data)
        console.log(`Found ${rawBets.length} raw betting opportunities for ${sport.name}`)

        // De-duplicate bets before upserting
        const uniqueBetsMap = new Map()
        rawBets.forEach(bet => {
          const key = `${bet.match}-${bet.market}-${bet.selection}`
          if (!uniqueBetsMap.has(key)) {
            uniqueBetsMap.set(key, bet)
          } else {
            // Optionally, log that a duplicate was found and skipped from the batch
            console.log(`Duplicate bet in batch skipped for key: ${key}, sport: ${sport.name}`)
          }
        })
        const bets = Array.from(uniqueBetsMap.values()) // 'bets' is now the de-duplicated array
        console.log(`Found ${bets.length} unique betting opportunities for ${sport.name} after de-duplication`)

        if (bets.length === 0) {
          results.push({
            sport: sport.name,
            success: true,
            count: 0,
            message: "No unique betting opportunities found after de-duplication",
          })
          continue
        }

        // Store in Supabase
        const { data, error } = await supabase
          .from("bets")
          .upsert(
            bets.map((bet) => ({
              sport: bet.sport,
              match: bet.match,
              market: bet.market,
              selection: bet.selection,
              odds: bet.odds,
              book_odds: bet.book_odds,
              edge_percentage: bet.edge_percentage,
              expected_value: bet.expected_value,
              event_time: bet.event_time,
              confidence: bet.confidence,
              status: bet.status,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: "match,market,selection" },
          )
          .select()

        if (error) {
          console.error(`Error storing bets for ${sport.name}:`, error)
          results.push({
            sport: sport.name,
            success: false,
            message: `Failed to store bets in database: ${error.message}`,
          })
          continue
        }

        // For each bet, add an entry to odds_history
        const oddsHistoryEntries =
          data?.map((betEntry) => ({
            bet_id: betEntry.id,
            odds: betEntry.odds,
            recorded_at: new Date().toISOString(),
          })) || []

        if (oddsHistoryEntries.length > 0) {
          const { error: historyError } = await supabase.from("odds_history").insert(oddsHistoryEntries)

          if (historyError) {
            console.error(`Error storing odds history for ${sport.name}:`, historyError)
          }
        }

        totalBets += bets.length
        results.push({
          sport: sport.name,
          success: true,
          count: bets.length,
        })
      } catch (error) {
        console.error(`Error processing ${sport.name}:`, error)
        results.push({
          sport: sport.name,
          success: false,
          message: "Error processing sport",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Revalidate the dashboard page to show updated data
    revalidatePath("/")

    return {
      success: true,
      message: `Successfully fetched and stored ${totalBets} betting opportunities`,
      results,
    }
  } catch (error) {
    console.error("Error fetching odds:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
