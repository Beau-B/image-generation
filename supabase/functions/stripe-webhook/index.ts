import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature || !endpointSecret) {
    return new Response('Missing signature or endpoint secret', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer to find Supabase user ID
        const customer = await stripe.customers.retrieve(customerId as string);
        const userId = customer.metadata.supabase_user_id;

        // Update subscription in database
        await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            status: subscription.status,
            plan: subscription.items.data[0].price.lookup_key || 'unknown',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription status to canceled
        await supabaseClient
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            end_date: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});