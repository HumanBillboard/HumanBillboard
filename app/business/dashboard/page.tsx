import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import ClerkSignOut from "@/components/clerk-signout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Campaign } from "@/lib/types"

export default async function BusinessDashboard() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  if (profile.user_type !== "business") {
    redirect("/advertiser/dashboard")
  }

  // Get campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("business_id", userId)
    .order("created_at", { ascending: false })

  // Get application counts for each campaign
  const campaignIds = campaigns?.map((c) => c.id) || []
  const { data: applications } = await supabase
    .from("applications")
    .select("campaign_id, status")
    .in("campaign_id", campaignIds)

  const applicationCounts = campaigns?.map((campaign) => {
    const campaignApps = applications?.filter((app) => app.campaign_id === campaign.id) || []
    return {
      campaignId: campaign.id,
      total: campaignApps.length,
      pending: campaignApps.filter((app) => app.status === "pending").length,
      accepted: campaignApps.filter((app) => app.status === "accepted").length,
      rejected: campaignApps.filter((app) => app.status === "rejected").length,
    }
  })

  // Aggregate performance metrics for business owner
  const totalCampaigns = campaigns?.length || 0
  const activeCampaigns = campaigns?.filter((c) => c.status === "active").length || 0
  const totalApplications = applications?.length || 0
  const acceptedApplications = applications?.filter((a) => a.status === "accepted").length || 0
  const pendingApplications = applications?.filter((a) => a.status === "pending").length || 0
  const rejectedApplications = applications?.filter((a) => a.status === "rejected").length || 0
  const acceptanceRate = totalApplications
    ? Math.round((acceptedApplications / totalApplications) * 100)
    : 0
  const avgCompensationOffered = (() => {
    if (!campaigns || !campaigns.length) return 0
    return Math.round(
      campaigns.reduce((sum, c) => sum + (c.compensation_amount || 0), 0) / campaigns.length
    )
  })()
  const avgApplicationsPerCampaign = totalCampaigns
    ? (totalApplications / totalCampaigns).toFixed(1)
    : "0"

  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/business/profile">
              <Button variant="ghost" className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10" style={{ borderRadius: "5px" }}>
                My Profile
              </Button>
            </Link>
            <ClerkSignOut />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#D9D9D9]">Business Dashboard</h1>
            <p className="mt-1 text-[#D9D9D9]/70">Welcome back, {profile?.company_name || profile?.full_name}</p>
          </div>
          <Link href="/business/campaigns/new">
            <Button className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90" style={{ borderRadius: "5px" }}>
              Create Campaign
            </Button>
          </Link>
        </div>

        {/* Performance Metrics */}
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-[#D9D9D9]">Campaign Performance</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Campaigns</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">{totalCampaigns}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Active</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">{activeCampaigns}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Applications</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">{totalApplications}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Accepted</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">{acceptedApplications}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Pending</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">{pendingApplications}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Rejected</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">{rejectedApplications}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Acceptance Rate</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">{acceptanceRate}%</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Avg Compensation</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">${avgCompensationOffered}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardHeader>
                <CardDescription className="text-[#D9D9D9]/70">Avg Apps / Campaign</CardDescription>
                <CardTitle className="text-2xl text-[#8BFF61]">{avgApplicationsPerCampaign}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-[#D9D9D9]/20 bg-[#171717] md:col-span-3" style={{ borderRadius: "5px" }}>
              <CardContent className="pt-6 text-sm text-[#D9D9D9]/70">
                Use compelling titles & clear requirements, keep compensation competitive, and actively review pending applications to increase acceptance.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Campaigns List */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-[#D9D9D9]">Your Campaigns</h2>
          {campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign: Campaign) => {
                const counts = applicationCounts?.find((ac) => ac.campaignId === campaign.id)
                return (
                  <Card key={campaign.id} className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <CardTitle className="text-[#D9D9D9]">{campaign.title}</CardTitle>
                            <Badge
                              variant={campaign.status === "active" ? "default" : "secondary"}
                              className={
                                campaign.status === "active"
                                  ? "bg-[#8BFF61] text-[#171717]"
                                  : "bg-[#D9D9D9]/20 text-[#D9D9D9]"
                              }
                              style={{ borderRadius: "5px" }}
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-[#D9D9D9]/70">{campaign.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex flex-wrap gap-4 text-sm text-[#D9D9D9]/70">
                        <div>
                          <span className="font-semibold text-[#D9D9D9]">Compensation:</span> $
                          {campaign.compensation_amount}/{campaign.compensation_type}
                        </div>
                        <div>
                          <span className="font-semibold text-[#D9D9D9]">Location:</span> {campaign.location}
                        </div>
                        {campaign.duration_hours && (
                          <div>
                            <span className="font-semibold text-[#D9D9D9]">Duration:</span> {campaign.duration_hours}h
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4 text-sm">
                          <span className="text-[#D9D9D9]/70">
                            <span className="font-semibold text-[#8BFF61]">{counts?.pending || 0}</span> pending
                          </span>
                          <span className="text-[#D9D9D9]/70">
                            <span className="font-semibold text-[#8BFF61]">{counts?.accepted || 0}</span> accepted
                          </span>
                          <span className="text-[#D9D9D9]/70">
                            <span className="font-semibold text-[#8BFF61]">{counts?.total || 0}</span> total
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/business/campaigns/${campaign.id}/applications`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#D9D9D9]/20 text-[#D9D9D9] hover:bg-[#D9D9D9]/10 bg-transparent"
                              style={{ borderRadius: "5px" }}
                            >
                              View Applications
                            </Button>
                          </Link>
                          <Link href={`/business/campaigns/${campaign.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#D9D9D9]/20 text-[#D9D9D9] hover:bg-[#D9D9D9]/10 bg-transparent"
                              style={{ borderRadius: "5px" }}
                            >
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-[#D9D9D9]/70">You haven&apos;t created any campaigns yet.</p>
                <Link href="/business/campaigns/new">
                  <Button className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90" style={{ borderRadius: "5px" }}>
                    Create Your First Campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
