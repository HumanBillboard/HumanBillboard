import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/client"
import CampaignForm from "@/components/campaign-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params
  
  if (!userId) {
    redirect("/auth/login")
  }

  const supabase = createClient()
  const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", id).single()

  if (!campaign || campaign.business_id !== userId) {
    redirect("/business/dashboard")
  }

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

      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-[#D9D9D9]">Edit Campaign</h1>
        <CampaignForm userId={userId} campaign={campaign} />
      </div>
    </div>
  )
}
