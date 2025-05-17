"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Clock, AlertTriangle, Edit, Trash2, Plus, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"
import { RetroModal } from "@/components/retro-modal"
import { RetroFormField } from "@/components/retro-form-field"
import { cn } from "@/lib/utils"
import { todosDB, type Todo, type Priority } from "@/lib/db-service"
import { notificationService } from "@/lib/notification-service"
import { userDB, type User } from "@/lib/db-service"
import { useUser } from "@/hooks/useUser"

export function TodosTab() {
  const { updateUser } = useUser()
  const [todos, setTodos] = useState<Todo[]>([])
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
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    priority: Priority
    dueDate: string
    xpValue: number
    description: string
  }>({
    name: "",
    priority: "medium",
    dueDate: "",
    xpValue: 15,
    description: "",
  })

  // Calculate XP percentage
  const xpPercentage = (currentXp / maxXp) * 100

  // Load todos from IndexedDB
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true)
        const data = await todosDB.getAll()
        setTodos(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load todos:", err)
        setError("Failed to load todos. Please try again.")
        notificationService.error("Failed to load todos")
      } finally {
        setIsLoading(false)
      }
    }

    loadTodos()
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

  const toggleTodo = async (todo: Todo) => {
    try {
      const now = Date.now()
      const updatedTodo = {
        ...todo,
        completed: !todo.completed,
        updatedAt: now,
      }

      // Update in IndexedDB
      await todosDB.update(updatedTodo)

      // Update local state
      setTodos((prevTodos) =>
        prevTodos.map((t) => {
          if (t.id === todo.id) {
            // If completing the task
            if (!todo.completed) {
              // Show XP gain and update XP
              setXpGain({ amount: todo.xpValue, show: true })
              setCurrentXp((prev) => Math.min(prev + todo.xpValue, maxXp))

              // Update user XP in database
              userDB.get().then((user) => {
                if (user) {
                  const newXp = Math.min(user.xp + todo.xpValue, maxXp)
                  updateUser({ ...user, xp: newXp })
                }
              })

              // Return with animation flag
              return {
                ...updatedTodo,
                animating: true,
              }
            } else {
              // If uncompleting the task
              setCurrentXp((prev) => Math.max(prev - todo.xpValue, 0))
              
              // Update user XP in database
              userDB.get().then((user) => {
                if (user) {
                  const newXp = Math.max(user.xp - todo.xpValue, 0)
                  updateUser({ ...user, xp: newXp })
                }
              })
              
              return updatedTodo
            }
          }
          return t
        }),
      )

      notificationService.success(todo.completed ? `Unmarked ${todo.name} as complete` : `Completed ${todo.name}`)
    } catch (err) {
      console.error("Failed to toggle todo:", err)
      notificationService.error("Failed to update todo")
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
    const animatingTodos = todos.filter((todo) => todo.animating)
    if (animatingTodos.length > 0) {
      const timer = setTimeout(() => {
        setTodos(
          todos.map((todo) => {
            if (todo.animating) {
              return { ...todo, animating: false }
            }
            return todo
          }),
        )
      }, 1500) // Match the animation duration
      return () => clearTimeout(timer)
    }
  }, [todos])

  const handleXpAnimationComplete = () => {
    setXpGain({ amount: 0, show: false })
  }

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-[#ff6b6b]" />
      case "medium":
        return <Clock className="w-4 h-4 text-[#ffdd67]" />
      case "low":
        return <Clock className="w-4 h-4 text-[#00ff00]" />
    }
  }

  // Create new todo
  const handleCreateTodo = async () => {
    try {
      setIsProcessing(true)

      // Create new todo in IndexedDB
      const newTodo = await todosDB.add({
        name: formData.name,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        xpValue: formData.xpValue,
        description: formData.description,
      })

      // Update local state
      setTodos((prevTodos) => [...prevTodos, newTodo])

      resetForm()
      setIsCreateModalOpen(false)
      notificationService.success("Todo created successfully")
    } catch (err) {
      console.error("Failed to create todo:", err)
      notificationService.error("Failed to create todo")
    } finally {
      setIsProcessing(false)
    }
  }

  // Edit todo
  const handleEditTodo = async () => {
    if (!currentTodo) return

    try {
      setIsProcessing(true)

      const updatedTodo: Todo = {
        ...currentTodo,
        name: formData.name,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        xpValue: formData.xpValue,
        description: formData.description,
        updatedAt: Date.now(),
      }

      // Update in IndexedDB
      await todosDB.update(updatedTodo)

      // Update local state
      setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === currentTodo.id ? updatedTodo : todo)))

      resetForm()
      setIsEditModalOpen(false)
      notificationService.success("Todo updated successfully")
    } catch (err) {
      console.error("Failed to update todo:", err)
      notificationService.error("Failed to update todo")
    } finally {
      setIsProcessing(false)
    }
  }

  // Delete todo
  const handleDeleteTodo = async () => {
    if (!currentTodo) return

    try {
      setIsProcessing(true)

      // Delete from IndexedDB
      await todosDB.delete(currentTodo.id)

      // Update local state
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== currentTodo.id))

      setIsDeleteModalOpen(false)
      notificationService.success("Todo deleted successfully")
    } catch (err) {
      console.error("Failed to delete todo:", err)
      notificationService.error("Failed to delete todo")
    } finally {
      setIsProcessing(false)
    }
  }

  // Open edit modal and populate form
  const openEditModal = (todo: Todo) => {
    setCurrentTodo(todo)
    setFormData({
      name: todo.name,
      priority: todo.priority,
      dueDate: todo.dueDate || "",
      xpValue: todo.xpValue,
      description: todo.description || "",
    })
    setIsEditModalOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (todo: Todo) => {
    setCurrentTodo(todo)
    setIsDeleteModalOpen(true)
  }

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: "",
      priority: "medium",
      dueDate: "",
      xpValue: 15,
      description: "",
    })
    setCurrentTodo(null)
  }

  // Open create modal
  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  // Due date options
  const dueDateOptions = [
    { value: "", label: "No date" },
    { value: "Today", label: "Today" },
    { value: "Tomorrow", label: "Tomorrow" },
    { value: "In 2 days", label: "In 2 days" },
    { value: "In 3 days", label: "In 3 days" },
    { value: "This week", label: "This week" },
    { value: "Next week", label: "Next week" },
  ]

  // Priority options
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl uppercase glow-text">To-Dos</h2>
        <button
          onClick={openCreateModal}
          className="py-1 px-3 border-2 border-[#00ff00] rounded-sm uppercase text-sm flex items-center gap-1 bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
        >
          <Plus className="w-4 h-4" />
          New To-Do
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
          <p>Loading to-dos...</p>
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
      ) : todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-[#00ff00]/50 bg-[#0b3d0b]/30 rounded-sm">
          <AlertCircle className="w-10 h-10 mb-2 text-[#00ff00]/70" />
          <p>No to-do tasks created yet.</p>
          <p className="text-sm text-[#00ff00]/70 mt-1">Create your first to-do task to start tracking!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`grid grid-cols-12 items-center py-2 border-b border-[#00ff00]/30 hover:bg-[#00ff00]/10 relative ${
                todo.animating ? "task-flash scanline-animation" : ""
              } ${todo.completed && !todo.animating ? "task-fade" : ""}`}
            >
              <div className="col-span-1">
                <button
                  onClick={() => toggleTodo(todo)}
                  className={`w-6 h-6 border-2 ${
                    todo.completed ? "bg-[#00ff00] border-[#00ff00]" : "bg-transparent border-[#00ff00]"
                  } rounded-sm flex items-center justify-center`}
                >
                  {todo.completed && <Check className="w-4 h-4 text-[#0b3d0b]" />}
                </button>
              </div>
              <div className={`col-span-5 ${todo.completed ? "line-through opacity-70" : ""}`}>
                <div>
                  <span>{todo.name}</span>
                  {todo.description && <p className="text-xs text-[#00ff00]/70 mt-0.5">{todo.description}</p>}
                </div>
              </div>
              <div className="col-span-2 text-center">{getPriorityIcon(todo.priority)}</div>
              <div className="col-span-2 text-right text-xs flex items-center justify-end">
                {todo.dueDate && (
                  <>
                    <Calendar className="w-3 h-3 mr-1 opacity-70" />
                    {todo.dueDate}
                  </>
                )}
              </div>
              <div className="col-span-2 flex justify-end space-x-1">
                <button
                  onClick={() => openEditModal(todo)}
                  className="w-7 h-7 border-2 border-[#00ff00] rounded-sm flex items-center justify-center hover:bg-[#00ff00]/20"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5 text-[#00ff00]" />
                </button>
                <button
                  onClick={() => openDeleteModal(todo)}
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

      <div className="text-sm text-[#00ff00]/70 mt-4">Complete tasks to level up and gain experience.</div>

      {/* Create Todo Modal */}
      <RetroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New To-Do">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleCreateTodo()
          }}
          className="space-y-4"
        >
          <RetroFormField
            id="todo-name"
            label="Task Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter task name"
            required
          />

          <RetroFormField
            id="todo-description"
            label="Description"
            type="textarea"
            value={formData.description || ""}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter a description (optional)"
          />

          <div className="grid grid-cols-2 gap-4">
            <RetroFormField
              id="todo-priority"
              label="Priority"
              type="select"
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              options={priorityOptions}
              required
            />

            <RetroFormField
              id="todo-due-date"
              label="Due Date"
              type="select"
              value={formData.dueDate || ""}
              onChange={(value) => setFormData({ ...formData, dueDate: value })}
              options={dueDateOptions}
            />
          </div>

          <RetroFormField
            id="todo-xp"
            label="XP Value"
            type="number"
            value={formData.xpValue}
            onChange={(value) => setFormData({ ...formData, xpValue: value })}
            min={1}
            max={100}
            required
          />

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

      {/* Edit Todo Modal */}
      <RetroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit To-Do">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleEditTodo()
          }}
          className="space-y-4"
        >
          <RetroFormField
            id="edit-todo-name"
            label="Task Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter task name"
            required
          />

          <RetroFormField
            id="edit-todo-description"
            label="Description"
            type="textarea"
            value={formData.description || ""}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter a description (optional)"
          />

          <div className="grid grid-cols-2 gap-4">
            <RetroFormField
              id="edit-todo-priority"
              label="Priority"
              type="select"
              value={formData.priority}
              onChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              options={priorityOptions}
              required
            />

            <RetroFormField
              id="edit-todo-due-date"
              label="Due Date"
              type="select"
              value={formData.dueDate || ""}
              onChange={(value) => setFormData({ ...formData, dueDate: value })}
              options={dueDateOptions}
            />
          </div>

          <RetroFormField
            id="edit-todo-xp"
            label="XP Value"
            type="number"
            value={formData.xpValue}
            onChange={(value) => setFormData({ ...formData, xpValue: value })}
            min={1}
            max={100}
            required
          />

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
      <RetroModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete To-Do">
        <div className="space-y-4">
          <p>
            Are you sure you want to delete <span className="font-bold">{currentTodo?.name}</span>?
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
              onClick={handleDeleteTodo}
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
