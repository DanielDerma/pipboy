"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Minus, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"
import { RetroModal } from "@/components/retro-modal"
import { RetroFormField } from "@/components/retro-form-field"
import { cn } from "@/lib/utils"
import { habitsDB, userDB, type Habit } from "@/lib/db-service"
import { notificationService } from "@/lib/notification-service"
import { useUser } from "@/hooks/useUser"

export function HabitsTab() {
  const { updateUser } = useUser()
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [xpGain, setXpGain] = useState({ amount: 0, show: false })
  const [currentXp, setCurrentXp] = useState(0)
  const [maxXp, setMaxXp] = useState(1000)
  const xpBarRef = useRef<HTMLDivElement>(null)

  // Calculate XP percentage
  const xpPercentage = (currentXp / maxXp) * 100

  // Load habits from IndexedDB
  useEffect(() => {
    const loadHabits = async () => {
      try {
        setIsLoading(true)
        const data = await habitsDB.getAll()
        setHabits(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load habits:", err)
        setError("Failed to load habits. Please try again.")
        notificationService.error("Failed to load habits")
      } finally {
        setIsLoading(false)
      }
    }

    loadHabits()
  }, [])

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await userDB.get()
        if (user) {
          setCurrentXp(user.xp)
          // Calculate max XP based on level (1000 XP per level)
          setMaxXp(user.level * 1000)
        } else {
          // Initialize user if not exists
          const newUser = await userDB.initialize()
          setCurrentXp(newUser.xp)
          setMaxXp(newUser.level * 1000)
        }
      } catch (err) {
        console.error("Failed to load user data:", err)
        notificationService.error("Failed to load user data")
      }
    }

    loadUserData()
  }, [])

  const incrementHabit = async (habit: Habit) => {
    try {
      const updatedHabit = {
        ...habit,
        count: habit.count + 1,
      }

      // Update in IndexedDB
      await habitsDB.update(updatedHabit)

      // Update local state
      setHabits((prevHabits) =>
        prevHabits.map((h) => (h.id === habit.id ? { ...h, count: h.count + 1, animating: true } : h)),
      )

      // Show XP gain and update XP
      setXpGain({ amount: habit.xpValue, show: true })
      setCurrentXp((prev) => Math.min(prev + habit.xpValue, maxXp))

      // Update user XP in database
      userDB.get().then((user) => {
        if (user) {
          const newXp = Math.min(user.xp + habit.xpValue, maxXp)
          updateUser({ ...user, xp: newXp })
        }
      })

      notificationService.success(`Incremented ${habit.name}`)
    } catch (err) {
      console.error("Failed to increment habit:", err)
      notificationService.error("Failed to update habit")
    }
  }

  const decrementHabit = async (habit: Habit) => {
    try {
      const updatedHabit = {
        ...habit,
        count: habit.count - 1,
      }

      // Update in IndexedDB
      await habitsDB.update(updatedHabit)

      // Update local state
      setHabits((prevHabits) =>
        prevHabits.map((h) => (h.id === habit.id ? { ...h, count: h.count - 1, animating: true } : h)),
      )

      // Show XP loss and update XP
      setXpGain({ amount: -habit.xpValue, show: true })
      setCurrentXp((prev) => Math.max(prev - habit.xpValue, 0))

      // Update user XP in database
      userDB.get().then((user) => {
        if (user) {
          const newXp = Math.max(user.xp - habit.xpValue, 0)
          updateUser({ ...user, xp: newXp })
        }
      })

      notificationService.success(`Decremented ${habit.name}`)
    } catch (err) {
      console.error("Failed to decrement habit:", err)
      notificationService.error("Failed to update habit")
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl uppercase glow-text">Habits</h2>
        <button
          onClick={() => {}}
          className="py-1 px-3 border-2 border-[#00ff00] rounded-sm uppercase text-sm flex items-center gap-1 bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
        >
          <Plus className="w-4 h-4" />
          New Habit
        </button>
      </div>

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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#00ff00]/50 bg-[#0b3d0b]/30 rounded-sm">
          <Loader2 className="w-10 h-10 mb-2 text-[#00ff00]/70 animate-spin" />
          <p>Loading habits...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#ff6b6b]/50 bg-[#0b3d0b]/30 rounded-sm">
          <AlertCircle className="w-10 h-10 mb-2 text-[#ff6b6b]/70" />
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
          >
            Retry
          </button>
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#00ff00]/50 bg-[#0b3d0b]/30 rounded-sm">
          <AlertCircle className="w-10 h-10 mb-2 text-[#00ff00]/70" />
          <p>No habits created yet.</p>
          <p className="text-sm text-[#00ff00]/70 mt-1">Create your first habit to start tracking!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`grid grid-cols-12 items-center py-2 border-b border-[#00ff00]/30 hover:bg-[#00ff00]/10 relative ${
                habit.animating ? "task-flash scanline-animation terminal-flicker" : ""
              }`}
            >
              <div className="col-span-6 md:col-span-7">
                <div>
                  <span className="font-bold">{habit.name}</span>
                  {habit.description && <p className="text-xs text-[#00ff00]/70 mt-0.5">{habit.description}</p>}
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 text-center">{habit.count}</div>
              <div className="col-span-4 flex justify-end space-x-2">
                {habit.positive && (
                  <button
                    onClick={() => incrementHabit(habit)}
                    className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                    title="Increment"
                  >
                    <Plus className="w-5 h-5 text-[#00ff00]" />
                  </button>
                )}
                {habit.negative && (
                  <button
                    onClick={() => decrementHabit(habit)}
                    className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                    title="Decrement"
                  >
                    <Minus className="w-5 h-5 text-[#00ff00]" />
                  </button>
                )}
                <button
                  onClick={() => {}}
                  className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-[#00ff00]" />
                </button>
                <button
                  onClick={() => {}}
                  className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-[#00ff00]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-[#00ff00]/70 mt-4">
        Use + for good habits and - for bad habits to track your progress.
      </div>
    </div>
  )
}
