import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo.js';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">AutoDM</span>
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link 
                to="/features" 
                className="border-transparent text-gray-500 hover:text-gray-900 hover:border-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="border-transparent text-gray-500 hover:text-gray-900 hover:border-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pricing
              </Link>
              <a 
                href="#faq" 
                className="border-transparent text-gray-500 hover:text-gray-900 hover:border-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                FAQ
              </a>
            </div>
          </div>
          
          {/* Desktop login/register buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/features"
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          >
            Pricing
          </Link>
          <a
            href="#faq"
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          >
            FAQ
          </a>
        </div>
        
        {/* Mobile login/register buttons */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            {isAuthenticated ? (
              <div className="flex flex-col w-full">
                <Link
                  to="/dashboard"
                  className="block text-center w-full mb-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="block text-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Link
                  to="/login"
                  className="block text-center w-full mb-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 