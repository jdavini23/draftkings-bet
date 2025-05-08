import { getServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = getServerClient();

  try {
    const { data, error } = await supabase.from("bets").select("*");

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

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error fetching bets from server:", error);
    console.error(
      "Supabase URL:",
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
