import React, { useState, useEffect } from 'react';
import { accountsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import AddAccountModal from '../components/AddAccountModal';

const AccountsList = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountsAPI.getAll();
      setAccounts(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching accounts:', err);
      if (err.response?.status >= 500) {
        setError('Failed to load accounts. Please try again.');
      } else {
        setAccounts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAccounts();
    }
  }, [currentUser]);

  const handleAddAccountClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAccountAdded = () => {
    fetchAccounts();
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to remove this account?')) {
      return;
    }

    // Validate accountId
    if (!accountId) {
      setError('Invalid account ID. Cannot delete account.');
      return;
    }

    try {
      // Convert accountId to string if it's not already
      const id = String(accountId);
      console.log('Deleting account with ID:', id);
      
      const response = await accountsAPI.delete(id);
      console.log('Delete response:', response);
      fetchAccounts();
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Instagram Accounts</h1>
        <button 
          onClick={handleAddAccountClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Add Instagram Account
        </button>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-6 border-b">
            <p className="text-gray-500">No Instagram accounts found. Add your first Instagram account to start automating your DMs.</p>
          </div>
        ) : (
          <div className="divide-y">
            {accounts.map(account => (
              <div key={account._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{account.username}</h2>
                    <p className="text-sm text-gray-500">
                      Last login: {account.last_login ? new Date(account.last_login).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status}
                    </span>
                    <button 
                      onClick={() => {
                        console.log("Account to delete:", account);
                        console.log("Account ID:", account._id);
                        
                        // Get the string ID
                        let id = account._id;
                        // If it's an object, try to get the string value from it
                        if (typeof id === 'object' && id !== null) {
                          id = id.$oid || id.toString();
                        }
                        
                        console.log("Extracted ID for deletion:", id);
                        handleDeleteAccount(id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <AddAccountModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleAccountAdded}
      />
    </div>
  );
};

export default AccountsList; 