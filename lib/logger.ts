/**
 * Audit Logging Utility
 * 
 * Logs security-relevant events for monitoring and incident response
 * Include this in sensitive operations like:
 * - Campaign creation/deletion/updates
 * - Application approval/rejection
 * - User login/logout
 * - Failed authorization attempts
 */

export type LogLevel = "info" | "warn" | "error"
export type ResourceType = "campaign" | "application" | "user_profile" | "auth"
export type ActionType =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "LOGIN"
  | "LOGOUT"
  | "FAILED_AUTH"

export interface AuditLog {
  timestamp: string
  userId?: string
  action: ActionType
  resource: ResourceType
  resourceId: string
  status: "success" | "failure"
  level: LogLevel
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  errorMessage?: string
}

/**
 * Log an audit event
 * Use this for all security-relevant operations
 */
export async function logAction(
  userId: string | undefined,
  action: ActionType,
  resource: ResourceType,
  resourceId: string,
  status: "success" | "failure",
  options?: {
    level?: LogLevel
    ipAddress?: string
    userAgent?: string
    details?: Record<string, any>
    errorMessage?: string
  }
): Promise<void> {
  const log: AuditLog = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    resourceId,
    status,
    level: options?.level || (status === "failure" ? "warn" : "info"),
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    details: options?.details,
    errorMessage: options?.errorMessage,
  }

  // Log to console (in production, send to external service)
  const logLevel = log.level
  const logMessage = `[${log.timestamp}] ${log.action} ${log.resource}#${log.resourceId} - ${log.status}`

  if (logLevel === "error") {
    console.error(logMessage, log)
  } else if (logLevel === "warn") {
    console.warn(logMessage, log)
  } else {
    console.log(logMessage, log)
  }

  // TODO: Send to external logging service
  // - Sentry for error tracking
  // - LogRocket for session replay
  // - Custom audit log endpoint
  // Example:
  // if (process.env.AUDIT_LOG_ENDPOINT) {
  //   try {
  //     await fetch(process.env.AUDIT_LOG_ENDPOINT, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(log),
  //     })
  //   } catch (error) {
  //     console.error("Failed to send audit log:", error)
  //   }
  // }
}

/**
 * Log campaign creation
 */
export async function logCampaignCreation(
  businessId: string,
  campaignId: string,
  success: boolean,
  error?: string
): Promise<void> {
  await logAction(
    businessId,
    "CREATE",
    "campaign",
    campaignId,
    success ? "success" : "failure",
    {
      level: success ? "info" : "warn",
      errorMessage: error,
    }
  )
}

/**
 * Log campaign update
 */
export async function logCampaignUpdate(
  businessId: string,
  campaignId: string,
  changes: Record<string, any>,
  success: boolean,
  error?: string
): Promise<void> {
  await logAction(
    businessId,
    "UPDATE",
    "campaign",
    campaignId,
    success ? "success" : "failure",
    {
      level: success ? "info" : "warn",
      details: { changedFields: Object.keys(changes) },
      errorMessage: error,
    }
  )
}

/**
 * Log campaign deletion
 */
export async function logCampaignDeletion(
  businessId: string,
  campaignId: string,
  success: boolean,
  error?: string
): Promise<void> {
  await logAction(
    businessId,
    "DELETE",
    "campaign",
    campaignId,
    success ? "success" : "failure",
    {
      level: success ? "info" : "error",
      errorMessage: error,
    }
  )
}

/**
 * Log application submission
 */
export async function logApplicationSubmission(
  advertiserId: string,
  applicationId: string,
  campaignId: string,
  success: boolean,
  error?: string
): Promise<void> {
  await logAction(
    advertiserId,
    "CREATE",
    "application",
    applicationId,
    success ? "success" : "failure",
    {
      level: success ? "info" : "warn",
      details: { campaignId },
      errorMessage: error,
    }
  )
}

/**
 * Log application approval/rejection
 */
export async function logApplicationDecision(
  businessId: string,
  applicationId: string,
  decision: "APPROVE" | "REJECT",
  success: boolean,
  error?: string
): Promise<void> {
  await logAction(
    businessId,
    decision,
    "application",
    applicationId,
    success ? "success" : "failure",
    {
      level: success ? "info" : "warn",
      errorMessage: error,
    }
  )
}

/**
 * Log failed authorization attempt
 */
export async function logFailedAuthAttempt(
  userId: string | undefined,
  reason: string,
  ipAddress?: string
): Promise<void> {
  await logAction(
    userId,
    "FAILED_AUTH",
    "auth",
    userId || ipAddress || "unknown",
    "failure",
    {
      level: "warn",
      ipAddress,
      errorMessage: reason,
    }
  )
}

/**
 * Log user login
 */
export async function logLogin(userId: string, ipAddress?: string): Promise<void> {
  await logAction(userId, "LOGIN", "auth", userId, "success", {
    level: "info",
    ipAddress,
  })
}

/**
 * Log user logout
 */
export async function logLogout(userId: string, ipAddress?: string): Promise<void> {
  await logAction(userId, "LOGOUT", "auth", userId, "success", {
    level: "info",
    ipAddress,
  })
}
