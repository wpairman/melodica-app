import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"

export default function DashboardNavButton() {
  return (
    <Link href="/music-preferences">
      <Button variant="outline" className="w-full justify-start mt-4">
        <Music className="mr-2 h-4 w-4" />
        Music Preferences Quiz
      </Button>
    </Link>
  )
}
