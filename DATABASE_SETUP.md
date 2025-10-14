# Database Setup Instructions

## Running the SQL Schema in Supabase

Since you're using Clerk for authentication instead of Supabase Auth, you need to run the updated schema.

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project: `aumxcpyawxlfxfnsfbqt`
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Schema Script

Copy the entire contents of `scripts/002_clerk_supabase_schema.sql` and paste it into the SQL editor, then click **"Run"** (or press Cmd/Ctrl + Enter).

This will:
- Drop any existing tables (if they exist from old Supabase Auth setup)
- Create new tables compatible with Clerk authentication:
  - `user_profiles` - User data (id is TEXT to match Clerk's user IDs)
  - `campaigns` - Campaign postings from businesses
  - `applications` - Applications from advertisers
- Create indexes for performance
- Disable RLS (since we're using Clerk, not Supabase Auth)
- Create triggers to auto-update `updated_at` timestamps

### Step 3: Verify Tables Were Created

After running the script, you should see in the left sidebar under **"Table Editor"**:
- ✅ `user_profiles`
- ✅ `campaigns`
- ✅ `applications`

### Step 4: Test the App

Once the tables are created:
1. Go back to your app: `http://localhost:3000`
2. Click "Get started" and create a new account
3. Complete the onboarding (select Advertiser or Business)
4. You should be redirected to your dashboard!

### Important Notes

**Why is `user_profiles.id` TEXT instead of UUID?**
- Clerk user IDs look like: `user_2abc123def456...`
- They're strings, not UUIDs
- We store them as TEXT in Supabase

**Why is RLS disabled?**
- Supabase RLS policies use `auth.uid()` which only works with Supabase Auth
- Since we're using Clerk, we handle authorization in our Next.js app
- The Supabase anon key still protects your database from public access

**Alternative: Enable RLS with Service Role**
If you want RLS protection, you can use the service role key. See the commented section at the bottom of the SQL file.

### Troubleshooting

**If you get a "relation already exists" error:**
The script drops and recreates tables. If you have important data, back it up first!

**If you get a "permission denied" error:**
Make sure you're logged into the correct Supabase project.

**If the app still shows 404 errors:**
1. Verify tables exist in Supabase Table Editor
2. Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct in `.env.local`
3. Restart your dev server
