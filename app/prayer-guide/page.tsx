"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTheme as useAppTheme } from "@/contexts/theme-context"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import Image from "next/image"
import { Clock, Droplets, BookOpen, Search, Loader2, Timer } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface PrayerTimeData {
  name: string
  arabicName: string
  time: string
}

interface LocationData {
  city: string
  country: string
  latitude: number
  longitude: number
}

export default function PrayerGuidePage() {
  const { currentTheme } = useAppTheme()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [activeTab, setActiveTab] = useState("ablution")
  const { language } = useLanguage()
  const { toast } = useToast()

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData[]>([])
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [locationInput, setLocationInput] = useState("")
  const [date, setDate] = useState<string>("")

  // Add these new state variables after the existing state declarations
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nextPrayer, setNextPrayer] = useState<{
    name: string
    arabicName: string
    time: string
    timeRemaining: string
  } | null>(null)

  // Ablution (Wudu) steps
  const ablutionSteps = [
    {
      id: 1,
      title: "Intention (Niyyah)",
      arabicTitle: "النية",
      description: "Make the intention in your heart to perform wudu for the purpose of prayer.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Intention%20%28Niyyah%29-kwyZQssBNGPyd91Wcp4XH8mY31xRAG.jpeg",
    },
    {
      id: 2,
      title: "Washing Hands",
      arabicTitle: "غسل اليدين",
      description: "Wash your hands up to the wrists three times, ensuring between the fingers are washed.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Washing%20Hands-5qHQfbxVXIui3XsLBRlGHFGxRwAdog.jpeg",
    },
    {
      id: 3,
      title: "Rinsing the Mouth",
      arabicTitle: "المضمضة",
      description: "Take water into your mouth and rinse it thoroughly three times.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rinsing%20the%20Mouth-o57K8s3gGY6FnuhSZ8LkiapmFWw1zi.jpeg",
    },
    {
      id: 4,
      title: "Sniffing Water",
      arabicTitle: "الاستنشاق",
      description: "Sniff water into your nostrils and blow it out three times.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sniffing%20Water-U5q4DvoB1NSIe6md1ECN7Huyxqtqb3.jpeg",
    },
    {
      id: 5,
      title: "Washing the Face",
      arabicTitle: "غسل الوجه",
      description: "Wash your face from forehead to chin and ear to ear three times.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Washing%20the%20Face-GiN3Z1amnNq2JOeFXqUsER7lLxNgFE.jpeg",
    },
    {
      id: 6,
      title: "Washing Arms",
      arabicTitle: "غسل اليدين إلى المرفقين",
      description: "Wash your right arm from wrist to elbow three times, then the left arm.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Washing%20Arms-NUDlcpT9CqQJBGWZj88ZWGX1x0Fi45.jpeg",
    },
    {
      id: 7,
      title: "Wiping the Head",
      arabicTitle: "مسح الرأس",
      description: "Wipe your wet hands over your head from front to back once.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wiping%20the%20Head-4SV2wmG6tMsNGjAroWpDjGpNNTlQdS.jpeg",
    },
    {
      id: 8,
      title: "Wiping the Ears",
      arabicTitle: "مسح الأذنين",
      description: "Wipe the inside and outside of your ears with wet fingers once.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wiping%20the%20Ears-FdeI19YD8r4umDMFb6xVFuqOTPtvrD.jpeg",
    },
    {
      id: 9,
      title: "Washing the Feet",
      arabicTitle: "غسل القدمين",
      description: "Wash your right foot up to the ankle three times, then the left foot.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Washing%20the%20Feet-iSF4IdzraNjveCxRKOZm8ghoR2qa3f.jpeg",
    },
  ]

  // Prayer (Salah) steps
  const prayerSteps = [
    {
      id: 1,
      title: "Standing (Qiyam)",
      arabicTitle: "القيام",
      description:
        "Stand facing the Qibla (direction of the Ka'bah in Mecca). Raise your hands to your ears and say 'Allahu Akbar' (Allah is the Greatest).",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Standing%20%28Qiyam%29-A6G9na3OvpVpIHKipK7aXTkk60gpYW.jpeg",
    },
    {
      id: 2,
      title: "Recitation (Qira'at)",
      arabicTitle: "القراءة",
      description:
        "Place your right hand over your left hand on your chest. Recite Surah Al-Fatihah followed by any other surah or verses from the Quran.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Recitation%20%28Qira%27at%29-ZgMPy9e0K4T8VuI8SujNmcEdlVzwKy.jpeg",
    },
    {
      id: 3,
      title: "Bowing (Ruku)",
      arabicTitle: "الركوع",
      description:
        "Say 'Allahu Akbar' and bow with your back straight and hands on your knees. Say 'Subhana Rabbiyal Adheem' (Glory be to my Lord, the Most Great) three times.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bowing%20%28Ruku%29-eOPStTwGxtUkOxzAhM9ulhRuaCqY53.jpeg",
    },
    {
      id: 4,
      title: "Standing after Ruku",
      arabicTitle: "الرفع من الركوع",
      description:
        "Rise from bowing and say 'Sami Allahu liman hamidah, Rabbana wa lakal hamd' (Allah hears those who praise Him. Our Lord, praise be to You).",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Standing%20after%20Ruku-yCV3IU8hYwS6RIGAcWHFUTFiqzd8X9.jpeg",
    },
    {
      id: 5,
      title: "Prostration (Sujood)",
      arabicTitle: "السجود",
      description:
        "Say 'Allahu Akbar' and prostrate with your forehead, nose, palms, knees, and toes touching the ground. Say 'Subhana Rabbiyal A'la' (Glory be to my Lord, the Most High) three times.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Prostration%20%28Sujood%29-iWVfh2sp1n3lca94aJPXyio4T7eOuX.jpeg",
    },
    {
      id: 6,
      title: "Sitting between Prostrations",
      arabicTitle: "الجلسة بين السجدتين",
      description:
        "Rise from prostration saying 'Allahu Akbar' and sit briefly. Say 'Rabbi ighfir li' (My Lord, forgive me).",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sitting%20between%20Prostrations-XTtKTQUygJq4V1Y0Tz6EZq4LXl1gar.jpeg",
    },
    {
      id: 7,
      title: "Second Prostration",
      arabicTitle: "السجدة الثانية",
      description: "Say 'Allahu Akbar' and prostrate again as before, saying 'Subhana Rabbiyal A'la' three times.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Prostration%20%28Sujood%29-iWVfh2sp1n3lca94aJPXyio4T7eOuX.jpeg",
    },
    {
      id: 8,
      title: "Sitting for Tashahhud",
      arabicTitle: "التشهد",
      description:
        "After completing the required number of rak'ahs (units of prayer), sit for the final Tashahhud. Recite the Tashahhud and send blessings upon the Prophet Muhammad (peace be upon him).",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sitting%20for%20Tashahhud-Hs2tsLwj6MxRap1ROiD9bd0tKUk2SC.jpeg",
    },
    {
      id: 9,
      title: "Concluding the Prayer",
      arabicTitle: "التسليم",
      description:
        "Turn your face to the right saying 'Assalamu alaikum wa rahmatullah' (Peace and mercy of Allah be upon you), then to the left repeating the same words.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Concluding%20the%20Prayer-pVRiFq9vIo8K4nurTpc4ln064jioem.jpeg",
    },
  ]

  // Prayer times information
  const prayerTimesInfo = [
    { name: "Fajr", arabicName: "الفجر", description: "Dawn prayer, before sunrise" },
    { name: "Dhuhr", arabicName: "الظهر", description: "Midday prayer, after the sun passes its zenith" },
    {
      name: "Asr",
      arabicName: "العصر",
      description:
        "Afternoon prayer, when the shadow of an object is the same length as the object plus its shadow at noon",
    },
    { name: "Maghrib", arabicName: "المغرب", description: "Sunset prayer, after sunset" },
    { name: "Isha", arabicName: "العشاء", description: "Night prayer, after the twilight has disappeared" },
  ]

  // Helper function to render title based on language preference
  const renderTitle = (title: string, arabicTitle: string) => {
    if (language === "arabic") {
      return <h3 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-800")}>{arabicTitle}</h3>
    } else if (language === "english") {
      return <h3 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-800")}>{title}</h3>
    } else {
      // Mixed
      return (
        <>
          <h3 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-800")}>{title}</h3>
          <h4 className={cn("text-lg mb-2", isDark ? "text-emerald-300" : currentTheme.textSecondary)}>
            {arabicTitle}
          </h4>
        </>
      )
    }
  }

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":")
      const hour = Number.parseInt(hours, 10)
      const ampm = hour >= 12 ? "PM" : "AM"
      const formattedHour = hour % 12 || 12
      return `${formattedHour}:${minutes} ${ampm}`
    } catch (error) {
      return timeString
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoadingTimes(true)
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            try {
              // Get location name from coordinates
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              )
              const data = await response.json()

              const city = data.address.city || data.address.town || data.address.village || "Unknown"
              const country = data.address.country || "Unknown"

              setLocation({
                city,
                country,
                latitude,
                longitude,
              })

              // Fetch prayer times for this location
              fetchPrayerTimes(latitude, longitude)
            } catch (error) {
              console.error("Error getting location name:", error)
              setIsLoadingTimes(false)
              toast({
                title: "Error",
                description: "Failed to get your location. Using default location (Cairo, Egypt) instead.",
                variant: "destructive",
              })
              // Fall back to default location
              setLocation({
                city: "Cairo",
                country: "Egypt",
                latitude: 30.0444,
                longitude: 31.2357,
              })
              fetchPrayerTimes(30.0444, 31.2357)
            }
          },
          (error) => {
            console.error("Geolocation error:", error)
            setIsLoadingTimes(false)
            toast({
              title: "Location Access Denied",
              description: "Using default location (Cairo, Egypt) instead. You can also search for a city.",
              variant: "destructive",
            })
            // Fall back to default location
            setLocation({
              city: "Cairo",
              country: "Egypt",
              latitude: 30.0444,
              longitude: 31.2357,
            })
            fetchPrayerTimes(30.0444, 31.2357)
          },
        )
      } catch (error) {
        console.error("Geolocation API error:", error)
        setIsLoadingTimes(false)
        toast({
          title: "Geolocation Error",
          description: "Using default location (Cairo, Egypt) instead. You can also search for a city.",
          variant: "destructive",
        })
        // Fall back to default location
        setLocation({
          city: "Cairo",
          country: "Egypt",
          latitude: 30.0444,
          longitude: 31.2357,
        })
        fetchPrayerTimes(30.0444, 31.2357)
      }
    } else {
      setIsLoadingTimes(false)
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Using default location (Cairo, Egypt).",
        variant: "destructive",
      })
      // Fall back to default location
      setLocation({
        city: "Cairo",
        country: "Egypt",
        latitude: 30.0444,
        longitude: 31.2357,
      })
      fetchPrayerTimes(30.0444, 31.2357)
    }
  }

  // Search for a location
  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationInput.trim()) return

    setIsLoadingTimes(true)
    try {
      // Get coordinates from location name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const addressParts = display_name.split(", ")
        const city = addressParts[0]
        const country = addressParts[addressParts.length - 1]

        setLocation({
          city,
          country,
          latitude: Number.parseFloat(lat),
          longitude: Number.parseFloat(lon),
        })

        // Fetch prayer times for this location
        fetchPrayerTimes(Number.parseFloat(lat), Number.parseFloat(lon))
      } else {
        setIsLoadingTimes(false)
        toast({
          title: "Location Not Found",
          description: "Could not find the location you entered. Please try a different search term.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching location:", error)
      setIsLoadingTimes(false)
      toast({
        title: "Search Error",
        description: "An error occurred while searching for the location. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch prayer times from API
  const fetchPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      // Get current date
      const today = new Date()
      const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`

      // Fetch prayer times from API
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=2`,
      )
      const data = await response.json()

      if (data && data.data && data.data.timings) {
        const timings = data.data.timings
        const date = data.data.date.readable
        setDate(date)

        // Format prayer times
        const formattedTimes: PrayerTimeData[] = [
          { name: "Fajr", arabicName: "الفجر", time: formatTime(timings.Fajr) },
          { name: "Sunrise", arabicName: "الشروق", time: formatTime(timings.Sunrise) },
          { name: "Dhuhr", arabicName: "الظهر", time: formatTime(timings.Dhuhr) },
          { name: "Asr", arabicName: "العصر", time: formatTime(timings.Asr) },
          { name: "Maghrib", arabicName: "المغرب", time: formatTime(timings.Maghrib) },
          { name: "Isha", arabicName: "العشاء", time: formatTime(timings.Isha) },
        ]

        setPrayerTimes(formattedTimes)
      } else {
        throw new Error("Invalid response from prayer times API")
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error)
      toast({
        title: "Error",
        description: "Failed to fetch prayer times. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTimes(false)
    }
  }

  // Add this useEffect to update the current time and calculate next prayer
  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      calculateNextPrayer()
    }, 1000)

    // Calculate next prayer time
    const calculateNextPrayer = () => {
      if (prayerTimes.length === 0) return

      const now = new Date()
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTimeInMinutes = currentHours * 60 + currentMinutes

      // Convert prayer times to minutes for comparison
      const prayerTimesInMinutes = prayerTimes.map((prayer) => {
        const [hoursStr, minutesStr] = prayer.time.split(":")
        const [hours, minutes] = [Number.parseInt(hoursStr), Number.parseInt(minutesStr)]
        const isPM = prayer.time.toLowerCase().includes("pm")
        const adjustedHours = isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours
        return {
          name: prayer.name,
          arabicName: prayer.arabicName,
          time: prayer.time,
          timeInMinutes: adjustedHours * 60 + minutes,
        }
      })

      // Find the next prayer
      let nextPrayerInfo = null

      // First check if any prayer is later today
      for (const prayer of prayerTimesInMinutes) {
        if (prayer.timeInMinutes > currentTimeInMinutes) {
          nextPrayerInfo = prayer
          break
        }
      }

      // If no prayer is found, the next prayer is the first prayer of tomorrow
      if (!nextPrayerInfo && prayerTimesInMinutes.length > 0) {
        nextPrayerInfo = prayerTimesInMinutes[0]
        // Add 24 hours (1440 minutes) for tomorrow's prayer
        nextPrayerInfo.timeInMinutes += 1440
      }

      if (nextPrayerInfo) {
        // Calculate time remaining
        let minutesRemaining = nextPrayerInfo.timeInMinutes - currentTimeInMinutes
        if (minutesRemaining < 0) {
          minutesRemaining += 1440 // Add 24 hours if it's tomorrow
        }

        const hoursRemaining = Math.floor(minutesRemaining / 60)
        const remainingMinutes = minutesRemaining % 60
        const secondsRemaining = 60 - now.getSeconds()

        const timeRemaining = `${hoursRemaining}h ${remainingMinutes}m ${secondsRemaining}s`

        setNextPrayer({
          name: nextPrayerInfo.name,
          arabicName: nextPrayerInfo.arabicName,
          time: nextPrayerInfo.time,
          timeRemaining,
        })
      }
    }

    // Initial calculation
    calculateNextPrayer()

    return () => clearInterval(timer)
  }, [prayerTimes, currentTime])

  // Add this function to format the current time
  const formatCurrentTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const ampm = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`
  }

  // Try to get user's location when the times tab is selected
  useEffect(() => {
    if (activeTab === "times" && !location && !isLoadingTimes) {
      // Set Cairo, Egypt as default location instead of using geolocation
      setLocation({
        city: "Cairo",
        country: "Egypt",
        latitude: 30.0444,
        longitude: 31.2357,
      })

      // Fetch prayer times for Cairo
      fetchPrayerTimes(30.0444, 31.2357)
    }
  }, [activeTab])

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-4rem)] py-8 px-4",
        isDark ? "bg-gradient-to-b from-gray-900 to-gray-800" : `bg-gradient-to-b ${currentTheme.gradient}`,
      )}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={cn("text-3xl font-bold mb-2", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
            {language === "arabic" ? "دليل الصلاة والوضوء" : "Prayer & Ablution Guide"}
          </h1>
          {language === "mixed" && (
            <h2 className={cn("text-xl font-semibold", isDark ? "text-emerald-300" : currentTheme.textSecondary)}>
              دليل الصلاة والوضوء
            </h2>
          )}
          <p className={cn("mt-4 max-w-3xl mx-auto", isDark ? "text-gray-300" : "text-gray-600")}>
            {language === "arabic"
              ? "دليل شامل لأداء الوضوء والصلاة في الإسلام، مع تعليمات خطوة بخطوة وإرشادات مرئية."
              : "A comprehensive guide to performing ablution (Wudu) and prayer (Salah) in Islam, with step-by-step instructions and visual guidance."}
          </p>
        </div>

        <Tabs defaultValue="ablution" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="ablution" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              <span>
                {language === "arabic" ? "الوضوء" : language === "english" ? "Ablution" : "Ablution (الوضوء)"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="prayer" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{language === "arabic" ? "الصلاة" : language === "english" ? "Prayer" : "Prayer (الصلاة)"}</span>
            </TabsTrigger>
            <TabsTrigger value="times" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{language === "arabic" ? "أوقات الصلاة" : "Prayer Times"}</span>
            </TabsTrigger>
          </TabsList>

          {/* Ablution (Wudu) Content */}
          <TabsContent value="ablution">
            <Card className={cn(isDark && "bg-gray-800 border-gray-700")}>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h2 className={cn("text-2xl font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                    {language === "arabic"
                      ? "كيفية الوضوء"
                      : language === "english"
                        ? "How to Perform Ablution (Wudu)"
                        : "How to Perform Ablution (Wudu)"}
                  </h2>
                  {language === "mixed" && (
                    <h3 className={cn("text-xl", isDark ? "text-emerald-300" : currentTheme.textSecondary)}>
                      كيفية الوضوء
                    </h3>
                  )}
                  <p className={cn("mt-2", isDark ? "text-gray-300" : "text-gray-600")}>
                    {language === "arabic"
                      ? "الوضوء هو إجراء إسلامي لتطهير أجزاء من الجسم قبل الصلاة."
                      : "Ablution (Wudu) is the Islamic procedure for cleansing parts of the body before prayer."}
                  </p>
                </div>

                <div className="space-y-12">
                  {ablutionSteps.map((step) => (
                    <div key={step.id} className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={step.image || "/placeholder.svg"}
                            alt={`Step ${step.id}: ${language === "arabic" ? step.arabicTitle : step.title}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full text-white font-bold",
                              isDark ? "bg-emerald-700" : currentTheme.primary,
                            )}
                          >
                            {step.id}
                          </div>
                          {renderTitle(step.title, step.arabicTitle)}
                        </div>
                        <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                          {language === "arabic"
                            ? step.id === 1
                              ? "انوِ في قلبك أداء الوضوء لغرض الصلاة. النية محلها القلب ولا يُشترط التلفظ بها."
                              : step.id === 2
                                ? "اغسل يديك إلى الرسغين ثلاث مرات، مع التأكد من غسل ما بين الأصابع."
                                : step.id === 3
                                  ? "خذ الماء في فمك واغسله جيداً ثلاث مرات."
                                  : step.id === 4
                                    ? "استنشق الماء في أنفك ثم انثره ثلاث مرات."
                                    : step.id === 5
                                      ? "اغسل وجهك من منبت شعر الرأس إلى الذقن ومن الأذن إلى الأذن ثلاث مرات."
                                      : step.id === 6
                                        ? "اغسل ذراعك الأيمن من الرسغ إلى المرفق ثلاث مرات، ثم الذراع الأيسر."
                                        : step.id === 7
                                          ? "امسح رأسك بيديك المبللتين من الأمام إلى الخلف مرة واحدة."
                                          : step.id === 8
                                            ? "امسح داخل وخارج أذنيك بأصابعك المبللة مرة واحدة."
                                            : "اغسل قدمك اليمنى إلى الكعبين ثلاث مرات، ثم القدم اليسرى."
                            : step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 rounded-lg bg-opacity-50 border border-dashed text-center">
                  <h3
                    className={cn("text-lg font-semibold mb-2", isDark ? "text-emerald-400" : currentTheme.textPrimary)}
                  >
                    Important Notes
                  </h3>
                  <ul
                    className={cn(
                      "list-disc list-inside text-left space-y-2",
                      isDark ? "text-gray-300" : "text-gray-600",
                    )}
                  >
                    <li>Wudu should be performed in the correct sequence as shown above.</li>
                    <li>Each part should be washed thoroughly, ensuring water reaches all required areas.</li>
                    <li>
                      Wudu is invalidated by natural discharges, deep sleep, unconsciousness, or touching private parts.
                    </li>
                    <li>
                      If you are unable to use water due to illness or unavailability, you may perform Tayammum (dry
                      ablution).
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prayer (Salah) Content - similar language handling would be applied here */}
          <TabsContent value="prayer">
            <Card className={cn(isDark && "bg-gray-800 border-gray-700")}>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h2 className={cn("text-2xl font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                    {language === "arabic"
                      ? "كيفية الصلاة"
                      : language === "english"
                        ? "How to Perform Prayer (Salah)"
                        : "How to Perform Prayer (Salah)"}
                  </h2>
                  {language === "mixed" && (
                    <h3 className={cn("text-xl", isDark ? "text-emerald-300" : currentTheme.textSecondary)}>
                      كيفية الصلاة
                    </h3>
                  )}
                  <p className={cn("mt-2", isDark ? "text-gray-300" : "text-gray-600")}>
                    {language === "arabic"
                      ? "الصلاة هي أحد أركان الإسلام الخمسة، تؤدى خمس مرات يوميًا."
                      : "Prayer (Salah) is one of the five pillars of Islam, performed five times daily."}
                  </p>
                </div>

                <div className="space-y-12">
                  {prayerSteps.map((step) => (
                    <div key={step.id} className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={step.image || "/placeholder.svg"}
                            alt={`Step ${step.id}: ${language === "arabic" ? step.arabicTitle : step.title}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full text-white font-bold",
                              isDark ? "bg-emerald-700" : currentTheme.primary,
                            )}
                          >
                            {step.id}
                          </div>
                          {renderTitle(step.title, step.arabicTitle)}
                        </div>
                        <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                          {language === "arabic"
                            ? step.id === 1
                              ? "قف مستقبلاً القبلة (اتجاه الكعبة في مكة). ارفع يديك إلى أذنيك وقل 'الله أكبر' (تكبيرة الإحرام)."
                              : step.id === 2
                                ? "ضع يدك اليمنى فوق اليسرى على صدرك. اقرأ سورة الفاتحة متبوعة بأي سورة أخرى أو آيات من القرآن."
                                : step.id === 3
                                  ? "قل 'الله أكبر' وانحنِ مع استقامة ظهرك ويديك على ركبتيك. قل 'سبحان ربي العظيم' ثلاث مرات."
                                  : step.id === 4
                                    ? "ارفع من الركوع وقل 'سمع الله لمن حمده، ربنا ولك الحمد' (الله يسمع من يحمده. ربنا، لك الحمد)."
                                    : step.id === 5
                                      ? "قل 'الله أكبر' واسجد بحيث تلمس جبهتك وأنفك وكفيك وركبتيك وأصابع قدميك الأرض. قل 'سبحان ربي الأعلى' ثلاث مرات."
                                      : step.id === 6
                                        ? "ارفع من السجود قائلاً 'الله أكبر' واجلس لفترة وجيزة. قل 'رب اغفر لي' (ربي اغفر لي)."
                                        : step.id === 7
                                          ? "قل 'الله أكبر' واسجد مرة أخرى كما فعلت سابقاً، قائلاً 'سبحان ربي الأعلى' ثلاث مرات."
                                          : step.id === 8
                                            ? "بعد إكمال العدد المطلوب من الركعات (وحدات الصلاة)، اجلس للتشهد الأخير. اقرأ التشهد وصلِّ على النبي محمد (صلى الله عليه وسلم)."
                                            : "أدر وجهك إلى اليمين قائلاً 'السلام عليكم ورحمة الله' (السلام ورحمة الله عليكم)، ثم إلى اليسار مكرراً نفس الكلمات."
                            : step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 rounded-lg bg-opacity-50 border border-dashed text-center">
                  <h3
                    className={cn("text-lg font-semibold mb-2", isDark ? "text-emerald-400" : currentTheme.textPrimary)}
                  >
                    {language === "arabic" ? "عدد الركعات في كل صلاة" : "Number of Rak'ahs (Units) in Each Prayer"}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <div className={cn("p-3 rounded-lg", isDark ? "bg-gray-700" : "bg-emerald-50")}>
                      <h4 className={cn("font-semibold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                        {language === "arabic" ? "الفجر" : "Fajr"}
                      </h4>
                      <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                        {language === "arabic" ? "ركعتان" : "2 Rak'ahs"}
                      </p>
                    </div>
                    <div className={cn("p-3 rounded-lg", isDark ? "bg-gray-700" : "bg-emerald-50")}>
                      <h4 className={cn("font-semibold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                        {language === "arabic" ? "الظهر" : "Dhuhr"}
                      </h4>
                      <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                        {language === "arabic" ? "٤ ركعات" : "4 Rak'ahs"}
                      </p>
                    </div>
                    <div className={cn("p-3 rounded-lg", isDark ? "bg-gray-700" : "bg-emerald-50")}>
                      <h4 className={cn("font-semibold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                        {language === "arabic" ? "العصر" : "Asr"}
                      </h4>
                      <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                        {language === "arabic" ? "٤ ركعات" : "4 Rak'ahs"}
                      </p>
                    </div>
                    <div className={cn("p-3 rounded-lg", isDark ? "bg-gray-700" : "bg-emerald-50")}>
                      <h4 className={cn("font-semibold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                        {language === "arabic" ? "المغرب" : "Maghrib"}
                      </h4>
                      <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                        {language === "arabic" ? "٣ ركعات" : "3 Rak'ahs"}
                      </p>
                    </div>
                    <div className={cn("p-3 rounded-lg", isDark ? "bg-gray-700" : "bg-emerald-50")}>
                      <h4 className={cn("font-semibold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                        {language === "arabic" ? "العشاء" : "Isha"}
                      </h4>
                      <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                        {language === "arabic" ? "٤ ركعات" : "4 Rak'ahs"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prayer Times Content */}
          <TabsContent value="times">
            <Card className={cn(isDark && "bg-gray-800 border-gray-700")}>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h2 className={cn("text-2xl font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}>
                    {language === "arabic" ? "أوقات الصلاة" : "Prayer Times"}
                  </h2>
                  {language === "mixed" && (
                    <h3 className={cn("text-xl", isDark ? "text-emerald-300" : currentTheme.textSecondary)}>
                      أوقات الصلاة
                    </h3>
                  )}
                  <p className={cn("mt-2", isDark ? "text-gray-300" : "text-gray-600")}>
                    {language === "arabic"
                      ? "يجب على المسلمين الصلاة خمس مرات في اليوم في أوقات محددة."
                      : "Muslims are required to pray five times a day at specific times."}
                  </p>
                </div>

                {/* Location search */}
                <div className="mb-6">
                  <form onSubmit={searchLocation} className="flex flex-col md:flex-row gap-2 max-w-md mx-auto">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder={language === "arabic" ? "ابحث عن مدينة..." : "Search for a city..."}
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className={cn(
                          "pl-9",
                          isDark && "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400",
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      className={cn(isDark ? "bg-emerald-700 hover:bg-emerald-800" : currentTheme.primary)}
                      disabled={isLoadingTimes}
                    >
                      {isLoadingTimes ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : language === "arabic" ? (
                        "بحث"
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </form>
                </div>

                {/* Prayer times display */}
                {isLoadingTimes ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2
                      className={cn(
                        "h-12 w-12 animate-spin mb-4",
                        isDark ? "text-emerald-400" : currentTheme.textPrimary,
                      )}
                    />
                    <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                      {language === "arabic" ? "جاري تحميل أوقات الصلاة..." : "Loading prayer times..."}
                    </p>
                  </div>
                ) : location && prayerTimes.length > 0 ? (
                  <div>
                    <div className="text-center mb-4">
                      <h3
                        className={cn("text-xl font-semibold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}
                      >
                        {language === "arabic"
                          ? `أوقات الصلاة في ${location.city}، ${location.country}`
                          : `Prayer Times in ${location.city}, ${location.country}`}
                      </h3>
                      <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{date}</p>

                      {/* Current time and next prayer display */}
                      <div className="mt-4 mb-6 flex flex-col md:flex-row justify-center items-center gap-4">
                        <div
                          className={cn(
                            "px-4 py-3 rounded-lg flex items-center gap-2",
                            isDark ? "bg-gray-700" : "bg-emerald-50",
                          )}
                        >
                          <Clock className={cn("h-5 w-5", isDark ? "text-emerald-400" : currentTheme.textPrimary)} />
                          <div>
                            <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                              {language === "arabic" ? "الوقت الحالي" : "Current Time"}
                            </p>
                            <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-800")}>
                              {formatCurrentTime(currentTime)}
                            </p>
                          </div>
                        </div>

                        {nextPrayer && (
                          <div
                            className={cn(
                              "px-4 py-3 rounded-lg flex items-center gap-2",
                              isDark ? "bg-gray-700" : "bg-emerald-50",
                            )}
                          >
                            <Timer className={cn("h-5 w-5", isDark ? "text-emerald-400" : currentTheme.textPrimary)} />
                            <div>
                              <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                                {language === "arabic" ? "الصلاة القادمة" : "Next Prayer"}
                              </p>
                              <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-800")}>
                                {language === "arabic" ? nextPrayer.arabicName : nextPrayer.name} ({nextPrayer.time})
                              </p>
                              <p className={cn("text-sm", isDark ? "text-emerald-300" : currentTheme.textSecondary)}>
                                {language === "arabic" ? "متبقي: " : "Time remaining: "}
                                <span className="font-medium">{nextPrayer.timeRemaining}</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {prayerTimes.map((prayer) => (
                        <div
                          key={prayer.name}
                          className={cn(
                            "p-4 rounded-lg flex justify-between items-center",
                            isDark ? "bg-gray-700" : "bg-emerald-50",
                          )}
                        >
                          <div>
                            <h4 className={cn("font-semibold", isDark ? "text-white" : "text-gray-800")}>
                              {language === "arabic" ? prayer.arabicName : prayer.name}
                            </h4>
                            {language === "mixed" && (
                              <p className={cn("text-sm", isDark ? "text-emerald-300" : currentTheme.textSecondary)}>
                                {prayer.arabicName}
                              </p>
                            )}
                          </div>
                          <div
                            className={cn("text-xl font-bold", isDark ? "text-emerald-400" : currentTheme.textPrimary)}
                          >
                            {prayer.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Prayer times information */}
                    <div className="space-y-4">
                      {prayerTimesInfo.map((prayer, index) => (
                        <div
                          key={prayer.name}
                          className={cn(
                            "p-4 rounded-lg flex flex-col md:flex-row md:items-center",
                            isDark ? "bg-gray-700" : "bg-emerald-50",
                          )}
                        >
                          <div className="md:w-1/4 mb-2 md:mb-0">
                            <h3
                              className={cn(
                                "text-xl font-semibold",
                                isDark ? "text-emerald-400" : currentTheme.textPrimary,
                              )}
                            >
                              {language === "arabic" ? prayer.arabicName : prayer.name}
                            </h3>
                            {language === "mixed" && (
                              <h4 className={cn("text-lg", isDark ? "text-emerald-300" : currentTheme.textSecondary)}>
                                {prayer.arabicName}
                              </h4>
                            )}
                          </div>
                          <div className="md:w-3/4">
                            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                              {language === "arabic"
                                ? prayer.name === "Fajr"
                                  ? "صلاة الفجر، تؤدى قبل شروق الشمس"
                                  : prayer.name === "Dhuhr"
                                    ? "صلاة الظهر، تؤدى بعد زوال الشمس عن وسط السماء"
                                    : prayer.name === "Asr"
                                      ? "صلاة العصر، تؤدى عندما يصبح ظل الشيء مساوياً لطوله بالإضافة إلى ظله وقت الزوال"
                                      : prayer.name === "Maghrib"
                                        ? "صلاة المغرب، تؤدى بعد غروب الشمس"
                                        : "صلاة العشاء، تؤدى بعد اختفاء الشفق"
                                : prayer.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 p-4 rounded-lg bg-opacity-50 border border-dashed">
                  <h3
                    className={cn(
                      "text-lg font-semibold mb-2 text-center",
                      isDark ? "text-emerald-400" : currentTheme.textPrimary,
                    )}
                  >
                    {language === "arabic" ? "ملاحظات مهمة حول أوقات الصلاة" : "Important Notes About Prayer Times"}
                  </h3>
                  <ul className={cn("list-disc list-inside space-y-2", isDark ? "text-gray-300" : "text-gray-600")}>
                    {language === "arabic" ? (
                      <>
                        <li>تختلف أوقات الصلاة حسب الموقع الجغرافي ووقت السنة.</li>
                        <li>يستحب أداء الصلاة في أول وقتها.</li>
                        <li>
                          هناك ثلاثة أوقات يُنهى عن الصلاة فيها: عند شروق الشمس، وعند استواء الشمس، وعند غروب الشمس.
                        </li>
                        <li>
                          توفر العديد من تطبيقات الهاتف المحمول والمواقع الإلكترونية أوقات صلاة دقيقة بناءً على موقعك.
                        </li>
                        <li>يُرفع الأذان للإعلام بدخول وقت الصلاة.</li>
                      </>
                    ) : (
                      <>
                        <li>Prayer times vary based on geographical location and time of year.</li>
                        <li>It is recommended to pray as soon as the time for prayer enters.</li>
                        <li>
                          There are three times when prayer is forbidden: during sunrise, when the sun is at its zenith,
                          and during sunset.
                        </li>
                        <li>Many mobile apps and websites provide accurate prayer times based on your location.</li>
                        <li>
                          The Adhan (call to prayer) is announced to inform Muslims that the time for prayer has
                          entered.
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
            {language === "arabic"
              ? "ملاحظة: هذا الدليل لأغراض تعليمية. للأحكام التفصيلية، يرجى استشارة العلماء المختصين."
              : "Note: This guide is for educational purposes. For detailed rulings, please consult with knowledgeable scholars."}
          </p>
        </div>
      </div>
    </div>
  )
}
