/**
 * Utility functions for handling files in the chat interface
 */

// Convert a file to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(",")[1]
        resolve(base64)
      } else {
        reject(new Error("Failed to convert file to base64"))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

// Get MIME type from file
export const getFileMimeType = (file: File): string => {
  return file.type || "application/octet-stream"
}

// Check if a file is an image
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/")
}

// Check if a file is a PDF
export const isPdfFile = (file: File): boolean => {
  return file.type === "application/pdf"
}

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

// Get a thumbnail URL for a file
export const getFileThumbnail = (file: File): string => {
  if (isImageFile(file)) {
    return URL.createObjectURL(file)
  }

  // Return appropriate icon based on file type
  if (isPdfFile(file)) {
    return "/file-icons/pdf.svg"
  }

  // Default file icon
  return "/file-icons/document.svg"
}
