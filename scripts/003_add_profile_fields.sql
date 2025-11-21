-- Migration: Add additional profile fields for business and advertiser profiles
-- This migration adds fields for:
-- - Business profiles: industry, description, address
-- - Advertiser profiles: city, state

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;
