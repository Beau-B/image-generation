/*
  # Enhance Security and Add Rate Limiting

  1. Security Enhancements
    - Add rate limiting columns to usage_stats
    - Add request tracking for API calls
    - Add security policies for premium features
    - Add validation functions for subscription status

  2. Changes
    - Add rate limiting columns to usage_stats table
    - Add API request tracking table
    - Add security functions and policies
    - Add subscription validation triggers

  3. Security
    - Enable RLS on all tables
    - Add strict policies for access control
    - Add rate limiting enforcement
*/

-- Add rate limiting columns to usage_stats
ALTER TABLE usage_stats 
ADD COLUMN IF NOT EXISTS daily_api_calls integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_api_call timestamptz,
ADD COLUMN IF NOT EXISTS daily_api_limit integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS rate_limit_reset timestamptz DEFAULT now();

-- Create API request tracking table
CREATE TABLE IF NOT EXISTS api_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_time timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  status integer,
  response_time integer,
  subscription_tier text
);

-- Enable RLS on api_requests
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Create function to validate subscription status
CREATE OR REPLACE FUNCTION check_subscription_status(user_id uuid)
RETURNS boolean AS $$
DECLARE
  sub_status text;
  sub_end_date timestamptz;
BEGIN
  SELECT status, end_date 
  INTO sub_status, sub_end_date
  FROM subscriptions 
  WHERE user_id = $1 
  ORDER BY created_at DESC 
  LIMIT 1;

  RETURN (
    sub_status = 'active' AND 
    (sub_end_date IS NULL OR sub_end_date > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(user_id uuid)
RETURNS boolean AS $$
DECLARE
  usage_record usage_stats%ROWTYPE;
  current_plan text;
BEGIN
  -- Get current usage stats
  SELECT * INTO usage_record 
  FROM usage_stats 
  WHERE user_id = $1;

  -- Get current subscription plan
  SELECT plan INTO current_plan 
  FROM subscriptions 
  WHERE user_id = $1 
  AND status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Reset daily counters if needed
  IF usage_record.rate_limit_reset < current_date THEN
    UPDATE usage_stats 
    SET daily_api_calls = 0,
        rate_limit_reset = current_date + interval '1 day'
    WHERE user_id = $1;
    
    usage_record.daily_api_calls = 0;
  END IF;

  -- Check limits based on plan
  RETURN CASE
    WHEN current_plan = 'free' AND usage_record.daily_api_calls >= 100 THEN false
    WHEN current_plan = 'pro' AND usage_record.daily_api_calls >= 1000 THEN false
    WHEN current_plan = 'enterprise' THEN true
    ELSE usage_record.daily_api_calls < usage_record.daily_api_limit
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track API request
CREATE OR REPLACE FUNCTION track_api_request()
RETURNS trigger AS $$
BEGIN
  -- Increment daily API calls
  UPDATE usage_stats 
  SET daily_api_calls = daily_api_calls + 1,
      last_api_call = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for API request tracking
CREATE TRIGGER track_api_request_trigger
AFTER INSERT ON api_requests
FOR EACH ROW
EXECUTE FUNCTION track_api_request();

-- Add policies for api_requests
CREATE POLICY "Users can insert their own API requests"
ON api_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own API requests"
ON api_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add policies for images table
CREATE POLICY "Free users can only generate 10 images per month"
ON images
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) AND
  (
    -- Allow if user has active paid subscription
    check_subscription_status(auth.uid()) OR
    -- Or if within free tier limits
    (
      SELECT count(*) < 10
      FROM images
      WHERE user_id = auth.uid()
      AND created_at >= date_trunc('month', current_date)
    )
  )
);

-- Update existing policies with rate limiting
CREATE POLICY "Rate limited image generation"
ON images
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  check_rate_limit(auth.uid())
);

-- Add function to validate image operations
CREATE OR REPLACE FUNCTION validate_image_operation()
RETURNS trigger AS $$
DECLARE
  user_subscription text;
BEGIN
  -- Get user's subscription plan
  SELECT plan INTO user_subscription
  FROM subscriptions
  WHERE user_id = NEW.user_id
  AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Validate based on subscription
  IF user_subscription = 'free' THEN
    -- Check monthly limit
    IF (
      SELECT count(*) >= 10
      FROM images
      WHERE user_id = NEW.user_id
      AND created_at >= date_trunc('month', current_date)
    ) THEN
      RAISE EXCEPTION 'Free tier monthly limit reached';
    END IF;
  ELSIF user_subscription = 'pro' THEN
    -- Check pro tier limits
    IF (
      SELECT count(*) >= 100
      FROM images
      WHERE user_id = NEW.user_id
      AND created_at >= date_trunc('month', current_date)
    ) THEN
      RAISE EXCEPTION 'Pro tier monthly limit reached';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for image operations
CREATE TRIGGER validate_image_operation_trigger
BEFORE INSERT ON images
FOR EACH ROW
EXECUTE FUNCTION validate_image_operation();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_requests_user_id ON api_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_request_time ON api_requests(request_time);
CREATE INDEX IF NOT EXISTS idx_images_user_id_created_at ON images(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);