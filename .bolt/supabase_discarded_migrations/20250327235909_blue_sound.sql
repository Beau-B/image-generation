/*
  # Initial Schema Setup for Image Generation SaaS

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `username` (text, unique)
      - `full_name` (text)
      - `credits` (integer) - Available credits for image generation
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `images`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References profiles
      - `prompt` (text) - The prompt used to generate the image
      - `image_url` (text) - URL of the generated image
      - `style` (text) - Style used for generation
      - `created_at` (timestamp)
      - `status` (text) - Status of generation (pending, completed, failed)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  credits integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  image_url text,
  style text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Images policies
CREATE POLICY "Users can view their own images"
  ON images
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
  ON images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();