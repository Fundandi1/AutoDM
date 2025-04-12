import React from 'react';

const Logo = ({ className = "h-8 w-8", fill = "#2563eb" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" fill={fill}></rect>
    <path d="M16 8h.01" stroke="white"></path>
    <path d="M12 16a4 4 0 0 1-8 0V8a4 4 0 0 1 8 0v8z" stroke="white"></path>
    <path d="M16 16V8a4 4 0 0 1 8 0v8" stroke="white"></path>
    <path d="M12 4v4" stroke="white"></path>
    <path d="M12 12v4" stroke="white"></path>
  </svg>
);

export default Logo; 