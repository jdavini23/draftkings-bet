"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookmarkIcon, Share2Icon, AlertTriangleIcon, ExternalLinkIcon } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface BetActionsProps {
  bet: {
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
  }
}

export function BetActions({ bet }: BetActionsProps) {
  const [stakeAmount, setStakeAmount] = useState<string>("100")
  const [isSaved, setIsSaved] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  const handleSaveBet = async () => {
    try {
      // In a real app, this would save to the user's saved bets collection
      setIsSaved(!isSaved)
      toast({
        title: isSaved ? "Bet removed from saved bets" : "Bet saved successfully",
        description: isSaved
          ? "This bet has been removed from your saved bets."
          : "This bet has been added to your saved bets.",
      })
    } catch (error) {
      console.error("Error saving bet:", error)
      toast({
        title: "Error",
        description: "Failed to save bet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTrackBet = async () => {
    try {
      // In a real app, this would add the bet to the user's tracked bets
      setIsTracking(!isTracking)
      toast({
        title: isTracking ? "Stopped tracking bet" : "Now tracking bet",
        description: isTracking
          ? "You will no longer receive updates for this bet."
          : "You will receive updates when odds change or the event starts.",
      })
    } catch (error) {
      console.error("Error tracking bet:", error)
      toast({
        title: "Error",
        description: "Failed to track bet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShareBet = () => {
    // In a real app, this would copy a shareable link to the clipboard
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "Bet link copied to clipboard",
    })
  }

  const calculatePotentialWinnings = () => {
    const amount = Number.parseFloat(stakeAmount) || 0
    const odds = bet.odds

    if (odds.startsWith("+")) {
      const oddsValue = Number.parseFloat(odds.substring(1))
      return ((amount * oddsValue) / 100).toFixed(2)
    } else {
      const oddsValue = Number.parseFloat(odds.substring(1))
      return ((amount * 100) / oddsValue).toFixed(2)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bet Actions</CardTitle>
        <CardDescription>Track, save, or place this bet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stake">Stake Amount ($)</Label>
          <Input
            id="stake"
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            min="1"
            step="1"
          />
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Potential Win:</span>
              <span className="font-medium">${calculatePotentialWinnings()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Return:</span>
              <span className="font-medium">
                ${(Number.parseFloat(stakeAmount) || 0) + Number.parseFloat(calculatePotentialWinnings())}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Expected Value:</span>
              <span className="font-medium text-green-600">{bet.expected_value}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={() => window.open("https://sportsbook.draftkings.com", "_blank")}>
          <ExternalLinkIcon className="mr-2 h-4 w-4" />
          Place Bet on DraftKings
        </Button>
        <div className="grid grid-cols-3 gap-2 w-full">
          <Button variant="outline" onClick={handleSaveBet}>
            <BookmarkIcon className="mr-2 h-4 w-4" />
            {isSaved ? "Unsave" : "Save"}
          </Button>
          <Button variant="outline" onClick={handleTrackBet}>
            <AlertTriangleIcon className="mr-2 h-4 w-4" />
            {isTracking ? "Untrack" : "Track"}
          </Button>
          <Button variant="outline" onClick={handleShareBet}>
            <Share2Icon className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
