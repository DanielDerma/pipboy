"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Edit, Trash2, Plus, AlertCircle, Calendar } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"
import { RetroModal } from "@/components/retro-modal"
import { RetroFormField } from "@/components/retro-form-field"
import { cn } from "@/lib/utils"

type Daily = {
  id: number
  name: string
  completed: boolean
  streak: number
  dueDate: string
  xpValue: number
  description?: string
  animating?: boolean
}

export function DailiesTab() {
  const [dailies, setDailies] = useState<Daily[]>([
    {
      id: 1,
      name: "Morning Routine",
      completed: false,
      streak: 3,
      dueDate: "Today",
      xpValue: 10,
      description: "Complete morning tasks",
    },
    {
      id: 2,
      name: "Check Radiation Levels",
      completed: true,
      streak: 7,
      dueDate: "Today",
      xpValue: 15,
      description: "Monitor radiation in the area",
    },
    {
      id: 3,
      name: "Scavenge Supplies",
      completed: false,
      streak: 2,
      dueDate: "Today",
      xpValue: 20,
      description: "Find useful items",
    },
    {
      id: 4,
      name: "Patrol Perimeter",
      completed: false,
      streak: 5,
      dueDate: "Today",
      xpValue: 25,
      description: "Check for threats",
    },
    {
      id: 5,
      name: "Maintain Weapons",
      completed: false,
      streak: 1,
      dueDate: "Today",
      xpValue: 30,
      description: "Keep weapons in good condition",
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
  const [currentDaily, setCurrentDaily] = useState<Daily | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<Daily, "id" | "completed" | "streak" | "animating">>({
    name: "",
    dueDate: "Today",
    xpValue: 10,
    description: "",
  })

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

  // Create new daily
  const handleCreateDaily = () => {
    const newId = dailies.length > 0 ? Math.max(...dailies.map((d) => d.id)) + 1 : 1

    const newDaily: Daily = {
      id: newId,
      name: formData.name,
      completed: false,
      streak: 0,
      dueDate: formData.dueDate,
      xpValue: formData.xpValue,
      description: formData.description,
    }

    setDailies([...dailies, newDaily])
    resetForm()
    setIsCreateModalOpen(false)
  }

  // Edit daily
  const handleEditDaily = () => {
    if (!currentDaily) return

    setDailies(
      dailies.map((daily) =>
        daily.id === currentDaily.id
          ? {
              ...daily,
              name: formData.name,
              dueDate: formData.dueDate,
              xpValue: formData.xpValue,
              description: formData.description,
            }
          : daily,
      ),
    )

    resetForm()
    setIsEditModalOpen(false)
  }

  // Delete daily
  const handleDeleteDaily = () => {
    if (!currentDaily) return

    setDailies(dailies.filter((daily) => daily.id !== currentDaily.id))
    setIsDeleteModalOpen(false)
  }

  // Open edit modal and populate form
  const openEditModal = (daily: Daily) => {
    setCurrentDaily(daily)
    setFormData({
      name: daily.name,
      dueDate: daily.dueDate,
      xpValue: daily.xpValue,
      description: daily.description || "",
    })
    setIsEditModalOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (daily: Daily) => {
    setCurrentDaily(daily)
    setIsDeleteModalOpen(true)
  }

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: "",
      dueDate: "Today",
      xpValue: 10,
      description: "",
    })
    setCurrentDaily(null)
  }

  // Open create modal
  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  // Due date options
  const dueDateOptions = [
    { value: "Today", label: "Today" },
    { value: "Tomorrow", label: "Tomorrow" },
    { value: "In 2 days", label: "In 2 days" },
    { value: "In 3 days", label: "In 3 days" },
    { value: "This week", label: "This week" },
    { value: "Next week", label: "Next week" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl uppercase glow-text">Dailies</h2>
        <button
          onClick={openCreateModal}
          className="py-1 px-3 border-2 border-[#00ff00] rounded-sm uppercase text-sm flex items-center gap-1 bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
        >
          <Plus className="w-4 h-4" />
          New Daily
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

      {dailies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#00ff00]/50 bg-[#0b3d0b]/30 rounded-sm">
          <AlertCircle className="w-10 h-10 mb-2 text-[#00ff00]/70" />
          <p>No daily tasks created yet.</p>
          <p className="text-sm text-[#00ff00]/70 mt-1">Create your first daily task to start tracking!</p>
        </div>
      ) : (
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
              <div className={`col-span-5 ${daily.completed ? "line-through opacity-70" : ""}`}>
                <div>
                  <span>{daily.name}</span>
                  {daily.description && <p className="text-xs text-[#00ff00]/70 mt-0.5">{daily.description}</p>}
                </div>
              </div>
              <div className="col-span-2 text-center text-sm">
                <span className="glow-text">{daily.streak}🔥</span>
              </div>
              <div className="col-span-2 text-right text-sm flex items-center justify-end">
                <Calendar className="w-3 h-3 mr-1 opacity-70" />
                {daily.dueDate}
              </div>
              <div className="col-span-2 flex justify-end space-x-1">
                <button
                  onClick={() => openEditModal(daily)}
                  className="w-7 h-7 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5 text-[#00ff00]" />
                </button>
                <button
                  onClick={() => openDeleteModal(daily)}
                  className="w-7 h-7 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#00ff00]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-[#00ff00]/70 mt-4">Complete dailies to build streaks and earn rewards.</div>

      {/* Create Daily Modal */}
      <RetroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Daily">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCreateDaily()
          }}
          className="space-y-4"
        >
          <RetroFormField
            id="daily-name"
            label="Daily Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter daily name"
            required
          />

          <RetroFormField
            id="daily-description"
            label="Description"
            type="textarea"
            value={formData.description || ""}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter a description (optional)"
          />

          <div className="grid grid-cols-2 gap-4">
            <RetroFormField
              id="daily-xp"
              label="XP Value"
              type="number"
              value={formData.xpValue}
              onChange={(value) => setFormData({ ...formData, xpValue: value })}
              min={1}
              max={100}
              required
            />

            <RetroFormField
              id="daily-due-date"
              label="Due Date"
              type="select"
              value={formData.dueDate}
              onChange={(value) => setFormData({ ...formData, dueDate: value })}
              options={dueDateOptions}
              required
            />
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
              disabled={!formData.name}
              className={cn(
                "py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm",
                formData.name
                  ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                  : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
              )}
            >
              Create
            </button>
          </div>
        </form>
      </RetroModal>

      {/* Edit Daily Modal */}
      <RetroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Daily">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleEditDaily()
          }}
          className="space-y-4"
        >
          <RetroFormField
            id="edit-daily-name"
            label="Daily Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter daily name"
            required
          />

          <RetroFormField
            id="edit-daily-description"
            label="Description"
            type="textarea"
            value={formData.description || ""}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter a description (optional)"
          />

          <div className="grid grid-cols-2 gap-4">
            <RetroFormField
              id="edit-daily-xp"
              label="XP Value"
              type="number"
              value={formData.xpValue}
              onChange={(value) => setFormData({ ...formData, xpValue: value })}
              min={1}
              max={100}
              required
            />

            <RetroFormField
              id="edit-daily-due-date"
              label="Due Date"
              type="select"
              value={formData.dueDate}
              onChange={(value) => setFormData({ ...formData, dueDate: value })}
              options={dueDateOptions}
              required
            />
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
              disabled={!formData.name}
              className={cn(
                "py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm",
                formData.name
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
      <RetroModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Daily">
        <div className="space-y-4">
          <p>
            Are you sure you want to delete <span className="font-bold">{currentDaily?.name}</span>?
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
              onClick={handleDeleteDaily}
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
