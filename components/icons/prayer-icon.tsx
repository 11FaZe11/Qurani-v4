import type { LightbulbIcon as LucideProps } from "lucide-react"

export function Prayer(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2c1.5 0 3 .83 3 2.5S13.5 7 12 7s-3-.83-3-2.5S10.5 2 12 2z" />
      <path d="M12 7v7" />
      <path d="m9 10 3 -3 3 3" />
      <path d="M6 20c0-3 1.5-5.5 6-5.5s6 2.5 6 5.5" />
    </svg>
  )
}
