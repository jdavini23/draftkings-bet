import { getServerClient } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = getServerClient();

  const betId = request.nextUrl.searchParams.get('betId');
  if (!betId) {
    return NextResponse.json({ error: 'Bet ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('odds_history')
      .select('*')
      .eq('bet_id', betId)
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Error fetching odds history:', error);
      return NextResponse.json(
        { error: JSON.stringify(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ oddsHistory: data });
  } catch (error: any) {
    console.error('Error fetching odds history:', error);
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
