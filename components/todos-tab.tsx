"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Clock, AlertTriangle, Edit, Trash2, Plus, Calendar, AlertCircle } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"
import { RetroModal } from "@/components/retro-modal"
import { RetroFormField } from "@/components/retro-form-field"
import { cn } from "@/lib/utils"

type Priority = "low" | "medium" | "high"

type Todo = {
  id: number
  name: string
  completed: boolean
  priority: Priority
  dueDate?: string
  xpValue: number
  description?: string
  animating?: boolean
}

export function TodosTab() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: 1,
      name: "Fix Water Purifier",
      completed: false,
      priority: "high",
      dueDate: "Tomorrow",
      xpValue: 30,
      description: "Repair the broken water purifier",
    },
    {
      id: 2,
      name: "Organize Inventory",
      completed: false,
      priority: "medium",
      dueDate: "In 3 days",
      xpValue: 15,
      description: "Sort and organize supplies",
    },
    {
      id: 3,
      name: "Map New Territory",
      completed: false,
      priority: "low",
      xpValue: 10,
      description: "Explore and map the surrounding area",
    },
    {
      id: 4,
      name: "Trade with Settlers",
      completed: true,
      priority: "medium",
      dueDate: "Yesterday",
      xpValue: 20,
      description: "Exchange goods with nearby settlement",
    },
    {
      id: 5,
      name: "Repair Power Armor",
      completed: false,
      priority: "high",
      dueDate: "Today",
      xpValue: 25,
      description: "Fix damaged power armor components",
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
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<Todo, "id" | "completed" | "animating">>({
    name: "",
    priority: "medium",
    dueDate: "",
    xpValue: 15,
    description: "",
  })

  // Calculate XP percentage
  const xpPercentage = (currentXp / maxXp) * 100

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          // If completing the task
          if (!todo.completed) {
            // Show XP gain and update XP
            setXpGain({ amount: todo.xpValue, show: true })
            setCurrentXp((prev) => Math.min(prev + todo.xpValue, maxXp))

            // Return with animation flag
            return {
              ...todo,
              completed: true,
              animating: true,
            }
          } else {
            // If uncompleting the task
            setCurrentXp((prev) => Math.max(prev - todo.xpValue, 0))
            return {
              ...todo,
              completed: false,
            }
          }
        }
        return todo
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
  const handleCreateTodo = () => {
    const newId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1

    const newTodo: Todo = {
      id: newId,
      name: formData.name,
      completed: false,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      xpValue: formData.xpValue,
      description: formData.description,
    }

    setTodos([...todos, newTodo])
    resetForm()
    setIsCreateModalOpen(false)
  }

  // Edit todo
  const handleEditTodo = () => {
    if (!currentTodo) return

    setTodos(
      todos.map((todo) =>
        todo.id === currentTodo.id
          ? {
              ...todo,
              name: formData.name,
              priority: formData.priority,
              dueDate: formData.dueDate || undefined,
              xpValue: formData.xpValue,
              description: formData.description,
            }
          : todo,
      ),
    )

    resetForm()
    setIsEditModalOpen(false)
  }

  // Delete todo
  const handleDeleteTodo = () => {
    if (!currentTodo) return

    setTodos(todos.filter((todo) => todo.id !== currentTodo.id))
    setIsDeleteModalOpen(false)
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

      {todos.length === 0 ? (
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
                  onClick={() => toggleTodo(todo.id)}
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
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTodo}
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
