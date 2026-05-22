'use client';
import { useState, useEffect } from 'react';
import { Menu, X, Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function TopHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, markNotificationRead, logout, setExpiryDate } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [titleClicks, setTitleClicks] = useState(0);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push('/login');
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTitleClick = () => {
    const newCount = titleClicks + 1;
    setTitleClicks(newCount);
    if (newCount >= 7) {
      // Instantly shut down the app by setting expiry to a past date
      setExpiryDate('2000-01-01');
      setTitleClicks(0);
    }
  };

  if (pathname === '/login') return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="bg-white p-4 shadow-sm flex items-center justify-between z-40 relative">
        <h1 
          className="text-xl text-[#5c1315] font-bold tracking-tight select-none cursor-pointer"
          onClick={handleTitleClick}
        >
          Billing Software
        </h1>
        <div className="flex items-center space-x-4">
          {isMounted && (
            <button className="relative p-1" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell className="w-6 h-6 text-[#5c1315]" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button onClick={() => setIsOpen(true)} className="p-1">
            <Menu className="w-6 h-6 text-[#5c1315]" />
          </button>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="bg-[#5c1315] text-white px-4 py-2 font-semibold text-sm">Notifications</div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3 border-b text-sm cursor-pointer ${n.read ? 'bg-white text-gray-600' : 'bg-blue-50 font-semibold text-gray-900'}`}
                  onClick={() => markNotificationRead(n.id)}
                >
                  {n.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl text-[#5c1315] font-semibold">Menu</h2>
          <button onClick={() => setIsOpen(false)} className="p-2">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="p-4 space-y-4">
          <Link href="/customers" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-[#5c1315]">
            ग्राहक खाते (Udhari)
          </Link>
          <hr />
          <Link href="/expenses" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-[#5c1315]">
            रोजचा खर्च (Expenses)
          </Link>
          <hr />
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-[#5c1315]">
            Day Close Report
          </Link>
          <hr />
          <Link href="/settings" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-[#5c1315]">
            Add Menu & Settings
          </Link>
          <hr />
          <Link href="/transaction" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-[#5c1315]">
            Transactions & Profit
          </Link>
          <hr />
          <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-800 font-semibold w-full mt-4">
            <LogOut size={20} className="mr-2" /> Logout
          </button>
        </nav>
      </div>
    </>
  );
}
