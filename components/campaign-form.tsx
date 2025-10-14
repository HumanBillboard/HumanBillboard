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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CampaignFormProps {
  userId: string
  campaign?: {
    id: string
    title: string
    description: string
    compensation_amount: number
    compensation_type: string
    location: string
    duration_hours: number | null
    requirements: string | null
    status: string
  }
}

export default function CampaignForm({ userId, campaign }: CampaignFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: campaign?.title || "",
    description: campaign?.description || "",
    compensation_amount: campaign?.compensation_amount || "",
    compensation_type: campaign?.compensation_type || "hourly",
    location: campaign?.location || "",
    duration_hours: campaign?.duration_hours || "",
    requirements: campaign?.requirements || "",
    status: campaign?.status || "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const data = {
        business_id: userId,
        title: formData.title,
        description: formData.description,
        compensation_amount: Number.parseFloat(formData.compensation_amount.toString()),
        compensation_type: formData.compensation_type,
        location: formData.location,
        duration_hours: formData.duration_hours ? Number.parseInt(formData.duration_hours.toString()) : null,
        requirements: formData.requirements || null,
        status: formData.status,
      }

      if (campaign) {
        const { error } = await supabase.from("campaigns").update(data).eq("id", campaign.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("campaigns").insert(data)
        if (error) throw error
      }

      router.push("/business/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-[#D9D9D9]">
                Campaign Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Wear our brand t-shirt downtown"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[#D9D9D9]">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what you need..."
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="compensation_amount" className="text-[#D9D9D9]">
                  Compensation Amount ($)
                </Label>
                <Input
                  id="compensation_amount"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  required
                  value={formData.compensation_amount}
                  onChange={(e) => setFormData({ ...formData, compensation_amount: e.target.value })}
                  className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="compensation_type" className="text-[#D9D9D9]">
                  Compensation Type
                </Label>
                <Select
                  value={formData.compensation_type}
                  onValueChange={(value) => setFormData({ ...formData, compensation_type: value })}
                >
                  <SelectTrigger className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9]">
                    <SelectItem value="hourly">Per Hour</SelectItem>
                    <SelectItem value="daily">Per Day</SelectItem>
                    <SelectItem value="per_event">Per Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-[#D9D9D9]">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Downtown San Francisco"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration_hours" className="text-[#D9D9D9]">
                  Duration (hours, optional)
                </Label>
                <Input
                  id="duration_hours"
                  type="number"
                  placeholder="4"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                  className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requirements" className="text-[#D9D9D9]">
                Requirements (optional)
              </Label>
              <Textarea
                id="requirements"
                placeholder="Any specific requirements..."
                rows={3}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
            </div>

            {campaign && (
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-[#D9D9D9]">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9]">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
              disabled={isLoading}
              style={{ borderRadius: "5px" }}
            >
              {isLoading ? "Saving..." : campaign ? "Update Campaign" : "Create Campaign"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
