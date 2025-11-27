// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  to: process.env.RESEND_TO_EMAIL || 'ozgur@athlos.ai',
};

// Validate email configuration
export function validateEmailConfig() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY is not set. Email functionality will not work.');
    return false;
  }
  return true;
}

// Email sending interface (using native fetch instead of resend package)
interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

interface EmailResponse {
  data?: { id: string };
  error?: { message: string };
}

// Send email using Resend API directly via fetch
async function sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return { error: { message: 'RESEND_API_KEY is not configured' } };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: { message: data.message || 'Failed to send email' } };
    }

    return { data: { id: data.id } };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

// Compatible API with the old resend package
export const resend = {
  emails: {
    send: sendEmail,
  },
};
