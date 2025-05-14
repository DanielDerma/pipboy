"use client"

import { useState, useRef, useEffect } from "react"
import { Check } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"

type Daily = {
  id: number
  name: string
  completed: boolean
  streak: number
  dueDate: string
  xpValue: number
  animating?: boolean
}

export function DailiesTab() {
  const [dailies, setDailies] = useState<Daily[]>([
    { id: 1, name: "Morning Routine", completed: false, streak: 3, dueDate: "Today", xpValue: 10 },
    { id: 2, name: "Check Radiation Levels", completed: true, streak: 7, dueDate: "Today", xpValue: 15 },
    { id: 3, name: "Scavenge Supplies", completed: false, streak: 2, dueDate: "Today", xpValue: 20 },
    { id: 4, name: "Patrol Perimeter", completed: false, streak: 5, dueDate: "Today", xpValue: 25 },
    { id: 5, name: "Maintain Weapons", completed: false, streak: 1, dueDate: "Today", xpValue: 30 },
  ])

  const [xpGain, setXpGain] = useState({ amount: 0, show: false })
  const [currentXp, setCurrentXp] = useState(2750)
  const [maxXp, setMaxXp] = useState(4000)
  const xpBarRef = useRef<HTMLDivElement>(null)

  // Calculate XP percentage
  const xpPercentage = (currentXp / maxXp) * 100

  const toggleDaily = (id: number) => {
    setDailies(
      dailies.map((daily) => {
        if (daily.id === id) {
          // If completing the task
          if (!daily.completed) {
            // Show XP gain and update XP
            setXpGain({ amount: daily.xpValue, show: true })
            setCurrentXp((prev) => Math.min(prev + daily.xpValue, maxXp))

            // Return with animation flag
            return {
              ...daily,
              completed: true,
              streak: daily.streak + 1,
              animating: true,
            }
          } else {
            // If uncompleting the task
            setCurrentXp((prev) => Math.max(prev - daily.xpValue, 0))
            return {
              ...daily,
              completed: false,
              streak: Math.max(daily.streak - 1, 0),
            }
          }
        }
        return daily
      }),
    )
  }

  // Update XP bar width with animation
  useEffect(() => {
    if (xpBarRef.current) {
      const initialWidth = xpBarRef.current.style.width
      xpBarRef.current.style.setProperty("--initial-width", initialWidth)
      xpBarRef.current.style.setProperty("--target-width", `${xpPercentage}%`)
    }
  }, [xpPercentage])

  // Reset animation flags after animation completes
  useEffect(() => {
    const animatingDailies = dailies.filter((daily) => daily.animating)
    if (animatingDailies.length > 0) {
      const timer = setTimeout(() => {
        setDailies(
          dailies.map((daily) => {
            if (daily.animating) {
              return { ...daily, animating: false }
            }
            return daily
          }),
        )
      }, 1500) // Match the animation duration
      return () => clearTimeout(timer)
    }
  }, [dailies])

  const handleXpAnimationComplete = () => {
    setXpGain({ amount: 0, show: false })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl uppercase glow-text">Dailies</h2>

      {/* XP Bar */}
      <div className="relative mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span>XP</span>
          <span>
            {currentXp}/{maxXp}
          </span>
        </div>
        <div className="h-3 border-2 border-[#00ff00] bg-[#0b3d0b]/50 relative overflow-hidden">
          <div
            ref={xpBarRef}
            className={`h-full bg-[#00ff00] absolute top-0 left-0 ${xpGain.show ? "xp-fill" : ""}`}
            style={{ width: `${xpPercentage}%` }}
          />
          <div className="absolute inset-0 pixel-overlay"></div>

          {/* XP Gain Indicator */}
          <XPIndicator xpGained={xpGain.amount} show={xpGain.show} onAnimationComplete={handleXpAnimationComplete} />
        </div>
      </div>

      <div className="space-y-2 relative">
        {dailies.map((daily) => (
          <div
            key={daily.id}
            className={`grid grid-cols-12 items-center py-2 border-b border-[#00ff00]/30 hover:bg-[#00ff00]/10 relative ${
              daily.animating ? "task-flash scanline-animation" : ""
            } ${daily.completed && !daily.animating ? "task-fade" : ""}`}
          >
            <div className="col-span-1">
              <button
                onClick={() => toggleDaily(daily.id)}
                className={`w-6 h-6 border-2 ${
                  daily.completed ? "bg-[#00ff00] border-[#00ff00]" : "bg-transparent border-[#00ff00]"
                } rounded-sm flex items-center justify-center`}
              >
                {daily.completed && <Check className="w-4 h-4 text-[#0b3d0b]" />}
              </button>
            </div>
            <div className={`col-span-7 ${daily.completed ? "line-through opacity-70" : ""}`}>{daily.name}</div>
            <div className="col-span-2 text-center text-sm">
              <span className="glow-text">{daily.streak}🔥</span>
            </div>
            <div className="col-span-2 text-right text-sm">{daily.dueDate}</div>
          </div>
        ))}
      </div>

      <div className="text-sm text-[#00ff00]/70 mt-4">Complete dailies to build streaks and earn rewards.</div>
    </div>
  )
}
