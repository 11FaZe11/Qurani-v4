"use client"

import { useState } from "react"
import { Check, Globe, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage, type LanguageOption } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const languageOptions: { value: LanguageOption; label: string }[] = [
    { value: "mixed", label: "Mixed (Arabic & English)" },
    { value: "arabic", label: "Arabic Only" },
    { value: "english", label: "English Only" },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("flex items-center gap-1 px-2", isDark && "hover:bg-gray-800")}>
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline">
            {languageOptions.find((option) => option.value === language)?.label || "Language"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(isDark && "bg-gray-800 border-gray-700")}>
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              setLanguage(option.value)
              setOpen(false)
            }}
            className={cn("flex items-center justify-between", isDark && "hover:bg-gray-700 focus:bg-gray-700")}
          >
            {option.label}
            {language === option.value && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
