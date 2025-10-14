import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/client"

export default async function AuthRedirectPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = createClient()
  
  // Check if user has a profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("id", userId)
    .single()

  // If no profile exists, send to onboarding
  if (!profile) {
    redirect("/auth/onboarding")
  }

  // Redirect based on user type
  if (profile.user_type === "business") {
    redirect("/business/dashboard")
  } else {
    redirect("/advertiser/dashboard")
  }
}
