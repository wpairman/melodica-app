"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, FileText, Mail, Calendar, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserPlan, hasFeatureAccess } from "@/lib/plan-features"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { useIsNative } from "@/hooks/use-is-native"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ExportOptions {
  format: "csv" | "json" | "pdf"
  dateRange: "all" | "week" | "month" | "year" | "custom"
  includeAnalytics: boolean
  includeActivities: boolean
  includeNotes: boolean
}

export default function MoodDataExport() {
  const { toast } = useToast()
  const { isNative } = useIsNative()
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: number; timestamp: Date; notes?: string; activities?: string[] }>>([])
  const [userPlan, setUserPlan] = useState<string>("free")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    dateRange: "all",
    includeAnalytics: true,
    includeActivities: true,
    includeNotes: true
  })
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = getUserPlan()
      setUserPlan(plan)
      
      // Load mood history
      const stored = localStorage.getItem("moodHistory")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setMoodHistory(parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })))
        } catch (e) {
          console.error("Error parsing mood history:", e)
        }
      }
    }
  }, [])

  const filterByDateRange = (entries: typeof moodHistory) => {
    const now = new Date()
    let startDate: Date

    switch (exportOptions.dateRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        return entries
    }

    return entries.filter(entry => entry.timestamp >= startDate)
  }

  const generateAnalytics = (entries: typeof moodHistory) => {
    if (entries.length === 0) return null

    const moods = entries.map(e => e.mood)
    const avgMood = moods.reduce((sum, m) => sum + m, 0) / moods.length
    const minMood = Math.min(...moods)
    const maxMood = Math.max(...moods)
    
    // Calculate mood distribution
    const distribution = {
      low: moods.filter(m => m <= 3).length,
      neutral: moods.filter(m => m > 3 && m <= 6).length,
      high: moods.filter(m => m > 6).length
    }

    // Calculate trend
    const firstHalf = moods.slice(0, Math.floor(moods.length / 2))
    const secondHalf = moods.slice(Math.floor(moods.length / 2))
    const firstAvg = firstHalf.reduce((sum, m) => sum + m, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, m) => sum + m, 0) / secondHalf.length
    const trend = secondAvg > firstAvg ? "improving" : secondAvg < firstAvg ? "declining" : "stable"

    return {
      totalEntries: entries.length,
      averageMood: avgMood.toFixed(2),
      minMood,
      maxMood,
      distribution,
      trend,
      dateRange: {
        start: entries[0]?.timestamp.toLocaleDateString(),
        end: entries[entries.length - 1]?.timestamp.toLocaleDateString()
      }
    }
  }

  const exportToCSV = (data: typeof moodHistory, analytics: any) => {
    let csv = "Date,Time,Mood"
    
    if (exportOptions.includeNotes) {
      csv += ",Notes"
    }
    if (exportOptions.includeActivities) {
      csv += ",Activities"
    }
    csv += "\n"

    data.forEach(entry => {
      const date = new Date(entry.timestamp)
      const dateStr = date.toLocaleDateString()
      const timeStr = date.toLocaleTimeString()
      const notes = entry.notes ? entry.notes.replace(/"/g, '""') : ""
      const activities = entry.activities ? entry.activities.join("; ") : ""
      
      csv += `"${dateStr}","${timeStr}",${entry.mood}`
      if (exportOptions.includeNotes) {
        csv += `,"${notes}"`
      }
      if (exportOptions.includeActivities) {
        csv += `,"${activities}"`
      }
      csv += "\n"
    })

    if (exportOptions.includeAnalytics && analytics) {
      csv += "\n=== ANALYTICS ===\n"
      csv += `Total Entries,${analytics.totalEntries}\n`
      csv += `Average Mood,${analytics.averageMood}\n`
      csv += `Min Mood,${analytics.minMood}\n`
      csv += `Max Mood,${analytics.maxMood}\n`
      csv += `Trend,${analytics.trend}\n`
      csv += `Low Mood Entries,${analytics.distribution.low}\n`
      csv += `Neutral Mood Entries,${analytics.distribution.neutral}\n`
      csv += `High Mood Entries,${analytics.distribution.high}\n`
    }

    return csv
  }

  const exportToJSON = (data: typeof moodHistory, analytics: any) => {
    const exportData: any = {
      exportDate: new Date().toISOString(),
      moodHistory: data.map(entry => ({
        date: entry.timestamp.toISOString(),
        mood: entry.mood,
        ...(exportOptions.includeNotes && { notes: entry.notes }),
        ...(exportOptions.includeActivities && { activities: entry.activities })
      }))
    }

    if (exportOptions.includeAnalytics && analytics) {
      exportData.analytics = analytics
    }

    return JSON.stringify(exportData, null, 2)
  }

  const handleExport = async () => {
    if (!isNative && !hasFeatureAccess(userPlan as any, "exportMoodData")) {
      setShowUpgrade(true)
      return
    }

    if (moodHistory.length === 0) {
      toast({
        title: "No Data to Export",
        description: "You don't have any mood entries yet.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      // Filter data by date range
      const filteredData = filterByDateRange(moodHistory)
      
      if (filteredData.length === 0) {
        toast({
          title: "No Data in Range",
          description: "No mood entries found for the selected date range.",
          variant: "destructive",
        })
        setIsExporting(false)
        return
      }

      // Generate analytics if requested
      const analytics = exportOptions.includeAnalytics ? generateAnalytics(filteredData) : null

      // Export based on format
      let content: string
      let filename: string
      let mimeType: string

      if (exportOptions.format === "csv") {
        content = exportToCSV(filteredData, analytics)
        filename = `mood-data-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = "text/csv;charset=utf-8;"
      } else if (exportOptions.format === "json") {
        content = exportToJSON(filteredData, analytics)
        filename = `mood-data-${new Date().toISOString().split('T')[0]}.json`
        mimeType = "application/json"
      } else {
        // PDF export would require a library like jsPDF
        toast({
          title: "PDF Export Coming Soon",
          description: "PDF export will be available in a future update.",
        })
        setIsExporting(false)
        return
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful!",
        description: `Your mood data has been exported as ${exportOptions.format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (!isNative && !hasFeatureAccess(userPlan as any, "exportMoodData")) {
      setShowUpgrade(true)
      return
    }

    const filteredData = filterByDateRange(moodHistory)
    const analytics = generateAnalytics(filteredData)

    if (!analytics) {
      toast({
        title: "No Data to Share",
        description: "You don't have enough data to share.",
        variant: "destructive",
      })
      return
    }

    const shareText = `My Mood Journey Summary:\n\n` +
      `📊 Total Entries: ${analytics.totalEntries}\n` +
      `📈 Average Mood: ${analytics.averageMood}/10\n` +
      `📉 Trend: ${analytics.trend}\n` +
      `😊 High Mood Days: ${analytics.distribution.high}\n` +
      `😐 Neutral Days: ${analytics.distribution.neutral}\n` +
      `😔 Low Mood Days: ${analytics.distribution.low}\n\n` +
      `Tracked from ${analytics.dateRange.start} to ${analytics.dateRange.end}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Mood Journey",
          text: shareText,
        })
        toast({
          title: "Shared Successfully!",
          description: "Your mood summary has been shared.",
        })
      } catch (error) {
        // User cancelled or error occurred
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText)
      toast({
        title: "Copied to Clipboard",
        description: "Your mood summary has been copied.",
      })
    }
  }

  if (!isNative && !hasFeatureAccess(userPlan as any, "exportMoodData")) {
    return (
      <>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-teal-500" />
              Export & Share Mood Data
            </CardTitle>
            <CardDescription className="text-gray-300">
              Export and share your mood tracking data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300 mb-4">
                  With data export, you can:
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-teal-500" />
                    Export mood data in CSV, JSON, or PDF formats
                  </li>
                  <li className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-teal-500" />
                    Share mood summaries with friends or healthcare providers
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-teal-500" />
                    Include analytics and insights in exports
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-500" />
                    Filter by date range
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => setShowUpgrade(true)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                Upgrade to Ultimate for Data Export
              </Button>
            </div>
          </CardContent>
        </Card>
        {showUpgrade && (
          <UpgradePrompt
            feature="Export & Share Mood Data"
            requiredPlan="ultimate"
            currentPlan={userPlan as any}
            onClose={() => setShowUpgrade(false)}
          />
        )}
      </>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="h-5 w-5 text-teal-500" />
          Export & Share Mood Data
        </CardTitle>
        <CardDescription className="text-gray-300">
          Export your mood tracking data in various formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Options */}
        <div className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">Export Format</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: "csv" | "json" | "pdf") => 
                setExportOptions({ ...exportOptions, format: value })
              }
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="csv" className="text-white">CSV (Excel compatible)</SelectItem>
                <SelectItem value="json" className="text-white">JSON (Structured data)</SelectItem>
                <SelectItem value="pdf" className="text-white">PDF (Coming soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-2 block">Date Range</Label>
            <Select
              value={exportOptions.dateRange}
              onValueChange={(value: any) => 
                setExportOptions({ ...exportOptions, dateRange: value })
              }
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">All Time</SelectItem>
                <SelectItem value="week" className="text-white">Last 7 Days</SelectItem>
                <SelectItem value="month" className="text-white">Last 30 Days</SelectItem>
                <SelectItem value="year" className="text-white">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Include in Export</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAnalytics}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeAnalytics: e.target.checked })}
                  className="rounded"
                />
                <BarChart3 className="h-4 w-4" />
                Analytics & Insights
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={exportOptions.includeActivities}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeActivities: e.target.checked })}
                  className="rounded"
                />
                <Calendar className="h-4 w-4" />
                Activities
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={exportOptions.includeNotes}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeNotes: e.target.checked })}
                  className="rounded"
                />
                <FileText className="h-4 w-4" />
                Notes
              </label>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting || moodHistory.length === 0}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            disabled={moodHistory.length === 0}
            variant="outline"
            className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Summary
          </Button>
        </div>

        {/* Data Summary */}
        {moodHistory.length > 0 && (
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Total Entries</span>
              <Badge className="bg-teal-600 text-white">{moodHistory.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Date Range</span>
              <span className="text-sm text-white">
                {moodHistory[0]?.timestamp.toLocaleDateString()} - {moodHistory[moodHistory.length - 1]?.timestamp.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



