'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Triangle, Circle, Square } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around max-w-md mx-auto z-50">
      <Link href="/" className={`flex flex-col items-center justify-center p-3 flex-1 ${isActive('/') ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}>
        <Triangle className={`w-6 h-6 fill-current`} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link href="/settings" className={`flex flex-col items-center justify-center p-3 flex-1 ${isActive('/settings') ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}>
        <Circle className={`w-6 h-6 fill-current`} />
        <span className="text-xs mt-1">Settings</span>
      </Link>
      <Link href="/transaction" className={`flex flex-col items-center justify-center p-3 flex-1 ${isActive('/transaction') ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}>
        <Square className={`w-6 h-6 fill-current`} />
        <span className="text-xs mt-1">Transaction</span>
      </Link>
    </div>
  );
}
