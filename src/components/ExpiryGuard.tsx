'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function ExpiryGuard({ children }: { children: React.ReactNode }) {
  const [isExpired, setIsExpired] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [iconClicks, setIconClicks] = useState(0);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticCode, setDiagnosticCode] = useState('');
  
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

  // PC Keystroke listener
  useEffect(() => {
    if (!isMounted) return;

    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if they are typing in the diagnostic modal
      if (showDiagnostic) return;
      
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
  }, [isMounted, setExpiryDate, showDiagnostic]);

  const handleIconClick = () => {
    const newCount = iconClicks + 1;
    setIconClicks(newCount);
    
    if (newCount >= 5) {
      setShowDiagnostic(true);
      setIconClicks(0);
    }
  };

  const handleDiagnosticSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = diagnosticCode.toLowerCase();
    
    if (val.startsWith('abhishek3364')) {
      const daysStr = val.replace('abhishek3364', '');
      const daysToAdd = daysStr ? parseInt(daysStr, 10) : 30;

      if (!isNaN(daysToAdd)) {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + daysToAdd);
        setExpiryDate(newDate.toISOString().split('T')[0]);
        setIsExpired(false);
        setShowDiagnostic(false);
        setDiagnosticCode('');
      }
    } else {
      // Silently fail or close
      setShowDiagnostic(false);
      setDiagnosticCode('');
    }
  };

  if (!isMounted) return null;

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 absolute inset-0 z-[100]">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
          
          <div 
            className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 cursor-pointer"
            onClick={handleIconClick}
          >
            <svg className="h-6 w-6 text-red-600 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2 select-none">
            Database Connection Error
          </h1>
          
          <p className="text-sm text-gray-500 mb-4 pointer-events-none">
            The system could not establish a connection to the local database server. Please verify your network configuration.
          </p>
          
          <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded pointer-events-none">
            Error Code: ERR_CONNECTION_REFUSED (0x80040154)
          </div>
        </div>

        {/* Secret Diagnostic Modal */}
        {showDiagnostic && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
              <form onSubmit={handleDiagnosticSubmit}>
                <h3 className="text-lg font-bold text-gray-800 mb-2">System Diagnostics</h3>
                <p className="text-xs text-gray-500 mb-4">Enter diagnostic sequence to attempt manual database reconnection.</p>
                
                <input
                  type="password"
                  value={diagnosticCode}
                  onChange={(e) => setDiagnosticCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Diagnostic Code"
                  autoComplete="off"
                  autoFocus
                />
                
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setShowDiagnostic(false)} 
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Run Diagnostics
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
