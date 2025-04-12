import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState({});
  const { register, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Use checked for checkboxes, otherwise use value
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({ ...formData, [name]: newValue });
    
    // Clear field error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the Terms of Service and Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const userData = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
    };
    
    const success = await register(userData);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-primary-600">AutoIGDM</h1>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create a new account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className={`h-4 w-4 ${
                    errors.termsAccepted ? 'border-red-300 text-red-900' : 'border-gray-300 text-primary-600'
                  } focus:ring-primary-500 rounded`}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="termsAccepted" className={`font-medium ${
                  errors.termsAccepted ? 'text-red-700' : 'text-gray-700'
                }`}>
                  I agree to the{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Privacy Policy
                  </a>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-1 text-sm text-red-600">{errors.termsAccepted}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 