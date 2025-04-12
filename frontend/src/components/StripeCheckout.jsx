import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const StripeCheckout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Card styling
  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  useEffect(() => {
    // Get the plan from location state or default to 'basic'
    const plan = location.state?.selectedPlan || 'basic';
    const price = location.state?.price || 29;
    
    setSelectedPlan({
      name: plan,
      price: price
    });
    
    // Create a payment intent on component mount
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post('/api/payments/create-payment-intent', {
          plan: plan,
          amount: price * 100, // Stripe uses cents
          userId: currentUser.id
        });
        
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
      }
    };
    
    if (currentUser) {
      createPaymentIntent();
    }
  }, [location, currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      setLoading(false);
      return;
    }
    
    try {
      const cardElement = elements.getElement(CardElement);
      
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: currentUser.name,
            email: currentUser.email,
          },
        },
      });
      
      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful, create subscription in backend
        await axios.post('/api/subscriptions/create', {
          userId: currentUser.id,
          plan: selectedPlan.name,
          paymentIntentId: paymentIntent.id,
          amount: selectedPlan.price,
        });
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Checkout</h2>
          <p className="mt-2 text-gray-600">
            You're subscribing to the {selectedPlan.name.charAt(0).toUpperCase() + selectedPlan.name.slice(1)} plan
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex justify-between">
            <span className="text-gray-700">Plan:</span>
            <span className="font-medium">{selectedPlan.name.charAt(0).toUpperCase() + selectedPlan.name.slice(1)}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-700">Price:</span>
            <span className="font-medium">${selectedPlan.price}/month</span>
          </div>
        </div>
        
        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-md text-center">
            <p className="font-medium">Payment successful!</p>
            <p className="mt-1">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
                Credit or debit card
              </label>
              <div className="border border-gray-300 rounded-md p-4 bg-white">
                <CardElement id="card-element" options={cardStyle} />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!stripe || loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay $${selectedPlan.price}`}
            </button>
            
            <p className="mt-4 text-xs text-gray-500 text-center">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              We'll charge your card monthly until you cancel.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default StripeCheckout; 