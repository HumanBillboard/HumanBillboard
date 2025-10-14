import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/client" // used to create supabase client to query database

// Fetches the user profile from Supabase based on the authenticated user's ID
export async function getUserProfile() {
  const { userId } = await auth()
  
  if (!userId) { // if not authenticated, return null
    return null
  }

  const supabase = createClient() // create Supabase client
  const { data: profile, error } = await supabase // query the user_profiles table
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return profile
}
