import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface CheckoutSessionResponse {
  session_id: string;
}

export interface PortalSessionResponse {
  url: string;
}

export const createCheckoutSession = async (userId: string, priceId: string): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke<CheckoutSessionResponse>(
      'create-checkout-session',
      {
        body: { user_id: userId, price_id: priceId }
      }
    );

    if (error) throw error;
    if (!data) throw new Error('No data returned from checkout session creation');

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Failed to load Stripe');

    const result = await stripe.redirectToCheckout({
      sessionId: data.session_id,
    });

    if (result.error) throw result.error;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createPortalSession = async (userId: string): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke<PortalSessionResponse>(
      'create-portal-session',
      {
        body: { user_id: userId }
      }
    );

    if (error) throw error;
    if (!data) throw new Error('No data returned from portal session creation');

    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};