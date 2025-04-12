"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LoadingScreen } from "./loading-screen"

interface AppInitializerProps {
  children: React.ReactNode
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if this is the first load
    const hasVisited = localStorage.getItem("hasVisitedBefore")

    if (hasVisited) {
      // If user has visited before, show shorter loading time
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    } else {
      // For first-time visitors, show full loading experience
      setTimeout(() => {
        setIsLoading(false)
        localStorage.setItem("hasVisitedBefore", "true")
      }, 2500)
    }
  }, [])

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className={isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>{children}</div>
    </>
  )
}
