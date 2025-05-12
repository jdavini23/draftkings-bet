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
  stake: number;
}
