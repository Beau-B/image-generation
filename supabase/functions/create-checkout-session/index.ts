import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import Stripe from 'npm:stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, price_id } = await req.json();

    if (!user_id || !price_id) {
      throw new Error('Missing user_id or price_id');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get user's email from Supabase
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError) throw userError;

    // Create or get Stripe customer
    let stripeCustomerId = userData.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          supabase_user_id: user_id,
        },
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user_id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/account`,
    });

    return new Response(
      JSON.stringify({ session_id: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});