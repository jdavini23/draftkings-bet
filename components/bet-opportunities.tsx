'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookmarkIcon,
  ChevronDown,
  ExternalLinkIcon,
  FilterIcon,
  InfoIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface Bet {
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

export function BetOpportunities() {
  const [filter, setFilter] = useState('all');
  const [opportunities, setOpportunities] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/get-bets');
        if (!response.ok) {
          throw new Error(`Failed to fetch bets: ${response.status}`);
        }
        const { data, error } = await response.json();

        if (error) {
          console.error('Error fetching bets:', error);
        } else {
          console.log('Bets fetched successfully:', data);
          setOpportunities(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching bets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

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

  const filteredOpportunities =
    filter === 'all'
      ? opportunities
      : opportunities.filter((opp) => opp.confidence === filter);

  const handleRowClick = (betId: string) => {
    router.push(`/bets/${betId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profitable Betting Opportunities</CardTitle>
            <CardDescription>
              Opportunities with positive expected value based on our analysis.
            </CardDescription>
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
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Opportunities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('high')}>
                  High Confidence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('medium')}>
                  Medium Confidence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('low')}>
                  Low Confidence
                </DropdownMenuItem>
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
              {filteredOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No betting opportunities found. Try fetching the latest
                    odds.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpportunities.map((opportunity) => (
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
                        <div className="text-sm text-muted-foreground">
                          {opportunity.selection}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{opportunity.odds}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {opportunity.edge_percentage}%
                    </TableCell>
                    <TableCell>{opportunity.expected_value}</TableCell>
                    <TableCell>
                      {new Date(opportunity.event_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getConfidenceBadge(opportunity.confidence)}
                    </TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Export to CSV</Button>
        <Button
          onClick={() =>
            window.open('https://sportsbook.draftkings.com', '_blank')
          }
        >
          Open in DraftKings
        </Button>
      </CardFooter>
    </Card>
  );
}
