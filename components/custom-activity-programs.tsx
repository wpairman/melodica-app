"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Activity, Plus, Trash2, CheckCircle2, Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserPlan, hasFeatureAccess } from "@/lib/plan-features"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ActivityProgram {
  id: string
  name: string
  description: string
  activities: Array<{
    id: string
    name: string
    duration: string
    description: string
    completed: boolean
  }>
  duration: number // days
  startDate?: Date
  completed: boolean
}

export default function CustomActivityPrograms() {
  const { toast } = useToast()
  const [programs, setPrograms] = useState<ActivityProgram[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [userPlan, setUserPlan] = useState<string>("free")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    duration: 7,
    activities: [] as Array<{ name: string; duration: string; description: string }>
  })
  const [newActivity, setNewActivity] = useState({
    name: "",
    duration: "",
    description: ""
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = getUserPlan()
      setUserPlan(plan)
      
      // Load saved programs
      const saved = localStorage.getItem("customActivityPrograms")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPrograms(parsed.map((p: any) => ({
            ...p,
            startDate: p.startDate ? new Date(p.startDate) : undefined
          })))
        } catch (e) {
          console.error("Error parsing saved programs:", e)
        }
      }
    }
  }, [])

  const savePrograms = (updatedPrograms: ActivityProgram[]) => {
    setPrograms(updatedPrograms)
    localStorage.setItem("customActivityPrograms", JSON.stringify(updatedPrograms))
  }

  const handleCreateProgram = () => {
    if (!hasFeatureAccess(userPlan as any, "customActivityPrograms")) {
      setShowUpgrade(true)
      return
    }

    if (!newProgram.name.trim() || newProgram.activities.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a program name and at least one activity.",
        variant: "destructive",
      })
      return
    }

    const program: ActivityProgram = {
      id: Date.now().toString(),
      name: newProgram.name,
      description: newProgram.description,
      activities: newProgram.activities.map((a, idx) => ({
        id: idx.toString(),
        name: a.name,
        duration: a.duration,
        description: a.description,
        completed: false
      })),
      duration: newProgram.duration,
      completed: false
    }

    savePrograms([...programs, program])
    
    // Reset form
    setNewProgram({
      name: "",
      description: "",
      duration: 7,
      activities: []
    })
    setIsCreating(false)
    
    toast({
      title: "Program Created!",
      description: `"${program.name}" has been created with ${program.activities.length} activities.`,
    })
  }

  const handleAddActivity = () => {
    if (!newActivity.name.trim()) {
      toast({
        title: "Missing Activity Name",
        description: "Please provide an activity name.",
        variant: "destructive",
      })
      return
    }

    setNewProgram({
      ...newProgram,
      activities: [...newProgram.activities, { ...newActivity }]
    })
    
    setNewActivity({
      name: "",
      duration: "",
      description: ""
    })
  }

  const handleStartProgram = (programId: string) => {
    const updated = programs.map(p => 
      p.id === programId 
        ? { ...p, startDate: new Date(), completed: false }
        : p
    )
    savePrograms(updated)
    
    toast({
      title: "Program Started!",
      description: "Track your progress and complete activities daily.",
    })
  }

  const handleCompleteActivity = (programId: string, activityId: string) => {
    const updated = programs.map(p => {
      if (p.id === programId) {
        const updatedActivities = p.activities.map(a =>
          a.id === activityId ? { ...a, completed: !a.completed } : a
        )
        const allCompleted = updatedActivities.every(a => a.completed)
        return {
          ...p,
          activities: updatedActivities,
          completed: allCompleted
        }
      }
      return p
    })
    savePrograms(updated)
    
    const program = updated.find(p => p.id === programId)
    if (program?.completed) {
      toast({
        title: "Program Completed!",
        description: `Congratulations! You've completed "${program.name}".`,
      })
    }
  }

  const handleDeleteProgram = (programId: string) => {
    const updated = programs.filter(p => p.id !== programId)
    savePrograms(updated)
    
    toast({
      title: "Program Deleted",
      description: "The program has been removed.",
    })
  }

  if (!hasFeatureAccess(userPlan as any, "customActivityPrograms")) {
    return (
      <>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Custom Activity Programs
            </CardTitle>
            <CardDescription className="text-gray-300">
              Create personalized activity programs tailored to your wellness goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300 mb-4">
                  With custom activity programs, you can:
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Create multi-day wellness programs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Track progress and completion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Build routines that fit your lifestyle
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Set goals and achieve milestones
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => setShowUpgrade(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upgrade to Ultimate for Custom Programs
              </Button>
            </div>
          </CardContent>
        </Card>
        {showUpgrade && (
          <UpgradePrompt
            feature="Custom Activity Programs"
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Custom Activity Programs
            </CardTitle>
            <CardDescription className="text-gray-300">
              Create and manage personalized wellness programs
            </CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Activity Program</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Build a personalized program with activities tailored to your goals
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="programName" className="text-white">Program Name</Label>
                  <Input
                    id="programName"
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                    placeholder="e.g., 7-Day Stress Relief Program"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="programDescription" className="text-white">Description</Label>
                  <Textarea
                    id="programDescription"
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                    placeholder="Describe your program goals..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="programDuration" className="text-white">Duration (days)</Label>
                  <Input
                    id="programDuration"
                    type="number"
                    min="1"
                    value={newProgram.duration}
                    onChange={(e) => setNewProgram({ ...newProgram, duration: parseInt(e.target.value) || 7 })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <Label className="text-white mb-2 block">Activities</Label>
                  <div className="space-y-2 mb-4">
                    {newProgram.activities.map((activity, idx) => (
                      <Card key={idx} className="bg-gray-700 border-gray-600 p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.name}</p>
                            {activity.duration && (
                              <p className="text-sm text-gray-400">{activity.duration}</p>
                            )}
                            {activity.description && (
                              <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNewProgram({
                                ...newProgram,
                                activities: newProgram.activities.filter((_, i) => i !== idx)
                              })
                            }}
                            className="text-red-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Activity name"
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Input
                      placeholder="Duration (e.g., 15 mins)"
                      value={newActivity.duration}
                      onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Textarea
                      placeholder="Activity description (optional)"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      onClick={handleAddActivity}
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateProgram}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Program
                  </Button>
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {programs.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-blue-500 mb-4" />
            <p className="text-gray-300 mb-4">
              Create your first custom activity program to start your wellness journey
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => {
              const progress = program.activities.filter(a => a.completed).length
              const total = program.activities.length
              const progressPercent = total > 0 ? (progress / total) * 100 : 0
              
              return (
                <Card key={program.id} className="bg-gray-700/50 border-gray-600">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white">{program.name}</CardTitle>
                        <CardDescription className="text-gray-300">{program.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className="bg-blue-600 text-white">
                            <Clock className="h-3 w-3 mr-1" />
                            {program.duration} days
                          </Badge>
                          {program.startDate && (
                            <Badge className="bg-green-600 text-white">
                              <Calendar className="h-3 w-3 mr-1" />
                              Started {new Date(program.startDate).toLocaleDateString()}
                            </Badge>
                          )}
                          {program.completed && (
                            <Badge className="bg-purple-600 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProgram(program.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Progress</span>
                        <span className="text-sm text-gray-300">{progress} / {total} activities</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {program.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                        >
                          <button
                            onClick={() => handleCompleteActivity(program.id, activity.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              activity.completed
                                ? "bg-green-600 border-green-600"
                                : "border-gray-500"
                            }`}
                          >
                            {activity.completed && (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className={`text-sm ${activity.completed ? "text-gray-500 line-through" : "text-white"}`}>
                              {activity.name}
                            </p>
                            {activity.duration && (
                              <p className="text-xs text-gray-400">{activity.duration}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!program.startDate && (
                      <Button
                        onClick={() => handleStartProgram(program.id)}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Start Program
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


