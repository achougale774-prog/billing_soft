'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, MenuItem, KitchenOrder } from '@/store/useStore';
import { toast } from 'sonner';
import { Plus, Minus, X, ChefHat, CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, menuItems, carts, addToCart, updateCartItemQty, removeFromCart, clearCart, addTransaction, sendToKitchen, kitchenOrders, updateOrderStatus } = useStore();
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

  const cart = carts[activeTable] || [];
  const cartTotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  // Active kitchen orders for this table (not yet completed/billed)
  const activeOrdersForTable = kitchenOrders.filter(o => o.tableId === activeTable && o.status !== 'Completed');
  const orderTotal = activeOrdersForTable.reduce((sum, order) => {
    return sum + order.items.reduce((s, item) => s + (item.menuItem.price * item.quantity), 0);
  }, 0);

  const grandTotal = cartTotal + orderTotal;

  const handleSendToKitchen = () => {
    if (cart.length === 0) {
      toast.error('कार्ट रिकामी आहे!');
      return;
    }
    sendToKitchen(activeTable, cart);
    toast.success(`${activeTable} ची ऑर्डर किचनला पाठवली!`);
  };

  const handleGenerateBill = () => {
    if (cart.length === 0 && activeOrdersForTable.length === 0) {
      toast.error('कार्ट आणि ऑर्डर्स रिकाम्या आहेत!');
      return;
    }
    
    const allItemsToBill = [
      ...cart,
      ...activeOrdersForTable.flatMap(o => o.items)
    ];
    
    addTransaction({
      items: allItemsToBill,
      totalAmount: grandTotal,
      paymentMethod,
      type: 'Sales',
      tableId: activeTable
    });
    
    clearCart(activeTable);
    // Mark kitchen orders as completed
    activeOrdersForTable.forEach(o => updateOrderStatus(o.id, 'Completed'));
    
    toast.success(`${activeTable} चे बिल यशस्वीरित्या तयार झाले!`);
  };

  const tables = ['टेबल 1', 'टेबल 2', 'टेबल 3', 'टेबल 4', 'टेबल 5'];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Tables Row */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b bg-white scrollbar-hide">
        {tables.map((table) => {
          // Check if table has active ready orders
          const hasReady = kitchenOrders.some(o => o.tableId === table && o.status === 'Ready');
          return (
            <button
              key={table}
              onClick={() => setActiveTable(table)}
              className={`px-4 py-3 text-sm font-medium relative ${
                activeTable === table ? 'bg-[#5c1315] text-white' : 'text-gray-600 bg-white'
              }`}
            >
              {table}
              {hasReady && <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
            </button>
          )
        })}
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
              onClick={() => addToCart(activeTable, item, 1)}
              className="bg-[#eef5fa] p-2 rounded-lg shadow-sm border border-blue-50 flex flex-col items-center justify-center text-center hover:bg-[#d9ecf9] transition-colors h-24"
            >
              <span className="text-[#3b5998] font-bold text-xs leading-tight">{item.name}</span>
              <span className="text-green-600 text-xs mt-1 font-semibold">₹{item.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-t mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        
        {/* Kitchen Orders Section */}
        {activeOrdersForTable.length > 0 && (
          <div className="bg-orange-50 border-b border-orange-100 p-2 max-h-24 overflow-y-auto">
            <h4 className="text-xs font-bold text-orange-800 mb-1">Kitchen Orders:</h4>
            {activeOrdersForTable.map(order => (
              <div key={order.id} className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-600">{order.items.map(i => `${i.menuItem.name}x${i.quantity}`).join(', ')}</span>
                <span className={`font-semibold px-2 py-0.5 rounded ${
                  order.status === 'Ready' ? 'bg-green-100 text-green-700' : 
                  order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#5c1315] text-white text-xs grid grid-cols-12 p-2">
          <div className="col-span-4">पदार्थ</div>
          <div className="col-span-4 text-center">प्रमाण</div>
          <div className="col-span-2 text-center">किंमत</div>
          <div className="col-span-2 text-right">एकूण</div>
        </div>
        
        <div className="max-h-32 overflow-y-auto min-h-[40px]">
          {cart.length === 0 && <p className="text-center text-xs text-gray-400 mt-2">New items will appear here...</p>}
          {cart.map((cartItem) => (
            <div key={cartItem.id} className="grid grid-cols-12 items-center p-2 border-b text-sm">
              <div className="col-span-4 text-gray-700 truncate pr-1 text-xs font-medium">{cartItem.menuItem.name}</div>
              <div className="col-span-4 flex items-center justify-center space-x-1">
                <button 
                  onClick={() => {
                    if (cartItem.quantity > 1) updateCartItemQty(activeTable, cartItem.id, cartItem.quantity - 1);
                  }}
                  className="bg-[#5c1315] text-white rounded h-5 w-5 flex items-center justify-center"
                >
                  <Minus size={10} />
                </button>
                <span className="w-4 text-center text-xs font-bold">{cartItem.quantity}</span>
                <button 
                  onClick={() => updateCartItemQty(activeTable, cartItem.id, cartItem.quantity + 1)}
                  className="bg-[#5c1315] text-white rounded h-5 w-5 flex items-center justify-center"
                >
                  <Plus size={10} />
                </button>
              </div>
              <div className="col-span-2 text-center text-gray-600 text-xs">₹{cartItem.menuItem.price}</div>
              <div className="col-span-2 flex items-center justify-end space-x-1">
                <span className="text-gray-700 text-xs font-semibold">₹{cartItem.menuItem.price * cartItem.quantity}</span>
                <button onClick={() => removeFromCart(activeTable, cartItem.id)} className="text-red-500">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#5c1315] text-white p-2 flex justify-between items-center mt-1">
          <span className="font-bold text-sm">एकूण रक्कम: ₹{grandTotal}</span>
        </div>

        <div className="p-2 flex items-center justify-between">
          <div className="flex bg-[#eef5fa] rounded-lg overflow-hidden border border-[#5c1315] flex-1 mr-2">
            <button 
              onClick={() => setPaymentMethod('Cash')}
              className={`flex-1 py-1 text-xs font-bold ${paymentMethod === 'Cash' ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}
            >
              रोख
            </button>
            <button 
              onClick={() => setPaymentMethod('Online')}
              className={`flex-1 py-1 text-xs font-bold ${paymentMethod === 'Online' ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}
            >
              ऑनलाईन
            </button>
          </div>
        </div>

        <div className="flex p-2 space-x-2 bg-gray-50">
          <button 
            onClick={handleSendToKitchen}
            disabled={cart.length === 0}
            className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-orange-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChefHat size={16} className="mr-2" /> किचनला पाठवा
          </button>
          <button 
            onClick={handleGenerateBill}
            disabled={grandTotal === 0}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={16} className="mr-2" /> बिल तयार करा
          </button>
        </div>
      </div>
    </div>
  );
}
