import Mailgun from "mailgun.js";
import formData from "form-data";

// Mailgun configuration
const mailgun = new Mailgun(formData);

interface EmailData {
  applicant_name: string;
  grant_title: string;
  application_id: string;
  submission_date: string;
  funding_amount: string;
  applicant_email: string;
  telegram_handle: string;
  support_url: string;
}

interface SendGrantConfirmationEmailParams {
  to: string;
  data: EmailData;
}

export async function sendGrantConfirmationEmail({
  to,
  data,
}: SendGrantConfirmationEmailParams) {
  try {
    // Check if Mailgun is configured
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      console.error(
        "Mailgun not configured. Missing MAILGUN_API_KEY or MAILGUN_DOMAIN"
      );
      throw new Error("Email service not configured");
    }

    // Initialize Mailgun client
    const mg = mailgun.client({
      username: "api",
      key: apiKey,
    });

    // Format the submission date
    const formattedDate = new Date(data.submission_date).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }
    );

    // Format funding amount for display
    const formattedFundingAmount = data.funding_amount
      .replace("under-5k", "Under $5,000")
      .replace("5k-10k", "$5,000 - $10,000")
      .replace("10k-25k", "$10,000 - $25,000")
      .replace("25k-50k", "$25,000 - $50,000")
      .replace("over-50k", "Over $50,000");

    // Prepare template variables
    // Include both the original variable names and the template-specific names
    const templateData = {
      // Original variable names (for backward compatibility)
      applicant_name: data.applicant_name,
      grant_title: data.grant_title,
      application_id: data.application_id,
      submission_date: formattedDate,
      funding_amount: formattedFundingAmount,
      applicant_email: data.applicant_email,
      telegram_handle: data.telegram_handle,
      support_url: data.support_url || "https://support.agora.vote",
      // Template-specific variable names
      org_name: process.env.ORG_NAME || "Syndicate Network Collective",
      submitted_on: formattedDate,
      contact_email: data.applicant_email,
    };

    // Send email using Mailgun template
    const result = await mg.messages.create(domain, {
      from: `Agora × Syndicate Grants <grants@${domain}>`,
      to: [to],
      subject: `Grant Application Received - ${data.grant_title}`,
      template: "grant-application-confirmation-syndicate",
      "h:X-Mailgun-Variables": JSON.stringify(templateData),
    });

    return result;
  } catch (error) {
    console.error("Failed to send grant confirmation email:", error);

    // Don't throw error to prevent blocking the application submission
    // Just log it for monitoring
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }

    // Return a failed status but don't throw
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function to validate email configuration
export function validateEmailConfig(): boolean {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  return !!(apiKey && domain);
}

// Test function for email sending (can be used for debugging)
export async function testEmailService() {
  const testData: EmailData = {
    applicant_name: "Test User",
    grant_title: "Test Grant Program",
    application_id: "test-123",
    submission_date: new Date().toISOString(),
    funding_amount: "10k-25k",
    applicant_email: "test@example.com",
    telegram_handle: "@testuser",
    support_url: "https://support.agora.vote",
  };

  if (!validateEmailConfig()) {
    return false;
  }

  return await sendGrantConfirmationEmail({
    to: "test@example.com",
    data: testData,
  });
}
