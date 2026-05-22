'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export default function ExpiryGuard({ children }: { children: React.ReactNode }) {
  const [isExpired, setIsExpired] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Tap sequence states
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const expiryDate = useStore((state) => state.expiryDate);
  const setExpiryDate = useStore((state) => state.setExpiryDate);
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    setIsMounted(true);
    
    if (!isLoggedIn) {
      setIsExpired(false);
      return;
    }

    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (today > expiry) {
      setIsExpired(true);
    } else {
      setIsExpired(false);
    }
  }, [expiryDate, isLoggedIn]);

  // PC Keystroke listener (Still works for PC)
  useEffect(() => {
    if (!isMounted) return;

    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;

      if (e.key === 'Enter') {
        if (keyBuffer.startsWith('abhishek3364')) {
          const daysStr = keyBuffer.replace('abhishek3364', '');
          const daysToAdd = daysStr ? parseInt(daysStr, 10) : 30;

          if (!isNaN(daysToAdd)) {
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + daysToAdd);
            setExpiryDate(newDate.toISOString().split('T')[0]);
            setIsExpired(false);
          }
        }
        keyBuffer = '';
      } else if (e.key === 'Backspace') {
        keyBuffer = keyBuffer.slice(0, -1);
      } else if (e.key.length === 1) {
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 50) keyBuffer = keyBuffer.slice(-50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, setExpiryDate]);

  // Mobile Tap Logic - NO KEYBOARD REQUIRED!
  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Wait 1.5 seconds after the last tap to evaluate
    tapTimeoutRef.current = setTimeout(() => {
      if (newCount === 5) {
        // Unlock for 30 days
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 30);
        setExpiryDate(newDate.toISOString().split('T')[0]);
        setIsExpired(false);
      } else if (newCount === 10) {
        // Unlock for 365 days
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 365);
        setExpiryDate(newDate.toISOString().split('T')[0]);
        setIsExpired(false);
      }
      // Reset counter
      setTapCount(0);
    }, 1500);
  };

  if (!isMounted) return null;

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 absolute inset-0 z-[100]">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
          
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 
            className="text-xl font-bold text-gray-900 mb-2 cursor-pointer select-none"
            onClick={handleSecretTap}
          >
            Database Connection Error
          </h1>
          
          <p className="text-sm text-gray-500 mb-4 pointer-events-none">
            The system could not establish a connection to the local database server. Please verify your network configuration.
          </p>
          
          <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded pointer-events-none">
            Error Code: ERR_CONNECTION_REFUSED (0x80040154)
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
