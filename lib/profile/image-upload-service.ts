"use server"

import { auth } from "@clerk/nextjs/server"
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"

// Use server-only service role client for storage and DB updates under RLS
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is not set — image upload will fail when RLS is enabled")
}

/**
 * ImageUploadService - Server-side image upload handler
 * Implements secure file upload with validation
 * - Validates file type and size
 * - Uses Supabase storage for persistence
 * - Updates user profile with new picture URL
 */

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB

// Correct bucket name (underscore). Keep consistent across uploads/deletes.
const BUCKET = "profile_pictures"

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
    throw new Error("File is too large. Maximum size is 8MB.")
  }

  try {
    // Use service-role client so this server code can update the DB even with RLS
    const supabase = createSupabaseJsClient(SUPABASE_URL, SERVICE_ROLE_KEY!)

    // Create unique file name and path (store path without bucket)
    const safeName = file.name.replace(/\s+/g, "-")
    const filePath = `${userId}/${Date.now()}-${safeName}`

    // Upload file to Supabase storage (bucket name has underscore)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file as unknown as File, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Try to create a signed URL (works for private buckets). If bucket is public,
    // you can still rely on getPublicUrl, but signed URL is safer.
    const { data: signedData, error: signedErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60 * 60) // 1 hour

    if (signedErr || !signedData) {
      // Fallback to public URL if signed URL creation fails
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
      if (!pub) throw new Error("Failed to get file URL")

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ profile_picture_url: pub.publicUrl })
        .eq("id", userId)

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }

      return { url: pub.publicUrl }
    }

    // Update profile with the storage path (or signed URL). Storing the path makes
    // it easier to rotate or recreate signed URLs later; we store the path here for
    // compatibility with existing code by writing the signed URL into profile_picture_url.
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ profile_picture_url: signedData.signedUrl })
      .eq("id", userId)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    return { url: signedData.signedUrl }
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
    const supabase = createSupabaseJsClient(SUPABASE_URL, SERVICE_ROLE_KEY!)

    // Get current user profile to find picture URL
    const { data: profile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("profile_picture_url")
      .eq("id", userId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch profile: ${fetchError.message}`)
    }

    // Delete from storage if URL/path exists
    if (profile?.profile_picture_url) {
      let filePath: string | null = null

      try {
        const val = profile.profile_picture_url

        if (val.startsWith("http")) {
          // Supabase public/signed URL patterns include:
          // /storage/v1/object/public/{bucket}/{path}
          // /storage/v1/object/sign/{bucket}/{path}
          const publicMarker = `/storage/v1/object/public/${BUCKET}/`
          const signMarker = `/storage/v1/object/sign/${BUCKET}/`

          const idxPub = val.indexOf(publicMarker)
          const idxSign = val.indexOf(signMarker)

          if (idxPub !== -1) {
            filePath = val.substring(idxPub + publicMarker.length)
          } else if (idxSign !== -1) {
            filePath = val.substring(idxSign + signMarker.length).split("?")[0]
          } else {
            // Last resort: try to take everything after the bucket name
            const parts = val.split(`/${BUCKET}/`)
            if (parts.length > 1) filePath = parts[1].split("?")[0]
          }
        } else {
          // If stored value is already the path
          filePath = val
        }
      } catch (e) {
        console.warn("Could not parse profile picture URL for deletion", e)
      }

      if (filePath) {
        const { error: deleteError } = await supabase.storage.from(BUCKET).remove([filePath])

        if (deleteError) {
          console.error("Storage deletion failed:", deleteError)
          // Continue with database update even if storage deletion fails
        }
      }
    }

    // Update profile to remove picture URL
    const { error: updateError } = await supabase.from("user_profiles").update({ profile_picture_url: null }).eq("id", userId)

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred during deletion")
  }
}
