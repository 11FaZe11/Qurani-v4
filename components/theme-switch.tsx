"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
        <div className="h-5 w-5 opacity-50" />
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn("w-9 h-9 rounded-full relative overflow-hidden", "transition-colors duration-300")}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          "h-5 w-5 absolute",
          "transition-all duration-500",
          resolvedTheme === "dark" ? "opacity-0 rotate-90 translate-y-2" : "opacity-100 rotate-0 translate-y-0",
          "text-emerald-600",
        )}
      />

      <Moon
        className={cn(
          "h-5 w-5 absolute",
          "transition-all duration-500",
          resolvedTheme === "dark" ? "opacity-100 rotate-0 translate-y-0" : "opacity-0 -rotate-90 -translate-y-2",
          "text-emerald-400",
        )}
      />
    </Button>
  )
}
