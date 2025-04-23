"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

// Mock data for analytics
const profitData = [
  { month: "Jan", profit: 120 },
  { month: "Feb", profit: -50 },
  { month: "Mar", profit: 200 },
  { month: "Apr", profit: 80 },
  { month: "May", profit: -30 },
  { month: "Jun", profit: 150 },
  { month: "Jul", profit: 90 },
]

const sportData = [
  { name: "NBA", bets: 25, winRate: 68 },
  { name: "NFL", bets: 18, winRate: 55 },
  { name: "MLB", bets: 30, winRate: 60 },
  { name: "NHL", bets: 15, winRate: 73 },
  { name: "UFC", bets: 10, winRate: 50 },
]

const marketData = [
  { name: "Spread", bets: 35, winRate: 65 },
  { name: "Moneyline", bets: 28, winRate: 57 },
  { name: "Total", bets: 22, winRate: 64 },
  { name: "Props", bets: 15, winRate: 53 },
]

export function Overview() {
  return (
    <Tabs defaultValue="profit" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profit">Profit/Loss</TabsTrigger>
        <TabsTrigger value="sports">Sports Analysis</TabsTrigger>
        <TabsTrigger value="markets">Market Analysis</TabsTrigger>
      </TabsList>
      <TabsContent value="profit" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss Over Time</CardTitle>
            <CardDescription>Track your betting performance over the past months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChartContainer
              config={{
                profit: {
                  label: "Profit/Loss ($)",
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sports" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Sport</CardTitle>
            <CardDescription>Win rates and number of bets across different sports.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChartContainer
              config={{
                bets: {
                  label: "Number of Bets",
                  color: "hsl(var(--chart-1))",
                },
                winRate: {
                  label: "Win Rate (%)",
                  color: "hsl(var(--chart-2))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="bets" fill="var(--color-bets)" />
                  <Bar yAxisId="right" dataKey="winRate" fill="var(--color-winRate)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="markets" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Market Type</CardTitle>
            <CardDescription>Win rates and number of bets across different market types.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChartContainer
              config={{
                bets: {
                  label: "Number of Bets",
                  color: "hsl(var(--chart-1))",
                },
                winRate: {
                  label: "Win Rate (%)",
                  color: "hsl(var(--chart-2))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="bets" fill="var(--color-bets)" />
                  <Bar yAxisId="right" dataKey="winRate" fill="var(--color-winRate)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
