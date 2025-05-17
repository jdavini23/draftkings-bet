import { NextResponse } from "next/server";
import { fetchOddsFromApi, transformOddsData } from "@/lib/api/odds-api";
import { getServerClient } from "@/lib/supabase";
import { createHash } from "crypto";

function generateBetId(
  match: string,
  market: string,
  selection: string
): string {
  return createHash("sha256")
    .update(`${match}-${market}-${selection}`)
    .digest("hex");
}

export async function GET(request: Request) {
  try {
    // Get sport key from query params
    const { searchParams } = new URL(request.url);
    const sportKey = searchParams.get("sport") || "basketball_nba";

    // Fetch odds from API
    const response = await fetchOddsFromApi(sportKey);

    if (!response.success) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch odds from API" },
        { status: 500 }
      );
    }

    // Transform the data
    const bets = transformOddsData(response.data);

    // Store in Supabase
    const supabase = getServerClient();

    // Insert bets
    const { data, error } = await supabase
      .from("bets")
      .upsert(
        bets.map((bet) => ({
          ...bet,
          // Use a deterministic ID based on the match, market, and selection
          // This prevents duplicates when refreshing the data
          id: generateBetId(bet.match, bet.market, bet.selection),
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "match,market,selection" }
      )
      .select();

    if (error) {
      console.error("Error storing bets in Supabase:", error);
      return NextResponse.json(
        { success: false, message: "Failed to store bets in database", error },
        { status: 500 }
      );
    }

    // For each bet, add an entry to odds_history
    const oddsHistoryEntries =
      data?.map((bet) => ({
        bet_id: bet.id,
        odds: bet.odds,
        recorded_at: new Date().toISOString(),
      })) || [];

    if (oddsHistoryEntries.length > 0) {
      const { error: historyError } = await supabase
        .from("odds_history")
        .insert(oddsHistoryEntries);

      if (historyError) {
        console.error("Error storing odds history:", historyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully fetched and stored ${bets.length} bets`,
      count: bets.length,
    });
  } catch (error) {
    console.error("Error in fetch-odds API route:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error in fetch-odds API route",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
