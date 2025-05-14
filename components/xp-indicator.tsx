"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface XPIndicatorProps {
  xpGained: number
  show: boolean
  onAnimationComplete: () => void
}

export function XPIndicator({ xpGained, show, onAnimationComplete }: XPIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onAnimationComplete()
      }, 2000) // Match the animation duration
      return () => clearTimeout(timer)
    }
  }, [show, onAnimationComplete])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "absolute right-4 text-sm font-bold text-[#00ff00] glow-text xp-appear",
        "flex items-center justify-center",
      )}
    >
      +{xpGained} XP
    </div>
  )
}
