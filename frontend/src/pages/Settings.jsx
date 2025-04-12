import React from 'react';

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Account Settings</h2>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              disabled
              value="user@example.com"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Your name"
            />
          </div>
          
          <div className="mt-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
              Save Changes
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Change Password</h2>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 