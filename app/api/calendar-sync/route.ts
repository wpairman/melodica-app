import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Calendar URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    let calendarUrl: URL
    try {
      calendarUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Only allow https URLs for security
    if (calendarUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    // Create AbortController for timeout (compatible with Node.js 18)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds

    // Fetch the calendar from the server (no CORS issues)
    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/calendar, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; Melodica Calendar Sync)',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw fetchError
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch calendar: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const calendarData = await response.text()

    if (!calendarData || calendarData.trim().length === 0) {
      return NextResponse.json(
        { error: 'Calendar file appears to be empty' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: calendarData,
    })
  } catch (error: any) {
    console.error('Error fetching calendar:', error)
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again or use the file upload option.' },
        { status: 504 }
      )
    }

    if (error.message?.includes('fetch')) {
      return NextResponse.json(
        { error: 'Failed to fetch calendar. Please check the URL and try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Also support GET for simple cases
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'Calendar URL parameter is required' },
      { status: 400 }
    )
  }

  try {
    const calendarUrl = new URL(url)
    
    if (calendarUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    // Create AbortController for timeout (compatible with Node.js 18)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds

    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/calendar, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; Melodica Calendar Sync)',
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw fetchError
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch calendar: ${response.status}` },
        { status: response.status }
      )
    }

    const calendarData = await response.text()

    return NextResponse.json({
      success: true,
      data: calendarData,
    })
  } catch (error: any) {
    console.error('Error fetching calendar:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch calendar' },
      { status: 500 }
    )
  }
}

