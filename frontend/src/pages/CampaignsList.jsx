import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campaignsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import CreateCampaignModal from '../components/CreateCampaignModal';

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await campaignsAPI.getAll();
      setCampaigns(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      if (err.response?.status >= 500) {
        setError('Failed to load campaigns. Please try again.');
      } else {
        setCampaigns([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCampaigns();
    }
  }, [currentUser]);

  const handleCreateCampaignClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCampaignCreated = () => {
    fetchCampaigns();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <button 
          onClick={handleCreateCampaignClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Create Campaign
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
            <p className="text-gray-500">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-6 border-b">
            <p className="text-gray-500">No campaigns found. Create your first campaign to start automating your Instagram DMs.</p>
          </div>
        ) : (
          <div className="divide-y">
            {campaigns.map(campaign => (
              <div key={campaign._id} className="p-6 hover:bg-gray-50">
                <Link to={`/campaigns/${campaign._id}`} className="block">
                  <h2 className="text-lg font-semibold mb-2">{campaign.name}</h2>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Status: {campaign.status}</span>
                    <span>Accounts: {campaign.account_ids?.length || 0}</span>
                    <span>
                      Stats: {campaign.stats?.sent || 0} sent, 
                      {campaign.stats?.pending || 0} pending
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <CreateCampaignModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCampaignCreated}
      />
    </div>
  );
};

export default CampaignsList; 