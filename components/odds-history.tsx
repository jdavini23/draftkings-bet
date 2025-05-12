'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatDisplayDateTime } from '@/lib/utils';
import { useBetRefresh } from '@/hooks/use-bet-refresh';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface OddsHistory {
  id: string;
  bet_id: string | null;
  odds: string;
  recorded_at: string | null;
}

interface OddsHistoryProps {
  oddsHistory: OddsHistory[];
  betId?: string;
}

export function OddsHistory({
  oddsHistory: initialOddsHistory,
  betId,
}: OddsHistoryProps) {
  const [oddsHistory, setOddsHistory] =
    useState<OddsHistory[]>(initialOddsHistory);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshTrigger } = useBetRefresh();

  // Fetch latest odds history when refresh is triggered
  useEffect(() => {
    if (betId) {
      fetchLatestOddsHistory();
    }
  }, [refreshTrigger, betId]);

  // Function to fetch latest odds history
  const fetchLatestOddsHistory = async () => {
    if (!betId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/odds-history?betId=${betId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.oddsHistory) {
          setOddsHistory(data.oddsHistory);
        }
      }
    } catch (error) {
      console.error('Error fetching odds history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert American odds to decimal for better visualization
  const data = oddsHistory.map((item) => {
    const americanOdds = item.odds;
    let decimalOdds = 0;

    if (americanOdds.startsWith('+')) {
      decimalOdds = Number(americanOdds.substring(1)) / 100 + 1;
    } else {
      decimalOdds = 100 / Math.abs(Number(americanOdds)) + 1;
    }

    // Format the time to be more readable
    const timestamp = item.recorded_at ? new Date(item.recorded_at) : null;
    const displayDateTime = timestamp
      ? formatDisplayDateTime(timestamp.toISOString())
      : 'Unknown';
    const shortTime = timestamp
      ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Unknown';

    return {
      id: item.id,
      timestamp,
      displayDateTime,
      shortTime,
      americanOdds,
      decimalOdds: parseFloat(decimalOdds.toFixed(2)),
    };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Odds History</CardTitle>
          <CardDescription>
            Track how the odds have changed over time
          </CardDescription>
        </div>
        {betId && (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLatestOddsHistory}
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
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortTime" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'decimalOdds') {
                      return [`${value} (Decimal)`, 'Odds'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (
                      payload &&
                      payload.length > 0 &&
                      payload[0].payload.displayDateTime
                    ) {
                      return payload[0].payload.displayDateTime;
                    }
                    return label; // Fallback to the shortTime if displayDateTime isn't available
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="decimalOdds"
                  name="Odds"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No odds history available</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Odds Movement</h3>
          {data.length > 0 ? (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.displayDateTime}</span>
                  <span
                    className={
                      index > 0 &&
                      item.americanOdds !== data[index - 1].americanOdds
                        ? parseFloat(item.americanOdds) >
                          parseFloat(data[index - 1].americanOdds)
                          ? 'text-green-600'
                          : 'text-red-600'
                        : ''
                    }
                  >
                    {item.americanOdds}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No specific odds changes recorded.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
