// Database configuration
const DB_NAME = "pip-boy-tasks-db"
const DB_VERSION = 1

// Store names
const STORES = {
  HABITS: "habits",
  DAILIES: "dailies",
  TODOS: "todos",
  SYNC_QUEUE: "syncQueue",
  REWARDS: "rewards",
  USER: "user",
}

// Task types
export type Priority = "low" | "medium" | "high"

// Add User interface
export interface User {
  id: number
  level: number
  xp: number
  caps: number
  createdAt: number
  updatedAt: number
}

export interface BaseTask {
  id: number
  name: string
  description?: string
  xpValue: number
  createdAt: number // timestamp
  updatedAt: number // timestamp
  animating?: boolean // UI state, not stored in DB
}

export interface Habit extends BaseTask {
  count: number
  positive: boolean
  negative: boolean
}

export interface Daily extends BaseTask {
  completed: boolean
  streak: number
  dueDate: string
  lastCompletedAt?: number // timestamp
}

export interface Todo extends BaseTask {
  completed: boolean
  priority: Priority
  dueDate?: string
}

export interface SyncQueueItem {
  id: number
  operation: "create" | "update" | "delete"
  store: string
  data: any
  timestamp: number
}

// Add the Reward interface after the other interfaces
export interface Reward extends BaseTask {
  cost: number
  redemptionCount: number
}

// Generate a unique ID (timestamp + random suffix)
const generateUniqueId = (): number => {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000)
}

// Emit database status event
const emitDbStatusEvent = (type: "initializing" | "success" | "error", message: string) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("db-status", {
        detail: { type, message },
      }),
    )
  }
}

// Database initialization
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      const error = new Error("Your browser doesn't support IndexedDB")
      emitDbStatusEvent("error", error.message)
      reject(error)
      return
    }

    emitDbStatusEvent("initializing", "Opening database connection...")

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      const error = new Error("Database error: " + (event.target as IDBRequest).error)
      emitDbStatusEvent("error", error.message)
      reject(error)
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      emitDbStatusEvent("success", "Database connection established")
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      emitDbStatusEvent("initializing", "Creating database schema...")

      // Create object stores with indexes
      if (!db.objectStoreNames.contains(STORES.HABITS)) {
        const habitsStore = db.createObjectStore(STORES.HABITS, { keyPath: "id" })
        habitsStore.createIndex("updatedAt", "updatedAt", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.DAILIES)) {
        const dailiesStore = db.createObjectStore(STORES.DAILIES, { keyPath: "id" })
        dailiesStore.createIndex("updatedAt", "updatedAt", { unique: false })
        dailiesStore.createIndex("dueDate", "dueDate", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.TODOS)) {
        const todosStore = db.createObjectStore(STORES.TODOS, { keyPath: "id" })
        todosStore.createIndex("updatedAt", "updatedAt", { unique: false })
        todosStore.createIndex("priority", "priority", { unique: false })
        todosStore.createIndex("completed", "completed", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncQueueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: "id", autoIncrement: true })
        syncQueueStore.createIndex("timestamp", "timestamp", { unique: false })
      }

      // Add to the initDatabase function in the request.onupgradeneeded event handler, after the other stores
      if (!db.objectStoreNames.contains(STORES.REWARDS)) {
        const rewardsStore = db.createObjectStore(STORES.REWARDS, { keyPath: "id" })
        rewardsStore.createIndex("updatedAt", "updatedAt", { unique: false })
        rewardsStore.createIndex("cost", "cost", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.USER)) {
        const userStore = db.createObjectStore(STORES.USER, { keyPath: "id" })
        userStore.createIndex("updatedAt", "updatedAt", { unique: false })
      }
    }
  })
}

// Database service class
class DatabaseService {
  // Open database connection
  async openDB(): Promise<IDBDatabase> {
    try {
      return await initDatabase()
    } catch (error) {
      console.error("Failed to open database:", error)
      throw error
    }
  }

  // Generic get all items from a store
  async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.getAll()

        request.onsuccess = () => {
          resolve(request.result as T[])
        }

        request.onerror = () => {
          reject(request.error)
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (error) {
      console.error(`Failed to get all items from ${storeName}:`, error)
      return []
    }
  }

  // Generic get item by id
  async getById<T>(storeName: string, id: number): Promise<T | null> {
    try {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.get(id)

        request.onsuccess = () => {
          resolve((request.result as T) || null)
        }

        request.onerror = () => {
          reject(request.error)
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (error) {
      console.error(`Failed to get item from ${storeName}:`, error)
      return null
    }
  }

  // Check if an item with the given ID exists
  async itemExists(storeName: string, id: number): Promise<boolean> {
    try {
      const item = await this.getById(storeName, id)
      return item !== null
    } catch (error) {
      console.error(`Failed to check if item exists in ${storeName}:`, error)
      return false
    }
  }

  // Generic add item
  async add<T extends { id?: number }>(storeName: string, item: T): Promise<T> {
    try {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)

        // Generate a new unique ID if not provided
        if (!item.id) {
          item.id = generateUniqueId()
        }

        // Use put instead of add to avoid constraint errors
        // This will overwrite if the ID exists, but we're generating unique IDs
        const request = store.put(item)

        request.onsuccess = () => {
          // Add to sync queue
          this.addToSyncQueue("create", storeName, item)
          resolve(item)
        }

        request.onerror = () => {
          // If there's still an error, try with a new ID
          if (request.error && request.error.name === "ConstraintError") {
            console.warn("ID collision detected, generating new ID")
            item.id = generateUniqueId()
            this.add(storeName, item).then(resolve).catch(reject)
          } else {
            reject(request.error)
          }
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (error) {
      console.error(`Failed to add item to ${storeName}:`, error)
      throw error
    }
  }

  // Generic update item
  async update<T extends { id: number }>(storeName: string, item: T): Promise<T> {
    try {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.put(item)

        request.onsuccess = () => {
          // Add to sync queue
          this.addToSyncQueue("update", storeName, item)
          resolve(item)
        }

        request.onerror = () => {
          reject(request.error)
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (error) {
      console.error(`Failed to update item in ${storeName}:`, error)
      throw error
    }
  }

  // Generic delete item
  async delete(storeName: string, id: number): Promise<void> {
    try {
      // First get the item to add to sync queue
      const item = await this.getById(storeName, id)

      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.delete(id)

        request.onsuccess = () => {
          // Add to sync queue
          if (item) {
            this.addToSyncQueue("delete", storeName, item)
          }
          resolve()
        }

        request.onerror = () => {
          reject(request.error)
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (error) {
      console.error(`Failed to delete item from ${storeName}:`, error)
      throw error
    }
  }

  // Add operation to sync queue
  async addToSyncQueue(operation: "create" | "update" | "delete", store: string, data: any): Promise<void> {
    try {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.SYNC_QUEUE, "readwrite")
        const syncStore = transaction.objectStore(STORES.SYNC_QUEUE)

        const syncItem: SyncQueueItem = {
          id: 0, // Will be auto-incremented
          operation,
          store,
          data,
          timestamp: Date.now(),
        }

        const request = syncStore.add(syncItem)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(request.error)
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (error) {
      console.error("Failed to add to sync queue:", error)
    }
  }

  // Get all items in sync queue
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return await this.getAll<SyncQueueItem>(STORES.SYNC_QUEUE)
  }

  // Clear sync queue
  async clearSyncQueue(): Promise<void> {
    try {
      const db = await this.openDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.SYNC_QUEUE, "readwrite")
        const store = transaction.objectStore(STORES.SYNC_QUEUE)
        const request = store.clear()

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(request.error)
        }

        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (error) {
      console.error("Failed to clear sync queue:", error)
      throw error
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const db = await this.openDB()
      db.close()
      return true
    } catch (error) {
      console.error("Database connection test failed:", error)
      return false
    }
  }

  // Get database information
  async getDatabaseInfo(): Promise<{ name: string; version: number; stores: string[] }> {
    try {
      const db = await this.openDB()
      const info = {
        name: db.name,
        version: db.version,
        stores: Array.from(db.objectStoreNames),
      }
      db.close()
      return info
    } catch (error) {
      console.error("Failed to get database info:", error)
      throw error
    }
  }

  // Habits specific methods
  habits = {
    getAll: async (): Promise<Habit[]> => {
      return await this.getAll<Habit>(STORES.HABITS)
    },

    getById: async (id: number): Promise<Habit | null> => {
      return await this.getById<Habit>(STORES.HABITS, id)
    },

    add: async (habit: Omit<Habit, "id" | "createdAt" | "updatedAt" | "count">): Promise<Habit> => {
      const now = Date.now()
      const newHabit: Habit = {
        ...habit,
        id: generateUniqueId(),
        count: 0,
        createdAt: now,
        updatedAt: now,
      }
      return await this.add<Habit>(STORES.HABITS, newHabit)
    },

    update: async (habit: Habit): Promise<Habit> => {
      const updatedHabit = {
        ...habit,
        updatedAt: Date.now(),
      }
      return await this.update<Habit>(STORES.HABITS, updatedHabit)
    },

    delete: async (id: number): Promise<void> => {
      return await this.delete(STORES.HABITS, id)
    },
  }

  // Dailies specific methods
  dailies = {
    getAll: async (): Promise<Daily[]> => {
      return await this.getAll<Daily>(STORES.DAILIES)
    },

    getById: async (id: number): Promise<Daily | null> => {
      return await this.getById<Daily>(STORES.DAILIES, id)
    },

    add: async (daily: Omit<Daily, "id" | "createdAt" | "updatedAt" | "completed" | "streak">): Promise<Daily> => {
      const now = Date.now()
      const newDaily: Daily = {
        ...daily,
        id: generateUniqueId(),
        completed: false,
        streak: 0,
        createdAt: now,
        updatedAt: now,
      }
      return await this.add<Daily>(STORES.DAILIES, newDaily)
    },

    update: async (daily: Daily): Promise<Daily> => {
      const updatedDaily = {
        ...daily,
        updatedAt: Date.now(),
      }
      return await this.update<Daily>(STORES.DAILIES, updatedDaily)
    },

    delete: async (id: number): Promise<void> => {
      return await this.delete(STORES.DAILIES, id)
    },
  }

  // Todos specific methods
  todos = {
    getAll: async (): Promise<Todo[]> => {
      return await this.getAll<Todo>(STORES.TODOS)
    },

    getById: async (id: number): Promise<Todo | null> => {
      return await this.getById<Todo>(STORES.TODOS, id)
    },

    add: async (todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "completed">): Promise<Todo> => {
      const now = Date.now()
      const newTodo: Todo = {
        ...todo,
        id: generateUniqueId(),
        completed: false,
        createdAt: now,
        updatedAt: now,
      }
      return await this.add<Todo>(STORES.TODOS, newTodo)
    },

    update: async (todo: Todo): Promise<Todo> => {
      const updatedTodo = {
        ...todo,
        updatedAt: Date.now(),
      }
      return await this.update<Todo>(STORES.TODOS, updatedTodo)
    },

    delete: async (id: number): Promise<void> => {
      return await this.delete(STORES.TODOS, id)
    },
  }

  // Add the rewards methods to the DatabaseService class at the end, before the export
  // Rewards specific methods
  rewards = {
    getAll: async (): Promise<Reward[]> => {
      return await this.getAll<Reward>(STORES.REWARDS)
    },

    getById: async (id: number): Promise<Reward | null> => {
      return await this.getById<Reward>(STORES.REWARDS, id)
    },

    add: async (reward: Omit<Reward, "id" | "createdAt" | "updatedAt">): Promise<Reward> => {
      const now = Date.now()
      const newReward: Reward = {
        ...reward,
        id: generateUniqueId(),
        createdAt: now,
        updatedAt: now,
      }
      return await this.add<Reward>(STORES.REWARDS, newReward)
    },

    update: async (reward: Reward): Promise<Reward> => {
      const updatedReward = {
        ...reward,
        updatedAt: Date.now(),
      }
      return await this.update<Reward>(STORES.REWARDS, updatedReward)
    },

    delete: async (id: number): Promise<void> => {
      return await this.delete(STORES.REWARDS, id)
    },
  }

  // Add user methods
  user = {
    get: async (): Promise<User | null> => {
      try {
        const users = await this.getAll<User>(STORES.USER)
        return users[0] || null // Return first user or null
      } catch (error) {
        console.error("Failed to get user:", error)
        return null
      }
    },

    initialize: async (): Promise<User> => {
      const now = Date.now()
      const newUser: User = {
        id: 1, // Single user system
        level: 1,
        xp: 0,
        caps: 0,
        createdAt: now,
        updatedAt: now,
      }
      return await this.add<User>(STORES.USER, newUser)
    },

    update: async (user: User): Promise<User> => {
      const updatedUser = {
        ...user,
        updatedAt: Date.now(),
      }
      return await this.update<User>(STORES.USER, updatedUser)
    },
  }
}

// Create and export a single instance of the database service
export const dbService = new DatabaseService()

export const habitsDB = dbService.habits
export const dailiesDB = dbService.dailies
export const todosDB = dbService.todos
export const rewardsDB = dbService.rewards
export const userDB = dbService.user
