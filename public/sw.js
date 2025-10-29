// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "melodica-offline"
const OFFLINE_URL = "/offline"

// Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/", "/icons/icon-192x192.png", "/icons/icon-512x512.png"])),
  )
})

// If any fetch fails, it will show the offline page.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we got a valid response, cache it
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch((error) => {
        // When the fetch fails, try to return the cached page
        return caches.match(event.request).then((response) => response || caches.match(OFFLINE_URL))
      }),
  )
})

// This is an event that can be fired from your page to tell the SW to update the offline page
self.addEventListener("refreshOffline", () => {
  const offlinePageRequest = new Request(OFFLINE_URL)

  return fetch(offlinePageRequest).then((response) =>
    caches.open(CACHE).then((cache) => cache.put(offlinePageRequest, response)),
  )
})

// Push notification handling
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {}
  const title = data.title || "Melodica - Mood Check-in"
  const body = data.body || "How are you feeling right now? Take a moment to track your mood."
  const icon = data.icon || "/icons/icon-192x192.png"

  // Create notification actions for quick mood logging
  // Mobile platforms typically support 2-4 actions, so we'll show the most common ones
  // On mobile, users can expand the notification to see all options
  const actions = [
    { action: "mood-1", title: "1 😢" },
    { action: "mood-3", title: "3" },
    { action: "mood-5", title: "5 😐" },
    { action: "mood-7", title: "7" },
    { action: "mood-10", title: "10 😊" },
  ]

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: icon,
      tag: "mood-checkin",
      requireInteraction: false,
      actions: actions, // Show 5 actions - most mobile platforms support this
      data: {
        url: "/dashboard",
        timestamp: Date.now()
      },
      // For Android/iOS, the notification will expand to show more options
      vibrate: [200, 100, 200],
    })
  )
})

// Notification action click handling (for quick mood logging)
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  
  // Check if it's a mood action
  if (event.action && event.action.startsWith("mood-")) {
    const mood = Number.parseInt(event.action.split("-")[1])
    
    // Save mood to localStorage via postMessage to active clients
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        const moodEntry = {
          mood: mood,
          timestamp: new Date().toISOString(),
          notes: "Logged from notification"
        }
        
        // Send mood to any open app windows
        clientList.forEach((client) => {
          client.postMessage({
            type: "QUICK_MOOD_LOG",
            mood: moodEntry
          })
        })
        
        // Also store in IndexedDB for offline access
        return saveMoodEntryDB(moodEntry).then(() => {
          // Show confirmation notification
          return self.registration.showNotification("Mood Logged! 💚", {
            body: `Your mood (${mood}/10) has been saved. Thank you for checking in!`,
            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-192x192.png",
            tag: "mood-confirmation",
            requireInteraction: false,
          })
        })
      })
    )
    return
  }
  
  // Default: open app
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url.includes(self.location.origin)) {
          return clientList[i].focus()
        }
      }
      // Otherwise, open the app
      return clients.openWindow("/dashboard")
    })
  )
})

// Save mood entry for offline access
async function saveMoodEntryDB(moodEntry) {
  try {
    // Store in cache for offline access (simpler and more reliable than IndexedDB in service worker)
    const cache = await caches.open('melodica-moods')
    const response = new Response(JSON.stringify(moodEntry))
    await cache.put(`mood-${Date.now()}`, response)
    
    // Also try to save via postMessage to any open clients
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "QUICK_MOOD_LOG",
        mood: moodEntry
      })
    })
    
    return Promise.resolve()
  } catch (error) {
    console.error('Error saving mood:', error)
    return Promise.resolve() // Don't fail notification if save fails
  }
}
