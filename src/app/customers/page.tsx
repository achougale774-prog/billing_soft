'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { MessageCircle } from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const { isLoggedIn, transactions, customerPayments, addCustomerPayment } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{name: string, phone: string, balance: number} | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    setIsMounted(true);
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isMounted || !isLoggedIn) return null;

  // Calculate balances per customer
  const customerMap = new Map<string, { name: string; phone: string; totalCredit: number; totalPaid: number }>();

  transactions.forEach((tx) => {
    if (tx.paymentMethod === 'Credit' && tx.customerPhone) {
      const existing = customerMap.get(tx.customerPhone) || { name: tx.customerName || 'Unknown', phone: tx.customerPhone, totalCredit: 0, totalPaid: 0 };
      existing.totalCredit += tx.totalAmount;
      customerMap.set(tx.customerPhone, existing);
    }
  });

  customerPayments.forEach((pay) => {
    if (customerMap.has(pay.customerPhone)) {
      const existing = customerMap.get(pay.customerPhone)!;
      existing.totalPaid += pay.amount;
      customerMap.set(pay.customerPhone, existing);
    }
  });

  const customers = Array.from(customerMap.values())
    .map(c => ({ ...c, balance: c.totalCredit - c.totalPaid }))
    .filter(c => c.balance > 0);

  const handleSettlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('योग्य रक्कम टाका!');
      return;
    }
    
    addCustomerPayment({
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      amount: amount
    });
    
    toast.success('पैसे जमा झाले!');
    setSelectedCustomer(null);
    setPaymentAmount('');
  };

  const handleSendReminder = (name: string, phone: string, balance: number) => {
    const text = `नमस्कार ${name}, तुमची आमच्याकडे ₹${balance.toFixed(2)} उधारी बाकी आहे. कृपया लवकर जमा करा.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/91${phone}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] bg-[#fcf9f2]">
      <h2 className="text-xl font-semibold text-[#5c1315] mb-4">ग्राहक खाते (Udhari Book)</h2>
      
      {customers.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500 border border-amber-100">
          कोणतीही उधारी बाकी नाही
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.phone}</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-sm text-red-500 font-semibold mb-2">बाकी: ₹{c.balance.toFixed(2)}</p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleSendReminder(c.name, c.phone, c.balance)}
                    className="bg-[#25D366] text-white px-2 py-1.5 rounded flex items-center justify-center text-xs font-medium hover:bg-[#128C7E]"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button 
                    onClick={() => setSelectedCustomer(c)}
                    className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700"
                  >
                    जमा करा
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 shadow-xl">
            <h3 className="text-lg font-bold text-[#5c1315] mb-2">{selectedCustomer.name}</h3>
            <p className="text-sm text-gray-600 mb-4">एकूण बाकी: ₹{selectedCustomer.balance.toFixed(2)}</p>
            
            <form onSubmit={handleSettlePayment}>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-1">जमा रक्कम</label>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#5c1315]"
                  placeholder="₹"
                  max={selectedCustomer.balance}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setSelectedCustomer(null)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded text-sm font-medium hover:bg-gray-300">
                  रद्द करा
                </button>
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700">
                  जमा करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
