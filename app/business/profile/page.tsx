import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import ClerkSignOut from "@/components/clerk-signout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import BusinessProfileFormWrapper from "@/components/business-profile-form-wrapper"
import type { Campaign } from "@/lib/types"

export default async function BusinessProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  if (profile.user_type !== "business") {
    redirect("/advertiser/profile")
  }

  // Get active (ongoing) campaigns
  const { data: activeCampaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("business_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Get completed campaigns count
  const { count: completedCount } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("business_id", userId)
    .eq("status", "closed")

  const completedCampaigns = completedCount ?? 0
  const campaigns = activeCampaigns || []

  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/business/dashboard">
              <Button
                variant="ghost"
                className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10"
                style={{ borderRadius: "5px" }}
              >
                Dashboard
              </Button>
            </Link>
            <ClerkSignOut />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D9D9D9]">My Business Profile</h1>
          <p className="mt-1 text-[#D9D9D9]/70">Manage your business information</p>
        </div>

        <div className="grid gap-8">
          {/* Completed Campaigns Stat */}
          <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
            <CardHeader>
              <CardDescription className="text-[#D9D9D9]/70">Completed Campaigns</CardDescription>
              <CardTitle className="text-3xl text-[#8BFF61]">{completedCampaigns}</CardTitle>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <ProfileFormSection profile={profile} />

          {/* Ongoing Campaigns */}
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#D9D9D9]">Ongoing Campaigns</h2>
            {campaigns.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign: Campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/business/campaigns/${campaign.id}/edit`}
                    className="group"
                  >
                    <Card
                      className="border-[#D9D9D9]/20 bg-[#171717] transition-all duration-200 group-hover:border-[#8BFF61]/50 group-hover:bg-[#171717]/80 cursor-pointer"
                      style={{ borderRadius: "5px" }}
                    >
                      <CardHeader>
                        <div className="mb-2 flex items-start justify-between">
                          <CardTitle className="text-[#D9D9D9] group-hover:text-[#8BFF61] transition-colors">
                            {campaign.title}
                          </CardTitle>
                          <Badge
                            className="bg-[#8BFF61] text-[#171717]"
                            style={{ borderRadius: "5px" }}
                          >
                            Active
                          </Badge>
                        </div>
                        <CardDescription className="text-[#D9D9D9]/70 line-clamp-2">
                          {campaign.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-[#D9D9D9]/70">
                          <div className="flex justify-between">
                            <span>Compensation:</span>
                            <span className="text-[#8BFF61] font-semibold">
                              ${campaign.compensation_amount}/{campaign.compensation_type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="text-[#D9D9D9]">{campaign.location}</span>
                          </div>
                          {campaign.duration_hours && (
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="text-[#D9D9D9]">{campaign.duration_hours}h</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
                <CardContent className="py-12 text-center">
                  <p className="mb-4 text-[#D9D9D9]/70">You don't have any ongoing campaigns.</p>
                  <Link href="/business/campaigns/new">
                    <Button
                      className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
                      style={{ borderRadius: "5px" }}
                    >
                      Create Your First Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

async function ProfileFormSection({ profile }: { profile: any }) {
  return (
    <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-[#D9D9D9]">Business Information</CardTitle>
          <CardDescription className="text-[#D9D9D9]/70">
            Your profile details visible to other users
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <BusinessProfileFormWrapper profile={profile} />
      </CardContent>
    </Card>
  )
}
