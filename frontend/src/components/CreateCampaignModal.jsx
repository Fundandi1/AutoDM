import React, { useState, useEffect } from 'react';
import { campaignsAPI, accountsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CreateCampaignModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    account_ids: [],
    targeting: {},
    schedule: {
      daily_limit: 50,
      time_window: { start: '09:00', end: '18:00' }
    }
  });
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const { currentUser } = useAuth();

  // Fetch accounts when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchAccounts();
    }
  }, [isOpen, currentUser]);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await accountsAPI.getAll();
      console.log('Fetched accounts:', response.data);
      setAccounts(response.data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load Instagram accounts');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAccountToggle = (accountId) => {
    console.log('Toggle account:', accountId, typeof accountId);
    
    const newAccountIds = [...formData.account_ids];
    
    // Ensure accountId is a string
    const accountIdStr = String(accountId);
    
    if (newAccountIds.includes(accountIdStr)) {
      // Remove account
      const index = newAccountIds.indexOf(accountIdStr);
      newAccountIds.splice(index, 1);
    } else {
      // Add account
      newAccountIds.push(accountIdStr);
    }
    
    console.log('New account_ids array:', newAccountIds);
    setFormData({ ...formData, account_ids: newAccountIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }
    
    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }
    
    if (formData.account_ids.length === 0) {
      setError('Select at least one Instagram account');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create a clean copy of the data with proper account_ids format
      const campaignData = {
        ...formData,
        // Ensure account_ids are all strings
        account_ids: formData.account_ids.map(id => String(id)),
        user_id: currentUser.id
      };
      
      console.log('Submitting campaign data:', campaignData);
      
      const response = await campaignsAPI.create(campaignData);
      console.log('Campaign creation successful:', response.data);
      
      // Reset form
      setFormData({
        name: '',
        message: '',
        account_ids: [],
        targeting: {},
        schedule: {
          daily_limit: 50,
          time_window: { start: '09:00', end: '18:00' }
        }
      });
      
      // Notify parent of success
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (err) {
      console.error('Error creating campaign:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      }
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Campaign</h2>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="My Campaign"
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message Template
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Hey {{username}}, I noticed your profile and..."
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              You can use variables like {"{{username}}, {{first_name}}"}, etc.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Accounts
            </label>
            
            {loadingAccounts ? (
              <p className="text-gray-500">Loading accounts...</p>
            ) : accounts.length === 0 ? (
              <p className="text-red-500">
                No Instagram accounts found. Please add at least one account before creating a campaign.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded">
                {accounts.map(account => {
                  // Ensure we're working with string ID
                  const accountId = typeof account._id === 'string' ? account._id : String(account._id.$oid || account._id);
                  
                  return (
                    <div 
                      key={accountId} 
                      className="flex items-center p-2 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        id={`account-${accountId}`}
                        checked={formData.account_ids.includes(accountId)}
                        onChange={() => handleAccountToggle(accountId)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        disabled={loading}
                      />
                      <label 
                        htmlFor={`account-${accountId}`}
                        className="ml-2 cursor-pointer flex-grow"
                      >
                        {account.username}
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.status}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
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
              disabled={loading || accounts.length === 0}
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal; 