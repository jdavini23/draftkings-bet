"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface OddsHistoryProps {
  oddsHistory: {
    id: string
    bet_id: string
    odds: string
    recorded_at: string
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
        time: new Date(item.recorded_at).toLocaleTimeString(),
        date: new Date(item.recorded_at).toLocaleDateString(),
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
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "decimalOdds") {
                      return [`${value} (Decimal)`, "Odds"]
                    }
                    return [value, name]
                  }}
                  labelFormatter={(time) => {
                    const entry = data.find((d) => d.time === time)
                    return `${entry?.date} ${entry?.time}`
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
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.date} {item.time}
                </span>
                <span
                  className={
                    index > 0 && item.americanOdds !== data[index - 1].americanOdds
                      ? item.americanOdds > data[index - 1].americanOdds
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
        </div>
      </CardContent>
    </Card>
  )
}
