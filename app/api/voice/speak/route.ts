import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use backend /interview" }, { status: 410 })
}
