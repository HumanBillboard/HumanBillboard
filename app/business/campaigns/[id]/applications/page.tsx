import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ProfileAvatar } from "@/components/profile-avatar"
import ApplicationActions from "@/components/application-actions"

export default async function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Verify user owns this campaign
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single()

  if (!campaign || campaign.business_id !== userId) {
    redirect("/business/dashboard")
  }

  // Get applications with advertiser info
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      advertiser:user_profiles!applications_advertiser_id_fkey(*)
    `)
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })

  // Derived metrics
  const totalApplications = applications?.length || 0
  const acceptedCount = applications?.filter(a => a.status === "accepted").length || 0
  const pendingCount = applications?.filter(a => a.status === "pending").length || 0
  const rejectedCount = applications?.filter(a => a.status === "rejected").length || 0
  const acceptanceRate = totalApplications > 0 ? (acceptedCount / totalApplications) * 100 : 0

  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <Link href="/business/dashboard">
            <Button variant="ghost" className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10" style={{ borderRadius: "5px" }}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Campaign Info */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-[#D9D9D9]">{campaign.title}</h1>
          <p className="text-[#D9D9D9]/70">{campaign.description}</p>
        </div>

        {/* Metrics */}
        <Card className="mb-8 border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
          <CardHeader>
            <CardTitle className="text-[#D9D9D9]">Campaign Metrics</CardTitle>
            <CardDescription className="text-[#D9D9D9]/70">Live performance for this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-[#D9D9D9]/50">Total Applications</p>
                <p className="text-2xl font-bold text-[#D9D9D9]">{totalApplications}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-[#D9D9D9]/50">Accepted</p>
                <p className="text-2xl font-bold text-[#8BFF61]">{acceptedCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-[#D9D9D9]/50">Pending</p>
                <p className="text-2xl font-bold text-[#D9D9D9]">{pendingCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-[#D9D9D9]/50">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-[#D9D9D9]/50">Acceptance Rate</p>
                <p className="text-2xl font-bold text-[#D9D9D9]">{acceptanceRate.toFixed(1)}%</p>
              </div>
              {campaign.compensation_amount && (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-[#D9D9D9]/50">Compensation</p>
                  <p className="text-2xl font-bold text-[#D9D9D9]">
                    ${campaign.compensation_amount}/{campaign.compensation_type}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-[#D9D9D9]">Applications ({applications?.length || 0})</h2>
          {applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application: any) => (
                <Card key={application.id} className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <ProfileAvatar
                          src={application.advertiser?.profile_picture_url}
                          alt={application.advertiser?.full_name || "Advertiser"}
                          fallback={
                            application.advertiser?.full_name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase() || "U"
                          }
                          size="md"
                        />
                        <div>
                          <Link
                            href={`/business/profile/${application.advertiser?.id}`}
                            className="text-lg font-semibold text-[#8BFF61] hover:underline"
                          >
                            <CardTitle className="text-[#D9D9D9]">
                              {application.advertiser?.full_name || "Anonymous"}
                            </CardTitle>
                          </Link>
                          <CardDescription className="text-[#D9D9D9]/70">{application.advertiser?.email}</CardDescription>
                        </div>
                      </div>
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
                  </CardHeader>
                  <CardContent>
                    {application.message && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-[#D9D9D9]">Message:</p>
                        <p className="text-sm text-[#D9D9D9]/70">{application.message}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#D9D9D9]/70">
                        Applied {new Date(application.created_at).toLocaleDateString()}
                      </p>
                      {application.status === "pending" && (
                        <ApplicationActions applicationId={application.id} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardContent className="py-12 text-center">
                <p className="text-[#D9D9D9]/70">No applications yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
