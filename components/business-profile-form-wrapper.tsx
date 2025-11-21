"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import BusinessProfileForm from "@/components/business-profile-form"
import type { UserProfile } from "@/lib/types"

interface ProfileFormWrapperProps {
  profile: UserProfile
}

export default function BusinessProfileFormWrapper({ profile }: ProfileFormWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className={`${
            isEditing
              ? "border-[#D9D9D9]/20 text-[#D9D9D9] hover:bg-[#D9D9D9]/10 bg-transparent"
              : "bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
          }`}
          style={{ borderRadius: "5px" }}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>
      <BusinessProfileForm profile={profile} isEditing={isEditing} onEditToggle={() => setIsEditing(!isEditing)} />
    </div>
  )
}
