import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body?.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "'content' is required" }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const resp = await fetch(`${backendUrl}/parse-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: body.content }),
    })

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "")
      return NextResponse.json({ error: `Backend error ${resp.status}`, details: txt }, { status: 502 })
    }

    const data = await resp.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Failed to parse email" }, { status: 500 })
  }
}