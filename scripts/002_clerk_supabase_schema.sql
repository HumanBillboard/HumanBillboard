-- ===================================================================
-- HUMAN BILLBOARD DATABASE SCHEMA (Clerk + Supabase)
-- ===================================================================
-- This script creates tables for the Human Billboard app
-- Authentication is handled by Clerk
-- Database operations are handled by Supabase
-- ===================================================================

-- Drop existing policies and tables if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business users can delete their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can view their own applications" ON applications;
DROP POLICY IF EXISTS "Business users can view applications to their campaigns" ON applications;
DROP POLICY IF EXISTS "Advertisers can create applications" ON applications;

DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ===================================================================
-- USER PROFILES TABLE
-- ===================================================================
-- Stores user information linked to Clerk user IDs
-- The 'id' field matches Clerk's userId (not UUID, but TEXT)
-- ===================================================================

CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID (e.g., "user_2abc123...")
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('business', 'advertiser')),
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- CAMPAIGNS TABLE
-- ===================================================================
-- Stores campaigns created by business users
-- ===================================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  compensation_amount DECIMAL(10, 2) NOT NULL,
  compensation_type TEXT NOT NULL CHECK (compensation_type IN ('hourly', 'daily', 'per_event')),
  location TEXT NOT NULL,
  duration_hours INTEGER,
  requirements TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- APPLICATIONS TABLE
-- ===================================================================
-- Stores applications from advertisers to campaigns
-- ===================================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  advertiser_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, advertiser_id)
);

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX idx_applications_advertiser_id ON applications(advertiser_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) - DISABLED FOR CLERK AUTH
-- ===================================================================
-- Since we're using Clerk for authentication, we disable RLS
-- and handle authorization in the application layer.
-- Supabase RLS policies use auth.uid() which only works with Supabase Auth.
-- ===================================================================

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- ===================================================================
-- ALTERNATIVE: If you want to use RLS with service role key
-- ===================================================================
-- You can enable RLS and create policies that allow access with service_role key
-- Uncomment the following if you want basic RLS protection:

-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Enable all access for service role" ON user_profiles FOR ALL USING (true);
-- CREATE POLICY "Enable all access for service role" ON campaigns FOR ALL USING (true);
-- CREATE POLICY "Enable all access for service role" ON applications FOR ALL USING (true);

-- ===================================================================
-- FUNCTIONS AND TRIGGERS
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- SAMPLE DATA (Optional - Comment out for production)
-- ===================================================================
-- Uncomment to insert sample data for testing:

-- INSERT INTO user_profiles (id, email, full_name, user_type, company_name) VALUES
-- ('user_clerk_sample_business', 'business@example.com', 'Jane Business', 'business', 'Acme Corp'),
-- ('user_clerk_sample_advertiser', 'advertiser@example.com', 'John Advertiser', 'advertiser', NULL);
