"use client"

import { useEffect, useState } from "react"
import { Calendar, Plus } from "lucide-react"
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
import { parseICalData, type SyncedCalendarEvent } from "@/lib/calendar-sync"
import { useToast } from "@/hooks/use-toast"

type EventTopic = "Meeting" | "Homework" | "Quiz" | "Test" | "Sports Practice" | "Event" | "Concert"

/** Matches `CalendarEvent.type` on the calendar page for grid styling. */
type CalendarGridEventType =
  | "event"
  | "mood"
  | "reminder"
  | "appointment"
  | "assignments"
  | "work"
  | "test"
  | "activity"
  | "match"
  | "game"
  | "tournament"
  | "meeting"

function topicToAppType(topic: EventTopic): CalendarGridEventType {
  switch (topic) {
    case "Meeting":
      return "meeting"
    case "Homework":
      return "assignments"
    case "Quiz":
    case "Test":
      return "test"
    case "Sports Practice":
      return "activity"
    case "Event":
    case "Concert":
      return "event"
  }
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
  const [leadMinutes, setLeadMinutes] = useState(60)
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
    const appEvents = parsedEvents.map((e) => {
      const topic = detectEventTopic(e)
      return {
        id: e.id,
        title: e.title,
        start: e.start.toISOString(),
        end: e.end?.toISOString(),
        location: e.location,
        description: e.description || "",
        type: topicToAppType(topic),
        color: "#3b82f6",
        reminderBefore: 15,
      }
    })
    const existing = JSON.parse(localStorage.getItem("calendarEvents") || "[]") as { id: string }[]
    const existingIds = new Set(existing.map((e) => e.id))
    const merged = [...existing, ...appEvents.filter((e) => !existingIds.has(e.id))]
    localStorage.setItem("calendarEvents", JSON.stringify(merged))
    localStorage.setItem("syncedCalendarEvents", JSON.stringify(parsedEvents))
    localStorage.setItem("calendarConnected", "true")
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
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setAddEventDialog(true)} className="border-gray-600 text-gray-300 hover:bg-gray-700"><Plus className="mr-2 h-4 w-4" />Add Event</Button>
                <Button variant="outline" onClick={() => setSyncDialogOpen(true)} className="border-gray-600 text-gray-300 hover:bg-gray-700">Sync Another</Button>
              </div>
              <p className="mt-4 text-xs text-gray-400">Synced events appear on the calendar above.</p>
            </>
          )}
        </CardContent>
      </Card>

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
              if (!newEventTitle || !newEventDate) return
              const start = new Date(newEventDate)
              const newEv = {
                id: Date.now().toString(),
                title: newEventTitle,
                start: start.toISOString(),
                location: newEventLocation || undefined,
                description: "",
                type: topicToAppType(newEventTopic),
                color: "#3b82f6",
                reminderBefore: 15,
              }
              const raw = localStorage.getItem("calendarEvents")
              let arr: unknown[] = []
              if (raw) {
                try { arr = JSON.parse(raw) } catch { arr = [] }
              }
              arr.push(newEv)
              localStorage.setItem("calendarEvents", JSON.stringify(arr))
              setNewEventTitle("")
              setNewEventDate("")
              setNewEventLocation("")
              setNewEventTopic("Meeting")
              setAddEventDialog(false)
              toast({ title: "Event added", description: "Open the calendar above to see it." })
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
