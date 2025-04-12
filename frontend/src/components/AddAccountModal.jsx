import React, { useState } from 'react';
import { accountsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const AddAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const accountData = {
        ...formData,
        user_id: currentUser.id
      };
      
      console.log('Sending account creation request with data:', {
        username: accountData.username,
        user_id: accountData.user_id,
        password: '********' // Hide actual password in logs
      });
      
      const response = await accountsAPI.create(accountData);
      console.log('Account creation response:', response);
      
      // Reset form
      setFormData({
        username: '',
        password: '',
      });
      
      // Notify parent of success
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (err) {
      console.error('Error adding account:', err);
      // Handle various error types
      let errorMessage = 'Failed to add Instagram account';
      
      if (err.response) {
        console.log('Error response status:', err.response.status);
        console.log('Error response data:', err.response.data);
        
        // Use the error message from the server if available
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Instagram Account</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="your.username"
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="••••••••"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Your password is securely stored and only used to authenticate with Instagram.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal; 