"use client"

import { TasbihCounter } from "@/components/tasbih-counter"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function TasbihPage() {
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
          Digital Tasbih
        </h1>
        <TasbihCounter />
      </div>
    </div>
  )
}
