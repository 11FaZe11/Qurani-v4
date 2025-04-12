"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseSpeechSynthesisProps {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
}

export function useSpeechSynthesis({
  language = "en-US",
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
}: UseSpeechSynthesisProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkSpeechSupport = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
        try {
          // Test if we can actually create an utterance and access voices
          const testUtterance = new SpeechSynthesisUtterance("Test")
          // If we get here without errors, basic support exists
          setIsSupported(true)

          // Load voices
          const loadVoices = () => {
            try {
              const availableVoices = window.speechSynthesis.getVoices()
              setVoices(availableVoices)
            } catch (error) {
              console.error("Error loading voices:", error)
              // Still mark as supported since basic functionality might work
            }
          }

          loadVoices()

          // Chrome loads voices asynchronously
          if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices
          }
        } catch (error) {
          console.error("Speech synthesis initialization error:", error)
          setIsSupported(false)
        }
      } else {
        setIsSupported(false)
      }
    }

    checkSpeechSupport()
  }, [])

  const speak = (text: string, messageId: string, customLanguage?: string) => {
    if (!isSupported) {
      toast({
        title: "Speech Synthesis Not Supported",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      })
      return
    }

    try {
      // If already speaking the same message and paused, resume it
      if (messageId === currentMessageId && isPaused) {
        resume()
        return
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel()
      setIsPaused(false)

      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Set language
      utterance.lang = customLanguage || language

      // Set other properties
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      // Try to find a suitable voice
      if (voices.length > 0) {
        const langCode = (customLanguage || language).split("-")[0]
        const matchingVoice = voices.find((voice) => voice.lang.startsWith(langCode))

        if (matchingVoice) {
          utterance.voice = matchingVoice
        }
      }

      // Set event handlers
      utterance.onstart = () => {
        setIsSpeaking(true)
        setCurrentMessageId(messageId)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentMessageId(null)
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)

        // Extract more detailed error information if available
        let errorMessage = "An error occurred while speaking the text."
        if (event.error) {
          errorMessage = `Speech error: ${event.error}`
        }

        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentMessageId(null)

        toast({
          title: "Speech Synthesis Error",
          description: errorMessage,
          variant: "destructive",
        })
      }

      // Add a small delay before speaking to avoid potential race conditions
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance)
        } catch (error) {
          console.error("Error in speech synthesis:", error)
          toast({
            title: "Speech Synthesis Error",
            description: "Failed to start speech synthesis. Your browser may not fully support this feature.",
            variant: "destructive",
          })
        }
      }, 50)
    } catch (error) {
      console.error("Error setting up speech synthesis:", error)
      toast({
        title: "Speech Synthesis Error",
        description: "Failed to set up speech synthesis. Your browser may not fully support this feature.",
        variant: "destructive",
      })
    }
  }

  const pause = () => {
    if (isSupported && isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resume = () => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const cancel = () => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setIsPaused(false)
      setCurrentMessageId(null)
    }
  }

  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    currentMessageId,
  }
}
