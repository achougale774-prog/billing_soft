'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

const BYPASS_PASSWORD = 'abhishek3364';

export default function ExpiryGuard({ children }: { children: React.ReactNode }) {
  const [isExpired, setIsExpired] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  // Custom Modal States
  const [showModal, setShowModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [newExpiryInput, setNewExpiryInput] = useState('');

  const expiryDate = useStore((state) => state.expiryDate);
  const setExpiryDate = useStore((state) => state.setExpiryDate);
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    setIsMounted(true);
    
    // Only check expiry if user is logged in
    if (!isLoggedIn) {
      setIsExpired(false);
      return;
    }

    const today = new Date();
    const expiry = new Date(expiryDate);
    
    // Check if current date is past the expiry date
    if (today > expiry) {
      setIsExpired(true);
    } else {
      setIsExpired(false); // Remove block if date is valid
    }
  }, [expiryDate, isLoggedIn]);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setShowModal(true);
      setClickCount(0);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === BYPASS_PASSWORD) {
      setIsPasswordValid(true);
      setNewExpiryInput(expiryDate);
    } else {
      alert('Invalid Developer Code');
      setShowModal(false);
    }
    setPasswordInput('');
  };

  const handleExpirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpiryInput) {
      setExpiryDate(newExpiryInput);
      setIsExpired(false);
      setShowModal(false);
      setIsPasswordValid(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsPasswordValid(false);
    setPasswordInput('');
  };

  if (!isMounted) return null;

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 absolute inset-0 z-[100]">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
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

        {/* Developer Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
              {!isPasswordValid ? (
                <form onSubmit={handlePasswordSubmit}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">System Verification</h3>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter Developer Code"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Verify</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleExpirySubmit}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Set Expiry Date</h3>
                  <input
                    type="date"
                    value={newExpiryInput}
                    onChange={(e) => setNewExpiryInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Update Date</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
