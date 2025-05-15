"use client"

import { useState, useEffect } from "react"
import { Database, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DbStatusIndicatorProps {
  className?: string
}

export function DbStatusIndicator({ className }: DbStatusIndicatorProps) {
  const [status, setStatus] = useState<"initializing" | "success" | "error">("initializing")
  const [message, setMessage] = useState<string>("Initializing database...")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Listen for custom events from the database initializer
    const handleDbEvent = (event: CustomEvent) => {
      const { type, message } = event.detail

      setStatus(type)
      setMessage(message)

      // Hide success message after 5 seconds
      if (type === "success") {
        setTimeout(() => {
          setIsVisible(false)
        }, 5000)
      }
    }

    // Add event listener
    window.addEventListener("db-status" as any, handleDbEvent as EventListener)

    // Clean up
    return () => {
      window.removeEventListener("db-status" as any, handleDbEvent as EventListener)
    }
  }, [])

  // Don't render if not visible
  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-40 p-3 border-2 rounded-sm flex items-center space-x-2 max-w-xs",
        status === "initializing" && "border-[#00ffff] bg-[#00ffff]/10",
        status === "success" && "border-[#00ff00] bg-[#00ff00]/10",
        status === "error" && "border-[#ff6b6b] bg-[#ff6b6b]/10",
        className,
      )}
    >
      {status === "initializing" && <Database className="w-5 h-5 text-[#00ffff] animate-pulse" />}
      {status === "success" && <CheckCircle className="w-5 h-5 text-[#00ff00]" />}
      {status === "error" && <AlertTriangle className="w-5 h-5 text-[#ff6b6b]" />}

      <span className="text-sm">{message}</span>

      {status === "success" && (
        <button onClick={() => setIsVisible(false)} className="ml-2 text-xs opacity-70 hover:opacity-100">
          Dismiss
        </button>
      )}
    </div>
  )
}
