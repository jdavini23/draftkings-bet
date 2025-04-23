// 'use client'; // Removed to make this a Server Component

import { getServerClient } from '@/lib/supabase';
import { DashboardClient } from '@/components/dashboard-client';

export default async function DashboardPage() {
  console.log(
    '[DEBUG] Rendering DashboardPage. typeof window:',
    typeof window,
    'process.env.NODE_ENV:',
    process.env.NODE_ENV
  );
  let opportunitiesCount = 0;
  let profitLoss = '+$0.00';
  let winRate = '0%';

  try {
    // Get count of active bets with positive edge
    const supabase = getServerClient();
    const { count, error } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('edge_percentage', 2);

    if (!error) {
      opportunitiesCount = count || 0;
    }

    // In a real app, calculate these from user_bets
    profitLoss = '+$245.50';
    winRate = '62.5%';
  } catch (error) {
    console.error('[DEBUG] Error fetching dashboard data:', error);
    if (error instanceof Error) {
      console.error('[DEBUG] Error stack:', error.stack);
    }
  }

  return (
    <DashboardClient
      opportunitiesCount={opportunitiesCount}
      profitLoss={profitLoss}
      winRate={winRate}
    />
  );
}
