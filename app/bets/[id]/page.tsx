import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock data for a single bet
const mockBets = {
  "1": {
    id: "1",
    sport: "NBA",
    match: "Lakers vs. Warriors",
    market: "Spread",
    selection: "Lakers -4.5",
    odds: "+110",
    book_odds: "-105",
    edge_percentage: 7.3,
    expected_value: "$14.60",
    event_time: "2023-04-15T19:30:00Z",
    confidence: "high",
    status: "active",
    result: null,
  },
  "2": {
    id: "2",
    sport: "NFL",
    match: "Chiefs vs. Ravens",
    market: "Total",
    selection: "Over 49.5",
    odds: "-110",
    book_odds: "-120",
    edge_percentage: 4.5,
    expected_value: "$9.00",
    event_time: "2023-04-16T16:25:00Z",
    confidence: "medium",
    status: "active",
    result: null,
  },
  "3": {
    id: "3",
    sport: "MLB",
    match: "Yankees vs. Red Sox",
    market: "Moneyline",
    selection: "Yankees",
    odds: "-150",
    book_odds: "-175",
    edge_percentage: 6.2,
    expected_value: "$12.40",
    event_time: "2023-04-15T13:05:00Z",
    confidence: "high",
    status: "active",
    result: null,
  },
}

export default async function BetPage({ params }: { params: { id: string } }) {
  // Get bet from mock data
  const bet = mockBets[params.id as keyof typeof mockBets]

  if (!bet) {
    notFound()
  }

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <DashboardHeader heading={`${bet.match} - ${bet.market}`} text={`${bet.selection} @ ${bet.odds}`} />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bet Details</CardTitle>
            <CardDescription>Detailed information about this betting opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Market:</span>
                <span className="font-medium">{bet.market}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selection:</span>
                <span className="font-medium">{bet.selection}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">DraftKings Odds:</span>
                <span className="font-medium">{bet.odds}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fair Odds:</span>
                <span className="font-medium">{bet.book_odds}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Edge:</span>
                <span className="font-medium text-green-600">{bet.edge_percentage}%</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Value:</span>
                <span className="font-medium text-green-600">{bet.expected_value}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-medium capitalize">{bet.confidence}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sport:</span>
                <span className="font-medium">{bet.sport}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Match:</span>
                <span className="font-medium">{bet.match}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium">{new Date(bet.event_time).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{bet.status}</span>
              </div>
              {bet.result && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Result:</span>
                    <span
                      className={`font-medium capitalize ${bet.result === "win" ? "text-green-600" : bet.result === "loss" ? "text-red-600" : ""}`}
                    >
                      {bet.result}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bet Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full">Place Bet on DraftKings</Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">Save Bet</Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Note About Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This is a static mock page. In the full implementation, this would display dynamic data from the Supabase
              database, including odds history, similar bets, and related news.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
