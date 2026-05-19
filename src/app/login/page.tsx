'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const login = useStore((state) => state.login);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  if (!isMounted) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      toast.success('Login Successful');
      router.push('/');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-[#5c1315] mb-6">RC Chicken65 Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-[#5c1315] focus:ring-[#5c1315]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-[#5c1315] focus:ring-[#5c1315]"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5c1315] hover:bg-[#4a0f11] focus:outline-none"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
