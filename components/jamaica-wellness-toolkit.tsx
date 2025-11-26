"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Play, ChevronRight } from "lucide-react"

// Coping skills with detailed explanations
const copingSkills = [
  {
    title: "CHECK YUHSelf",
    subtitle: "Touch Base",
    goal: "Notice what's happening inside.",
    steps: [
      "What yuh feeling right now?",
      "Body check: tight? tired? jumpy? heavy?",
      "Rate stress 0–10."
    ],
    phrase: "Name it so we can tame it."
  },
  {
    title: "HOL' A MEDZ",
    subtitle: "Ground & Settle",
    goal: "Bring down the overwhelm.",
    steps: [
      "Choose ONE:",
      "• Breathe 3 in / 5 out (5 rounds)",
      "• 5–4–3–2–1 senses",
      "• Feel feet + seat",
      "Re-rate stress 0–10."
    ],
    phrase: "Nuh force it—just notice."
  },
  {
    title: "USE WEH YUH HAVE",
    subtitle: "Resourcing",
    goal: "Find strength/support you ALREADY have.",
    steps: [
      "Identify 3 resources:",
      "• a person",
      "• a skill/strength",
      "• a place/practice"
    ],
    phrase: "What help yuh get through hard times before?"
  },
  {
    title: "MOVE WID DI VIBEZ",
    subtitle: "Release Tension",
    goal: "Shift stuck energy in the body.",
    steps: [
      "• Shake hands/arms",
      "• Stretch neck/shoulders",
      "• Gentle rocking",
      "• Slow walk + breath"
    ],
    phrase: "Give the body a chance fi drop di pressure."
  },
  {
    title: "DUH SUPPM!",
    subtitle: "Immediate Coping Action",
    goal: "Choose ONE small, doable action for today.",
    steps: [
      "Examples:",
      "• call someone",
      "• eat/drink",
      "• rest",
      "• tidy one small area",
      "• write a 5-min plan"
    ],
    phrase: "One step at a time."
  },
  {
    title: "SWITCH IT UP!",
    subtitle: "Shift the Mind",
    goal: "Don't get stuck in one painful loop.",
    steps: [
      "Build a personal switch list:",
      "• music",
      "• prayer",
      "• walk",
      "• comedy",
      "• games",
      "• grounding"
    ],
    phrase: "Yuh nuh haffi fight di feeling—just move through it."
  }
]

// Feelings with mood mapping and descriptions
const feelings = [
  { name: "Happy", patois: "Mi glad bag buss!", mood: 5, color: "text-yellow-300" },
  { name: "Excited", patois: "Mi can't wait", mood: 5, color: "text-yellow-300" },
  { name: "Proud", patois: "Mi feel good inna miself", mood: 5, color: "text-yellow-300" },
  { name: "Calm", patois: "Mi cool an easy", mood: 4, color: "text-green-300" },
  { name: "Sad", patois: "Mi spirit low", mood: 2, color: "text-blue-300" },
  { name: "Lonely", patois: "Mi lonely", mood: 2, color: "text-blue-300" },
  { name: "Hurt", patois: "Mi heart heavy", mood: 2, color: "text-blue-300" },
  { name: "Disappointed", patois: "Mi feet let dung", mood: 2, color: "text-blue-300" },
  { name: "Angry", patois: "Mi vex", mood: 1, color: "text-red-300" },
  { name: "Frustrated", patois: "Mi cyah tek it nuh more", mood: 1, color: "text-red-300" },
  { name: "Jealous", patois: "Mi wish a me", mood: 2, color: "text-blue-300" },
  { name: "Embarrased", patois: "Mi Shame Bad", mood: 2, color: "text-blue-300" },
  { name: "Brave", patois: "Mi bold like lion", mood: 4, color: "text-green-300" },
  { name: "Loving", patois: "Mi full up a love", mood: 5, color: "text-yellow-300" },
  { name: "Helpful", patois: "Mi deh deh fi yuh", mood: 4, color: "text-green-300" },
  { name: "Worried", patois: "It a guh alright", mood: 3, color: "text-orange-300" }
]

interface JamaicaWellnessToolkitProps {
  showTitle?: boolean
  compact?: boolean
}

export default function JamaicaWellnessToolkit({ showTitle = true, compact = false }: JamaicaWellnessToolkitProps) {
  const router = useRouter()

  const handleFeelingClick = (feeling: typeof feelings[0]) => {
    // Save the mood to localStorage and redirect to dashboard mood tracker
    if (typeof window !== 'undefined') {
      const moodEntry = {
        mood: feeling.mood,
        timestamp: new Date(),
        notes: `Feeling: ${feeling.name} - ${feeling.patois}`
      }
      
      // Get existing mood history
      const storedHistory = localStorage.getItem("moodHistory")
      let moodHistory: any[] = []
      if (storedHistory) {
        try {
          moodHistory = JSON.parse(storedHistory)
        } catch (e) {
          console.error("Error parsing mood history:", e)
        }
      }
      
      // Add new entry
      moodHistory.push(moodEntry)
      localStorage.setItem("moodHistory", JSON.stringify(moodHistory))
      
      // Redirect to dashboard with mood tracker in view
      router.push("/dashboard#mood-tracker")
    }
  }

  return (
    <section className={`space-y-6 ${compact ? 'mt-4' : 'mt-8'}`}>
      {showTitle && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Jamaica Wellness Toolkit</h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Tuff it Out & Buil Coping Skills */}
        <Card className="bg-gradient-to-br from-green-900/30 to-yellow-900/30 border-green-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Tuff it Out & Buil Coping Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {copingSkills.map((skill, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-gray-600/30">
                  <AccordionTrigger className="text-white hover:text-yellow-200 py-3">
                    <div className="text-left">
                      <span className="font-medium">{skill.title}</span>
                      {skill.subtitle && (
                        <span className="text-sm text-gray-300 ml-2">— {skill.subtitle}</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-200 pt-2 pb-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-yellow-300 mb-2">Goal: {skill.goal}</p>
                      </div>
                      <div>
                        <ul className="text-sm leading-relaxed space-y-1">
                          {skill.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className={step.startsWith("•") ? "ml-4" : ""}>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-gray-600/30">
                        <p className="text-sm italic text-yellow-200 font-medium">"{skill.phrase}"</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Right Column: Feelins Chart */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Feelins Chart</CardTitle>
            <p className="text-sm text-gray-300 mt-2">Click on a feeling to log it in your mood tracker</p>
          </CardHeader>
          <CardContent>
            <div className={`space-y-2 ${compact ? 'max-h-[400px]' : 'max-h-[600px]'} overflow-y-auto pr-2`}>
              {feelings.map((feeling, index) => (
                <button
                  key={index}
                  onClick={() => handleFeelingClick(feeling)}
                  className="w-full text-left p-3 rounded-lg hover:bg-blue-800/30 transition-colors group border border-transparent hover:border-blue-600/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${feeling.color} group-hover:text-white transition-colors`}>
                        {feeling.name}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">{feeling.patois}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-blue-700/50">
              <Link href="/dashboard/journaling">
                <Button variant="outline" className="w-full border-blue-600 text-white hover:bg-blue-800/50">
                  Write about your feelings in Journal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* YouTube Playlist Link - Enhanced with play icon */}
      <div className="flex justify-center mt-6">
        <Card className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-700 hover:border-red-600 transition-colors w-full max-w-2xl">
          <CardContent className="pt-6 pb-6">
            <a 
              href="https://www.youtube.com/watch?v=hswg8Dd7fxY&list=PL6jOKq9i9ilTLLQHftJ3U-0lxSopJqlG1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 text-white hover:text-yellow-400 transition-colors font-medium text-lg group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600/30 group-hover:bg-red-600/50 transition-colors">
                <Play className="h-6 w-6 ml-1" fill="currentColor" />
              </div>
              <span>Watch Tuff It Out & Buil' YouTube Playlist</span>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

