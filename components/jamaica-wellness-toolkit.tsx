"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Play, ChevronRight } from "lucide-react"

// Coping skills with explanations
const copingSkills = [
  {
    title: "Check Yuh Self",
    description: "Take a moment to pause and reflect on how you're feeling. Ask yourself: 'Wha really a guh on wid mi?' This self-awareness helps you understand your emotions before reacting."
  },
  {
    title: "Use Weh Yuh Have and Tun It Up",
    description: "Work with what you have available right now. Whether it's music, movement, or talking to someone, use your resources to improve your mood. Turn up the positive energy!"
  },
  {
    title: "Hol A Medz",
    description: "Take your medication as prescribed and stay consistent with your treatment plan. Your mental health medication is important for your wellbeing - don't skip doses."
  },
  {
    title: "Move Wid Di Vibez",
    description: "Get your body moving! Dance, walk, exercise - any physical activity helps release endorphins and improve your mood. Move with the positive vibes and let your body release stress."
  },
  {
    title: "Duh Suppm",
    description: "Do something - anything positive! Even small actions like cleaning, cooking, or calling a friend can help shift your mood. Action creates momentum and breaks negative thought patterns."
  },
  {
    title: "Switch It Up",
    description: "Change your environment or routine. If you're stuck in a negative pattern, try something different - go outside, listen to different music, or try a new activity. Sometimes a change of scenery helps reset your mind."
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
                    <span className="font-medium text-left">{skill.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-200 pt-2 pb-4">
                    <p className="text-sm leading-relaxed">{skill.description}</p>
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

