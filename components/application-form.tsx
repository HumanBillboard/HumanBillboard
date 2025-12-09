"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { applicationSchema } from "@/lib/validation"
import { sendApplicationReceivedNotification } from "@/app/actions/send-notification-emails"

interface ApplicationFormProps {
  campaignId: string
  advertiserId: string
}

export default function ApplicationForm({ campaignId, advertiserId }: ApplicationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // VALIDATE input before submitting (prevents XSS)
      const validatedData = applicationSchema.parse({
        message: message,
      })

      const supabase = createClient()
      
      // Get campaign and advertiser info for email notification
      const [campaignRes, advertiserRes] = await Promise.all([
        supabase.from("campaigns").select("*, business:user_profiles!campaigns_business_id_fkey(id, email, company_name, full_name)").eq("id", campaignId).single(),
        supabase.from("user_profiles").select("*").eq("id", advertiserId).single(),
      ])

      const campaign = campaignRes.data
      const advertiser = advertiserRes.data

      // Insert application
      const { error } = await supabase.from("applications").insert({
        campaign_id: campaignId,
        advertiser_id: advertiserId,
        message: validatedData.message,
        status: "pending",
      })

      if (error) {
        // Check for duplicate application error (409 conflict)
        if (error.code === "23505") {
          setError("You have already applied to this campaign.")
          setTimeout(() => router.push("/advertiser/dashboard"), 2000)
          return
        }
        throw error
      }

      // Send email notification to business owner (don't let this fail the application)
      if (campaign?.business && advertiser) {
        try {
          await sendApplicationReceivedNotification(
            campaign.business.email || "",
            campaign.business.company_name || campaign.business.full_name || "Business Owner",
            campaign.title,
            advertiser.full_name || "An advertiser",
            validatedData.message || undefined
          )
        } catch (emailError) {
          console.error("Failed to send notification email:", emailError)
          // Continue anyway - application was created successfully
        }
      }

      router.push("/advertiser/dashboard")
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

  return (
    <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message" className="text-[#D9D9D9]">
                Message (optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Tell the business why you're a great fit..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
              />
              <p className="text-sm text-[#D9D9D9]/70">
                Introduce yourself and explain why you&apos;d be a great brand ambassador for this campaign.
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
              disabled={isLoading}
              style={{ borderRadius: "5px" }}
            >
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
