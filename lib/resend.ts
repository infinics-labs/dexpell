import { Resend } from 'resend';

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

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

