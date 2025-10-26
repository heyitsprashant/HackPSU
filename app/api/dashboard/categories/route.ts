import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    
    const response = await fetch(`${backendUrl}/dashboard/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const categoryData = await response.json()
    return NextResponse.json(categoryData)
  } catch (error) {
    console.error("Dashboard categories error:", error)
    return NextResponse.json(
      { error: "Failed to fetch category data" },
      { status: 500 }
    )
  }
}
