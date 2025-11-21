import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { UserProfile } from "@/lib/types"

export default async function PublicAdvertiserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Verify current user is business
  const { data: currentUser } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (!currentUser || currentUser.user_type !== "business") {
    redirect("/advertiser/dashboard")
  }

  // Get advertiser profile
  const { data: advertiser } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", id)
    .eq("user_type", "advertiser")
    .single()

  if (!advertiser) {
    redirect("/business/dashboard")
  }

  // Get advertiser stats
  const { data: applications } = await supabase
    .from("applications")
    .select("status")
    .eq("advertiser_id", id)

  const completed = applications?.filter((app) => app.status === "accepted").length || 0
  const inProgress = applications?.filter((app) => app.status === "pending").length || 0

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

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Profile Header */}
        <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl text-[#D9D9D9]">{advertiser.full_name}</CardTitle>
                <p className="mt-2 text-[#D9D9D9]/70">Influencer Profile</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#8BFF61]">{completed}</p>
                <p className="mt-2 text-sm text-[#D9D9D9]/70">Completed Campaigns</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#8BFF61]">{inProgress}</p>
                <p className="mt-2 text-sm text-[#D9D9D9]/70">In Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Card className="mt-6 border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <p className="text-xs font-semibold text-[#D9D9D9]/70">EMAIL</p>
                <p className="text-[#D9D9D9]">{advertiser.email || "—"}</p>
              </div>

              <div className="grid gap-2">
                <p className="text-xs font-semibold text-[#D9D9D9]/70">PHONE</p>
                <p className="text-[#D9D9D9]">{advertiser.phone || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-[#D9D9D9]/70">CITY</p>
                  <p className="text-[#D9D9D9]">{advertiser.city || "—"}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-[#D9D9D9]/70">STATE</p>
                  <p className="text-[#D9D9D9]">{advertiser.state || "—"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
