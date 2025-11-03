"use client"

import { useEffect, useState } from "react"
import { Calendar, Bell, Plus, Briefcase, BookOpen, ClipboardCheck, GraduationCap, Trophy, Calendar as CalendarIcon, Music } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { generateEventPreparationRecommendations, parseICalData, type SyncedCalendarEvent } from "@/lib/calendar-sync"
import { useToast } from "@/hooks/use-toast"

type EventTopic = "Meeting" | "Homework" | "Quiz" | "Test" | "Sports Practice" | "Event" | "Concert"

type CalendarEvent = {
  id: string
  title: string
  start: Date
  location?: string
  topic?: EventTopic
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Biology Mid-Term",
    start: new Date(Date.now() + 1000 * 60 * 60 * 24), // +1 day
    location: "Room 202",
    topic: "Test",
  },
  {
    id: "2",
    title: "Math Homework",
    start: new Date(Date.now() + 1000 * 60 * 60 * 48), // +2 days
    topic: "Homework",
  },
  {
    id: "3",
    title: "Team Meeting",
    start: new Date(Date.now() + 1000 * 60 * 60 * 72), // +3 days
    location: "Conference Room",
    topic: "Meeting",
  },
]

const READINESS_KITS: Record<EventTopic, string[]> = {
  "Meeting": [
    "Review meeting agenda and objectives",
    "Prepare talking points and questions",
    "Charge devices and bring notebooks",
    "Plan route to ensure punctuality",
    "Take 5 deep breaths to center yourself"
  ],
  "Homework": [
    "Gather all necessary materials and resources",
    "Find a quiet, distraction-free workspace",
    "Set a realistic completion goal",
    "Start with the most challenging task first",
    "Take breaks every 25-30 minutes"
  ],
  "Quiz": [
    "Review notes and key concepts (don't cram!)",
    "Get a good night's sleep beforehand",
    "Eat a healthy breakfast",
    "Bring all required materials (pens, calculator, etc.)",
    "Arrive 10 minutes early to settle in"
  ],
  "Test": [
    "Complete practice problems or past papers",
    "Organize your study materials",
    "Get 7-8 hours of sleep the night before",
    "Pack everything needed: ID, calculator, extra pens",
    "Do a quick mindfulness exercise before starting"
  ],
  "Sports Practice": [
    "Hydrate well throughout the day",
    "Eat a light meal 2-3 hours before",
    "Wear appropriate gear and bring extras",
    "Do a proper warm-up routine",
    "Set intention for what you want to improve"
  ],
  "Event": [
    "Confirm event time and location",
    "Plan your outfit the night before",
    "Review any background information",
    "Prepare conversation starters",
    "Bring essentials: phone, wallet, ID"
  ],
  "Concert": [
    "Check venue parking and arrival time",
    "Bring ear protection if needed",
    "Dress comfortably for standing/dancing",
    "Eat beforehand and stay hydrated",
    "Leave early to avoid traffic stress"
  ],
}

export default function CalendarIntegration() {
  const { toast } = useToast()
  const [connected, setConnected] = useState<boolean>(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [syncedEvents, setSyncedEvents] = useState<SyncedCalendarEvent[]>([])
  const [leadMinutes, setLeadMinutes] = useState<number>(60) // default 1 h
  const [open, setOpen] = useState<boolean>(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [newEventTopic, setNewEventTopic] = useState<EventTopic>("Meeting")
  const [addEventDialog, setAddEventDialog] = useState<boolean>(false)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDate, setNewEventDate] = useState("")
  const [newEventLocation, setNewEventLocation] = useState("")
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [icalUrl, setIcalUrl] = useState("")
  const [syncing, setSyncing] = useState(false)

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
      // Load events from localStorage (including synced events)
      const storedEvents = localStorage.getItem("calendarEvents")
      if (storedEvents) {
        try {
          const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: event.end ? new Date(event.end) : undefined,
          }))
          setEvents(parsedEvents)
        } catch (error) {
          console.error("Error loading events:", error)
          setEvents(MOCK_EVENTS)
        }
      } else {
        setEvents(MOCK_EVENTS)
      }
      
      // Load synced events
      const storedSyncedEvents = localStorage.getItem("syncedCalendarEvents")
      if (storedSyncedEvents) {
        try {
          const parsedSynced = JSON.parse(storedSyncedEvents).map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: event.end ? new Date(event.end) : undefined,
          }))
          setSyncedEvents(parsedSynced)
        } catch (error) {
          console.error("Error loading synced events:", error)
        }
      }
    }
  }, [])

  /* Persist lead-time changes */
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return
    
    localStorage.setItem("calendarLeadMinutes", String(leadMinutes))
  }, [leadMinutes])

  const connectCalendar = async () => {
    // Show sync dialog for iCloud/CalDAV
    setSyncDialogOpen(true)
  }

  const syncICloudCalendar = async () => {
    if (!icalUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter your calendar URL",
        variant: "destructive",
      })
      return
    }

    setSyncing(true)
    try {
      // In production, this would make a proper CalDAV request
      // For now, we'll fetch the iCal feed URL
      const response = await fetch(icalUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch calendar")
      }

      const icalData = await response.text()
      const parsedEvents = parseICalData(icalData)

      // Transfer synced events to app calendar
      const appEvents: CalendarEvent[] = parsedEvents.map((syncedEvent) => ({
        id: syncedEvent.id,
        title: syncedEvent.title,
        start: syncedEvent.start,
        end: syncedEvent.end,
        location: syncedEvent.location,
        topic: detectEventTopic(syncedEvent),
      }))

      // Merge with existing events
      const existingEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]")
      const allEvents = [...existingEvents, ...appEvents]

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("calendarEvents", JSON.stringify(allEvents))
        localStorage.setItem("syncedCalendarEvents", JSON.stringify(parsedEvents))
        localStorage.setItem("calendarConnected", "true")
      }

      setSyncedEvents(parsedEvents)
      setEvents([...events, ...appEvents])
      setConnected(true)
      setSyncDialogOpen(false)
      setIcalUrl("")

      toast({
        title: "Calendar synced! ✅",
        description: `Successfully imported ${parsedEvents.length} events from your calendar`,
      })
    } catch (error) {
      console.error("Error syncing calendar:", error)
      toast({
        title: "Sync failed",
        description: "Could not sync calendar. Please check your URL and try again.",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  // Detect event topic for AI recommendations
  const detectEventTopic = (event: SyncedCalendarEvent): EventTopic => {
    const titleLower = event.title.toLowerCase()
    if (titleLower.includes("meeting")) return "Meeting"
    if (titleLower.includes("homework") || titleLower.includes("assignment")) return "Homework"
    if (titleLower.includes("quiz")) return "Quiz"
    if (titleLower.includes("test") || titleLower.includes("exam")) return "Test"
    if (titleLower.includes("practice") || titleLower.includes("workout") || titleLower.includes("gym")) return "Sports Practice"
    if (titleLower.includes("concert") || titleLower.includes("show")) return "Concert"
    return "Event"
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
            <div className="space-y-3">
              <Button onClick={connectCalendar} className="flex gap-2 w-full">
                <Plus className="size-4" />
                Sync iCloud Calendar
              </Button>
              <p className="text-xs text-muted-foreground">
                Connect your iCloud calendar to automatically import events and get AI-powered preparation recommendations
              </p>
            </div>
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

              {/* Add Event Button */}
              <Button variant="outline" className="mb-4" onClick={() => setAddEventDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>

              {/* Upcoming events */}
              <h4 className="mb-2 font-medium">Next events</h4>
              <ul className="space-y-2">
                {events.map((ev) => (
                  <li key={ev.id} className={cn("rounded-md border p-3 transition-colors", "hover:bg-muted/60")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ev.topic && (
                          <Badge variant="secondary" className="text-xs">
                            {ev.topic}
                          </Badge>
                        )}
                        <span>{ev.title}</span>
                      </div>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => {
                        setSelectedEvent(ev)
                        setOpen(true)
                      }}
                    >
                      Get readiness kit
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* Readiness Kit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="size-5 text-emerald-600" />
              Readiness Kit: {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              A personalized preparation checklist for your upcoming {selectedEvent?.topic?.toLowerCase() || "event"}.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">AI-Powered Preparation Checklist:</h4>
              {(() => {
                // Check if this is a synced event
                const syncedEvent = syncedEvents.find(e => e.id === selectedEvent.id)
                let recommendations: string[] = []

                if (syncedEvent) {
                  // Use AI recommendations for synced events
                  recommendations = generateEventPreparationRecommendations(syncedEvent)
                } else if (selectedEvent.topic) {
                  // Use topic-based recommendations for manually added events
                  recommendations = READINESS_KITS[selectedEvent.topic]
                } else {
                  // Generate AI recommendations for events without topics
                  const mockSyncedEvent: SyncedCalendarEvent = {
                    id: selectedEvent.id,
                    title: selectedEvent.title,
                    start: selectedEvent.start,
                    end: selectedEvent.end,
                    location: selectedEvent.location,
                    description: "",
                    calendarId: "local",
                    calendarName: "Local Calendar",
                  }
                  recommendations = generateEventPreparationRecommendations(mockSyncedEvent)
                }

                return (
                  <ul className="space-y-2">
                    {recommendations.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 h-5 w-5 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0">
                          <div className="h-2 w-2 rounded-full bg-emerald-600" />
                        </div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              })()}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={addEventDialog} onOpenChange={setAddEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new calendar event with a topic.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="e.g., Team Meeting"
              />
            </div>
            <div>
              <Label htmlFor="event-topic">Event Topic</Label>
              <Select value={newEventTopic} onValueChange={(value) => setNewEventTopic(value as EventTopic)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Homework">Homework</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                  <SelectItem value="Sports Practice">Sports Practice</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Concert">Concert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="event-date">Date & Time</Label>
              <Input
                id="event-date"
                type="datetime-local"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="event-location">Location (optional)</Label>
              <Input
                id="event-location"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
                placeholder="e.g., Room 202"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEventDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              if (newEventTitle && newEventDate) {
                const newEvent: CalendarEvent = {
                  id: Date.now().toString(),
                  title: newEventTitle,
                  start: new Date(newEventDate),
                  location: newEventLocation || undefined,
                  topic: newEventTopic,
                }
                setEvents([...events, newEvent])
                setNewEventTitle("")
                setNewEventDate("")
                setNewEventLocation("")
                setNewEventTopic("Meeting")
                setAddEventDialog(false)
              }
            }}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* iCloud Calendar Sync Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync iCloud Calendar</DialogTitle>
            <DialogDescription>
              Enter your iCloud calendar URL to import events. You can find this in your iCloud calendar settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ical-url">Calendar URL (iCal format)</Label>
              <Input
                id="ical-url"
                type="url"
                placeholder="https://pXX-caldav.icloud.com/..."
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                disabled={syncing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: In iCloud, go to Calendar → Settings → Calendars → Click the (i) icon → Find "Public Calendar" and copy the URL
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-900">
                <strong>Note:</strong> For automatic sync, you'll need to provide CalDAV credentials. 
                This basic sync imports your calendar data once. For full integration, OAuth or CalDAV authentication is required.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)} disabled={syncing}>
              Cancel
            </Button>
            <Button onClick={syncICloudCalendar} disabled={syncing || !icalUrl.trim()}>
              {syncing ? "Syncing..." : "Sync Calendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
