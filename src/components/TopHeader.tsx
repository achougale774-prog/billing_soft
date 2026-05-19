'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <>
      <header className="bg-white p-4 shadow-sm flex items-center justify-between z-40 relative">
        <h1 className="text-xl text-[#5c1315] font-semibold">RC Chicken65</h1>
        <button onClick={() => setIsOpen(true)} className="p-2">
          <Menu className="w-6 h-6 text-[#5c1315]" />
        </button>
      </header>

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
          <Link href="/settings" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-[#5c1315]">
            Add Menu
          </Link>
          <hr />
          <Link href="/transaction" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-[#5c1315]">
            Profit & Loss
          </Link>
        </nav>
      </div>
    </>
  );
}
