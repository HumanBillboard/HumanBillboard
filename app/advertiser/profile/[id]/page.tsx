import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ProfileAvatar } from "@/components/profile-avatar"
import type { UserProfile } from "@/lib/types"

export default async function PublicBusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  // Verify current user is advertiser
  const { data: currentUser } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (!currentUser || currentUser.user_type !== "advertiser") {
    redirect("/business/dashboard")
  }

  // Get business profile
  const { data: business } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", id)
    .eq("user_type", "business")
    .single()

  if (!business) {
    redirect("/advertiser/dashboard")
  }

  // Get business stats
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id")
    .eq("business_id", id)
    .eq("status", "active")

  const activeCampaignCount = campaigns?.length || 0

  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <Link href="/advertiser/dashboard">
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
            <div className="flex items-center gap-6">
              <ProfileAvatar
                src={business.profile_picture_url}
                alt={business.company_name || "Business"}
                fallback={
                  business.company_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "B"
                }
                size="lg"
              />
              <div>
                <CardTitle className="text-3xl text-[#D9D9D9]">{business.company_name}</CardTitle>
                <p className="mt-2 text-[#D9D9D9]/70">{business.industry || "Business"}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="mt-6">
          <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#8BFF61]">{activeCampaignCount}</p>
                <p className="mt-2 text-sm text-[#D9D9D9]/70">Active Campaigns</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Card className="mt-6 border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <p className="text-xs font-semibold text-[#D9D9D9]/70">BUSINESS NAME</p>
                <p className="text-[#D9D9D9]">{business.company_name || "—"}</p>
              </div>

              {business.description && (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-[#D9D9D9]/70">DESCRIPTION</p>
                  <p className="text-[#D9D9D9]">{business.description}</p>
                </div>
              )}

              <div className="grid gap-2">
                <p className="text-xs font-semibold text-[#D9D9D9]/70">EMAIL</p>
                <p className="text-[#D9D9D9]">{business.email || "—"}</p>
              </div>

              <div className="grid gap-2">
                <p className="text-xs font-semibold text-[#D9D9D9]/70">PHONE</p>
                <p className="text-[#D9D9D9]">{business.phone || "—"}</p>
              </div>

              {business.industry && (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-[#D9D9D9]/70">INDUSTRY</p>
                  <p className="text-[#D9D9D9]">{business.industry}</p>
                </div>
              )}

              {business.address && (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-[#D9D9D9]/70">ADDRESS</p>
                  <p className="text-[#D9D9D9]">{business.address}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-[#D9D9D9]/70">CITY</p>
                  <p className="text-[#D9D9D9]">{business.city || "—"}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-xs font-semibold text-[#D9D9D9]/70">STATE</p>
                  <p className="text-[#D9D9D9]">{business.state || "—"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
