export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_stats: {
        Row: {
          id: string
          user_id: string
          generated_images: number
          edited_images: number
          last_reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          generated_images?: number
          edited_images?: number
          last_reset_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          generated_images?: number
          edited_images?: number
          last_reset_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          user_id: string
          url: string
          prompt: string | null
          style: string | null
          is_edited: boolean
          edit_instructions: string | null
          original_image_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          prompt?: string | null
          style?: string | null
          is_edited?: boolean
          edit_instructions?: string | null
          original_image_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          prompt?: string | null
          style?: string | null
          is_edited?: boolean
          edit_instructions?: string | null
          original_image_id?: string | null
          created_at?: string
        }
      }
    }
  }
}