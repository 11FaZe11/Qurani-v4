import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-emerald-800">404</h1>
          <h2 className="text-2xl font-semibold text-emerald-700">Page Not Found</h2>
          <p className="text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
        </div>

        <div className="flex justify-center">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
