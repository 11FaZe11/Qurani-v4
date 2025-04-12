import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Quran Player - Listen to the Holy Quran",
  description: "A beautiful Quran player with all 114 surahs",
    generator: 'v0.dev'
}

import ClientLayout from "./client-layout"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'