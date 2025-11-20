"use client"

import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileAvatarProps {
  src: string | null
  alt: string
  fallback: string
  size?: "sm" | "md" | "lg" | "xl"
}

/**
 * ProfileAvatar - Reusable avatar component
 * Displays profile picture with fallback initials
 * Implements responsive sizing
 */
export function ProfileAvatar({
  src,
  alt,
  fallback,
  size = "md",
}: ProfileAvatarProps) {
  const sizeMap = {
    sm: { container: "h-8 w-8", text: "text-xs" },
    md: { container: "h-12 w-12", text: "text-sm" },
    lg: { container: "h-24 w-24", text: "text-lg" },
    xl: { container: "h-32 w-32", text: "text-2xl" },
  }

  const { container, text } = sizeMap[size]

  return (
    <Avatar className={`${container} bg-[#8BFF61]`}>
      {src && (
        <AvatarImage
          src={src}
          alt={alt}
          className="object-cover"
        />
      )}
      <AvatarFallback className={`${text} font-semibold text-[#171717]`}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  )
}
