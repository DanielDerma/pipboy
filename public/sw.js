// Service Worker for Pip-Boy PWA

const CACHE_NAME = "pip-boy-cache-v1"
const OFFLINE_URL = "/offline.html"

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/manifest.webmanifest",
]

// Install event - precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - network-first strategy with fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // For HTML pages, use network-first strategy
  if (event.request.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request).then((cachedResponse) => {
            // Return cached response or offline page
            return cachedResponse || caches.match(OFFLINE_URL)
          })
        }),
    )
    return
  }

  // For other assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache the new response
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch((error) => {
          console.error("Fetch failed:", error)
          // For image requests, return a placeholder
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
            return caches.match("/icons/placeholder.png")
          }
          // For other requests, just propagate the error
          throw error
        })
    }),
  )
})

// Background sync for pending actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(syncTasks())
  }
})

// Function to sync pending tasks
async function syncTasks() {
  try {
    // Get all pending tasks from IndexedDB
    const pendingTasks = await getPendingTasksFromDB()

    // Send each pending task to the server
    for (const task of pendingTasks) {
      await sendTaskToServer(task)
      await markTaskAsSynced(task.id)
    }

    // Notify clients that sync is complete
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETED",
        message: "All tasks have been synchronized",
      })
    })
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}

// Placeholder functions for IndexedDB operations
// These would be implemented with actual IndexedDB code
function getPendingTasksFromDB() {
  // This would fetch pending tasks from IndexedDB
  return Promise.resolve([])
}

function sendTaskToServer(task) {
  // This would send the task to your server API
  return Promise.resolve()
}

function markTaskAsSynced(taskId) {
  // This would mark the task as synced in IndexedDB
  return Promise.resolve()
}

// Push notification event
self.addEventListener("push", (event) => {
  const data = event.data.json()

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url)
      }
    }),
  )
})
