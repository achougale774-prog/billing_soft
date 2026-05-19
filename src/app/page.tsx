'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, MenuItem } from '@/store/useStore';
import { toast } from 'sonner';
import { Plus, Minus, X } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, menuItems, cart, addToCart, updateCartItemQty, removeFromCart, clearCart, addTransaction } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');
  const [activeTable, setActiveTable] = useState('टेबल 1');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isMounted || !isLoggedIn) return null;

  const filteredMenu = menuItems.filter((item) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handleGenerateBill = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return;
    }
    
    addTransaction({
      items: cart,
      totalAmount,
      paymentMethod,
      type: 'Sales'
    });
    
    clearCart();
    toast.success('Bill Generated Successfully!');
  };

  const tables = ['टेबल 1', 'टेबल 2', 'टेबल 3', 'टेबल 4', 'टेबल 5'];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Tables Row */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b bg-white scrollbar-hide">
        {tables.map((table) => (
          <button
            key={table}
            onClick={() => setActiveTable(table)}
            className={`px-4 py-3 text-sm font-medium ${
              activeTable === table ? 'bg-[#5c1315] text-white' : 'text-gray-600 bg-white'
            }`}
          >
            {table}
          </button>
        ))}
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <input
          type="text"
          placeholder="पदार्थ शोधा"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border-b mb-4 outline-none text-gray-700 bg-transparent"
        />

        <div className="grid grid-cols-4 gap-2 mb-6">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item, 1)}
              className="bg-[#eef5fa] p-2 rounded-lg shadow-sm border border-blue-50 flex flex-col items-center justify-center text-center hover:bg-[#d9ecf9] transition-colors"
            >
              <span className="text-[#3b5998] font-bold text-xs leading-tight">{item.name}</span>
              <span className="text-green-600 text-xs mt-1 font-semibold">₹{item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-t mt-auto">
        <div className="bg-[#5c1315] text-white text-xs grid grid-cols-12 p-2">
          <div className="col-span-4">पदार्थ</div>
          <div className="col-span-4 text-center">प्रमाण</div>
          <div className="col-span-2 text-center">किंमत</div>
          <div className="col-span-2 text-right">एकूण</div>
        </div>
        
        <div className="max-h-32 overflow-y-auto">
          {cart.map((cartItem) => (
            <div key={cartItem.id} className="grid grid-cols-12 items-center p-2 border-b text-sm">
              <div className="col-span-4 text-gray-700 truncate pr-1">{cartItem.menuItem.name}</div>
              <div className="col-span-4 flex items-center justify-center space-x-2">
                <button 
                  onClick={() => {
                    if (cartItem.quantity > 1) updateCartItemQty(cartItem.id, cartItem.quantity - 1);
                  }}
                  className="bg-[#5c1315] text-white p-1 rounded h-6 w-6 flex items-center justify-center"
                >
                  <Minus size={12} />
                </button>
                <span className="w-4 text-center">{cartItem.quantity}</span>
                <button 
                  onClick={() => updateCartItemQty(cartItem.id, cartItem.quantity + 1)}
                  className="bg-[#5c1315] text-white p-1 rounded h-6 w-6 flex items-center justify-center"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="col-span-2 text-center text-gray-600">{cartItem.menuItem.price}</div>
              <div className="col-span-2 flex items-center justify-end space-x-1">
                <span className="text-gray-700">{cartItem.menuItem.price * cartItem.quantity}</span>
                <button onClick={() => removeFromCart(cartItem.id)} className="text-red-500">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#5c1315] text-white p-3 flex justify-between items-center mt-2">
          <span className="font-bold">एकूण रक्कम: {totalAmount}</span>
        </div>

        <div className="p-3 flex items-center justify-between">
          <span className="text-gray-500 text-sm">Payment</span>
          <div className="flex bg-[#eef5fa] rounded-lg overflow-hidden border border-[#5c1315]">
            <button 
              onClick={() => setPaymentMethod('Cash')}
              className={`px-6 py-2 text-sm ${paymentMethod === 'Cash' ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}
            >
              रोख
            </button>
            <button 
              onClick={() => setPaymentMethod('Online')}
              className={`px-6 py-2 text-sm ${paymentMethod === 'Online' ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}
            >
              ऑनलाईन
            </button>
          </div>
        </div>

        <button 
          onClick={handleGenerateBill}
          className="w-full bg-[#5c1315] text-white py-4 font-bold hover:bg-[#4a0f11] transition-colors"
        >
          बिल तयार करा
        </button>
      </div>
    </div>
  );
}
