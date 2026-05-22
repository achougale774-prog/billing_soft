'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { isLoggedIn, menuItems, addMenuItem, deleteMenuItem, credentials, updateCredentials } = useStore();
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isMounted || !isLoggedIn) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !price) {
      toast.error('Item name and price are required!');
      return;
    }
    const finalName = quantity ? `${itemName} ${quantity}` : itemName;
    addMenuItem({
      name: finalName,
      price: parseFloat(price)
    });
    setItemName('');
    setPrice('');
    setQuantity('');
    toast.success('Item added to menu!');
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      toast.error('Username and password are required!');
      return;
    }
    updateCredentials(newUsername, newPassword);
    setNewUsername('');
    setNewPassword('');
    toast.success('Login credentials updated successfully!');
  };

  const handleExport = () => {
    const data = localStorage.getItem('rc-chicken65-storage-v2');
    if (!data) return toast.error('No data found to export');
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_rc_chicken65_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content); // validate JSON
        localStorage.setItem('rc-chicken65-storage-v2', content);
        toast.success('Backup restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] bg-[#fcf9f2]">
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 mb-6">
        <h2 className="text-xl font-semibold text-center text-[#5c1315] mb-4">Data Backup</h2>
        <div className="flex space-x-2">
          <button onClick={handleExport} className="flex-1 flex justify-center items-center bg-blue-600 text-white py-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
            <Download size={16} className="mr-2" /> Export Data
          </button>
          <label className="flex-1 flex justify-center items-center bg-green-600 text-white py-3 rounded text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer">
            <Upload size={16} className="mr-2" /> Import Data
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 mb-6">
        <h2 className="text-xl font-semibold text-center text-[#5c1315] mb-6">Reset Login Credentials</h2>
        <form onSubmit={handleUpdateCredentials} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5c1315] bg-transparent"
              placeholder={credentials?.username}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5c1315] bg-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#5c1315] text-white py-3 rounded mt-4 text-sm font-medium hover:bg-[#4a0f11] transition-colors"
          >
            UPDATE CREDENTIALS
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 mb-6">
        <h2 className="text-xl font-semibold text-center text-[#5c1315] mb-6">Add Items to Menu</h2>
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Item Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5c1315] bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantity/Weight (Optional)</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5c1315] bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5c1315] bg-transparent"
              required
              min="0"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#5c1315] text-white py-3 rounded mt-4 text-sm font-medium hover:bg-[#4a0f11] transition-colors"
          >
            ADD TO LIST
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 mb-6">
        <h2 className="text-xl font-semibold text-center text-[#5c1315] mb-4">Manage Menu</h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 border-b bg-gray-50 rounded">
              <span className="text-gray-800 text-sm">{item.name} - ₹{item.price}</span>
              <button onClick={() => deleteMenuItem(item.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {menuItems.length === 0 && <p className="text-center text-gray-500 text-sm">No items found</p>}
        </div>
      </div>
    </div>
  );
}
