"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BackButton({ href, label = "Back", className }: { href?: string; label?: string; className?: string }) {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("inline-flex items-center gap-2", className)}
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
