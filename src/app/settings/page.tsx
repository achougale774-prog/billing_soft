'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { Printer as PrinterIcon, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { isLoggedIn, menuItems, addMenuItem, deleteMenuItem } = useStore();
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

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

  return (
    <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] bg-[#fcf9f2]">
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 mb-6">
        <h2 className="text-xl font-semibold text-center text-[#5c1315] mb-4">Printer</h2>
        <div className="space-y-3">
          <button className="w-full bg-[#5c1315] text-white py-3 rounded text-sm font-medium hover:bg-[#4a0f11] transition-colors">
            ENABLE BLUETOOTH
          </button>
          <button className="w-full bg-[#5c1315] text-white py-3 rounded text-sm font-medium hover:bg-[#4a0f11] transition-colors">
            LIST PAIRED DEVICES
          </button>
        </div>
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

      <button className="w-full bg-[#5c1315] text-white py-4 flex justify-center items-center font-bold hover:bg-[#4a0f11] transition-colors mb-4">
        <PrinterIcon className="mr-2" size={20} /> TEST PRINTER
      </button>
    </div>
  );
}
