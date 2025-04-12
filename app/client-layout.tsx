"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { ThemeProvider as AppThemeProvider } from "@/contexts/theme-context"
import { LanguageProvider } from "@/contexts/language-context"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { IslamAIChat } from "@/components/islam-ai-chat"
import { AppInitializer } from "@/components/app-initializer"
import { PlayerProvider } from "@/contexts/player-context"
import { MiniPlayer } from "@/components/mini-player"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AppThemeProvider>
            <LanguageProvider>
              <PlayerProvider>
                <AppInitializer>
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <ClientMiniPlayer />
                  </div>
                  <IslamAIChat />
                  <Toaster />
                </AppInitializer>
              </PlayerProvider>
            </LanguageProvider>
          </AppThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

// Client component to handle pathname check
function ClientMiniPlayer() {
  const pathname = usePathname()
  // Don't show mini-player on home page
  if (pathname === "/") return null
  return <MiniPlayer />
}
