"use client"

import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { UserType } from "@/lib/types"

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const [userType, setUserType] = useState<UserType>("advertiser")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const router = useRouter()

  // Check if user already has a profile when component loads
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return

      try {
        const supabase = createClient()
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_type")
          .eq("id", user.id)
          .single()

        // If profile exists, redirect to appropriate dashboard
        if (profile) {
          if (profile.user_type === "business") {
            router.push("/business/dashboard")
          } else {
            router.push("/advertiser/dashboard")
          }
        }
      } catch (error) {
        // Profile doesn't exist, which is fine - user needs to complete onboarding
        console.log("No existing profile found, continuing with onboarding")
      } finally {
        setIsCheckingProfile(false)
      }
    }

    if (isLoaded && user) {
      checkExistingProfile()
    }
  }, [user, isLoaded, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create user profile in Supabase
      const { error: profileError } = await supabase.from("user_profiles").insert({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        full_name: user.fullName || "",
        user_type: userType,
        company_name: userType === "business" ? companyName : null,
      })

      if (profileError) {
        // If profile already exists (409 conflict), just redirect to dashboard
        if (profileError.code === "23505") {
          // Duplicate key error - profile already exists
          const { data: existingProfile } = await supabase
            .from("user_profiles")
            .select("user_type")
            .eq("id", user.id)
            .single()

          if (existingProfile) {
            if (existingProfile.user_type === "business") {
              router.push("/business/dashboard")
            } else {
              router.push("/advertiser/dashboard")
            }
            return
          }
        }
        throw profileError
      }

      // Redirect based on user type
      if (userType === "business") {
        router.push("/business/dashboard")
      } else {
        router.push("/advertiser/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded || !user || isCheckingProfile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#171717] p-6">
        <p className="text-[#D9D9D9]">Loading...</p>
      </div>
    )
  }

  return ( // onboarding form HTML
    <div className="flex min-h-screen w-full items-center justify-center bg-[#171717] p-6">
      <div className="w-full max-w-md">
        <Card className="border-[#D9D9D9]/20 bg-[#171717]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#D9D9D9]">Welcome, {user.firstName}!</CardTitle>
            <CardDescription className="text-[#D9D9D9]/70">
              Let's set up your Human Billboard account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label className="text-[#D9D9D9]">I want to...</Label>
                  <RadioGroup value={userType} onValueChange={(value) => setUserType(value as UserType)}>
                    <div className="flex items-center space-x-2 rounded-[5px] border border-[#D9D9D9]/20 p-3">
                      <RadioGroupItem value="advertiser" id="advertiser" className="border-[#8BFF61] text-[#8BFF61]" />
                      <Label htmlFor="advertiser" className="flex-1 cursor-pointer text-[#D9D9D9]">
                        <div className="font-medium">Wear merchandise & earn money</div>
                        <div className="text-sm text-[#D9D9D9]/70">I'm an advertiser</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-[5px] border border-[#D9D9D9]/20 p-3">
                      <RadioGroupItem value="business" id="business" className="border-[#8BFF61] text-[#8BFF61]" />
                      <Label htmlFor="business" className="flex-1 cursor-pointer text-[#D9D9D9]">
                        <div className="font-medium">Hire people to promote my brand</div>
                        <div className="text-sm text-[#D9D9D9]/70">I'm a business</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {userType === "business" && ( // conditionally show company name input
                  <div className="grid gap-2">
                    <Label htmlFor="companyName" className="text-[#D9D9D9]">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Acme Inc."
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="border-[#D9D9D9]/20 bg-[#171717] text-[#D9D9D9] placeholder:text-[#D9D9D9]/50"
                    />
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
                  disabled={isLoading}
                  style={{ borderRadius: "5px" }}
                >
                  {isLoading ? "Setting up..." : "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
