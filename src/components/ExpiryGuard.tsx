'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export default function ExpiryGuard({ children }: { children: React.ReactNode }) {
  const [isExpired, setIsExpired] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [iconClicks, setIconClicks] = useState(0);
  
  const expiryDate = useStore((state) => state.expiryDate);
  const setExpiryDate = useStore((state) => state.setExpiryDate);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  
  const hiddenInputRef = useRef<HTMLInputElement>(null);

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

  // PC Keystroke listener
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

  // Mobile virtual keyboard handler
  const handleIconClick = () => {
    const newCount = iconClicks + 1;
    setIconClicks(newCount);
    
    if (newCount >= 5) {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
      setIconClicks(0);
    }
  };

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    
    // Auto submit if they type password + days and add a space at the end to trigger it
    // Or we rely on them hitting "Enter" on mobile keyboard, which triggers onKeyDown
    // For safety, let's also check if it exactly matches the base password
    if (val === 'abhishek3364') {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 30); // Default 30 days
      setExpiryDate(newDate.toISOString().split('T')[0]);
      setIsExpired(false);
      e.target.value = '';
    }
  };

  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.toLowerCase();
      if (val.startsWith('abhishek3364')) {
        const daysStr = val.replace('abhishek3364', '');
        const daysToAdd = daysStr ? parseInt(daysStr, 10) : 30;

        if (!isNaN(daysToAdd)) {
          const newDate = new Date();
          newDate.setDate(newDate.getDate() + daysToAdd);
          setExpiryDate(newDate.toISOString().split('T')[0]);
          setIsExpired(false);
        }
      }
      e.currentTarget.value = '';
    }
  };

  if (!isMounted) return null;

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 absolute inset-0 z-[100]">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
          
          {/* Hidden input for Mobile Virtual Keyboard */}
          <input
            ref={hiddenInputRef}
            type="password"
            autoComplete="new-password"
            autoCorrect="off"
            spellCheck="false"
            onChange={handleMobileInput}
            onKeyDown={handleMobileKeyDown}
            className="absolute top-0 left-0 opacity-0 w-1 h-1"
          />

          <div 
            className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 cursor-pointer"
            onClick={handleIconClick}
          >
            <svg className="h-6 w-6 text-red-600 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2 cursor-default select-none">
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
