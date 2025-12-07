import { NextResponse } from "next/server"

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
function analyzeInput(input: string): string[] {
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
function getQuote(emotions: string[]): string {
  // Try to get a quote from the primary emotion
  const primaryEmotion = emotions[0]
  const quotes = quoteDatabase[primaryEmotion as keyof typeof quoteDatabase] || quoteDatabase.general

  // Return a random quote
  return quotes[Math.floor(Math.random() * quotes.length)]
}

export async function POST(request: Request) {
  try {
    const { userInput } = await request.json()

    if (!userInput || typeof userInput !== "string" || userInput.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide your feelings/thoughts" },
        { status: 400 }
      )
    }

    // Analyze the input
    const emotions = analyzeInput(userInput.trim())

    // Generate quote
    const quote = getQuote(emotions)

    return NextResponse.json({
      quote,
      detectedEmotions: emotions,
    })
  } catch (error) {
    console.error("Error generating quote:", error)
    return NextResponse.json(
      { error: "Failed to generate quote. Please try again." },
      { status: 500 }
    )
  }
}

