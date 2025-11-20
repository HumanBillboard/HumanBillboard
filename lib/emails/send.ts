import { Resend } from "resend"
import { ApplicationReceivedEmail, ApplicationStatusEmail } from "./templates"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration - separated for easy updates
const EMAIL_CONFIG = {
  from: "Human Billboard <onboarding@resend.dev>",
  dashboardUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const

/**
 * Send notification to business owner when someone applies for their campaign
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles sending application received emails
 * - Dependency Inversion: Depends on Resend abstraction, not email implementation
 */
export async function sendApplicationReceivedNotification(
  businessEmail: string,
  businessName: string,
  campaignTitle: string,
  applicantName: string,
  applicantMessage?: string
) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: businessEmail,
      subject: `New Application: ${applicantName} applied for "${campaignTitle}"`,
      react: ApplicationReceivedEmail({
        businessName,
        campaignTitle,
        applicantName,
        applicantMessage,
        dashboardUrl: `${EMAIL_CONFIG.dashboardUrl}/business/dashboard`,
      }),
    })

    if (result.error) {
      console.error("Error sending application received email:", result.error)
      return { success: false, error: result.error }
    }

    console.log(`Application received email sent to ${businessEmail}`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Failed to send application received notification:", error)
    return { success: false, error }
  }
}

/**
 * Send notification to advertiser when their application is accepted or rejected
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles sending application status emails
 * - Open/Closed: Easy to extend with new status types without modifying function
 * - Dependency Inversion: Depends on Resend abstraction, not email implementation
 */
export async function sendApplicationStatusNotification(
  advertiserEmail: string,
  advertiserName: string,
  campaignTitle: string,
  businessName: string,
  status: "accepted" | "rejected",
  message?: string
) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: advertiserEmail,
      subject: `Application ${status === "accepted" ? "Accepted" : "Rejected"}: ${campaignTitle}`,
      react: ApplicationStatusEmail({
        advertiserName,
        campaignTitle,
        businessName,
        status,
        message,
        dashboardUrl: `${EMAIL_CONFIG.dashboardUrl}/advertiser/dashboard`,
      }),
    })

    if (result.error) {
      console.error("Error sending application status email:", result.error)
      return { success: false, error: result.error }
    }

    console.log(`Application ${status} email sent to ${advertiserEmail}`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Failed to send application status notification:", error)
    return { success: false, error }
  }
}

/**
 * Send test email to verify Resend is working
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles sending test emails
 * - Interface Segregation: Minimal parameters needed for testing
 */
export async function sendTestEmail(toEmail: string) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: toEmail,
      subject: "Test Email from Human Billboard",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #171717; color: #D9D9D9; border-radius: 5px;">
          <h1 style="color: #8BFF61;">Test Email ✅</h1>
          <p>If you're seeing this, Resend is working correctly!</p>
          <p>Go back to your application to trigger real notifications.</p>
        </div>
      `,
    })

    if (result.error) {
      console.error("Error sending test email:", result.error)
      return { success: false, error: result.error }
    }

    console.log(`Test email sent to ${toEmail}`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Failed to send test email:", error)
    return { success: false, error }
  }
}
