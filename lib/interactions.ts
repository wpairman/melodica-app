export type InteractionLog = {
  id: string
  kind: "song" | "activity"
  title: string
  meta?: Record<string, any>
  rating: number
  timestamp: number
  source?: string
}

const STORAGE_KEY = "interactionLogs"

export function saveInteraction(log: Omit<InteractionLog, "id" | "timestamp">) {
  if (typeof window === "undefined") return
  const entry: InteractionLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    ...log,
  }
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY)
    const existing: InteractionLog[] = existingRaw ? JSON.parse(existingRaw) : []
    existing.unshift(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 500)))
  } catch (e) {
    // ignore storage errors for now
    console.error("Failed to save interaction log", e)
  }
}

export function getInteractions(): InteractionLog[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}


