"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { type Theme, themes } from "@/lib/themes"

type ThemeContextType = {
  currentTheme: Theme
}

// Always use the emerald theme (first and only theme in the array)
const defaultTheme = themes[0]

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: defaultTheme,
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always use the emerald theme
  const currentTheme = defaultTheme

  return <ThemeContext.Provider value={{ currentTheme }}>{children}</ThemeContext.Provider>
}
