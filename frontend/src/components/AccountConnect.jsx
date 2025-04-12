import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const AccountConnect = ({ onConnect }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    secretKey: ''
  });
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setConnecting(true);
    
    try {
      // Here you would make an API call to your backend
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onConnect) {
        onConnect({
          username: formData.username,
          connected: true
        });
      }
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        secretKey: ''
      });
    } catch (err) {
      setError('Failed to connect account. Please try again.');
    } finally {
      setConnecting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="rounded-full p-3 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-8 h-8 text-white">
                <path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Connect your Instagram account</h2>
            <p className="text-sm text-gray-500 mt-1">Allow AutoIGDM to access your Instagram account</p>
            <div className="mt-2 py-1 px-3 bg-green-100 rounded-full">
              <p className="text-xs text-green-800">You only need to do this once per account</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram Username
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">@</span>
                </span>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-8 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="username"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pr-10 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between">
                <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <button type="button" className="text-sm text-primary-500 hover:text-primary-700">
                  How do I get this?
                </button>
              </div>
              <input
                type="text"
                name="secretKey"
                id="secretKey"
                value={formData.secretKey}
                onChange={handleChange}
                className="block w-full py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX"
              />
              <div className="mt-2 flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-gray-400 mr-1 flex-shrink-0" />
                <p className="text-xs text-gray-500">You're secret key will look like this.</p>
              </div>
              <div className="mt-2 bg-gray-800 text-white p-2 rounded text-center">
                <p className="text-sm font-mono">74QL ZTQI QLJT BCQC BLK5<br />QHKH QSGW 4SDN</p>
                <div className="flex justify-center mt-1 text-xs text-gray-400 space-x-2">
                  <button type="button">Copy key</button>
                  <span>•</span>
                  <button type="button">View barcode/QR code</button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={connecting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                connecting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {connecting ? 'Connecting...' : 'Add Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountConnect; 