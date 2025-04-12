"use client"

import { usePlayer } from "@/contexts/player-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { useTheme } from "next-themes"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  ChevronDown,
  Heart,
  Share2,
  Download,
  Repeat,
  Shuffle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"

export function MiniPlayer() {
  const {
    currentSurah,
    isPlaying,
    progress,
    duration,
    volume,
    togglePlayPause,
    setProgress,
    setVolume,
    playNextSurah,
    playPreviousSurah,
    isAudioLoading,
    selectedReciter,
  } = usePlayer()

  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const isMobile = useMobile()
  const router = useRouter()

  const [isHovering, setIsHovering] = useState(false)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isShuffleOn, setIsShuffleOn] = useState(false)
  const [repeatMode, setRepeatMode] = useState(0) // 0: off, 1: repeat all, 2: repeat one

  // Close fullscreen when navigating
  useEffect(() => {
    const handleRouteChange = () => {
      setIsFullscreenOpen(false)
    }

    window.addEventListener("popstate", handleRouteChange)
    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  // Format time (e.g., 2:30)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle progress change
  const handleProgressChange = (value: number[]) => {
    setProgress(value[0])
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  // Navigate to full player
  const goToFullPlayer = () => {
    if (isMobile) {
      setIsFullscreenOpen(true)
    } else {
      router.push("/")
    }
  }

  // Toggle repeat mode
  const toggleRepeatMode = () => {
    setRepeatMode((prev) => (prev + 1) % 3)
  }

  // Toggle shuffle
  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn)
  }

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  // Share surah
  const shareSurah = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${currentSurah.englishName} - Quran Player`,
          text: `Listen to Surah ${currentSurah.englishName} (${currentSurah.name}) on Quran Player`,
          url: `${window.location.origin}/?surah=${currentSurah.number}`,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    }
  }

  // Download surah
  const downloadSurah = () => {
    // Implementation would go here
    console.log("Download surah:", currentSurah.number)
  }

  // Render mini player for desktop
  if (!isMobile) {
    return (
      <>
        {/* Hover trigger area - always visible */}
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 h-3 cursor-pointer transition-all duration-500",
            isDark
              ? "bg-gradient-to-t from-emerald-700/30 to-transparent"
              : "bg-gradient-to-t from-emerald-500/30 to-transparent",
            "hover:h-4",
          )}
          onMouseEnter={() => setIsHovering(true)}
        />

        {/* Mini player - hidden by default, shown on hover */}
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 border-t p-3 transition-all duration-700 ease-in-out transform shadow-lg",
            isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white",
            isHovering
              ? "translate-y-0 opacity-100 scale-100 shadow-md"
              : "translate-y-[95%] opacity-0 scale-98 shadow-none",
          )}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex-1 min-w-0 mr-2">
                <p className={cn("text-sm font-medium truncate", isDark ? "text-white" : "text-gray-800")}>
                  {currentSurah.englishName}
                </p>
                <p className={cn("text-xs truncate", isDark ? "text-gray-400" : "text-gray-500")}>
                  {currentSurah.name}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                  {formatTime(progress)}
                </span>
                <Slider
                  value={[progress]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleProgressChange}
                  className="w-32"
                />
                <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                  {formatTime(duration)}
                </span>

                <div className="flex items-center space-x-1 mr-2">
                  <Volume2 className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                  <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-16" />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={playPreviousSurah}
                  className={cn("h-8 w-8 rounded-full", isDark && "border-gray-700 hover:bg-gray-800 text-white")}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  disabled={isAudioLoading}
                  className={cn(
                    "h-8 w-8 rounded-full hover:opacity-90",
                    isDark ? "bg-emerald-700" : currentTheme.primary,
                  )}
                >
                  {isAudioLoading ? (
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={playNextSurah}
                  className={cn("h-8 w-8 rounded-full", isDark && "border-gray-700 hover:bg-gray-800 text-white")}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToFullPlayer}
                  className={cn("h-8 w-8 rounded-full", isDark && "border-gray-700 hover:bg-gray-800 text-white")}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Mobile version
  return (
    <>
      {/* Mini player for mobile - always visible */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t p-2 shadow-lg transition-all duration-300",
          isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white",
          isFullscreenOpen ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
        onClick={goToFullPlayer}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <p className={cn("text-sm font-medium truncate", isDark ? "text-white" : "text-gray-800")}>
              {currentSurah.englishName}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-1">
              <div
                className={cn("h-full rounded-full", isDark ? "bg-emerald-500" : "bg-emerald-600")}
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                togglePlayPause()
              }}
              disabled={isAudioLoading}
              size="sm"
              className={cn("h-8 w-8 rounded-full hover:opacity-90", isDark ? "bg-emerald-700" : currentTheme.primary)}
            >
              {isAudioLoading ? (
                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen player for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-[60] transition-all duration-500 ease-in-out",
          isDark ? "bg-gray-900" : "bg-white",
          isFullscreenOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none",
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreenOpen(false)} className="text-gray-500">
            <ChevronDown className="h-6 w-6" />
          </Button>
          <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-800")}>Now Playing</h2>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-between h-[calc(100%-8rem)] p-6">
          {/* Surah info */}
          <div className="text-center mb-8 w-full">
            <div
              className={cn(
                "w-48 h-48 mx-auto mb-6 rounded-full border-8 flex items-center justify-center",
                isDark ? "bg-gray-800 border-gray-700" : "bg-emerald-50 border-emerald-100",
              )}
            >
              <div className={cn("text-6xl font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>
                {currentSurah.number}
              </div>
            </div>
            <h2 className={cn("text-2xl font-bold mb-1", isDark ? "text-white" : "text-gray-800")}>
              {currentSurah.englishName}
            </h2>
            <h3 className={cn("text-lg mb-1", isDark ? "text-emerald-400" : "text-emerald-600")}>
              {currentSurah.name}
            </h3>
            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
              {currentSurah.englishNameTranslation} • {currentSurah.numberOfAyahs} Verses
            </p>
            <p className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-gray-500")}>
              Recited by {selectedReciter.name}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full mb-8">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="mb-2"
            />
            <div className="flex justify-between">
              <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{formatTime(progress)}</span>
              <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full">
            {/* Additional controls */}
            <div className="flex justify-center space-x-8 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleShuffle}
                className={cn(
                  "rounded-full",
                  isShuffleOn
                    ? isDark
                      ? "text-emerald-400"
                      : "text-emerald-600"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-500",
                )}
              >
                <Shuffle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRepeatMode}
                className={cn(
                  "rounded-full relative",
                  repeatMode > 0
                    ? isDark
                      ? "text-emerald-400"
                      : "text-emerald-600"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-500",
                )}
              >
                <Repeat className="h-5 w-5" />
                {repeatMode === 2 && (
                  <span className="absolute text-[10px] font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    1
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
                className={cn("rounded-full", isFavorite ? "text-red-500" : isDark ? "text-gray-400" : "text-gray-500")}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={shareSurah}
                className={cn("rounded-full", isDark ? "text-gray-400" : "text-gray-500")}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadSurah}
                className={cn("rounded-full", isDark ? "text-gray-400" : "text-gray-500")}
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>

            {/* Main playback controls */}
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={playPreviousSurah}
                className={cn("h-12 w-12 rounded-full", isDark ? "text-white" : "text-gray-800")}
              >
                <SkipBack className="h-6 w-6" />
              </Button>

              <Button
                onClick={togglePlayPause}
                disabled={isAudioLoading}
                className={cn("h-16 w-16 rounded-full hover:opacity-90", isDark ? "bg-emerald-600" : "bg-emerald-600")}
              >
                {isAudioLoading ? (
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={playNextSurah}
                className={cn("h-12 w-12 rounded-full", isDark ? "text-white" : "text-gray-800")}
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            {/* Volume control */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <Volume2 className={cn("h-5 w-5", isDark ? "text-gray-400" : "text-gray-500")} />
              <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-48" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
