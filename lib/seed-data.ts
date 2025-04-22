import { getServerClient } from "./supabase"

export async function seedBetsData() {
  try {
    const supabase = getServerClient()

    // Check if we already have data
    const { count, error: countError } = await supabase.from("bets").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error checking existing data:", countError)
      return { success: false, message: "Error checking existing data", error: countError }
    }

    if (count && count > 0) {
      console.log("Data already seeded")
      return { success: true, message: "Data already seeded" }
    }

    console.log("Starting to seed data...")

    // Simplified data set for initial testing
    const betsData = [
      {
        sport: "NBA",
        match: "Lakers vs. Warriors",
        market: "Spread",
        selection: "Lakers -4.5",
        odds: "+110",
        book_odds: "-105",
        edge_percentage: 7.3,
        expected_value: "$14.60",
        event_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        confidence: "high",
        status: "active",
      },
      {
        sport: "NFL",
        match: "Chiefs vs. Ravens",
        market: "Total",
        selection: "Over 49.5",
        odds: "-110",
        book_odds: "-120",
        edge_percentage: 4.5,
        expected_value: "$9.00",
        event_time: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
        confidence: "medium",
        status: "active",
      },
      {
        sport: "NBA",
        match: "Celtics vs. 76ers",
        market: "Spread",
        selection: "Celtics -3.5",
        odds: "-115",
        book_odds: "-120",
        edge_percentage: 2.1,
        expected_value: "$4.20",
        event_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        confidence: "medium",
        status: "completed",
        result: "win",
      },
    ]

    console.log(`Inserting ${betsData.length} bets...`)

    // Insert bets data
    const { data: bets, error: betsError } = await supabase.from("bets").insert(betsData).select()

    if (betsError) {
      console.error("Error seeding bets data:", betsError)
      return { success: false, message: "Error seeding bets data", error: betsError }
    }

    console.log(`Successfully inserted ${bets?.length || 0} bets`)

    // Only proceed with odds history if bets were successfully inserted
    if (bets && bets.length > 0) {
      console.log("Creating odds history...")

      // Simplified odds history data
      const oddsHistoryData = bets.map((bet) => ({
        bet_id: bet.id,
        odds: bet.odds,
        recorded_at: new Date().toISOString(),
      }))

      console.log(`Inserting ${oddsHistoryData.length} odds history records...`)

      const { error: oddsHistoryError } = await supabase.from("odds_history").insert(oddsHistoryData)

      if (oddsHistoryError) {
        console.error("Error seeding odds history data:", oddsHistoryError)
        return {
          success: true,
          message: "Bets inserted but failed to insert odds history",
          error: oddsHistoryError,
        }
      }

      console.log(`Successfully inserted ${oddsHistoryData.length} odds history records`)
    }

    console.log("Data seeded successfully")
    return { success: true, message: "Data seeded successfully" }
  } catch (error) {
    console.error("Unexpected error during seeding:", error)
    return {
      success: false,
      message: "Unexpected error during seeding",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
