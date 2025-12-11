# 📧 Email System Information

## ✅ Current Status: WORKING

**Last Tested**: December 11, 2025
**Test Email ID**: `8e8fc949-42d9-4575-837e-37a5ceb3ac7b`
**Status**: Email sent successfully ✅

---

## 🔧 Configuration

### Environment Variables (.env)

```env
RESEND_API_KEY=re_QurqujD4_JbEhTpydjtziJ94qr1n5smD2
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=seling@dexpell.com
```

### Email Settings

- **Provider**: Resend (https://resend.com)
- **Sender**: `onboarding@resend.dev`
- **Recipient**: `seling@dexpell.com`
- **API**: Direct REST API integration (no package dependency)

---

## 🔗 Is Email Related to Supabase?

### ❌ NO - They Are Independent!

- **Supabase**: Database for storing form submissions
- **Resend**: Email service for sending notifications
- **No Connection**: Changing Supabase does NOT affect email

**How They Work Together**:
```
Form Submission
    ↓
Save to Supabase (Database) ✅
    ↓
Send Email via Resend ✅
```

If Supabase fails → Email won't be sent (form submission failed)
If Resend fails → Data still saved to Supabase (form submission succeeds)

---

## 📬 When Are Emails Sent?

Automatic email notifications are sent when:

1. ✅ Customer submits shipping request form at `/gonderi-talep-formu`
2. ✅ All required fields are filled
3. ✅ Form validation passes
4. ✅ Data successfully saved to Supabase
5. ✅ RESEND_API_KEY is configured

### Email Trigger Location:
**File**: `/app/api/admin/form-submissions/route.ts`
**Lines**: 184-246

---

## 📧 Email Content

### Subject:
```
🚚 New Shipment Request - [Sender Name] to [Destination]
```

### Includes:

#### 📤 Sender Information
- Full name
- TC/Tax number
- Address
- Contact number (with country code)

#### 📥 Receiver Information
- Full name
- Email address
- Contact number (with country code)
- Destination country
- City & Postal code
- Address

#### 📦 Shipment Information
- Content description
- Content value (if provided)
- Package quantity

#### ⚖️ Weight Details (Enhanced!)
- **Actual Weight**: Physical weight (✓ if used for calculation)
- **Volumetric Weight**: Dimensional weight (✓ if used for calculation)
- **Chargeable Weight**: Final weight used for pricing (highlighted)
- **Total Weight**: Combined weight

#### 💰 Selected Carrier (if selected)
- Carrier name (UPS/DHL/ARAMEX)
- Service type
- Total price
- Region code

#### 🆔 Metadata
- Submission ID
- Submission timestamp

---

## 🧪 Testing Email

### Test Email Function:
```bash
node test-email.js
```

This will:
- ✅ Check if RESEND_API_KEY is set
- ✅ Send a test email to configured recipient
- ✅ Verify email delivery
- ✅ Show email ID and status

### Test Complete Flow (Form + Email):
```bash
node test-form-submission.js
```

This will:
- ✅ Simulate form submission
- ✅ Save to database
- ✅ Trigger email notification
- ✅ Show results

### Manual Test:
1. Go to `http://localhost:3000/gonderi-talep-formu`
2. Fill out the form
3. Submit
4. Check `seling@dexpell.com` inbox
5. Email should arrive in 1-30 seconds

---

## 🚨 Troubleshooting

### Email Not Received?

**Check 1: API Key**
```bash
grep RESEND_API_KEY .env
```
Should show: `RESEND_API_KEY=re_...`

**Check 2: Test Email**
```bash
node test-email.js
```
Should show: ✅ SUCCESS!

**Check 3: Server Logs**
Look for in terminal:
```
📧 Preparing email with form data:
✅ Email notification sent successfully!
📧 Email ID: [uuid]
```

**Check 4: Resend Dashboard**
1. Go to https://resend.com/emails
2. Login with your account
3. Check recent emails
4. Verify delivery status

### Common Issues:

#### 1. Email Not Configured
**Error**: `ℹ️  Email notifications disabled (RESEND_API_KEY not configured)`
**Solution**: Add RESEND_API_KEY to .env file

#### 2. Invalid API Key
**Error**: `401 Unauthorized`
**Solution**: Check API key in Resend dashboard, regenerate if needed

#### 3. From Email Not Verified
**Error**: `403 Forbidden` or `Domain not verified`
**Solution**: 
- Use `onboarding@resend.dev` (always works)
- OR verify your domain in Resend dashboard

#### 4. Rate Limit
**Error**: `429 Too Many Requests`
**Solution**: Wait a few minutes, Resend free tier has limits

---

## 📊 Email Flow Diagram

```
User Fills Form
      ↓
Clicks Submit
      ↓
POST /api/admin/form-submissions
      ↓
Validate Form Data
      ↓
Insert to Supabase ✅
      ↓
Check RESEND_API_KEY?
      ↓
   Yes → Generate Email HTML
      ↓
   Send via Resend API
      ↓
   Log Result
      ↓
Return Success to User
```

---

## 🔐 Security Notes

1. **API Key**: Never commit RESEND_API_KEY to git
2. **From Email**: Use verified domain for production
3. **To Email**: Can be comma-separated list for multiple recipients
4. **Reply-To**: Set to customer's email for easy replies

---

## 📝 Customization

### Change Recipient Email:
Edit `.env`:
```env
RESEND_TO_EMAIL=your-email@domain.com
```

### Change Sender Email:
1. Verify your domain in Resend dashboard
2. Edit `.env`:
```env
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Customize Email Template:
Edit file: `/lib/email-templates/shipment-notification.ts`

### Disable Emails:
Remove or comment out RESEND_API_KEY in `.env`

---

## 💡 Tips

1. **Test Mode**: Use `onboarding@resend.dev` as sender for testing
2. **Production**: Use your own verified domain
3. **Multiple Recipients**: Set `RESEND_TO_EMAIL=email1@domain.com,email2@domain.com`
4. **Monitoring**: Check Resend dashboard for delivery analytics
5. **Logs**: Server logs show detailed email sending process

---

## 📞 Support

- **Resend Docs**: https://resend.com/docs
- **Resend Dashboard**: https://resend.com/emails
- **Status Page**: https://status.resend.com

---

**Last Updated**: December 11, 2025
**Status**: ✅ Fully Operational
