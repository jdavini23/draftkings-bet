import {
  calculateEdge,
  calculateEV,
  americanToDecimal,
} from '@/lib/odds-calculator';
import {
  OddsApiResponseSchema,
  OddsApiEvent,
  OddsApiResponse,
} from '@/types/zod';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const ENABLE_MULTI_BOOKMAKER = false;

// Function to fetch odds from The Odds API
export async function fetchOddsFromApi(
  sportKey: string,
  marketTypes: string = 'h2h,spreads,totals',
  returnHeaders: boolean = false
): Promise<any> {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    console.error('ODDS_API_KEY environment variable is not set');
    throw new Error('ODDS_API_KEY environment variable is not set');
  }

  const bookmakers = ENABLE_MULTI_BOOKMAKER
    ? 'draftkings,fanduel,betmgm,pointsbet'
    : 'draftkings';

  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=${marketTypes}&oddsFormat=american&bookmakers=${bookmakers}`;

  try {
    console.log(`Fetching odds from: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API request failed with status ${response.status}: ${errorText}`
      );
      if (returnHeaders) {
        return {
          data: [],
          quotaRemaining: response.headers.get('x-requests-remaining'),
          status: response.status,
        };
      }
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    // Validate the API response
    const validatedData = OddsApiResponseSchema.safeParse(data);

    if (!validatedData.success) {
      console.error('Error validating Odds API response:', validatedData.error);
      if (returnHeaders) {
        return {
          data: [],
          quotaRemaining: response.headers.get('x-requests-remaining'),
          status: response.status,
        };
      }
      return [];
    }

    if (returnHeaders) {
      return {
        data: validatedData.data,
        quotaRemaining: response.headers.get('x-requests-remaining'),
        status: response.status,
      };
    }
    return validatedData.data;
  } catch (error) {
    console.error('Error fetching odds:', error);
    if (returnHeaders) {
      return { data: [], quotaRemaining: undefined, status: 500 };
    }
    return [];
  }
}

// Helper function to format market names
function formatMarketName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to format odds (defined locally)
function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

// Improved confidence scoring function
function getConfidence(
  edge: number,
  marketType: string,
  timeToEventMs: number,
  dkOdds: number
): 'low' | 'medium' | 'high' {
  let score = 0;

  // 1. Granular Edge Scoring
  if (edge > 10) score += 3;
  else if (edge > 7) score += 2;
  else if (edge > 4) score += 1;
  else if (edge > 2) score += 0.5;

  // 2. Odds Level Modifier
  if (dkOdds >= -150 && dkOdds <= 150) score += 0.5;
  else if (dkOdds > 300 || dkOdds < -300) score -= 0.5;

  // 3. Market Type Score (No Change)
  if (['Spread', 'Moneyline', 'Total'].includes(marketType)) score += 1;

  // 4. Time to Event Score (No Change)
  if (timeToEventMs < 2 * 60 * 60 * 1000) score += 1; // <2 hours
  else if (timeToEventMs < 6 * 60 * 60 * 1000) score += 0.5; // 2-6 hours

  // New Thresholds
  if (score >= 4.0) return 'high';
  if (score >= 2.0) return 'medium';
  return 'low';
}

// Function to calculate fair probabilities using Shin's method
function calculateFairProbsShin(impliedProbs: number[]): number[] {
  const totalProb = impliedProbs.reduce((a, b) => a + b, 0);
  const overround = totalProb - 1;
  const n = impliedProbs.length;

  if (overround <= 0 || n === 0) {
    // No vig or no outcomes, return original probabilities
    return impliedProbs;
  }

  const sumSqrtProbs = impliedProbs.reduce((sum, p) => sum + Math.sqrt(p), 0);

  if (sumSqrtProbs === 0) {
    console.warn(
      "[Shin's Method Error] Sum of square roots is zero. Reverting to proportional."
    );
    // Avoid division by zero if totalProb is also 0
    return totalProb > 0
      ? impliedProbs.map((p) => p / totalProb)
      : Array(n).fill(1 / n);
  }

  const z = overround / sumSqrtProbs;

  const fairProbs = impliedProbs.map((p_implied) => {
    const p_fair = p_implied - z * Math.sqrt(p_implied);
    // Ensure probability is not negative due to the calculation
    return Math.max(0, p_fair);
  });

  // Normalize again in case rounding/clamping caused sum != 1
  const finalSum = fairProbs.reduce((a, b) => a + b, 0);
  if (finalSum === 0) {
    console.error(
      "[Shin's Method Error] Final sum of fair probabilities is zero. Cannot normalize."
    );
    // Fallback or error handling needed - perhaps return proportional?
    return totalProb > 0
      ? impliedProbs.map((p) => p / totalProb)
      : Array(n).fill(1 / n); // Fallback
  }
  return fairProbs.map((p) => p / finalSum);
}

// Function to transform API data into our database format
export function transformOddsData(
  apiData: OddsApiEvent[],
  _fairOddsAdjustment = 0.05 // unused, kept for backward compatibility
) {
  const bets = [];

  for (const event of apiData) {
    // Find DraftKings bookmaker (or first available if multi-bookmaker is enabled)
    const dkBookmaker = ENABLE_MULTI_BOOKMAKER
      ? event.bookmakers[0]
      : event.bookmakers.find((b) => b.key === 'draftkings');

    if (!dkBookmaker) continue;

    // Process each market
    for (const market of dkBookmaker.markets) {
      console.log(
        `[DEBUG] Event ${event.id}: processing market ${market.key}, outcomes: ${market.outcomes.length}`
      );

      // Calculate implied probabilities, filtering out invalid odds immediately
      const validOutcomes = market.outcomes.filter((outcome) => {
        const dec = americanToDecimal(outcome.price);
        if (isNaN(dec) || dec <= 0) {
          console.warn(
            `[Implied Prob Error] Invalid decimal odds ${outcome.price} -> ${dec} for outcome ${outcome.name} in market ${market.key}. Skipping outcome.`
          );
          return false;
        }
        return true;
      });

      if (validOutcomes.length < 2) {
        // Need at least two outcomes for meaningful vig removal
        console.warn(
          `[Market Error] Market ${market.key} has less than 2 valid outcomes (${validOutcomes.length}). Skipping market.`
        );
        continue;
      }

      const impliedProbs = validOutcomes.map(
        (outcome) => 1 / americanToDecimal(outcome.price)
      );

      // --- NEW: Vig Removal using Shin's Method ---
      const fairProbs = calculateFairProbsShin(impliedProbs);
      // --- END NEW ---

      // Convert back to American odds
      const fairOddsArr = fairProbs.map((p) => {
        if (p <= 0 || p >= 1) return null; // Return null for invalid probabilities (p=0 or p>=1)
        if (p > 0.5) {
          return Math.round((-100 * p) / (1 - p));
        } else {
          return Math.round((100 * (1 - p)) / p);
        }
      });

      // Filter out null odds and ensure counts match valid outcomes
      const validFairOdds = fairOddsArr.filter(
        (odds) => odds !== null
      ) as number[];
      if (validFairOdds.length !== validOutcomes.length) {
        // Check against validOutcomes count
        console.error(
          `[Fair Odds Error] Mismatch in valid outcome count (${validOutcomes.length}) vs valid fair odds count (${validFairOdds.length}) for market ${market.key}. Skipping market.`
        );
        continue;
      }

      // Process each valid outcome using the calculated fair odds
      for (let i = 0; i < validOutcomes.length; i++) {
        const outcome = validOutcomes[i]; // Use the filtered valid outcome
        const dkOdds = outcome.price;
        const fairOdds = validFairOdds[i]; // Use the corresponding calculated fair odd

        // Calculate edge and EV using the new fairOdds
        const edge = calculateEdge(dkOdds, fairOdds);
        const ev = calculateEV(100, dkOdds, fairOdds); // Assuming stake=100 for EV calc

        // TEMP: Push all bets for debugging (as per original code comment)
        // Or apply filtering: if (edge > 0) { ... }
        console.log(
          `[BET] Outcome: ${
            outcome.name
          }, DK Odds: ${dkOdds}, Fair Odds: ${fairOdds}, Edge: ${edge.toFixed(
            2
          )}%, EV: ${ev.toFixed(2)}`
        );

        let selectionName = outcome.name;
        if (outcome.point) {
          selectionName += ` ${outcome.point > 0 ? '+' : ''}${outcome.point}`;
        }
        const timeToEventMs =
          new Date(event.commence_time).getTime() - Date.now();
        const confidence = getConfidence(
          edge,
          formatMarketName(market.key),
          timeToEventMs,
          outcome.price
        );

        bets.push({
          id: uuidv4(),
          sport: event.sport_title,
          match: `${event.home_team} vs. ${event.away_team}`,
          market: formatMarketName(market.key),
          selection: selectionName,
          odds: formatOdds(dkOdds),
          book_odds: formatOdds(fairOdds), // Store the calculated fair odds
          edge_percentage: Number.parseFloat(edge.toFixed(2)),
          expected_value: `$${ev.toFixed(2)}`, // Format EV as currency string
          event_time: event.commence_time,
          confidence,
          status: 'active',
          result: null,
          stake: 100, // Default stake
        });
      } // End loop through valid outcomes
    } // End loop through markets
  } // End loop through events

  return bets;
}
