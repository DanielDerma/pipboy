import { dbService } from "./db-service"

// API endpoint for syncing (replace with your actual API endpoint)
const API_ENDPOINT = "/api/sync"

// Check if the device is online
const isOnline = (): boolean => {
  return navigator.onLine
}

// Sync service
export const syncService = {
  // Sync all pending changes with the server
  syncWithServer: async (): Promise<boolean> => {
    if (!isOnline()) {
      console.log("Device is offline, skipping sync")
      return false
    }

    try {
      // Get all pending sync items
      const syncQueue = await dbService.getSyncQueue()

      if (syncQueue.length === 0) {
        console.log("No items to sync")
        return true
      }

      console.log(`Syncing ${syncQueue.length} items with server`)

      // Send sync data to server
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(syncQueue),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      // Clear sync queue after successful sync
      await dbService.clearSyncQueue()
      console.log("Sync completed successfully")
      return true
    } catch (error) {
      console.error("Sync failed:", error)
      return false
    }
  },

  // Initialize sync process
  initSync: (intervalMinutes = 5): void => {
    // Try to sync immediately when online
    window.addEventListener("online", () => {
      console.log("Device is online, attempting to sync")
      syncService.syncWithServer()
    })

    // Set up periodic sync
    setInterval(
      () => {
        if (isOnline()) {
          syncService.syncWithServer()
        }
      },
      intervalMinutes * 60 * 1000,
    )
  },

  // Manually trigger sync
  manualSync: async (): Promise<boolean> => {
    return await syncService.syncWithServer()
  },
}
