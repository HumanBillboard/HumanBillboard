import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the origin from the request (works on localhost and Vercel)
    const origin = request.headers.get("origin") || 
      (request.headers.get("x-forwarded-proto") === "https" 
        ? `https://${request.headers.get("host")}`
        : `http://${request.headers.get("host")}`)

    // Create response that redirects to login
    const response = NextResponse.redirect(new URL("/auth/login", origin))
    
    // Clear ALL Clerk-related cookies
    const cookiesToClear = [
      "__session",
      "__clerk_db_jwt",
      "__clerk_device_activity_created_at",
      "__clerk_token_cache",
      "__clerk_cache",
      "clerk_user_id",
      "clerk_session_id",
    ]
    
    cookiesToClear.forEach(cookie => {
      response.cookies.delete(cookie)
      // Also set with empty value and max-age 0 to ensure deletion
      response.cookies.set(cookie, "", { maxAge: 0 })
    })
    
    return response
  } catch (error) {
    console.error("Error during logout:", error)
    
    const origin = request.headers.get("origin") || 
      (request.headers.get("x-forwarded-proto") === "https" 
        ? `https://${request.headers.get("host")}`
        : `http://${request.headers.get("host")}`)
    
    const response = NextResponse.redirect(new URL("/auth/login", origin))
    response.cookies.delete("__session")
    response.cookies.delete("__clerk_db_jwt")
    
    return response
  }
}
