-- Migration: Add profile picture support
-- Adds profile_picture_url column to store references to uploaded images

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;