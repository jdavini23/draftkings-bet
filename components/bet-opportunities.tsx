"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { BookmarkIcon, ChevronDown, ExternalLinkIcon, FilterIcon, InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock data for betting opportunities
const opportunities = [
  {
    id: "1",
    sport: "NBA",
    match: "Lakers vs. Warriors",
    market: "Spread",
    selection: "Lakers -4.5",
    odds: "+110",
    bookOdds: "-105",
    edgePercentage: 7.3,
    expectedValue: "$14.60",
    time: "Today, 7:30 PM",
    confidence: "high",
  },
  {
    id: "2",
    sport: "NFL",
    match: "Chiefs vs. Ravens",
    market: "Total",
    selection: "Over 49.5",
    odds: "-110",
    bookOdds: "-120",
    edgePercentage: 4.5,
    expectedValue: "$9.00",
    time: "Tomorrow, 4:25 PM",
    confidence: "medium",
  },
  {
    id: "3",
    sport: "MLB",
    match: "Yankees vs. Red Sox",
    market: "Moneyline",
    selection: "Yankees",
    odds: "-150",
    bookOdds: "-175",
    edgePercentage: 6.2,
    expectedValue: "$12.40",
    time: "Today, 1:05 PM",
    confidence: "high",
  },
  {
    id: "4",
    sport: "NHL",
    match: "Maple Leafs vs. Bruins",
    market: "Puck Line",
    selection: "Bruins -1.5",
    odds: "+180",
    bookOdds: "+160",
    edgePercentage: 5.1,
    expectedValue: "$10.20",
    time: "Tomorrow, 7:00 PM",
    confidence: "medium",
  },
  {
    id: "5",
    sport: "UFC",
    match: "Jones vs. Miocic",
    market: "Method of Victory",
    selection: "Jones by KO/TKO",
    odds: "+275",
    bookOdds: "+225",
    edgePercentage: 9.2,
    expectedValue: "$18.40",
    time: "Saturday, 10:00 PM",
    confidence: "low",
  },
]

export function BetOpportunities() {
  const [filter, setFilter] = useState("all")
  const router = useRouter()

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-500">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "low":
        return <Badge className="bg-red-500">Low</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const filteredOpportunities =
    filter === "all" ? opportunities : opportunities.filter((opp) => opp.confidence === filter)

  const handleRowClick = (betId: string) => {
    router.push(`/bets/${betId}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profitable Betting Opportunities</CardTitle>
            <CardDescription>Opportunities with positive expected value based on our analysis.</CardDescription>
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
                <DropdownMenuLabel>Filter by Confidence</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("all")}>All Opportunities</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("high")}>High Confidence</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("medium")}>Medium Confidence</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("low")}>Low Confidence</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sport</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Market/Selection</TableHead>
              <TableHead>
                <div className="flex items-center">
                  DK Odds
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="ml-1 h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current odds on DraftKings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Edge %
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="ml-1 h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentage edge over fair odds</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>EV</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOpportunities.map((opportunity) => (
              <TableRow
                key={opportunity.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(opportunity.id)}
              >
                <TableCell>{opportunity.sport}</TableCell>
                <TableCell>{opportunity.match}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{opportunity.market}</div>
                    <div className="text-sm text-muted-foreground">{opportunity.selection}</div>
                  </div>
                </TableCell>
                <TableCell>{opportunity.odds}</TableCell>
                <TableCell className="font-medium text-green-600">{opportunity.edgePercentage}%</TableCell>
                <TableCell>{opportunity.expectedValue}</TableCell>
                <TableCell>{opportunity.time}</TableCell>
                <TableCell>{getConfidenceBadge(opportunity.confidence)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BookmarkIcon className="h-4 w-4" />
                      <span className="sr-only">Save</span>
                    </Button>
                    <Link href={`/bets/${opportunity.id}`} passHref>
                      <Button variant="outline" size="sm">
                        <ExternalLinkIcon className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Export to CSV</Button>
        <Button>Open in DraftKings</Button>
      </CardFooter>
    </Card>
  )
}
