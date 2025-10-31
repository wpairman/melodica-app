// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'

import type { Metadata } from "next"
import Link from "next/link"
import { Heart, ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Privacy Policy | Melodica - Mental Wellness Companion",
  description: "Learn how Melodica protects your privacy and handles your mental health data securely.",
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-gray-900 border-gray-700">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <Heart className="h-6 w-6 text-rose-500" />
          <span>Melodica</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 text-white">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4 text-white">
            Register
          </Link>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-teal-400 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <Card className="border-none shadow-lg bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-teal-400" />
              <CardTitle className="text-3xl font-bold text-center text-white">Privacy Policy</CardTitle>
            </div>
            <p className="text-center text-gray-400 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6 text-sm leading-relaxed text-gray-300">
              <p className="text-base">
                At Melodica, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                mental wellness application.
              </p>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  1. Information We Collect
                </h2>
                <div className="space-y-3 pl-7">
                  <div>
                    <h3 className="font-semibold text-white">Personal Information</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                      <li>Name and email address (for account creation and login)</li>
                      <li>Demographic information (age, gender) - optional</li>
                      <li>Profile information and preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Health and Wellness Data</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                      <li>Mood tracking entries and timestamps</li>
                      <li>Journal entries and reflections</li>
                      <li>Period tracking data (if applicable)</li>
                      <li>Activity preferences and recommendations</li>
                      <li>Music preferences and quiz responses</li>
                      <li>Calendar events and notifications</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Device and Usage Information</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                      <li>Device type and operating system</li>
                      <li>App usage patterns and features accessed</li>
                      <li>Location data (with your explicit permission, for weather features)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  2. How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Provide personalized mood tracking and wellness recommendations</li>
                  <li>Generate insights and analytics about your mental health patterns</li>
                  <li>Send notifications and reminders for mood check-ins and activities</li>
                  <li>Improve our services and develop new features</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Comply with legal obligations and protect our rights</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  3. Data Security
                </h2>
                <p>
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-2">
                  <li>All data is stored locally on your device using encrypted storage</li>
                  <li>We use secure authentication methods for account access</li>
                  <li>Your sensitive health data is never shared with third parties without your explicit consent</li>
                  <li>We regularly update our security practices to address emerging threats</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  4. Data Storage and Retention
                </h2>
                <p>
                  Currently, your data is stored locally on your device. This means:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-2">
                  <li>Your data remains on your device and is not transmitted to our servers</li>
                  <li>You have full control over your data and can delete it at any time</li>
                  <li>We recommend regularly backing up your device to preserve your data</li>
                  <li>If you delete the app, your local data will be removed</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-2">
                  <li>Access and view all your stored data</li>
                  <li>Export your data (mood history and journal entries)</li>
                  <li>Delete your account and all associated data</li>
                  <li>Clear saved credentials and login information</li>
                  <li>Opt-out of notifications and data collection features</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white">6. Third-Party Services</h2>
                <p>
                  We may integrate with third-party services for enhanced functionality:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-2">
                  <li><strong>Weather Services:</strong> Open-Meteo API for weather data (location-based)</li>
                  <li><strong>Payment Processing:</strong> Stripe for subscription payments</li>
                  <li><strong>Music Services:</strong> Optional integration with Spotify or Apple Music (requires your explicit permission)</li>
                </ul>
                <p className="mt-3">
                  These services have their own privacy policies, and we encourage you to review them.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white">7. Children's Privacy</h2>
                <p>
                  Melodica is not intended for users under the age of 18. We do not knowingly collect 
                  personal information from children. If you believe we have inadvertently collected 
                  information from a child, please contact us immediately.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white">8. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any 
                  material changes by posting the new Privacy Policy on this page and updating the 
                  "Last updated" date.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-white">9. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-none space-y-1 text-gray-300 ml-4 mt-2">
                  <li>Email: privacy@melodica.com</li>
                  <li>Company: For Everyone Group LLC</li>
                </ul>
              </div>

              <div className="bg-teal-900/20 border border-teal-800 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-white mb-2">Your Privacy Matters</h3>
                <p className="text-gray-300">
                  We are committed to protecting your mental health data and ensuring your privacy. 
                  All data collection is transparent, and you maintain full control over your information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-700 bg-gray-900">
        <p className="text-xs text-gray-400">© 2024 Melodica. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-white" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-white" href="/privacy">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

