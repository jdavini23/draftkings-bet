import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

// Initial markets data
const marketsData = [
  { name: "Moneyline", key: "h2h" },
  { name: "Spread", key: "spreads" },
  { name: "Total", key: "totals" },
  { name: "Team Total", key: "team_totals" },
  { name: "Player Props", key: "player_props" },
];

export async function GET() {
  const apiUrl = process.env.SPORTS_API_URL;
  const apiKey = process.env.ODDS_API_KEY;
  const supabase = getServerClient();

  if (!apiUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing SPORTS_API_URL in environment variables.",
      },
      { status: 500 }
    );
  }
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing ODDS_API_KEY in environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    console.log("apiUrl:", apiUrl);
    console.log("apiKey:", apiKey);
    // Fetch the list of sports from The Odds API v4
    const sportsUrl = `${apiUrl}/sports?apiKey=${apiKey}`;
    console.log("sportsUrl:", sportsUrl);
    const fs = require("fs");
    fs.appendFileSync("logs.txt", `apiUrl: ${apiUrl}\n`);
    fs.appendFileSync("logs.txt", `apiKey: ${apiKey}\n`);
    fs.appendFileSync("logs.txt", `sportsUrl: ${sportsUrl}\n`);
    const response = await fetch(sportsUrl, { cache: "no-store" });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Odds API error (${response.status}):`, errorBody);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch sports from Odds API`,
          status: response.status,
          error: errorBody,
        },
        { status: response.status }
      );
    }
    const sportsData = await response.json();
    console.log("sportsData:", sportsData);
    // Optionally log quota headers
    const quota = response.headers.get("x-requests-remaining");
    if (quota) {
      console.log(`Odds API quota remaining: ${quota}`);
    }

    console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY:",
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log("Inserting sports data");
    // Insert sports data
    const { error: sportsError } = await supabase
      .from("sports")
      .upsert(sportsData, { onConflict: "key" });

    if (sportsError) {
      console.error("Failed to seed sports data");
      console.error("sportsError:", sportsError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to seed sports data",
          error: sportsError,
        },
        { status: 500 }
      );
    }

    // Get sports IDs
    const { data: sports } = await supabase.from("sports").select("id, key");

    // Insert markets data for each sport
    const allMarkets = [];

    if (sports) {
      for (const sport of sports) {
        const sportMarkets = marketsData.map((market) => ({
          ...market,
          sport_id: sport.id,
        }));
        allMarkets.push(...sportMarkets);
      }
    }

    const { error: marketsError } = await supabase
      .from("markets")
      .upsert(allMarkets, { onConflict: "key, sport_id" });

    if (marketsError) {
      console.error("Failed to seed markets data", marketsError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to seed markets data",
          error: marketsError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully seeded sports and markets data",
      sportsCount: sportsData.length,
      marketsCount: allMarkets.length,
    });
  } catch (error) {
    console.error(
      "Error in seed-sports API route:",
      error,
      `URL: ${apiUrl ? "[set]" : "[unset]"}`
    );
    return NextResponse.json(
      {
        success: false,
        message: "Error in seed-sports API route",
        error: error instanceof Error ? error.message : String(error),
        url: apiUrl ? "[set]" : "[unset]",
      },
      { status: 500 }
    );
  }
}
