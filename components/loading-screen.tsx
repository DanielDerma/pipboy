"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  isLoading: boolean
  onLoadingComplete: () => void
  message?: string
}

export function LoadingScreen({ isLoading, onLoadingComplete, message = "LOADING DATA" }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [showScreen, setShowScreen] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setShowScreen(true)
      setProgress(0)

      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.random() * 15
          return next >= 100 ? 100 : next
        })
      }, 150)

      return () => clearInterval(interval)
    } else {
      setShowScreen(false)
    }
  }, [isLoading])

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onLoadingComplete()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [progress, onLoadingComplete])

  if (!showScreen) return null

  return (
    <div
      className={cn(
        "absolute inset-0 bg-[#0b3d0b] z-50 flex flex-col items-center justify-center",
        "transition-opacity duration-300",
        progress >= 100 ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="w-full max-w-md space-y-6 p-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl uppercase glow-text intense-flicker">{message}</h2>
          <p className="text-sm loading-dots">PLEASE STAND BY</p>
        </div>

        <div className="border-2 border-[#00ff00] bg-[#0b3d0b]/50 h-6 relative overflow-hidden">
          <div
            className="h-full bg-[#00ff00] absolute top-0 left-0 loading-bar"
            style={{ width: `${progress}%` }}
          ></div>
          <div className="absolute inset-0 pixel-overlay"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[#0b3d0b] font-bold">
            {Math.floor(progress)}%
          </div>
        </div>

        <div className="text-center text-xs">
          <p className="uppercase">VAULT-TEC INDUSTRIES</p>
          <p>COPYRIGHT 2077</p>
        </div>
      </div>
    </div>
  )
}
