"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { formatDisplayDateTime } from "@/lib/utils";

interface OddsHistoryProps {
  oddsHistory: {
    id: string
    bet_id: string | null
    odds: string
    recorded_at: string | null
  }[]
}

export function OddsHistory({ oddsHistory }: OddsHistoryProps) {
  // Convert American odds to decimal for better visualization
  const formatOddsData = () => {
    return oddsHistory.map((item) => {
      const odds = item.odds
      let decimalOdds: number

      if (odds.startsWith("+")) {
        decimalOdds = Number.parseFloat(odds.substring(1)) / 100 + 1
      } else {
        decimalOdds = 100 / Number.parseFloat(odds.substring(1)) + 1
      }

      return {
        displayDateTime: item.recorded_at ? formatDisplayDateTime(item.recorded_at) : "N/A",
        shortTime: item.recorded_at ? new Date(item.recorded_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : "N/A",
        americanOdds: odds,
        decimalOdds: Number.parseFloat(decimalOdds.toFixed(2)),
      }
    })
  }

  const data = formatOddsData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odds History</CardTitle>
        <CardDescription>Track how the odds have changed over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortTime" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "decimalOdds") {
                      return [`${value} (Decimal)`, "Odds"]
                    }
                    return [value, name]
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0 && payload[0].payload.displayDateTime) {
                      return payload[0].payload.displayDateTime;
                    }
                    return label; // Fallback to the shortTime if displayDateTime isn't available
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="decimalOdds" name="Odds" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No odds history available</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Odds Movement</h3>
          {data.length > 0 ? (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.displayDateTime}
                  </span>
                  <span
                    className={
                      index > 0 && item.americanOdds !== data[index - 1].americanOdds
                        ? parseFloat(item.americanOdds) > parseFloat(data[index - 1].americanOdds)
                          ? "text-green-600"
                          : "text-red-600"
                        : ""
                    }
                  >
                    {item.americanOdds}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No specific odds changes recorded.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
