import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple response without any database operations
    return NextResponse.json({
      success: true,
      message: "API route is working correctly",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in seed route:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error in seed route",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
