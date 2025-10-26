import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const res = await fetch(`${backendUrl}/dashboard/behavioral`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch behavioral summaries" }, { status: 500 })
  }
}
