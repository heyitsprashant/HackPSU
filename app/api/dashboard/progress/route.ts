import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    
    const response = await fetch(`${backendUrl}/dashboard/progress`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const progressData = await response.json()
    return NextResponse.json(progressData)
  } catch (error) {
    console.error("Dashboard progress error:", error)
    return NextResponse.json(
      { error: "Failed to fetch progress data" },
      { status: 500 }
    )
  }
}
