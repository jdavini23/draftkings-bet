"use client"

import { useState } from "react"
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
import { useRouter } from "next/navigation"

// Mock data for betting history
const bettingHistory = [
  {
    id: "1",
    date: "2023-04-15",
    sport: "NBA",
    match: "Lakers vs. Warriors",
    market: "Spread",
    selection: "Lakers -4.5",
    odds: "+110",
    stake: "$50",
    result: "win",
    profit: "+$55.00",
    edgeAtBet: "7.3%",
  },
  {
    id: "2",
    date: "2023-04-14",
    sport: "NFL",
    match: "Chiefs vs. Ravens",
    market: "Total",
    selection: "Over 49.5",
    odds: "-110",
    stake: "$100",
    result: "loss",
    profit: "-$100.00",
    edgeAtBet: "4.5%",
  },
  {
    id: "3",
    date: "2023-04-13",
    sport: "MLB",
    match: "Yankees vs. Red Sox",
    market: "Moneyline",
    selection: "Yankees",
    odds: "-150",
    stake: "$150",
    result: "win",
    profit: "+$100.00",
    edgeAtBet: "6.2%",
  },
  {
    id: "4",
    date: "2023-04-12",
    sport: "NHL",
    match: "Maple Leafs vs. Bruins",
    market: "Puck Line",
    selection: "Bruins -1.5",
    odds: "+180",
    stake: "$50",
    result: "win",
    profit: "+$90.00",
    edgeAtBet: "5.1%",
  },
  {
    id: "5",
    date: "2023-04-10",
    sport: "UFC",
    match: "Jones vs. Miocic",
    market: "Method of Victory",
    selection: "Jones by KO/TKO",
    odds: "+275",
    stake: "$25",
    result: "loss",
    profit: "-$25.00",
    edgeAtBet: "9.2%",
  },
]

export function BettingHistory() {
  const [filter, setFilter] = useState("all")
  const router = useRouter()

  const getResultBadge = (result: string) => {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Market/Selection</TableHead>
              <TableHead>Odds</TableHead>
              <TableHead>Stake</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Profit/Loss</TableHead>
              <TableHead>Edge at Bet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((bet) => (
              <TableRow
                key={bet.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(bet.id)}
              >
                <TableCell>{bet.date}</TableCell>
                <TableCell>{bet.sport}</TableCell>
                <TableCell>{bet.match}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{bet.market}</div>
                    <div className="text-sm text-muted-foreground">{bet.selection}</div>
                  </div>
                </TableCell>
                <TableCell>{bet.odds}</TableCell>
                <TableCell>{bet.stake}</TableCell>
                <TableCell>{getResultBadge(bet.result)}</TableCell>
                <TableCell className={bet.result === "win" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {bet.profit}
                </TableCell>
                <TableCell>{bet.edgeAtBet}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
