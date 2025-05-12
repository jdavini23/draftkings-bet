import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BetDetailsProps {
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

export function BetDetails({ bet }: BetDetailsProps) {
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

  const HIGH_VALUE_THRESHOLD = 5; // Edge percentage greater than this is considered high value

  return (
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
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-muted-foreground">DraftKings Odds:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="ml-1 h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current odds offered by DraftKings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">{bet.odds}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-muted-foreground">Fair Odds:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="ml-1 h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Our calculated fair odds based on our model</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">{bet.book_odds}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-muted-foreground">Edge:</span>
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
            <div className="flex items-center space-x-2">
              <span className="font-medium text-green-600">{bet.edge_percentage}%</span>
              {bet.edge_percentage > HIGH_VALUE_THRESHOLD && (
                <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-white">High Value 🔥</Badge>
              )}
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-muted-foreground">Expected Value:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="ml-1 h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expected value on a $100 bet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium text-green-600">{bet.expected_value}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confidence:</span>
            {getConfidenceBadge(bet.confidence)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
