import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UsageStats = Database['public']['Tables']['usage_stats']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface UserContextType {
  userData: Profile | null;
  usageData: UsageStats | null;
  subscription: Subscription | null;
  loading: boolean;
  updateUsage: (type: 'generate' | 'edit') => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T,>(
  operation: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await delay(baseDelay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Profile | null>(null);
  const [usageData, setUsageData] = useState<UsageStats | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setUsageData(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    async function loadUserData() {
      try {
        // Get user profile with retry
        const { data: profilesData, error: profileError } = await retryOperation(
          () => supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
        );

        if (profileError) throw profileError;

        let profileData: Profile | null = null;
        if (profilesData && profilesData.length > 0) {
          if (profilesData.length > 1) {
            console.warn('Multiple profiles found for user ID:', user.id);
          }
          profileData = profilesData[0];
          setUserData(profileData);
        } else {
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, display_name: user.email?.split('@')[0] }])
            .select()
            .single();

          if (createError) throw createError;
          
          setUserData(newProfile);
        }

        // Get usage stats with retry
        const { data: usageStatsData, error: usageError } = await retryOperation(
          () => supabase
            .from('usage_stats')
            .select('*')
            .eq('user_id', user.id)
        );

        if (usageError) throw usageError;

        if (usageStatsData && usageStatsData.length > 0) {
          if (usageStatsData.length > 1) {
            console.warn('Multiple usage stats found for user ID:', user.id);
          }
          setUsageData(usageStatsData[0]);
        } else {
          // Create usage stats if they don't exist
          const { data: newUsageStats, error: createUsageError } = await supabase
            .from('usage_stats')
            .insert([{ user_id: user.id }])
            .select()
            .single();

          if (createUsageError) throw createUsageError;
          
          setUsageData(newUsageStats);
        }

        // Get subscription with retry
        const { data: subscriptionsData, error: subscriptionError } = await retryOperation(
          () => supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
        );

        if (subscriptionError) throw subscriptionError;

        if (subscriptionsData && subscriptionsData.length > 0) {
          if (subscriptionsData.length > 1) {
            console.warn('Multiple subscriptions found for user ID:', user.id);
          }
          setSubscription(subscriptionsData[0]);
        } else {
          // Create subscription if it doesn't exist
          const { data: newSubscription, error: createSubError } = await supabase
            .from('subscriptions')
            .insert([{ user_id: user.id, plan: 'free' }])
            .select()
            .single();

          if (createSubError) throw createSubError;
          
          setSubscription(newSubscription);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    }

    loadUserData();

    // Set up realtime subscriptions
    const profileSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        setUserData(payload.new as Profile);
      })
      .subscribe();

    const usageSubscription = supabase
      .channel('public:usage_stats')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'usage_stats',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setUsageData(payload.new as UsageStats);
      })
      .subscribe();

    const subscriptionSubscription = supabase
      .channel('public:subscriptions')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setSubscription(payload.new as Subscription);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(usageSubscription);
      supabase.removeChannel(subscriptionSubscription);
    };
  }, [user]);

  const updateUsage = async (type: 'generate' | 'edit') => {
    if (!user) return;
    
    try {
      const { data: currentUsage, error: fetchError } = await retryOperation(
        () => supabase
          .from('usage_stats')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
      );
      
      if (fetchError) throw fetchError;
      
      const updates: Partial<UsageStats> = {
        updated_at: new Date().toISOString()
      };

      if (type === 'generate') {
        updates.generated_images = ((currentUsage?.[0]?.generated_images || 0) + 1);
      } else if (type === 'edit') {
        updates.edited_images = ((currentUsage?.[0]?.edited_images || 0) + 1);
      }
      
      const { error: updateError } = await retryOperation(
        () => supabase
          .from('usage_stats')
          .update(updates)
          .eq('user_id', user.id)
      );
      
      if (updateError) throw updateError;
      
    } catch (error) {
      console.error('Error updating usage:', error);
      throw error;
    }
  };

  const value = {
    userData,
    usageData,
    subscription,
    loading,
    updateUsage,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}