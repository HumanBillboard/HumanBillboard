"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import type { UserProfile } from "@/lib/types"

/**
 * ProfileFormState - Generic state shape for profile forms
 * Allows different profile types while maintaining consistent interface
 */
export interface ProfileFormState {
  [key: string]: string
}

/**
 * UseProfileFormResult - Return type for profile form hook
 * Generic composition to support multiple profile types
 */
export interface UseProfileFormResult<T extends ProfileFormState> {
  formData: T
  setFormData: (data: T) => void
  isLoading: boolean
  error: string | null
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

/**
 * useProfileForm - Reusable profile form logic hook
 * Implements composition pattern to eliminate code duplication
 * Dependency Inversion: Takes strategy functions as parameters
 * Generic: Supports different profile types with type safety
 *
 * @template T - Profile form state type
 * @param initialData - Initial form data from profile
 * @param onSubmit - Async function to handle form submission (strategy pattern)
 * @param schema - Zod schema for validation (dependency injection)
 */
export function useProfileForm<T extends ProfileFormState>(
  initialData: T,
  onSubmit: (data: T) => Promise<void>,
  schema: z.ZodSchema
): UseProfileFormResult<T> {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<T>(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate with provided schema
      schema.parse(formData)

      // Execute submission strategy
      await onSubmit(formData)

      // Refresh page data
      router.refresh()
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    formData,
    setFormData,
    isLoading,
    error,
    handleSubmit,
  }
}
