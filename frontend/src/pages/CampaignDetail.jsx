import React from 'react';
import { useParams } from 'react-router-dom';

const CampaignDetail = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Campaign Details</h1>
        <p className="text-gray-500">ID: {id}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-lg font-semibold">Not Started</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Target Accounts</h3>
            <p className="mt-1 text-lg font-semibold">0</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Messages Sent</h3>
            <p className="mt-1 text-lg font-semibold">0</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Message Template</h3>
          <p className="p-3 bg-gray-50 rounded border">No message template set.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Target Leads</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500">No target leads added to this campaign yet.</p>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail; 