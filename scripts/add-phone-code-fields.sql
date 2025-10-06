-- Migration to add phone code fields and make content_value optional
-- Run this in your Supabase SQL Editor

-- Add phone code columns to form_submissions table
ALTER TABLE form_submissions 
ADD COLUMN IF NOT EXISTS sender_phone_code TEXT,
ADD COLUMN IF NOT EXISTS receiver_phone_code TEXT;

-- Make content_value nullable (optional)
ALTER TABLE form_submissions 
ALTER COLUMN content_value DROP NOT NULL;

-- Update any existing records with default phone codes if needed
UPDATE form_submissions 
SET sender_phone_code = '+90' 
WHERE sender_phone_code IS NULL;

UPDATE form_submissions 
SET receiver_phone_code = '+90' 
WHERE receiver_phone_code IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'form_submissions' 
AND column_name IN ('sender_phone_code', 'receiver_phone_code', 'content_value')
ORDER BY column_name;
