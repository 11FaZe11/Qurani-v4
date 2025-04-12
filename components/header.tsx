"use client"

import Link from "next/link"
import { Menu, X, BookOpen } from "lucide-react"
import { useState, Suspense } from "react"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { ThemeSwitch } from "@/components/theme-switch"
import { useTheme } from "next-themes"
import { HeaderNavLinks } from "./header-nav-links"
import { LanguageSelector } from "./language-selector"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <header
      className={cn(
        "border-b sticky top-0 z-50 transition-colors duration-300",
        isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center space-x-2">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              isDark ? "bg-emerald-900" : currentTheme.primaryLight,
            )}
          >
            <BookOpen className={cn("h-4 w-4", isDark ? "text-emerald-400" : currentTheme.textPrimary)} />
          </div>
          <span className={cn("font-bold", isDark ? "text-white" : currentTheme.textPrimary)}>Quran Player</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Suspense
            fallback={
              <div className="flex space-x-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            }
          >
            <HeaderNavLinks />
          </Suspense>
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <ThemeSwitch />
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <LanguageSelector />
          <ThemeSwitch />
          <button
            className={cn("p-2 rounded-md", isDark ? "hover:bg-gray-800" : "hover:bg-gray-100")}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={cn("h-6 w-6", isDark ? "text-gray-300" : "text-gray-600")} />
            ) : (
              <Menu className={cn("h-6 w-6", isDark ? "text-gray-300" : "text-gray-600")} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div
          className={cn(
            "md:hidden border-b transition-colors duration-300",
            isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white",
          )}
        >
          <Suspense
            fallback={
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            }
          >
            <HeaderNavLinks isMobile onClickMobile={() => setIsMenuOpen(false)} />
          </Suspense>
        </div>
      )}
    </header>
  )
}
