"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface ApplicationActionsProps {
  applicationId: string
}

export default function ApplicationActions({ applicationId }: ApplicationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (status: "accepted" | "rejected") => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("applications").update({ status }).eq("id", applicationId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error updating application:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handleAction("accepted")}
        disabled={isLoading}
        className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
        style={{ borderRadius: "5px" }}
      >
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAction("rejected")}
        disabled={isLoading}
        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
        style={{ borderRadius: "5px" }}
      >
        Reject
      </Button>
    </div>
  )
}
