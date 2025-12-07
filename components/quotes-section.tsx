"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote, Sparkles, Loader2, Heart, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuoteData {
  quote: string
  timestamp: string
  userInput: string
}

export default function QuotesSection() {
  const [userInput, setUserInput] = useState("")
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedQuotes, setSavedQuotes] = useState<QuoteData[]>([])
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Load saved quotes from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("melodica-saved-quotes")
      if (saved) {
        try {
          setSavedQuotes(JSON.parse(saved))
        } catch (e) {
          console.error("Error loading saved quotes:", e)
        }
      }
    }
  }, [])

  // Quote database organized by emotion/keyword
  const quoteDatabase = {
    anxiety: [
      "Breathe. You're going to be okay. Breathe and remember that you've been in this place before. You've been uncomfortable and anxious and scared, and you've survived.",
      "Anxiety is a thin stream of fear trickling through the mind. If encouraged, it cuts a channel into which all other thoughts are drained.",
      "You don't have to control your thoughts. You just have to stop letting them control you.",
      "Worry never robs tomorrow of its sorrow, it only saps today of its joy.",
      "The only way out is through. Keep moving forward, one step at a time.",
    ],
    stress: [
      "It's not the load that breaks you down, it's the way you carry it.",
      "Stress is caused by being 'here' but wanting to be 'there'.",
      "You can't stop the waves, but you can learn to surf.",
      "The greatest weapon against stress is our ability to choose one thought over another.",
      "Take a deep breath. It's just a bad day, not a bad life.",
    ],
    sadness: [
      "The sun will rise and we will try again.",
      "You are allowed to feel messed up and inside out. It doesn't mean you're defective—it just means you're human.",
      "Sadness is but a wall between two gardens.",
      "The way I see it, if you want the rainbow, you gotta put up with the rain.",
      "This too shall pass. You've survived everything you've been through, and you will survive this too.",
    ],
    fear: [
      "Courage is not the absence of fear, but action in spite of it.",
      "Everything you've ever wanted is on the other side of fear.",
      "Fear is only as deep as the mind allows.",
      "The only thing we have to fear is fear itself.",
      "Feel the fear and do it anyway.",
    ],
    overwhelmed: [
      "You don't have to see the whole staircase, just take the first step.",
      "How do you eat an elephant? One bite at a time.",
      "It's okay to not have it all figured out. Just take it one day at a time.",
      "You are stronger than you think, braver than you believe, and smarter than you know.",
      "Progress, not perfection. Small steps forward are still steps forward.",
    ],
    motivation: [
      "The future belongs to those who believe in the beauty of their dreams.",
      "You are capable of amazing things.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "Believe you can and you're halfway there.",
      "The only way to do great work is to love what you do.",
    ],
    confidence: [
      "Confidence is not 'they will like me'. Confidence is 'I'll be fine if they don't'.",
      "You are enough. You are so enough. It is unbelievable how enough you are.",
      "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
      "You were given this life because you are strong enough to live it.",
      "Your value doesn't decrease based on someone's inability to see your worth.",
    ],
    general: [
      "You are braver than you believe, stronger than you seem, and smarter than you think.",
      "Every day may not be good, but there's something good in every day.",
      "The only person you should try to be better than is the person you were yesterday.",
      "It's okay to be a work in progress.",
      "You don't have to be perfect to be amazing.",
      "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
      "Healing is not linear. It's okay to have bad days.",
      "You are doing better than you think you are.",
      "Small progress is still progress.",
      "Be gentle with yourself. You're doing the best you can.",
    ],
  }

  // Analyze user input and determine emotion/keywords
  const analyzeInput = (input: string): string[] => {
    const lowerInput = input.toLowerCase()
    const emotions: string[] = []

    // Check for anxiety-related keywords
    if (
      lowerInput.match(/\b(anxious|anxiety|worried|worry|nervous|panic|stressed|stress)\b/)
    ) {
      if (lowerInput.match(/\b(anxious|anxiety|worried|worry|nervous|panic)\b/)) {
        emotions.push("anxiety")
      }
      if (lowerInput.match(/\b(stressed|stress|overwhelmed|pressure)\b/)) {
        emotions.push("stress")
      }
    }

    // Check for sadness
    if (
      lowerInput.match(/\b(sad|sadness|depressed|depression|down|unhappy|melancholy|blue)\b/)
    ) {
      emotions.push("sadness")
    }

    // Check for fear
    if (
      lowerInput.match(/\b(fear|afraid|scared|frightened|terrified|worried about|fearful)\b/)
    ) {
      emotions.push("fear")
    }

    // Check for overwhelm
    if (
      lowerInput.match(/\b(overwhelmed|too much|can't handle|exhausted|tired|drained)\b/)
    ) {
      emotions.push("overwhelmed")
    }

    // Check for motivation/confidence needs
    if (
      lowerInput.match(/\b(motivation|motivated|inspired|confident|confidence|believe|can do)\b/)
    ) {
      emotions.push("motivation")
      emotions.push("confidence")
    }

    // If no specific emotion detected, use general
    if (emotions.length === 0) {
      emotions.push("general")
    }

    return emotions
  }

  // Get a random quote based on emotions
  const getQuote = (emotions: string[]): string => {
    const primaryEmotion = emotions[0]
    const quotes = quoteDatabase[primaryEmotion as keyof typeof quoteDatabase] || quoteDatabase.general
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  const generateQuote = () => {
    if (!userInput.trim()) {
      toast({
        title: "Please enter your feelings",
        description: "Tell us what you're feeling to get a personalized quote.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setCopied(false)

    // Simulate a small delay for better UX
    setTimeout(() => {
      try {
        // Analyze the input
        const emotions = analyzeInput(userInput.trim())

        // Generate quote
        const quote = getQuote(emotions)

        const quoteData: QuoteData = {
          quote,
          timestamp: new Date().toISOString(),
          userInput: userInput.trim(),
        }

        setCurrentQuote(quoteData)
      } catch (error) {
        console.error("Error generating quote:", error)
        toast({
          title: "Error generating quote",
          description: "Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    }, 500) // Small delay to show loading state
  }

  const saveQuote = () => {
    if (!currentQuote) return

    const updated = [currentQuote, ...savedQuotes]
    setSavedQuotes(updated)
    
    if (typeof window !== "undefined") {
      localStorage.setItem("melodica-saved-quotes", JSON.stringify(updated))
    }

    toast({
      title: "Quote saved! 💚",
      description: "Your quote has been saved to your collection.",
    })
  }

  const copyQuote = async () => {
    if (!currentQuote) return

    try {
      await navigator.clipboard.writeText(currentQuote.quote)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Quote copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteQuote = (index: number) => {
    const updated = savedQuotes.filter((_, i) => i !== index)
    setSavedQuotes(updated)
    
    if (typeof window !== "undefined") {
      localStorage.setItem("melodica-saved-quotes", JSON.stringify(updated))
    }

    toast({
      title: "Quote deleted",
      description: "Quote removed from your collection.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Share Your Feelings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Tell us what you're feeling, and we'll generate a personalized motivational quote for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="I'm feeling anxious about my upcoming presentation..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[120px] bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            disabled={isGenerating}
          />
          <Button
            onClick={generateQuote}
            disabled={isGenerating || !userInput.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quote...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Quote
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Quote */}
      {currentQuote && (
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Quote className="h-5 w-5 text-purple-400" />
              Your Personalized Quote
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative p-6 bg-gray-900/50 rounded-lg border border-purple-700/30">
              <Quote className="absolute top-2 left-2 h-8 w-8 text-purple-400/20" />
              <p className="text-lg text-white italic relative z-10 pl-8">
                "{currentQuote.quote}"
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveQuote}
                variant="outline"
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                <Heart className="mr-2 h-4 w-4" />
                Save Quote
              </Button>
              <Button
                onClick={copyQuote}
                variant="outline"
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Quotes */}
      {savedQuotes.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-400" />
              Saved Quotes ({savedQuotes.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your collection of inspirational quotes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedQuotes.map((quoteData, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-purple-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Quote className="h-5 w-5 text-purple-400/50 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-white italic mb-2">"{quoteData.quote}"</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          {new Date(quoteData.timestamp).toLocaleDateString()}
                        </p>
                        <Button
                          onClick={() => deleteQuote(index)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

