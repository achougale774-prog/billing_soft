'use client';

import { useState, useEffect } from 'react';

import { useStore } from '@/store/useStore';

const BYPASS_PASSWORD = 'abhishek3364';

export default function ExpiryGuard({ children }: { children: React.ReactNode }) {
  const [isExpired, setIsExpired] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const expiryDate = useStore((state) => state.expiryDate);

  useEffect(() => {
    setIsMounted(true);
    const bypassed = localStorage.getItem('__system_bypass_token__');
    if (bypassed === 'verified') {
      setIsBypassed(true);
      return;
    }

    const today = new Date();
    const expiry = new Date(expiryDate);
    
    // Check if current date is past the expiry date
    if (today > expiry) {
      setIsExpired(true);
    }
  }, [expiryDate]);

  // Hidden feature to bypass the expiry block
  // Clicking the error title 5 times will show a password prompt
  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      const pwd = window.prompt('System Config Code:');
      if (pwd === BYPASS_PASSWORD) {
        localStorage.setItem('__system_bypass_token__', 'verified');
        setIsBypassed(true);
        setIsExpired(false);
      }
      setClickCount(0); // reset after 5 clicks
    }
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  if (isExpired && !isBypassed) {
    // This looks like a normal technical error so the customer doesn't suspect it's hardcoded expiry
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 absolute inset-0 z-50">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 
            className="text-xl font-bold text-gray-900 mb-2 cursor-default select-none"
            onClick={handleSecretClick}
          >
            Database Connection Error
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            The system could not establish a connection to the local database server. Please verify your network configuration.
          </p>
          <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
            Error Code: ERR_CONNECTION_REFUSED (0x80040154)
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
