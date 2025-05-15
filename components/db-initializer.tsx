"use client"

import { useEffect, useState } from "react"
import { initDatabase, dbService, habitsDB, dailiesDB, todosDB } from "@/lib/db-service"
import { syncService } from "@/lib/sync-service"
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { RetroBox } from "@/components/retro-box"
import { notificationService } from "@/lib/notification-service"

interface DbStats {
  habits: number
  dailies: number
  todos: number
  syncQueue: number
}

export function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailedError, setDetailedError] = useState<string | null>(null)
  const [dbStats, setDbStats] = useState<DbStats | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [initAttempts, setInitAttempts] = useState(0)

  // Function to get database statistics
  const getDatabaseStats = async (): Promise<DbStats> => {
    try {
      const habits = await habitsDB.getAll()
      const dailies = await dailiesDB.getAll()
      const todos = await todosDB.getAll()
      const syncQueue = await dbService.getSyncQueue()

      return {
        habits: habits.length,
        dailies: dailies.length,
        todos: todos.length,
        syncQueue: syncQueue.length,
      }
    } catch (err) {
      console.error("Failed to get database stats:", err)
      return {
        habits: 0,
        dailies: 0,
        todos: 0,
        syncQueue: 0,
      }
    }
  }

  useEffect(() => {
    const initializeDB = async () => {
      try {
        console.log(`Database initialization attempt ${initAttempts + 1}...`)
        setIsInitializing(true)
        setError(null)
        setDetailedError(null)

        // Initialize the database
        await initDatabase()
        console.log("Database initialized successfully")

        // Get database statistics
        const stats = await getDatabaseStats()
        setDbStats(stats)
        console.log("Database statistics:", stats)

        // Initialize sync service
        syncService.initSync()
        console.log("Sync service initialized")

        // Update state
        setIsInitialized(true)
        setIsInitializing(false)
        notificationService.success("Database initialized successfully")
      } catch (err) {
        console.error("Failed to initialize database:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        const detailedErrorInfo =
          err instanceof Error ? err.stack || err.toString() : "No detailed information available"

        setError(`Failed to initialize database: ${errorMessage}`)
        setDetailedError(detailedErrorInfo)
        setIsInitializing(false)
        setIsInitialized(false)
        notificationService.error("Database initialization failed")
      }
    }

    if (!isInitialized) {
      initializeDB()
    }
  }, [initAttempts, isInitialized])

  const handleRetry = () => {
    setInitAttempts((prev) => prev + 1)
  }

  // If initialization is complete and successful, don't render anything
  if (isInitialized && !error) return null

  return (
    <div className="fixed inset-0 bg-[#0b3d0b] z-50 flex flex-col items-center justify-center p-4">
      <RetroBox>
        <div className="p-6 max-w-md w-full space-y-4">
          <h2 className="text-xl uppercase glow-text text-center">Database Initialization</h2>

          {isInitializing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#00ff00] animate-spin" />
              <p className="text-[#00ff00] uppercase glow-text">Initializing Database...</p>
              <p className="text-sm text-center">This may take a moment. Please wait.</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#ff6b6b]">
                <AlertCircle className="w-6 h-6" />
                <p className="font-bold">{error}</p>
              </div>

              <div className="border-2 border-[#ff6b6b]/50 bg-[#ff6b6b]/10 p-3 rounded-sm">
                <p className="text-sm mb-2">The database could not be initialized. This might be due to:</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Browser storage restrictions</li>
                  <li>Insufficient storage space</li>
                  <li>Browser privacy settings</li>
                  <li>Corrupted database</li>
                </ul>
              </div>

              {showDetails && detailedError && (
                <div className="border-2 border-[#ff6b6b]/50 bg-[#0b3d0b] p-3 rounded-sm max-h-32 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap">{detailedError}</pre>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleRetry}
                  className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm bg-[#00ff00]/20 hover:bg-[#00ff00]/30 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Initialization</span>
                </button>

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="py-2 px-4 border-2 border-[#00ff00]/50 rounded-sm text-xs"
                >
                  {showDetails ? "Hide Technical Details" : "Show Technical Details"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="w-12 h-12 text-[#00ff00]" />
              <p className="text-[#00ff00] uppercase glow-text">Database Initialized Successfully</p>

              {dbStats && (
                <div className="w-full border-2 border-[#00ff00]/50 bg-[#00ff00]/10 p-3 rounded-sm">
                  <h3 className="text-sm font-bold mb-2">Database Statistics:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Habits:</div>
                    <div className="text-right">{dbStats.habits}</div>
                    <div>Dailies:</div>
                    <div className="text-right">{dbStats.dailies}</div>
                    <div>To-Dos:</div>
                    <div className="text-right">{dbStats.todos}</div>
                    <div>Sync Queue:</div>
                    <div className="text-right">{dbStats.syncQueue}</div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsInitialized(true)}
                className="py-2 px-4 border-2 border-[#00ff00] rounded-sm uppercase text-sm bg-[#00ff00]/20 hover:bg-[#00ff00]/30"
              >
                Continue to App
              </button>
            </div>
          )}

          <div className="text-center text-xs opacity-70 pt-2">
            <p>Pip-Boy 3000 Database System v1.0</p>
            <p>© 2077 Vault-Tec Industries</p>
          </div>
        </div>
      </RetroBox>
    </div>
  )
}
