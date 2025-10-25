"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, BookOpen, MessageSquare, Video, BarChart3, Settings, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard/study", icon: BookOpen, label: "Study Practice", tooltip: "Study Practice" },
    { href: "/dashboard/mentor", icon: MessageSquare, label: "AI Mentor", tooltip: "AI Mentor" },
    { href: "/dashboard/interviews", icon: Video, label: "Mock Interviews", tooltip: "Mock Interviews" },
    { href: "/dashboard/progress", icon: BarChart3, label: "Progress", tooltip: "Progress Tracker" },
  ]

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground shadow-lg">
                    <Brain className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">MentorVerse</span>
                    <span className="truncate text-xs text-muted-foreground">AI Study Platform</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Learning Modules</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.tooltip} isActive={isActive}>
                        <Link href={item.href} className="relative group">
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute inset-0 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-md"
                              initial={false}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <item.icon
                            className={`size-4 relative z-10 transition-colors ${isActive ? "text-primary" : ""}`}
                          />
                          <span
                            className={`relative z-10 transition-colors ${isActive ? "text-primary font-medium" : ""}`}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Accessibility Settings"
                    isActive={pathname === "/dashboard/settings"}
                  >
                    <Link href="/dashboard/settings">
                      <Settings className="size-4" />
                      <span>Accessibility</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sign Out">
                <Link href="/login">
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 glass-effect sticky top-0 z-40">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex items-center gap-2 px-4">
            <ThemeToggle />
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 p-6"
        >
          {children}
        </motion.main>
      </SidebarInset>
    </SidebarProvider>
  )
}
