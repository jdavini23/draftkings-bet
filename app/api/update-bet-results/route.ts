import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase"

// This endpoint would be called when game results are available
export async function POST(request: Request) {
  try {
    const { betId, result } = await request.json()

    if (!betId || !result || !["win", "loss", "push"].includes(result)) {
      return NextResponse.json({ success: false, message: "Invalid request parameters" }, { status: 400 })
    }

    const supabase = getServerClient()

    // Update the bet with the result
    const { data, error } = await supabase
      .from("bets")
      .update({
        result,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", betId)
      .select()

    if (error) {
      return NextResponse.json({ success: false, message: "Failed to update bet result", error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully updated bet result",
      data,
    })
  } catch (error) {
    console.error("Error in update-bet-results API route:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error in update-bet-results API route",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
