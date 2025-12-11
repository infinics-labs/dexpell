// Test Resend Email Integration
// Run this with: node test-email.js

const testEmail = async () => {
  console.log('📧 Testing Resend Email Integration...\n');

  // Load environment variables
  require('dotenv').config({ path: '.env' });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL || 'ozgur@athlos.ai';

  console.log('🔍 Email Configuration:');
  console.log('   - API Key:', RESEND_API_KEY ? '✅ Set (starts with: ' + RESEND_API_KEY.substring(0, 10) + '...)' : '❌ Not set');
  console.log('   - From:', RESEND_FROM_EMAIL);
  console.log('   - To:', RESEND_TO_EMAIL);
  console.log('');

  if (!RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY is not set!');
    console.log('   Please set it in your .env file');
    return;
  }

  try {
    console.log('📤 Sending test email via Resend API...\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [RESEND_TO_EMAIL],
        subject: '🧪 Test Email from Dexpell Form Submission System',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Email System Test</h1>
                <p>Testing Resend Email Integration</p>
              </div>
              <div class="content">
                <div class="success-badge">✅ Email System Working!</div>
                
                <div class="info-box">
                  <h3>📋 Test Details:</h3>
                  <p><strong>Test Time:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}</p>
                  <p><strong>From:</strong> ${RESEND_FROM_EMAIL}</p>
                  <p><strong>To:</strong> ${RESEND_TO_EMAIL}</p>
                  <p><strong>System:</strong> Dexpell Cargo Form Submission</p>
                </div>

                <h3>🎉 What This Means:</h3>
                <ul>
                  <li>✅ Resend API is configured correctly</li>
                  <li>✅ Email sending is working</li>
                  <li>✅ Form submission notifications will be sent</li>
                  <li>✅ Your email integration is independent of Supabase</li>
                </ul>

                <div class="info-box" style="border-left-color: #f59e0b;">
                  <h4>📬 When Will You Receive Emails?</h4>
                  <p>Automatic email notifications are sent when:</p>
                  <ol>
                    <li>A customer submits the shipping request form</li>
                    <li>Form includes all required information</li>
                    <li>Database save is successful</li>
                  </ol>
                  <p>Email includes: sender info, receiver info, shipment details, weight breakdown, selected carrier, and pricing.</p>
                </div>

                <div class="footer">
                  <p><strong>Dexpell Cargo System</strong></p>
                  <p>Automated Test Email - No Action Required</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Email sent successfully!\n');
      console.log('📧 Email Details:');
      console.log('   - Email ID:', data.id);
      console.log('   - From:', RESEND_FROM_EMAIL);
      console.log('   - To:', RESEND_TO_EMAIL);
      console.log('   - Status:', response.status, response.statusText);
      console.log('\n🎉 Check your inbox at:', RESEND_TO_EMAIL);
      console.log('   (It may take a few seconds to arrive)');
      console.log('\n✅ Email integration is working correctly!');
      console.log('   Form submissions will automatically send email notifications.');
    } else {
      console.log('❌ ERROR! Failed to send email\n');
      console.log('Status:', response.status, response.statusText);
      console.log('Error:', JSON.stringify(data, null, 2));
      console.log('\nCommon Issues:');
      console.log('1. Invalid API key');
      console.log('2. From email not verified in Resend dashboard');
      console.log('3. Rate limit exceeded');
      console.log('\n💡 Tip: Check your Resend dashboard at https://resend.com/emails');
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR!\n');
    console.log('Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. You have internet connection');
    console.log('2. Resend API is accessible');
    console.log('3. Your API key is valid');
  }
};

// Check if dotenv is available
try {
  require('dotenv');
} catch (e) {
  console.log('⚠️  dotenv package not found. Install it with: npm install dotenv');
  process.exit(1);
}

// Run the test
testEmail();
