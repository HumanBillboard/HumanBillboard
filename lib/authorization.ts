/**
 * Authorization & Ownership Verification Utilities
 * 
 * Ensures that users can only access/modify resources they own
 * All checks are server-side to prevent unauthorized access
 */

import { auth } from "@clerk/nextjs/server"
import { createClient as createSupabaseClient } from "@/lib/supabase/server"

/**
 * Verify that the current user owns the campaign
 * Used before allowing campaign edit/delete operations
 */
export async function verifyBusinessOwnership(campaignId: string): Promise<boolean> {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.warn("Unauthorized: No authenticated user")
      return false
    }

    const supabase = await createSupabaseClient()
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("business_id")
      .eq("id", campaignId)
      .single()

    if (error) {
      console.error("Database error checking campaign ownership:", error)
      return false
    }

    const isOwner = campaign?.business_id === userId

    if (!isOwner) {
      console.warn(
        `Unauthorized: User ${userId} attempted to access campaign ${campaignId} owned by ${campaign?.business_id}`
      )
    }

    return isOwner
  } catch (error) {
    console.error("Error verifying business ownership:", error)
    return false
  }
}

/**
 * Verify that the current user is the advertiser on the application
 * Used before allowing application update/delete operations
 */
export async function verifyAdvertiserOwnership(applicationId: string): Promise<boolean> {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.warn("Unauthorized: No authenticated user")
      return false
    }

    const supabase = await createSupabaseClient()
    const { data: application, error } = await supabase
      .from("applications")
      .select("advertiser_id")
      .eq("id", applicationId)
      .single()

    if (error) {
      console.error("Database error checking application ownership:", error)
      return false
    }

    const isOwner = application?.advertiser_id === userId

    if (!isOwner) {
      console.warn(
        `Unauthorized: User ${userId} attempted to access application ${applicationId} owned by ${application?.advertiser_id}`
      )
    }

    return isOwner
  } catch (error) {
    console.error("Error verifying advertiser ownership:", error)
    return false
  }
}

/**
 * Verify that the current user is a business (not advertiser)
 * Used to restrict actions to business users only
 */
export async function verifyBusinessUser(): Promise<boolean> {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.warn("Unauthorized: No authenticated user")
      return false
    }

    const profile = await getUserProfile()

    if (profile?.user_type !== "business") {
      console.warn(`Unauthorized: User ${userId} is not a business user`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error verifying business user:", error)
    return false
  }
}

/**
 * Verify that the current user is an advertiser (not business)
 * Used to restrict actions to advertiser users only
 */
export async function verifyAdvertiserUser(): Promise<boolean> {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.warn("Unauthorized: No authenticated user")
      return false
    }

    const profile = await getUserProfile()

    if (profile?.user_type !== "advertiser") {
      console.warn(`Unauthorized: User ${userId} is not an advertiser`)
      return false
    }

    return true
  } catch (error) {
    console.error("Error verifying advertiser user:", error)
    return false
  }
}

/**
 * Get the current user's profile
 * Returns null if user is not authenticated or profile doesn't exist
 */
export async function getUserProfile() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    const supabase = await createSupabaseClient()
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return profile
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
}

/**
 * Verify that the campaign belongs to the current user
 * AND that the user can view applications to this campaign
 * Used in the applications page
 */
export async function verifyCampaignAccess(campaignId: string): Promise<boolean> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return false
    }

    const supabase = await createSupabaseClient()
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("business_id")
      .eq("id", campaignId)
      .single()

    if (error || !campaign) {
      return false
    }

    return campaign.business_id === userId
  } catch (error) {
    console.error("Error verifying campaign access:", error)
    return false
  }
}

/**
 * Check if user has permission to perform an action
 * Generic permission checker
 */
export interface PermissionContext {
  userId?: string
  resourceOwnerId?: string
  userType?: string
  requiredUserType?: "business" | "advertiser"
}

export async function checkPermission(context: PermissionContext): Promise<boolean> {
  const { userId, resourceOwnerId, userType, requiredUserType } = context

  // Check if user is authenticated
  if (!userId) {
    return false
  }

  // Check ownership
  if (resourceOwnerId && userId !== resourceOwnerId) {
    return false
  }

  // Check user type
  if (requiredUserType && userType !== requiredUserType) {
    return false
  }

  return true
}
