import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const body = await req.json()
    const userId = req.headers.get("x-user-id") || "1"

    const res = await fetch(`${backendUrl}/tracking/study?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text || "Backend error" }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    console.error("track study error", e)
    return NextResponse.json({ error: "Failed to track study" }, { status: 500 })
  }
}
