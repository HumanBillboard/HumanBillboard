"use server"

import { updateProfile } from "@/lib/profile/profile-repository"
import { advertiserProfileSchema, businessProfileSchema } from "@/lib/validation"
import type { UserProfile } from "@/lib/types"

/**
 * ProfileService - Business logic layer
 * Implements Service layer pattern for profile operations
 * Single Responsibility: Orchestrates validation and persistence
 * Abstraction: Hides complexity of validation and data saving
 */

/**
 * Update advertiser profile with validation
 * Uses dedicated schema for type-specific validation
 * @param userId User ID to update
 * @param data Form data to validate and save
 */
export async function updateAdvertiserProfile(
  userId: string,
  data: unknown
): Promise<void> {
  // Validate data against advertiser schema
  const validatedData = advertiserProfileSchema.parse(data)

  // Persist to database
  await updateProfile(userId, {
    full_name: validatedData.full_name,
    email: validatedData.email,
    phone: validatedData.phone,
    city: validatedData.city,
    state: validatedData.state,
  })
}

/**
 * Update business profile with validation
 * Uses dedicated schema for type-specific validation
 * @param userId User ID to update
 * @param data Form data to validate and save
 */
export async function updateBusinessProfile(
  userId: string,
  data: unknown
): Promise<void> {
  // Validate data against business schema
  const validatedData = businessProfileSchema.parse(data)

  // Persist to database
  await updateProfile(userId, {
    company_name: validatedData.company_name,
    email: validatedData.email,
    phone: validatedData.phone,
    industry: validatedData.industry,
    description: validatedData.description,
    address: validatedData.address,
    city: validatedData.city,
    state: validatedData.state,
  })
}
