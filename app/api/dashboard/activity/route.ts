import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    
    const response = await fetch(`${backendUrl}/dashboard/recent-activity`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const activityData = await response.json()
    return NextResponse.json(activityData)
  } catch (error) {
    console.error("Dashboard activity error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    )
  }
}
