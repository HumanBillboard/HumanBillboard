"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"

/**
 * Server action to check if business can create a campaign
 * Must be "use server" since it uses server-side Supabase client
 */
export async function checkCampaignLimit(businessId: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient()

    const { count, error } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "active")

    if (error) {
      console.error("Error checking campaign count:", error)
      return true // Fail open: allow creation if check fails
    }

    const activeCampaigns = count ?? 0
    return activeCampaigns < 20 // Allow max 20 active campaigns
  } catch (error) {
    console.error("Error in checkCampaignLimit:", error)
    return true // Fail open
  }
}
