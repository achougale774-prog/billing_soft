'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, KitchenOrder } from '@/store/useStore';
import { format } from 'date-fns';
import { ChefHat, CheckCircle, Clock } from 'lucide-react';

export default function KitchenPage() {
  const router = useRouter();
  const { isLoggedIn, kitchenOrders, updateOrderStatus } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isMounted || !isLoggedIn) return null;

  // Only show Pending and Preparing orders in the Kitchen
  const activeOrders = kitchenOrders
    .filter(o => o.status === 'Pending' || o.status === 'Preparing')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleStatusChange = (order: KitchenOrder) => {
    if (order.status === 'Pending') {
      updateOrderStatus(order.id, 'Preparing');
    } else if (order.status === 'Preparing') {
      updateOrderStatus(order.id, 'Ready');
    }
  };

  return (
    <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#5c1315] flex items-center">
          <ChefHat className="mr-2" /> Kitchen Dashboard
        </h2>
        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
          {activeOrders.length} Orders Pending
        </span>
      </div>

      <div className="space-y-4">
        {activeOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 flex flex-col items-center">
            <CheckCircle size={48} className="text-green-300 mb-3" />
            <p className="font-semibold">All caught up!</p>
            <p className="text-sm">No pending orders in the kitchen.</p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className={`p-3 text-white flex justify-between items-center ${
                order.status === 'Pending' ? 'bg-orange-500' : 'bg-blue-500'
              }`}>
                <h3 className="font-bold text-lg">{order.tableId}</h3>
                <div className="flex items-center text-sm font-medium">
                  <Clock size={14} className="mr-1" />
                  {format(new Date(order.timestamp), 'hh:mm a')}
                </div>
              </div>
              
              <div className="p-4">
                <ul className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="font-medium text-gray-800 text-lg">{item.menuItem.name}</span>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded font-bold text-lg">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleStatusChange(order)}
                  className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-sm transition-transform active:scale-95 ${
                    order.status === 'Pending' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {order.status === 'Pending' ? 'Start Preparing' : 'Mark as Ready'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
