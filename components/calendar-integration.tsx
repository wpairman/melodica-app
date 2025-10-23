"use client"

import { useEffect, useState } from "react"
import { Calendar, Bell, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type CalendarEvent = {
  id: string
  title: string
  start: Date
  location?: string
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Biology Mid-Term",
    start: new Date(Date.now() + 1000 * 60 * 60 * 24), // +1 day
    location: "Room 202",
  },
  {
    id: "2",
    title: "Lunch with Alex",
    start: new Date(Date.now() + 1000 * 60 * 60 * 48), // +2 days
    location: "Cafe Lumen",
  },
  {
    id: "3",
    title: "Gym – Leg Day",
    start: new Date(Date.now() + 1000 * 60 * 60 * 72), // +3 days
  },
]

export default function CalendarIntegration() {
  const [connected, setConnected] = useState<boolean>(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [leadMinutes, setLeadMinutes] = useState<number>(60) // default 1 h
  const [open, setOpen] = useState<boolean>(false)

  /* Load persisted prefs on mount */
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return
    
    const isConnected = localStorage.getItem("calendarConnected") === "true"
    const savedLead = Number(localStorage.getItem("calendarLeadMinutes"))
    setConnected(isConnected)
    if (!Number.isNaN(savedLead) && savedLead > 0) {
      setLeadMinutes(savedLead)
    }
    if (isConnected) {
      // In a real app fetch user's live events here.
      setEvents(MOCK_EVENTS)
    }
  }, [])

  /* Persist lead-time changes */
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return
    
    localStorage.setItem("calendarLeadMinutes", String(leadMinutes))
  }, [leadMinutes])

  const connectCalendar = async () => {
    // ─── REPLACE WITH REAL OAUTH FLOW ──────────────────────────
    setConnected(true)
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      localStorage.setItem("calendarConnected", "true")
    }
    setEvents(MOCK_EVENTS)
  }

  const handleNotifLeadChange = (value: string) => {
    const n = Number(value)
    if (!Number.isNaN(n) && n > 0) setLeadMinutes(n)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-rose-600" />
            Calendar Integration
          </CardTitle>
          <CardDescription>
            Sync your calendar so Melodica can send helpful, mood-aware reminders before important events.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!connected ? (
            <Button onClick={connectCalendar} className="flex gap-2">
              <Plus className="size-4" />
              Connect Google Calendar
            </Button>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Connected&nbsp;✓ — we’ll watch your calendar and notify you{" "}
                <span className="font-medium">{leadMinutes}</span>&nbsp;minutes before each event.
              </p>

              {/* Notification timing */}
              <div className="flex flex-wrap items-end gap-4 mb-6">
                <div>
                  <Label htmlFor="lead">Notify me …</Label>
                  <Input
                    id="lead"
                    type="number"
                    min={5}
                    value={leadMinutes}
                    onChange={(e) => handleNotifLeadChange(e.target.value)}
                    className="w-24"
                  />
                </div>
                <span className="pb-1 text-sm text-muted-foreground">minutes ahead</span>
              </div>

              {/* Upcoming events */}
              <h4 className="mb-2 font-medium">Next events</h4>
              <ul className="space-y-2">
                {events.map((ev) => (
                  <li key={ev.id} className={cn("rounded-md border p-3 transition-colors", "hover:bg-muted/60")}>
                    <div className="flex items-center justify-between">
                      <span>{ev.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {ev.start.toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {ev.location && <p className="mt-1 text-xs text-muted-foreground">{ev.location}</p>}
                    <Button variant="outline" size="xs" className="mt-2" onClick={() => setOpen(true)}>
                      Get readiness kit
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* Readiness Kit Modal (simplified) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="size-5 text-emerald-600" />
              Readiness Kit
            </DialogTitle>
            <DialogDescription>
              A quick preparation checklist generated for your upcoming event. (Stub content — replace with real AI
              output.)
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-1 pl-4 list-disc text-sm">
            <li>Review agenda / study material</li>
            <li>Prepare required documents &amp; gear</li>
            <li>5-minute mindfulness breathing</li>
            <li>Put on your favourite focus playlist</li>
          </ul>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
