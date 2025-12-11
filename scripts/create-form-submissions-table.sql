-- Create form_submissions table for storing shipment request form data
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS form_submissions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sender Information
  sender_name TEXT NOT NULL,
  sender_tc TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_contact TEXT NOT NULL,
  sender_phone_code TEXT DEFAULT '+90',
  
  -- Receiver Information
  receiver_name TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  city_postal TEXT NOT NULL,
  destination TEXT NOT NULL,
  receiver_contact TEXT NOT NULL,
  receiver_phone_code TEXT DEFAULT '+90',
  receiver_email TEXT NOT NULL,
  
  -- Shipment Information
  content_description TEXT NOT NULL,
  content_value NUMERIC(10, 2),
  
  -- User Information
  user_type TEXT DEFAULT 'guest',
  user_email TEXT,
  user_id UUID,
  
  -- Status
  status TEXT DEFAULT 'pending',
  
  -- Selected Carrier Information
  selected_carrier TEXT,
  selected_quote JSONB,
  destination_country TEXT,
  package_quantity INTEGER,
  
  -- Weight Information (Enhanced)
  actual_weight NUMERIC(10, 2),
  volumetric_weight NUMERIC(10, 2),
  chargeable_weight NUMERIC(10, 2),
  total_weight NUMERIC(10, 2),
  calculation_method TEXT, -- 'actual' or 'volumetric'
  
  -- Pricing Information
  cargo_price NUMERIC(10, 2),
  service_type TEXT,
  region TEXT,
  
  -- Metadata
  price_card_timestamp BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  CONSTRAINT valid_user_type CHECK (user_type IN ('guest', 'registered')),
  CONSTRAINT valid_calculation_method CHECK (calculation_method IS NULL OR calculation_method IN ('actual', 'volumetric'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_sender_name ON form_submissions(sender_name);
CREATE INDEX IF NOT EXISTS idx_form_submissions_receiver_name ON form_submissions(receiver_name);
CREATE INDEX IF NOT EXISTS idx_form_submissions_destination ON form_submissions(destination);
CREATE INDEX IF NOT EXISTS idx_form_submissions_selected_carrier ON form_submissions(selected_carrier);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_form_submissions_updated_at ON form_submissions;
CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (full access)
CREATE POLICY "Service role has full access to form_submissions"
  ON form_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: Create policy for authenticated users to view their own submissions
CREATE POLICY "Users can view their own form_submissions"
  ON form_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_email = auth.email());

-- Grant necessary permissions
GRANT ALL ON form_submissions TO service_role;
GRANT SELECT ON form_submissions TO authenticated;

-- Add helpful comment
COMMENT ON TABLE form_submissions IS 'Stores shipment request form submissions from customers';

