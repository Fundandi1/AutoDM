import React from 'react';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Active Campaigns</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Total Leads</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Messages Sent</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">No recent activity to display.</p>
      </div>
    </div>
  );
};

export default Dashboard; 