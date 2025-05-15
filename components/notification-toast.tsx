"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { notificationService } from "@/lib/notification-service"
import { cn } from "@/lib/utils"

type NotificationType = "success" | "error" | "info" | "warning"

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Listen for notifications
    const unsubscribe = notificationService.listen((notification) => {
      setNotifications((prev) => [...prev, notification])

      // Auto-remove notification after duration
      if (notification.duration) {
        setTimeout(() => {
          removeNotification(notification.id)
        }, notification.duration)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-[#00ff00]" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-[#ff6b6b]" />
      case "info":
        return <Info className="w-5 h-5 text-[#00ffff]" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-[#ffdd67]" />
    }
  }

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-[#00ff00]/20 border-[#00ff00]"
      case "error":
        return "bg-[#ff6b6b]/20 border-[#ff6b6b]"
      case "info":
        return "bg-[#00ffff]/20 border-[#00ffff]"
      case "warning":
        return "bg-[#ffdd67]/20 border-[#ffdd67]"
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "border-2 p-3 rounded-sm flex items-start gap-3 terminal-flicker",
            getBackgroundColor(notification.type),
          )}
        >
          {getIcon(notification.type)}
          <div className="flex-1">{notification.message}</div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-[#00ff00] hover:text-[#00ff00]/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  )
}
