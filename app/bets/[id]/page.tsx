"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OddsHistory } from "@/components/odds-history";
import type { NewsArticle } from "@/app/api/fetch-news/route";
import { formatDisplayDateTime } from "@/lib/utils";

interface BetTabsProps {
  oddsHistory: any[];
  betId: string;
  relatedNews: NewsArticle[];
}

export default function BetTabs({
  oddsHistory,
  betId,
  relatedNews,
}: BetTabsProps) {
  return (
    <Tabs defaultValue="odds-history" className="mt-6">
      <TabsList>
        <TabsTrigger value="odds-history">Odds History</TabsTrigger>
        <TabsTrigger value="news">Related News</TabsTrigger>
      </TabsList>
      <TabsContent value="odds-history" className="mt-4">
        <OddsHistory oddsHistory={oddsHistory} betId={betId} />
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
                      {article.source} •{" "}
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
  );
}
