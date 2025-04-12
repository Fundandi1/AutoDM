import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckout from '../components/StripeCheckout';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Load Stripe outside of component render to avoid recreating the Stripe object
// Replace this with your actual Stripe publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key');

const Checkout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Complete your order</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your payment details to complete your subscription
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <StripeCheckout />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout; 