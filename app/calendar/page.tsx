"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Clock, MapPin, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  reminderBefore?: number // minutes before event
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    start: new Date(2025, 0, 20, 10, 0),
    end: new Date(2025, 0, 20, 11, 0),
    location: "Conference Room A",
    type: "event",
  },
  {
    id: "2",
    title: "Doctor Appointment",
    start: new Date(2025, 0, 22, 14, 0),
    end: new Date(2025, 0, 22, 15, 0),
    location: "Medical Center",
    type: "appointment",
  },
  {
    id: "3",
    title: "Mood Check-in",
    start: new Date(2025, 0, 24, 9, 0),
    type: "mood",
  },
  {
    id: "4",
    title: "Therapy Session",
    start: new Date(2025, 0, 27, 15, 0),
    end: new Date(2025, 0, 27, 16, 0),
    location: "Dr. Smith's Office",
    type: "appointment",
  },
  {
    id: "5",
    title: "Take Medication",
    start: new Date(2025, 0, 24, 8, 0),
    type: "reminder",
  },
]

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
    color: "#3b82f6", // default blue color
    reminderBefore: 0,
  })

  useEffect(() => {
    setIsMounted(true)
    setCurrentDate(new Date())
    
    // Load events from localStorage (including synced events)
    if (typeof window !== 'undefined') {
      const storedEvents = localStorage.getItem("calendarEvents")
      if (storedEvents) {
        try {
          const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: event.end ? new Date(event.end) : undefined,
          }))
          setEvents(parsedEvents.length > 0 ? parsedEvents : MOCK_EVENTS)
        } catch (error) {
          console.error("Error loading calendar events:", error)
          setEvents(MOCK_EVENTS)
        }
      } else {
        setEvents(MOCK_EVENTS)
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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const handleAddEventClick = () => {
    setShowAddEvent(true)
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering date click
    setEditingEvent(event)
    // Format date and time for the form
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
    setNewEvent({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      type: "event",
      color: "#3b82f6",
      reminderBefore: 0,
    })
  }

  const handleUpdateEvent = () => {
    if (!editingEvent || !newEvent.title || !newEvent.date) return

    const startDate = new Date(`${newEvent.date}T${newEvent.time || "09:00"}`)
    const updatedEvent: CalendarEvent = {
      ...editingEvent,
      title: newEvent.title,
      start: startDate,
      location: newEvent.location || undefined,
      description: newEvent.description || undefined,
      type: newEvent.type,
      color: newEvent.color,
      reminderBefore: newEvent.reminderBefore || undefined,
    }

    const updatedEvents = events.map(e => e.id === editingEvent.id ? updatedEvent : e)
    setEvents(updatedEvents)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
    }
    
    handleCancelEditEvent()
  }

  const handleDeleteEvent = () => {
    if (!editingEvent) return

    const updatedEvents = events.filter(e => e.id !== editingEvent.id)
    setEvents(updatedEvents)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
    }
    
    handleCancelEditEvent()
  }

  const handlePreviousMonth = () => {
    navigateMonth(-1)
  }

  const handleGoToToday = () => {
    setCurrentDate(new Date())
  }

  const handleNextMonth = () => {
    navigateMonth(1)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleCancelAddEvent = () => {
    setShowAddEvent(false)
  }

  const handleAddEventSubmit = () => {
    addEvent()
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSameMonth = (date: Date) => {
    return date.getMonth() === month && date.getFullYear() === year
  }

  const getEventTypeColor = (event: CalendarEvent) => {
    // If event has a custom color, use it
    if (event.color) {
      return {
        backgroundColor: event.color + "20", // 20% opacity
        color: event.color,
        borderColor: event.color + "40", // 40% opacity
      }
    }
    
    // Otherwise use default colors based on type
    switch (event.type) {
      case "mood":
        return {
          backgroundColor: "#dcfce7",
          color: "#166534",
          borderColor: "#86efac",
        }
      case "event":
        return {
          backgroundColor: "#dbeafe",
          color: "#1e40af",
          borderColor: "#93c5fd",
        }
      case "reminder":
        return {
          backgroundColor: "#fef3c7",
          color: "#92400e",
          borderColor: "#fde047",
        }
      case "appointment":
        return {
          backgroundColor: "#e9d5ff",
          color: "#6b21a8",
          borderColor: "#c084fc",
        }
      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#374151",
          borderColor: "#d1d5db",
        }
    }
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return

    const startDate = new Date(`${newEvent.date}T${newEvent.time || "09:00"}`)
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      start: startDate,
      location: newEvent.location || undefined,
      description: newEvent.description || undefined,
      type: newEvent.type,
      color: newEvent.color,
      reminderBefore: newEvent.reminderBefore || undefined,
    }

    const updatedEvents = [...events, event]
    setEvents(updatedEvents)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
    }
    
    setNewEvent({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      type: "event",
      color: "#3b82f6",
      reminderBefore: 0,
    })
    setShowAddEvent(false)
  }

  // Generate calendar days - ensure exactly 42 cells (6 rows × 7 days)
  const calendarDays = []
  
  // Add days from previous month to fill the first week
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
  
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(prevYear, prevMonth, day)
    calendarDays.push({ date, isCurrentMonth: false })
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    calendarDays.push({ date, isCurrentMonth: true })
  }

  // Add days from next month to complete the grid (42 total cells)
  const remainingCells = 42 - calendarDays.length
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDay = new Date(year, month + 1, day)
    calendarDays.push({ date: nextMonthDay, isCurrentMonth: false })
  }

  return (
    <AuthGuard>
      <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Fixed header with menu button */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <MenuButton />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-gray-600 text-sm">Manage your events, appointments, and mood tracking</p>
          </div>
        </div>
        
        <div className="p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            {isMounted && (
              <div className="flex items-center justify-end">
                <Button
                  onClick={handleAddEventClick}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <Card className="border-none shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousMonth}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      title="Previous Month"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col items-center">
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {monthNames[month]} {year}
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleGoToToday}
                        className="mt-2 text-xs"
                      >
                        Go to Today
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      title="Next Month"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(({ date, isCurrentMonth }, index) => {
                      const dayEvents = getEventsForDate(date)
                      const isTodayDate = isToday(date)
                      const isSelected = selectedDate?.toDateString() === date.toDateString()

                      return (
                        <div
                          key={index}
                          className={cn(
                            "min-h-[120px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 bg-white",
                            isTodayDate && "bg-blue-50 border-blue-300",
                            isSelected && "bg-purple-50 border-purple-300",
                            !isCurrentMonth && "bg-white"
                          )}
                          onClick={isMounted ? () => handleDateClick(date) : undefined}
                        >
                          <div className={cn(
                            "text-lg font-bold mb-1 flex items-center justify-between",
                            isCurrentMonth && "text-blue-600",
                            !isCurrentMonth && "text-gray-400"
                          )}>
                            <span className={cn(
                              "text-2xl font-bold",
                              isCurrentMonth && "text-blue-600",
                              !isCurrentMonth && "text-gray-400"
                            )}>{date.getDate()}</span>
                            {!isCurrentMonth && (
                              <span className="text-xs text-gray-300">
                                {date.getMonth() < month ? '◀' : '▶'}
                              </span>
                            )}
                          </div>

                          {/* Events for this day */}
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => {
                              const eventColors = getEventTypeColor(event)
                              return (
                                <div
                                  key={event.id}
                                  onClick={(e) => handleEventClick(event, e)}
                                  className="text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                  style={{
                                    backgroundColor: eventColors.backgroundColor,
                                    color: eventColors.color,
                                    borderColor: eventColors.borderColor,
                                  }}
                                >
                                  <div className="font-medium truncate">{event.title}</div>
                                  {event.location && (
                                    <div className="flex items-center text-xs opacity-75">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Events */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Today's Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {getEventsForDate(today).length > 0 ? (
                    <div className="space-y-3">
                      {getEventsForDate(today).map((event) => {
                        const eventColors = getEventTypeColor(event)
                        return (
                          <div 
                            key={event.id} 
                            className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            onClick={(e) => handleEventClick(event, e)}
                          >
                            <div 
                              className="w-3 h-3 rounded-full mt-1"
                              style={{ backgroundColor: eventColors.color }}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{event.title}</div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {event.start.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              {event.location && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No events today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <Badge variant="secondary">{events.length} events</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mood Check-ins</span>
                      <Badge variant="outline">
                        {events.filter(e => e.type === "mood").length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Appointments</span>
                      <Badge variant="outline">
                        {events.filter(e => e.type === "appointment").length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Add Event Dialog */}
          <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Add New Event</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new event, appointment, or reminder.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-900">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    className="text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-gray-900">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-gray-900">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-900">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event location"
                    className="text-gray-900"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-gray-900">Type</Label>
                  <select
                    id="type"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent["type"] })}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  >
                    <option value="event">Event</option>
                    <option value="appointment">Appointment</option>
                    <option value="meeting">Meeting</option>
                    <option value="assignments">Assignments</option>
                    <option value="work">Work</option>
                    <option value="test">Test</option>
                    <option value="activity">Activity</option>
                    <option value="match">Match</option>
                    <option value="game">Game</option>
                    <option value="tournament">Tournament</option>
                    <option value="reminder">Reminder</option>
                    <option value="mood">Mood Check-in</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="reminderBefore" className="text-gray-900">Reminder Before Event</Label>
                  <select
                    id="reminderBefore"
                    value={newEvent.reminderBefore}
                    onChange={(e) => setNewEvent({ ...newEvent, reminderBefore: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  >
                    <option value="0">No reminder</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="120">2 hours before</option>
                    <option value="1440">1 day before</option>
                    <option value="2880">2 days before</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="color" className="text-gray-900">Event Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="color"
                      type="color"
                      value={newEvent.color}
                      onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, color })}
                          className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-500 transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-900">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description"
                    rows={3}
                    className="text-gray-900"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelAddEvent}>
                  Cancel
                </Button>
                <Button onClick={handleAddEventSubmit} disabled={!newEvent.title || !newEvent.date}>
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Event Dialog */}
          <Dialog open={showEditEvent} onOpenChange={(open) => {
            setShowEditEvent(open)
            if (!open) {
              handleCancelEditEvent()
            }
          }}>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Edit Event</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Update or delete your event.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title" className="text-gray-900">Title</Label>
                  <Input
                    id="edit-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    className="text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-date" className="text-gray-900">Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="text-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-time" className="text-gray-900">Time</Label>
                    <Input
                      id="edit-time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-location" className="text-gray-900">Location (Optional)</Label>
                  <Input
                    id="edit-location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event location"
                    className="text-gray-900"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type" className="text-gray-900">Type</Label>
                  <select
                    id="edit-type"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent["type"] })}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  >
                    <option value="event">Event</option>
                    <option value="appointment">Appointment</option>
                    <option value="meeting">Meeting</option>
                    <option value="assignments">Assignments</option>
                    <option value="work">Work</option>
                    <option value="test">Test</option>
                    <option value="activity">Activity</option>
                    <option value="match">Match</option>
                    <option value="game">Game</option>
                    <option value="tournament">Tournament</option>
                    <option value="reminder">Reminder</option>
                    <option value="mood">Mood Check-in</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-reminderBefore" className="text-gray-900">Reminder Before Event</Label>
                  <select
                    id="edit-reminderBefore"
                    value={newEvent.reminderBefore}
                    onChange={(e) => setNewEvent({ ...newEvent, reminderBefore: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  >
                    <option value="0">No reminder</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="120">2 hours before</option>
                    <option value="1440">1 day before</option>
                    <option value="2880">2 days before</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-color" className="text-gray-900">Event Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="edit-color"
                      type="color"
                      value={newEvent.color}
                      onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, color })}
                          className="w-8 h-8 rounded-md border-2 border-gray-300 hover:border-gray-500 transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description" className="text-gray-900">Description (Optional)</Label>
                  <Textarea
                    id="edit-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description"
                    rows={3}
                    className="text-gray-900"
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteEvent}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEditEvent}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateEvent} disabled={!newEvent.title || !newEvent.date}>
                    Update Event
                  </Button>
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