"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Line,
  LineChart,
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

// Removed inline styles - using global theme instead

// Types
interface MetricCardProps {
  title: string
  value: string
  bgColor: string
}

interface DashboardStats {
  total_interviews: number
  completed_sessions: number
  success_rate: number
  average_score: number
  study_hours: number
  questions_practiced: number
  companies_applied: number
  interviews_scheduled: number
}

interface ProgressData {
  week: string
  sessions: number
  score: number
}

interface CategoryData {
  category: string
  questions: number
  correct: number
  percentage: number
}

interface ActivityData {
  date: string
  activity: string
  score: number
}

interface BehavioralData {
  id: number
  date: string
  confidence_score: number
  eye_contact_score: number
  posture_score: number
  speech_clarity: number
  overall_feedback: string
  improvements: string[]
}

const COLORS = ["#5B9FD8", "#4A8FC7", "#3A7FB6", "#6AAFDB"]
const BEHAVIORAL_COLORS = ["#5B9FD8", "#4A8FC7", "#3A7FB6", "#6AAFDB"]

function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
        borderRadius: "0.5rem",
        border: "1px solid var(--border)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// Components
function MetricCard({ title, value, bgColor }: MetricCardProps) {
  return (
    <Card style={{ padding: "1.5rem", backgroundColor: bgColor }}>
      <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>{title}</p>
      <p style={{ fontSize: "1.875rem", fontWeight: 600, color: "var(--foreground)" }}>{value}</p>
    </Card>
  )
}

function MetricCards({ stats }: { stats: DashboardStats }) {
  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      <MetricCard title="Total Interviews" value={stats.total_interviews.toString()} bgColor="var(--card)" />
      <MetricCard title="Completed Sessions" value={stats.completed_sessions.toString()} bgColor="var(--card)" />
      <MetricCard title="Success Rate" value={`${stats.success_rate}%`} bgColor="var(--secondary)" />
      <MetricCard title="Average Score" value={stats.average_score.toString()} bgColor="var(--card)" />
      <MetricCard title="Study Hours" value={stats.study_hours.toString()} bgColor="var(--card)" />
      <MetricCard title="Questions Practiced" value={stats.questions_practiced.toString()} bgColor="var(--card)" />
    </div>
  )
}

function ProgressChart({ data }: { data: ProgressData[] }) {
  return (
    <Card style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>Progress Over Time</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

function SessionsChart({ data }: { data: ProgressData[] }) {
  return (
    <Card style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>
        Study Sessions
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 10]}
          />
          <Area type="monotone" dataKey="sessions" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

function CategoryPerformanceChart({ data }: { data: CategoryData[] }) {
  return (
    <Card style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1.5rem" }}>
        Performance by Category
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {data.map((category, index) => (
          <div key={category.category} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--muted-foreground)" }}>{category.category}</span>
              <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{category.percentage}%</span>
            </div>
            <div
              style={{
                height: "2rem",
                width: "100%",
                borderRadius: "0.375rem",
                backgroundColor: "var(--muted)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${category.percentage}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                  borderRadius: "0.375rem",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function QuestionsChart({ data }: { data: CategoryData[] }) {
  const chartData = data.map(item => ({
    name: item.category,
    value: item.questions,
    correct: item.correct
  }))

  return (
    <Card style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>
        Questions by Category
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}

function ActivityChart({ data }: { data: ActivityData[] }) {
  return (
    <Card style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>
        Recent Activity Scores
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

function BehavioralMetricsChart({ data }: { data: BehavioralData[] }) {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    confidence: item.confidence_score,
    eyeContact: item.eye_contact_score,
    posture: item.posture_score,
    speech: item.speech_clarity
  }))

  return (
    <Card style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>
        Behavioral Interview Performance
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Line type="monotone" dataKey="confidence" stroke={BEHAVIORAL_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} name="Confidence" />
          <Line type="monotone" dataKey="eyeContact" stroke={BEHAVIORAL_COLORS[1]} strokeWidth={2} dot={{ r: 4 }} name="Eye Contact" />
          <Line type="monotone" dataKey="posture" stroke={BEHAVIORAL_COLORS[2]} strokeWidth={2} dot={{ r: 4 }} name="Posture" />
          <Line type="monotone" dataKey="speech" stroke={BEHAVIORAL_COLORS[3]} strokeWidth={2} dot={{ r: 4 }} name="Speech" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: BEHAVIORAL_COLORS[0], borderRadius: "2px" }} />
          <span style={{ color: "var(--muted-foreground)" }}>Confidence</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: BEHAVIORAL_COLORS[1], borderRadius: "2px" }} />
          <span style={{ color: "var(--muted-foreground)" }}>Eye Contact</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: BEHAVIORAL_COLORS[2], borderRadius: "2px" }} />
          <span style={{ color: "var(--muted-foreground)" }}>Posture</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: BEHAVIORAL_COLORS[3], borderRadius: "2px" }} />
          <span style={{ color: "var(--muted-foreground)" }}>Speech Clarity</span>
        </div>
      </div>
    </Card>
  )
}

// Main Dashboard Component
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [behavioralData, setBehavioralData] = useState<BehavioralData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch all dashboard data in parallel
        const [statsRes, progressRes, categoryRes, activityRes, behavioralRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/progress'),
          fetch('/api/dashboard/categories'),
          fetch('/api/dashboard/activity'),
          fetch('/api/dashboard/behavioral')
        ])

        if (!statsRes.ok || !progressRes.ok || !categoryRes.ok || !activityRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const [statsData, progressData, categoryData, activityData, behavioralData] = await Promise.all([
          statsRes.json(),
          progressRes.json(),
          categoryRes.json(),
          activityRes.json(),
          behavioralRes.ok ? behavioralRes.json() : Promise.resolve([])
        ])

        setStats(statsData)
        setProgressData(progressData)
        setCategoryData(categoryData)
        setActivityData(activityData)
        setBehavioralData(behavioralData || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "1rem" }}>Loading dashboard...</div>
    </div>
    )
  }

  if (error) {
    return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "1rem", color: "var(--destructive)" }}>Error: {error}</div>
    </div>
    )
  }

  if (!stats) {
    return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "1rem" }}>No data available</div>
    </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)", padding: "1rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--foreground)" }}>Interview Practice Dashboard</h1>

          <MetricCards stats={stats} />

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <ProgressChart data={progressData} />
            <SessionsChart data={progressData} />
          </div>

          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <CategoryPerformanceChart data={categoryData} />
            <QuestionsChart data={categoryData} />
            <ActivityChart data={activityData} />
          </div>

          {behavioralData.length > 0 && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <BehavioralMetricsChart data={behavioralData} />
              <Card style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "oklch(0.98 0 0)", marginBottom: "1rem" }}>
                  Recent Behavioral Interview Feedback
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {behavioralData.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "1rem",
                        backgroundColor: "var(--card)",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>
                          Score: {Math.round((item.confidence_score + item.eye_contact_score + item.posture_score + item.speech_clarity) / 4)}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--foreground)", marginBottom: "0.75rem" }}>
                        {item.overall_feedback}
                      </p>
                      {item.improvements.length > 0 && (
                        <div>
                          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
                            Key Improvements:
                          </p>
                          <ul style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", paddingLeft: "1.5rem" }}>
                            {item.improvements.slice(0, 3).map((improvement, idx) => (
                              <li key={idx} style={{ marginBottom: "0.25rem" }}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
      </div>
    </div>
  )
}
