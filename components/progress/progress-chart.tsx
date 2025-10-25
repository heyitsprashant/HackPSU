"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

type ProgressChartProps = {
  data: Array<{
    day: string
    questions: number
    hours: number
  }>
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="day" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="questions" fill="hsl(var(--primary))" name="Questions Solved" radius={[8, 8, 0, 0]} />
        <Bar dataKey="hours" fill="hsl(var(--secondary))" name="Study Hours" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
