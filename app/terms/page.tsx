// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'

import Link from "next/link"
import { Heart, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Heart className="h-6 w-6 text-rose-500" />
          <span>Melodica</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4">
            Register
          </Link>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/register" className="inline-flex items-center text-sm text-teal-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Registration
          </Link>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">Terms and Conditions and Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              <p>
                Welcome to Melodica, a mobile application owned and operated by For Everyone Group LLC. Please read
                these Terms and Conditions and Privacy Policy ("Agreement") carefully before using the app. By accessing
                or using Melodica, you agree to be bound by this Agreement.
              </p>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">1. Eligibility</h2>
                <p>
                  You must be 18 years or older to use Melodica. By using the app, you confirm that you meet this
                  requirement.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">2. Health Disclaimer</h2>
                <p>
                  Melodica provides music recommendations and mood tracking tools intended to support general emotional
                  wellness. It is not a substitute for professional mental health treatment, medical advice, or therapy.
                </p>
                <p className="mt-2">
                  If you are experiencing emotional distress or a medical emergency, please consult a licensed health
                  professional or contact emergency services immediately.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">3. Use at Your Own Risk</h2>
                <p>By using Melodica, you acknowledge and agree that:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>The app is provided "as is" and "as available" without warranties of any kind.</li>
                  <li>You use Melodica entirely at your own risk.</li>
                  <li>
                    For Everyone Group LLC, William Pairman, Melodica, and all associated parties are not liable for any
                    damages, losses, or consequences resulting from your use or inability to use the app.
                  </li>
                </ul>
                <p className="mt-3">This includes, but is not limited to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Personal injury or emotional distress</li>
                  <li>Misinterpretation of app recommendations</li>
                  <li>Mental health deterioration</li>
                  <li>Technical issues, data loss, or service interruptions</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">4. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, you agree to hold harmless and indemnify Melodica, For
                  Everyone Group LLC, its officers, employees, contractors, and owners from any claims, damages, or
                  liabilities arising from your use of the app.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">5. Subscriptions and Payments</h2>
                <p>
                  Melodica offers a two-week free trial, after which continued access requires a paid subscription.
                  Payment details will be provided in-app. All payments are final and non-refundable, except where
                  required by law.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">6. Modifications</h2>
                <p>
                  We reserve the right to modify or update the app, its features, and this Agreement at any time. You
                  will be notified of major changes. Continued use of the app signifies your acceptance of any updates.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">7. Termination</h2>
                <p>
                  We may suspend or terminate your access to the app at any time for violations of this Agreement or at
                  our sole discretion.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">8. Governing Law</h2>
                <p>
                  This Agreement is governed by the laws of the State of Florida, USA. Any legal disputes must be filed
                  in the courts of Palm Beach County, Florida.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">9. Privacy Policy</h2>
                <p>We take your privacy seriously. This section explains how we collect, use, and protect your data.</p>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">a. Data Collection</h3>
                  <p>Melodica may collect the following data:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Basic account information (email, username)</li>
                    <li>Mood input data and interaction logs</li>
                    <li>Device type and usage statistics</li>
                  </ul>
                  <p className="mt-2">
                    We do not collect sensitive personal health data unless you explicitly provide it.
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">b. Use of Data</h3>
                  <p>We use your data to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Personalize your experience and mood-based recommendations</li>
                    <li>Monitor app performance and improve features</li>
                    <li>Communicate updates and offers (with your consent)</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">c. Sharing of Data</h3>
                  <p>
                    We do not sell or rent your personal information. We may share data with third-party service
                    providers (e.g., analytics or hosting platforms) strictly for operational purposes, and only under
                    confidentiality agreements.
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">d. Data Security</h3>
                  <p>
                    We implement reasonable administrative, technical, and physical safeguards to protect your data.
                    However, no method of transmission or storage is completely secure.
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">e. Data Retention</h3>
                  <p>
                    We retain your information only as long as necessary to provide the service, comply with legal
                    obligations, or enforce our rights.
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">f. Your Rights</h3>
                  <p>
                    You may request to access, update, or delete your personal information by contacting
                    support@melodicaapp.com. We will respond within a reasonable timeframe.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">10. Contact Us</h2>
                <p>For any questions or concerns regarding this Agreement, please contact:</p>
                <div className="mt-3 bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Melodica Support</p>
                  <p>📧 Email: support@melodicaapp.com</p>
                  <p>📍 For Everyone Group LLC – Florida, USA</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2025 Melodica. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="/terms" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
