'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, MenuItem } from '@/store/useStore';
import { toast } from 'sonner';
import { Plus, Minus, X, CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, menuItems, carts, addToCart, updateCartItemQty, removeFromCart, clearCart, addTransaction } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online' | 'Credit'>('Cash');
  const [activeTable, setActiveTable] = useState('टेबल 1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [lastBill, setLastBill] = useState<{
    items: typeof cart;
    totalAmount: number;
    paymentMethod: string;
    tableId: string;
    customerName?: string;
    date: Date;
  } | null>(null);

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

  const grandTotal = cartTotal;


  const handleGenerateBill = () => {
    if (cart.length === 0) {
      toast.error('कार्ट रिकामी आहे!');
      return;
    }
    
    if (paymentMethod === 'Credit' && (!customerName || !customerPhone)) {
      toast.error('उधारीसाठी ग्राहकाचे नाव आणि नंबर आवश्यक आहे!');
      return;
    }
    
    const allItemsToBill = [...cart];
    
    addTransaction({
      items: allItemsToBill,
      totalAmount: grandTotal,
      paymentMethod,
      type: 'Sales',
      tableId: activeTable,
      customerName: paymentMethod === 'Credit' ? customerName : undefined,
      customerPhone: paymentMethod === 'Credit' ? customerPhone : undefined,
    });
    
    setLastBill({
      items: allItemsToBill,
      totalAmount: grandTotal,
      paymentMethod,
      tableId: activeTable,
      customerName,
      date: new Date()
    });

    clearCart(activeTable);
    
    toast.success(`${activeTable} चे बिल यशस्वीरित्या तयार झाले!`);
    
    // Auto-prompt print after a short delay
    setTimeout(() => {
      window.print();
    }, 500);
    
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('Cash');
  };

  const tables = ['टेबल 1', 'टेबल 2', 'टेबल 3', 'टेबल 4', 'टेबल 5', 'पार्सल'];

  return (
    <>
    <div className="flex flex-col h-[calc(100vh-140px)] print:hidden">
      {/* Tables Row */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b bg-white scrollbar-hide">
        {tables.map((table) => {
          return (
            <button
              key={table}
              onClick={() => setActiveTable(table)}
              className={`px-4 py-3 text-sm font-medium relative ${
                activeTable === table ? 'bg-[#5c1315] text-white' : 'text-gray-600 bg-white'
              }`}
            >
              {table}
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

        <div className="p-2 flex flex-col space-y-2">
          <div className="flex bg-[#eef5fa] rounded-lg overflow-hidden border border-[#5c1315] w-full">
            <button 
              onClick={() => setPaymentMethod('Cash')}
              className={`flex-1 py-1.5 text-xs font-bold ${paymentMethod === 'Cash' ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}
            >
              रोख
            </button>
            <button 
              onClick={() => setPaymentMethod('Online')}
              className={`flex-1 py-1.5 text-xs font-bold ${paymentMethod === 'Online' ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}
            >
              ऑनलाईन
            </button>
            <button 
              onClick={() => setPaymentMethod('Credit')}
              className={`flex-1 py-1.5 text-xs font-bold ${paymentMethod === 'Credit' ? 'bg-[#5c1315] text-white' : 'text-[#5c1315]'}`}
            >
              उधारी
            </button>
          </div>
          
          {paymentMethod === 'Credit' && (
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="ग्राहकाचे नाव" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex-1 p-1.5 border border-gray-300 rounded text-xs" 
              />
              <input 
                type="tel" 
                placeholder="मोबाईल नंबर" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="flex-1 p-1.5 border border-gray-300 rounded text-xs" 
              />
            </div>
          )}
        </div>

        <div className="flex p-2 space-x-2 bg-gray-50">
          <button 
            onClick={handleGenerateBill}
            disabled={grandTotal === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={16} className="mr-2" /> बिल तयार करा
          </button>
        </div>
      </div>
    </div>
    
    {/* Thermal Receipt Print Area */}
    <div className="hidden print:block w-[58mm] text-black bg-white p-2 text-xs font-mono">
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg">RC Chicken65</h2>
        <p className="text-[10px]">Mobile POS App</p>
        <p className="text-[10px] border-b pb-2 mb-2">
          {lastBill ? lastBill.date.toLocaleString() : new Date().toLocaleString()}
        </p>
      </div>

      <div className="mb-2">
        <p><strong>Table:</strong> {lastBill?.tableId || activeTable}</p>
        {lastBill?.customerName && <p><strong>Cust:</strong> {lastBill.customerName}</p>}
        <p><strong>Pay:</strong> {lastBill?.paymentMethod}</p>
      </div>

      <div className="border-b border-t py-2 mb-2">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-1">Item</th>
              <th className="pb-1 text-center">Qty</th>
              <th className="pb-1 text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {(lastBill?.items || cart).map((item, i) => (
              <tr key={i}>
                <td className="py-1 break-words">{item.menuItem.name}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right text-[10px]">{(item.menuItem.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL:</span>
        <span>Rs. {(lastBill?.totalAmount || grandTotal).toFixed(2)}</span>
      </div>
      
      <div className="text-center mt-6 text-[10px]">
        <p>Thank You, Visit Again!</p>
        <p>****</p>
      </div>
    </div>
    </>
  );
}
