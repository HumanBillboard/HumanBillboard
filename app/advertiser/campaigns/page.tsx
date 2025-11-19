import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type SearchParams = {
  location?: string;
  merchandise?: string;
  gender?: string;
  age_range?: string;
  min_comp?: string;
  max_comp?: string;
}

function matchesFilter(value: any, filter?: string) {
  if (!filter) return true
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.some((v) => String(v).toLowerCase().includes(filter.toLowerCase()))
  return String(value).toLowerCase().includes(filter.toLowerCase())
}

function matchesExact(value: any, filter?: string) {
  if (!filter) return true
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.map(String).includes(filter)
  return String(value) === filter
}

export default async function CampaignsPage({ searchParams }: { searchParams?: SearchParams }) {
  const { userId } = await auth()
  const supabase = createClient()

  // Pull campaigns (limit to 100 for now)
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  // Normalize filters
  const locationFilter = searchParams?.location ?? ""
  const merchandiseFilter = searchParams?.merchandise ?? ""
  const genderFilter = searchParams?.gender ?? ""
  const ageFilter = searchParams?.age_range ?? ""
  const minCompInput = searchParams?.min_comp ?? ""
  const maxCompInput = searchParams?.max_comp ?? ""
  const minComp = minCompInput !== "" ? Number(minCompInput) : undefined
  const maxComp = maxCompInput !== "" ? Number(maxCompInput) : undefined

  // Filter campaigns server-side in a flexible way (handles different schema shapes)
  const displayed = Array.isArray(campaigns)
    ? campaigns.filter((c: any) => {
        // Exclude owner's campaigns when possible
        const ownerKeys = ["advertiser_id", "user_id", "owner", "created_by"]
        const presentOwnerKeys = ownerKeys.filter((k) => c[k] !== undefined && c[k] !== null)
        if (presentOwnerKeys.some((k) => String(c[k]) === String(userId))) return false

        // Location matching: common fields
        const locationFields = ["location", "city", "place"]
        const locationMatches = locationFields.some((k) => matchesFilter(c[k], locationFilter))

        // Merchandise type: could be "merchandise_type" or "merchandise_types" or "items"
        const merchFields = ["merchandise_type", "merchandise_types", "items", "products"]
        const merchMatches = merchFields.some((k) => matchesFilter(c[k], merchandiseFilter))

        // Influencer demographics: could be nested or flat
        const demoFields = ["influencer_demographics", "target_demographics", "demographics"]
        let genderMatches = true
        let ageMatches = true
        if (genderFilter || ageFilter) {
          genderMatches = false
          ageMatches = false
          for (const k of demoFields) {
            const val = c[k]
            if (!val) continue
            // if object
            if (typeof val === "object") {
              if (genderFilter && val.gender && String(val.gender).toLowerCase().includes(genderFilter.toLowerCase())) genderMatches = true
              if (ageFilter && val.age_range && String(val.age_range).toLowerCase().includes(ageFilter.toLowerCase())) ageMatches = true
            } else {
              // string or array
              if (genderFilter && matchesFilter(val, genderFilter)) genderMatches = true
              if (ageFilter && matchesFilter(val, ageFilter)) ageMatches = true
            }
          }
        }

        // Compensation numeric filtering: handle common fields and compare to min/max when provided
        const compFields = ["compensation_amount", "compensation", "amount", "pay_amount", "budget"]
        const compVal = compFields.map((k) => c[k]).find((v) => v !== undefined && v !== null)
        const compNumber = compVal !== undefined && compVal !== null ? Number(compVal) : undefined
        if (minComp !== undefined && !isNaN(minComp) && (compNumber === undefined || isNaN(compNumber) || compNumber < minComp)) return false
        if (maxComp !== undefined && !isNaN(maxComp) && (compNumber === undefined || isNaN(compNumber) || compNumber > maxComp)) return false

        return locationMatches && merchMatches && genderMatches && ageMatches
      })
    : []

  return (
    <div className="min-h-screen bg-[#171717]">
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <div>
            <Link href="/advertiser/dashboard">
              <Button variant="ghost" className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10" style={{ borderRadius: "5px" }}>
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <form method="GET" className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block mb-1 text-sm text-[#D9D9D9]">Location</label>
              <input name="location" defaultValue={locationFilter} placeholder="e.g. New York" className="px-3 py-2 rounded bg-[#1f1f1f] text-[#D9D9D9]" />
            </div>
            <div>
              <label className="block mb-1 text-sm text-[#D9D9D9]">Merchandise</label>
              <input name="merchandise" defaultValue={merchandiseFilter} placeholder="e.g. T-shirt" className="px-3 py-2 rounded bg-[#1f1f1f] text-[#D9D9D9]" />
            </div>
            <div>
              <label className="block mb-1 text-sm text-[#D9D9D9]">Min Compensation</label>
              <input name="min_comp" defaultValue={minCompInput} placeholder="Min $" className="px-3 py-2 rounded bg-[#1f1f1f] text-[#D9D9D9]" />
            </div>
            <div>
              <label className="block mb-1 text-sm text-[#D9D9D9]">Max Compensation</label>
              <input name="max_comp" defaultValue={maxCompInput} placeholder="Max $" className="px-3 py-2 rounded bg-[#1f1f1f] text-[#D9D9D9]" />
            </div>
            <div>
              <label className="block mb-1 text-sm text-[#D9D9D9]">Influencer Gender</label>
              <select name="gender" defaultValue={genderFilter} className="px-3 py-2 rounded bg-[#1f1f1f] text-[#D9D9D9]">
                <option value="">Any</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm text-[#D9D9D9]">Influencer Age Range</label>
              <select name="age_range" defaultValue={ageFilter} className="px-3 py-2 rounded bg-[#1f1f1f] text-[#D9D9D9]">
                <option value="">Any</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45+">45+</option>
              </select>
            </div>
            <div>
              <Button type="submit" className="bg-[#8BFF61] text-[#171717]" style={{ borderRadius: 6 }}>
                Apply
              </Button>
            </div>
          </form>
          {error && <p className="mt-2 text-sm text-red-400">Error loading campaigns: {error.message}</p>}
        </div>

        <div className="space-y-4">
          {displayed.map((campaign: any) => (
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
                <div className="flex gap-3">
                  <Link href={`/advertiser/campaigns/${campaign.id}/apply`}>
                    <Button className="bg-[#8BFF61] text-[#171717]" style={{ borderRadius: 6 }}>Apply</Button>
                  </Link>
                  <Link href={`/advertiser/campaigns/${campaign.id}`}>
                    <Button variant="ghost" className="text-[#D9D9D9]">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {displayed.length === 0 && (
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-[#D9D9D9]/70">No campaigns match these filters.</p>
                <Link href="/advertiser/campaigns">
                  <Button className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90" style={{ borderRadius: "5px" }}>
                    Reset filters
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
