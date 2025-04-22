// Types for the API responses
export interface Match {
  id: string
  sportKey: string
  sportName: string
  homeTeam: string
  awayTeam: string
  startTime: string
  markets: Market[]
}

export interface Market {
  id: string
  name: string
  outcomes: Outcome[]
}

export interface Outcome {
  id: string
  name: string
  price: number
  point?: number
}

// Mock function to fetch odds from DraftKings API
export async function fetchDraftKingsOdds(sport: string): Promise<Match[]> {
  // In a real implementation, this would make an API call to DraftKings or a sports odds API
  // For this example, we'll return mock data

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock data
  return [
    {
      id: "1",
      sportKey: "basketball_nba",
      sportName: "NBA",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Golden State Warriors",
      startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      markets: [
        {
          id: "spread",
          name: "Spread",
          outcomes: [
            {
              id: "1",
              name: "Lakers",
              price: 110, // American odds +110
              point: -4.5,
            },
            {
              id: "2",
              name: "Warriors",
              price: -130, // American odds -130
              point: 4.5,
            },
          ],
        },
        {
          id: "moneyline",
          name: "Moneyline",
          outcomes: [
            {
              id: "3",
              name: "Lakers",
              price: -180,
            },
            {
              id: "4",
              name: "Warriors",
              price: 150,
            },
          ],
        },
      ],
    },
    // Add more mock matches as needed
  ]
}

// Mock function to fetch fair odds from our model
export async function fetchModelOdds(sport: string): Promise<Match[]> {
  // In a real implementation, this would query our own model or a third-party model
  // For this example, we'll return mock data

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Return mock data that corresponds to the DraftKings data but with our model's fair odds
  return [
    {
      id: "1",
      sportKey: "basketball_nba",
      sportName: "NBA",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Golden State Warriors",
      startTime: new Date(Date.now() + 86400000).toISOString(),
      markets: [
        {
          id: "spread",
          name: "Spread",
          outcomes: [
            {
              id: "1",
              name: "Lakers",
              price: 105, // Our model thinks this should be +105
              point: -4.5,
            },
            {
              id: "2",
              name: "Warriors",
              price: -125, // Our model thinks this should be -125
              point: 4.5,
            },
          ],
        },
        {
          id: "moneyline",
          name: "Moneyline",
          outcomes: [
            {
              id: "3",
              name: "Lakers",
              price: -190,
            },
            {
              id: "4",
              name: "Warriors",
              price: 160,
            },
          ],
        },
      ],
    },
    // Add more mock matches as needed
  ]
}

// Function to identify profitable betting opportunities
export async function findProfitableBets(sport: string, minEdgePercentage = 2.0, stakeAmount = 100): Promise<any[]> {
  // Fetch odds from both sources
  const dkOdds = await fetchDraftKingsOdds(sport)
  const modelOdds = await fetchModelOdds(sport)

  const opportunities = []

  // Compare odds and find opportunities
  for (const dkMatch of dkOdds) {
    // Find corresponding match in model odds
    const modelMatch = modelOdds.find((m) => m.id === dkMatch.id)

    if (!modelMatch) continue

    // Compare markets
    for (const dkMarket of dkMatch.markets) {
      const modelMarket = modelMatch.markets.find((m) => m.id === dkMarket.id)

      if (!modelMarket) continue

      // Compare outcomes
      for (const dkOutcome of dkMarket.outcomes) {
        const modelOutcome = modelMarket.outcomes.find((o) => o.id === dkOutcome.id)

        if (!modelOutcome) continue

        // Calculate edge
        const edge = calculateEdge(dkOutcome.price, modelOutcome.price)

        // If edge is above threshold, it's a profitable opportunity
        if (edge > minEdgePercentage) {
          // Calculate expected value
          const ev = calculateEV(stakeAmount, dkOutcome.price, modelOutcome.price)

          opportunities.push({
            match: `${dkMatch.homeTeam} vs. ${dkMatch.awayTeam}`,
            sport: dkMatch.sportName,
            market: dkMarket.name,
            selection: `${dkOutcome.name}${dkOutcome.point ? ` ${dkOutcome.point > 0 ? "+" : ""}${dkOutcome.point}` : ""}`,
            dkOdds: dkOutcome.price > 0 ? `+${dkOutcome.price}` : dkOutcome.price,
            modelOdds: modelOutcome.price > 0 ? `+${modelOutcome.price}` : modelOutcome.price,
            edgePercentage: edge.toFixed(2),
            expectedValue: `$${ev.toFixed(2)}`,
            time: new Date(dkMatch.startTime).toLocaleString(),
            // Assign confidence level based on edge percentage
            confidence: edge > 7 ? "high" : edge > 4 ? "medium" : "low",
          })
        }
      }
    }
  }

  return opportunities
}

// Import the odds calculator functions
import { calculateEdge, calculateEV } from "./odds-calculator"
