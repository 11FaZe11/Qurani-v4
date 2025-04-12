"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { useTheme } from "next-themes"
import { BookOpen } from "lucide-react"

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 200)

    // When progress reaches 100%, start fade out
    if (progress >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        setIsVisible(false)
      }, 500) // Wait 500ms before starting fade out
    }

    return () => clearInterval(interval)
  }, [progress])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500",
        progress >= 100 ? "opacity-0" : "opacity-100",
        isDark ? "bg-gray-900" : "bg-white",
      )}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Logo animation */}
        <div className="relative">
          <div
            className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center animate-pulse",
              isDark ? "bg-emerald-900" : currentTheme.primaryLight,
            )}
          >
            <BookOpen
              className={cn("h-12 w-12 animate-bounce", isDark ? "text-emerald-400" : currentTheme.textPrimary)}
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full text-center">
            <span className={cn("text-lg font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
              Quran Player
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out",
              isDark ? "bg-emerald-500" : currentTheme.primary,
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text */}
        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
          {progress < 100 ? "Loading Quran Player..." : "Ready!"}
        </p>
      </div>

      {/* Quranic verse or hadith at the bottom */}
      <div className="absolute bottom-8 left-0 right-0 text-center px-4">
        <p className={cn("italic text-sm max-w-md mx-auto", isDark ? "text-gray-400" : "text-gray-500")}>
          "Indeed, We have sent down to you the Book in truth." (Quran 39:2)
        </p>
      </div>
    </div>
  )
}
