"use server"

import { revalidatePath } from "next/cache"
import { fetchOddsFromApi, transformOddsData } from "@/lib/api/odds-api"
import { getServerClient } from "@/lib/supabase"

export async function fetchOdds() {
  try {
    // Get all active sports
    const supabase = getServerClient()
    const { data: sports, error: sportsError } = await supabase.from("sports").select("key, name").eq("active", true)

    if (sportsError) {
      console.error("Error fetching sports:", sportsError)
      return { success: false, error: `Failed to fetch sports: ${sportsError.message}` }
    }

    // If no sports found, try to fetch NBA data as a fallback
    const sportsToFetch = sports && sports.length > 0 ? sports : [{ key: "basketball_nba", name: "NBA Basketball" }]

    let totalBets = 0
    const results = []

    // Fetch odds for each sport
    for (const sport of sportsToFetch) {
      try {
        console.log(`Fetching odds for ${sport.name}...`)

        // Fetch odds directly from the API
        const response = await fetchOddsFromApi(sport.key)

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
        const bets = transformOddsData(response.data)
        console.log(`Found ${bets.length} betting opportunities for ${sport.name}`)

        if (bets.length === 0) {
          results.push({
            sport: sport.name,
            success: true,
            count: 0,
            message: "No betting opportunities found",
          })
          continue
        }

        // Store in Supabase
        const { data, error } = await supabase
          .from("bets")
          .upsert(
            bets.map((bet) => ({
              ...bet,
              // Use a deterministic ID based on the match, market, and selection
              // This prevents duplicates when refreshing the data
              id: crypto.randomUUID(),
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
          data?.map((bet) => ({
            bet_id: bet.id,
            odds: bet.odds,
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
