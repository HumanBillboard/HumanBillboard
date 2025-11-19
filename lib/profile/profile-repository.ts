"use server"

import { createClient } from "@/lib/supabase/server"
import type { UserProfile } from "@/lib/types"

/**
 * ProfileRepository - Data access layer for profile operations
 * Implements Repository pattern to abstract database interactions
 * Dependency Inversion: Components depend on interface, not database
 * Single Responsibility: Only handles database operations
 */
export async function getProfile(userId: string): Promise<UserProfile> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw new Error(`Failed to fetch profile: ${error.message}`)
  if (!data) throw new Error("Profile not found")

  return data as UserProfile
}

/**
 * Update user profile
 * @throws Error if update fails
 * Applies validation schema on client-side before calling
 */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)

  if (error) throw new Error(`Failed to update profile: ${error.message}`)
}
