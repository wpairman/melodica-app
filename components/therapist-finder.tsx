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

// Comprehensive therapist database with various locations
const THERAPIST_DATABASE: Therapist[] = [
  // Los Angeles, CA
  { id: 1, name: "Dr. Maya Johnson, PsyD", specialty: "Anxiety - CBT / Mindfulness", distance: "1.2 mi", city: "Los Angeles", zipCode: "90001", state: "CA", country: "USA", phone: "555-432-1122" },
  { id: 2, name: "Carlos Ramirez, LCSW", specialty: "Depression • Trauma-Informed", distance: "2.5 mi", city: "Los Angeles", zipCode: "90012", state: "CA", country: "USA", phone: "555-987-2233" },
  { id: 3, name: "Priya Patel, LMFT", specialty: "Couples • Family Systems", distance: "4.1 mi", city: "Los Angeles", zipCode: "90015", state: "CA", country: "USA", phone: "555-318-4455" },
  
  // New York, NY
  { id: 4, name: "Dr. Sarah Chen, PhD", specialty: "Anxiety • OCD", distance: "0.8 mi", city: "New York", zipCode: "10001", state: "NY", country: "USA", phone: "555-201-3344" },
  { id: 5, name: "Michael Thompson, LCSW-R", specialty: "Depression • Substance Use", distance: "1.5 mi", city: "New York", zipCode: "10002", state: "NY", country: "USA", phone: "555-201-5566" },
  { id: 6, name: "Dr. Jennifer Martinez, PsyD", specialty: "Trauma • PTSD", distance: "2.3 mi", city: "New York", zipCode: "10003", state: "NY", country: "USA", phone: "555-201-7788" },
  
  // Chicago, IL
  { id: 7, name: "Dr. Robert Williams, PhD", specialty: "Bipolar • Mood Disorders", distance: "1.0 mi", city: "Chicago", zipCode: "60601", state: "IL", country: "USA", phone: "555-312-9900" },
  { id: 8, name: "Amanda Davis, LMHC", specialty: "Anxiety • Stress Management", distance: "1.8 mi", city: "Chicago", zipCode: "60602", state: "IL", country: "USA", phone: "555-312-1122" },
  
  // Miami, FL
  { id: 9, name: "Dr. Sofia Rodriguez, PsyD", specialty: "Hispanic/Latino Mental Health", distance: "0.9 mi", city: "Miami", zipCode: "33101", state: "FL", country: "USA", phone: "555-305-2233" },
  { id: 10, name: "James Wilson, LMFT", specialty: "LGBTQ+ • Relationship Issues", distance: "2.1 mi", city: "Miami", zipCode: "33102", state: "FL", country: "USA", phone: "555-305-4455" },
  
  // Seattle, WA
  { id: 11, name: "Dr. Lisa Kim, PhD", specialty: "Anxiety • Depression", distance: "1.3 mi", city: "Seattle", zipCode: "98101", state: "WA", country: "USA", phone: "555-206-6677" },
  
  // Austin, TX
  { id: 12, name: "Dr. David Brown, PsyD", specialty: "ADHD • Executive Functioning", distance: "1.5 mi", city: "Austin", zipCode: "78701", state: "TX", country: "USA", phone: "555-512-8899" },
  
  // Kingston, Jamaica
  { id: 13, name: "Dr. Marcia Thompson, PsyD", specialty: "Anxiety • Depression", distance: "2.0 km", city: "Kingston", zipCode: "JMAAW01", country: "Jamaica", phone: "876-555-0101" },
  { id: 14, name: "Dr. Patrick Clarke, LCSW", specialty: "Trauma • Grief Counseling", distance: "3.5 km", city: "Kingston", zipCode: "JMAAW02", country: "Jamaica", phone: "876-555-0202" },
  
  // Montego Bay, Jamaica
  { id: 15, name: "Dr. Lisa Campbell, PhD", specialty: "Family Therapy • PTSD", distance: "1.8 km", city: "Montego Bay", zipCode: "JMAAW15", country: "Jamaica", phone: "876-555-0303" },
  
  // Toronto, Canada
  { id: 16, name: "Dr. Emily Wong, PhD", specialty: "Anxiety • Cultural Issues", distance: "2.2 km", city: "Toronto", zipCode: "M5H 1J1", country: "Canada", phone: "416-555-1010" },
  
  // London, UK
  { id: 17, name: "Dr. James Anderson, DClinPsy", specialty: "Depression • CBT", distance: "1.5 km", city: "London", zipCode: "SW1A 1AA", country: "United Kingdom", phone: "+44-20-5555-2020" },
]

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
            const searchTerm = locationQuery.toLowerCase().trim()
            
            const filtered = THERAPIST_DATABASE.filter((therapist) => {
              const matchesZip = therapist.zipCode.toLowerCase().includes(searchTerm)
              const matchesCity = therapist.city.toLowerCase().includes(searchTerm)
              const matchesCountry = therapist.country.toLowerCase().includes(searchTerm)
              return matchesZip || matchesCity || matchesCountry
            })
            
            const resultsWithDistance = filtered.slice(0, 10).map((therapist, index) => ({
              ...therapist,
              distance: `${(index + 1) * 0.8 + 0.5} mi`,
            }))
            
            setResults(resultsWithDistance)
            setHasSearched(true)
          } else {
            // If can't determine location, show nearby therapists (first 5)
            setResults(THERAPIST_DATABASE.slice(0, 5).map((t, i) => ({
              ...t,
              distance: `${(i + 1) * 0.8 + 0.5} mi`,
            })))
            setHasSearched(true)
          }
        } catch (error) {
          console.error("Error getting location:", error)
          // Fallback: show some therapists
          setResults(THERAPIST_DATABASE.slice(0, 5).map((t, i) => ({
            ...t,
            distance: `${(i + 1) * 0.8 + 0.5} mi`,
          })))
          setHasSearched(true)
        }
        
        setLoadingGeo(false)
      },
      () => {
        setLoadingGeo(false)
      },
    )
  }

  // Search by zip code, city, or country
  const handleSearch = () => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    const searchTerm = query.toLowerCase().trim()

    // Filter therapists by zip code, city, state, or country
    const filtered = THERAPIST_DATABASE.filter((therapist) => {
      const matchesZip = therapist.zipCode.toLowerCase().includes(searchTerm)
      const matchesCity = therapist.city.toLowerCase().includes(searchTerm)
      const matchesState = therapist.state?.toLowerCase().includes(searchTerm) || false
      const matchesCountry = therapist.country.toLowerCase().includes(searchTerm)
      const matchesFullLocation = `${therapist.city}, ${therapist.state || ''} ${therapist.zipCode}`.toLowerCase().includes(searchTerm)

      return matchesZip || matchesCity || matchesState || matchesCountry || matchesFullLocation
    })

    // Calculate approximate distance for display (mock calculation based on first match)
    const resultsWithDistance = filtered.map((therapist, index) => ({
      ...therapist,
      distance: index < 3 ? `${(index + 1) * 0.8 + 0.5} mi` : `${(index + 1) * 1.2} mi`,
    }))

    setResults(resultsWithDistance)
    setHasSearched(true)
  }

  // Auto-search as user types (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    const timeoutId = setTimeout(() => {
      const searchTerm = query.toLowerCase().trim()
      
      // Filter therapists by zip code, city, state, or country
      const filtered = THERAPIST_DATABASE.filter((therapist) => {
        const matchesZip = therapist.zipCode.toLowerCase().includes(searchTerm)
        const matchesCity = therapist.city.toLowerCase().includes(searchTerm)
        const matchesState = therapist.state?.toLowerCase().includes(searchTerm) || false
        const matchesCountry = therapist.country.toLowerCase().includes(searchTerm)
        const matchesFullLocation = `${therapist.city}, ${therapist.state || ''} ${therapist.zipCode}`.toLowerCase().includes(searchTerm)
        
        return matchesZip || matchesCity || matchesState || matchesCountry || matchesFullLocation
      })
      
      // Calculate approximate distance for display
      const resultsWithDistance = filtered.map((therapist, index) => ({
        ...therapist,
        distance: index < 3 ? `${(index + 1) * 0.8 + 0.5} mi` : `${(index + 1) * 1.2} mi`,
      }))
      
      setResults(resultsWithDistance)
      setHasSearched(true)
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-xl">Find a Therapist Near You</CardTitle>
            <CardDescription>
              Search by zip code, city, or country. Use the location button to find therapists near you.
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
