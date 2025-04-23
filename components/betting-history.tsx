"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, FilterIcon } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Bet {
  id: string
  sport: string
  match: string
  market: string
  selection: string
  odds: string
  book_odds: string
  edge_percentage: number
  expected_value: string
  event_time: string
  confidence: string
  status: string
  result: string | null
  created_at: string
}

export function BettingHistory() {
  const [filter, setFilter] = useState("all")
  const [bettingHistory, setBettingHistory] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getBrowserClient()

  useEffect(() => {
    const fetchBettingHistory = async () => {
      setLoading(true)

      // Fetch completed bets from Supabase
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("status", "completed")
        .order("event_time", { ascending: false })

      if (error) {
        console.error("Error fetching betting history:", error)
      } else {
        setBettingHistory(data || [])
      }

      setLoading(false)
    }

    fetchBettingHistory()

    // Set up a real-time subscription for bet updates
    const subscription = supabase
      .channel("bets-history-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bets", filter: "status=eq.completed" }, () => {
        // Refresh the data when changes occur
        fetchBettingHistory()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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

  const filteredHistory = filter === "all" ? bettingHistory : bettingHistory.filter((bet) => bet.result === filter)

  const handleRowClick = (betId: string) => {
    router.push(`/bets/${betId}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Betting History</CardTitle>
            <CardDescription>Track your past bets and performance.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Result</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("all")}>All Bets</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("win")}>Wins</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("loss")}>Losses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("push")}>Pushes</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Market/Selection</TableHead>
                <TableHead>Odds</TableHead>
                <TableHead>Edge %</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No betting history found. Complete some bets to see them here.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((bet) => (
                  <TableRow
                    key={bet.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(bet.id)}
                  >
                    <TableCell>{new Date(bet.event_time).toLocaleDateString()}</TableCell>
                    <TableCell>{bet.sport}</TableCell>
                    <TableCell>{bet.match}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bet.market}</div>
                        <div className="text-sm text-muted-foreground">{bet.selection}</div>
                      </div>
                    </TableCell>
                    <TableCell>{bet.odds}</TableCell>
                    <TableCell>{bet.edge_percentage}%</TableCell>
                    <TableCell>{getResultBadge(bet.result)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
