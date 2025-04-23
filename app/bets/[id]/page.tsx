import { getServerClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { BetDetails } from "@/components/bet-details"
import { OddsHistory } from "@/components/odds-history"
import { BetActions } from "@/components/bet-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function BetPage({ params }: { params: { id: string } }) {
  const supabase = getServerClient()

  // Fetch bet details
  const { data: bet, error } = await supabase.from("bets").select("*").eq("id", params.id).single()

  if (error || !bet) {
    console.error("Error fetching bet:", error)
    notFound()
  }

  // Fetch odds history
  const { data: oddsHistory } = await supabase
    .from("odds_history")
    .select("*")
    .eq("bet_id", params.id)
    .order("recorded_at", { ascending: true })

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
        <BetDetails bet={bet} />
        <BetActions bet={bet} />
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
      </div>

      <Tabs defaultValue="odds-history" className="mt-6">
        <TabsList>
          <TabsTrigger value="odds-history">Odds History</TabsTrigger>
          <TabsTrigger value="news">Related News</TabsTrigger>
        </TabsList>
        <TabsContent value="odds-history" className="mt-4">
          <OddsHistory oddsHistory={oddsHistory || []} />
        </TabsContent>
        <TabsContent value="news" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Related News</CardTitle>
              <CardDescription>Latest news and analysis related to this bet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium">Injury Report: Key Player Questionable</h3>
                  <p className="text-muted-foreground text-sm mt-1">ESPN • 2 hours ago</p>
                  <p className="mt-2">
                    The team's star player is listed as questionable for tonight's game due to a minor ankle sprain
                    suffered during practice.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium">Betting Trends: Home Team Covering Consistently</h3>
                  <p className="text-muted-foreground text-sm mt-1">The Athletic • 5 hours ago</p>
                  <p className="mt-2">
                    The home team has covered the spread in 7 of their last 8 games, making them a strong play against
                    the spread.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium">Weather Forecast: Potential Impact on Game</h3>
                  <p className="text-muted-foreground text-sm mt-1">Weather.com • 1 day ago</p>
                  <p className="mt-2">
                    Weather conditions could impact the game, with forecasts showing potential for rain and wind that
                    might affect scoring.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
