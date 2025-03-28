/*
  # Complete Schema Update for Image Generation SaaS

  1. New Tables
    - `profiles`
      - User profile information
      - Public display name and avatar
      - Timestamps for tracking
    
    - `subscriptions`
      - Subscription plan details
      - Stripe integration fields
      - Plan status and duration tracking
    
    - `usage_stats`
      - Track image generation and editing usage
      - Reset dates for quota management
    
    - `images`
      - Store generated and edited images
      - Track prompts and edit history
      - Link edited images to originals
  
  2. Security
    - Enable RLS on all tables
    - Public read access for profiles
    - Private access for all other tables
    - Storage bucket policies for different image types
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_stats table
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  generated_images INTEGER DEFAULT 0,
  edited_images INTEGER DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  edit_instructions TEXT,
  original_image_id UUID REFERENCES images(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" 
ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Usage stats policies
CREATE POLICY "Users can view their own usage stats" 
ON usage_stats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage stats"
ON usage_stats FOR UPDATE USING (auth.uid() = user_id);

-- Images policies
CREATE POLICY "Users can view their own images" 
ON images FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images" 
ON images FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images" 
ON images FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images" 
ON images FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket policies
DO $$
BEGIN
  -- Create buckets if they don't exist
  INSERT INTO storage.buckets (id, name)
  VALUES 
    ('avatars', 'avatars'),
    ('source_images', 'source_images'),
    ('generated_images', 'generated_images')
  ON CONFLICT DO NOTHING;

  -- Avatars bucket policies
  CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

  CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

  -- Source images bucket policies
  CREATE POLICY "Users can access their own source images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'source_images' AND auth.uid() = owner);

  CREATE POLICY "Users can upload their own source images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'source_images' AND auth.uid() = owner);

  -- Generated images bucket policies
  CREATE POLICY "Users can access their own generated images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated_images' AND auth.uid() = owner);

  CREATE POLICY "Users can upload their own generated images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated_images' AND auth.uid() = owner);
END $$;