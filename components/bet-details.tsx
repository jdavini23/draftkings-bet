'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useBetRefresh } from '@/hooks/use-bet-refresh';

interface Bet {
  id: string;
  sport: string;
  match: string;
  market: string;
  selection: string;
  odds: string;
  book_odds: string;
  edge_percentage: number;
  expected_value: string;
  event_time: string;
  confidence: string;
  status: string;
  result: string | null;
}

interface BetDetailsProps {
  bet: Bet;
}

export function BetDetails({ bet: initialBet }: BetDetailsProps) {
  const [bet, setBet] = useState<Bet>(initialBet);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshTrigger, triggerRefresh } = useBetRefresh();

  const fetchLatestBetDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/get-bets?id=${bet.id}`);
      if (response.ok) {
        const { data } = await response.json();
        if (data && data.length > 0) {
          setBet(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching latest bet details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update bet details when refresh is triggered
  useEffect(() => {
    fetchLatestBetDetails();
  }, [refreshTrigger]);

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-green-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-red-500">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const HIGH_VALUE_THRESHOLD = 5; // Edge percentage greater than this is considered high value

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Bet Details</CardTitle>
          <CardDescription>
            Detailed information about this betting opportunity
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchLatestBetDetails();
            triggerRefresh();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </span>
        </Button>
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
              <span
                className={`font-medium ${
                  bet.edge_percentage > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {bet.edge_percentage.toFixed(2)}%
              </span>
              {bet.edge_percentage > HIGH_VALUE_THRESHOLD && (
                <Badge
                  variant="destructive"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  High Value 🔥
                </Badge>
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
            <span
              className={`font-medium ${
                bet.expected_value.startsWith('-')
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {bet.expected_value}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confidence:</span>
            {getConfidenceBadge(bet.confidence)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
