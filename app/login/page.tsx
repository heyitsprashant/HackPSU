"use client"

import type React from "react"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard immediately since we removed authentication
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Redirecting to Dashboard...</CardTitle>
          <CardDescription>
            Taking you to the interview practice platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Please wait while we redirect you to the dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
