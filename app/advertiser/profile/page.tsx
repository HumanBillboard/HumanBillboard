import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import AdvertiserProfileFormWrapper from "@/components/advertiser-profile-form-wrapper"

export default async function AdvertiserProfilePage() {
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

  if (profile.user_type !== "advertiser") {
    redirect("/business/profile")
  }

  // Get campaign statistics
  const { count: acceptedCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("advertiser_id", userId)
    .eq("status", "accepted")

  const { count: pendingCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("advertiser_id", userId)
    .eq("status", "pending")

  const completedCampaigns = acceptedCount ?? 0
  const inProgressCampaigns = pendingCount ?? 0

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
              <Button
                variant="ghost"
                className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10"
                style={{ borderRadius: "5px" }}
              >
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

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D9D9D9]">My Profile</h1>
          <p className="mt-1 text-[#D9D9D9]/70">Manage your personal information</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Stats */}
          <div className="md:col-span-3">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
                <CardHeader>
                  <CardDescription className="text-[#D9D9D9]/70">Completed Campaigns</CardDescription>
                  <CardTitle className="text-3xl text-[#8BFF61]">{completedCampaigns}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
                <CardHeader>
                  <CardDescription className="text-[#D9D9D9]/70">In Progress Campaigns</CardDescription>
                  <CardTitle className="text-3xl text-[#8BFF61]">{inProgressCampaigns}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Profile Information */}
          <div className="md:col-span-3">
            <ProfileFormSection profile={profile} />
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
          <CardTitle className="text-[#D9D9D9]">Personal Information</CardTitle>
          <CardDescription className="text-[#D9D9D9]/70">
            Your profile details visible to other users
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <AdvertiserProfileFormWrapper profile={profile} />
      </CardContent>
    </Card>
  )
}
