interface ApplicationReceivedEmailProps {
  businessName: string
  campaignTitle: string
  applicantName: string
  applicantMessage?: string
  dashboardUrl: string
}

export const ApplicationReceivedEmail = ({
  businessName,
  campaignTitle,
  applicantName,
  applicantMessage,
  dashboardUrl,
}: ApplicationReceivedEmailProps) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
    <div style={{ backgroundColor: "#171717", color: "#D9D9D9", padding: "20px", borderRadius: "5px" }}>
      <h1 style={{ color: "#8BFF61", marginBottom: "20px" }}>New Application Received! 🎉</h1>

      <p style={{ fontSize: "16px", marginBottom: "15px" }}>Hi {businessName},</p>

      <p style={{ fontSize: "16px", marginBottom: "15px" }}>
        Great news! <strong>{applicantName}</strong> has applied for your campaign{" "}
        <strong style={{ color: "#8BFF61" }}>{campaignTitle}</strong>.
      </p>

      {applicantMessage && (
        <div style={{ backgroundColor: "#2a2a2a", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", color: "#D9D9D9", margin: "0 0 10px 0" }}>
            <strong>Message from applicant:</strong>
          </p>
          <p style={{ fontSize: "14px", color: "#D9D9D9", margin: "0", fontStyle: "italic" }}>{applicantMessage}</p>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <a
          href={dashboardUrl}
          style={{
            backgroundColor: "#8BFF61",
            color: "#171717",
            padding: "12px 24px",
            borderRadius: "5px",
            textDecoration: "none",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          Review Application
        </a>
      </div>

      <p style={{ fontSize: "14px", color: "#D9D9D9", marginBottom: "10px" }}>
        Log in to your Human Billboard dashboard to view the full application and respond.
      </p>

      <hr style={{ borderColor: "#D9D9D9", borderStyle: "solid", margin: "20px 0" }} />

      <p style={{ fontSize: "12px", color: "#D9D9D9", margin: "0" }}>
        © 2025 Human Billboard. All rights reserved.
      </p>
    </div>
  </div>
)

interface ApplicationStatusEmailProps {
  advertiserName: string
  campaignTitle: string
  businessName: string
  status: "accepted" | "rejected"
  dashboardUrl: string
  message?: string
}

export const ApplicationStatusEmail = ({
  advertiserName,
  campaignTitle,
  businessName,
  status,
  dashboardUrl,
  message,
}: ApplicationStatusEmailProps) => {
  const isAccepted = status === "accepted"
  const statusColor = isAccepted ? "#8BFF61" : "#ff6b6b"
  const statusText = isAccepted ? "Accepted" : "Rejected"
  const emoji = isAccepted ? "✅" : "❌"

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#171717", color: "#D9D9D9", padding: "20px", borderRadius: "5px" }}>
        <h1 style={{ color: statusColor, marginBottom: "20px" }}>
          Application {statusText} {emoji}
        </h1>

        <p style={{ fontSize: "16px", marginBottom: "15px" }}>Hi {advertiserName},</p>

        <p style={{ fontSize: "16px", marginBottom: "15px" }}>
          Your application for <strong style={{ color: "#8BFF61" }}>{campaignTitle}</strong> has been{" "}
          <strong style={{ color: statusColor }}>{statusText.toLowerCase()}</strong> by <strong>{businessName}</strong>.
        </p>

        {message && (
          <div style={{ backgroundColor: "#2a2a2a", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
            <p style={{ fontSize: "14px", color: "#D9D9D9", margin: "0 0 10px 0" }}>
              <strong>Message from {businessName}:</strong>
            </p>
            <p style={{ fontSize: "14px", color: "#D9D9D9", margin: "0", fontStyle: "italic" }}>{message}</p>
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <a
            href={dashboardUrl}
            style={{
              backgroundColor: statusColor,
              color: isAccepted ? "#171717" : "#fff",
              padding: "12px 24px",
              borderRadius: "5px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            View Details
          </a>
        </div>

        <p style={{ fontSize: "14px", color: "#D9D9D9", marginBottom: "10px" }}>
          Log in to your Human Billboard dashboard to see more details and next steps.
        </p>

        <hr style={{ borderColor: "#D9D9D9", borderStyle: "solid", margin: "20px 0" }} />

        <p style={{ fontSize: "12px", color: "#D9D9D9", margin: "0" }}>
          © 2025 Human Billboard. All rights reserved.
        </p>
      </div>
    </div>
  )
}
