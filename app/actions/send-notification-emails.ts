"use server"

import { Resend } from "resend"

// Initialize Resend with API key (only accessible on server)
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const EMAIL_CONFIG = {
  from: "Human Billboard <onboarding@resend.dev>",
  dashboardUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // For testing without domain verification: use your own email
  // Set EMAIL_TEST_MODE=false in production after domain is verified
  testMode: process.env.EMAIL_TEST_MODE !== "false",
  testEmail: process.env.EMAIL_TEST_ADDRESS || "darwinv332@gmail.com",
} as const

/**
 * Send notification to business owner when someone applies for their campaign
 * Server Action - runs on server only, has access to environment variables
 */
export async function sendApplicationReceivedNotification(
  businessEmail: string,
  businessName: string,
  campaignTitle: string,
  applicantName: string,
  applicantMessage?: string
) {
  try {
    const dashboardUrl = `${EMAIL_CONFIG.dashboardUrl}/business/dashboard`
    // Use test email if in test mode, otherwise use business email
    const recipientEmail = EMAIL_CONFIG.testMode ? EMAIL_CONFIG.testEmail : businessEmail
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #171717; color: #D9D9D9; padding: 20px; border-radius: 5px;">
          <h1 style="color: #8BFF61; margin-bottom: 20px;">New Application Received! 🎉</h1>
          
          <p style="font-size: 16px; margin-bottom: 15px;">Hi ${businessName},</p>
          
          <p style="font-size: 16px; margin-bottom: 15px;">
            Great news! <strong>${applicantName}</strong> has applied for your campaign <strong style="color: #8BFF61;">${campaignTitle}</strong>.
          </p>
          
          ${
            applicantMessage
              ? `
            <div style="background-color: #2a2a2a; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="font-size: 14px; color: #D9D9D9; margin: 0 0 10px 0;"><strong>Message from applicant:</strong></p>
              <p style="font-size: 14px; color: #D9D9D9; margin: 0; font-style: italic;">${applicantMessage}</p>
            </div>
          `
              : ""
          }
          
          <div style="margin-bottom: 20px;">
            <a href="${dashboardUrl}" style="background-color: #8BFF61; color: #171717; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Review Application
            </a>
          </div>
          
          <p style="font-size: 14px; color: #D9D9D9; margin-bottom: 10px;">
            Log in to your Human Billboard dashboard to view the full application and respond.
          </p>
          
          <hr style="border-color: #D9D9D9; border-style: solid; margin: 20px 0;" />
          
          <p style="font-size: 12px; color: #D9D9D9; margin: 0;">© 2025 Human Billboard. All rights reserved.</p>
        </div>
      </div>
    `

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: recipientEmail,
      subject: `New Application: ${applicantName} applied for "${campaignTitle}"`,
      html: htmlContent,
    })

    if (result.error) {
      console.error("Error sending application received email:", result.error)
      return { success: false, error: result.error }
    }

    console.log(`Application received email sent to ${recipientEmail} (original: ${businessEmail})`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Failed to send application received notification:", error)
    return { success: false, error }
  }
}

/**
 * Send notification to advertiser when application is accepted/rejected
 * Server Action - runs on server only, has access to environment variables
 */
export async function sendApplicationStatusNotification(
  advertiserEmail: string,
  advertiserName: string,
  campaignTitle: string,
  businessName: string,
  status: "accepted" | "rejected"
) {
  try {
    const dashboardUrl = `${EMAIL_CONFIG.dashboardUrl}/advertiser/dashboard`
    // Use test email if in test mode, otherwise use advertiser email
    const recipientEmail = EMAIL_CONFIG.testMode ? EMAIL_CONFIG.testEmail : advertiserEmail
    const isAccepted = status === "accepted"
    const statusColor = isAccepted ? "#8BFF61" : "#ff6b6b"
    const statusText = isAccepted ? "Accepted" : "Rejected"
    const emoji = isAccepted ? "✅" : "❌"

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #171717; color: #D9D9D9; padding: 20px; border-radius: 5px;">
          <h1 style="color: ${statusColor}; margin-bottom: 20px;">Application ${statusText} ${emoji}</h1>
          
          <p style="font-size: 16px; margin-bottom: 15px;">Hi ${advertiserName},</p>
          
          <p style="font-size: 16px; margin-bottom: 15px;">
            Your application for <strong style="color: #8BFF61;">${campaignTitle}</strong> has been <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong> by <strong>${businessName}</strong>.
          </p>
          
          <div style="margin-bottom: 20px;">
            <a href="${dashboardUrl}" style="background-color: ${statusColor}; color: ${isAccepted ? "#171717" : "#fff"}; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              View Details
            </a>
          </div>
          
          <p style="font-size: 14px; color: #D9D9D9; margin-bottom: 10px;">
            Log in to your Human Billboard dashboard to see more details and next steps.
          </p>
          
          <hr style="border-color: #D9D9D9; border-style: solid; margin: 20px 0;" />
          
          <p style="font-size: 12px; color: #D9D9D9; margin: 0;">© 2025 Human Billboard. All rights reserved.</p>
        </div>
      </div>
    `

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: recipientEmail,
      subject: `Application ${status === "accepted" ? "Accepted ✅" : "Rejected ❌"}: ${campaignTitle}`,
      html: htmlContent,
    })

    if (result.error) {
      console.error("Error sending application status email:", result.error)
      return { success: false, error: result.error }
    }

    console.log(`Application status email sent to ${recipientEmail} (original: ${advertiserEmail})`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Failed to send application status notification:", error)
    return { success: false, error }
  }
}

/**
 * Send a test email to verify Resend is working
 * Server Action - runs on server only
 */
export async function sendTestEmail(recipientEmail: string) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: recipientEmail,
      subject: "Test Email from Human Billboard",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email to verify Resend is working correctly.</p>
          <p><strong>Email sent at:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    })

    if (result.error) {
      console.error("Error sending test email:", result.error)
      return { success: false, error: result.error }
    }

    console.log(`Test email sent to ${recipientEmail}`)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Failed to send test email:", error)
    return { success: false, error }
  }
}
