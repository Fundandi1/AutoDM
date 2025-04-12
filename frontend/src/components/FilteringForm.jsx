import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const FilteringForm = ({ onSave, initialValues = {} }) => {
  const [formData, setFormData] = useState({
    negativeKeywords: initialValues.negativeKeywords || '',
    positiveKeywords: initialValues.positiveKeywords || '',
    hasProfilePicture: initialValues.hasProfilePicture || true,
    hasBio: initialValues.hasBio || true,
    hasWebsiteLink: initialValues.hasWebsiteLink || true,
    excludeSexualContent: initialValues.excludeSexualContent || false,
    excludePreviouslyContacted: initialValues.excludePreviouslyContacted || true,
    minFollowers: initialValues.minFollowers || 1000,
    maxFollowers: initialValues.maxFollowers || 20000,
    minPosts: initialValues.minPosts || 5,
    accountType: initialValues.accountType || 'personal'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRadioChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button className="px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300">
            Targeting
          </button>
          <button className="px-4 py-2 text-sm font-medium text-primary-500 border-b-2 border-primary-500">
            Filtering
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Keyword Filtering */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Keyword Filtering</h2>
            <span className="ml-2 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
              Recommended
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Negative Keywords</label>
              <button type="button" className="flex items-center text-xs text-primary-500">
                <InformationCircleIcon className="w-4 h-4 mr-1" />
                How does this work?
              </button>
            </div>
            <input
              type="text"
              name="negativeKeywords"
              value={formData.negativeKeywords}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Enter keywords to exclude"
            />
          </div>

          <div className="mb-2">
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Positive Keywords</label>
              <button type="button" className="flex items-center text-xs text-primary-500">
                <InformationCircleIcon className="w-4 h-4 mr-1" />
                How does this work?
              </button>
            </div>
            <input
              type="text"
              name="positiveKeywords"
              value={formData.positiveKeywords}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Enter keywords to include"
            />
          </div>

          <div className="flex items-center mt-4 text-xs text-gray-500">
            <InformationCircleIcon className="w-4 h-4 mr-1" />
            <p>If we are unable to find a sufficient amount of leads with this criteria, we may adjust keywords on your behalf.</p>
          </div>
        </div>

        {/* Basic Filtering */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Filtering</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="hasProfilePicture"
                    name="hasProfilePicture"
                    type="checkbox"
                    checked={formData.hasProfilePicture}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasProfilePicture" className="ml-2 block text-sm text-gray-700">
                    User has a profile picture
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="hasBio"
                    name="hasBio"
                    type="checkbox"
                    checked={formData.hasBio}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasBio" className="ml-2 block text-sm text-gray-700">
                    User has a bio
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="hasWebsiteLink"
                    name="hasWebsiteLink"
                    type="checkbox"
                    checked={formData.hasWebsiteLink}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasWebsiteLink" className="ml-2 block text-sm text-gray-700">
                    User has a website link
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="excludeSexualContent"
                    name="excludeSexualContent"
                    type="checkbox"
                    checked={formData.excludeSexualContent}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="excludeSexualContent" className="ml-2 block text-sm text-gray-700">
                    Exclude sexual content
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="excludePreviouslyContacted"
                    name="excludePreviouslyContacted"
                    type="checkbox"
                    checked={formData.excludePreviouslyContacted}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="excludePreviouslyContacted" className="ml-2 block text-sm text-gray-700">
                    Do not DM the user if you already had a conversation
                  </label>
                </div>

                <div className="flex items-center text-xs text-gray-500 ml-6 mt-1">
                  <InformationCircleIcon className="w-4 h-4 mr-1" />
                  <p>We do not DM private users by default.</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum amount of followers (max 10,000)
                </label>
                <input
                  type="number"
                  name="minFollowers"
                  value={formData.minFollowers}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum amount of followers (min 10,000)
                </label>
                <input
                  type="number"
                  name="maxFollowers"
                  value={formData.maxFollowers}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <InformationCircleIcon className="w-4 h-4 mr-1" />
                  <p>If we are unable to find a sufficient amount of leads with this criteria, we may increase the max follower amount.</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum amount of posts (max 50)
                </label>
                <input
                  type="number"
                  name="minPosts"
                  value={formData.minPosts}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram account types to contact
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="accountType-personal"
                      name="accountType"
                      type="radio"
                      checked={formData.accountType === 'personal'}
                      onChange={() => handleRadioChange('accountType', 'personal')}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="accountType-personal" className="ml-2 block text-sm text-gray-700">
                      Personal accounts
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="accountType-business"
                      name="accountType"
                      type="radio"
                      checked={formData.accountType === 'business'}
                      onChange={() => handleRadioChange('accountType', 'business')}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="accountType-business" className="ml-2 block text-sm text-gray-700">
                      Business accounts
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="accountType-both"
                      name="accountType"
                      type="radio"
                      checked={formData.accountType === 'both'}
                      onChange={() => handleRadioChange('accountType', 'both')}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="accountType-both" className="ml-2 block text-sm text-gray-700">
                      Both
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Save Filtering Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilteringForm; 