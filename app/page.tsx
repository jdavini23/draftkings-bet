import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BetOpportunities } from "@/components/bet-opportunities"
import { BettingHistory } from "@/components/betting-history"
import { BanknoteIcon as BanknotesIcon, BarChartIcon as ChartBarIcon, TrophyIcon } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Overview } from "@/components/overview"

export default function DashboardPage() {
  // Hardcoded values for now
  const opportunitiesCount = 12
  const profitLoss = "+$245.50"
  const winRate = "62.5%"

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Betting Dashboard"
        text="View profitable betting opportunities and track your performance."
      >
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href="/api/seed" target="_blank" rel="noopener noreferrer">
              Test API
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/api/test-supabase" target="_blank" rel="noopener noreferrer">
              Test Supabase
            </a>
          </Button>
          <Button asChild>
            <a href="/api/seed-simple" target="_blank" rel="noopener noreferrer">
              Simple Seed
            </a>
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitable Opportunities</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunitiesCount}</div>
            <p className="text-xs text-muted-foreground">+2 since last refresh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
            <BanknotesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{profitLoss}</div>
            <p className="text-xs text-muted-foreground">+$32.50 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Betting Opportunities</TabsTrigger>
          <TabsTrigger value="history">Betting History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities" className="space-y-4">
          <BetOpportunities />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <BettingHistory />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Overview />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
