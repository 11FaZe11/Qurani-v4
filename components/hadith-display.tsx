"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"

interface Hadith {
  id: number
  arabic: string
  english: string
  source: string
  narrator: string
}

export function HadithDisplay() {
  const { currentTheme } = useAppTheme()
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({})
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { toast } = useToast()
  const { language } = useLanguage()

  // Get current day of the week
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const currentDay = days[new Date().getDay()]

  // State for AI-generated hadiths
  const [hadiths, setHadiths] = useState<Record<string, Hadith[]>>({})
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<Record<string, string | null>>({})

  // Fetch hadiths for a specific day
  const fetchHadithsForDay = async (day: string) => {
    // If we already have hadiths for this day, don't fetch again
    if (hadiths[day] && hadiths[day].length > 0) {
      return
    }

    setIsLoading((prev) => ({ ...prev, [day]: true }))
    setError((prev) => ({ ...prev, [day]: null }))

    try {
      // Format the prompt for the AI
      const prompt = `Please provide 3 authentic hadiths for ${day}. For each hadith, include:
      1. The Arabic text
      2. English translation
      3. Source (e.g., Sahih Bukhari, Sahih Muslim)
      4. Narrator
      
      Format the response as a JSON array with objects containing 'arabic', 'english', 'source', and 'narrator' fields. Only include authentic hadiths from reliable sources.`

      // Call the Gemini API
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAfKQN2Jb1YVEWfPt9IxweKrHF928rL59c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to get hadiths: ${response.status}`)
      }

      const data = await response.json()

      // Extract the response text
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("Could not parse hadiths from AI response")
      }

      // Parse the JSON
      const parsedHadiths = JSON.parse(jsonMatch[0])

      // Add IDs to the hadiths
      const hadithsWithIds = parsedHadiths.map((hadith: any, index: number) => ({
        ...hadith,
        id: index + 1,
      }))

      // Update state
      setHadiths((prev) => ({ ...prev, [day]: hadithsWithIds }))
    } catch (error) {
      console.error(`Error fetching hadiths for ${day}:`, error)
      setError((prev) => ({ ...prev, [day]: "Failed to load hadiths. Please try again." }))
      toast({
        title: "Error",
        description: `Failed to load hadiths for ${day}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [day]: false }))
    }
  }

  // Fetch hadiths for the current day on component mount
  useEffect(() => {
    fetchHadithsForDay(currentDay)
  }, [currentDay])

  // Handle tab change
  const handleTabChange = (day: string) => {
    fetchHadithsForDay(day)
  }

  const toggleTranslation = (id: number) => {
    setShowTranslations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const renderHadith = (hadith: Hadith) => {
    const showTranslation = showTranslations[hadith.id] || false

    return (
      <Card key={hadith.id} className={cn("mb-4", isDark && "bg-gray-800 border-gray-700")}>
        <CardContent className="pt-6">
          {/* Show Arabic text based on language preference */}
          {(language === "mixed" || language === "arabic") && (
            <div className="mb-4">
              <p className={cn("text-right text-lg leading-relaxed", isDark && "text-gray-200")} dir="rtl">
                {hadith.arabic}
              </p>
            </div>
          )}

          {/* Show English translation based on language preference */}
          {language === "english" && (
            <div className="mb-4">
              <p className={cn(isDark ? "text-gray-300" : "text-gray-700")}>{hadith.english}</p>
              <div className={cn("mt-2 text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                <p>Source: {hadith.source}</p>
                <p>Narrator: {hadith.narrator}</p>
              </div>
            </div>
          )}

          {/* Show translation toggle button only in mixed mode */}
          {language === "mixed" && (
            <>
              {showTranslation && (
                <div className={cn("mt-4 pt-4 border-t", isDark ? "border-gray-700" : "")}>
                  <p className={cn(isDark ? "text-gray-300" : "text-gray-700")}>{hadith.english}</p>
                  <div className={cn("mt-2 text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    <p>Source: {hadith.source}</p>
                    <p>Narrator: {hadith.narrator}</p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleTranslation(hadith.id)}
                className={cn("mt-4", isDark && "border-gray-700 hover:bg-gray-700 text-gray-300")}
              >
                {showTranslation ? "Hide Translation" : "Show Translation"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderDayContent = (day: string) => {
    if (isLoading[day]) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2
            className={cn("h-8 w-8 animate-spin mb-4", isDark ? "text-emerald-400" : currentTheme.textPrimary)}
          />
          <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>Loading hadiths for {day}...</p>
        </div>
      )
    }

    if (error[day]) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error[day]}</p>
          <Button
            onClick={() => fetchHadithsForDay(day)}
            className={cn(isDark ? "bg-emerald-700 hover:bg-emerald-800" : currentTheme.primary)}
          >
            Try Again
          </Button>
        </div>
      )
    }

    if (!hadiths[day] || hadiths[day].length === 0) {
      return (
        <div className="text-center py-8">
          <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>No hadiths available for {day}.</p>
          <Button
            onClick={() => fetchHadithsForDay(day)}
            className={cn("mt-4", isDark ? "bg-emerald-700 hover:bg-emerald-800" : currentTheme.primary)}
          >
            Load Hadiths
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3
          className={cn(
            "text-xl font-semibold mb-4 capitalize",
            isDark ? "text-emerald-400" : currentTheme.textSecondary,
          )}
        >
          {day}'s Hadiths
        </h3>

        {hadiths[day].map((hadith) => renderHadith(hadith))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className={cn("text-2xl font-bold mb-6 text-center", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
        Daily Hadiths
      </h2>

      <Tabs defaultValue={currentDay} className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-7 mb-6">
          {days.map((day) => (
            <TabsTrigger key={day} value={day} className="capitalize">
              {day.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => (
          <TabsContent key={day} value={day}>
            {renderDayContent(day)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
