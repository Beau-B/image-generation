/*
  # Fix subscriptions RLS policies

  1. Security
    - Enable RLS on subscriptions table
    - Add policies for:
      - SELECT: Users can view their own subscription
      - INSERT: Users can create their own subscription
      - UPDATE: Users can update their own subscription

  2. Changes
    - Drop existing policies if any
    - Create new policies with proper conditions
*/

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;

-- Create new policies
CREATE POLICY "Users can view their own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);