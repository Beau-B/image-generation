import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { createCheckoutSession } from '../services/stripe';
import { Check } from 'lucide-react';

const PRICING_TIERS = [
  {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '10 image generations per month',
      '5 image edits per month',
      'Basic styles',
      'Standard resolution',
    ],
  },
  {
    name: 'Pro',
    price: 9.99,
    priceId: 'price_pro',
    features: [
      '100 image generations per month',
      '50 image edits per month',
      'All styles',
      'HD resolution',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 29.99,
    priceId: 'price_enterprise',
    features: [
      'Unlimited image generations',
      'Unlimited image edits',
      'All styles + custom styles',
      '4K resolution',
      'API access',
      'Dedicated support',
    ],
  },
];

function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useUser();

  const handleSubscribe = async (priceId: string | null) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    if (!priceId) {
      return; // Free tier doesn't need checkout
    }

    try {
      await createCheckoutSession(user.id, priceId);
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12">
      <div className="text-center">
        <h1 className="text-4xl font-medium text-primary-900">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-primary-600">
          Choose the perfect plan for your creative needs
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {PRICING_TIERS.map((tier) => {
          const isCurrentPlan = subscription?.plan === tier.name.toLowerCase();

          return (
            <div
              key={tier.name}
              className={`card overflow-hidden ${
                isCurrentPlan ? 'ring-2 ring-accent-600' : ''
              }`}
            >
              <div className="p-8">
                <h2 className="text-2xl font-medium text-primary-900">{tier.name}</h2>
                <p className="mt-4 flex items-baseline">
                  <span className="text-4xl font-medium tracking-tight text-primary-900">
                    ${tier.price}
                  </span>
                  <span className="ml-1 text-sm font-medium text-primary-500">/month</span>
                </p>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-accent-600 shrink-0" />
                      <span className="ml-3 text-sm text-primary-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full bg-primary-100 text-primary-700 py-2 px-4 rounded-md text-sm font-medium"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(tier.priceId)}
                      className="btn-accent w-full"
                    >
                      {tier.price === 0 ? 'Get Started' : 'Subscribe'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-primary-500">
          All plans include access to our basic features. Upgrade anytime to unlock more capabilities.
        </p>
      </div>
    </div>
  );
}

export default Pricing;