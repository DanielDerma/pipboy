type NotificationType = "success" | "error" | "info" | "warning"

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

// Event for notifications
const NOTIFICATION_EVENT = "pip-boy-notification"

// Notification service
export const notificationService = {
  // Show a notification
  show: (type: NotificationType, message: string, duration = 3000): string => {
    const id = Date.now().toString()
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    }

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent(NOTIFICATION_EVENT, {
        detail: notification,
      }),
    )

    return id
  },

  // Success notification
  success: (message: string, duration?: number): string => {
    return notificationService.show("success", message, duration)
  },

  // Error notification
  error: (message: string, duration?: number): string => {
    return notificationService.show("error", message, duration)
  },

  // Info notification
  info: (message: string, duration?: number): string => {
    return notificationService.show("info", message, duration)
  },

  // Warning notification
  warning: (message: string, duration?: number): string => {
    return notificationService.show("warning", message, duration)
  },

  // Listen for notifications
  listen: (callback: (notification: Notification) => void): (() => void) => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<Notification>
      callback(customEvent.detail)
    }

    window.addEventListener(NOTIFICATION_EVENT, handler)

    // Return function to remove listener
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handler)
    }
  },
}
