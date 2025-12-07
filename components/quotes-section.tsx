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

  const generateQuote = async () => {
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

    try {
      const response = await fetch("/api/quotes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput: userInput.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate quote")
      }

      const data = await response.json()
      const quoteData: QuoteData = {
        quote: data.quote,
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

