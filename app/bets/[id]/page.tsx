import { getServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { BetDetails } from '@/components/bet-details';
import { OddsHistory } from '@/components/odds-history';
import { BetActions } from '@/components/bet-actions';
import { EventSummaryCard } from '@/components/event-summary-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { NewsArticle } from '@/app/api/fetch-news/route';
import { formatDisplayDateTime } from '@/lib/utils';

interface FetchNewsParams {
  sport: string;
  match: string;
  selection?: string;
}

async function fetchNews(params: FetchNewsParams): Promise<NewsArticle[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('match', params.match); // 'match' is a good primary identifier
  if (params.sport) {
    queryParams.append('sport', params.sport);
  }
  if (params.selection) {
    queryParams.append('selection', params.selection);
  }

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }/api/fetch-news?${queryParams.toString()}`
  );
  if (!res.ok) {
    console.error('Failed to fetch news:', res.statusText);
    return []; // Return empty array on error
  }
  return res.json();
}

export default async function BetPage({ params }: { params: { id: string } }) {
  const supabase = getServerClient();
  const { id } = params;

  // Fetch bet details
  const { data: bet, error } = await supabase
    .from('bets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !bet) {
    console.error('Error fetching bet:', error);
    notFound();
  }

  // Fetch odds history
  const { data: oddsHistory } = await supabase
    .from('odds_history')
    .select('*')
    .eq('bet_id', id)
    .order('recorded_at', { ascending: true });

  // Fetch related news
  const relatedNews = await fetchNews({
    sport: bet.sport,
    match: bet.match,
    selection: bet.selection,
  });

  return (
    <DashboardShell>
      <div className="flex items-center gap-2 mb-4">
        <Link href="/" passHref>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <DashboardHeader
        heading={`${bet.match} - ${bet.market}`}
        text={`${bet.selection} @ ${bet.odds}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <BetDetails bet={bet} />
        <BetActions bet={bet} />
        <EventSummaryCard bet={bet} />
      </div>

      <Tabs defaultValue="odds-history" className="mt-6">
        <TabsList>
          <TabsTrigger value="odds-history">Odds History</TabsTrigger>
          <TabsTrigger value="news">Related News</TabsTrigger>
        </TabsList>
        <TabsContent value="odds-history" className="mt-4">
          <OddsHistory oddsHistory={oddsHistory || []} betId={id} />
        </TabsContent>
        <TabsContent value="news" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Related News</CardTitle>
              <CardDescription>
                Latest news and analysis related to this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relatedNews && relatedNews.length > 0 ? (
                <div className="space-y-4">
                  {relatedNews.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium">
                        {article.url ? (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {article.title}
                          </a>
                        ) : (
                          article.title
                        )}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {article.source} •{' '}
                        {formatDisplayDateTime(article.published_at)}
                      </p>
                      <p className="mt-2 text-sm">{article.snippet}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No news found for this event.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
