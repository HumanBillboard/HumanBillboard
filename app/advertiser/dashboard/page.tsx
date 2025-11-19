import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Application } from "@/lib/types"

// async function to render the advertiser dashboard page
export default async function AdvertiserDashboard() {
  const { userId } = await auth()
  
  if (!userId) { // if not authenticated, redirects to login
    redirect("/auth/login")
  }

  // Create Supabase client, works better for serverless environments
  const supabase = createClient()

  // Fetch user profile from Supabase
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  if (profile.user_type !== "advertiser") {
    redirect("/business/dashboard")
  }

  // Get user's applications
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      campaign:campaigns(*)
    `)
    .eq("advertiser_id", userId)
    .order("created_at", { ascending: false })

  // Fetch campaigns from the DB (exclude the advertiser's own campaigns)
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);
  
  // Client-side exclusion: if the campaigns table exposes an advertiser_id field, remove the current user's campaigns.
  // This avoids errors when the column name differs (e.g. campaigns.user_id).
  // Remove campaigns owned by the current user. Some schemas use different owner fields
  // (advertiser_id, user_id, owner, created_by). Check common ones and exclude if any match.
  const displayedCampaigns = Array.isArray(campaigns)
    ? campaigns.filter((c: any) => {
        const ownerKeys = ["advertiser_id", "user_id", "owner", "created_by"];
        const presentKeys = ownerKeys.filter((k) => c[k] !== undefined && c[k] !== null);
        if (presentKeys.length === 0) return true; // no owner field exposed -> keep
        // exclude if any present owner field matches the current userId
        return !presentKeys.some((k) => String(c[k]) === String(userId));
      })
    : [];

  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/advertiser/campaigns">
              <Button variant="ghost" className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10" style={{ borderRadius: "5px" }}>
                Browse Campaigns
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
          <h1 className="text-3xl font-bold text-[#D9D9D9]">Advertiser Dashboard</h1>
          <p className="mt-1 text-[#D9D9D9]/70">Welcome back, {profile?.full_name}</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
            <CardHeader>
              <CardDescription className="text-[#D9D9D9]/70">Total Applications</CardDescription>
              <CardTitle className="text-3xl text-[#8BFF61]">{applications?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
            <CardHeader>
              <CardDescription className="text-[#D9D9D9]/70">Pending</CardDescription>
              <CardTitle className="text-3xl text-[#8BFF61]">
                {applications?.filter((a: Application) => a.status === "pending").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
            <CardHeader>
              <CardDescription className="text-[#D9D9D9]/70">Accepted</CardDescription>
              <CardTitle className="text-3xl text-[#8BFF61]">
                {applications?.filter((a: Application) => a.status === "accepted").length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Applications List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#D9D9D9]">Your Applications</h2>
            <Link href="/advertiser/campaigns">
              <Button className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90" style={{ borderRadius: "5px" }}>
                Browse Campaigns
              </Button>
            </Link>
          </div>

          {applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application: any) => {
                const campaign = application.campaign
                return (
                  <Card
                    key={application.id}
                    className="border-[#D9D9D9]/20 bg-[#171717]"
                    style={{ borderRadius: "5px" }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <CardTitle className="text-[#D9D9D9]">{campaign?.title}</CardTitle>
                            <Badge
                              variant={application.status === "accepted" ? "default" : "secondary"}
                              className={
                                application.status === "accepted"
                                  ? "bg-[#8BFF61] text-[#171717]"
                                  : application.status === "rejected"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-[#D9D9D9]/20 text-[#D9D9D9]"
                              }
                              style={{ borderRadius: "5px" }}
                            >
                              {application.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-[#D9D9D9]/70">{campaign?.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex flex-wrap gap-4 text-sm text-[#D9D9D9]/70">
                        <div>
                          <span className="font-semibold text-[#D9D9D9]">Compensation:</span> $
                          {campaign?.compensation_amount}/{campaign?.compensation_type}
                        </div>
                        <div>
                          <span className="font-semibold text-[#D9D9D9]">Location:</span> {campaign?.location}
                        </div>
                      </div>
                      {application.message && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-[#D9D9D9]">Your message:</p>
                          <p className="text-sm text-[#D9D9D9]/70">{application.message}</p>
                        </div>
                      )}
                      <p className="text-sm text-[#D9D9D9]/70">
                        Applied {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-[#D9D9D9]/70">You haven&apos;t applied to any campaigns yet.</p>
                <Link href="/advertiser/campaigns">
                  <Button className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90" style={{ borderRadius: "5px" }}>
                    Browse Available Campaigns
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Campaigns - show any campaigns that aren't the user's (client-side filtered when possible) */}
        <div className="mt-12">
          {/* Debug helper: show error or raw payload when no campaigns found */}
          {(!displayedCampaigns || displayedCampaigns.length === 0) && (
            <Card className="border-[#D9D9D9]/20 bg-[#171717] mb-6" style={{ borderRadius: "5px" }}>
              <CardContent className="py-4">
                <p className="mb-2 text-[#D9D9D9]/70">Debug: no campaigns to display after client-side filtering.</p>
                {campaignsError && <p className="mb-2 text-sm text-red-400">Error: {campaignsError.message}</p>}
                <pre className="text-xs text-[#D9D9D9]/70 whitespace-pre-wrap">{JSON.stringify(campaigns ?? null, null, 2)}</pre>
              </CardContent>
            </Card>
          )}

           <div className="mb-4 flex items-center justify-start">
             <h2 className="text-2xl font-bold text-[#D9D9D9]">Campaigns</h2>
           </div>

          {displayedCampaigns && displayedCampaigns.length > 0 ? (
            <div className="space-y-4">
              {displayedCampaigns.map((campaign: any) => (
                <Card key={campaign.id} className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <CardTitle className="text-[#D9D9D9]">{campaign.title}</CardTitle>
                        </div>
                        <CardDescription className="text-[#D9D9D9]/70">{campaign.summary || campaign.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex flex-wrap gap-4 text-sm text-[#D9D9D9]/70">
                      {campaign.compensation_amount && (
                        <div>
                          <span className="font-semibold text-[#D9D9D9]">Compensation:</span> ${campaign.compensation_amount}/{campaign.compensation_type}
                        </div>
                      )}
                      {campaign.location && (
                        <div>
                          <span className="font-semibold text-[#D9D9D9]">Location:</span> {campaign.location}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#D9D9D9]/70">Posted recently</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-[#D9D9D9]/70">No campaigns at the moment.</p>
                <Link href="/advertiser/campaigns">
                  <Button className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90" style={{ borderRadius: "5px" }}>
                    Browse Available Campaigns
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex justify-center">
            <Link href="/advertiser/campaigns">
              <Button className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90 px-8" style={{ borderRadius: "6px" }}>
                See More Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
