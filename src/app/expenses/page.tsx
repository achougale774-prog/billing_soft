'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { format, parseISO } from 'date-fns';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const router = useRouter();
  const { isLoggedIn, expenses, addExpense, deleteExpense } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('इतर (Other)');

  const categories = ['कच्चा माल (Raw Material)', 'लाईट बिल (Light Bill)', 'पगार (Salary)', 'किराणा (Groceries)', 'इतर (Other)'];

  useEffect(() => {
    setIsMounted(true);
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isMounted || !isLoggedIn) return null;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.error('कृपया खर्चाचे नाव आणि रक्कम भरा!');
      return;
    }
    
    addExpense({
      title,
      amount: parseFloat(amount),
      category
    });
    
    toast.success('खर्च यशस्वीरित्या नोंदवला गेला!');
    setTitle('');
    setAmount('');
    setCategory('इतर (Other)');
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#5c1315] flex items-center">
          <Wallet className="mr-2" /> रोजचा खर्च (Expenses)
        </h2>
      </div>

      {/* Add Expense Form */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">काय खर्च झाला? (उदा. भाजीपाला, गॅस)</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5c1315]/20 text-sm"
              placeholder="खर्चाचे नाव"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">खर्चाचा प्रकार (Category)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5c1315]/20 text-sm bg-white"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">रक्कम (₹)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5c1315]/20 text-sm"
              placeholder="0.00"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#5c1315] text-white py-3 rounded-lg font-bold flex items-center justify-center hover:bg-[#4a0f11] transition-colors"
          >
            <Plus size={18} className="mr-1" /> खर्च ॲड करा
          </button>
        </form>
      </div>

      {/* Summary */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex justify-between items-center">
        <span className="text-red-800 font-bold">एकूण खर्च:</span>
        <span className="text-2xl font-black text-red-600">₹{totalExpenses.toFixed(2)}</span>
      </div>

      {/* Expenses List */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">खर्चाची यादी</h3>
        {expenses.length === 0 ? (
          <div className="text-center p-6 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            अजून कोणताही खर्च नोंदवला नाही.
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{expense.title}</div>
                  <div className="text-xs font-semibold text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded mt-1">{expense.category || 'इतर (Other)'}</div>
                  <div className="text-xs text-gray-500 mt-1">{format(parseISO(expense.date), 'dd/MM/yyyy hh:mm a')}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-red-600">₹{expense.amount.toFixed(2)}</span>
                  <button 
                    onClick={() => deleteExpense(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
