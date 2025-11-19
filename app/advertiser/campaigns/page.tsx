import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Campaign, UserProfile } from "@/lib/types"

interface CampaignWithBusiness extends Campaign {
  business: Pick<UserProfile, "id" | "company_name"> | null
}

export default async function BrowseCampaignsPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  if (profile.user_type !== "advertiser") {
    redirect("/business/dashboard")
  }

  // Get all active campaigns with business info
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(`
      *,
      business:user_profiles!campaigns_business_id_fkey(id, company_name)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<CampaignWithBusiness[]>()

  // Get user's applications to check which campaigns they've already applied to
  const { data: userApplications } = await supabase
    .from("applications")
    .select("campaign_id")
    .eq("advertiser_id", userId)

  const appliedCampaignIds = new Set(userApplications?.map((app) => app.campaign_id) || [])

  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/advertiser/dashboard">
              <Button variant="ghost" className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10" style={{ borderRadius: "5px" }}>
                Dashboard
              </Button>
            </Link>
            <form action="/auth/logout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10"
                style={{ borderRadius: "5px" }}
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D9D9D9]">Browse Campaigns</h1>
          <p className="mt-1 text-[#D9D9D9]/70">Find opportunities to earn money wearing branded merchandise</p>
        </div>

        {/* Campaigns List */}
        {campaigns && campaigns.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {campaigns.map((campaign: Campaign) => {
              const hasApplied = appliedCampaignIds.has(campaign.id)
              return (
                <Card key={campaign.id} className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <CardTitle className="text-[#D9D9D9]">{campaign.title}</CardTitle>
                      <Badge className="bg-[#8BFF61] text-[#171717]" style={{ borderRadius: "5px" }}>
                        Active
                      </Badge>
                    </div>
                    <CardDescription className="text-[#D9D9D9]/70">{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#D9D9D9]/70">Company</span>
                        <Link
                          href={`/advertiser/profile/${(campaign as CampaignWithBusiness).business?.id}`}
                          className="font-semibold text-[#8BFF61] hover:underline"
                        >
                          {(campaign as CampaignWithBusiness).business?.company_name || "Unknown"}
                        </Link>
                      </div>
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
                      <div className="mb-4">
                        <p className="mb-1 text-sm font-semibold text-[#D9D9D9]">Requirements:</p>
                        <p className="text-sm text-[#D9D9D9]/70">{campaign.requirements}</p>
                      </div>
                    )}

                    {hasApplied ? (
                      <Button
                        disabled
                        className="w-full bg-[#D9D9D9]/20 text-[#D9D9D9]"
                        style={{ borderRadius: "5px" }}
                      >
                        Already Applied
                      </Button>
                    ) : (
                      <Link href={`/advertiser/campaigns/${campaign.id}/apply`} className="block">
                        <Button
                          className="w-full bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
                          style={{ borderRadius: "5px" }}
                        >
                          Apply Now
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
            <CardContent className="py-12 text-center">
              <p className="text-[#D9D9D9]/70">No active campaigns available at the moment. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
