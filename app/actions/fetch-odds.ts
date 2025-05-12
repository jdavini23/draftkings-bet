'use server';

import { revalidatePath } from 'next/cache';
import { fetchOddsFromApi, transformOddsData } from '@/lib/api/odds-api';
import { getServerClient } from '@/lib/supabase';
import { BetSchema } from '@/types/zod';
import { getPSTDateString, getPSTTomorrowDateString } from '@/lib/utils';

export async function fetchOdds() {
  try {
    // Get all active sports
    const supabase = getServerClient();

    // Define the specific sport keys for basketball, football, and baseball
    const targetSportKeys = [
      'basketball_nba', // NBA Basketball
      'americanfootball_nfl', // NFL Football
      'baseball_mlb', // MLB Baseball
      // You can add more specific keys here if you track other leagues,
      // e.g., "americanfootball_ncaaf", "basketball_ncaab"
    ];

    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .select('key, name, has_outrights')
      .eq('active', true)
      .in('key', targetSportKeys);

    if (sportsError) {
      console.error('Error fetching sports:', sportsError);
      return {
        success: false,
        error: `Failed to fetch sports: ${sportsError.message}`,
      };
    }

    // Use the filtered sports directly. If no matching sports are found (or none are active),
    // sportsToFetch will be an empty array.
    const sportsToFetch = sports || [];

    if (sportsToFetch.length === 0) {
      console.log(
        'No active sports found matching the desired keys (basketball_nba, americanfootball_nfl, baseball_mlb). No odds will be fetched.'
      );
      // Revalidate the path to ensure the UI reflects that no new odds were fetched.
      revalidatePath('/');
      return {
        success: true,
        message:
          'No active sports found for basketball, football, or baseball. Zero betting opportunities fetched.',
        results: [],
      };
    }

    let totalBets = 0;
    const results = [];
    const notifications: string[] = [];

    // Helper to pause for ms
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    // Remove all bets that are not for today or are in the future (PST)
    const todayStr = getPSTDateString();
    const tomorrowStr = getPSTTomorrowDateString();
    await supabase
      .from('bets')
      .delete()
      .or(`not(event_time.like.${todayStr}%),event_time.gte.${tomorrowStr}`);

    // Fetch odds for all sports in parallel
    const fetchResults = await Promise.all(
      sportsToFetch.map(async (sport) => {
        try {
          console.log(`Fetching odds for ${sport.name}...`);

          let marketQueryParam = 'h2h,spreads,totals';
          const isOutrightSport =
            sport.has_outrights ||
            sport.key.includes('_winner') ||
            sport.key.includes('futures') ||
            sport.key.startsWith('politics_');
          if (isOutrightSport) {
            marketQueryParam = 'outrights';
          }

          // Retry logic for 429
          let attempt = 0;
          let oddsData, quotaRemaining, status;
          while (attempt < 3) {
            const apiResult = await fetchOddsFromApi(
              sport.key,
              marketQueryParam,
              true
            ); // pass returnHeaders=true
            oddsData = apiResult.data;
            quotaRemaining = apiResult.quotaRemaining;
            status = apiResult.status;
            if (status !== 429) break;
            console.warn(
              `Rate limited by Odds API for ${sport.name}, retrying in 3s...`
            );
            await sleep(3000);
            attempt++;
          }

          if (quotaRemaining !== undefined && Number(quotaRemaining) < 10) {
            const msg = `Warning: Only ${quotaRemaining} Odds API requests remaining after fetching ${sport.name}!`;
            console.warn(msg);
            notifications.push(msg);
          }

          if (!oddsData || oddsData.length === 0) {
            const msg = `Failed to fetch odds for ${sport.name}.`;
            console.error(msg, oddsData);
            notifications.push(msg);
            return {
              sport: sport.name,
              success: false,
              message: 'Failed to fetch odds from API',
            };
          }

          // Filter oddsData to only include events for today
          const today = new Date();
          const todayStr = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
          const todaysOddsData = oddsData.filter(
            (event: any) => event.commence_time.slice(0, 10) === todayStr
          );
          console.log(
            `[DEBUG] ${sport.name}: todaysOddsData count:`,
            todaysOddsData.length
          );
          if (todaysOddsData.length > 0) {
            console.log('[DEBUG] Sample event:', todaysOddsData[0]);
          }

          const rawBets = transformOddsData(todaysOddsData);
          const uniqueBetsMap = new Map();
          rawBets.forEach((bet) => {
            const key = `${bet.match}-${bet.market}-${bet.selection}`;
            if (!uniqueBetsMap.has(key)) {
              uniqueBetsMap.set(key, bet);
            }
          });
          const bets = Array.from(uniqueBetsMap.values());
          console.log(`[DEBUG] ${sport.name}: bets to upsert:`, bets.length);
          if (bets.length === 0) {
            return {
              sport: sport.name,
              success: true,
              count: 0,
              message:
                'No unique betting opportunities found after de-duplication',
            };
          }

          // Store in Supabase
          const { data, error } = await supabase
            .from('bets')
            .upsert(
              bets.map((bet) => {
                const validatedBet = BetSchema.safeParse(bet);
                if (!validatedBet.success) {
                  console.error('Error validating bet:', validatedBet.error);
                  throw new Error('Error validating bet');
                }
                return {
                  sport: validatedBet.data.sport,
                  match: validatedBet.data.match,
                  market: validatedBet.data.market,
                  selection: validatedBet.data.selection,
                  odds: validatedBet.data.odds,
                  book_odds: validatedBet.data.book_odds,
                  edge_percentage: validatedBet.data.edge_percentage,
                  expected_value: validatedBet.data.expected_value,
                  event_time: validatedBet.data.event_time,
                  confidence: validatedBet.data.confidence,
                  status: validatedBet.data.status,
                  updated_at: new Date().toISOString(),
                  stake: 100,
                };
              }),
              { onConflict: 'match,market,selection' }
            )
            .select();
          if (error) {
            console.error(`[DEBUG] Upsert error for ${sport.name}:`, error);
          } else {
            console.log(
              `[DEBUG] Upserted bets for ${sport.name}:`,
              data?.length ?? 0
            );
          }

          // For each bet, add an entry to odds_history
          const oddsHistoryEntries =
            data?.map((betEntry) => ({
              bet_id: betEntry.id,
              odds: betEntry.odds,
              recorded_at: new Date().toISOString(),
            })) || [];

          if (oddsHistoryEntries.length > 0) {
            const { error: historyError } = await supabase
              .from('odds_history')
              .insert(oddsHistoryEntries);
            if (historyError) {
              console.error(
                `Error storing odds history for ${sport.name}:`,
                historyError
              );
            }
          }

          totalBets += bets.length;
          return {
            sport: sport.name,
            success: true,
            count: bets.length,
          };
        } catch (error) {
          console.error(`Error processing ${sport.name}:`, error);
          return {
            sport: sport.name,
            success: false,
            message: 'Error processing sport',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    results.push(...fetchResults);
    revalidatePath('/');
    return {
      success: true,
      message: `Successfully fetched and stored ${totalBets} betting opportunities`,
      results,
      notifications,
    };
  } catch (error) {
    console.error('Error fetching odds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
