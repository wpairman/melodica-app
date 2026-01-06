"use client"

import { useState, useEffect } from "react"

export default function ViewEmailsPage() {
  const [emails, setEmails] = useState<Array<{email: string, name: string, emailVerified: boolean}>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const allUsersStr = localStorage.getItem("allUsers")
        
        if (!allUsersStr) {
          setLoading(false)
          return
        }

        const allUsers = JSON.parse(allUsersStr)
        
        if (Array.isArray(allUsers) && allUsers.length > 0) {
          const emailsList = allUsers.map((user: any) => ({
            email: user.email || 'N/A',
            name: user.name || 'N/A',
            emailVerified: user.emailVerified || false
          }))
          setEmails(emailsList)
        }
      } catch (error) {
        console.error("Error reading localStorage:", error)
      } finally {
        setLoading(false)
      }
    }
  }, [])

  const copyAllEmails = () => {
    const emailList = emails.map(u => u.email).join(", ")
    navigator.clipboard.writeText(emailList)
    alert(`Copied ${emails.length} emails to clipboard!`)
  }

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <p>Loading emails...</p>
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>No Emails Found</h1>
        <p>No users found in localStorage.</p>
        <p>Make sure you are logged in or have registered users on this device.</p>
      </div>
    )
  }

  const verifiedCount = emails.filter(u => u.emailVerified).length
  const unverifiedCount = emails.length - verifiedCount

  return (
    <div style={{ padding: "50px", maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1>📧 Registered Emails</h1>
      <div style={{ marginBottom: "20px" }}>
        <p><strong>Total:</strong> {emails.length} users</p>
        <p><strong>Verified:</strong> {verifiedCount} | <strong>Unverified:</strong> {unverifiedCount}</p>
        <button 
          onClick={copyAllEmails}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          Copy All Emails
        </button>
      </div>
      
      <div style={{ backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
        <h2>Email List:</h2>
        <ol style={{ lineHeight: "2" }}>
          {emails.map((user, index) => (
            <li key={index}>
              <strong>{user.email}</strong>
              {user.name !== 'N/A' && ` (${user.name})`}
              {user.emailVerified ? ' ✅ Verified' : ' ⏳ Unverified'}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ marginTop: "30px", backgroundColor: "#e9ecef", padding: "15px", borderRadius: "4px" }}>
        <h3>Email addresses only:</h3>
        <div style={{ fontFamily: "monospace", fontSize: "14px" }}>
          {emails.map(u => u.email).join(", ")}
        </div>
      </div>
    </div>
  )
}

