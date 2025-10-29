"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, RefreshCw } from "lucide-react"

type Therapist = {
  id: number
  name: string
  specialty: string
  distance: string
  city: string
  zipCode: string
  country: string
  phone: string
  state?: string
}

// Therapist name and specialty pools for dynamic generation
const FIRST_NAMES = ["Sarah", "Michael", "Jennifer", "David", "Lisa", "Robert", "Emily", "James", "Maria", "Christopher", "Jessica", "Daniel", "Ashley", "Matthew", "Amanda", "Mark", "Michelle", "Paul", "Stephanie", "Kevin"]
const LAST_NAMES = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson"]
const TITLES = ["Dr.", "Dr.", "Dr.", "", "", ""] // Mix of titles
const DEGREES = ["PsyD", "PhD", "LCSW", "LMFT", "LMHC", "LPC", "EdD", ""]
const SPECIALTIES = [
  "Anxiety • CBT",
  "Depression • Mood Disorders",
  "Trauma • PTSD",
  "Couples Therapy",
  "Family Systems",
  "LGBTQ+ Support",
  "Substance Use",
  "ADHD • Executive Functioning",
  "Eating Disorders",
  "OCD",
  "Bipolar Disorder",
  "Grief Counseling",
  "Stress Management",
  "Mindfulness-Based Therapy",
  "Dialectical Behavior Therapy",
  "Cognitive Behavioral Therapy",
]

// Generate therapists dynamically for any zip code
const generateTherapistsForZip = async (zipCode: string, city?: string, state?: string, country?: string): Promise<Therapist[]> => {
  const therapists: Therapist[] = []
  const count = 5 + Math.floor(Math.random() * 5) // 5-10 therapists per location
  
  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
    const title = TITLES[Math.floor(Math.random() * TITLES.length)]
    const degree = DEGREES[Math.floor(Math.random() * DEGREES.length)]
    const specialty = SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)]
    
    const name = title ? `${title} ${firstName} ${lastName}${degree ? `, ${degree}` : ""}` : `${firstName} ${lastName}${degree ? `, ${degree}` : ""}`
    
    const distance = (i + 1) * 0.5 + Math.random() * 2
    const distanceStr = country === "USA" || !country ? `${distance.toFixed(1)} mi` : `${(distance * 1.6).toFixed(1)} km`
    
    // Generate phone based on location
    let phone = ""
    if (country === "Jamaica") {
      phone = `876-555-${Math.floor(1000 + Math.random() * 9000)}`
    } else if (country === "Canada") {
      phone = `${Math.floor(200 + Math.random() * 800)}-555-${Math.floor(1000 + Math.random() * 9000)}`
    } else if (country === "United Kingdom") {
      phone = `+44-20-5555-${Math.floor(1000 + Math.random() * 9000)}`
    } else {
      // USA format
      const areaCode = Math.floor(200 + Math.random() * 800)
      phone = `${areaCode}-555-${Math.floor(1000 + Math.random() * 9000)}`
    }
    
    therapists.push({
      id: Date.now() + i,
      name,
      specialty,
      distance: distanceStr,
      city: city || "Unknown",
      zipCode,
      state: state || undefined,
      country: country || "USA",
      phone,
    })
  }
  
  return therapists
}

// Lookup location by zip code, city, or country name
const lookupLocation = async (searchTerm: string): Promise<{ city?: string; state?: string; country?: string; zipCode?: string }> => {
  try {
    // Check if it's a zip code pattern
    const isZipCode = /^[0-9A-Za-z\s-]{3,10}$/.test(searchTerm) && /[0-9]/.test(searchTerm)
    
    if (isZipCode) {
      // Try US zip code API first for US zip codes
      if (/^\d{5}(-\d{4})?$/.test(searchTerm)) {
        try {
          const response = await fetch(`https://api.zippopotam.us/us/${searchTerm.split('-')[0]}`)
          if (response.ok) {
            const data = await response.json()
            if (data.places && data.places.length > 0) {
              return {
                city: data.places[0]['place name'],
                state: data.places[0]['state abbreviation'],
                country: data.country,
                zipCode: searchTerm,
              }
            }
          }
        } catch (e) {
          // Fall through to Nominatim
        }
      }
      
      // For international zip codes, use Nominatim
      const zipResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(searchTerm)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'Melodica Mental Health App',
          },
        }
      )
      
      if (zipResponse.ok) {
        const zipData = await zipResponse.json()
        if (zipData.length > 0) {
          const result = zipData[0]
          return {
            city: result.address?.city || result.address?.town || result.address?.village,
            state: result.address?.state,
            country: result.address?.country,
            zipCode: searchTerm,
          }
        }
      }
    } else {
      // It's a city or country name - use Nominatim to find it
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Melodica Mental Health App',
          },
        }
      )
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        if (geoData.length > 0) {
          const result = geoData[0]
          const address = result.address || {}
          return {
            city: address.city || address.town || address.village || address.county || searchTerm,
            state: address.state,
            country: address.country || searchTerm,
            zipCode: address.postcode,
          }
        }
      }
    }
  } catch (error) {
    console.error("Error looking up location:", error)
  }
  
  // Return search term as city/country if lookup fails
  return {
    city: searchTerm,
    country: searchTerm,
  }
}

export default function TherapistFinder() {
  const [locationGranted, setLocationGranted] = useState(false)
  const [loadingGeo, setLoadingGeo] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Therapist[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Ask for location and (in real app) fetch therapists by coords
  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLoadingGeo(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationGranted(true)
        setLoadingGeo(true)
        
        try {
          // Reverse geocode to get city/zip from coordinates
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          
          // Using Nominatim (OpenStreetMap) for reverse geocoding
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
          )
          const geoData = await geoResponse.json()
          
          const address = geoData.address || {}
          const city = address.city || address.town || address.village || address.county || ""
          const zipCode = address.postcode || ""
          const country = address.country || ""
          
          // Search with the found location
          const locationQuery = zipCode || city || country
          if (locationQuery) {
            setQuery(locationQuery)
            
            // Generate therapists for this location
            const therapists = await generateTherapistsForZip(zipCode || locationQuery, city, address.state, country || "USA")
            setResults(therapists)
            setHasSearched(true)
          } else {
            // If can't determine location, generate generic therapists
            const therapists = await generateTherapistsForZip("00000", "Your Area", undefined, "USA")
            setResults(therapists)
            setHasSearched(true)
          }
        } catch (error) {
          console.error("Error getting location:", error)
          // Fallback: generate therapists
          const therapists = await generateTherapistsForZip("00000", "Your Area", undefined, "USA")
          setResults(therapists)
          setHasSearched(true)
        }
        
        setLoadingGeo(false)
      },
      () => {
        setLoadingGeo(false)
      },
    )
  }

  // Search by zip code, city, or country - works for ANY location worldwide
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    const searchTerm = query.trim()
    setHasSearched(true)
    
    try {
      // Lookup the location (works for zip codes, cities, or countries)
      const locationInfo = await lookupLocation(searchTerm)
      
      // Use the found location or fallback to search term
      const city = locationInfo.city || searchTerm
      const state = locationInfo.state
      const country = locationInfo.country || searchTerm
      const zipCode = locationInfo.zipCode || (locationInfo.city ? "" : searchTerm) || searchTerm

      // Generate therapists for this location
      const therapists = await generateTherapistsForZip(
        zipCode,
        city,
        state,
        country
      )

      setResults(therapists)
    } catch (error) {
      console.error("Error searching therapists:", error)
      // Fallback: generate therapists with the search term as location
      const therapists = await generateTherapistsForZip(searchTerm, searchTerm, undefined, searchTerm)
      setResults(therapists)
    }
  }

  // Auto-search as user types (debounced) - only for zip codes
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    // Only auto-search if it looks like a zip code (avoid API calls for partial city names)
    const isZipCode = /^[0-9A-Za-z\s-]{3,10}$/.test(query.trim()) && /[0-9]/.test(query.trim())
    
    if (!isZipCode && query.length < 5) {
      // Don't search until user has typed more or it's clearly a zip code
      return
    }

    const timeoutId = setTimeout(async () => {
      await handleSearch()
    }, 500) // Debounce search by 500ms for API calls

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-xl">Find a Therapist Near You</CardTitle>
            <CardDescription>
              Search by zip code, city, or country anywhere in the world. Use the location button to find therapists near you.
            </CardDescription>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Input
              placeholder="Zip code, City, or Country"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="w-40 sm:w-52"
            />
            <Button onClick={handleSearch} variant="default" size="sm">
              Search
            </Button>
            <Button variant="secondary" size="icon" onClick={handleLocate} disabled={loadingGeo} aria-label="Locate me">
              {loadingGeo ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((th) => (
            <Card key={th.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{th.name}</CardTitle>
                <CardDescription>{th.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">
                  {th.distance} • {th.city}{th.state ? `, ${th.state}` : ""} {th.zipCode}
                </p>
                <p className="text-muted-foreground">{th.country}</p>
                <p className="text-muted-foreground">{th.phone}</p>
                <Button size="sm" className="mt-2 w-full" variant="outline">
                  Contact
                </Button>
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && hasSearched && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground mb-2">No therapists found for "{query}"</p>
              <p className="text-sm text-muted-foreground">Try searching by:</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Zip code (e.g., 90001, 10001)</li>
                <li>• City name (e.g., Los Angeles, New York, Kingston)</li>
                <li>• Country (e.g., USA, Jamaica, Canada)</li>
              </ul>
            </div>
          )}
          {!hasSearched && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Enter a zip code, city, or country to search for therapists</p>
              <p className="text-sm text-muted-foreground mt-2">Or click the location button to find therapists near you</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
