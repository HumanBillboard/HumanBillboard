"use client"

import type React from "react"
import { useProfileForm } from "@/hooks/use-profile-form"
import { updateAdvertiserProfile } from "@/lib/profile/profile-service"
import { advertiserProfileSchema } from "@/lib/validation"
import type { UserProfile } from "@/lib/types"
import {
  ProfileViewMode,
  ProfileEditMode,
  ProfileDisplayField,
  ProfileFormField,
} from "@/components/profile-form-components"

/**
 * AdvertiserProfileForm - Refactored influencer profile editor
 * Uses composition, dependency injection, and reusable hooks
 * SOLID principles:
 * - Single Responsibility: Only handles advertiser-specific UI
 * - Open/Closed: Extensible via ProfileViewMode/ProfileEditMode components
 * - Liskov Substitution: Interchangeable with BusinessProfileForm
 * - Interface Segregation: Uses focused ProfileFormField components
 * - Dependency Inversion: Uses injected updateAdvertiserProfile service
 */
interface AdvertiserProfileFormProps {
  profile: UserProfile
  isEditing: boolean
  onEditToggle: () => void
}

export default function AdvertiserProfileForm({
  profile,
  isEditing,
  onEditToggle,
}: AdvertiserProfileFormProps) {
  const initialData = {
    full_name: profile.full_name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    city: profile.city || "",
    state: profile.state || "",
  }

  const { formData, setFormData, isLoading, error, handleSubmit } =
    useProfileForm(
      initialData,
      async (data) => {
        await updateAdvertiserProfile(profile.id, data)
        onEditToggle()
      },
      advertiserProfileSchema
    )

  if (!isEditing) {
    return (
      <ProfileViewMode onEditClick={onEditToggle}>
        <ProfileDisplayField label="FULL NAME" value={profile.full_name} />
        <ProfileDisplayField label="EMAIL" value={profile.email} />
        <ProfileDisplayField label="PHONE" value={profile.phone} />
        <div className="grid grid-cols-2 gap-4">
          <ProfileDisplayField label="CITY" value={profile.city} colSpan />
          <ProfileDisplayField label="STATE" value={profile.state} colSpan />
        </div>
      </ProfileViewMode>
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e)
  }

  return (
    <ProfileEditMode isLoading={isLoading} error={error} onCancel={onEditToggle}>
      <form onSubmit={handleFormSubmit} className="contents">
        <div className="grid grid-cols-1 gap-4">
          <ProfileFormField
            id="full_name"
            label="Full Name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(value) =>
              setFormData({ ...formData, full_name: value })
            }
            maxLength={100}
          />

          <ProfileFormField
            id="email"
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
          />

          <ProfileFormField
            id="phone"
            label="Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <ProfileFormField
              id="city"
              label="City"
              placeholder="San Francisco"
              value={formData.city}
              onChange={(value) => setFormData({ ...formData, city: value })}
              maxLength={100}
              colSpan
            />

            <ProfileFormField
              id="state"
              label="State"
              placeholder="CA"
              value={formData.state}
              onChange={(value) =>
                setFormData({ ...formData, state: value.toUpperCase() })
              }
              maxLength={2}
              colSpan
            />
          </div>
        </div>

        <button type="submit" className="hidden" />
      </form>
    </ProfileEditMode>
  )
}
