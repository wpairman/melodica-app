"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Calendar, Heart, Shield, Activity, Droplets, Moon, Sun, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PeriodData {
  lastPeriodStart: string
  cycleLength: number
  periodLength: number
  onBirthControl: boolean
  birthControlType: string
  hasPCOS: boolean
  pcosSymptoms: string[]
  symptoms: Array<{
    date: string
    symptoms: string[]
    flow: string
    mood: string
    notes?: string
  }>
  sexualActivity: Array<{
    date: string
    protection: boolean
    notes?: string
  }>
}

const symptomOptions = [
  "Cramps",
  "Bloating",
  "Headache",
  "Breast tenderness",
  "Acne",
  "Fatigue",
  "Mood swings",
  "Irritability",
  "Food cravings",
  "Back pain",
  "Nausea",
  "Insomnia",
]

const pcosSymptomOptions = [
  "Irregular periods",
  "Heavy bleeding",
  "Excess hair growth",
  "Hair loss",
  "Weight gain",
  "Dark skin patches",
  "Multiple ovarian cysts",
  "High androgen levels",
  "Insulin resistance",
  "Fatigue",
  "Mood changes",
]

const flowOptions = ["Light", "Medium", "Heavy", "Spotting"]
const moodOptions = ["Happy", "Sad", "Irritable", "Anxious", "Calm", "Energetic", "Tired"]

export default function PeriodTracker() {
  const { toast } = useToast()
  const [periodData, setPeriodData] = useState<PeriodData>({
    lastPeriodStart: "",
    cycleLength: 28,
    periodLength: 5,
    onBirthControl: false,
    birthControlType: "",
    hasPCOS: false,
    pcosSymptoms: [],
    symptoms: [],
    sexualActivity: [],
  })

  const [newSymptom, setNewSymptom] = useState({
    date: "",
    symptoms: [] as string[],
    flow: "",
    mood: "",
    notes: "",
  })

  const [newActivity, setNewActivity] = useState({
    date: "",
    protection: true,
    notes: "",
  })

  useEffect(() => {
    // Load period data from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem("periodData")
      if (storedData) {
        try {
          setPeriodData(JSON.parse(storedData))
        } catch (error) {
          console.error("Error parsing period data:", error)
        }
      }
    }
  }, [])

  const savePeriodData = (data: PeriodData) => {
    setPeriodData(data)
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("periodData", JSON.stringify(data))
    }
    toast({
      title: "Period data saved",
      description: "Your cycle information has been updated.",
    })
  }

  const addSymptomEntry = () => {
    if (!newSymptom.date) return

    const updatedData = {
      ...periodData,
      symptoms: [...periodData.symptoms, { ...newSymptom }],
    }

    savePeriodData(updatedData)
    setNewSymptom({ date: "", symptoms: [], flow: "", mood: "", notes: "" })
  }

  const addSexualActivity = () => {
    if (!newActivity.date) return

    const updatedData = {
      ...periodData,
      sexualActivity: [...periodData.sexualActivity, { ...newActivity }],
    }

    savePeriodData(updatedData)
    setNewActivity({ date: "", protection: true, notes: "" })
  }

  const calculatePhases = () => {
    if (!periodData.lastPeriodStart) return null

    const lastPeriod = new Date(periodData.lastPeriodStart)
    const today = new Date()
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24))
    const currentCycleDay = (daysSinceLastPeriod % periodData.cycleLength) + 1

    const phases = {
      menstrual: {
        start: 1,
        end: periodData.periodLength,
        name: "Menstrual",
        icon: Droplets,
        color: "from-red-400 to-pink-500",
      },
      follicular: {
        start: 1,
        end: Math.floor(periodData.cycleLength / 2),
        name: "Follicular",
        icon: Sun,
        color: "from-green-400 to-emerald-500",
      },
      ovulation: {
        start: Math.floor(periodData.cycleLength / 2) - 1,
        end: Math.floor(periodData.cycleLength / 2) + 1,
        name: "Ovulation",
        icon: Sparkles,
        color: "from-purple-400 to-violet-500",
      },
      luteal: {
        start: Math.floor(periodData.cycleLength / 2) + 2,
        end: periodData.cycleLength,
        name: "Luteal",
        icon: Moon,
        color: "from-yellow-400 to-orange-500",
      },
    }

    let currentPhase = "follicular"
    if (currentCycleDay >= phases.menstrual.start && currentCycleDay <= phases.menstrual.end) {
      currentPhase = "menstrual"
    } else if (currentCycleDay >= phases.ovulation.start && currentCycleDay <= phases.ovulation.end) {
      currentPhase = "ovulation"
    } else if (currentCycleDay >= phases.luteal.start && currentCycleDay <= phases.luteal.end) {
      currentPhase = "luteal"
    }

    const nextPeriod = new Date(lastPeriod)
    nextPeriod.setDate(nextPeriod.getDate() + periodData.cycleLength)

    return {
      currentCycleDay,
      currentPhase,
      phases,
      nextPeriod,
      daysUntilNextPeriod: Math.max(0, periodData.cycleLength - daysSinceLastPeriod),
    }
  }

  const phaseInfo = calculatePhases()

  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case "menstrual":
        return {
          description: "Your period is here. Focus on rest, gentle movement, and iron-rich foods.",
          tips: ["Stay hydrated", "Use heat therapy for cramps", "Practice gentle yoga", "Eat iron-rich foods"],
          mood: "You might feel more introspective and need extra self-care.",
        }
      case "follicular":
        return {
          description: "Energy is building! Great time for new projects and social activities.",
          tips: ["Try new workouts", "Start creative projects", "Plan social activities", "Focus on learning"],
          mood: "You'll likely feel more optimistic and energetic.",
        }
      case "ovulation":
        return {
          description: "Peak energy and confidence! Ideal for important meetings and events.",
          tips: ["Schedule important meetings", "Try high-intensity workouts", "Be social", "Take on challenges"],
          mood: "You may feel most confident and attractive.",
        }
      case "luteal":
        return {
          description: "Energy may start to decline. Focus on completing projects and self-care.",
          tips: [
            "Finish ongoing projects",
            "Practice stress management",
            "Prepare for your period",
            "Be gentle with yourself",
          ],
          mood: "You might feel more sensitive and need extra comfort.",
        }
      default:
        return { description: "", tips: [], mood: "" }
    }
  }

  const CycleVisualization = () => {
    if (!phaseInfo) return null

    const { currentCycleDay, currentPhase, phases } = phaseInfo
    const progress = (currentCycleDay / periodData.cycleLength) * 100
    const currentPhaseData = phases[currentPhase as keyof typeof phases]
    const Icon = currentPhaseData.icon

    return (
      <div className="relative w-64 h-64 mx-auto mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

        {/* Progress ring */}
        <div
          className={`absolute inset-0 rounded-full border-8 bg-gradient-to-r ${currentPhaseData.color} opacity-20`}
          style={{
            background: `conic-gradient(from 0deg, transparent ${progress}%, rgba(0,0,0,0.1) ${progress}%)`,
          }}
        ></div>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-8 w-8 mb-2 text-gray-600" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">Day {currentCycleDay}</div>
            <div className="text-sm text-gray-600">{currentPhaseData.name}</div>
            <div className="text-xs text-gray-500 mt-1">{phaseInfo.daysUntilNextPeriod} days until period</div>
          </div>
        </div>

        {/* Phase markers */}
        {Object.entries(phases).map(([key, phase], index) => {
          const angle = (phase.start / periodData.cycleLength) * 360 - 90
          const x = 50 + 45 * Math.cos((angle * Math.PI) / 180)
          const y = 50 + 45 * Math.sin((angle * Math.PI) / 180)

          return (
            <div
              key={key}
              className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                key === currentPhase ? "bg-purple-500" : "bg-gray-300"
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-pink-500" />
            Your Cycle Journey
          </CardTitle>
          <CardDescription className="text-purple-700">
            Track your menstrual cycle to understand your body's natural rhythm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CycleVisualization />

          {phaseInfo && (
            <Card
              className={`bg-gradient-to-r ${phaseInfo.phases[phaseInfo.currentPhase as keyof typeof phaseInfo.phases].color} text-white`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white">
                  {phaseInfo.phases[phaseInfo.currentPhase as keyof typeof phaseInfo.phases].name} Phase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/90">{getPhaseDescription(phaseInfo.currentPhase).description}</p>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-white mb-2">Mood Insights:</p>
                  <p className="text-sm text-white/90">{getPhaseDescription(phaseInfo.currentPhase).mood}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="cycle" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-purple-100">
          <TabsTrigger value="cycle" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            Cycle
          </TabsTrigger>
          <TabsTrigger value="symptoms" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            Symptoms
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            Intimacy
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cycle" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Calendar className="h-5 w-5" />
                Cycle Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lastPeriod" className="text-blue-700">
                  Last Period Start Date
                </Label>
                <Input
                  id="lastPeriod"
                  type="date"
                  value={periodData.lastPeriodStart}
                  onChange={(e) => {
                    const updatedData = { ...periodData, lastPeriodStart: e.target.value }
                    savePeriodData(updatedData)
                  }}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycleLength" className="text-blue-700">
                  Cycle Length (days)
                </Label>
                <Input
                  id="cycleLength"
                  type="number"
                  min="21"
                  max="35"
                  value={periodData.cycleLength}
                  onChange={(e) => {
                    const updatedData = { ...periodData, cycleLength: Number.parseInt(e.target.value) }
                    savePeriodData(updatedData)
                  }}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodLength" className="text-blue-700">
                  Period Length (days)
                </Label>
                <Input
                  id="periodLength"
                  type="number"
                  min="3"
                  max="8"
                  value={periodData.periodLength}
                  onChange={(e) => {
                    const updatedData = { ...periodData, periodLength: Number.parseInt(e.target.value) }
                    savePeriodData(updatedData)
                  }}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="birthControl" className="text-blue-700">
                    On Birth Control
                  </Label>
                  <Switch
                    id="birthControl"
                    checked={periodData.onBirthControl}
                    onCheckedChange={(checked) => {
                      const updatedData = { ...periodData, onBirthControl: checked }
                      savePeriodData(updatedData)
                    }}
                  />
                </div>

                {periodData.onBirthControl && (
                  <div className="space-y-2">
                    <Label htmlFor="birthControlType" className="text-blue-700">
                      Type of Birth Control
                    </Label>
                    <select
                      id="birthControlType"
                      value={periodData.birthControlType}
                      onChange={(e) => {
                        const updatedData = { ...periodData, birthControlType: e.target.value }
                        savePeriodData(updatedData)
                      }}
                      className="flex h-10 w-full rounded-md border border-blue-200 bg-background px-3 py-2 text-sm focus:border-blue-400"
                    >
                      <option value="">Select type</option>
                      <option value="pill">Birth Control Pill</option>
                      <option value="iud">IUD</option>
                      <option value="implant">Implant</option>
                      <option value="patch">Patch</option>
                      <option value="ring">Ring</option>
                      <option value="shot">Shot/Injection</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-800">
                <Activity className="h-5 w-5" />
                Daily Symptom Tracking
              </CardTitle>
              <CardDescription className="text-rose-600">
                Track your symptoms, flow, and mood to identify patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="symptomDate" className="text-rose-700">
                    Date
                  </Label>
                  <Input
                    id="symptomDate"
                    type="date"
                    value={newSymptom.date}
                    onChange={(e) => setNewSymptom({ ...newSymptom, date: e.target.value })}
                    className="border-rose-200 focus:border-rose-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-rose-700">Flow Level</Label>
                  <select
                    value={newSymptom.flow}
                    onChange={(e) => setNewSymptom({ ...newSymptom, flow: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-rose-200 bg-background px-3 py-2 text-sm focus:border-rose-400"
                  >
                    <option value="">Select flow</option>
                    {flowOptions.map((flow) => (
                      <option key={flow} value={flow}>
                        {flow}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-rose-700">Symptoms</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {symptomOptions.map((symptom) => (
                    <label key={symptom} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSymptom.symptoms.includes(symptom)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewSymptom({ ...newSymptom, symptoms: [...newSymptom.symptoms, symptom] })
                          } else {
                            setNewSymptom({ ...newSymptom, symptoms: newSymptom.symptoms.filter((s) => s !== symptom) })
                          }
                        }}
                        className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-sm text-rose-700">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-rose-700">Mood</Label>
                <select
                  value={newSymptom.mood}
                  onChange={(e) => setNewSymptom({ ...newSymptom, mood: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-rose-200 bg-background px-3 py-2 text-sm focus:border-rose-400"
                >
                  <option value="">Select mood</option>
                  {moodOptions.map((mood) => (
                    <option key={mood} value={mood}>
                      {mood}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptomNotes" className="text-rose-700">
                  Notes (optional)
                </Label>
                <Input
                  id="symptomNotes"
                  placeholder="Any additional notes..."
                  value={newSymptom.notes}
                  onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
                  className="border-rose-200 focus:border-rose-400"
                />
              </div>

              <Button
                onClick={addSymptomEntry}
                disabled={!newSymptom.date}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white"
              >
                Add Symptom Entry
              </Button>

              <div className="space-y-2">
                <h4 className="font-medium text-rose-800">Recent Entries</h4>
                {periodData.symptoms.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {periodData.symptoms
                      .slice(-5)
                      .reverse()
                      .map((entry, index) => (
                        <div key={index} className="p-3 border border-rose-200 rounded-lg bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-rose-800">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                              {entry.flow && (
                                <Badge variant="outline" className="border-rose-300 text-rose-700">
                                  {entry.flow} flow
                                </Badge>
                              )}
                              {entry.mood && (
                                <Badge variant="outline" className="border-purple-300 text-purple-700">
                                  {entry.mood}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {entry.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {entry.symptoms.map((symptom) => (
                                <Badge key={symptom} className="bg-rose-100 text-rose-700 text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {entry.notes && <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-rose-500">No symptoms logged yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Shield className="h-5 w-5" />
                Intimacy & Sexual Health
              </CardTitle>
              <CardDescription className="text-purple-600">
                Track intimate moments and protection use for better health awareness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="activityDate" className="text-purple-700">
                    Date
                  </Label>
                  <Input
                    id="activityDate"
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-purple-700">Protection Used</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newActivity.protection}
                      onCheckedChange={(checked) => setNewActivity({ ...newActivity, protection: checked })}
                    />
                    <span className="text-sm text-purple-700">{newActivity.protection ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityNotes" className="text-purple-700">
                    Notes (optional)
                  </Label>
                  <Input
                    id="activityNotes"
                    placeholder="Any notes..."
                    value={newActivity.notes}
                    onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>

              <Button
                onClick={addSexualActivity}
                disabled={!newActivity.date}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Add Entry
              </Button>

              <div className="space-y-2">
                <h4 className="font-medium text-purple-800">Recent Activity</h4>
                {periodData.sexualActivity.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {periodData.sexualActivity
                      .slice(-5)
                      .reverse()
                      .map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-purple-200 rounded-lg bg-white"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-purple-700">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={activity.protection ? "default" : "destructive"} className="text-xs">
                              {activity.protection ? "Protected" : "Unprotected"}
                            </Badge>
                            {activity.notes && <span className="text-xs text-gray-500">{activity.notes}</span>}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-purple-500">No activity logged yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {phaseInfo &&
              Object.entries(phaseInfo.phases).map(([key, phase]) => {
                const Icon = phase.icon
                const phaseData = getPhaseDescription(key)

                return (
                  <Card key={key} className={`bg-gradient-to-br ${phase.color} text-white`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Icon className="h-5 w-5" />
                        {phase.name} Phase
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-white/90 text-sm">{phaseData.description}</p>

                      <div className="bg-white/20 rounded-lg p-3">
                        <p className="text-sm font-medium text-white mb-2">Tips for this phase:</p>
                        <ul className="text-sm text-white/90 space-y-1">
                          {phaseData.tips.map((tip, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white/20 rounded-lg p-3">
                        <p className="text-sm font-medium text-white mb-1">Mood insights:</p>
                        <p className="text-sm text-white/90">{phaseData.mood}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>

          {periodData.onBirthControl && (
            <Card className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white">Birth Control Effects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/90">
                  Birth control can significantly affect your cycle and mood patterns. Here's what to expect:
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="font-medium text-white mb-2">Positive Effects:</p>
                    <ul className="text-sm text-white/90 space-y-1">
                      <li>• More predictable cycles</li>
                      <li>• Reduced PMS symptoms</li>
                      <li>• Lighter periods</li>
                      <li>• Less severe cramps</li>
                    </ul>
                  </div>

                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="font-medium text-white mb-2">Possible Side Effects:</p>
                    <ul className="text-sm text-white/90 space-y-1">
                      <li>• Mood changes</li>
                      <li>• Breast tenderness</li>
                      <li>• Spotting between periods</li>
                      <li>• Changes in libido</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/20 rounded-lg p-3">
                  <p className="font-medium text-white mb-2">💡 Pro Tip:</p>
                  <p className="text-sm text-white/90">
                    Track your mood patterns for the first 3 months to understand how your specific birth control
                    affects you. Every person responds differently!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
