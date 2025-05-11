'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BetOpportunities } from '@/components/bet-opportunities';
import { BettingHistory } from '@/components/betting-history';
import {
  BanknoteIcon as BanknotesIcon,
  BarChartIcon as ChartBarIcon,
  TrophyIcon,
  RefreshCw,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardShell } from '@/components/dashboard-shell';
import { Overview } from '@/components/overview';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { fetchOdds } from '@/app/actions/fetch-odds';

export function DashboardClient({
  opportunitiesCount,
  profitLoss,
  winRate,
}: {
  opportunitiesCount: number;
  profitLoss: string;
  winRate: string;
}) {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Betting Dashboard"
        text="View profitable betting opportunities and track your performance."
      >
        <div className="flex gap-2">
          <FetchOddsButton />
          <Button asChild variant="outline">
            <a
              href="/api/seed-sports"
              target="_blank"
              rel="noopener noreferrer"
            >
              Seed Sports Data
            </a>
          </Button>
        </div>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profitable Opportunities
            </CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunitiesCount}</div>
            <p className="text-xs text-muted-foreground">
              Updated in real-time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
            <BanknotesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {profitLoss}
            </div>
            <p className="text-xs text-muted-foreground">+$32.50 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Betting Opportunities</TabsTrigger>
          <TabsTrigger value="history">Betting History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities" className="space-y-4">
          <BetOpportunities />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <BettingHistory />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Overview />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}

function FetchOddsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleFetchOdds() {
    setIsLoading(true);
    try {
      const result = await fetchOdds();

      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error fetching odds',
          description: result.error || 'An unknown error occurred',
          variant: 'destructive',
        });
      }
      if (result.notifications && Array.isArray(result.notifications)) {
        result.notifications.forEach((msg) =>
          toast({
            title: 'Notice',
            description: msg,
            variant: msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('warning') ? 'destructive' : 'default',
          })
        );
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleFetchOdds} disabled={isLoading}>
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Fetching...
        </>
      ) : (
        'Fetch Latest Odds'
      )}
    </Button>
  );
}
