import { NextResponse } from "next/server"
import { fetchOddsFromApi, transformOddsData } from "@/lib/api/odds-api"
import { getServerClient } from "@/lib/supabase"

// This endpoint is designed to be called by a cron job service like Vercel Cron
export async function GET() {
  try {
    // Get all active sports
    const supabase = getServerClient()
    const { data: sports, error: sportsError } = await supabase.from("sports").select("key, name").eq("active", true)

    if (sportsError) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch sports", error: sportsError },
        { status: 500 },
      )
    }

    const results = []

    // Fetch odds for each sport
    for (const sport of sports || []) {
      try {
        // Fetch odds from API
        const response = await fetchOddsFromApi(sport.key)

        if (!response.success) {
          results.push({
            sport: sport.name,
            success: false,
            message: "Failed to fetch odds from API",
          })
          continue
        }

        // Transform the data
        const bets = transformOddsData(response.data)

        // Store in Supabase
        const { data, error } = await supabase
          .from("bets")
          .upsert(
            bets.map((bet) => ({
              ...bet,
              id: crypto.randomUUID(),
              updated_at: new Date().toISOString(),
            })),
            { onConflict: "match,market,selection" },
          )
          .select()

        if (error) {
          results.push({
            sport: sport.name,
            success: false,
            message: "Failed to store bets in database",
            error,
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
          await supabase.from("odds_history").insert(oddsHistoryEntries)
        }

        results.push({
          sport: sport.name,
          success: true,
          count: bets.length,
        })
      } catch (error) {
        results.push({
          sport: sport.name,
          success: false,
          message: "Error processing sport",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Completed odds update job",
      results,
    })
  } catch (error) {
    console.error("Error in update-odds cron job:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error in update-odds cron job",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
