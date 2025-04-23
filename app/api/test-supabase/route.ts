import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Log environment variables (without revealing sensitive values)
    console.log("NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // Try to create a Supabase client directly in the API route
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Supabase environment variables",
          envVars: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
          },
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Try a simple query to test the connection
    const { data, error, status } = await supabase.from("bets").select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: !error,
      message: error ? "Error connecting to Supabase" : "Successfully connected to Supabase",
      status,
      count: data?.length,
      error: error ? JSON.stringify(error) : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing Supabase connection:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Exception when testing Supabase connection",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
