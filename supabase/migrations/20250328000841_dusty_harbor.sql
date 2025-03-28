/*
  # Fix usage_stats RLS policies

  1. Security
    - Enable RLS on usage_stats table
    - Add policies for:
      - SELECT: Users can view their own usage stats
      - INSERT: Users can create their own usage stats
      - UPDATE: Users can update their own usage stats

  2. Changes
    - Drop existing policies if any
    - Create new policies with proper conditions
*/

-- Enable RLS
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own usage stats" ON usage_stats;
DROP POLICY IF EXISTS "Users can update their own usage stats" ON usage_stats;
DROP POLICY IF EXISTS "Users can insert their own usage stats" ON usage_stats;

-- Create new policies
CREATE POLICY "Users can view their own usage stats"
ON usage_stats FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage stats"
ON usage_stats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage stats"
ON usage_stats FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);