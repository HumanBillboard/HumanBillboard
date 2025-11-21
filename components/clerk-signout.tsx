"use client"

import React from "react"
import { SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default function ClerkSignOut() {
  return (
    <SignOutButton>
      <Button
        type="button"
        variant="ghost"
        className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10"
        style={{ borderRadius: "5px" }}
      >
        Sign out
      </Button>
    </SignOutButton>
  )
}
