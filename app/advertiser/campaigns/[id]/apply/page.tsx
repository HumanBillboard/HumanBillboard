import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/client"
import ApplicationForm from "@/components/application-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ApplyCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = createClient()
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  if (profile.user_type !== "advertiser") {
    redirect("/business/dashboard")
  }

  // Get campaign
  const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", id).single()

  if (!campaign || campaign.status !== "active") {
    redirect("/advertiser/campaigns")
  }

  // Check if already applied
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("*")
    .eq("campaign_id", id)
    .eq("advertiser_id", userId)
    .single()

  if (existingApplication) {
    redirect("/advertiser/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <Link href="/advertiser/campaigns">
            <Button variant="ghost" className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10" style={{ borderRadius: "5px" }}>
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Campaign Info */}
        <Card className="mb-8 border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
          <CardHeader>
            <CardTitle className="text-[#D9D9D9]">{campaign.title}</CardTitle>
            <CardDescription className="text-[#D9D9D9]/70">{campaign.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#D9D9D9]/70">Compensation</span>
                <span className="font-semibold text-[#8BFF61]">
                  ${campaign.compensation_amount}/{campaign.compensation_type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#D9D9D9]/70">Location</span>
                <span className="text-[#D9D9D9]">{campaign.location}</span>
              </div>
              {campaign.duration_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-[#D9D9D9]/70">Duration</span>
                  <span className="text-[#D9D9D9]">{campaign.duration_hours} hours</span>
                </div>
              )}
            </div>
            {campaign.requirements && (
              <div className="mt-4">
                <p className="mb-1 text-sm font-semibold text-[#D9D9D9]">Requirements:</p>
                <p className="text-sm text-[#D9D9D9]/70">{campaign.requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <h1 className="mb-4 text-3xl font-bold text-[#D9D9D9]">Apply to Campaign</h1>
        <ApplicationForm campaignId={id} advertiserId={userId} />
      </div>
    </div>
  )
}
