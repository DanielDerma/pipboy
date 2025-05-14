"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Clock, AlertTriangle } from "lucide-react"
import { XPIndicator } from "@/components/xp-indicator"

type Priority = "low" | "medium" | "high"

type Todo = {
  id: number
  name: string
  completed: boolean
  priority: Priority
  dueDate?: string
  xpValue: number
  animating?: boolean
}

export function TodosTab() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, name: "Fix Water Purifier", completed: false, priority: "high", dueDate: "Tomorrow", xpValue: 30 },
    { id: 2, name: "Organize Inventory", completed: false, priority: "medium", dueDate: "In 3 days", xpValue: 15 },
    { id: 3, name: "Map New Territory", completed: false, priority: "low", xpValue: 10 },
    { id: 4, name: "Trade with Settlers", completed: true, priority: "medium", dueDate: "Yesterday", xpValue: 20 },
    { id: 5, name: "Repair Power Armor", completed: false, priority: "high", dueDate: "Today", xpValue: 25 },
  ])

  const [xpGain, setXpGain] = useState({ amount: 0, show: false })
  const [currentXp, setCurrentXp] = useState(2750)
  const [maxXp, setMaxXp] = useState(4000)
  const xpBarRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="space-y-4">
      <h2 className="text-xl uppercase glow-text">To-Dos</h2>

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
            <div className={`col-span-7 ${todo.completed ? "line-through opacity-70" : ""}`}>{todo.name}</div>
            <div className="col-span-2 text-center">{getPriorityIcon(todo.priority)}</div>
            <div className="col-span-2 text-right text-xs">{todo.dueDate || "No date"}</div>
          </div>
        ))}
      </div>

      <div className="text-sm text-[#00ff00]/70 mt-4">Complete tasks to level up and gain experience.</div>
    </div>
  )
}
