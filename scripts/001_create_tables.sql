-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('business', 'advertiser')),
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table for business users to post opportunities
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
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

-- Create applications table for advertisers to apply to campaigns
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, advertiser_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_advertiser_id ON applications(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON campaigns FOR SELECT
  USING (status = 'active' OR business_id = auth.uid());

CREATE POLICY "Business users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "Business users can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (business_id = auth.uid());

CREATE POLICY "Business users can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (business_id = auth.uid());

-- RLS Policies for applications
CREATE POLICY "Advertisers can view their own applications"
  ON applications FOR SELECT
  USING (advertiser_id = auth.uid());

CREATE POLICY "Business users can view applications to their campaigns"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = applications.campaign_id
      AND campaigns.business_id = auth.uid()
    )
  );

CREATE POLICY "Advertisers can create applications"
  ON applications FOR INSERT
  WITH CHECK (advertiser_id = auth.uid());

CREATE POLICY "Advertisers can update their own applications"
  ON applications FOR UPDATE
  USING (advertiser_id = auth.uid());

CREATE POLICY "Business users can update applications to their campaigns"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = applications.campaign_id
      AND campaigns.business_id = auth.uid()
    )
  );
