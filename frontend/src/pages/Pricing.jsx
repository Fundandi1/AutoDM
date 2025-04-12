import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const PricingTier = ({ 
  name, 
  price, 
  features, 
  recommended = false, 
  onSelectPlan 
}) => {
  return (
    <div className={`relative rounded-lg shadow-sm overflow-hidden ${recommended ? 'border-2 border-primary-500' : 'border border-gray-200'}`}>
      {recommended && (
        <div className="absolute top-0 inset-x-0 px-4 py-1 bg-primary-500 text-white text-center text-sm font-medium">
          Recommended
        </div>
      )}
      <div className={`px-6 py-8 ${recommended ? 'pt-10' : ''}`}>
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">{name}</h3>
          <div className="mt-4 flex items-baseline">
            <span className="text-5xl font-extrabold text-gray-900">${price}</span>
            <span className="ml-1 text-xl font-medium text-gray-500">/month</span>
          </div>
        </div>
        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <CheckIcon className="h-6 w-6 text-green-500" />
              </div>
              <p className="ml-3 text-base text-gray-700">{feature}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <button
            onClick={() => onSelectPlan(name.toLowerCase(), price)}
            className={`w-full px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
              recommended
                ? 'bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                : 'bg-white text-primary-700 border border-primary-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {recommended ? 'Get started' : 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleSelectPlan = (planName, price) => {
    if (!isAuthenticated) {
      // Redirect to register page if not authenticated
      navigate('/register', { state: { selectedPlan: planName, price } });
    } else {
      // Redirect to checkout page if authenticated
      navigate('/checkout', { state: { selectedPlan: planName, price } });
    }
  };

  const pricingPlans = [
    {
      name: 'Basic',
      price: 29,
      features: [
        '1 Instagram account',
        'Up to 100 DMs/day',
        'Basic targeting options',
        'Standard support',
        'Basic analytics'
      ],
      recommended: false
    },
    {
      name: 'Pro',
      price: 79,
      features: [
        '3 Instagram accounts',
        'Up to 300 DMs/day',
        'Advanced targeting options',
        'Priority support',
        'Advanced analytics',
        'Custom message sequences',
        'A/B testing'
      ],
      recommended: true
    },
    {
      name: 'Business',
      price: 199,
      features: [
        '10 Instagram accounts',
        'Unlimited DMs/day',
        'Advanced targeting options',
        '24/7 priority support',
        'Advanced analytics & reporting',
        'Custom message sequences',
        'A/B testing',
        'Team collaboration',
        'API access'
      ],
      recommended: false
    }
  ];

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingTier
              key={plan.name}
              name={plan.name}
              price={plan.price}
              features={plan.features}
              recommended={plan.recommended}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        <div className="mt-16 lg:mt-24 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Frequently asked questions
          </h2>
          <div className="mt-8 max-w-3xl mx-auto">
            <dl className="space-y-8">
              <div>
                <dt className="text-lg font-medium text-gray-900">How many messages can I send per day?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  The number of messages you can send depends on your plan. Basic allows up to 100 DMs/day, Pro allows up to 300 DMs/day, and Business offers unlimited DMs/day. We always respect Instagram's rate limits to keep your accounts safe.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-medium text-gray-900">Can I cancel my subscription anytime?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of your current billing cycle.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-medium text-gray-900">Is there a free trial?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  We offer a 7-day free trial on all plans. You can try all features before committing to a subscription.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-medium text-gray-900">Do you offer discounts for annual billing?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes! You can save 20% by choosing annual billing instead of monthly billing.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 