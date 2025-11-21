import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import ClerkSignOut from "@/components/clerk-signout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Application, Campaign, UserProfile } from "@/lib/types"

interface ApplicationWithCampaignAndBusiness extends Application {
  campaign: Campaign & {
    business: Pick<UserProfile, "id" | "company_name"> | null
  }
}

// async function to render the advertiser dashboard page
export default async function AdvertiserDashboard() {
  const { userId } = await auth()
  
  if (!userId) { // if not authenticated, redirects to login
    redirect("/auth/login")
  }

  // Create Supabase client, works better for serverless environments
  const supabase = await createClient()

  // Fetch user profile from Supabase
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (!profile) {
    redirect("/auth/onboarding")
  }

  if (profile.user_type !== "advertiser") {
    redirect("/business/dashboard")
  }

  // Get user's applications with campaign and business info
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      campaign:campaigns(*, business:user_profiles!campaigns_business_id_fkey(id, company_name))
    `)
    .eq("advertiser_id", userId)
    .order("created_at", { ascending: false })
    .returns<ApplicationWithCampaignAndBusiness[]>()

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
            <Link href="/advertiser/profile">
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
                          <span className="font-semibold text-[#D9D9D9]">Company:</span>{" "}
                          <Link
                            href={`/advertiser/profile/${(application as ApplicationWithCampaignAndBusiness)?.campaign?.business?.id}`}
                            className="text-[#8BFF61] hover:underline"
                          >
                            {(application as ApplicationWithCampaignAndBusiness)?.campaign?.business?.company_name || "Unknown"}
                          </Link>
                        </div>
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
      </div>
    </div>
  )
}
