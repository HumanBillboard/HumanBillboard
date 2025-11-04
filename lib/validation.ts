import { z } from "zod"

/**
 * Campaign validation schema
 * Ensures campaigns have valid, safe input
 */
export const campaignSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters")
    .trim(),
  compensation_amount: z
    .number()
    .min(0.01, "Compensation must be at least $0.01")
    .max(10000, "Compensation cannot exceed $10,000"),
  compensation_type: z.enum(["hourly", "daily", "per_event"]),
  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(100, "Location must be less than 100 characters")
    .trim(),
  duration_hours: z
    .number()
    .nullable()
    .refine(
      (val) => !val || (val > 0 && val <= 168),
      "Duration must be between 1 and 168 hours (7 days)"
    ),
  requirements: z
    .string()
    .max(1000, "Requirements must be less than 1000 characters")
    .nullable()
    .transform((val) => val || null),
  status: z.enum(["active", "paused", "closed"]).optional(),
})

/**
 * Application validation schema
 * Ensures applications have valid messages
 */
export const applicationSchema = z.object({
  message: z
    .string()
    .max(1000, "Message must be less than 1000 characters")
    .nullable()
    .transform((val) => val || null),
})

/**
 * Onboarding validation schema
 * Ensures user type and company name are valid
 */
export const onboardingSchema = z
  .object({
    userType: z.enum(["business", "advertiser"]),
    companyName: z
      .string()
      .max(100, "Company name must be less than 100 characters")
      .nullable(),
  })
  .refine(
    (data) => data.userType === "advertiser" || data.companyName,
    {
      message: "Company name is required for business users",
      path: ["companyName"],
    }
  )

/**
 * Sanitizes input to prevent XSS and injection attacks
 * Removes potentially dangerous characters and truncates length
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return (
    input
      .trim()
      .slice(0, maxLength)
      // Remove potentially dangerous HTML/script characters
      .replace(/[<>\"']/g, "")
  )
}

/**
 * Validates email format
 */
export const emailSchema = z.string().email("Invalid email address")

/**
 * Validates phone number (basic)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
  .optional()
  .nullable()

export type Campaign = z.infer<typeof campaignSchema>
export type Application = z.infer<typeof applicationSchema>
export type Onboarding = z.infer<typeof onboardingSchema>
