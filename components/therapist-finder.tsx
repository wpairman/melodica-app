"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

const extractLocationDetails = (address: Record<string, string | undefined> | undefined, fallback?: string) => {
  if (!address) {
    return {
      city: fallback || "Unknown",
      state: undefined,
      country: fallback,
    }
  }

  const getFirst = (keys: string[]) => keys.map((key) => address[key]).find(Boolean)

  const locality = getFirst([
    "neighbourhood",
    "suburb",
    "city_district",
    "district",
    "village",
    "hamlet",
    "locality",
    "isolated_dwelling"
  ])

  const city = getFirst([
    "city",
    "town",
    "municipality"
  ])

  const admin = getFirst([
    "parish",
    "state_district",
    "state",
    "region",
    "province",
    "county"
  ])

  const country = address.country || fallback

  const displayCity = [locality, city].filter(Boolean).join(", ") || city || admin || country || fallback || "Unknown"

  return {
    city: displayCity,
    state: admin || undefined,
    country: country || undefined,
  }
}

const THERAPIST_CACHE_STORAGE_KEY = "melodica-therapist-cache-v1"
const THERAPIST_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24

type TherapistCacheEntry = {
  timestamp: number
  data: Therapist[]
}

type TherapistCache = Record<string, TherapistCacheEntry>

const readTherapistCache = (): TherapistCache => {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(THERAPIST_CACHE_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === "object" && parsed ? parsed : {}
  } catch (error) {
    console.warn("Unable to read therapist cache:", error)
    return {}
  }
}

const writeTherapistCache = (cache: TherapistCache) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(THERAPIST_CACHE_STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn("Unable to write therapist cache:", error)
  }
}

const cacheKeyFromLocation = (zipCode?: string, city?: string, state?: string, country?: string) => {
  return [zipCode, city, state, country].filter(Boolean).map((segment) => segment?.toLowerCase().trim()).join("|")
}

const getTherapistsFromCache = (cacheKey: string): Therapist[] | null => {
  if (!cacheKey) return null
  const cache = readTherapistCache()
  const entry = cache[cacheKey]
  if (!entry) return null

  const isFresh = Date.now() - entry.timestamp < THERAPIST_CACHE_MAX_AGE_MS
  if (!isFresh) return null

  return entry.data.map((therapist) => ({ ...therapist }))
}

const saveTherapistsToCache = (cacheKey: string, therapists: Therapist[]) => {
  if (!cacheKey || typeof window === "undefined") return
  const cache = readTherapistCache()
  cache[cacheKey] = {
    timestamp: Date.now(),
    data: therapists,
  }
  writeTherapistCache(cache)
}

const generateStableId = (cacheKey: string, index: number) => {
  let hash = 0
  const seed = `${cacheKey}-${index}`
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Fetch real registered therapists from NPI Registry (US) and other sources
const fetchRealTherapists = async (
  zipCode: string,
  city?: string,
  state?: string,
  country?: string,
  latitude?: number,
  longitude?: number
): Promise<Therapist[]> => {
  const cacheKey = cacheKeyFromLocation(zipCode, city, state, country)
  const cached = getTherapistsFromCache(cacheKey)
  if (cached) {
    return cached
  }

  const therapists: Therapist[] = []

  try {
    // For US locations, use NPI Registry API to find registered mental health providers
    if (country === "USA" || country === "United States" || !country || country === "US") {
      const npiTherapists = await fetchNPIRegistryTherapists(zipCode, city, state, latitude, longitude)
      therapists.push(...npiTherapists)
    }

    // If we don't have enough results, try Psychology Today search (web-based)
    if (therapists.length < 5 && (country === "USA" || country === "United States" || !country)) {
      const psychologyTodayTherapists = await fetchPsychologyTodayTherapists(zipCode, city, state)
      // Merge without duplicates
      const existingNames = new Set(therapists.map(t => t.name.toLowerCase()))
      psychologyTodayTherapists.forEach(t => {
        if (!existingNames.has(t.name.toLowerCase())) {
          therapists.push(t)
        }
      })
    }

    // For non-US locations, provide helpful information
    if (therapists.length === 0 && country && country !== "USA" && country !== "United States") {
      // Return empty array - we'll show a message to the user
      return []
    }
  } catch (error) {
    console.error("Error fetching real therapists:", error)
    // Fall through to show helpful message
  }

  // Cache results if we found any
  if (therapists.length > 0) {
    saveTherapistsToCache(cacheKey, therapists)
  }

  return therapists
}

// Fetch therapists from NPI Registry (official US government database)
const fetchNPIRegistryTherapists = async (
  zipCode: string,
  city?: string,
  state?: string,
  latitude?: number,
  longitude?: number
): Promise<Therapist[]> => {
  const therapists: Therapist[] = []

  try {
    // NPI Registry API endpoint - build search parameters
    const params = new URLSearchParams({
      version: "2.1",
      enumeration_type: "NPI-1",
      limit: "50", // Get more results to filter
    })

    // Add location filters - prioritize zip code, then city/state
    if (zipCode) {
      params.append("postal_code", zipCode.split("-")[0]) // Use first 5 digits if extended zip
    } else if (city && state) {
      params.append("city", city)
      params.append("state", state)
    } else if (city) {
      params.append("city", city)
    } else if (state) {
      params.append("state", state)
    }

    // Search for different mental health provider taxonomy codes
    // Using taxonomy codes is more reliable than descriptions
    const taxonomyCodes = [
      "103T00000X", // Psychologist
      "1041C0700X", // Clinical Psychologist
      "1041S0200X", // School Psychologist
      "2084P0800X", // Psychiatry & Neurology - Psychiatry
      "2084P0802X", // Psychiatry & Neurology - Addiction Psychiatry
      "2084P0804X", // Psychiatry & Neurology - Child & Adolescent Psychiatry
      "2084P0805X", // Psychiatry & Neurology - Geriatric Psychiatry
    ]

    // Also search by taxonomy description as fallback
    const providerTypes = [
      "Psychologist",
      "Clinical Social Worker",
      "Marriage & Family Therapist",
      "Professional Counselor",
      "Mental Health Counselor",
    ]

    const seenNPIs = new Set<string>()

    // First, try searching by taxonomy codes
    for (const taxonomyCode of taxonomyCodes) {
      try {
        const searchParams = new URLSearchParams(params)
        searchParams.set("taxonomy_description", taxonomyCode)
        
        const response = await fetch(
          `https://npiregistry.cms.hhs.gov/api/?${searchParams.toString()}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          
          if (data.results && Array.isArray(data.results)) {
            data.results.forEach((provider: any, index: number) => {
              const npi = provider.number
              if (seenNPIs.has(npi)) return // Skip duplicates
              seenNPIs.add(npi)

              const addresses = provider.addresses || []
              const practiceAddress = addresses.find((addr: any) => addr.address_purpose === "LOCATION") || addresses[0]
              
              if (practiceAddress) {
                const providerName = provider.basic?.organization_name || 
                  `${provider.basic?.first_name || ""} ${provider.basic?.last_name || ""}`.trim() ||
                  "Provider"
                
                if (!providerName || providerName === "Provider") return // Skip invalid entries
                
                const specialties = provider.taxonomies || []
                const specialty = specialties.length > 0 
                  ? specialties[0].desc || "Mental Health Provider"
                  : "Mental Health Provider"

                const phone = practiceAddress.telephone_number || ""
                const providerCity = practiceAddress.city || city || "Unknown"
                const providerState = practiceAddress.state || state
                const providerZip = practiceAddress.postal_code || zipCode
                const providerCountry = practiceAddress.country_code === "US" ? "USA" : practiceAddress.country_name || "USA"

                // Calculate distance if we have coordinates
                let distance = ""
                if (latitude && longitude) {
                  // Try to geocode the address if we don't have coordinates
                  // For now, estimate based on zip code match
                  if (zipCode && providerZip && zipCode.split("-")[0] === providerZip.split("-")[0]) {
                    distance = "0.5-5.0 mi" // Same zip code area
                  } else {
                    distance = "5-15 mi" // Different zip code
                  }
                } else {
                  distance = zipCode && providerZip && zipCode.split("-")[0] === providerZip.split("-")[0] 
                    ? "0.5-5.0 mi" 
                    : "5-15 mi"
                }

                therapists.push({
                  id: npi || generateStableId(`${providerCity}-${providerZip}`, therapists.length),
                  name: providerName,
                  specialty: specialty,
                  distance: distance,
                  city: providerCity,
                  zipCode: providerZip,
                  state: providerState,
                  country: providerCountry,
                  phone: phone,
                })
              }
            })
          }
        }
      } catch (error) {
        console.warn(`Error fetching taxonomy ${taxonomyCode} from NPI Registry:`, error)
        // Continue to next taxonomy
      }
    }

    // If we don't have enough results, try searching by description
    if (therapists.length < 5) {
      for (const providerType of providerTypes) {
        try {
          const searchParams = new URLSearchParams(params)
          searchParams.set("taxonomy_description", providerType)
          
          const response = await fetch(
            `https://npiregistry.cms.hhs.gov/api/?${searchParams.toString()}`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          )

          if (response.ok) {
            const data = await response.json()
            
            if (data.results && Array.isArray(data.results)) {
              data.results.forEach((provider: any) => {
                const npi = provider.number
                if (seenNPIs.has(npi)) return // Skip duplicates
                seenNPIs.add(npi)

                const addresses = provider.addresses || []
                const practiceAddress = addresses.find((addr: any) => addr.address_purpose === "LOCATION") || addresses[0]
                
                if (practiceAddress) {
                  const providerName = provider.basic?.organization_name || 
                    `${provider.basic?.first_name || ""} ${provider.basic?.last_name || ""}`.trim() ||
                    "Provider"
                  
                  if (!providerName || providerName === "Provider") return
                  
                  const specialties = provider.taxonomies || []
                  const specialty = specialties.length > 0 
                    ? specialties[0].desc || providerType
                    : providerType

                  const phone = practiceAddress.telephone_number || ""
                  const providerCity = practiceAddress.city || city || "Unknown"
                  const providerState = practiceAddress.state || state
                  const providerZip = practiceAddress.postal_code || zipCode
                  const providerCountry = practiceAddress.country_code === "US" ? "USA" : practiceAddress.country_name || "USA"

                  let distance = ""
                  if (zipCode && providerZip && zipCode.split("-")[0] === providerZip.split("-")[0]) {
                    distance = "0.5-5.0 mi"
                  } else {
                    distance = "5-15 mi"
                  }

                  therapists.push({
                    id: npi || generateStableId(`${providerCity}-${providerZip}`, therapists.length),
                    name: providerName,
                    specialty: specialty,
                    distance: distance,
                    city: providerCity,
                    zipCode: providerZip,
                    state: providerState,
                    country: providerCountry,
                    phone: phone,
                  })
                }
              })
            }
          }
        } catch (error) {
          console.warn(`Error fetching ${providerType} from NPI Registry:`, error)
          // Continue to next provider type
        }
      }
    }
  } catch (error) {
    console.error("Error fetching from NPI Registry:", error)
  }

  return therapists.slice(0, 20) // Limit to 20 results
}

// Fetch therapists from Psychology Today (using their public search)
const fetchPsychologyTodayTherapists = async (
  zipCode: string,
  city?: string,
  state?: string
): Promise<Therapist[]> => {
  const therapists: Therapist[] = []

  try {
    // Psychology Today doesn't have a public API, but we can provide a link
    // For now, we'll return an empty array and show users how to search
    // In a production app, you would need to:
    // 1. Get an API key from Psychology Today (if available)
    // 2. Or use a web scraping service (with proper permissions)
    // 3. Or redirect users to Psychology Today's website
    
    // This is a placeholder - in production, integrate with Psychology Today's API if available
  } catch (error) {
    console.error("Error fetching from Psychology Today:", error)
  }

  return therapists
}

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
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
                city: `${data.places[0]['place name']}, ${data.places[0]['state abbreviation']}`,
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
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(searchTerm)}&format=json&limit=1&addressdetails=1`,
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
          const details = extractLocationDetails(result.address, searchTerm)
          return {
            city: details.city,
            state: details.state,
            country: details.country,
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
          const details = extractLocationDetails(result.address, searchTerm)
          return {
            city: details.city,
            state: details.state,
            country: details.country,
            zipCode: result.address?.postcode,
          }
        }
      }
    }
  } catch (error) {
    console.error("Error looking up location:", error)
  }
  
  // Return search term as city/country if lookup fails
  const fallbackDetails = extractLocationDetails(undefined, searchTerm)
  return {
    city: fallbackDetails.city,
    state: fallbackDetails.state,
    country: fallbackDetails.country,
  }
}

export default function TherapistFinder() {
  const [locationGranted, setLocationGranted] = useState(false)
  const [loadingGeo, setLoadingGeo] = useState(false)
  const [loadingTherapists, setLoadingTherapists] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Therapist[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showManualLocation, setShowManualLocation] = useState(false)
  const [manualLocation, setManualLocation] = useState({ city: "", state: "", country: "", zipCode: "" })
  const [manualError, setManualError] = useState("")

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
          const details = extractLocationDetails(address, "Your Area")
          const zipCode = address.postcode || ""
          const normalizedCity = (details.city || "").replace(/unknown|your area/gi, "").trim()
          const needsManualLocation = !details.country || !details.state || !normalizedCity

          if (needsManualLocation) {
            setManualLocation({
              city: normalizedCity,
              state: details.state || "",
              country: details.country || "",
              zipCode,
            })
            setManualError("")
            setShowManualLocation(true)
            setLoadingGeo(false)
            return
          }

          const locationQuery = zipCode || normalizedCity || details.country
          
          // Search with the found location
          if (locationQuery) {
            setQuery(locationQuery)
            
            // Fetch real registered therapists for this location
            setLoadingTherapists(true)
            try {
              const therapists = await fetchRealTherapists(
                zipCode || locationQuery,
                normalizedCity || details.city,
                details.state,
                details.country || "USA",
                lat,
                lon
              )
              setResults(therapists)
              setHasSearched(true)
            } finally {
              setLoadingTherapists(false)
            }
          } else {
            // If can't determine location, try to fetch with coordinates
            setLoadingTherapists(true)
            try {
              const therapists = await fetchRealTherapists(
                "",
                "Your Area",
                undefined,
                "USA",
                lat,
                lon
              )
              setResults(therapists)
              setHasSearched(true)
            } finally {
              setLoadingTherapists(false)
            }
          }
        } catch (error) {
          console.error("Error getting location:", error)
          setManualLocation({ city: "", state: "", country: "", zipCode: "" })
          setManualError("We couldn't determine your exact location. Please confirm it below.")
          setShowManualLocation(true)

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
    setLoadingTherapists(true)
    
    try {
      // Lookup the location (works for zip codes, cities, or countries)
      const locationInfo = await lookupLocation(searchTerm)
      
      // Use the found location or fallback to search term
      const city = locationInfo.city || searchTerm
      const state = locationInfo.state
      const country = locationInfo.country || searchTerm
      const zipCode = locationInfo.zipCode || (locationInfo.city ? "" : searchTerm) || searchTerm

      // Fetch real registered therapists for this location
      const therapists = await fetchRealTherapists(
        zipCode,
        city,
        state,
        country
      )

      setResults(therapists)
    } catch (error) {
      console.error("Error searching therapists:", error)
      // Try to fetch real therapists with the search term as location
      const therapists = await fetchRealTherapists(searchTerm, searchTerm, undefined, searchTerm)
      setResults(therapists)
    } finally {
      setLoadingTherapists(false)
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

  const handleManualSubmit = async () => {
    const city = manualLocation.city.trim()
    const country = manualLocation.country.trim()
    const state = manualLocation.state.trim()
    const zipCode = manualLocation.zipCode.trim()

    if (!city || !country) {
      setManualError("Please provide at least a city/town and country.")
      return
    }

    setManualError("")
    setLoadingTherapists(true)

    try {
      const therapists = await fetchRealTherapists(
        zipCode || city,
        city,
        state || undefined,
        country
      )

      setResults(therapists)
      setQuery(zipCode || city)
      setHasSearched(true)
      setShowManualLocation(false)
    } finally {
      setLoadingTherapists(false)
    }
  }

  const handleManualCancel = () => {
    setShowManualLocation(false)
    setManualError("")
  }

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
            <Button onClick={handleSearch} variant="default" size="sm" disabled={loadingTherapists}>
              {loadingTherapists ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
            <Button variant="secondary" size="icon" onClick={handleLocate} disabled={loadingGeo} aria-label="Locate me">
              {loadingGeo ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingTherapists && (
            <div className="col-span-full text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Searching for registered therapists...</p>
              <p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
            </div>
          )}
          {!loadingTherapists && results.map((th) => (
            <Card key={th.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{th.name}</CardTitle>
                <CardDescription>{th.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">
                  {th.distance} • {th.city}{th.state && !th.city.includes(th.state) ? `, ${th.state}` : ""} {th.zipCode}
                </p>
                <p className="text-muted-foreground">{th.country}</p>
                <p className="text-muted-foreground">{th.phone}</p>
                <Button size="sm" className="mt-2 w-full" variant="outline">
                  Contact
                </Button>
              </CardContent>
            </Card>
          ))}
          {!loadingTherapists && results.length === 0 && hasSearched && (
            <div className="col-span-full text-center py-8">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">No Registered Therapists Found</CardTitle>
                  <CardDescription>
                    We couldn't find registered therapists in our database for "{query}".
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-left space-y-4">
                  <div>
                    <p className="font-medium mb-2">To find registered therapists near you:</p>
                    <ul className="text-sm space-y-2 list-disc list-inside">
                      <li>
                        <strong>For US locations:</strong> Visit{" "}
                        <a 
                          href={`https://www.psychologytoday.com/us/therapists/${query.replace(/\s+/g, "-").toLowerCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Psychology Today's directory
                        </a>
                        {" "}or search the{" "}
                        <a 
                          href="https://npiregistry.cms.hhs.gov/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          NPI Registry
                        </a>
                      </li>
                      <li>
                        <strong>Check your insurance provider:</strong> Most insurance companies have directories of in-network mental health providers
                      </li>
                      <li>
                        <strong>Contact local mental health organizations:</strong> They often maintain directories of licensed therapists
                      </li>
                      <li>
                        <strong>State licensing boards:</strong> Each state has a licensing board website where you can verify credentials and find licensed professionals
                      </li>
                    </ul>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> This app searches the official NPI Registry for registered mental health providers in the US. 
                      For locations outside the US or if no results are found, please use the resources above.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const searchUrl = `https://www.psychologytoday.com/us/therapists/${query.replace(/\s+/g, "-").toLowerCase()}`
                      window.open(searchUrl, '_blank')
                    }}
                  >
                    Search Psychology Today
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      window.open("https://npiregistry.cms.hhs.gov/", '_blank')
                    }}
                  >
                    Open NPI Registry
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          {!loadingTherapists && !hasSearched && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Enter a zip code, city, or country to search for therapists</p>
              <p className="text-sm text-muted-foreground mt-2">Or click the location button to find therapists near you</p>
            </div>
          )}
        </CardContent>
      </Card>
      {showManualLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Confirm your location</CardTitle>
              <CardDescription>
                We weren't able to pinpoint your exact city. Please confirm the details below so we can show nearby therapists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">City / Town</label>
                  <Input
                    value={manualLocation.city}
                    onChange={(e) => setManualLocation((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g., Kingston"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Parish / State</label>
                  <Input
                    value={manualLocation.state}
                    onChange={(e) => setManualLocation((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g., Saint Andrew Parish"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    value={manualLocation.country}
                    onChange={(e) => setManualLocation((prev) => ({ ...prev, country: e.target.value }))}
                    placeholder="e.g., Jamaica"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Postal code (optional)</label>
                  <Input
                    value={manualLocation.zipCode}
                    onChange={(e) => setManualLocation((prev) => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="e.g., 00000"
                  />
                </div>
              </div>
              {manualError && <p className="text-sm text-destructive">{manualError}</p>}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleManualCancel}>
                Cancel
              </Button>
              <Button onClick={handleManualSubmit}>Use this location</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </section>
  )
}
