export type Theme = {
  id: string
  name: string
  primary: string
  primaryLight: string
  primaryDark: string
  accent: string
  gradient: string
  textPrimary: string
  textSecondary: string
  buttonText: string
}

export const themes: Theme[] = [
  {
    id: "emerald",
    name: "Emerald",
    primary: "bg-emerald-600",
    primaryLight: "bg-emerald-100",
    primaryDark: "bg-emerald-800",
    accent: "bg-emerald-50",
    gradient: "from-emerald-50 to-white",
    textPrimary: "text-emerald-800",
    textSecondary: "text-emerald-600",
    buttonText: "text-white",
  },
]

export const getThemeById = (id: string): Theme => {
  return themes[0] // Always return the emerald theme
}
