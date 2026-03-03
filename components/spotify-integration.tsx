"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserPlan, hasFeatureAccess } from "@/lib/plan-features"
import { UpgradePrompt } from "@/components/upgrade-prompt"

export default function SpotifyIntegration() {
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [userPlan, setUserPlan] = useState<string>("free")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = getUserPlan()
      setUserPlan(plan)
      
      // Check if Spotify is already connected
      const spotifyToken = localStorage.getItem("spotifyAccessToken")
      const spotifyData = localStorage.getItem("spotifyProfile")
      
      if (spotifyToken) {
        setIsConnected(true)
        if (spotifyData) {
          try {
            setSpotifyProfile(JSON.parse(spotifyData))
          } catch (e) {
            console.error("Error parsing Spotify profile:", e)
          }
        }
      }
    }
  }, [])

  const handleConnectSpotify = async () => {
    // Check if user has Ultimate plan
    if (!hasFeatureAccess(userPlan as any, "fullSpotifyIntegration")) {
      setShowUpgrade(true)
      return
    }

    setIsConnecting(true)
    
    try {
      // In a real implementation, this would redirect to Spotify OAuth
      // For now, we'll simulate the connection
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "your-spotify-client-id"
      const redirectUri = `${window.location.origin}/dashboard/settings`
      const scopes = "user-read-private user-read-email user-library-read playlist-read-private playlist-modify-public playlist-modify-private user-top-read"
      
      // Spotify OAuth URL
      const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `show_dialog=true`
      
      // For demo purposes, we'll simulate a successful connection
      // In production, you'd redirect to authUrl and handle the callback
      setTimeout(() => {
        const mockProfile = {
          id: "spotify_user_123",
          display_name: "Spotify User",
          email: "user@example.com",
          images: [{ url: "https://via.placeholder.com/150" }],
          product: "premium"
        }
        
        localStorage.setItem("spotifyAccessToken", "mock_token_" + Date.now())
        localStorage.setItem("spotifyProfile", JSON.stringify(mockProfile))
        setIsConnected(true)
        setSpotifyProfile(mockProfile)
        setIsConnecting(false)
        
        toast({
          title: "Spotify Connected!",
          description: "Your Spotify account has been successfully connected.",
        })
      }, 1500)
      
      // In production, uncomment this:
      // window.location.href = authUrl
      
    } catch (error) {
      console.error("Error connecting to Spotify:", error)
      setIsConnecting(false)
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Spotify. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnectSpotify = () => {
    localStorage.removeItem("spotifyAccessToken")
    localStorage.removeItem("spotifyProfile")
    localStorage.removeItem("spotifyRefreshToken")
    setIsConnected(false)
    setSpotifyProfile(null)
    
    toast({
      title: "Spotify Disconnected",
      description: "Your Spotify account has been disconnected.",
    })
  }

  if (!hasFeatureAccess(userPlan as any, "fullSpotifyIntegration")) {
    return (
      <>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-5 w-5 text-green-500" />
              Spotify Integration
            </CardTitle>
            <CardDescription className="text-gray-300">
              Connect your Spotify account for seamless music playback and playlist management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300 mb-4">
                  With full Spotify integration, you can:
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Play full songs directly in the app
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Create and manage unlimited playlists
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Sync your mood-based playlists to Spotify
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Access your Spotify library and saved songs
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => setShowUpgrade(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Upgrade to Ultimate for Spotify Integration
              </Button>
            </div>
          </CardContent>
        </Card>
        {showUpgrade && (
          <UpgradePrompt
            feature="Full Spotify Integration"
            requiredPlan="ultimate"
            currentPlan={userPlan as any}
            onClose={() => setShowUpgrade(false)}
          />
        )}
      </>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="h-5 w-5 text-green-500" />
          Spotify Integration
        </CardTitle>
        <CardDescription className="text-gray-300">
          Connect your Spotify account for seamless music playback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && spotifyProfile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                {spotifyProfile.images?.[0] && (
                  <img
                    src={spotifyProfile.images[0].url}
                    alt={spotifyProfile.display_name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="text-white font-medium">{spotifyProfile.display_name}</p>
                  <p className="text-sm text-gray-400">{spotifyProfile.email}</p>
                  <Badge className="mt-1 bg-green-600 text-white">
                    {spotifyProfile.product === "premium" ? "Premium" : "Free"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-500">Connected</span>
              </div>
            </div>
            <Button
              onClick={handleDisconnectSpotify}
              variant="outline"
              className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Disconnect Spotify
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-300 mb-4">
                Connect your Spotify account to unlock:
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Play full songs directly in the app
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Create unlimited personalized playlists
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Sync mood-based playlists to Spotify
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Access your Spotify library
                </li>
              </ul>
            </div>
            <Button
              onClick={handleConnectSpotify}
              disabled={isConnecting}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Music className="h-4 w-4 mr-2" />
                  Connect Spotify Account
                </>
              )}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              You'll be redirected to Spotify to authorize the connection
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



