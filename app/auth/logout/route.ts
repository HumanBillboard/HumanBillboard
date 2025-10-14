import { auth } from "@clerk/nextjs/server" // check authentication status
import { NextResponse } from "next/server" // send HTTP responses in Next.js middleware routes

export async function POST() {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
  }

  // Clerk handles the sign out through the client-side
  // This route is kept for compatibility but redirects to home
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
