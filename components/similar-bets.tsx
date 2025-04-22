import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface SimilarBetsProps {
  similarBets: {
    bet_id: string
    similar_bet_id: string
    sport: string
    match: string
    market: string
    selection: string
    odds: string
    result: string | null
    event_time: string
  }[]
}

export function SimilarBets({ similarBets }: SimilarBetsProps) {
  const getResultBadge = (result: string | null) => {
    if (!result) return null

    switch (result) {
      case "win":
        return <Badge className="bg-green-500">Win</Badge>
      case "loss":
        return <Badge className="bg-red-500">Loss</Badge>
      case "push":
        return <Badge className="bg-yellow-500">Push</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Bets</CardTitle>
        <CardDescription>Historical bets with similar characteristics</CardDescription>
      </CardHeader>
      <CardContent>
        {similarBets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Selection</TableHead>
                <TableHead>Odds</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {similarBets.map((bet) => (
                <TableRow key={bet.similar_bet_id}>
                  <TableCell>
                    <Link href={`/bets/${bet.similar_bet_id}`} className="hover:underline">
                      {bet.match}
                    </Link>
                  </TableCell>
                  <TableCell>{bet.selection}</TableCell>
                  <TableCell>{bet.odds}</TableCell>
                  <TableCell>{new Date(bet.event_time).toLocaleDateString()}</TableCell>
                  <TableCell>{getResultBadge(bet.result)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No similar bets found</p>
          </div>
        )}

        {similarBets.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Performance Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Win Rate:</span>
                <span className="font-medium">
                  {Math.round((similarBets.filter((bet) => bet.result === "win").length / similarBets.length) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Odds:</span>
                <span className="font-medium">
                  {similarBets[0].odds.startsWith("+") ? "+" : "-"}
                  {Math.round(
                    similarBets.reduce((sum, bet) => {
                      const odds = Number.parseInt(bet.odds.replace(/[+-]/g, ""))
                      return sum + odds
                    }, 0) / similarBets.length,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Bets:</span>
                <span className="font-medium">{similarBets.length}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
