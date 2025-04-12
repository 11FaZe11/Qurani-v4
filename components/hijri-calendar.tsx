"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { HijriDate } from "@/lib/hijri-date"
import { useTheme } from "next-themes"

export function HijriCalendar() {
  const [currentDate, setCurrentDate] = useState(new HijriDate())
  const [calendarDays, setCalendarDays] = useState<
    Array<{ date: number; month: number; year: number; isCurrentMonth: boolean }>
  >([])
  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Generate calendar days for the current month
  useEffect(() => {
    const days = []
    const daysInMonth = HijriDate.getDaysInMonth(currentDate.year, currentDate.month)

    // Get the first day of the month
    const firstDay = new HijriDate(currentDate.year, currentDate.month, 1)
    const startingDayOfWeek = firstDay.day

    // Add days from previous month to fill the first row
    const prevMonth = currentDate.month === 1 ? 12 : currentDate.month - 1
    const prevYear = currentDate.month === 1 ? currentDate.year - 1 : currentDate.year
    const daysInPrevMonth = HijriDate.getDaysInMonth(prevYear, prevMonth)

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.unshift({
        date: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      })
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        month: currentDate.month,
        year: currentDate.year,
        isCurrentMonth: true,
      })
    }

    // Add days from next month to complete the grid
    const nextMonth = currentDate.month === 12 ? 1 : currentDate.month + 1
    const nextYear = currentDate.month === 12 ? currentDate.year + 1 : currentDate.year
    const remainingDays = 42 - days.length // 6 rows of 7 days

    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      })
    }

    setCalendarDays(days)
  }, [currentDate])

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      if (prev.month === 1) {
        return new HijriDate(prev.year - 1, 12, 1)
      } else {
        return new HijriDate(prev.year, prev.month - 1, 1)
      }
    })
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      if (prev.month === 12) {
        return new HijriDate(prev.year + 1, 1, 1)
      } else {
        return new HijriDate(prev.year, prev.month + 1, 1)
      }
    })
  }

  const today = new HijriDate()

  return (
    <Card className={cn("w-full max-w-md mx-auto", isDark && "bg-gray-800 border-gray-700")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className={cn("text-center", isDark && "text-white")}>
            <div className="flex flex-col items-center">
              <span className="text-lg">
                {currentDate.getMonthName("en")} {currentDate.year}
              </span>
              <span className={cn("text-sm", isDark ? "text-gray-400" : "text-muted-foreground")}>
                {currentDate.getMonthName("ar")}
              </span>
            </div>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div
              key={day}
              className={cn(
                "text-center text-sm font-medium py-1",
                index === 5 && "text-emerald-500", // Friday
                isDark && index !== 5 && "text-gray-300",
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isToday = day.date === today.date && day.month === today.month && day.year === today.year

            return (
              <div
                key={index}
                className={cn(
                  "h-9 flex items-center justify-center rounded-md text-sm",
                  !day.isCurrentMonth && isDark ? "text-gray-600 opacity-50" : "text-muted-foreground opacity-50",
                  isToday &&
                    (isDark ? "bg-emerald-700 text-white font-bold" : `${currentTheme.primary} text-white font-bold`),
                  day.isCurrentMonth && !isToday && "hover:bg-accent cursor-pointer",
                  isDark && day.isCurrentMonth && !isToday && "text-gray-300 hover:bg-gray-700",
                )}
              >
                {day.date}
              </div>
            )
          })}
        </div>

        {/* Today's date display */}
        <div className="mt-4 text-center">
          <div className={cn("inline-block px-4 py-2 rounded-md", isDark ? "bg-gray-700" : currentTheme.primaryLight)}>
            <div className={cn("text-sm font-medium", isDark && "text-gray-300")}>Today</div>
            <div className="flex flex-col items-center gap-1">
              <span className={cn("text-lg font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                {today.date} {today.getMonthName("en")} {today.year}
              </span>
              <span className={cn("text-sm text-right", isDark ? "text-gray-400" : "")} dir="rtl">
                {today.date} {today.getMonthName("ar")} {today.year}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
