"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { surahList, reciters, type Reciter } from "@/lib/surah-list"
import { useToast } from "@/hooks/use-toast"

interface PlayerContextType {
  currentSurah: (typeof surahList)[0]
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  selectedReciter: Reciter
  audioRef: React.RefObject<HTMLAudioElement>
  setCurrentSurah: (surah: (typeof surahList)[0]) => void
  togglePlayPause: () => void
  setProgress: (value: number) => void
  setVolume: (value: number) => void
  setSelectedReciter: (reciter: Reciter) => void
  playNextSurah: () => void
  playPreviousSurah: () => void
  isAudioLoading: boolean
  audioError: string | null
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSurah, setCurrentSurah] = useState(surahList[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(reciters[0])
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Get audio URL for current surah and selected reciter
  const getAudioUrl = (surah: typeof currentSurah, reciter: Reciter) => {
    try {
      const paddedNumber = surah.number.toString().padStart(3, "0")
      const formattedUrl = `${reciter.baseUrl}${reciter.filePattern.replace("{surahNumber}", paddedNumber)}`
      return formattedUrl
    } catch (error) {
      console.error("Error generating audio URL:", error)
      return ""
    }
  }

  // Update audio source when surah or reciter changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setProgress(0)
      setAudioError(null)
      setIsAudioLoading(true)

      // Load new audio
      const audioUrl = getAudioUrl(currentSurah, selectedReciter)

      // Check if URL is valid before setting
      if (audioUrl) {
        audioRef.current.src = audioUrl
        audioRef.current.load()

        // Set a timeout to detect if loading takes too long
        const timeoutId = setTimeout(() => {
          if (isAudioLoading) {
            setAudioError("Audio loading timed out. Please try another reciter or surah.")
            setIsAudioLoading(false)
            setIsPlaying(false)
          }
        }, 15000) // 15 seconds timeout

        // Auto play if was playing
        if (isPlaying) {
          audioRef.current.play().catch((err) => {
            console.error("Failed to play:", err)
            setIsPlaying(false)
            setAudioError(`Could not play audio: ${err.message || "Unknown error"}`)
            setIsAudioLoading(false)
          })
        }

        // Clear timeout on cleanup
        return () => clearTimeout(timeoutId)
      } else {
        setAudioError("Invalid audio URL. Please try another reciter or surah.")
        setIsAudioLoading(false)
        setIsPlaying(false)
      }
    }
  }, [currentSurah, selectedReciter])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsPlaying(false)
      } else {
        setIsAudioLoading(true)
        setAudioError(null)
        audioRef.current
          .play()
          .then(() => {
            // Update progress
            intervalRef.current = setInterval(() => {
              if (audioRef.current) {
                setProgress(audioRef.current.currentTime)
                setDuration(audioRef.current.duration || 0)
              }
            }, 1000)
            setIsPlaying(true)
          })
          .catch((err) => {
            console.error("Failed to play:", err)
            setAudioError(`Could not play audio: ${err.message}`)
          })
          .finally(() => {
            setIsAudioLoading(false)
          })
      }
    }
  }

  // Play next surah
  const playNextSurah = () => {
    const currentIndex = surahList.findIndex((s) => s.number === currentSurah.number)
    if (currentIndex < surahList.length - 1) {
      setCurrentSurah(surahList[currentIndex + 1])
    }
  }

  // Play previous surah
  const playPreviousSurah = () => {
    const currentIndex = surahList.findIndex((s) => s.number === currentSurah.number)
    if (currentIndex > 0) {
      setCurrentSurah(surahList[currentIndex - 1])
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current

    if (audio) {
      const handleEnded = () => {
        setIsPlaying(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }

      const handleLoadedMetadata = () => {
        setDuration(audio.duration)
        setIsAudioLoading(false)
      }

      const handleError = (e: Event) => {
        const error = audio.error
        let errorMessage = "Could not load audio file."

        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = "Audio playback was aborted."
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = "Network error occurred while loading audio."
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = "Audio decoding error."
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = "Audio format not supported or file not found."
              break
            default:
              errorMessage = `Audio error: ${error.message || "Unknown error"}`
          }
        }

        console.error("Audio error:", errorMessage, error)
        setAudioError(`${errorMessage} Please try another reciter or surah.`)
        setIsPlaying(false)
        setIsAudioLoading(false)
      }

      // Add event listeners
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("loadedmetadata", handleLoadedMetadata)
      audio.addEventListener("error", handleError)

      // Clean up
      return () => {
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
        audio.removeEventListener("error", handleError)
      }
    }
  }, [])

  const value = {
    currentSurah,
    isPlaying,
    progress,
    duration,
    volume,
    selectedReciter,
    audioRef,
    setCurrentSurah,
    togglePlayPause,
    setProgress,
    setVolume,
    setSelectedReciter,
    playNextSurah,
    playPreviousSurah,
    isAudioLoading,
    audioError,
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Global audio element */}
      <audio ref={audioRef} className="hidden" />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}
