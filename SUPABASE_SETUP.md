# Supabase Setup Instructions

## 🔧 Quick Setup

The admin panel is currently showing **demo data** because Supabase is not configured. Follow these steps to connect your real database:

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NiIs...`)
   - **Service Role Key** (for admin operations)

### 2. Create Environment File

Create a file named `.env.local` in your project root with:

```env
# OpenAI API Key (existing)
OPENAI_API_KEY=your_existing_openai_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Restart Development Server

```bash
npm run dev
```

### 4. Test Connection

Visit `/admin/debug` to verify your connection is working.

## 🗄️ Database Schema

Your current orders table structure is already detected:

```sql
Table: orders
- id (uuid)
- sender_name (text)
- sender_tc (text)
- sender_address (text)
- sender_contact (text)
- receiver_name (text)
- receiver_address (text)
- city_postal (text)
- destination (text)
- receiver_contact (text)
- receiver_email (text)
- content_description (text)
- content_value (text)
- user_type (text)
- user_email (text)
- user_id (text)
- status (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## ✅ What Will Work After Setup

- **Real-time data** from your Supabase orders table
- **Live status updates** (pending → processing → shipped → delivered)
- **User management** with customer statistics
- **Search and filtering** across all orders
- **Data persistence** - all changes saved to database

## 🚨 Current Status

- ✅ **Admin panel interface** - fully functional
- ✅ **Demo data** - showing sample orders
- ⏳ **Database connection** - needs environment variables
- ⏳ **Real data** - waiting for Supabase setup

## 🔗 Quick Links

- **Admin Panel**: `/admin`
- **Form Submissions**: `/admin/shipping-orders`
- **Debug Page**: `/admin/debug`
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)

---

Once you add the environment variables, the admin panel will automatically switch from demo data to your real Supabase data!
