"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Edit, Trash2, Plus, AlertCircle, Calendar, Loader2 } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"
import { RetroModal } from "@/components/retro-modal"
import { RetroFormField } from "@/components/retro-form-field"
import { cn } from "@/lib/utils"
import { dailiesDB, type Daily, getDueDateTimestamp, formatDueDate } from "@/lib/db-service"
import { notificationService } from "@/lib/notification-service"
import { userDB, type User } from "@/lib/db-service"
import { useUser } from "@/hooks/useUser"

export function DailiesTab() {
  const { updateUser } = useUser()
  const [dailies, setDailies] = useState<Daily[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [xpGain, setXpGain] = useState({ amount: 0, show: false })
  const [currentXp, setCurrentXp] = useState(0)
  const [maxXp, setMaxXp] = useState(1000)
  const xpBarRef = useRef<HTMLDivElement>(null)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentDaily, setCurrentDaily] = useState<Daily | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    dueDate: string
    xpValue: number
    description: string
    customDate?: string
  }>({
    name: "",
    dueDate: "Today",
    xpValue: 10,
    description: "",
    customDate: "",
  })

  // Calculate XP percentage
  const xpPercentage = (currentXp / maxXp) * 100

  // Load dailies from IndexedDB
  useEffect(() => {
    const loadDailies = async () => {
      try {
        setIsLoading(true)
        const data = await dailiesDB.getAll()
        setDailies(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load dailies:", err)
        setError("Failed to load dailies. Please try again.")
        notificationService.error("Failed to load dailies")
      } finally {
        setIsLoading(false)
      }
    }

    loadDailies()
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

  const toggleDaily = async (daily: Daily) => {
    try {
      const now = Date.now()
      const updatedDaily = {
        ...daily,
        completed: !daily.completed,
        streak: !daily.completed ? daily.streak + 1 : Math.max(daily.streak - 1, 0),
        lastCompletedAt: !daily.completed ? now : undefined,
        updatedAt: now,
      }

      // Update in IndexedDB
      await dailiesDB.update(updatedDaily)

      // If completing the task, show XP gain
      if (!daily.completed) {
        setXpGain({ amount: daily.xpValue, show: true })
        setCurrentXp((prev) => Math.min(prev + daily.xpValue, maxXp))

        // Update user XP in database
        userDB.get().then((user) => {
          if (user) {
            const newXp = Math.min(user.xp + daily.xpValue, maxXp)
            updateUser({ ...user, xp: newXp })
          }
        })
      } else {
        // If uncompleting the task
        setCurrentXp((prev) => Math.max(prev - daily.xpValue, 0))
        
        // Update user XP in database
        userDB.get().then((user) => {
          if (user) {
            const newXp = Math.max(user.xp - daily.xpValue, 0)
            updateUser({ ...user, xp: newXp })
          }
        })
      }

      // Update local state
      setDailies((prevDailies) =>
        prevDailies.map((d) => {
          if (d.id === daily.id) {
            return {
              ...updatedDaily,
              animating: !daily.completed, // Only animate when completing
            }
          }
          return d
        }),
      )

      notificationService.success(daily.completed ? `Unmarked ${daily.name} as complete` : `Completed ${daily.name}`)
    } catch (err) {
      console.error("Failed to toggle daily:", err)
      notificationService.error("Failed to update daily")
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
  const handleCreateDaily = async () => {
    try {
      setIsProcessing(true)

      // Convert due date to timestamp
      const dueDateTimestamp = formData.dueDate === "custom" 
        ? new Date(formData.customDate!).getTime()
        : getDueDateTimestamp(formData.dueDate)

      // Create new daily in IndexedDB
      const newDaily = await dailiesDB.add({
        name: formData.name,
        dueDate: dueDateTimestamp,
        xpValue: formData.xpValue,
        description: formData.description,
      })

      // Update local state
      setDailies((prevDailies) => [...prevDailies, newDaily])

      resetForm()
      setIsCreateModalOpen(false)
      notificationService.success("Daily created successfully")
    } catch (err) {
      console.error("Failed to create daily:", err)
      notificationService.error("Failed to create daily")
    } finally {
      setIsProcessing(false)
    }
  }

  // Edit daily
  const handleEditDaily = async () => {
    if (!currentDaily) return

    try {
      setIsProcessing(true)

      // Convert due date to timestamp
      const dueDateTimestamp = formData.dueDate === "custom" 
        ? new Date(formData.customDate!).getTime()
        : getDueDateTimestamp(formData.dueDate)

      const updatedDaily: Daily = {
        ...currentDaily,
        name: formData.name,
        dueDate: dueDateTimestamp,
        xpValue: formData.xpValue,
        description: formData.description,
        updatedAt: Date.now(),
      }

      // Update in IndexedDB
      await dailiesDB.update(updatedDaily)

      // Update local state
      setDailies((prevDailies) => prevDailies.map((daily) => (daily.id === currentDaily.id ? updatedDaily : daily)))

      resetForm()
      setIsEditModalOpen(false)
      notificationService.success("Daily updated successfully")
    } catch (err) {
      console.error("Failed to update daily:", err)
      notificationService.error("Failed to update daily")
    } finally {
      setIsProcessing(false)
    }
  }

  // Delete daily
  const handleDeleteDaily = async () => {
    if (!currentDaily) return

    try {
      setIsProcessing(true)

      // Delete from IndexedDB
      await dailiesDB.delete(currentDaily.id)

      // Update local state
      setDailies((prevDailies) => prevDailies.filter((daily) => daily.id !== currentDaily.id))

      setIsDeleteModalOpen(false)
      notificationService.success("Daily deleted successfully")
    } catch (err) {
      console.error("Failed to delete daily:", err)
      notificationService.error("Failed to delete daily")
    } finally {
      setIsProcessing(false)
    }
  }

  // Open edit modal and populate form
  const openEditModal = (daily: Daily) => {
    setCurrentDaily(daily)
    setFormData({
      name: daily.name,
      dueDate: "custom",
      xpValue: daily.xpValue,
      description: daily.description || "",
      customDate: new Date(daily.dueDate).toISOString().split('T')[0],
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
    { value: "custom", label: "Custom date" },
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#00ff00]/50 bg-[#0b3d0b]/30 rounded-sm">
          <Loader2 className="w-10 h-10 mb-2 text-[#00ff00]/70 animate-spin" />
          <p>Loading dailies...</p>
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
      ) : dailies.length === 0 ? (
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
              } ${daily.completed && !daily.animating ? "task-fade" : ""} ${
                !daily.completed && daily.dueDate < Date.now() ? "border-[#ff6b6b] bg-[#ff6b6b]/10" : ""
              }`}
            >
              <div className="col-span-1">
                <button
                  onClick={() => toggleDaily(daily)}
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
                {formatDueDate(daily.dueDate)}
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

            <div className="space-y-2">
              <RetroFormField
                id="daily-due-date"
                label="Due Date"
                type="select"
                value={formData.dueDate}
                onChange={(value) => setFormData({ ...formData, dueDate: value })}
                options={dueDateOptions}
                required
              />
              {formData.dueDate === "custom" && (
                <RetroFormField
                  id="daily-custom-date"
                  label="Custom Date"
                  type="date"
                  value={formData.customDate || ""}
                  onChange={(value) => setFormData({ ...formData, customDate: value })}
                  required
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || isProcessing}
              className={cn(
                "py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm flex items-center justify-center gap-2",
                formData.name && !isProcessing
                  ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                  : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
              )}
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
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

            <div className="space-y-2">
              <RetroFormField
                id="edit-daily-due-date"
                label="Due Date"
                type="select"
                value={formData.dueDate}
                onChange={(value) => setFormData({ ...formData, dueDate: value })}
                options={dueDateOptions}
                required
              />
              {formData.dueDate === "custom" && (
                <RetroFormField
                  id="edit-daily-custom-date"
                  label="Custom Date"
                  type="date"
                  value={formData.customDate || ""}
                  onChange={(value) => setFormData({ ...formData, customDate: value })}
                  required
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || isProcessing}
              className={cn(
                "py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm flex items-center justify-center gap-2",
                formData.name && !isProcessing
                  ? "bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
                  : "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed",
              )}
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
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
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteDaily}
              disabled={isProcessing}
              className={cn(
                "py-2 px-4 border-2 border-[#ff6b6b] rounded-sm uppercase text-sm text-[#ff6b6b] flex items-center justify-center gap-2",
                isProcessing
                  ? "bg-[#0b3d0b]/50 opacity-50 cursor-not-allowed"
                  : "bg-[#ff6b6b]/20 hover:bg-[#ff6b6b]/30",
              )}
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </RetroModal>
    </div>
  )
}
