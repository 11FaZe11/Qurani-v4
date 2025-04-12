"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface UseSpeechRecognitionProps {
  language?: string
  onResult?: (transcript: string) => void
  continuous?: boolean
  interimResults?: boolean
}

export function useSpeechRecognition({
  language = "en-US",
  onResult,
  continuous = true,
  interimResults = true,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown")
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  // Check if microphone permission is available
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      if (typeof navigator !== "undefined" && navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
          setPermissionStatus(result.state as "granted" | "denied" | "prompt")

          // Listen for permission changes
          result.onchange = () => {
            setPermissionStatus(result.state as "granted" | "denied" | "prompt")
          }
        } catch (error) {
          console.error("Error checking microphone permission:", error)
        }
      }
    }

    checkMicrophonePermission()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = continuous
        recognitionRef.current.interimResults = interimResults
        recognitionRef.current.lang = language

        recognitionRef.current.onresult = (event: any) => {
          const currentTranscript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join("")

          setTranscript(currentTranscript)

          if (onResult) {
            onResult(currentTranscript)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)

          if (event.error === "not-allowed") {
            setPermissionStatus("denied")
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access in your browser settings to use voice input.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Voice Recognition Error",
              description: `Error: ${event.error}. Please try again.`,
              variant: "destructive",
            })
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, interimResults, language, onResult, toast])

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language
    }
  }, [language])

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      })
      return false
    }

    // If permission is already granted, return true
    if (permissionStatus === "granted") {
      return true
    }

    // If permission is denied, show a message
    if (permissionStatus === "denied") {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access in your browser settings to use voice input.",
        variant: "destructive",
      })
      return false
    }

    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermissionStatus("granted")
      return true
    } catch (error) {
      console.error("Error requesting microphone permission:", error)
      setPermissionStatus("denied")
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access in your browser settings to use voice input.",
        variant: "destructive",
      })
      return false
    }
  }

  const startListening = async () => {
    // Request microphone permission first
    const permissionGranted = await requestMicrophonePermission()
    if (!permissionGranted) return

    try {
      recognitionRef.current.start()
      setIsListening(true)
      setTranscript("")
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      toast({
        title: "Voice Recognition Error",
        description: "Could not start voice recognition. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const toggleListening = async () => {
    if (isListening) {
      stopListening()
    } else {
      await startListening()
    }
  }

  return {
    isListening,
    transcript,
    isSupported,
    permissionStatus,
    startListening,
    stopListening,
    toggleListening,
  }
}
