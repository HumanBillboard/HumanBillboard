import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { userId, sessionId } = await auth()
    
    if (!userId || !sessionId) {
      return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
    }

    // Revoke the session to properly log out the user
    const client = await clerkClient()
    await client.sessions.revokeSession(sessionId)
  } catch (error) {
    console.error("Error during logout:", error)
    // Continue to redirect even if revocation fails
  }

  // Redirect to login page where user can sign in with different account
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
