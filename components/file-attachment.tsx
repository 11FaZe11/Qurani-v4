"use client"

import Image from "next/image"
import { FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatFileSize, isImageFile } from "@/lib/file-utils"
import { useTheme } from "next-themes"

interface FileAttachmentProps {
  file: File
  preview?: string
  onRemove?: () => void
  showRemoveButton?: boolean
  className?: string
}

export function FileAttachment({ file, preview, onRemove, showRemoveButton = true, className }: FileAttachmentProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const isImage = isImageFile(file)

  return (
    <div
      className={cn(
        "relative rounded-md overflow-hidden border",
        isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200",
        className,
      )}
    >
      {showRemoveButton && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 z-10"
          onClick={onRemove}
        >
          <X className="h-3 w-3 text-white" />
        </Button>
      )}

      {isImage && preview ? (
        <div className="relative h-32 w-full">
          <Image
            src={preview || "/placeholder.svg"}
            alt={file.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
      ) : (
        <div className={cn("flex items-center justify-center h-20 w-full", isDark ? "bg-gray-700" : "bg-gray-100")}>
          <FileText className={cn("h-10 w-10", isDark ? "text-gray-400" : "text-gray-500")} />
        </div>
      )}

      <div className="p-2">
        <p className={cn("text-sm font-medium truncate", isDark ? "text-gray-200" : "text-gray-700")}>{file.name}</p>
        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>{formatFileSize(file.size)}</p>
      </div>
    </div>
  )
}
