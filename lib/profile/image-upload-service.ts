"use server"

import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

/**
 * ImageUploadService - Server-side image upload handler
 * Implements secure file upload with validation
 * - Validates file type and size
 * - Uses Supabase storage for persistence
 * - Updates user profile with new picture URL
 */

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB (leaving buffer below 10MB server limit)

/**
 * Upload profile picture
 * @throws Error if validation fails or upload fails
 */
export async function uploadProfilePicture(
  file: File
): Promise<{ url: string }> {
  // Authenticate user
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.")
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum size is 5MB.")
  }

  try {
    const supabase = await createClient()

    // Create unique file name
    const fileName = `${userId}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    const filePath = `profile-pictures/${fileName}`

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath)

    if (!data) {
      throw new Error("Failed to get public URL")
    }

    // Update user profile with picture URL
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ profile_picture_url: data.publicUrl })
      .eq("id", userId)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    return { url: data.publicUrl }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred during upload")
  }
}

/**
 * Delete profile picture
 * @throws Error if delete fails
 */
export async function deleteProfilePicture(): Promise<void> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  try {
    const supabase = await createClient()

    // Get current user profile to find picture URL
    const { data: profile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("profile_picture_url")
      .eq("id", userId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch profile: ${fetchError.message}`)
    }

    // Delete from storage if URL exists
    if (profile?.profile_picture_url) {
      // Extract file path from URL
      const url = new URL(profile.profile_picture_url)
      const filePath = url.pathname.split("/").pop()

      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from("profile-pictures")
          .remove([`profile-pictures/${filePath}`])

        if (deleteError) {
          console.error("Storage deletion failed:", deleteError)
          // Continue with database update even if storage deletion fails
        }
      }
    }

    // Update profile to remove picture URL
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ profile_picture_url: null })
      .eq("id", userId)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred during deletion")
  }
}
