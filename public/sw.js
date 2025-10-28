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

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: icon,
      tag: "mood-checkin",
      requireInteraction: false,
    })
  )
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  
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
