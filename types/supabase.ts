export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      bets: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          status?: string
          result?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sport?: string
          match?: string
          market?: string
          selection?: string
          odds?: string
          book_odds?: string
          edge_percentage?: number
          expected_value?: string
          event_time?: string
          confidence?: string
          status?: string
          result?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: number
          sport_id: number | null
          home_team_id: number | null
          away_team_id: number | null
          start_time: string
          status: string | null
          score_home: number | null
          score_away: number | null
          external_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          sport_id?: number | null
          home_team_id?: number | null
          away_team_id?: number | null
          start_time: string
          status?: string | null
          score_home?: number | null
          score_away?: number | null
          external_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          sport_id?: number | null
          home_team_id?: number | null
          away_team_id?: number | null
          start_time?: string
          status?: string | null
          score_home?: number | null
          score_away?: number | null
          external_id?: string | null
          created_at?: string | null
        }
      }
      markets: {
        Row: {
          id: number
          name: string
          key: string
          sport_id: number | null
        }
        Insert: {
          id?: number
          name: string
          key: string
          sport_id?: number | null
        }
        Update: {
          id?: number
          name?: string
          key?: string
          sport_id?: number | null
        }
      }
      odds_history: {
        Row: {
          id: string
          bet_id: string | null
          odds: string
          recorded_at: string | null
        }
        Insert: {
          id?: string
          bet_id?: string | null
          odds: string
          recorded_at?: string | null
        }
        Update: {
          id?: string
          bet_id?: string | null
          odds?: string
          recorded_at?: string | null
        }
      }
      sports: {
        Row: {
          id: number
          name: string
          key: string
          active: boolean | null
        }
        Insert: {
          id?: number
          name: string
          key: string
          active?: boolean | null
        }
        Update: {
          id?: number
          name?: string
          key?: string
          active?: boolean | null
        }
      }
      teams: {
        Row: {
          id: number
          name: string
          sport_id: number | null
          external_id: string | null
        }
        Insert: {
          id?: number
          name: string
          sport_id?: number | null
          external_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          sport_id?: number | null
          external_id?: string | null
        }
      }
      user_bets: {
        Row: {
          id: string
          user_id: string
          bet_id: string | null
          stake: number | null
          placed_odds: string | null
          status: string | null
          profit_loss: number | null
          tracked: boolean | null
          saved: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          bet_id?: string | null
          stake?: number | null
          placed_odds?: string | null
          status?: string | null
          profit_loss?: number | null
          tracked?: boolean | null
          saved?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          bet_id?: string | null
          stake?: number | null
          placed_odds?: string | null
          status?: string | null
          profit_loss?: number | null
          tracked?: boolean | null
          saved?: boolean | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
