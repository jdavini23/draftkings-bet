import { getServerClient } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';
import { getPSTDateString, getPSTTomorrowDateString } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const supabase = getServerClient();

  // Check if we're fetching a specific bet by ID
  const betId = request.nextUrl.searchParams.get('id');
  if (betId) {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('id', betId);

      if (error) {
        console.error('Error fetching bet by ID:', error);
        return NextResponse.json(
          { error: JSON.stringify(error) },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, count: data?.length || 0 });
    } catch (error: any) {
      console.error('Error fetching bet by ID:', error);
      return NextResponse.json(
        { error: JSON.stringify(error) },
        { status: 500 }
      );
    }
  }

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(
    request.nextUrl.searchParams.get('pageSize') || '10',
    10
  );
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize - 1;

  const sortColumn =
    request.nextUrl.searchParams.get('sortColumn') || 'event_time';
  const sortDirection =
    request.nextUrl.searchParams.get('sortDirection') || 'desc';

  try {
    // Only fetch bets for today (PST)
    const todayStr = getPSTDateString();
    const tomorrowStr = getPSTTomorrowDateString();

    // Get the total count for today (PST), without pagination
    const { count: totalCount, error: countError } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true })
      .gte('event_time', todayStr)
      .lt('event_time', tomorrowStr);

    if (countError) {
      console.error('Error fetching bets count from server:', countError);
      return NextResponse.json(
        { error: JSON.stringify(countError) },
        { status: 500 }
      );
    }

    // Fetch paginated data
    let query = supabase
      .from('bets')
      .select('*')
      .order(sortColumn, { ascending: sortDirection === 'asc' })
      .range(startIndex, endIndex)
      .gte('event_time', todayStr)
      .lt('event_time', tomorrowStr);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bets from server:', error);
      console.error(
        'Supabase URL:',
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      );
      return NextResponse.json(
        { error: JSON.stringify(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, count: totalCount });
  } catch (error: any) {
    console.error('Error fetching bets from server:', error);
    console.error(
      'Supabase URL:',
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
