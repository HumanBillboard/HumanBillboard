/**
 * Rate Limiting Utilities
 * 
 * This module provides rate limiting for various endpoints to protect against:
 * - Brute force attacks
 * - DoS/DDoS attacks
 * - API abuse (Burp Suite, automated tools)
 * - Resource exhaustion
 * 
 * Uses Upstash Redis for production-ready rate limiting.
 * Configure via environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 * 
 * Sign up free at: https://console.upstash.com
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Check if required environment variables are set
const hasRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

// Initialize Redis client (production)
let redis: Redis | null = null

if (hasRedisConfig) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  } catch (error) {
    console.warn("Redis initialization failed, rate limiting disabled:", error)
  }
}

/**
 * Global rate limiter: 100 requests per hour per IP
 * Applies to all endpoints
 */
export const globalRatelimit = hasRedisConfig
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      analytics: true,
      prefix: "ratelimit:global",
    })
  : null

/**
 * Campaign creation limiter: 5 campaigns per business per day
 * Prevents spam and resource exhaustion
 */
export const campaignCreationRatelimit = hasRedisConfig
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 d"),
      analytics: true,
      prefix: "ratelimit:campaign:create",
    })
  : null

/**
 * Campaign update limiter: 20 updates per business per hour
 * Prevents abuse of edit functionality
 */
export const campaignUpdateRatelimit = hasRedisConfig
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "ratelimit:campaign:update",
    })
  : null

/**
 * Application submission limiter: 10 applications per advertiser per hour
 * Prevents spam applications
 */
export const applicationRatelimit = hasRedisConfig
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:application",
    })
  : null

/**
 * Login attempt limiter: 5 failed attempts per email per 15 minutes
 * Prevents brute force attacks on authentication
 */
export const loginRatelimit = hasRedisConfig
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:login",
    })
  : null

/**
 * Helper function to safely check rate limit
 * Fails open (allows request) if rate limiting service is down
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter: number
}> {
  if (!limiter) {
    // Rate limiting disabled, allow request
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      retryAfter: 0,
    }
  }

  try {
    const result = await limiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? 0 : Math.ceil((result.reset - Date.now()) / 1000),
    }
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // Fail open: allow request if rate limiting service is down
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      retryAfter: 0,
    }
  }
}

/**
 * Extract client IP from request headers
 * Handles proxies like Cloudflare, Vercel, etc.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  const realIp = headers.get("x-real-ip")
  const cfIp = headers.get("cf-connecting-ip")

  return (forwarded?.split(",")[0] || realIp || cfIp || "unknown").trim()
}

/**
 * Configuration for rate limiting thresholds
 * Adjust based on your use case
 */
export const RATE_LIMIT_CONFIG = {
  // Campaign creation: max 5 per day per business
  CAMPAIGN_CREATION_PER_DAY: 5,
  // Campaign updates: max 20 per hour per business
  CAMPAIGN_UPDATES_PER_HOUR: 20,
  // Applications: max 10 per hour per advertiser
  APPLICATIONS_PER_HOUR: 10,
  // Global: max 100 requests per hour per IP
  GLOBAL_REQUESTS_PER_HOUR: 100,
  // Login attempts: max 5 per 15 minutes per email
  LOGIN_ATTEMPTS_PER_15MIN: 5,
}
