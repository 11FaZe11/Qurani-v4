"use client"

import { HijriCalendar } from "@/components/hijri-calendar"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function CalendarPage() {
  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-4rem)] py-8 px-4",
        isDark ? "bg-gradient-to-b from-gray-900 to-gray-800" : `bg-gradient-to-b ${currentTheme.gradient}`,
      )}
    >
      <div className="max-w-6xl mx-auto">
        <h1
          className={cn("text-3xl font-bold mb-8 text-center", isDark ? "text-emerald-400" : currentTheme.textPrimary)}
        >
          Hijri Calendar
        </h1>
        <div className="flex justify-center">
          <HijriCalendar />
        </div>
        <div className="mt-8 max-w-2xl mx-auto text-center">
          <h2 className={cn("text-xl font-semibold mb-4", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
            About the Hijri Calendar
          </h2>
          <p className={cn("mb-4", isDark ? "text-gray-300" : "text-gray-600")}>
            The Hijri calendar is a lunar calendar consisting of 12 lunar months in a year of 354 or 355 days. It is
            used to determine Islamic holidays and rituals, such as the annual period of fasting and the proper time for
            the Hajj pilgrimage.
          </p>
          <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
            The calendar begins with the emigration of Muhammad from Mecca to Medina in 622 CE, known as the Hijra. The
            current year in the Islamic calendar is 1445 AH (Anno Hegirae).
          </p>
        </div>
      </div>
    </div>
  )
}
