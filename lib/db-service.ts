// Database configuration
const DB_NAME = "pip-boy-tasks-db"
const DB_VERSION = 1

// Store names
const STORES = {
  HABITS: "habits",
  DAILIES: "dailies",
  TODOS: "todos",
  SYNC_QUEUE: "syncQueue",
}

// Task types
export type Priority = "low" | "medium" | "high"

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

// Database initialization
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("Your browser doesn't support IndexedDB"))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject(new Error("Database error: " + (event.target as IDBRequest).error))
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

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
    }
  })
}

// Open database connection
export const openDB = async (): Promise<IDBDatabase> => {
  try {
    return await initDatabase()
  } catch (error) {
    console.error("Failed to open database:", error)
    throw error
  }
}

// Generic get all items from a store\
export const getAllItems = async <T>(storeName: string)
: Promise<T[]> =>
{
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as T[]);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Failed to get all items from ${storeName}:`, error)
    return [];
  }
}

// Generic get item by id
export const getItemById = async <T>(storeName: string, id: number)
: Promise<T | null> =>
{
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result as T || null);
      };

      request.onerror = () => {
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Failed to get item from ${storeName}:`, error)
    return null;
  }
}

// Add operation to sync queue
export const addToSyncQueue = async (
  operation: "create" | "update" | "delete",
  store: string,
  data: any,
): Promise<void> => {
  try {
    const db = await openDB()
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

// Generic add item
export const addItem = async <T extends { id?: number }>(storeName: string, item: T): Promise<T> => {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)

      // Generate a new ID if not provided
      if (!item.id) {
        item.id = Date.now()
      }

      const request = store.add(item)

      request.onsuccess = () => {
        // Add to sync queue
        addToSyncQueue("create", storeName, item)
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
    console.error(`Failed to add item to ${storeName}:`, error)
    throw error
  }
}

// Generic update item
export const updateItem = async <T extends { id: number }>(storeName: string, item: T): Promise<T> => {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onsuccess = () => {
        // Add to sync queue
        addToSyncQueue("update", storeName, item)
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
export const deleteItem = async (storeName: string, id: number): Promise<void> => {
  try {
    // First get the item to add to sync queue
    const item = await getItemById(storeName, id)

    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => {
        // Add to sync queue
        if (item) {
          addToSyncQueue("delete", storeName, item)
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

// Get all items in sync queue
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  return await getAllItems<SyncQueueItem>(STORES.SYNC_QUEUE)
}

// Clear sync queue
export const clearSyncQueue = async (): Promise<void> => {
  try {
    const db = await openDB()
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

// Habits specific methods
export const habitsDB = {
  getAll: async (): Promise<Habit[]> => {
    return await getAllItems<Habit>(STORES.HABITS)
  },

  getById: async (id: number): Promise<Habit | null> => {
    return await getItemById<Habit>(STORES.HABITS, id)
  },

  add: async (habit: Omit<Habit, "id" | "createdAt" | "updatedAt" | "count">): Promise<Habit> => {
    const now = Date.now()
    const newHabit: Habit = {
      ...habit,
      id: now,
      count: 0,
      createdAt: now,
      updatedAt: now,
    }
    return await addItem<Habit>(STORES.HABITS, newHabit)
  },

  update: async (habit: Habit): Promise<Habit> => {
    const updatedHabit = {
      ...habit,
      updatedAt: Date.now(),
    }
    return await updateItem<Habit>(STORES.HABITS, updatedHabit)
  },

  delete: async (id: number): Promise<void> => {
    return await deleteItem(STORES.HABITS, id)
  },
}

// Dailies specific methods
export const dailiesDB = {
  getAll: async (): Promise<Daily[]> => {
    return await getAllItems<Daily>(STORES.DAILIES)
  },

  getById: async (id: number): Promise<Daily | null> => {
    return await getItemById<Daily>(STORES.DAILIES, id)
  },

  add: async (daily: Omit<Daily, "id" | "createdAt" | "updatedAt" | "completed" | "streak">): Promise<Daily> => {
    const now = Date.now()
    const newDaily: Daily = {
      ...daily,
      id: now,
      completed: false,
      streak: 0,
      createdAt: now,
      updatedAt: now,
    }
    return await addItem<Daily>(STORES.DAILIES, newDaily)
  },

  update: async (daily: Daily): Promise<Daily> => {
    const updatedDaily = {
      ...daily,
      updatedAt: Date.now(),
    }
    return await updateItem<Daily>(STORES.DAILIES, updatedDaily)
  },

  delete: async (id: number): Promise<void> => {
    return await deleteItem(STORES.DAILIES, id)
  },
}

// Todos specific methods
export const todosDB = {
  getAll: async (): Promise<Todo[]> => {
    return await getAllItems<Todo>(STORES.TODOS)
  },

  getById: async (id: number): Promise<Todo | null> => {
    return await getItemById<Todo>(STORES.TODOS, id)
  },

  add: async (todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "completed">): Promise<Todo> => {
    const now = Date.now()
    const newTodo: Todo = {
      ...todo,
      id: now,
      completed: false,
      createdAt: now,
      updatedAt: now,
    }
    return await addItem<Todo>(STORES.TODOS, newTodo)
  },

  update: async (todo: Todo): Promise<Todo> => {
    const updatedTodo = {
      ...todo,
      updatedAt: Date.now(),
    }
    return await updateItem<Todo>(STORES.TODOS, updatedTodo)
  },

  delete: async (id: number): Promise<void> => {
    return await deleteItem(STORES.TODOS, id)
  },
}

// Export a combined dbService object for backward compatibility
export const dbService = {
  openDB,
  getAll: getAllItems,
  getById: getItemById,
  add: addItem,
  update: updateItem,
  delete: deleteItem,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  habits: habitsDB,
  dailies: dailiesDB,
  todos: todosDB,
}
