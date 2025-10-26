import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const parsedData = await request.json()

    if (!parsedData) {
      return NextResponse.json(
        { error: "Parsed email data is required" },
        { status: 400 }
      )
    }

    // Call FastAPI backend for interview generation
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    
    const response = await fetch(`${backendUrl}/generate-interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const interviewData = await response.json()
    return NextResponse.json(interviewData)
  } catch (error) {
    console.error("Interview generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    )
  }
}
