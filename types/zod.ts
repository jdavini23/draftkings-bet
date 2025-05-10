import { z } from "zod";

export const OddsApiOutcomeSchema = z.object({
  name: z.string(),
  price: z.number(),
  point: z.number().optional(),
});

export type OddsApiOutcome = z.infer<typeof OddsApiOutcomeSchema>;

export const OddsApiMarketSchema = z.object({
  key: z.string(),
  last_update: z.string(),
  outcomes: z.array(OddsApiOutcomeSchema),
});

export type OddsApiMarket = z.infer<typeof OddsApiMarketSchema>;

export const OddsApiBookmakerSchema = z.object({
  key: z.string(),
  title: z.string(),
  last_update: z.string(),
  markets: z.array(OddsApiMarketSchema),
});

export type OddsApiBookmaker = z.infer<typeof OddsApiBookmakerSchema>;

export const OddsApiEventSchema = z.object({
  id: z.string(),
  sport_key: z.string(),
  sport_title: z.string(),
  commence_time: z.string(),
  home_team: z.string(),
  away_team: z.string(),
  bookmakers: z.array(OddsApiBookmakerSchema),
});

export type OddsApiEvent = z.infer<typeof OddsApiEventSchema>;

export const OddsApiResponseSchema = z.array(OddsApiEventSchema);

export type OddsApiResponse = z.infer<typeof OddsApiResponseSchema>;

export const BetSchema = z.object({
  id: z.string(),
  sport: z.string(),
  match: z.string(),
  market: z.string(),
  selection: z.string(),
  odds: z.string(),
  book_odds: z.string(),
  edge_percentage: z.number(),
  expected_value: z.string(),
  event_time: z.string(),
  confidence: z.string(),
  status: z.string(),
  result: z.string().nullable(),
});

export type Bet = z.infer<typeof BetSchema>;
