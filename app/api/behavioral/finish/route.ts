import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const body = await req.json()
    const userId = req.headers.get("x-user-id") || "1"
    const res = await fetch(`${backendUrl}/behavioral/finish?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: "Failed to persist behavioral session" }, { status: 500 })
  }
}
