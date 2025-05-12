import { NextRequest, NextResponse } from "next/server";

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  published_at: string;
  snippet: string;
  url?: string; // Optional URL to the full article
}

// Denylist of generic betting terms for the 'selection' parameter
const GENERIC_SELECTION_TERMS = [
  "over",
  "under",
  "yes",
  "no",
  "spread",
  "moneyline",
  "total",
  "points",
  "goals",
  "handicap",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sport = searchParams.get("sport");
  const match = searchParams.get("match");
  const selection = searchParams.get("selection");
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.error("News API key is missing");
    return NextResponse.json(
      { error: "Configuration error: News API key is missing" },
      { status: 500 }
    );
  }

  if (!sport || !match) {
    return NextResponse.json(
      { error: "Sport and match parameters are required" },
      { status: 400 }
    );
  }

  // Construct the NewsAPI query
  let newsApiQueryParts = [`"${sport}" AND "${match}"`]; // Prioritize sport and match

  if (selection) {
    const selectionLower = selection.toLowerCase();
    // Check if the selection is not a generic term and is reasonably specific
    if (
      !GENERIC_SELECTION_TERMS.some((term) => selectionLower.includes(term)) &&
      selection.length > 3
    ) {
      newsApiQueryParts.push(`OR ("${sport}" AND "${selection}")`);
    }
  }

  const finalQuery = newsApiQueryParts.join(" ");

  const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    finalQuery
  )}&apiKey=${apiKey}&language=en&pageSize=5&sortBy=relevancy`;

  try {
    const newsResponse = await fetch(newsApiUrl, {
      next: { revalidate: 3600 },
    }); // Cache for 1 hour

    if (!newsResponse.ok) {
      let errorData;
      try {
        errorData = await newsResponse.json();
      } catch (e) {
        // Ignore if response is not JSON
      }
      console.error(
        `NewsAPI request failed with status ${newsResponse.status} for query "${finalQuery}":`,
        errorData || newsResponse.statusText
      );
      return NextResponse.json(
        {
          error: `Failed to fetch news: ${
            errorData?.message || newsResponse.statusText
          }`,
        },
        { status: newsResponse.status }
      );
    }

    const newsData = await newsResponse.json();

    if (!newsData.articles || newsData.articles.length === 0) {
      return NextResponse.json([], { status: 200 }); // No articles found
    }

    const articles: NewsArticle[] = newsData.articles.map(
      (apiArticle: any) => ({
        id: apiArticle.url || apiArticle.title, // Use URL or title as ID
        title: apiArticle.title || "No title",
        source: apiArticle.source?.name || "Unknown source",
        published_at: apiArticle.publishedAt,
        snippet:
          apiArticle.description ||
          apiArticle.content ||
          "No snippet available",
        url: apiArticle.url,
      })
    );

    return NextResponse.json(articles);
  } catch (error: any) {
    console.error("Error fetching or processing news from NewsAPI:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
