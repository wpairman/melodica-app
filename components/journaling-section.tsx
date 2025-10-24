"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trash2, Edit2, Save, X } from "lucide-react"
import { useSafeToast } from "@/components/toast-provider"

interface JournalEntry {
  id: string
  content: string
  timestamp: Date
  mood?: number
}

export default function JournalingSection() {
  const { toast } = useSafeToast()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")

  useEffect(() => {
    // Load journal entries from localStorage
    if (typeof window !== 'undefined') {
      const storedEntries = localStorage.getItem("journalEntries")
      if (storedEntries) {
        try {
          const parsed = JSON.parse(storedEntries)
          const entriesWithDates = parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }))
          setEntries(entriesWithDates)
        } catch (error) {
          console.error("Error parsing journal entries:", error)
        }
      }
    }
  }, [])

  const saveEntries = (updatedEntries: JournalEntry[]) => {
    setEntries(updatedEntries)
    if (typeof window !== 'undefined') {
      localStorage.setItem("journalEntries", JSON.stringify(updatedEntries))
    }
  }

  const handleAddEntry = () => {
    if (!newEntry.trim()) {
      try {
        toast({
          title: "Empty entry",
          description: "Please write something before saving.",
        })
      } catch (error) {
        console.error('Error showing toast:', error)
      }
      return
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      content: newEntry,
      timestamp: new Date(),
    }

    const updatedEntries = [entry, ...entries]
    saveEntries(updatedEntries)
    setNewEntry("")

    try {
      toast({
        title: "Entry saved!",
        description: "Your journal entry has been saved.",
      })
    } catch (error) {
      console.error('Error showing toast:', error)
    }
  }

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id)
    saveEntries(updatedEntries)

    try {
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been removed.",
      })
    } catch (error) {
      console.error('Error showing toast:', error)
    }
  }

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setEditingContent(entry.content)
  }

  const handleSaveEdit = () => {
    if (!editingContent.trim()) {
      try {
        toast({
          title: "Empty entry",
          description: "Please write something before saving.",
        })
      } catch (error) {
        console.error('Error showing toast:', error)
      }
      return
    }

    const updatedEntries = entries.map(entry =>
      entry.id === editingId
        ? { ...entry, content: editingContent }
        : entry
    )
    saveEntries(updatedEntries)
    setEditingId(null)
    setEditingContent("")

    try {
      toast({
        title: "Entry updated!",
        description: "Your journal entry has been updated.",
      })
    } catch (error) {
      console.error('Error showing toast:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingContent("")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* New Entry Card */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write Your Thoughts
          </CardTitle>
          <CardDescription className="text-gray-300">
            Express your feelings, thoughts, and experiences. This is your safe space.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind today? How are you feeling? What happened that made you smile..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-[150px] bg-gray-800 text-white border-gray-600 placeholder:text-gray-400"
          />
          <Button
            onClick={handleAddEntry}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Save Entry
          </Button>
        </CardContent>
      </Card>

      {/* Journal Entries Log */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Your Journal</CardTitle>
          <CardDescription className="text-gray-300">
            {entries.length === 0 
              ? "No entries yet. Start writing!" 
              : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Your journal entries will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors"
                >
                  {editingId === entry.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[100px] bg-gray-800 text-white border-gray-600"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-gray-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(entry.timestamp)}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{formatTime(entry.timestamp)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStartEdit(entry)}
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-gray-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteEntry(entry.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-white whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
