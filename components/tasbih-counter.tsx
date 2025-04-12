"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { useTheme } from "next-themes"
import { RotateCcw, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Tasbih {
  id: string
  name: string
  arabicText: string
  transliteration: string
  translation: string
  virtue: string
  recommended: number
}

// List of common tasbihs
const tasbihs: Tasbih[] = [
  {
    id: "subhanallah",
    name: "Tasbih",
    arabicText: "سُبْحَانَ اللهِ",
    transliteration: "Subhan Allah",
    translation: "Glory be to Allah",
    virtue: "Saying 'Subhan Allah' 100 times a day will bring great rewards and erase sins.",
    recommended: 33,
  },
  {
    id: "alhamdulillah",
    name: "Tahmid",
    arabicText: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    virtue: "Saying 'Alhamdulillah' fills the scales of good deeds.",
    recommended: 33,
  },
  {
    id: "allahuakbar",
    name: "Takbir",
    arabicText: "اللهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    virtue: "Saying 'Allahu Akbar' is among the most beloved phrases to Allah.",
    recommended: 34,
  },
  {
    id: "lailahaillallah",
    name: "Tahlil",
    arabicText: "لَا إِلَٰهَ إِلَّا اللهُ",
    transliteration: "La ilaha illallah",
    translation: "There is no god but Allah",
    virtue: "The best dhikr is 'La ilaha illallah' and it is a means of salvation.",
    recommended: 100,
  },
  {
    id: "astaghfirullah",
    name: "Istighfar",
    arabicText: "أَسْتَغْفِرُ اللهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    virtue: "Whoever regularly seeks forgiveness, Allah will provide relief from every hardship.",
    recommended: 100,
  },
  {
    id: "salawat",
    name: "Salawat",
    arabicText: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammad wa 'ala aali Muhammad",
    translation: "O Allah, send blessings upon Muhammad and upon the family of Muhammad",
    virtue: "Whoever sends blessings upon the Prophet once, Allah will send blessings upon him tenfold.",
    recommended: 100,
  },
  {
    id: "hawqala",
    name: "Hawqala",
    arabicText: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    translation: "There is no might nor power except with Allah",
    virtue: "This phrase is a treasure from the treasures of Paradise and a remedy for 99 ailments.",
    recommended: 100,
  },
  {
    id: "ayatulkursi",
    name: "Ayatul Kursi",
    arabicText: "اللهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
    transliteration: "Allahu la ilaha illa huwa al-hayyu al-qayyum...",
    translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence...",
    virtue: "Whoever recites Ayatul Kursi after each prayer, only death will prevent them from entering Paradise.",
    recommended: 1,
  },
  {
    id: "tasbihat",
    name: "Tasbihat after Prayer",
    arabicText: "سُبْحَانَ اللهِ (33) الْحَمْدُ لِلَّهِ (33) اللهُ أَكْبَرُ (34)",
    transliteration: "Subhan Allah (33) Alhamdulillah (33) Allahu Akbar (34)",
    translation: "Glory be to Allah (33) All praise is due to Allah (33) Allah is the Greatest (34)",
    virtue: "Reciting these after each prayer will forgive sins even if they are like the foam of the sea.",
    recommended: 1,
  },
]

export function TasbihCounter() {
  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { toast } = useToast()

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activeTasbih, setActiveTasbih] = useState<string>("subhanallah")
  const [isAnimating, setIsAnimating] = useState(false)
  const [counters, setCounters] = useState<Record<string, number>>({})

  // Load saved counters from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCounters = localStorage.getItem("tasbih_counters")
      if (savedCounters) {
        try {
          setCounters(JSON.parse(savedCounters))
        } catch (e) {
          console.error("Failed to parse saved counters:", e)
        }
      }
    }
  }, [])

  // Save counters to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(counters).length > 0) {
      localStorage.setItem("tasbih_counters", JSON.stringify(counters))
    }
  }, [counters])

  const incrementCounter = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // Play click sound if enabled
    if (soundEnabled) {
      try {
        const audio = new Audio("/click-sound.mp3")
        audio.volume = 0.2
        audio.play().catch((e) => console.log("Audio play failed:", e))
      } catch (error) {
        console.error("Failed to play sound:", error)
      }
    }

    // Vibrate on mobile if available
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20)
    }

    setCounters((prev) => {
      const currentCount = prev[activeTasbih] || 0
      const newCount = currentCount + 1

      // Show toast when reaching recommended count
      const tasbih = tasbihs.find((t) => t.id === activeTasbih)
      if (tasbih && newCount === tasbih.recommended) {
        toast({
          title: "Masha'Allah!",
          description: `You've completed ${tasbih.recommended} repetitions of ${tasbih.transliteration}`,
        })
      }

      return { ...prev, [activeTasbih]: newCount }
    })
  }

  const resetCounter = () => {
    setCounters((prev) => ({ ...prev, [activeTasbih]: 0 }))
    toast({
      title: "Counter Reset",
      description: "The counter has been reset to zero",
    })
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    toast({
      title: soundEnabled ? "Sound Disabled" : "Sound Enabled",
      description: soundEnabled ? "Click sound has been turned off" : "Click sound has been turned on",
    })
  }

  const currentTasbih = tasbihs.find((t) => t.id === activeTasbih) || tasbihs[0]
  const currentCount = counters[activeTasbih] || 0

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className={cn("text-2xl font-bold mb-6 text-center", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
        Digital Tasbih Counter
      </h2>

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {tasbihs.map((t) => (
          <Button
            key={t.id}
            variant={activeTasbih === t.id ? "default" : "outline"}
            className={cn(
              "text-sm",
              activeTasbih === t.id
                ? isDark
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : currentTheme.primary
                : isDark && "border-gray-700 hover:bg-gray-800 text-gray-300",
            )}
            onClick={() => setActiveTasbih(t.id)}
          >
            {t.name}
          </Button>
        ))}
      </div>

      <Card className={cn("mb-8", isDark && "bg-gray-800 border-gray-700")}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className={cn("text-3xl font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
              {currentTasbih.transliteration}
            </h3>
            <p className="text-3xl font-quran" dir="rtl">
              {currentTasbih.arabicText}
            </p>
            <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-700")}>{currentTasbih.translation}</p>
            <div className={cn("text-sm italic", isDark ? "text-gray-400" : "text-gray-500")}>
              {currentTasbih.virtue}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-6">
          <div
            className={cn(
              "w-48 h-48 rounded-full flex items-center justify-center text-5xl font-bold transition-all",
              isAnimating ? "scale-105" : "scale-100",
              isDark ? "bg-emerald-900 text-emerald-400" : cn(currentTheme.primaryLight, currentTheme.textPrimary),
            )}
          >
            {currentCount}
          </div>
          <div
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-sm",
              isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700",
            )}
          >
            Target: {currentTasbih.recommended}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={resetCounter}
            className={cn(isDark && "border-gray-700 hover:bg-gray-800 text-gray-300")}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            className={cn(
              "w-32 h-16 rounded-full text-lg transition-all",
              isDark ? "bg-emerald-700 hover:bg-emerald-800" : currentTheme.primary,
              isAnimating ? "scale-95" : "scale-100",
            )}
            onClick={incrementCounter}
          >
            Count
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            className={cn(isDark && "border-gray-700 hover:bg-gray-800 text-gray-300")}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasbihs.map((t) => (
          <Card key={t.id} className={cn(isDark && "bg-gray-800 border-gray-700")}>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-800")}>{t.name}</h4>
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs",
                    isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700",
                  )}
                >
                  {counters[t.id] || 0}/{t.recommended}
                </div>
              </div>
              <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")} dir="rtl">
                {t.arabicText.length > 50 ? t.arabicText.substring(0, 50) + "..." : t.arabicText}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
