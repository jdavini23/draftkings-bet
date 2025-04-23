import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create Supabase client directly in the API route
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Supabase environment variables",
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Simple bet data (just one record)
    const betData = {
      sport: "NBA",
      match: "Lakers vs. Warriors",
      market: "Spread",
      selection: "Lakers -4.5",
      odds: "+110",
      book_odds: "-105",
      edge_percentage: 7.3,
      expected_value: "$14.60",
      event_time: new Date().toISOString(),
      confidence: "high",
      status: "active",
    }

    // Insert a single bet
    const { data, error } = await supabase.from("bets").insert(betData).select()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Error inserting bet data",
          error: JSON.stringify(error),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Successfully inserted bet data",
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in simple seed route:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Exception in simple seed route",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
