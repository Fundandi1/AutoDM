import React from 'react';

const LeadsList = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="border px-3 py-2 rounded"
          />
          <select className="border px-3 py-2 rounded">
            <option value="all">All campaigns</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <p className="text-gray-500">No leads found. Create a campaign and add targets to start generating leads.</p>
        </div>
        
        {/* This would be a table of leads when they exist */}
        {/* 
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map(lead => (
              <tr key={lead.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{lead.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.campaign_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    lead.response_status === 'responded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lead.response_status || 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.last_contacted ? new Date(lead.last_contacted).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        */}
      </div>
    </div>
  );
};

export default LeadsList; 