"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { businessProfileSchema } from "@/lib/validation"
import { ProfilePictureUpload } from "@/components/profile-picture-upload"
import type { UserProfile } from "@/lib/types"

interface BusinessProfileFormProps {
  profile: UserProfile
  isEditing: boolean
  onEditToggle: () => void
}

export default function BusinessProfileForm({
  profile,
  isEditing,
  onEditToggle,
}: BusinessProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    company_name: profile.company_name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    industry: profile.industry || "",
    description: profile.description || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate input
      const validatedData = businessProfileSchema.parse(formData)

      const supabase = createClient()
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          company_name: validatedData.company_name,
          email: validatedData.email,
          phone: validatedData.phone,
          industry: validatedData.industry,
          description: validatedData.description,
          address: validatedData.address,
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
      <div className="space-y-6">
        <ProfilePictureUpload profile={profile} isEditing={false} />
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">BUSINESS NAME</Label>
          <p className="text-[#D9D9D9]">{profile.company_name || "—"}</p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">EMAIL</Label>
          <p className="text-[#D9D9D9]">{profile.email || "—"}</p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">PHONE</Label>
          <p className="text-[#D9D9D9]">{profile.phone || "—"}</p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">INDUSTRY</Label>
          <p className="text-[#D9D9D9]">{profile.industry || "—"}</p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">DESCRIPTION</Label>
          <p className="text-[#D9D9D9]">{profile.description || "—"}</p>
        </div>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold text-[#D9D9D9]/70">ADDRESS</Label>
          <p className="text-[#D9D9D9]">{profile.address || "—"}</p>
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
        <div className="mb-6 flex justify-center">
          <ProfilePictureUpload profile={profile} isEditing={true} />
        </div>
        <form id="profile-form" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company_name" className="text-[#D9D9D9]">
                Business Name
              </Label>
              <Input
                id="company_name"
                type="text"
                placeholder="Acme Inc."
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
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
                placeholder="contact@acme.com"
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

            <div className="grid gap-2">
              <Label htmlFor="industry" className="text-[#D9D9D9]">
                Industry
              </Label>
              <Input
                id="industry"
                type="text"
                placeholder="Technology, Retail, etc."
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address" className="text-[#D9D9D9]">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, San Francisco, CA"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[#D9D9D9]">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Tell us about your business..."
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
