export type UserType = "business" | "advertiser"

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  user_type: UserType
  company_name: string | null
  phone: string | null
  industry: string | null
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  business_id: string
  title: string
  description: string
  compensation_amount: number
  compensation_type: "hourly" | "daily" | "per_event"
  location: string
  duration_hours: number | null
  requirements: string | null
  status: "active" | "paused" | "closed"
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  campaign_id: string
  advertiser_id: string
  status: "pending" | "accepted" | "rejected"
  message: string | null
  created_at: string
  updated_at: string
}
