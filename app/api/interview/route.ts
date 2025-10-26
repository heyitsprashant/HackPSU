import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const payload = await req.json()

    const res = await fetch(`${backendUrl}/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      return NextResponse.json({ error: txt || `backend ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "proxy failed" }, { status: 500 })
  }
}
