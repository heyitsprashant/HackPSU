import Link from "next/link"
import { redirect } from "next/navigation"

export default function LandingPage() {
  // Redirect to dashboard since we removed authentication
  redirect("/dashboard")
}
