import React, { useState } from 'react';

const FollowupSequence = ({ onSave, initialValues = {} }) => {
  const [enabled, setEnabled] = useState(initialValues.enabled || true);
  const [followupDays, setFollowupDays] = useState(initialValues.followupDays || 1);
  const [followupOptions, setFollowupOptions] = useState(initialValues.followupOptions || [
    { id: 1, message: '{firstname} are you there? 👋' },
    { id: 2, message: '{firstname} are you still with me? 😉' },
    { id: 3, message: 'Fell asleep {firstname}? 😴' }
  ]);

  const handleToggleEnabled = () => {
    setEnabled(!enabled);
  };

  const handleDaysChange = (e) => {
    setFollowupDays(parseInt(e.target.value) || 1);
  };

  const handleMessageChange = (id, newMessage) => {
    setFollowupOptions(followupOptions.map(option => 
      option.id === id ? { ...option, message: newMessage } : option
    ));
  };

  const handleInsertVariable = (id, variable) => {
    const option = followupOptions.find(opt => opt.id === id);
    if (option) {
      const newMessage = option.message + variable;
      handleMessageChange(id, newMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        enabled,
        followupDays,
        followupOptions
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Followups</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="flex items-center">
            <div className={`w-12 h-6 relative rounded-full transition-all duration-200 ease-in-out ${enabled ? 'bg-primary-500' : 'bg-gray-300'}`}>
              <input 
                type="checkbox" 
                className="sr-only"
                checked={enabled}
                onChange={handleToggleEnabled}
              />
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">Send Followups</span>
          </label>
        </div>

        {enabled && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send follow-ups after
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={followupDays}
                  onChange={handleDaysChange}
                  min="1"
                  max="14"
                  className="w-16 px-2 py-1 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">day/s</span>
              </div>
            </div>

            {followupOptions.map((option) => (
              <div key={option.id} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option {option.id} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={option.message}
                  onChange={(e) => handleMessageChange(option.id, e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 mb-2"
                ></textarea>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleInsertVariable(option.id, '{firstname}')}
                    className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                  >
                    Add {'{firstname}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable(option.id, '{username}')}
                    className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                  >
                    Add {'{username}'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Save Followup Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default FollowupSequence; 