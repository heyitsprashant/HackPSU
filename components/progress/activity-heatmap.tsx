"use client"

import { cn } from "@/lib/utils"

export function ActivityHeatmap() {
  // Generate 12 weeks of activity data (simulated)
  const weeks = 12
  const daysPerWeek = 7
  const activityData: number[][] = []

  for (let week = 0; week < weeks; week++) {
    const weekData: number[] = []
    for (let day = 0; day < daysPerWeek; day++) {
      // Random activity level (0-4)
      weekData.push(Math.floor(Math.random() * 5))
    }
    activityData.push(weekData)
  }

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted"
      case 1:
        return "bg-primary/20"
      case 2:
        return "bg-primary/40"
      case 3:
        return "bg-primary/60"
      case 4:
        return "bg-primary/80"
      default:
        return "bg-muted"
    }
  }

  const getActivityLabel = (level: number) => {
    switch (level) {
      case 0:
        return "No activity"
      case 1:
        return "Light activity"
      case 2:
        return "Moderate activity"
      case 3:
        return "High activity"
      case 4:
        return "Very high activity"
      default:
        return "No activity"
    }
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {activityData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((activity, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  "h-3 w-3 rounded-sm transition-colors hover:ring-2 hover:ring-primary cursor-pointer",
                  getActivityColor(activity),
                )}
                title={`Week ${weekIndex + 1}, ${dayLabels[dayIndex]}: ${getActivityLabel(activity)}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className={cn("h-3 w-3 rounded-sm", getActivityColor(level))} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
