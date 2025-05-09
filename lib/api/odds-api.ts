import {
  calculateEdge,
  calculateEV,
  americanToDecimal,
} from "@/lib/odds-calculator";
import {
  OddsApiResponseSchema,
  OddsApiEvent,
  OddsApiResponse,
} from "@/types/zod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Function to fetch odds from The Odds API
export async function fetchOddsFromApi(
  sportKey: string,
  marketTypes: string = "h2h,spreads,totals" // Default to common markets
): Promise<OddsApiResponse> {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    console.error("ODDS_API_KEY environment variable is not set");
    throw new Error("ODDS_API_KEY environment variable is not set");
  }

  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=${marketTypes}&oddsFormat=american&bookmakers=draftkings`;

  try {
    console.log(`Fetching odds from: ${url.replace(apiKey, "API_KEY_HIDDEN")}`);

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API request failed with status ${response.status}: ${errorText}`
      );
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    // Validate the API response
    const validatedData = OddsApiResponseSchema.safeParse(data);

    if (!validatedData.success) {
      console.error("Error validating Odds API response:", validatedData.error);
      return [];
    }

    return validatedData.data;
  } catch (error) {
    console.error("Error fetching odds:", error);
    return [];
  }
}

// Function to transform API data into our database format
export function transformOddsData(
  apiData: OddsApiEvent[],
  fairOddsAdjustment = 0.05
) {
  const bets = [];

  for (const event of apiData) {
    // Find DraftKings bookmaker
    const dkBookmaker = event.bookmakers.find((b) => b.key === "draftkings");

    if (!dkBookmaker) continue;

    // Process each market
    for (const market of dkBookmaker.markets) {
      // Process each outcome in the market
      for (const outcome of market.outcomes) {
        // Calculate fair odds (for demo purposes, we're just adjusting by a percentage)
        // In a real app, you'd have your own model for fair odds
        const dkOdds = outcome.price;
        const fairOdds = calculateFairOdds(dkOdds, fairOddsAdjustment);

        // Calculate edge and EV
        const edge = calculateEdge(dkOdds, fairOdds);

        // Only include bets with positive edge
        if (edge > 0) {
          const ev = calculateEV(100, dkOdds, fairOdds);

          // Format selection name
          let selectionName = outcome.name;
          if (outcome.point) {
            selectionName += ` ${outcome.point > 0 ? "+" : ""}${outcome.point}`;
          }

          // Determine confidence level based on edge
          let confidence = "low";
          if (edge > 7) confidence = "high";
          else if (edge > 4) confidence = "medium";

          bets.push({
            id: uuidv4(),
            sport: event.sport_title,
            match: `${event.home_team} vs. ${event.away_team}`,
            market: formatMarketName(market.key),
            selection: selectionName,
            odds: formatOdds(dkOdds),
            book_odds: formatOdds(fairOdds),
            edge_percentage: Number.parseFloat(edge.toFixed(2)),
            expected_value: `$${ev.toFixed(2)}`,
            event_time: event.commence_time,
            confidence,
            status: "active",
            result: null,
          });
        }
      }
    }
  }

  return bets;
}

// Helper function to calculate fair odds
function calculateFairOdds(dkOdds: number, adjustment: number): number {
  // Convert to decimal, adjust, and convert back to American
  const decimalOdds = americanToDecimal(dkOdds);

  // For favorites (negative odds), increase the fair odds (make them worse)
  // For underdogs (positive odds), decrease the fair odds (make them worse)
  let fairDecimalOdds;
  if (dkOdds < 0) {
    fairDecimalOdds = decimalOdds * (1 + adjustment);
  } else {
    fairDecimalOdds = decimalOdds * (1 - adjustment);
  }

  // Convert back to American odds
  return dkOdds < 0
    ? Math.round(-100 / (fairDecimalOdds - 1))
    : Math.round((fairDecimalOdds - 1) * 100);
}

// Helper function to format market names
function formatMarketName(key: string): string {
  switch (key) {
    case "h2h":
      return "Moneyline";
    case "spreads":
      return "Spread";
    case "totals":
      return "Total";
    default:
      return key.charAt(0).toUpperCase() + key.slice(1);
  }
}

// Helper function to format odds
function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}
