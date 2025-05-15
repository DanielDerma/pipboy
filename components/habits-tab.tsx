"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Minus, Edit, Trash2, AlertCircle } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"
import { RetroModal } from "@/components/retro-modal"
import { RetroFormField } from "@/components/retro-form-field"
import { cn } from "@/lib/utils"

type Habit = {
  id: number
  name: string
  count: number
  positive: boolean
  negative: boolean
  xpValue: number
  description?: string
  animating?: boolean
}

export function HabitsTab() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 1,
      name: "Exercise",
      count: 0,
      positive: true,
      negative: false,
      xpValue: 10,
      description: "Stay fit in the wasteland",
    },
    { id: 2, name: "Drink Water", count: 0, positive: true, negative: false, xpValue: 5, description: "Stay hydrated" },
    { id: 3, name: "Meditate", count: 0, positive: true, negative: false, xpValue: 8, description: "Clear your mind" },
    {
      id: 4,
      name: "Eat Junk Food",
      count: 0,
      positive: false,
      negative: true,
      xpValue: 5,
      description: "Unhealthy but tasty",
    },
    {
      id: 5,
      name: "Skip Workout",
      count: 0,
      positive: false,
      negative: true,
      xpValue: 10,
      description: "Missing training sessions",
    },
  ])

  const [xpGain, setXpGain] = useState({ amount: 0, show: false })
  const [currentXp, setCurrentXp] = useState(2750)
  const [maxXp, setMaxXp] = useState(4000)
  const xpBarRef = useRef<HTMLDivElement>(null)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<Habit, "id" | "count" | "animating">>({
    name: "",
    positive: true,
    negative: false,
    xpValue: 5,
    description: "",
  })

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

  // Create new habit
  const handleCreateHabit = () => {
    const newId = habits.length > 0 ? Math.max(...habits.map((h) => h.id)) + 1 : 1

    const newHabit: Habit = {
      id: newId,
      name: formData.name,
      count: 0,
      positive: formData.positive,
      negative: formData.negative,
      xpValue: formData.xpValue,
      description: formData.description,
    }

    setHabits([...habits, newHabit])
    resetForm()
    setIsCreateModalOpen(false)
  }

  // Edit habit
  const handleEditHabit = () => {
    if (!currentHabit) return

    setHabits(
      habits.map((habit) =>
        habit.id === currentHabit.id
          ? {
              ...habit,
              name: formData.name,
              positive: formData.positive,
              negative: formData.negative,
              xpValue: formData.xpValue,
              description: formData.description,
            }
          : habit,
      ),
    )

    resetForm()
    setIsEditModalOpen(false)
  }

  // Delete habit
  const handleDeleteHabit = () => {
    if (!currentHabit) return

    setHabits(habits.filter((habit) => habit.id !== currentHabit.id))
    setIsDeleteModalOpen(false)
  }

  // Open edit modal and populate form
  const openEditModal = (habit: Habit) => {
    setCurrentHabit(habit)
    setFormData({
      name: habit.name,
      positive: habit.positive,
      negative: habit.negative,
      xpValue: habit.xpValue,
      description: habit.description || "",
    })
    setIsEditModalOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (habit: Habit) => {
    setCurrentHabit(habit)
    setIsDeleteModalOpen(true)
  }

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: "",
      positive: true,
      negative: false,
      xpValue: 5,
      description: "",
    })
    setCurrentHabit(null)
  }

  // Open create modal
  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl uppercase glow-text">Habits</h2>
        <button
          onClick={openCreateModal}
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

      {habits.length === 0 ? (
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
                    onClick={() => incrementHabit(habit.id)}
                    className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                    title="Increment"
                  >
                    <Plus className="w-5 h-5 text-[#00ff00]" />
                  </button>
                )}
                {habit.negative && (
                  <button
                    onClick={() => decrementHabit(habit.id)}
                    className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                    title="Decrement"
                  >
                    <Minus className="w-5 h-5 text-[#00ff00]" />
                  </button>
                )}
                <button
                  onClick={() => openEditModal(habit)}
                  className="w-8 h-8 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-[#00ff00]" />
                </button>
                <button
                  onClick={() => openDeleteModal(habit)}
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

      {/* Create Habit Modal */}
      <RetroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Habit">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCreateHabit()
          }}
          className="space-y-4"
        >
          <RetroFormField
            id="habit-name"
            label="Habit Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter habit name"
            required
          />

          <RetroFormField
            id="habit-description"
            label="Description"
            type="textarea"
            value={formData.description || ""}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter a description (optional)"
          />

          <RetroFormField
            id="habit-xp"
            label="XP Value"
            type="number"
            value={formData.xpValue}
            onChange={(value) => setFormData({ ...formData, xpValue: value })}
            min={1}
            max={100}
            required
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Habit Type</p>
            <div className="flex space-x-4">
              <RetroFormField
                id="habit-positive"
                label=""
                type="checkbox"
                placeholder="Positive (+)"
                value={formData.positive}
                onChange={(value) => setFormData({ ...formData, positive: value })}
              />

              <RetroFormField
                id="habit-negative"
                label=""
                type="checkbox"
                placeholder="Negative (-)"
                value={formData.negative}
                onChange={(value) => setFormData({ ...formData, negative: value })}
              />
            </div>
            {!formData.positive && !formData.negative && (
              <p className="text-xs text-[#ff6b6b]">Select at least one habit type</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || (!formData.positive && !formData.negative)}
              className={cn(
                "py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm",
                formData.name && (formData.positive || formData.negative)
                  ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                  : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
              )}
            >
              Create
            </button>
          </div>
        </form>
      </RetroModal>

      {/* Edit Habit Modal */}
      <RetroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Habit">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleEditHabit()
          }}
          className="space-y-4"
        >
          <RetroFormField
            id="edit-habit-name"
            label="Habit Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter habit name"
            required
          />

          <RetroFormField
            id="edit-habit-description"
            label="Description"
            type="textarea"
            value={formData.description || ""}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter a description (optional)"
          />

          <RetroFormField
            id="edit-habit-xp"
            label="XP Value"
            type="number"
            value={formData.xpValue}
            onChange={(value) => setFormData({ ...formData, xpValue: value })}
            min={1}
            max={100}
            required
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Habit Type</p>
            <div className="flex space-x-4">
              <RetroFormField
                id="edit-habit-positive"
                label=""
                type="checkbox"
                placeholder="Positive (+)"
                value={formData.positive}
                onChange={(value) => setFormData({ ...formData, positive: value })}
              />

              <RetroFormField
                id="edit-habit-negative"
                label=""
                type="checkbox"
                placeholder="Negative (-)"
                value={formData.negative}
                onChange={(value) => setFormData({ ...formData, negative: value })}
              />
            </div>
            {!formData.positive && !formData.negative && (
              <p className="text-xs text-[#ff6b6b]">Select at least one habit type</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || (!formData.positive && !formData.negative)}
              className={cn(
                "py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm",
                formData.name && (formData.positive || formData.negative)
                  ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                  : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
              )}
            >
              Save Changes
            </button>
          </div>
        </form>
      </RetroModal>

      {/* Delete Confirmation Modal */}
      <RetroModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Habit">
        <div className="space-y-4">
          <p>
            Are you sure you want to delete <span className="font-bold">{currentHabit?.name}</span>?
          </p>
          <p className="text-sm text-[#00ff00]/70">This action cannot be undone.</p>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteHabit}
              className="py-2 px-4 border-2 border-[#ff6b6b] bg-[#ff6b6b]/20 hover:bg-[#ff6b6b]/30 rounded-sm uppercase text-sm text-[#ff6b6b]"
            >
              Delete
            </button>
          </div>
        </div>
      </RetroModal>
    </div>
  )
}
