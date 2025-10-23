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
  phone: string
}

const MOCK_THERAPISTS: Therapist[] = [
  {
    id: 1,
    name: "Dr. Maya Johnson, PsyD",
    specialty: "Anxiety - CBT / Mindfulness",
    distance: "1.2 mi",
    city: "Your City",
    phone: "555-432-1122",
  },
  {
    id: 2,
    name: "Carlos Ramirez, LCSW",
    specialty: "Depression • Trauma-Informed",
    distance: "2.5 mi",
    city: "Your City",
    phone: "555-987-2233",
  },
  {
    id: 3,
    name: "Priya Patel, LMFT",
    specialty: "Couples • Family Systems",
    distance: "4.1 mi",
    city: "Your City",
    phone: "555-318-4455",
  },
]

export default function TherapistFinder() {
  const [locationGranted, setLocationGranted] = useState(false)
  const [loadingGeo, setLoadingGeo] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Therapist[]>(MOCK_THERAPISTS)

  // Ask for location and (in real app) fetch therapists by coords
  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLoadingGeo(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationGranted(true)
        // TODO: call real API with pos.coords.latitude / longitude
        setLoadingGeo(false)
      },
      () => {
        setLoadingGeo(false)
      },
    )
  }

  // Simple name/city filter for mock data
  useEffect(() => {
    if (!query) {
      setResults(MOCK_THERAPISTS)
      return
    }
    const q = query.toLowerCase()
    setResults(MOCK_THERAPISTS.filter((t) => t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q)))
  }, [query])

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-xl">Find a Therapist Near You</CardTitle>
            <CardDescription>
              Search by city/ZIP or use your current location. Only providers within 25 mi are shown.
            </CardDescription>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Input
              placeholder="City or ZIP"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-40 sm:w-52"
            />
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
                <p>
                  {th.distance} • {th.city}
                </p>
                <p className="text-muted-foreground">{th.phone}</p>
                <Button size="sm" className="mt-2 w-full" variant="outline">
                  Contact
                </Button>
              </CardContent>
            </Card>
          ))}
          {results.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">No therapists found for that area.</p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
