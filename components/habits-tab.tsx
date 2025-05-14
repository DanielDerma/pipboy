"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Minus } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"

type Habit = {
  id: number
  name: string
  count: number
  positive: boolean
  negative: boolean
  xpValue: number
  animating?: boolean
}

export function HabitsTab() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, name: "Exercise", count: 0, positive: true, negative: false, xpValue: 10 },
    { id: 2, name: "Drink Water", count: 0, positive: true, negative: false, xpValue: 5 },
    { id: 3, name: "Meditate", count: 0, positive: true, negative: false, xpValue: 8 },
    { id: 4, name: "Eat Junk Food", count: 0, positive: false, negative: true, xpValue: 5 },
    { id: 5, name: "Skip Workout", count: 0, positive: false, negative: true, xpValue: 10 },
  ])

  const [xpGain, setXpGain] = useState({ amount: 0, show: false })
  const [currentXp, setCurrentXp] = useState(2750)
  const [maxXp, setMaxXp] = useState(4000)
  const xpBarRef = useRef<HTMLDivElement>(null)

  // Calculate XP percentage
  const xpPercentage = (currentXp / maxXp) * 100

  const incrementHabit = (id: number) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          // Show XP gain and update XP
          setXpGain({ amount: habit.xpValue, show: true })
          setCurrentXp((prev) => Math.min(prev + habit.xpValue, maxXp))

          return {
            ...habit,
            count: habit.count + 1,
            animating: true,
          }
        }
        return habit
      }),
    )
  }

  const decrementHabit = (id: number) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          // Reduce XP for negative habits
          setXpGain({ amount: -habit.xpValue, show: true })
          setCurrentXp((prev) => Math.max(prev - habit.xpValue, 0))

          return {
            ...habit,
            count: habit.count - 1,
            animating: true,
          }
        }
        return habit
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
    const animatingHabits = habits.filter((habit) => habit.animating)
    if (animatingHabits.length > 0) {
      const timer = setTimeout(() => {
        setHabits(
          habits.map((habit) => {
            if (habit.animating) {
              return { ...habit, animating: false }
            }
            return habit
          }),
        )
      }, 1500) // Match the animation duration
      return () => clearTimeout(timer)
    }
  }, [habits])

  const handleXpAnimationComplete = () => {
    setXpGain({ amount: 0, show: false })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl uppercase glow-text">Habits</h2>

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

      <div className="space-y-2">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`grid grid-cols-12 items-center py-2 border-b border-[#00ff00]/30 hover:bg-[#00ff00]/10 relative ${
              habit.animating ? "task-flash scanline-animation terminal-flicker" : ""
            }`}
          >
            <div className="col-span-6 md:col-span-8">{habit.name}</div>
            <div className="col-span-2 text-center">{habit.count}</div>
            <div className="col-span-4 md:col-span-2 flex justify-end space-x-2">
              {habit.positive && (
                <button
                  onClick={() => incrementHabit(habit.id)}
                  className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                >
                  <Plus className="w-5 h-5 text-[#00ff00]" />
                </button>
              )}
              {habit.negative && (
                <button
                  onClick={() => decrementHabit(habit.id)}
                  className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                >
                  <Minus className="w-5 h-5 text-[#00ff00]" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-[#00ff00]/70 mt-4">
        Use + for good habits and - for bad habits to track your progress.
      </div>
    </div>
  )
}
