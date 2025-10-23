"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface SimpleMusicQuizProps {
  initialAnswers: Record<string, string>
  onChange: (answers: Record<string, string>) => void
}

export default function SimpleMusicQuiz({ initialAnswers, onChange }: SimpleMusicQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers || {})

  const questions = [
    {
      id: "repeat_song",
      question: "What is the last song or album you played on repeat?",
      placeholder: "Share the song or album that you couldn't stop listening to recently...",
    },
    {
      id: "must_see_artist",
      question: "Which band or artist would you drop everything to see?",
      placeholder: "Tell us about an artist you'd do anything to see perform live...",
    },
    {
      id: "down_music",
      question: "What kind of music do you listen to when you feel down or depressed?",
      placeholder: "Describe the music that helps you through difficult times...",
    },
    {
      id: "childhood_music",
      question: "What is a genre or artist you loved as a kid but don't listen to anymore?",
      placeholder: "Share your musical nostalgia from childhood...",
    },
    {
      id: "three_genres",
      question: "If you could only listen to 3 genres for the rest of your life, what would they be?",
      placeholder: "List your top 3 music genres you couldn't live without...",
    },
  ]

  useEffect(() => {
    onChange(answers)
  }, [answers, onChange])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    })
  }

  return (
    <div className="space-y-6">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-white rounded-lg p-6 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-teal-100 text-teal-800 font-bold text-lg">
                {index + 1}
              </div>
              <Label htmlFor={q.id} className="text-xl font-bold text-black">
                {q.question}
              </Label>
            </div>
            <Textarea
              id={q.id}
              placeholder={q.placeholder}
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              className="min-h-[120px] bg-white text-black placeholder:text-gray-600 border-2 border-gray-300 text-lg"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
