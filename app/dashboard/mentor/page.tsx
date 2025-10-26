"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MentorPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new interview assistant page
    router.replace('/dashboard/interview-assistant')
  }, [router])

  // Show a loading message while redirecting
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to AI Interview Assistant...</p>
      </div>
    </div>
  )
}
