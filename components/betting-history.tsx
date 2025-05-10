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
import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { ArrowDown, ArrowUp } from "lucide-react"

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [sortColumn, setSortColumn] = useState<keyof Bet>("event_time")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    const fetchBettingHistory = async () => {
      setLoading(true)

      // Fetch completed bets from Supabase
      let query = supabase
        .from("bets")
        .select("*", { count: "exact" })
        .eq("status", "completed")
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range((page - 1) * pageSize, page * pageSize - 1)

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching betting history:", error)
      } else {
        setBettingHistory(data || [])
        setTotalCount(count || 0)
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
  }, [page, pageSize, sortColumn, sortDirection])

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

  const pageCount = Math.ceil(totalCount / pageSize)

  const handleSort = (column: keyof Bet) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (column: keyof Bet) => {
    if (column === sortColumn) {
      return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
    }
    return null
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
                <TableHead onClick={() => handleSort("event_time")} className="cursor-pointer">
                  Date {getSortIcon("event_time")}
                </TableHead>
                <TableHead onClick={() => handleSort("sport")} className="cursor-pointer">
                  Sport {getSortIcon("sport")}
                </TableHead>
                <TableHead onClick={() => handleSort("match")} className="cursor-pointer">
                  Match {getSortIcon("match")}
                </TableHead>
                <TableHead>Market/Selection</TableHead>
                <TableHead onClick={() => handleSort("odds")} className="cursor-pointer">
                  Odds {getSortIcon("odds")}
                </TableHead>
                <TableHead onClick={() => handleSort("edge_percentage")} className="cursor-pointer">
                  Edge % {getSortIcon("edge_percentage")}
                </TableHead>
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
                filteredHistory.slice((page - 1) * pageSize, page * pageSize).map((bet) => (
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
        <div className="flex items-center justify-center pt-4">
          <PaginationContent>
            <PaginationPrevious
              href="#"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            />
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              href="#"
              onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
            />
          </PaginationContent>
        </div>
      </CardContent>
    </Card>
  )
}
