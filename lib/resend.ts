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

// Lazy initialize Resend client to avoid build-time issues
let resendInstance: any = null;

export function getResendClient() {
  if (!resendInstance) {
    // Dynamic import to avoid build-time issues with @react-email dependencies
    const { Resend } = require('resend');
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// For backward compatibility
export const resend = {
  get emails() {
    return getResendClient().emails;
  }
}

