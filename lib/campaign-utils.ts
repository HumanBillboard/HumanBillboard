/**
 * Campaign Management Utilities
 * 
 * Helpers for managing campaign creation limits and other business logic
 */

import { createClient as createSupabaseClient } from "@/lib/supabase/server"

/**
 * Configuration for business constraints
 */
export const BUSINESS_CONSTRAINTS = {
  // Maximum number of active campaigns per business
  MAX_ACTIVE_CAMPAIGNS: 20,
  // Maximum total campaigns (including paused/closed)
  MAX_TOTAL_CAMPAIGNS: 50,
  // Maximum duration for a campaign (in hours)
  MAX_CAMPAIGN_DURATION: 168, // 1 week
}

/**
 * Check if a business has reached the maximum number of active campaigns
 * @returns {Promise<boolean>} true if the business can create more campaigns
 */
export async function canCreateCampaign(businessId: string): Promise<boolean> {
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
    return activeCampaigns < BUSINESS_CONSTRAINTS.MAX_ACTIVE_CAMPAIGNS
  } catch (error) {
    console.error("Error in canCreateCampaign:", error)
    return true // Fail open
  }
}

/**
 * Get the number of active campaigns for a business
 * @returns {Promise<number>} Number of active campaigns
 */
export async function getActiveCampaignCount(businessId: string): Promise<number> {
  try {
    const supabase = await createSupabaseClient()

    const { count, error } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "active")

    if (error) {
      console.error("Error fetching campaign count:", error)
      return 0
    }

    return count ?? 0
  } catch (error) {
    console.error("Error in getActiveCampaignCount:", error)
    return 0
  }
}

/**
 * Get detailed campaign limit status for a business
 */
export async function getCampaignLimitStatus(businessId: string) {
  try {
    const supabase = await createSupabaseClient()

    const { count: activeCount, error: activeError } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "active")

    const { count: totalCount, error: totalError } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)

    if (activeError || totalError) {
      throw new Error("Error fetching campaign counts")
    }

    const active = activeCount ?? 0
    const total = totalCount ?? 0
    const canCreate = active < BUSINESS_CONSTRAINTS.MAX_ACTIVE_CAMPAIGNS

    return {
      activeCampaigns: active,
      totalCampaigns: total,
      maxActive: BUSINESS_CONSTRAINTS.MAX_ACTIVE_CAMPAIGNS,
      maxTotal: BUSINESS_CONSTRAINTS.MAX_TOTAL_CAMPAIGNS,
      canCreate,
      remainingActive: Math.max(0, BUSINESS_CONSTRAINTS.MAX_ACTIVE_CAMPAIGNS - active),
    }
  } catch (error) {
    console.error("Error in getCampaignLimitStatus:", error)
    return {
      activeCampaigns: 0,
      totalCampaigns: 0,
      maxActive: BUSINESS_CONSTRAINTS.MAX_ACTIVE_CAMPAIGNS,
      maxTotal: BUSINESS_CONSTRAINTS.MAX_TOTAL_CAMPAIGNS,
      canCreate: false,
      remainingActive: BUSINESS_CONSTRAINTS.MAX_ACTIVE_CAMPAIGNS,
      error: "Unable to fetch campaign limit status",
    }
  }
}

/**
 * Validate campaign data for security constraints
 */
export function validateCampaignConstraints(campaignData: {
  compensation_amount?: number
  duration_hours?: number | null
}) {
  const errors: string[] = []

  if (campaignData.compensation_amount && campaignData.compensation_amount > 10000) {
    errors.push("Compensation amount exceeds maximum allowed ($10,000)")
  }

  if (
    campaignData.duration_hours &&
    campaignData.duration_hours > BUSINESS_CONSTRAINTS.MAX_CAMPAIGN_DURATION
  ) {
    errors.push(`Duration cannot exceed ${BUSINESS_CONSTRAINTS.MAX_CAMPAIGN_DURATION} hours`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
