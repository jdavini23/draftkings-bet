// 'use client'; // Removed to make this a Server Component

import { getServerClient } from '@/lib/supabase';
import { DashboardClient } from '@/components/dashboard-client';

// Helper function to calculate profit from American odds
function calculateProfit(odds: number, stake: number): number {
  if (odds > 0) {
    return (odds / 100) * stake;
  }
  return (100 / Math.abs(odds)) * stake;
}

export default async function DashboardPage() {
  console.log(
    '[DEBUG] Rendering DashboardPage. typeof window:',
    typeof window,
    'process.env.NODE_ENV:',
    process.env.NODE_ENV
  );
  let opportunitiesCount = 0;
  let profitLossStr = '$0.00'; // Default to $0.00, sign will be added
  let winRateStr = '0.0%';

  try {
    const supabase = getServerClient();

    // Get count of active bets with positive edge
    const { count: oppsCount, error: oppsError } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('edge_percentage', 2);

    if (!oppsError && oppsCount !== null) {
      opportunitiesCount = oppsCount;
    }

    // Fetch settled bets to calculate profit/loss and win rate
    const { data: settledBets, error: betsError } = await supabase
      .from('bets')
      .select('status, stake, odds') // Assuming 'odds' is stored as American odds (e.g., -110, +150)
      .in('status', ['win', 'loss']);

    if (!betsError && settledBets) {
      let totalProfit = 0;
      let totalLoss = 0;
      let wonBetsCount = 0;
      let lostBetsCount = 0;

      for (const bet of settledBets) {
        const stake = typeof bet.stake === 'number' ? bet.stake : parseFloat(String(bet.stake));
        const odds = typeof bet.odds === 'number' ? bet.odds : parseFloat(String(bet.odds));

        if (isNaN(stake) || isNaN(odds)) {
          console.warn('[DEBUG] Invalid stake or odds for bet:', bet);
          continue;
        }

        if (bet.status === 'win') {
          totalProfit += calculateProfit(odds, stake);
          wonBetsCount++;
        } else if (bet.status === 'loss') {
          totalLoss += stake;
          lostBetsCount++;
        }
      }

      const netProfitLoss = totalProfit - totalLoss;
      profitLossStr = `${netProfitLoss >= 0 ? '+' : '-'}$${Math.abs(netProfitLoss).toFixed(2)}`;

      const totalSettledBets = wonBetsCount + lostBetsCount;
      if (totalSettledBets > 0) {
        const winRate = (wonBetsCount / totalSettledBets) * 100;
        winRateStr = `${winRate.toFixed(1)}%`;
      } else {
        winRateStr = '0.0%';
      }
    } else if (betsError) {
      console.error('[DEBUG] Error fetching settled bets. Message:', betsError.message, 'Details:', betsError.details, 'Code:', betsError.code);
      console.error('[DEBUG] Full betsError object:', JSON.stringify(betsError, null, 2));
    }

  } catch (error) {
    console.error('[DEBUG] Error fetching dashboard data:', error);
    if (error instanceof Error) {
      console.error('[DEBUG] Error stack:', error.stack);
    }
    // Keep default values for profitLossStr and winRateStr on error
  }

  return (
    <DashboardClient
      opportunitiesCount={opportunitiesCount}
      profitLoss={profitLossStr} // Use the new string variable
      winRate={winRateStr}      // Use the new string variable
    />
  );
}
