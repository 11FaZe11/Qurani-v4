"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { fetchSurah, type QuranSurah, type QuranVerse } from "@/lib/quran-text"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/contexts/player-context"
import { surahList } from "@/lib/surah-list"

interface SurahDisplayProps {
  surahNumber: number
}

export function SurahDisplay({ surahNumber }: SurahDisplayProps) {
  const [surah, setSurah] = useState<QuranSurah | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { language } = useLanguage()
  const router = useRouter()

  // Get player context
  const { currentSurah, isPlaying, togglePlayPause, setCurrentSurah } = usePlayer()

  // Check if this surah is currently playing
  const isCurrentlyPlaying = currentSurah.number === surahNumber && isPlaying

  useEffect(() => {
    async function loadSurah() {
      try {
        setIsLoading(true)
        setError(null)
        const surahData = await fetchSurah(surahNumber)
        setSurah(surahData)
      } catch (err) {
        console.error("Failed to load surah:", err)
        setError("Failed to load surah. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadSurah()
  }, [surahNumber])

  // Handle play/pause button click
  const handlePlayPauseClick = () => {
    // If this is not the current surah, set it as current
    if (currentSurah.number !== surahNumber) {
      const surahToPlay = surahList.find((s) => s.number === surahNumber)
      if (surahToPlay) {
        setCurrentSurah(surahToPlay)
        // If not playing, start playing
        if (!isPlaying) {
          setTimeout(() => togglePlayPause(), 100)
        }
      }
    } else {
      // If this is already the current surah, just toggle play/pause
      togglePlayPause()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className={cn("h-12 w-full", isDark && "bg-gray-800")} />
        <Skeleton className={cn("h-8 w-3/4 mx-auto", isDark && "bg-gray-800")} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-24 w-full", isDark && "bg-gray-800")} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!surah) {
    return null
  }

  // Add Bismillah except for Surah 9 (At-Tawbah)
  const showBismillah = surah.number !== 9

  return (
    <div className="space-y-6">
      {/* Surah header */}
      <div className="text-center space-y-2">
        {(language === "arabic" || language === "mixed") && (
          <h1 className={cn("text-3xl font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
            {surah.name}
          </h1>
        )}
        {(language === "english" || language === "mixed") && (
          <h2 className={cn("text-xl", isDark ? "text-gray-300" : "text-gray-600")}>
            {surah.englishName} - {surah.englishNameTranslation}
          </h2>
        )}
        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
          {surah.numberOfAyahs} {language === "arabic" ? "آية" : "Verses"} • {surah.revelationType}
        </p>

        {/* Play/Pause button */}
        <div className="mt-4">
          <Button
            onClick={handlePlayPauseClick}
            className={cn(isDark ? "bg-emerald-700 hover:bg-emerald-800" : currentTheme.primary)}
          >
            {isCurrentlyPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Recitation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Listen to Surah
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bismillah */}
      {showBismillah && (language === "arabic" || language === "mixed") && (
        <div className="text-center my-6">
          <p className={cn("text-2xl font-quran", isDark && "text-emerald-300")} dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-4 pb-20">
        {" "}
        {/* Add padding at bottom for mini-player */}
        {surah.verses.map((verse) => (
          <VerseDisplay key={verse.number} verse={verse} />
        ))}
      </div>
    </div>
  )

  function VerseDisplay({ verse }: { verse: QuranVerse }) {
    return (
      <Card className={cn("overflow-hidden", isDark && "bg-gray-800 border-gray-700")}>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-2">
            {(language === "arabic" || language === "mixed") && (
              <div className="flex items-start">
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1",
                    isDark
                      ? "bg-emerald-900 text-emerald-400"
                      : cn(currentTheme.primaryLight, currentTheme.textPrimary),
                  )}
                >
                  <span className="text-sm font-medium">{verse.number}</span>
                </div>
                <p className={cn("text-xl leading-relaxed font-quran", isDark && "text-gray-200")} dir="rtl">
                  {verse.text}
                </p>
              </div>
            )}

            {(language === "english" || language === "mixed") && verse.translation && (
              <div
                className={cn(language === "mixed" ? "mt-2 pl-11" : "mt-0", isDark ? "text-gray-300" : "text-gray-600")}
              >
                {language === "english" && (
                  <div className="flex items-start mb-2">
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3",
                        isDark
                          ? "bg-emerald-900 text-emerald-400"
                          : cn(currentTheme.primaryLight, currentTheme.textPrimary),
                      )}
                    >
                      <span className="text-sm font-medium">{verse.number}</span>
                    </div>
                  </div>
                )}
                {verse.translation}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
}
