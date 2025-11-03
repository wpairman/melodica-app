// Calendar sync utilities for iCloud and other CalDAV calendars

export interface SyncedCalendarEvent {
  id: string
  title: string
  start: Date
  end?: Date
  location?: string
  description?: string
  calendarId: string
  calendarName: string
  allDay?: boolean
}

// Generate AI-powered preparation recommendations based on event details
export function generateEventPreparationRecommendations(
  event: SyncedCalendarEvent
): string[] {
  const recommendations: string[] = []
  const titleLower = event.title.toLowerCase()
  const descriptionLower = (event.description || "").toLowerCase()
  const locationLower = (event.location || "").toLowerCase()

  // Detect event type and provide relevant recommendations
  if (
    titleLower.includes("meeting") ||
    titleLower.includes("conference") ||
    titleLower.includes("call")
  ) {
    recommendations.push("Review meeting agenda and prepare talking points")
    recommendations.push("Charge your devices and bring necessary materials")
    recommendations.push("Plan your route to ensure punctuality")
    recommendations.push("Take 5 deep breaths to center yourself before starting")
    recommendations.push("Prepare questions or discussion points in advance")
  } else if (
    titleLower.includes("exam") ||
    titleLower.includes("test") ||
    titleLower.includes("quiz")
  ) {
    recommendations.push("Review notes and key concepts (avoid cramming!)")
    recommendations.push("Get 7-8 hours of sleep the night before")
    recommendations.push("Eat a healthy breakfast on the day")
    recommendations.push("Gather all required materials: pens, calculator, ID")
    recommendations.push("Arrive 10-15 minutes early to settle in")
    recommendations.push("Do a quick mindfulness exercise to calm nerves")
  } else if (
    titleLower.includes("appointment") ||
    titleLower.includes("doctor") ||
    titleLower.includes("therapy")
  ) {
    recommendations.push("Prepare a list of questions or topics to discuss")
    recommendations.push("Bring relevant documents or medical records")
    recommendations.push("Write down any symptoms or concerns beforehand")
    recommendations.push("Plan buffer time before and after the appointment")
    recommendations.push("Take notes during the appointment if needed")
  } else if (
    titleLower.includes("presentation") ||
    titleLower.includes("pitch") ||
    titleLower.includes("speech")
  ) {
    recommendations.push("Review and practice your presentation multiple times")
    recommendations.push("Prepare backup plans for technical issues")
    recommendations.push("Get feedback from a trusted colleague or friend")
    recommendations.push("Practice deep breathing exercises to manage anxiety")
    recommendations.push("Test any technology or equipment beforehand")
    recommendations.push("Prepare answers to potential questions")
  } else if (
    titleLower.includes("interview") ||
    titleLower.includes("interview")
  ) {
    recommendations.push("Research the company and role thoroughly")
    recommendations.push("Prepare answers to common interview questions")
    recommendations.push("Plan your outfit the night before")
    recommendations.push("Prepare thoughtful questions to ask the interviewer")
    recommendations.push("Practice good posture and confident body language")
    recommendations.push("Bring extra copies of your resume")
  } else if (
    titleLower.includes("social") ||
    titleLower.includes("party") ||
    titleLower.includes("gathering") ||
    titleLower.includes("event")
  ) {
    recommendations.push("Confirm event time and location details")
    recommendations.push("Plan your outfit and prepare it the night before")
    recommendations.push("Prepare conversation starters or topics")
    recommendations.push("Bring essentials: phone, wallet, keys")
    recommendations.push("Eat a light meal beforehand to maintain energy")
    if (locationLower.includes("new") || locationLower.includes("unfamiliar")) {
      recommendations.push("Check parking options and plan your route")
    }
  } else if (
    titleLower.includes("workout") ||
    titleLower.includes("gym") ||
    titleLower.includes("exercise")
  ) {
    recommendations.push("Hydrate well throughout the day")
    recommendations.push("Eat a light meal 2-3 hours before")
    recommendations.push("Pack your workout gear and water bottle")
    recommendations.push("Do a proper warm-up to prevent injuries")
    recommendations.push("Set an intention for what you want to achieve")
  } else {
    // Generic recommendations for any event
    recommendations.push("Confirm event details (time, location, requirements)")
    recommendations.push("Plan your route and check for traffic/delays")
    recommendations.push("Gather any materials or items you'll need")
    recommendations.push("Set reminders or alarms to avoid missing it")
    recommendations.push("Get adequate rest the night before")
  }

  // Add location-specific recommendations
  if (event.location) {
    if (
      locationLower.includes("new") ||
      locationLower.includes("first time") ||
      locationLower.includes("unfamiliar")
    ) {
      recommendations.push(
        "Check the location on a map and plan your route in advance"
      )
      recommendations.push("Allow extra time for parking and finding the venue")
    }
    if (locationLower.includes("remote") || locationLower.includes("zoom")) {
      recommendations.push("Test your internet connection and video/audio")
      recommendations.push("Find a quiet, well-lit space for the meeting")
      recommendations.push("Close unnecessary apps and browser tabs")
    }
  }

  // Add time-based recommendations
  const hoursUntil = (event.start.getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursUntil < 24) {
    recommendations.push("Get a good night's sleep tonight")
  }
  if (hoursUntil < 2) {
    recommendations.push("Take a moment to breathe and center yourself")
  }

  // Limit to most relevant 5-7 recommendations
  return recommendations.slice(0, 7)
}

// Parse iCal/CalDAV data (simplified - in production, use a proper iCal parser)
export function parseICalData(icalData: string): SyncedCalendarEvent[] {
  const events: SyncedCalendarEvent[] = []
  
  // This is a simplified parser - in production, use a library like 'ical.js'
  // For now, we'll provide a structure that works with manual sync
  
  // Split by BEGIN:VEVENT
  const eventBlocks = icalData.split("BEGIN:VEVENT")
  
  eventBlocks.forEach((block, index) => {
    if (index === 0) return // Skip first block (header)
    
    try {
      const event: Partial<SyncedCalendarEvent> = {
        id: `synced-${Date.now()}-${index}`,
        calendarName: "Synced Calendar",
        calendarId: "synced-calendar",
      }

      // Extract DTSTART
      const dtStartMatch = block.match(/DTSTART[^:]*:(.+)/)
      if (dtStartMatch) {
        event.start = parseICalDate(dtStartMatch[1])
      }

      // Extract DTEND
      const dtEndMatch = block.match(/DTEND[^:]*:(.+)/)
      if (dtEndMatch) {
        event.end = parseICalDate(dtEndMatch[1])
      }

      // Extract SUMMARY
      const summaryMatch = block.match(/SUMMARY[^:]*:(.+)/)
      if (summaryMatch) {
        event.title = unescapeICal(summaryMatch[1])
      }

      // Extract LOCATION
      const locationMatch = block.match(/LOCATION[^:]*:(.+)/)
      if (locationMatch) {
        event.location = unescapeICal(locationMatch[1])
      }

      // Extract DESCRIPTION
      const descMatch = block.match(/DESCRIPTION[^:]*:(.+)/s)
      if (descMatch) {
        event.description = unescapeICal(descMatch[1].trim())
      }

      if (event.start && event.title) {
        events.push(event as SyncedCalendarEvent)
      }
    } catch (error) {
      console.error("Error parsing calendar event:", error)
    }
  })

  return events
}

// Parse iCal date format
function parseICalDate(dateStr: string): Date {
  // Handle different iCal date formats
  // Format: YYYYMMDDTHHmmssZ or YYYYMMDD
  if (dateStr.includes("T")) {
    // Date-time format
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))
    const hour = parseInt(dateStr.substring(9, 11) || "0")
    const minute = parseInt(dateStr.substring(11, 13) || "0")
    const second = parseInt(dateStr.substring(13, 15) || "0")
    return new Date(year, month, day, hour, minute, second)
  } else {
    // All-day format
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))
    return new Date(year, month, day)
  }
}

// Unescape iCal text
function unescapeICal(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
}

