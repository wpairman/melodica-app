"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Bell, Clock, Moon, Volume2, Palette, Eye, MapPin, Shield, Calendar } from "lucide-react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { ColorCustomizationPanel } from "@/components/settings/color-customization-panel"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { MenuButton } from "@/components/navigation-sidebar"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      frequency: 2, // hours
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
      },
      sound: true,
      vibration: true,
    },
    calendar: {
      enabled: false,
      eventNotifications: true,
      notificationTiming: 60, // minutes before event
      readinessKits: true,
      eventTypes: {
        meetings: true,
        tests: true,
        homework: true,
        gym: true,
        appointments: true,
        social: true,
      },
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      locationServices: false,
      weatherTracking: false,
    },
    display: {
      darkMode: false,
      fontSize: 16,
    },
    appearance: {
      backgroundColor: "#ffffff", // Background color (was primaryColor)
      secondaryColor: "#10b981", // Secondary color (was accentColor)
      textColor: "#000000", // New text color option
      customTheme: false,
    },
  })

  useEffect(() => {
    // Load settings from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem("appSettings")
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings)
        setSettings(parsed)

        // Apply custom theme if enabled
        if (parsed.appearance?.customTheme) {
          applyCustomTheme(
            parsed.appearance.backgroundColor,
            parsed.appearance.secondaryColor,
            parsed.appearance.textColor,
          )
        }

        // Request notification permission if notifications are enabled
        if (parsed.notifications?.enabled && "Notification" in window) {
          if (Notification.permission === "default") {
            Notification.requestPermission()
          }
        }
      }
    }
  }, [])

  const applyCustomTheme = (backgroundColor: string, secondaryColor: string, textColor: string) => {
    const root = document.documentElement

    // Convert hex to HSL for better color manipulation
    const hexToHsl = (hex: string) => {
      const r = Number.parseInt(hex.slice(1, 3), 16) / 255
      const g = Number.parseInt(hex.slice(3, 5), 16) / 255
      const b = Number.parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0,
        s = 0,
        l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }

      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
    }

    const [bgH, bgS, bgL] = hexToHsl(backgroundColor)
    const [secondaryH, secondaryS, secondaryL] = hexToHsl(secondaryColor)
    const [textH, textS, textL] = hexToHsl(textColor)

    // Apply CSS custom properties for background
    root.style.setProperty("--background", `${bgH} ${bgS}% ${bgL}%`)
    root.style.setProperty("--card", `${bgH} ${Math.min(bgS + 5, 100)}% ${Math.min(bgL + 5, 95)}%`)
    root.style.setProperty("--popover", `${bgH} ${bgS}% ${bgL}%`)
    root.style.setProperty("--muted", `${bgH} ${Math.max(bgS - 10, 0)}% ${Math.max(bgL - 10, 5)}%`)

    // Apply secondary color (for buttons, accents, etc.)
    root.style.setProperty("--primary", `${secondaryH} ${secondaryS}% ${secondaryL}%`)
    root.style.setProperty("--primary-foreground", `${secondaryH} ${secondaryS}% ${secondaryL > 50 ? 10 : 90}%`)
    root.style.setProperty(
      "--accent",
      `${secondaryH} ${Math.min(secondaryS + 10, 100)}% ${Math.min(secondaryL + 10, 90)}%`,
    )
    root.style.setProperty("--accent-foreground", `${secondaryH} ${secondaryS}% ${secondaryL > 50 ? 10 : 90}%`)

    // Apply text colors
    root.style.setProperty("--foreground", `${textH} ${textS}% ${textL}%`)
    root.style.setProperty(
      "--muted-foreground",
      `${textH} ${Math.max(textS - 20, 0)}% ${textL > 50 ? textL - 30 : textL + 30}%`,
    )
    root.style.setProperty("--card-foreground", `${textH} ${textS}% ${textL}%`)
    root.style.setProperty("--popover-foreground", `${textH} ${textS}% ${textL}%`)

    // Border colors based on background
    root.style.setProperty("--border", `${bgH} ${Math.max(bgS - 20, 0)}% ${bgL > 50 ? bgL - 20 : bgL + 20}%`)
    root.style.setProperty("--input", `${bgH} ${Math.max(bgS - 20, 0)}% ${bgL > 50 ? bgL - 20 : bgL + 20}%`)
    root.style.setProperty("--ring", `${secondaryH} ${secondaryS}% ${secondaryL}%`)
  }

  const resetCustomTheme = () => {
    const root = document.documentElement
    root.style.removeProperty("--primary")
    root.style.removeProperty("--primary-foreground")
    root.style.removeProperty("--accent")
    root.style.removeProperty("--accent-foreground")
    root.style.removeProperty("--primary-light")
    root.style.removeProperty("--primary-dark")
    root.style.removeProperty("--accent-light")
    root.style.removeProperty("--accent-dark")
  }

  const updateSettings = (newSettings: any) => {
    setSettings(newSettings)
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("appSettings", JSON.stringify(newSettings))
    }

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })

    // Update notification schedule
    if (newSettings.notifications.enabled) {
      scheduleNotifications(newSettings.notifications)
    } else {
      clearNotifications()
    }

    // Apply or reset custom theme
    if (newSettings.appearance?.customTheme) {
      applyCustomTheme(
        newSettings.appearance.backgroundColor,
        newSettings.appearance.secondaryColor,
        newSettings.appearance.textColor,
      )
    } else {
      resetCustomTheme()
    }
  }

  const handleLocationToggle = (enabled: boolean) => {
    if (enabled) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newSettings = {
              ...settings,
              privacy: { ...settings.privacy, locationServices: true, weatherTracking: true },
            }
            updateSettings(newSettings)
            toast({
              title: "Location services enabled",
              description: "Weather tracking and therapist finder are now available.",
            })
          },
          (error) => {
            toast({
              title: "Location permission denied",
              description: "Please enable location services in your browser to use weather and therapist features.",
              variant: "destructive",
            })
          },
        )
      } else {
        toast({
          title: "Location not supported",
          description: "Your browser doesn't support location services.",
          variant: "destructive",
        })
      }
    } else {
      const newSettings = {
        ...settings,
        privacy: { ...settings.privacy, locationServices: false, weatherTracking: false },
      }
      updateSettings(newSettings)
    }
  }

  const scheduleNotifications = (notificationSettings: any) => {
    // Clear existing notifications
    clearNotifications()

    if (!("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    // Store notification interval in localStorage for the service worker (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("notificationInterval", notificationSettings.frequency.toString())
      localStorage.setItem("quietHoursStart", notificationSettings.quietHours.start)
      localStorage.setItem("quietHoursEnd", notificationSettings.quietHours.end)
      localStorage.setItem("quietHoursEnabled", notificationSettings.quietHours.enabled.toString())
    }

    // Schedule the next notification
    const intervalMs = notificationSettings.frequency * 60 * 60 * 1000 // Convert hours to milliseconds

    const scheduleNext = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // Check if we're in quiet hours
      if (notificationSettings.quietHours.enabled) {
        const startHour = Number.parseInt(notificationSettings.quietHours.start.split(":")[0])
        const endHour = Number.parseInt(notificationSettings.quietHours.end.split(":")[0])

        const isQuietTime =
          startHour > endHour
            ? currentHour >= startHour || currentHour < endHour
            : currentHour >= startHour && currentHour < endHour

        if (isQuietTime) {
          // Schedule for when quiet hours end
          const nextNotification = new Date()
          nextNotification.setHours(endHour, 0, 0, 0)
          if (nextNotification <= now) {
            nextNotification.setDate(nextNotification.getDate() + 1)
          }

          const timeUntilNext = nextNotification.getTime() - now.getTime()
          setTimeout(() => {
            showMoodNotification()
            scheduleNext()
          }, timeUntilNext)
          return
        }
      }

      // Schedule regular notification
      setTimeout(() => {
        showMoodNotification()
        scheduleNext()
      }, intervalMs)
    }

    scheduleNext()
  }

  const showMoodNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("Melodica - Mood Check-in", {
        body: "How are you feeling right now? Take a moment to track your mood.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        tag: "mood-checkin",
        requireInteraction: true,
      })

      notification.onclick = () => {
        window.focus()
        window.location.href = "/dashboard"
        notification.close()
      }

      // Auto-close after 10 seconds if not interacted with
      setTimeout(() => {
        notification.close()
      }, 10000)
    }
  }

  const clearNotifications = () => {
    // Clear any stored notification timers (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("notificationInterval")
      localStorage.removeItem("quietHoursStart")
      localStorage.removeItem("quietHoursEnd")
      localStorage.removeItem("quietHoursEnabled")
    }
  }

  const handleNotificationToggle = (enabled: boolean) => {
    if (enabled && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const newSettings = {
            ...settings,
            notifications: { ...settings.notifications, enabled: true },
          }
          updateSettings(newSettings)
        } else {
          toast({
            title: "Notification permission denied",
            description: "Please enable notifications in your browser settings to receive mood reminders.",
            variant: "destructive",
          })
        }
      })
    } else {
      const newSettings = {
        ...settings,
        notifications: { ...settings.notifications, enabled },
      }
      updateSettings(newSettings)
    }
  }

  const handleDarkModeToggle = (enabled: boolean) => {
    setTheme(enabled ? "dark" : "light")
    const newSettings = {
      ...settings,
      display: { ...settings.display, darkMode: enabled },
    }
    updateSettings(newSettings)
  }

  const frequencyOptions = [
    { value: 1, label: "Every hour" },
    { value: 2, label: "Every 2 hours" },
    { value: 3, label: "Every 3 hours" },
    { value: 4, label: "Every 4 hours" },
    { value: 6, label: "Every 6 hours" },
    { value: 8, label: "Every 8 hours" },
    { value: 12, label: "Every 12 hours" },
    { value: 24, label: "Once a day" },
  ]

  const calendarTimingOptions = [
    { value: 15, label: "15 minutes before" },
    { value: 30, label: "30 minutes before" },
    { value: 60, label: "1 hour before" },
    { value: 120, label: "2 hours before" },
    { value: 240, label: "4 hours before" },
    { value: 480, label: "8 hours before" },
    { value: 1440, label: "1 day before" },
  ]

  const presetThemes = [
    { name: "Ocean", backgroundColor: "#f0f9ff", secondaryColor: "#0ea5e9", textColor: "#0c4a6e" },
    { name: "Forest", backgroundColor: "#f0fdf4", secondaryColor: "#10b981", textColor: "#064e3b" },
    { name: "Sunset", backgroundColor: "#fff7ed", secondaryColor: "#f97316", textColor: "#9a3412" },
    { name: "Lavender", backgroundColor: "#faf5ff", secondaryColor: "#8b5cf6", textColor: "#581c87" },
    { name: "Rose", backgroundColor: "#fff1f2", secondaryColor: "#f43f5e", textColor: "#881337" },
    { name: "Mint", backgroundColor: "#f0fdfa", secondaryColor: "#06d6a0", textColor: "#134e4a" },
    { name: "Dark Mode", backgroundColor: "#0f172a", secondaryColor: "#3b82f6", textColor: "#f1f5f9" },
    { name: "High Contrast", backgroundColor: "#ffffff", secondaryColor: "#000000", textColor: "#000000" },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Fixed header with menu button */}
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
          <MenuButton />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
            <p className="text-gray-300 text-sm">Manage your app preferences and notifications</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-6">

        <div className="grid gap-6">
          {/* Calendar Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5" />
                Calendar & Event Notifications
              </CardTitle>
              <CardDescription className="text-gray-300">Configure calendar integration and event preparation assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Enable Calendar Integration</Label>
                  <div className="text-sm text-gray-400">
                    Sync your calendar and get AI-powered event preparation assistance
                  </div>
                </div>
                <Switch
                  checked={settings.calendar.enabled}
                  onCheckedChange={(enabled) => {
                    const newSettings = {
                      ...settings,
                      calendar: { ...settings.calendar, enabled },
                    }
                    updateSettings(newSettings)
                  }}
                />
              </div>

              {settings.calendar.enabled && (
                <div className="ml-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Event Notifications</Label>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified before events with preparation assistance
                      </div>
                    </div>
                    <Switch
                      checked={settings.calendar.eventNotifications}
                      onCheckedChange={(eventNotifications) => {
                        const newSettings = {
                          ...settings,
                          calendar: { ...settings.calendar, eventNotifications },
                        }
                        updateSettings(newSettings)
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Notification Timing</Label>
                    <Select
                      value={settings.calendar.notificationTiming.toString()}
                      onValueChange={(value) => {
                        const newSettings = {
                          ...settings,
                          calendar: { ...settings.calendar, notificationTiming: Number.parseInt(value) },
                        }
                        updateSettings(newSettings)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 shadow-lg" position="popper" side="bottom">
                        {calendarTimingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()} className="text-black hover:bg-gray-100">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">AI Readiness Kits</Label>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Generate personalized preparation guides for events
                      </div>
                    </div>
                    <Switch
                      checked={settings.calendar.readinessKits}
                      onCheckedChange={(readinessKits) => {
                        const newSettings = {
                          ...settings,
                          calendar: { ...settings.calendar, readinessKits },
                        }
                        updateSettings(newSettings)
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Event Types to Track</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(settings.calendar.eventTypes).map(([type, enabled]) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => {
                              const newSettings = {
                                ...settings,
                                calendar: {
                                  ...settings.calendar,
                                  eventTypes: { ...settings.calendar.eventTypes, [type]: checked },
                                },
                              }
                              updateSettings(newSettings)
                            }}
                          />
                          <Label className="text-sm capitalize">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & Weather Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Weather Services
              </CardTitle>
              <CardDescription>
                Enable location services for weather tracking and therapist finder features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Location Services</Label>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Allow the app to access your location for weather and therapist features
                  </div>
                </div>
                <Switch checked={settings.privacy.locationServices} onCheckedChange={handleLocationToggle} />
              </div>

              {settings.privacy.locationServices && (
                <div className="ml-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Weather Tracking</Label>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Track how weather affects your mood
                      </div>
                    </div>
                    <Switch
                      checked={settings.privacy.weatherTracking}
                      onCheckedChange={(weatherTracking) => {
                        const newSettings = {
                          ...settings,
                          privacy: { ...settings.privacy, weatherTracking },
                        }
                        updateSettings(newSettings)
                      }}
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Privacy Notice</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your location data is only used to provide weather information and find nearby therapists. We do
                      not store or share your precise location with third parties.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color Customization */}
          <ColorCustomizationPanel />

          {/* Display Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription className="text-gray-300">
                Adjust font size and other display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2 text-white">
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </Label>
                  <div className="text-sm text-gray-400">
                    Switch to dark theme for better viewing in low light
                  </div>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={handleDarkModeToggle} />
              </div>

              <div className="space-y-3">
                <Label className="text-base text-white">Font Size</Label>
                <div className="px-3">
                  <Slider
                    value={[settings.display.fontSize]}
                    onValueChange={([fontSize]) => {
                      const newSettings = {
                        ...settings,
                        display: { ...settings.display, fontSize },
                      }
                      updateSettings(newSettings)

                      // Apply font size
                      document.documentElement.style.fontSize = `${fontSize}px`
                    }}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure when and how often you want to receive mood check-in reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Notifications</Label>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Receive regular reminders to check in with your mood
                  </div>
                </div>
                <Switch checked={settings.notifications.enabled} onCheckedChange={handleNotificationToggle} />
              </div>

              {settings.notifications.enabled && (
                <>
                  <div className="space-y-3">
                    <Label className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Notification Frequency
                    </Label>
                    <Select
                      value={settings.notifications.frequency.toString()}
                      onValueChange={(value) => {
                        const newSettings = {
                          ...settings,
                          notifications: { ...settings.notifications, frequency: Number.parseInt(value) },
                        }
                        updateSettings(newSettings)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 shadow-lg" position="popper" side="bottom">
                        {frequencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()} className="text-black hover:bg-gray-100">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Quiet Hours
                        </Label>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Disable notifications during specific hours
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.quietHours.enabled}
                        onCheckedChange={(enabled) => {
                          const newSettings = {
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              quietHours: { ...settings.notifications.quietHours, enabled },
                            },
                          }
                          updateSettings(newSettings)
                        }}
                      />
                    </div>

                    {settings.notifications.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div>
                          <Label className="text-sm">Start Time</Label>
                          <Select
                            value={settings.notifications.quietHours.start}
                            onValueChange={(value) => {
                              const newSettings = {
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  quietHours: { ...settings.notifications.quietHours, start: value },
                                },
                              }
                              updateSettings(newSettings)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-300 shadow-lg" position="popper" side="bottom">
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, "0")
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`} className="text-black hover:bg-gray-100">
                                    {hour}:00
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">End Time</Label>
                          <Select
                            value={settings.notifications.quietHours.end}
                            onValueChange={(value) => {
                              const newSettings = {
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  quietHours: { ...settings.notifications.quietHours, end: value },
                                },
                              }
                              updateSettings(newSettings)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-300 shadow-lg" position="popper" side="bottom">
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, "0")
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`} className="text-black hover:bg-gray-100">
                                    {hour}:00
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Sound & Vibration
                      </Label>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Play sound and vibrate when notifications arrive
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.sound}
                      onCheckedChange={(sound) => {
                        const newSettings = {
                          ...settings,
                          notifications: { ...settings.notifications, sound },
                        }
                        updateSettings(newSettings)
                      }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control how your data is used and shared</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Anonymous Analytics</Label>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Help improve the app by sharing anonymous usage data
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(analytics) => {
                    const newSettings = {
                      ...settings,
                      privacy: { ...settings.privacy, analytics },
                    }
                    updateSettings(newSettings)
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Data Sharing</Label>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Share anonymized mood data for research purposes
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(dataSharing) => {
                    const newSettings = {
                      ...settings,
                      privacy: { ...settings.privacy, dataSharing },
                    }
                    updateSettings(newSettings)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Notification */}
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>Send a test notification to make sure everything is working</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  if (settings.notifications.enabled) {
                    showMoodNotification()
                    toast({
                      title: "Test notification sent",
                      description: "Check if you received the mood check-in notification.",
                    })
                  } else {
                    toast({
                      title: "Notifications disabled",
                      description: "Please enable notifications first to test them.",
                      variant: "destructive",
                    })
                  }
                }}
                disabled={!settings.notifications.enabled}
              >
                Send Test Notification
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
