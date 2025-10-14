import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import ApplicationActions from "@/components/application-actions"

export default async function CampaignApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = createClient()

  // Get campaign
  const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", id).single()

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

        {/* Applications */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-[#D9D9D9]">Applications ({applications?.length || 0})</h2>
          {applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application: any) => (
                <Card key={application.id} className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <CardTitle className="text-[#D9D9D9]">
                            {application.advertiser?.full_name || "Anonymous"}
                          </CardTitle>
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
                        <CardDescription className="text-[#D9D9D9]/70">{application.advertiser?.email}</CardDescription>
                      </div>
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
                      {application.status === "pending" && <ApplicationActions applicationId={application.id} />}
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
