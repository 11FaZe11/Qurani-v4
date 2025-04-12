"use client"

import { HadithDisplay } from "@/components/hadith-display"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function HadithPage() {
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
          Daily Hadiths
        </h1>
        <div className="mb-8 max-w-2xl mx-auto text-center">
          <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
            Hadith are the recorded sayings and actions of Prophet Muhammad (peace be upon him). They serve as a guide
            for Muslims in their daily lives, providing wisdom and practical examples of how to implement Islamic
            teachings.
          </p>
        </div>
        <HadithDisplay />
      </div>
    </div>
  )
}
