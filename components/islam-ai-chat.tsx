"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, X, ArrowLeft, Volume2, Pause, Paperclip, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { useToast } from "@/hooks/use-toast"
import { DraggableChatButton } from "./draggable-chat-button"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { FileAttachment } from "./file-attachment"
import { fileToBase64, getFileMimeType, isImageFile } from "@/lib/file-utils"
import Image from "next/image"

interface FileData {
  id: string
  file: File
  preview: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  files?: FileData[]
}

export function IslamAIChat() {
  const [chatLanguageMode, setChatLanguageMode] = useState<"mixed" | "arabic">("mixed")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content:
        chatLanguageMode === "arabic"
          ? "السلام عليكم! أنا مساعد ذكاء اصطناعي يمكنني الإجابة على أسئلتك حول الإسلام والقرآن. كيف يمكنني مساعدتك اليوم؟"
          : "Assalamu alaikum! I am an AI assistant that can answer your questions about Islam and the Quran. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currentTheme } = useAppTheme()
  const { toast } = useToast()
  const isMobile = useMobile()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { language } = useLanguage()

  // Generate a unique ID for messages and files
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // Initialize speech recognition
  const {
    isListening,
    transcript,
    isSupported: isSpeechRecognitionSupported,
    permissionStatus,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    language: language === "arabic" ? "ar-SA" : "en-US",
    onResult: (text) => setInput(text),
  })

  // Initialize speech synthesis
  const {
    speak,
    pause: pauseSpeech,
    resume: resumeSpeech,
    cancel: cancelSpeech,
    isSpeaking,
    isPaused,
    isSupported: isSpeechSynthesisSupported,
    currentMessageId,
  } = useSpeechSynthesis({
    language: language === "arabic" ? "ar-SA" : "en-US",
  })

  // Load conversation from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("islamAIChatMessages")
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          // Ensure all messages have IDs
          const messagesWithIds = parsedMessages.map((msg) => ({
            ...msg,
            id: msg.id || generateId(),
          }))
          setMessages(messagesWithIds)
        }
      } catch (error) {
        console.error("Error parsing saved messages:", error)
      }
    }

    // Load speech preference
    const speechPref = localStorage.getItem("islamAIChatSpeech")
    if (speechPref !== null) {
      setIsSpeechEnabled(speechPref === "true")
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      // We need to filter out file data before saving to localStorage
      // as it can be too large and contains non-serializable data
      const messagesToSave = messages.map((msg) => {
        const { files, ...rest } = msg
        return rest
      })

      localStorage.setItem("islamAIChatMessages", JSON.stringify(messagesToSave))
    }
  }, [messages])

  // Save speech preference
  useEffect(() => {
    localStorage.setItem("islamAIChatSpeech", isSpeechEnabled.toString())
  }, [isSpeechEnabled])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  // Stop speech and listening when chat closes
  useEffect(() => {
    if (!isOpen) {
      cancelSpeech()
      stopListening()
    }
  }, [isOpen, cancelSpeech, stopListening])

  // Clean up file previews when component unmounts
  useEffect(() => {
    return () => {
      selectedFiles.forEach((fileData) => {
        URL.revokeObjectURL(fileData.preview)
      })
    }
  }, [selectedFiles])

  // Update welcome message when language mode changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "welcome-message") {
      setMessages([
        {
          id: "welcome-message",
          role: "assistant",
          content:
            chatLanguageMode === "arabic"
              ? "السلام عليكم! أنا مساعد ذكاء اصطناعي يمكنني الإجابة على أسئلتك حول الإسلام والقرآن. كيف يمكنني مساعدتك اليوم؟"
              : "Assalamu alaikum! I am an AI assistant that can answer your questions about Islam and the Quran. How can I help you today?",
        },
      ])
    }
  }, [chatLanguageMode])

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled)

    // If turning off, stop any ongoing speech
    if (isSpeechEnabled) {
      cancelSpeech()
    }

    toast({
      title: isSpeechEnabled ? "Voice Response Disabled" : "Voice Response Enabled",
      description: isSpeechEnabled
        ? "The AI will no longer speak its responses."
        : "The AI will now speak its responses.",
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const files = Array.from(e.target.files)

    // Check file size limit (10MB per file)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE)

    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Files must be less than 10MB. ${oversizedFiles.map((f) => f.name).join(", ")} exceeded the limit.`,
        variant: "destructive",
      })

      // Filter out oversized files
      const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE)
      if (validFiles.length === 0) {
        e.target.value = ""
        return
      }
    }

    // Process valid files
    const newFiles = files
      .filter((file) => file.size <= MAX_FILE_SIZE)
      .map((file) => ({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
      }))

    setSelectedFiles((prev) => [...prev, ...newFiles])

    // Reset file input
    e.target.value = ""
  }

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Stop recording if active
    if (isListening) {
      stopListening()
    }

    if (!input.trim() && selectedFiles.length === 0) return

    // Create message ID
    const messageId = generateId()

    // Add user message with files
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: input,
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])

    // Clear input and selected files
    setInput("")
    setSelectedFiles([])

    // Set loading
    setIsLoading(true)

    try {
      // Format the conversation history for the API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }))

      // Add language instruction based on the selected mode
      if (chatLanguageMode === "arabic") {
        conversationHistory.unshift({
          role: "user",
          parts: [
            {
              text: "Please respond only in Arabic language for all my questions. أرجو الرد باللغة العربية فقط على جميع أسئلتي.",
            },
          ],
        })
      }

      // Prepare the new message parts
      const newMessageParts: any[] = []

      // Add text content if present
      if (input.trim()) {
        newMessageParts.push({ text: input.trim() })
      }

      // Process files if present
      if (selectedFiles.length > 0) {
        for (const fileData of selectedFiles) {
          try {
            if (isImageFile(fileData.file)) {
              // For images, convert to base64 and add as inline data
              const base64Data = await fileToBase64(fileData.file)
              const mimeType = getFileMimeType(fileData.file)

              newMessageParts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              })
            } else {
              // For other files, we'll just mention them in the text
              // as Gemini might not support all file types
              if (!input.trim()) {
                // If no text was provided, add a description of the file
                newMessageParts.push({
                  text: `I'm uploading a file named "${fileData.file.name}" (${fileData.file.type}). Please analyze it.`,
                })
              }
            }
          } catch (error) {
            console.error(`Error processing file ${fileData.file.name}:`, error)
          }
        }
      }

      // Add the new user message to conversation history
      conversationHistory.push({
        role: "user",
        parts: newMessageParts,
      })

      // Use Google's Generative AI API with the updated endpoint and model
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAfKQN2Jb1YVEWfPt9IxweKrHF928rL59c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: conversationHistory,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to get response from AI: ${response.status}`)
      }

      const data = await response.json()

      // Extract the response text from the Gemini API response format
      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I apologize, but I couldn't generate a response at this time."

      // Generate a unique ID for the AI message
      const aiMessageId = generateId()

      // Add AI response
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: aiResponse,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Speak the response if speech is enabled
      if (isSpeechEnabled && isSpeechSynthesisSupported) {
        try {
          // Use a small delay to ensure the UI has updated before starting speech
          setTimeout(() => {
            speak(aiResponse, aiMessageId)
          }, 100)
        } catch (error) {
          console.error("Error starting speech:", error)
          // Don't show a toast here as it might be annoying if speech fails
          // The error will be logged to console
        }
      }
    } catch (error) {
      console.error("Error fetching from Islam AI API:", error)
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again later.",
        variant: "destructive",
      })

      // Add error message with a unique ID
      const errorMessageId = generateId()
      setMessages((prev) => [
        ...prev,
        {
          id: errorMessageId,
          role: "assistant",
          content: "I apologize, but I encountered an error while processing your request. Please try again later.",
        },
      ])
    } finally {
      setIsLoading(false)
      // Focus back on input after response
      inputRef.current?.focus()
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)

    // Stop any ongoing speech when closing the chat
    if (isOpen) {
      cancelSpeech()
      stopListening()
    }
  }

  // Handle play/pause for a specific message
  const handlePlayPause = (messageId: string, content: string) => {
    try {
      if (currentMessageId === messageId) {
        // If this message is currently being spoken
        if (isPaused) {
          resumeSpeech()
        } else {
          pauseSpeech()
        }
      } else {
        // Start speaking this message
        speak(content, messageId)
      }
    } catch (error) {
      console.error("Error handling play/pause:", error)
      toast({
        title: "Speech Error",
        description: "There was an error with the speech playback. Your browser may not fully support this feature.",
        variant: "destructive",
      })
    }
  }

  // Trigger file input click
  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      {/* Draggable chat button */}
      {!isOpen && <DraggableChatButton onClick={toggleChat} />}

      {/* Chat dialog */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
            isMobile
              ? "inset-0 rounded-none" // Full screen on mobile
              : "bottom-4 right-4 w-80 md:w-96 h-[500px] rounded-lg",
            isDark ? "bg-gray-900 text-white" : "bg-white text-gray-800",
          )}
        >
          {/* Chat header */}
          <div
            className={cn(
              "flex items-center justify-between p-3",
              isMobile ? "rounded-none" : "rounded-t-lg",
              isDark ? "bg-emerald-800" : currentTheme.primary,
            )}
          >
            <div className="flex items-center space-x-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 mr-1 -ml-1"
                  onClick={toggleChat}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <Bot className="h-5 w-5 text-white" />
              <span className="font-medium text-white">Islam AI Assistant</span>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 mr-2"
                onClick={() => {
                  setChatLanguageMode(chatLanguageMode === "mixed" ? "arabic" : "mixed")
                  toast({
                    title: chatLanguageMode === "mixed" ? "Arabic Mode" : "Mixed Mode",
                    description:
                      chatLanguageMode === "mixed"
                        ? "The AI will now respond only in Arabic."
                        : "The AI will now respond in mixed languages.",
                  })
                }}
              >
                {chatLanguageMode === "mixed" ? "Arabic Mode" : "Mixed Mode"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  // Cancel any ongoing speech
                  cancelSpeech()

                  // Reset messages with a welcome message that has an ID
                  setMessages([
                    {
                      id: "welcome-message",
                      role: "assistant",
                      content:
                        chatLanguageMode === "arabic"
                          ? "السلام عليكم! أنا مساعد ذكاء اصطناعي يمكنني الإجابة على أسئلتك حول الإسلام والقرآن. كيف يمكنني مساعدتك اليوم؟"
                          : "Assalamu alaikum! I am an AI assistant that can answer your questions about Islam and the Quran. How can I help you today?",
                    },
                  ])
                  toast({
                    title: "Conversation cleared",
                    description: "Your chat history has been reset.",
                  })
                }}
              >
                Clear Chat
              </Button>
              {!isMobile && (
                <X className="h-5 w-5 text-white hover:text-gray-200 cursor-pointer ml-2" onClick={toggleChat} />
              )}
            </div>
          </div>

          {/* Chat body */}
          <ScrollArea
            className={cn(
              "flex-1 p-4",
              isMobile && "pb-20", // Extra padding at bottom on mobile for better scrolling
            )}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? isDark
                          ? "bg-emerald-800 text-white"
                          : cn(currentTheme.primary, "text-white")
                        : isDark
                          ? "bg-gray-800"
                          : "bg-gray-100",
                      isMobile && "text-base max-w-[85%]", // Larger text and bubbles on mobile
                    )}
                  >
                    {/* Display files if present */}
                    {message.files && message.files.length > 0 && (
                      <div className="mb-2 grid grid-cols-2 gap-2">
                        {message.files.map((fileData) => (
                          <div key={fileData.id} className="relative">
                            {isImageFile(fileData.file) ? (
                              <div className="relative h-24 w-full rounded-md overflow-hidden">
                                <Image
                                  src={fileData.preview || "/placeholder.svg"}
                                  alt={fileData.file.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 150px"
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "flex items-center justify-center h-24 w-full rounded-md",
                                  isDark ? "bg-gray-700" : "bg-gray-200",
                                )}
                              >
                                <div className="text-center">
                                  <FileText
                                    className={cn("h-8 w-8 mx-auto mb-1", isDark ? "text-gray-300" : "text-gray-500")}
                                  />
                                  <p
                                    className={cn(
                                      "text-xs truncate max-w-[80px] mx-auto",
                                      isDark ? "text-gray-300" : "text-gray-600",
                                    )}
                                  >
                                    {fileData.file.name}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message text */}
                    {message.content && (
                      <p className={cn("whitespace-pre-wrap", isMobile ? "text-base" : "text-sm")}>{message.content}</p>
                    )}

                    {/* Add play/pause buttons for assistant messages */}
                    {message.role === "assistant" && isSpeechSynthesisSupported && message.content && (
                      <div className="flex mt-1 space-x-1">
                        {currentMessageId === message.id && isSpeaking ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "p-1 h-6 w-6 rounded-full",
                              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200",
                            )}
                            onClick={() => handlePlayPause(message.id, message.content)}
                            title={isPaused ? "Resume" : "Pause"}
                          >
                            {isPaused ? <Volume2 className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "p-1 h-6 w-6 rounded-full",
                              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200",
                            )}
                            onClick={() => handlePlayPause(message.id, message.content)}
                            title="Listen to this response"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className={cn("p-2 border-t", isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white")}>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedFiles.map((fileData) => (
                  <FileAttachment
                    key={fileData.id}
                    file={fileData.file}
                    preview={fileData.preview}
                    onRemove={() => removeFile(fileData.id)}
                    className="min-w-[120px] max-w-[120px]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chat input */}
          <form
            onSubmit={handleSubmit}
            className={cn(
              isMobile
                ? "p-3 border-t fixed bottom-0 left-0 right-0 bg-inherit" // Fixed at bottom on mobile
                : "p-3 border-t",
              isDark ? "border-gray-800" : "border-gray-200",
            )}
          >
            <div className="flex space-x-2">
              {/* File input (hidden) */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*,application/pdf"
              />

              {/* File upload button */}
              <Button
                type="button"
                size={isMobile ? "default" : "icon"}
                variant="outline"
                className={cn(
                  isMobile && "px-4 h-12", // Larger button on mobile
                  isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-200",
                )}
                onClick={handleFileButtonClick}
                disabled={isLoading}
                title="Upload image or file"
              >
                <Paperclip className={cn("h-5 w-5", isDark ? "text-gray-400" : "text-gray-500")} />
              </Button>

              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    chatLanguageMode === "arabic" ? "اسأل سؤالاً عن الإسلام..." : "Ask a question about Islam..."
                  }
                  className={cn(
                    isMobile && "h-12 text-base", // Taller input with larger text on mobile
                    isDark && "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400",
                  )}
                  disabled={isLoading}
                />
              </div>

              {/* Send button */}
              <Button
                type="submit"
                size={isMobile ? "default" : "icon"}
                className={cn(
                  isMobile && "px-4 h-12", // Larger button on mobile
                  isDark ? "bg-emerald-700 hover:bg-emerald-800" : currentTheme.primary,
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div
                    className={cn(
                      "border-2 border-white border-t-transparent rounded-full animate-spin",
                      isMobile ? "h-5 w-5" : "h-4 w-4",
                    )}
                  ></div>
                ) : (
                  <>
                    {isMobile && <span className="mr-2">Send</span>}
                    <Send className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
