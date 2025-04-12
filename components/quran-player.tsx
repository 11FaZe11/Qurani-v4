"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  User,
  AlertCircle,
  BookOpen,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { surahList, reciters } from "@/lib/surah-list"
import { useRouter } from "next/navigation"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import { useMobile } from "@/hooks/use-mobile"
import { usePlayer } from "@/contexts/player-context"

interface QuranPlayerProps {
  initialSurahNumber?: number
}

export default function QuranPlayer({ initialSurahNumber }: QuranPlayerProps) {
  // Get player context
  const {
    currentSurah,
    isPlaying,
    progress,
    duration,
    volume,
    selectedReciter,
    setCurrentSurah,
    togglePlayPause,
    setProgress,
    setVolume,
    setSelectedReciter,
    playNextSurah,
    playPreviousSurah,
    isAudioLoading,
    audioError,
  } = usePlayer()

  const [searchQuery, setSearchQuery] = useState("")
  const [isDownloading, setIsDownloading] = useState(false)

  const router = useRouter()
  const { currentTheme } = useAppTheme()
  const { toast } = useToast()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const isMobile = useMobile()

  // Set initial surah if provided
  useEffect(() => {
    if (initialSurahNumber) {
      const surah = surahList.find((s) => s.number === initialSurahNumber)
      if (surah) {
        setCurrentSurah(surah)
      }
    }
  }, [initialSurahNumber, setCurrentSurah])

  // Filter surahs based on search query
  const filteredSurahs = surahList.filter(
    (surah) =>
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString().includes(searchQuery),
  )

  // Get audio URL for current surah and selected reciter
  const getAudioUrl = (surah: typeof currentSurah, reciter: typeof selectedReciter) => {
    try {
      const paddedNumber = surah.number.toString().padStart(3, "0")
      const formattedUrl = `${reciter.baseUrl}${reciter.filePattern.replace("{surahNumber}", paddedNumber)}`
      return formattedUrl
    } catch (error) {
      console.error("Error generating audio URL:", error)
      return ""
    }
  }

  const handleSurahSelect = (surah: (typeof surahList)[0]) => {
    setCurrentSurah(surah)

    // Start playing
    if (!isPlaying) {
      togglePlayPause()
    }

    // Navigate to the Quran page with the selected surah
    router.push(`/quran?surah=${surah.number}`)
  }

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const handleReciterChange = (reciterId: string) => {
    const reciter = reciters.find((r) => r.id === reciterId) || reciters[0]
    setSelectedReciter(reciter)
  }

  const downloadSurah = async () => {
    try {
      setIsDownloading(true)

      // Get audio URL
      const audioUrl = getAudioUrl(currentSurah, selectedReciter)

      // Create a temporary anchor element
      const link = document.createElement("a")
      link.href = audioUrl
      link.download = `${currentSurah.englishName}_${selectedReciter.name}.mp3`

      // Append to the document
      document.body.appendChild(link)

      // Trigger the download
      link.click()

      // Clean up
      document.body.removeChild(link)

      toast({
        title: "Download Started",
        description: `${currentSurah.englishName} by ${selectedReciter.name} is downloading.`,
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading the audio file.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Add a retry mechanism for audio playback
  const retryAudio = () => {
    // Just toggle play/pause twice to retry
    if (!isPlaying) {
      togglePlayPause()
    } else {
      togglePlayPause()
      setTimeout(() => togglePlayPause(), 100)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar with surah list */}
      <div
        className={cn(
          "w-full md:w-80 border-r flex flex-col transition-colors duration-300",
          isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white",
        )}
      >
        <div
          className={cn("p-4 border-b transition-colors duration-300", isDark ? "border-gray-800" : "border-gray-200")}
        >
          <h1 className={cn("text-2xl font-bold text-center", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
            القرآن الكريم
          </h1>
          <p className={cn("text-center mb-4", isDark ? "text-gray-300" : "text-gray-600")}>The Holy Quran</p>
          <div className="relative">
            <Search className={cn("absolute left-2.5 top-2.5 h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
            <Input
              type="search"
              placeholder="Search surah..."
              className={cn("pl-8", isDark && "bg-gray-800 border-gray-700 text-white")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => handleSurahSelect(surah)}
                className={cn(
                  "w-full text-left p-3 rounded-md mb-1 transition-colors",
                  currentSurah.number === surah.number
                    ? isDark
                      ? "bg-gray-800"
                      : cn(currentTheme.accent)
                    : isDark
                      ? "hover:bg-gray-800"
                      : "hover:bg-gray-50",
                )}
              >
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-medium mr-3",
                      isDark
                        ? "bg-emerald-900 text-emerald-400"
                        : cn(currentTheme.primaryLight, currentTheme.textPrimary),
                    )}
                  >
                    {surah.number}
                  </div>
                  <div className="flex-1">
                    <div className={cn("font-medium", isDark ? "text-white" : "text-gray-800")}>
                      {surah.englishName}
                    </div>
                    <div className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                      {surah.name} • {surah.numberOfAyahs} verses
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main content with player */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-colors duration-300",
          isDark ? "bg-gray-900" : "bg-white",
          isMobile && "pb-32", // Add padding at the bottom on mobile to account for fixed controls
        )}
      >
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8">
              <h2 className={cn("text-4xl font-bold mb-2", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                {currentSurah.name}
              </h2>
              <h3 className={cn("text-xl mb-1", isDark ? "text-gray-200" : "text-gray-700")}>
                {currentSurah.englishName}
              </h3>
              <p className={cn(isDark ? "text-gray-400" : "text-gray-500")}>
                {currentSurah.englishNameTranslation} • {currentSurah.numberOfAyahs} Verses
              </p>
            </div>

            {/* Reciter selector */}
            <div className="mb-6 max-w-xs mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <User className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                <span className={cn(isDark ? "text-gray-300" : "text-gray-600")}>Select Reciter</span>
              </div>
              <Select value={selectedReciter.id} onValueChange={handleReciterChange}>
                <SelectTrigger className={cn(isDark && "bg-gray-800 border-gray-700 text-white")}>
                  <SelectValue placeholder="Select a reciter" />
                </SelectTrigger>
                <SelectContent className={cn(isDark && "bg-gray-800 border-gray-700 text-white")}>
                  {reciters.map((reciter) => (
                    <SelectItem key={reciter.id} value={reciter.id}>
                      <div className="flex flex-col">
                        <span>{reciter.name}</span>
                        {reciter.arabicName && (
                          <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                            {reciter.arabicName}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedReciter.description && (
                <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                  {selectedReciter.description}
                </p>
              )}
            </div>

            {/* Error message */}
            {audioError && (
              <Alert variant="destructive" className="mb-4 mx-auto max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="flex flex-col">
                  <span>{audioError}</span>
                  <Button variant="outline" size="sm" onClick={retryAudio} className="mt-2 self-start">
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div
              className={cn(
                "w-64 h-64 mx-auto mb-8 rounded-full border-8 flex items-center justify-center",
                isDark ? "bg-gray-800 border-gray-700" : cn(currentTheme.accent, "border-emerald-100"),
              )}
            >
              <div className={cn("text-6xl font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                {currentSurah.number}
              </div>
            </div>

            {/* Download button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("rounded-full", isDark && "border-gray-700 hover:bg-gray-800 text-white")}
                    onClick={downloadSurah}
                    disabled={isDownloading}
                  >
                    <Download
                      className={cn("h-5 w-5 mr-2", isDark ? "text-emerald-400" : currentTheme.textSecondary)}
                    />
                    {isDownloading ? "Downloading..." : "Download Surah"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Download {currentSurah.englishName} recited by {selectedReciter.name}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* View Surah Text button */}
            <Button
              variant="outline"
              className={cn("rounded-full mt-2", isDark && "border-gray-700 hover:bg-gray-800 text-white")}
              onClick={() => router.push(`/quran?surah=${currentSurah.number}`)}
            >
              <BookOpen className={cn("h-5 w-5 mr-2", isDark ? "text-emerald-400" : currentTheme.textSecondary)} />
              View Surah Text
            </Button>
          </div>
        </div>

        {/* Player controls */}
        <div
          className={cn(
            "border-t p-6 transition-colors duration-300",
            isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white",
            isMobile && "fixed bottom-0 left-0 right-0 z-10", // Make it sticky on mobile
          )}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{formatTime(progress)}</span>
              <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[progress]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="mb-6"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className={cn("h-5 w-5", isDark ? "text-gray-400" : "text-gray-500")} />
                <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-24" />
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={playPreviousSurah}
                  className={cn("rounded-full", isDark && "border-gray-700 hover:bg-gray-800 text-white")}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  onClick={togglePlayPause}
                  disabled={isAudioLoading}
                  className={cn(
                    "w-14 h-14 rounded-full hover:opacity-90",
                    isDark ? "bg-emerald-700" : currentTheme.primary,
                  )}
                >
                  {isAudioLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={playNextSurah}
                  className={cn("rounded-full", isDark && "border-gray-700 hover:bg-gray-800 text-white")}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              <div className="w-28">{/* Empty div for layout balance */}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
