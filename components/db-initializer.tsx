"use client"

import { useEffect, useState } from "react"
import { initDatabase } from "@/lib/db-service"
import { syncService } from "@/lib/sync-service"
import { Loader2 } from "lucide-react"

export function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDatabase()
        // Initialize sync service
        syncService.initSync()
        console.log("Database initialized successfully")
      } catch (err) {
        console.error("Failed to initialize database:", err)
        setError("Failed to initialize database. Please refresh the page.")
      } finally {
        setIsInitializing(false)
      }
    }

    initializeDB()
  }, [])

  if (!isInitializing) return null

  return (
    <div className="fixed inset-0 bg-[#0b3d0b] z-50 flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center p-4">
          <p className="text-[#ff6b6b] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-[#00ff00] animate-spin mb-4" />
          <p className="text-[#00ff00] uppercase glow-text">Initializing Database...</p>
        </div>
      )}
    </div>
  )
}
