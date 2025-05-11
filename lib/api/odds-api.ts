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
  marketTypes: string = "h2h,spreads,totals",
  returnHeaders: boolean = false
): Promise<any> {
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
      if (returnHeaders) {
        return { data: [], quotaRemaining: response.headers.get("x-requests-remaining"), status: response.status };
      }
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    // Validate the API response
    const validatedData = OddsApiResponseSchema.safeParse(data);

    if (!validatedData.success) {
      console.error("Error validating Odds API response:", validatedData.error);
      if (returnHeaders) {
        return { data: [], quotaRemaining: response.headers.get("x-requests-remaining"), status: response.status };
      }
      return [];
    }

    if (returnHeaders) {
      return {
        data: validatedData.data,
        quotaRemaining: response.headers.get("x-requests-remaining"),
        status: response.status,
      };
    }
    return validatedData.data;
  } catch (error) {
    console.error("Error fetching odds:", error);
    if (returnHeaders) {
      return { data: [], quotaRemaining: undefined, status: 500 };
    }
    return [];
  }
}

// Improved confidence scoring function
function getConfidence(edge: number, marketType: string, timeToEventMs: number): "low" | "medium" | "high" {
  let score = 0;
  if (edge > 7) score += 2;
  else if (edge > 4) score += 1;

  if (["Spread", "Moneyline", "Total"].includes(marketType)) score += 1;

  if (timeToEventMs < 2 * 60 * 60 * 1000) score += 1; // <2 hours
  else if (timeToEventMs < 6 * 60 * 60 * 1000) score += 0.5; // 2-6 hours

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

// Function to transform API data into our database format
export function transformOddsData(
  apiData: OddsApiEvent[],
  _fairOddsAdjustment = 0.05 // unused, kept for backward compatibility
) {
  const bets = [];

  for (const event of apiData) {
    // Find DraftKings bookmaker
    const dkBookmaker = event.bookmakers.find((b) => b.key === "draftkings");

    if (!dkBookmaker) continue;

    // Process each market
    for (const market of dkBookmaker.markets) {
      // Calculate implied probabilities for all outcomes in this market
      const impliedProbs = market.outcomes.map((outcome) => {
        const dec = americanToDecimal(outcome.price);
        return 1 / dec;
      });
      const totalProb = impliedProbs.reduce((a, b) => a + b, 0);
      // Remove vig
      const fairProbs = impliedProbs.map((p) => p / totalProb);
      // Convert back to American odds for each outcome
      const fairOddsArr = fairProbs.map((p) => {
        if (p === 0) return 0;
        if (p > 0.5) {
          // favorite
          return Math.round(-100 * p / (1 - p));
        } else {
          // underdog
          return Math.round(100 * (1 - p) / p);
        }
      });

      // Process each outcome in the market
      for (let i = 0; i < market.outcomes.length; i++) {
        const outcome = market.outcomes[i];
        const dkOdds = outcome.price;
        const fairOdds = fairOddsArr[i];

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

          // Calculate time to event in ms
          const timeToEventMs = new Date(event.commence_time).getTime() - Date.now();
          // Use improved confidence logic
          const confidence = getConfidence(edge, formatMarketName(market.key), timeToEventMs);

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
