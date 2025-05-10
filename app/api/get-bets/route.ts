import { getServerClient } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = getServerClient();

  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(
    request.nextUrl.searchParams.get("pageSize") || "10",
    10
  );
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize - 1;

  const sortColumn =
    request.nextUrl.searchParams.get("sortColumn") || "event_time";
  const sortDirection =
    request.nextUrl.searchParams.get("sortDirection") || "desc";

  try {
    let query = supabase
      .from("bets")
      .select("*", { count: "exact" })
      .order(sortColumn, { ascending: sortDirection === "asc" })
      .range(startIndex, endIndex);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching bets from server:", error);
      console.error(
        "Supabase URL:",
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      );
      return NextResponse.json(
        { error: JSON.stringify(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, count });
  } catch (error: any) {
    console.error("Error fetching bets from server:", error);
    console.error(
      "Supabase URL:",
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
