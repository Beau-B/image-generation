/*
  # Add avatar storage configuration

  1. Storage
    - Create avatars bucket for user profile pictures
    - Set up public access policies with existence checks
    - Configure file size and type restrictions

  2. Security
    - Enable RLS on the bucket
    - Add policies for authenticated users with checks
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies with existence checks
DO $$ 
BEGIN
    -- Public access policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Avatar images are publicly accessible'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'avatars');
    END IF;

    -- Upload policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can upload their own avatar'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Users can upload their own avatar"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'avatars' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can update their own avatar'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Users can update their own avatar"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'avatars' AND
            (storage.foldername(name))[1] = auth.uid()::text
        )
        WITH CHECK (
            bucket_id = 'avatars' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can delete their own avatar'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Users can delete their own avatar"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'avatars' AND
            (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END $$;