"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type LanguageOption = "mixed" | "arabic" | "english"

type LanguageContextType = {
  language: LanguageOption
  setLanguage: (language: LanguageOption) => void
}

const LanguageContext = createContext<LanguageContextType>({
  language: "mixed",
  setLanguage: () => {},
})

export const useLanguage = () => useContext(LanguageContext)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageOption>("mixed")

  // Load saved language preference from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language_preference") as LanguageOption
      if (savedLanguage && ["mixed", "arabic", "english"].includes(savedLanguage)) {
        setLanguageState(savedLanguage)
      }
    }
  }, [])

  // Save language preference to localStorage when it changes
  const setLanguage = (newLanguage: LanguageOption) => {
    setLanguageState(newLanguage)
    if (typeof window !== "undefined") {
      localStorage.setItem("language_preference", newLanguage)
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}
