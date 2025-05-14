"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine)

    // Add event listeners for online/offline events
    const handleOnline = () => {
      setIsOffline(false)
      // Show the indicator briefly when coming back online
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 3000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setIsVisible(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2",
        "border-2 border-[#00ff00] bg-[#0b3d0b] text-[#00ff00]",
        "flex items-center gap-2 transition-opacity duration-300",
        isOffline ? "opacity-100" : "opacity-0",
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span>{isOffline ? "OFFLINE MODE ACTIVE" : "CONNECTION RESTORED"}</span>
    </div>
  )
}
