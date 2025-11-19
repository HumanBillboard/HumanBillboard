"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { advertiserProfileSchema } from "@/lib/validation"
import type { UserProfile } from "@/lib/types"

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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    city: profile.city || "",
    state: profile.state || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate input
      const validatedData = advertiserProfileSchema.parse(formData)

      const supabase = createClient()
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          full_name: validatedData.full_name,
          email: validatedData.email,
          phone: validatedData.phone,
          city: validatedData.city,
          state: validatedData.state,
        })
        .eq("id", profile.id)

      if (updateError) throw updateError

      onEditToggle()
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else {
        setError(error instanceof Error ? error.message : "An error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">FULL NAME</Label>
          <p className="text-[#D9D9D9]">{profile.full_name || "—"}</p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">EMAIL</Label>
          <p className="text-[#D9D9D9]">{profile.email || "—"}</p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">PHONE</Label>
          <p className="text-[#D9D9D9]">{profile.phone || "—"}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-[#D9D9D9]/70">CITY</Label>
            <p className="text-[#D9D9D9]">{profile.city || "—"}</p>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs font-semibold text-[#D9D9D9]/70">STATE</Label>
            <p className="text-[#D9D9D9]">{profile.state || "—"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
      <CardContent className="pt-6">
        <form id="profile-form" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name" className="text-[#D9D9D9]">
                Full Name
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#D9D9D9]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-[#D9D9D9]">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city" className="text-[#D9D9D9]">
                  City
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="San Francisco"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state" className="text-[#D9D9D9]">
                  State
                </Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="CA"
                  maxLength={2}
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
                disabled={isLoading}
                style={{ borderRadius: "5px" }}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#D9D9D9]/20 text-[#D9D9D9] hover:bg-[#D9D9D9]/10 bg-transparent"
                onClick={onEditToggle}
                disabled={isLoading}
                style={{ borderRadius: "5px" }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
