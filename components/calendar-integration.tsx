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
  end?: Date
  location?: string
  topic?: EventTopic
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Biology Mid-Term", start: new Date(Date.now() + 1000 * 60 * 60 * 24), location: "Room 202", topic: "Test" },
  { id: "2", title: "Math Homework", start: new Date(Date.now() + 1000 * 60 * 60 * 48), topic: "Homework" },
  { id: "3", title: "Team Meeting", start: new Date(Date.now() + 1000 * 60 * 60 * 72), location: "Conference Room", topic: "Meeting" },
]

const READINESS_KITS: Record<EventTopic, string[]> = {
  "Meeting": ["Review meeting agenda and objectives", "Prepare talking points and questions", "Charge devices and bring notebooks", "Plan route to ensure punctuality", "Take 5 deep breaths to center yourself"],
  "Homework": ["Gather all necessary materials and resources", "Find a quiet, distraction-free workspace", "Set a realistic completion goal", "Start with the most challenging task first", "Take breaks every 25-30 minutes"],
  "Quiz": ["Review notes and key concepts (don't cram!)", "Get a good night's sleep beforehand", "Eat a healthy breakfast", "Bring all required materials (pens, calculator, etc.)", "Arrive 10 minutes early to settle in"],
  "Test": ["Complete practice problems or past papers", "Organize your study materials", "Get 7-8 hours of sleep the night before", "Pack everything needed: ID, calculator, extra pens", "Do a quick mindfulness exercise before starting"],
  "Sports Practice": ["Hydrate well throughout the day", "Eat a light meal 2-3 hours before", "Wear appropriate gear and bring extras", "Do a proper warm-up routine", "Set intention for what you want to improve"],
  "Event": ["Confirm event time and location", "Plan your outfit the night before", "Review any background information", "Prepare conversation starters", "Bring essentials: phone, wallet, ID"],
  "Concert": ["Check venue parking and arrival time", "Bring ear protection if needed", "Dress comfortably for standing/dancing", "Eat beforehand and stay hydrated", "Leave early to avoid traffic stress"],
}

type CalendarPlatform = "google" | "apple" | "canvas" | "other"

const platforms = [
  {
    id: "google" as CalendarPlatform,
    name: "Google Calendar",
    icon: "🗓️",
    color: "border-blue-500 bg-blue-500/10",
    instructions: [
      "Open Google Calendar on desktop",
      "Click the three dots next to your calendar name",
      'Select "Settings and sharing"',
      'Scroll down to "Export calendar"',
      "Download the .ics file",
      "Upload it below",
    ],
  },
  {
    id: "apple" as CalendarPlatform,
    name: "Apple Calendar",
    icon: "🍎",
    color: "border-gray-400 bg-gray-400/10",
    instructions: [
      "Open the Calendar app on your Mac",
      "Right-click on the calendar you want to export",
      'Select "Export..."',
      "Save the .ics file to your computer",
      "Upload it below",
    ],
  },
  {
    id: "canvas" as CalendarPlatform,
    name: "Canvas",
    icon: "🎓",
    color: "border-red-500 bg-red-500/10",
    instructions: [
      "Log in to your Canvas account",
      'Click "Calendar" in the left sidebar',
      'Click "Calendar Feed" at the bottom right',
      "Copy the URL and open it in your browser",
      "Save the file as .ics and upload below",
    ],
  },
  {
    id: "other" as CalendarPlatform,
    name: "Other Calendar",
    icon: "📅",
    color: "border-teal-500 bg-teal-500/10",
    instructions: [
      "Open your calendar app",
      "Go to Settings or File menu",
      'Look for "Export" or "Export as .ics"',
      "Save the file and upload it below",
    ],
  },
]

export default function CalendarIntegration() {
  const { toast } = useToast()
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [syncedEvents, setSyncedEvents] = useState<SyncedCalendarEvent[]>([])
  const [leadMinutes, setLeadMinutes] = useState(60)
  const [open, setOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [newEventTopic, setNewEventTopic] = useState<EventTopic>("Meeting")
  const [addEventDialog, setAddEventDialog] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDate, setNewEventDate] = useState("")
  const [newEventLocation, setNewEventLocation] = useState("")
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<CalendarPlatform | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isConnected = localStorage.getItem("calendarConnected") === "true"
    const savedLead = Number(localStorage.getItem("calendarLeadMinutes"))
    setConnected(isConnected)
    if (!Number.isNaN(savedLead) && savedLead > 0) setLeadMinutes(savedLead)
    if (isConnected) {
      const storedEvents = localStorage.getItem("calendarEvents")
      if (storedEvents) {
        try {
          setEvents(JSON.parse(storedEvents).map((e: any) => ({ ...e, start: new Date(e.start), end: e.end ? new Date(e.end) : undefined })))
        } catch { setEvents(MOCK_EVENTS) }
      } else { setEvents(MOCK_EVENTS) }
      const storedSynced = localStorage.getItem("syncedCalendarEvents")
      if (storedSynced) {
        try { setSyncedEvents(JSON.parse(storedSynced).map((e: any) => ({ ...e, start: new Date(e.start), end: e.end ? new Date(e.end) : undefined }))) } catch {}
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem("calendarLeadMinutes", String(leadMinutes))
  }, [leadMinutes])

  const detectEventTopic = (event: SyncedCalendarEvent): EventTopic => {
    const t = event.title.toLowerCase()
    if (t.includes("meeting")) return "Meeting"
    if (t.includes("homework") || t.includes("assignment")) return "Homework"
    if (t.includes("quiz")) return "Quiz"
    if (t.includes("test") || t.includes("exam")) return "Test"
    if (t.includes("practice") || t.includes("workout") || t.includes("gym")) return "Sports Practice"
    if (t.includes("concert") || t.includes("show")) return "Concert"
    return "Event"
  }

  const processICalData = (icalData: string, source: string) => {
    const parsedEvents = parseICalData(icalData)
    if (parsedEvents.length === 0) {
      toast({ title: "No events found", description: "The file was loaded but contained no events.", variant: "destructive" })
      return
    }
    const appEvents: CalendarEvent[] = parsedEvents.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, location: e.location, topic: detectEventTopic(e) }))
    const existing = JSON.parse(localStorage.getItem("calendarEvents") || "[]")
    const existingIds = new Set(existing.map((e: CalendarEvent) => e.id))
    const allEvents = [...existing, ...appEvents.filter(e => !existingIds.has(e.id))]
    localStorage.setItem("calendarEvents", JSON.stringify(allEvents))
    localStorage.setItem("syncedCalendarEvents", JSON.stringify(parsedEvents))
    localStorage.setItem("calendarConnected", "true")
    setSyncedEvents(prev => [...prev, ...parsedEvents])
    setEvents(allEvents)
    setConnected(true)
    setSyncDialogOpen(false)
    setSelectedPlatform(null)
    toast({ title: "Calendar imported! ✅", description: `Imported ${parsedEvents.length} event${parsedEvents.length === 1 ? '' : 's'} from ${source}` })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.ics') && !file.name.endsWith('.ical')) {
      toast({ title: "Invalid file type", description: "Please upload a .ics or .ical file", variant: "destructive" })
      return
    }
    setSyncing(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        if (!data?.trim()) throw new Error("File is empty")
        processICalData(data, platforms.find(p => p.id === selectedPlatform)?.name || "your calendar")
      } catch (err: any) {
        toast({ title: "Import failed", description: err?.message || "Unknown error", variant: "destructive" })
      } finally {
        setSyncing(false)
        event.target.value = ""
      }
    }
    reader.onerror = () => { toast({ title: "File read error", description: "Could not read the file.", variant: "destructive" }); setSyncing(false) }
    reader.readAsText(file)
  }

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="size-5 text-rose-500" />
            Calendar Integration
          </CardTitle>
          <CardDescription className="text-gray-300">
            Sync your calendar so Melodica can send mood-aware reminders before important events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!connected ? (
            <div className="space-y-3">
              <Button onClick={() => setSyncDialogOpen(true)} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="size-4 mr-2" /> Sync Your Calendar
              </Button>
              <p className="text-xs text-gray-400">Supports Google Calendar, Apple Calendar, Canvas, and any .ics file</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-300">Connected ✓ — notifying you <span className="font-medium text-white">{leadMinutes}</span> minutes before each event.</p>
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <div>
                  <Label htmlFor="lead" className="text-white">Notify me …</Label>
                  <Input id="lead" type="number" min={5} value={leadMinutes} onChange={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n) && n > 0) setLeadMinutes(n) }} className="w-24 bg-gray-700 border-gray-600 text-white" />
                </div>
                <span className="pb-1 text-sm text-gray-400">minutes ahead</span>
              </div>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" onClick={() => setAddEventDialog(true)} className="border-gray-600 text-gray-300 hover:bg-gray-700"><Plus className="mr-2 h-4 w-4" />Add Event</Button>
                <Button variant="outline" onClick={() => setSyncDialogOpen(true)} className="border-gray-600 text-gray-300 hover:bg-gray-700">Sync Another</Button>
              </div>
              <h4 className="mb-2 font-medium text-white">Next events</h4>
              <ul className="space-y-2">
                {events.map((ev) => (
                  <li key={ev.id} className={cn("rounded-md border border-gray-600 p-3 bg-gray-700/50 hover:bg-gray-700")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ev.topic && <Badge variant="secondary" className="text-xs">{ev.topic}</Badge>}
                        <span className="text-white">{ev.title}</span>
                      </div>
                      <span className="text-sm text-gray-400">{ev.start.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {ev.location && <p className="mt-1 text-xs text-gray-400">{ev.location}</p>}
                    <Button variant="outline" size="sm" className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => { setSelectedEvent(ev); setOpen(true) }}>Get readiness kit</Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* Readiness Kit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white"><Bell className="size-5 text-emerald-500" />Readiness Kit: {selectedEvent?.title}</DialogTitle>
            <DialogDescription className="text-gray-300">A personalized preparation checklist for your upcoming {selectedEvent?.topic?.toLowerCase() || "event"}.</DialogDescription>
          </DialogHeader>
          {selectedEvent && (() => {
            const synced = syncedEvents.find(e => e.id === selectedEvent.id)
            const recs = synced ? generateEventPreparationRecommendations(synced)
              : selectedEvent.topic ? READINESS_KITS[selectedEvent.topic]
              : generateEventPreparationRecommendations({ id: selectedEvent.id, title: selectedEvent.title, start: selectedEvent.start, end: selectedEvent.end, location: selectedEvent.location, description: "", calendarId: "local", calendarName: "Local Calendar" })
            return <ul className="space-y-2">{recs.map((item, i) => (<li key={i} className="flex items-start gap-2"><div className="mt-1 h-5 w-5 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0"><div className="h-2 w-2 rounded-full bg-emerald-500" /></div><span className="text-sm text-gray-200">{item}</span></li>))}</ul>
          })()}
          <DialogFooter><Button onClick={() => setOpen(false)} className="bg-teal-600 hover:bg-teal-700">Got it!</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={addEventDialog} onOpenChange={setAddEventDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Event</DialogTitle>
            <DialogDescription className="text-gray-300">Create a new calendar event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-white">Event Title</Label><Input value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} placeholder="e.g., Team Meeting" className="bg-gray-700 border-gray-600 text-white" /></div>
            <div>
              <Label className="text-white">Event Topic</Label>
              <Select value={newEventTopic} onValueChange={(v) => setNewEventTopic(v as EventTopic)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {["Meeting","Homework","Quiz","Test","Sports Practice","Event","Concert"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-white">Date & Time</Label><Input type="datetime-local" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className="bg-gray-700 border-gray-600 text-white" /></div>
            <div><Label className="text-white">Location (optional)</Label><Input value={newEventLocation} onChange={(e) => setNewEventLocation(e.target.value)} placeholder="e.g., Room 202" className="bg-gray-700 border-gray-600 text-white" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEventDialog(false)} className="border-gray-600 text-gray-300">Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
              if (newEventTitle && newEventDate) {
                setEvents(prev => [...prev, { id: Date.now().toString(), title: newEventTitle, start: new Date(newEventDate), location: newEventLocation || undefined, topic: newEventTopic }])
                setNewEventTitle(""); setNewEventDate(""); setNewEventLocation(""); setNewEventTopic("Meeting"); setAddEventDialog(false)
              }
            }}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Multi-Platform Sync Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={(o) => { setSyncDialogOpen(o); if (!o) setSelectedPlatform(null) }}>
        <DialogContent className="max-w-lg bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Sync Your Calendar</DialogTitle>
            <DialogDescription className="text-gray-300">Choose your calendar platform and upload your .ics file.</DialogDescription>
          </DialogHeader>
          {!selectedPlatform ? (
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <button key={platform.id} onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 text-center transition hover:opacity-90 ${platform.color}`}>
                  <span className="text-3xl">{platform.icon}</span>
                  <span className="text-sm font-medium text-white">{platform.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={() => setSelectedPlatform(null)} className="text-sm text-teal-400 hover:underline">← Back to platforms</button>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-white mb-2">{selectedPlatformData?.icon} How to export from {selectedPlatformData?.name}:</p>
                <ol className="space-y-1">
                  {selectedPlatformData?.instructions.map((step, i) => (
                    <li key={i} className="text-xs text-gray-300 flex gap-2">
                      <span className="text-teal-400 font-medium shrink-0">{i + 1}.</span>{step}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-white">Upload your .ics file</Label>
                <Input id="file-upload" type="file" accept=".ics,.ical" onChange={handleFileUpload} disabled={syncing} className="bg-gray-700 border-gray-600 text-white" />
              </div>
              {syncing && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400" />
                  Processing calendar...
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSyncDialogOpen(false); setSelectedPlatform(null) }} disabled={syncing} className="border-gray-600 text-gray-300 hover:bg-gray-700">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
