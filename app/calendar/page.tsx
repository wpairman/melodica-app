"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Clock, MapPin, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CalendarNotifications from "@/components/calendar-notifications"
import CalendarIntegration from "@/components/calendar-integration"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"
import { AuthGuard } from "@/components/auth-guard"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end?: Date
  location?: string
  description?: string
  type: "event" | "mood" | "reminder" | "appointment" | "assignments" | "work" | "test" | "activity" | "match" | "game" | "tournament" | "meeting"
  color?: string
  reminderBefore?: number
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showEditEvent, setShowEditEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    type: "event" as CalendarEvent["type"],
    color: "#3b82f6",
    reminderBefore: 0,
  })

  useEffect(() => {
    setIsMounted(true)
    setCurrentDate(new Date())

    if (typeof window !== 'undefined') {
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
          console.error("Error loading calendar events:", error)
          setEvents([])
        }
      } else {
        setEvents([])
      }
    }
  }, [])

  if (!currentDate) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading calendar...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingEvent(event)
    const eventDate = new Date(event.start)
    const dateStr = eventDate.toISOString().split('T')[0]
    const timeStr = eventDate.toTimeString().slice(0, 5)
    setNewEvent({
      title: event.title,
      date: dateStr,
      time: timeStr,
      location: event.location || "",
      description: event.description || "",
      type: event.type,
      color: event.color || "#3b82f6",
      reminderBefore: event.reminderBefore || 0,
    })
    setShowEditEvent(true)
  }

  const handleCancelEditEvent = () => {
    setShowEditEvent(false)
    setEditingEvent(null)
    setNewEvent({ title: "", date: "", time: "", location: "", description: "", type: "event", color: "#3b82f6", reminderBefore: 0 })
  }

  const handleUpdateEvent = () => {
    if (!editingEvent || !newEvent.title || !newEvent.date) return
    const startDate = new Date(`${newEvent.date}T${newEvent.time || "09:00"}`)
    const updatedEvent: CalendarEvent = { ...editingEvent, title: newEvent.title, start: startDate, location: newEvent.location || undefined, description: newEvent.description || undefined, type: newEvent.type, color: newEvent.color, reminderBefore: newEvent.reminderBefore || undefined }
    const updatedEvents = events.map(e => e.id === editingEvent.id ? updatedEvent : e)
    setEvents(updatedEvents)
    if (typeof window !== 'undefined') localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
    handleCancelEditEvent()
  }

  const handleDeleteEvent = () => {
    if (!editingEvent) return
    const updatedEvents = events.filter(e => e.id !== editingEvent.id)
    setEvents(updatedEvents)
    if (typeof window !== 'undefined') localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
    handleCancelEditEvent()
  }

  const getEventsForDate = (date: Date) => events.filter((event) => new Date(event.start).toDateString() === date.toDateString())

  const isToday = (date: Date) => date.toDateString() === today.toDateString()

  const getEventTypeColor = (event: CalendarEvent) => {
    if (event.color) return { backgroundColor: event.color + "20", color: event.color, borderColor: event.color + "40" }
    switch (event.type) {
      case "mood": return { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" }
      case "event": return { backgroundColor: "#dbeafe", color: "#1e40af", borderColor: "#93c5fd" }
      case "reminder": return { backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fde047" }
      case "appointment": return { backgroundColor: "#e9d5ff", color: "#6b21a8", borderColor: "#c084fc" }
      default: return { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#d1d5db" }
    }
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return
    const startDate = new Date(`${newEvent.date}T${newEvent.time || "09:00"}`)
    const event: CalendarEvent = { id: Date.now().toString(), title: newEvent.title, start: startDate, location: newEvent.location || undefined, description: newEvent.description || undefined, type: newEvent.type, color: newEvent.color, reminderBefore: newEvent.reminderBefore || undefined }
    const updatedEvents = [...events, event]
    setEvents(updatedEvents)
    if (typeof window !== 'undefined') localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
    setNewEvent({ title: "", date: "", time: "", location: "", description: "", type: "event", color: "#3b82f6", reminderBefore: 0 })
    setShowAddEvent(false)
  }

  const calendarDays = []
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({ date: new Date(prevYear, prevMonth, daysInPrevMonth - i), isCurrentMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ date: new Date(year, month, day), isCurrentMonth: true })
  }
  const remainingCells = 42 - calendarDays.length
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
  }

  const eventTypeOptions = ["event","appointment","meeting","assignments","work","test","activity","match","game","tournament","reminder","mood"]

  return (
    <AuthGuard>
      <DashboardLayout>
        <CalendarNotifications />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
            <MenuButton />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Calendar</h1>
              <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">Manage your events, appointments, and mood tracking</p>
            </div>
          </div>

          <div className="p-2 sm:p-4">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {isMounted && (
                <div className="flex items-center justify-end">
                  <Button onClick={() => setShowAddEvent(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm sm:text-base px-3 sm:px-4">
                    <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Event</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              )}

              <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3">
                  <Card className="border-none shadow-lg bg-white">
                    <CardHeader className="pb-3 sm:pb-4 px-2 sm:px-6">
                      <div className="flex items-center justify-between gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)} className="p-1.5 sm:p-2 min-w-[40px]">
                          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <div className="flex flex-col items-center flex-1">
                          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 text-center">{monthNames[month]} {year}</CardTitle>
                          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="mt-1 sm:mt-2 text-xs px-2 sm:px-3">
                            <span className="hidden sm:inline">Go to Today</span>
                            <span className="sm:hidden">Today</span>
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigateMonth(1)} className="p-1.5 sm:p-2 min-w-[40px]">
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6">
                      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                        {calendarDays.map(({ date, isCurrentMonth }, index) => {
                          const dayEvents = getEventsForDate(date)
                          const isTodayDate = isToday(date)
                          const isSelected = selectedDate?.toDateString() === date.toDateString()
                          return (
                            <div key={index}
                              className={cn("min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] p-1 sm:p-1.5 md:p-2 border border-gray-200 rounded-md sm:rounded-lg cursor-pointer transition-colors hover:bg-gray-50 bg-white",
                                isTodayDate && "bg-blue-50 border-blue-300",
                                isSelected && "bg-purple-50 border-purple-300")}
                              onClick={isMounted ? () => setSelectedDate(date) : undefined}>
                              <div className={cn("mb-0.5 sm:mb-1 flex items-center justify-between")}>
                                <span className={cn("text-lg sm:text-xl md:text-2xl font-bold", isCurrentMonth ? "text-blue-600" : "text-gray-300")}>{date.getDate()}</span>
                              </div>
                              <div className="space-y-0.5 sm:space-y-1">
                                {dayEvents.slice(0, 2).map((event) => {
                                  const ec = getEventTypeColor(event)
                                  return (
                                    <div key={event.id} onClick={(e) => handleEventClick(event, e)}
                                      className="text-[10px] sm:text-xs p-0.5 sm:p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                      style={{ backgroundColor: ec.backgroundColor, color: ec.color, borderColor: ec.borderColor }}>
                                      <div className="font-medium truncate leading-tight">{event.title}</div>
                                    </div>
                                  )
                                })}
                                {dayEvents.length > 2 && <div className="text-[10px] sm:text-xs text-gray-500 text-center">+{dayEvents.length - 2} more</div>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4 sm:space-y-6 lg:col-span-1">
                  <Card className="border-none shadow-lg">
                    <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">Today's Events</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      {getEventsForDate(today).length > 0 ? (
                        <div className="space-y-2 sm:space-y-3">
                          {getEventsForDate(today).map((event) => {
                            const ec = getEventTypeColor(event)
                            return (
                              <div key={event.id} className="flex items-start space-x-2 sm:space-x-3 cursor-pointer hover:bg-gray-50 p-2 sm:p-3 rounded-lg transition-colors" onClick={(e) => handleEventClick(event, e)}>
                                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: ec.color }} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm sm:text-base">{event.title}</div>
                                  <div className="text-xs sm:text-sm text-gray-500 flex items-center mt-0.5">
                                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                    {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  {event.location && (
                                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">{event.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 sm:py-6">
                          <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-500">No events today</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg">
                    <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
                      <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">This Month</span>
                          <Badge variant="secondary">{events.length} events</Badge>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">Mood Check-ins</span>
                          <Badge variant="outline">{events.filter(e => e.type === "mood").length}</Badge>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-600">Appointments</span>
                          <Badge variant="outline">{events.filter(e => e.type === "appointment").length}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-6">
                <CalendarIntegration />
              </div>

              {/* Add Event Dialog */}
              <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
                <DialogContent className="w-[95vw] max-w-md bg-white max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900">Add New Event</DialogTitle>
                    <DialogDescription className="text-gray-600">Create a new event, appointment, or reminder.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label className="text-gray-900">Title</Label><Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title" className="text-gray-900 bg-white border-gray-300" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-gray-900">Date</Label><Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="text-gray-900 bg-white border-gray-300" /></div>
                      <div><Label className="text-gray-900">Time</Label><Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="text-gray-900 bg-white border-gray-300" /></div>
                    </div>
                    <div><Label className="text-gray-900">Location (Optional)</Label><Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Event location" className="text-gray-900 bg-white border-gray-300" /></div>
                    <div>
                      <Label className="text-gray-900">Type</Label>
                      <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent["type"] })} className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white">
                        {eventTypeOptions.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-900">Reminder Before Event</Label>
                      <select value={newEvent.reminderBefore} onChange={(e) => setNewEvent({ ...newEvent, reminderBefore: parseInt(e.target.value) })} className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white">
                        <option value="0">No reminder</option>
                        <option value="5">5 minutes before</option>
                        <option value="15">15 minutes before</option>
                        <option value="30">30 minutes before</option>
                        <option value="60">1 hour before</option>
                        <option value="120">2 hours before</option>
                        <option value="1440">1 day before</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-900">Event Color</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <input type="color" value={newEvent.color} onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })} className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer" />
                        <div className="flex gap-2 flex-wrap">
                          {["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"].map(color => (
                            <button key={color} type="button" onClick={() => setNewEvent({ ...newEvent, color })} className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-500" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div><Label className="text-gray-900">Description (Optional)</Label><Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Event description" rows={3} className="text-gray-900 bg-white border-gray-300" /></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
                    <Button onClick={addEvent} disabled={!newEvent.title || !newEvent.date}>Add Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Event Dialog */}
              <Dialog open={showEditEvent} onOpenChange={(open) => { setShowEditEvent(open); if (!open) handleCancelEditEvent() }}>
                <DialogContent className="w-[95vw] max-w-md bg-white max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900">Edit Event</DialogTitle>
                    <DialogDescription className="text-gray-600">Update or delete your event.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label className="text-gray-900">Title</Label><Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title" className="text-gray-900 bg-white border-gray-300" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-gray-900">Date</Label><Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="text-gray-900 bg-white border-gray-300" /></div>
                      <div><Label className="text-gray-900">Time</Label><Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="text-gray-900 bg-white border-gray-300" /></div>
                    </div>
                    <div><Label className="text-gray-900">Location (Optional)</Label><Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Event location" className="text-gray-900 bg-white border-gray-300" /></div>
                    <div>
                      <Label className="text-gray-900">Type</Label>
                      <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent["type"] })} className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white">
                        {eventTypeOptions.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-900">Reminder Before Event</Label>
                      <select value={newEvent.reminderBefore} onChange={(e) => setNewEvent({ ...newEvent, reminderBefore: parseInt(e.target.value) })} className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white">
                        <option value="0">No reminder</option>
                        <option value="5">5 minutes before</option>
                        <option value="15">15 minutes before</option>
                        <option value="30">30 minutes before</option>
                        <option value="60">1 hour before</option>
                        <option value="120">2 hours before</option>
                        <option value="1440">1 day before</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-900">Event Color</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <input type="color" value={newEvent.color} onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })} className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer" />
                        <div className="flex gap-2 flex-wrap">
                          {["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"].map(color => (
                            <button key={color} type="button" onClick={() => setNewEvent({ ...newEvent, color })} className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-500" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div><Label className="text-gray-900">Description (Optional)</Label><Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Event description" rows={3} className="text-gray-900 bg-white border-gray-300" /></div>
                  </div>
                  <DialogFooter className="flex justify-between">
                    <Button variant="destructive" onClick={handleDeleteEvent} className="mr-auto">
                      <Trash2 className="h-4 w-4 mr-2" />Delete
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancelEditEvent}>Cancel</Button>
                      <Button onClick={handleUpdateEvent} disabled={!newEvent.title || !newEvent.date}>Update Event</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
