"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ProfileAvatar } from "@/components/profile-avatar"
import { uploadProfilePicture, deleteProfilePicture } from "@/lib/profile/image-upload-service"
import type { UserProfile } from "@/lib/types"

interface ProfilePictureUploadProps {
  profile: UserProfile
  isEditing: boolean
}

/**
 * ProfilePictureUpload - Avatar upload and preview component
 * Implements:
 * - File input with validation
 * - Preview before upload
 * - Delete functionality
 * - Loading states
 */
export function ProfilePictureUpload({
  profile,
  isEditing,
}: ProfilePictureUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // Get initials for fallback
  const getInitials = () => {
    if (profile.user_type === "advertiser") {
      return profile.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    } else {
      return profile.company_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "B"
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed")
      return
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be smaller than 5MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0] || !preview) {
      setError("Please select an image first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const file = fileInputRef.current.files[0]
      await uploadProfilePicture(file)

      // Clear preview and input
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Refresh page data
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!profile.profile_picture_url) return

    setIsLoading(true)
    setError(null)

    try {
      await deleteProfilePicture()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setError(null)
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ProfileAvatar
          src={profile.profile_picture_url}
          alt={profile.user_type === "advertiser" ? profile.full_name || "User" : profile.company_name || "Business"}
          fallback={getInitials()}
          size="lg"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview or Current Picture */}
      <ProfileAvatar
        src={preview || profile.profile_picture_url}
        alt={profile.user_type === "advertiser" ? profile.full_name || "User" : profile.company_name || "Business"}
        fallback={getInitials()}
        size="lg"
      />

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
          style={{ borderRadius: "5px" }}
          disabled={isLoading}
        >
          {preview ? "Change" : "Upload"} Picture
        </Button>

        {preview && (
          <>
            <Button
              onClick={handleUpload}
              className="bg-green-600 text-white hover:bg-green-700"
              style={{ borderRadius: "5px" }}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Confirm"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-[#D9D9D9]/20 text-[#D9D9D9] hover:bg-[#D9D9D9]/10"
              style={{ borderRadius: "5px" }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </>
        )}

        {!preview && profile.profile_picture_url && (
          <Button
            onClick={handleDelete}
            variant="outline"
            className="border-red-500/20 text-red-500 hover:bg-red-500/10"
            style={{ borderRadius: "5px" }}
            disabled={isLoading}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
