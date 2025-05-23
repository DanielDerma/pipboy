// Service Worker for Pip-Boy PWA
importScripts('/lib/db-service.js');

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

  // Network-first strategy for API requests
  if (event.request.url.startsWith(self.location.origin + "/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If the network request is successful, cache and return the response
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // If the network request fails, try to serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // If not in cache, return a generic error or custom offline JSON response
            return new Response(
              JSON.stringify({ error: "Offline and data not available in cache" }),
              {
                status: 503, // Service Unavailable
                headers: { "Content-Type": "application/json" },
              },
            )
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
  let allTasksSynced = true;
  try {
    // Get all pending tasks from dbService
    const pendingTasks = await dbService.getSyncQueue();

    if (!pendingTasks || pendingTasks.length === 0) {
      console.log("No tasks to sync.");
      // Notify clients that sync is complete (no tasks)
      const clientsNoTasks = await self.clients.matchAll();
      clientsNoTasks.forEach((client) => {
        client.postMessage({
          type: "SYNC_COMPLETED",
          message: "No tasks to synchronize.",
        });
      });
      return;
    }

    // Send each pending task to the server
    for (const task of pendingTasks) {
      try {
        const response = await sendTaskToServer(task);
        if (!response.ok) {
          console.error("Failed to send task to server:", task, "Response:", response.status);
          allTasksSynced = false;
          // Optionally, break here or collect failed tasks for selective removal
        }
      } catch (error) {
        console.error("Error sending task:", task, error);
        allTasksSynced = false;
        // Optionally, break here or collect failed tasks
      }
    }

    if (allTasksSynced) {
      await dbService.clearSyncQueue();
      console.log("All tasks synchronized successfully and queue cleared.");
      const clientsSuccess = await self.clients.matchAll();
      clientsSuccess.forEach((client) => {
        client.postMessage({
          type: "SYNC_COMPLETED",
          message: "All tasks have been synchronized successfully.",
        });
      });
    } else {
      console.log("Some tasks failed to sync. Queue not cleared.");
      const clientsPartial = await self.clients.matchAll();
      clientsPartial.forEach((client) => {
        client.postMessage({
          type: "SYNC_FAILED",
          message: "Some tasks could not be synchronized. Will retry later.",
        });
      });
    }
  } catch (error) {
    console.error("Background sync failed:", error);
    allTasksSynced = false; // Ensure queue is not cleared on general error
    const clientsError = await self.clients.matchAll();
    clientsError.forEach((client) => {
      client.postMessage({
        type: "SYNC_ERROR",
        message: "Background synchronization encountered an error.",
      });
    });
  }
}

// Updated sendTaskToServer function
async function sendTaskToServer(syncQueueItem) {
  // Simulate API call to /api/sync
  return fetch("/api/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(syncQueueItem),
  });
}

// getPendingTasksFromDB and markTaskAsSynced are no longer needed as standalone functions here
// as their logic is incorporated into syncTasks or handled by dbService.

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
