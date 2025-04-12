"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Calendar, FileText, BookOpen } from "lucide-react"

export default function IslamicResourcesPage() {
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
          Islamic Resources
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className={cn(isDark && "bg-gray-800 border-gray-700")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center mb-4",
                    isDark ? "bg-emerald-900" : "bg-emerald-100",
                  )}
                >
                  <Calendar className={cn("h-8 w-8", isDark ? "text-emerald-400" : "text-emerald-700")} />
                </div>
                <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-emerald-400" : "text-emerald-800")}>
                  Hijri Calendar
                </h3>
                <p className={cn("mb-6", isDark ? "text-gray-300" : "text-gray-600")}>
                  View the Islamic Hijri calendar to track important Islamic dates and events throughout the year.
                </p>
                <Button
                  asChild
                  className={cn(isDark ? "bg-emerald-700 hover:bg-emerald-800" : "bg-emerald-600 hover:bg-emerald-700")}
                >
                  <Link href="/calendar">View Calendar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(isDark && "bg-gray-800 border-gray-700")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center mb-4",
                    isDark ? "bg-emerald-900" : "bg-emerald-100",
                  )}
                >
                  <FileText className={cn("h-8 w-8", isDark ? "text-emerald-400" : "text-emerald-700")} />
                </div>
                <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-emerald-400" : "text-emerald-800")}>
                  Daily Hadiths
                </h3>
                <p className={cn("mb-6", isDark ? "text-gray-300" : "text-gray-600")}>
                  Explore a collection of authentic hadiths for each day of the week to gain wisdom from the Prophet's
                  teachings.
                </p>
                <Button
                  asChild
                  className={cn(isDark ? "bg-emerald-700 hover:bg-emerald-800" : "bg-emerald-600 hover:bg-emerald-700")}
                >
                  <Link href="/hadith">View Hadiths</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(isDark && "bg-gray-800 border-gray-700")}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center mb-4",
                    isDark ? "bg-emerald-900" : "bg-emerald-100",
                  )}
                >
                  <BookOpen className={cn("h-8 w-8", isDark ? "text-emerald-400" : "text-emerald-700")} />
                </div>
                <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-emerald-400" : "text-emerald-800")}>
                  Prayer Guide
                </h3>
                <p className={cn("mb-6", isDark ? "text-gray-300" : "text-gray-600")}>
                  Learn how to perform ablution and prayer correctly with our step-by-step guide and check prayer times
                  for your location.
                </p>
                <Button
                  asChild
                  className={cn(isDark ? "bg-emerald-700 hover:bg-emerald-800" : "bg-emerald-600 hover:bg-emerald-700")}
                >
                  <Link href="/prayer-guide">View Prayer Guide</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className={cn("text-2xl font-bold mb-4", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
            Additional Resources
          </h2>
          <p className={cn("max-w-2xl mx-auto mb-6", isDark ? "text-gray-300" : "text-gray-600")}>
            Our app provides a comprehensive set of tools and resources to help you in your spiritual journey. Explore
            the Quran with beautiful recitations, use the digital Tasbih counter for dhikr, and learn more about Islamic
            practices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline" className={cn(isDark && "border-gray-700 hover:bg-gray-800 text-white")}>
              <Link href="/quran">Quran Reader</Link>
            </Button>
            <Button asChild variant="outline" className={cn(isDark && "border-gray-700 hover:bg-gray-800 text-white")}>
              <Link href="/tasbih">Digital Tasbih</Link>
            </Button>
            <Button asChild variant="outline" className={cn(isDark && "border-gray-700 hover:bg-gray-800 text-white")}>
              <Link href="/about">About</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
