"use client"

import type React from "react"
import DashboardLayout from "../dashboard/layout"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
