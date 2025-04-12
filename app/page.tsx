"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import QuranPlayer from "@/components/quran-player"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const surahParam = searchParams.get("surah")
  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    // This is just to ensure hydration is complete
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          isDark ? "bg-gradient-to-b from-gray-900 to-gray-800" : `bg-gradient-to-b ${currentTheme.gradient}`,
        )}
      >
        <div className="text-center">
          <div
            className={cn(
              "animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4",
              isDark ? "border-emerald-400" : "border-emerald-700",
            )}
          ></div>
          <p className={cn(isDark ? "text-emerald-400" : currentTheme.textPrimary)}>Loading Quran Player...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-4rem)]",
        isDark ? "bg-gradient-to-b from-gray-900 to-gray-800" : `bg-gradient-to-b ${currentTheme.gradient}`,
      )}
    >
      <QuranPlayer initialSurahNumber={surahParam ? Number.parseInt(surahParam) : undefined} />
    </div>
  )
}
