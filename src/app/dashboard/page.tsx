'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Printer, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, transactions, expenses } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isMounted || !isLoggedIn) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todaysTransactions = transactions.filter(tx => tx.date.startsWith(todayStr) && tx.type === 'Sales');
  const todaysExpenses = expenses.filter(e => e.date.startsWith(todayStr));

  const totalCashSales = todaysTransactions.filter(tx => tx.paymentMethod === 'Cash').reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalOnlineSales = todaysTransactions.filter(tx => tx.paymentMethod === 'Online').reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalCreditSales = todaysTransactions.filter(tx => tx.paymentMethod === 'Credit').reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalSales = totalCashSales + totalOnlineSales + totalCreditSales;

  const totalExpenses = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const cashInHand = totalCashSales - totalExpenses;

  // Item Analytics for today
  const itemCounts: Record<string, { name: string, quantity: number, revenue: number }> = {};
  todaysTransactions.forEach(tx => {
    tx.items.forEach(item => {
      const id = item.menuItem.id;
      if (!itemCounts[id]) {
        itemCounts[id] = { name: item.menuItem.name, quantity: 0, revenue: 0 };
      }
      itemCounts[id].quantity += item.quantity;
      itemCounts[id].revenue += (item.menuItem.price * item.quantity);
    });
  });

  const topItems = Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity);

  const handlePrintDayClose = () => {
    const doc = new jsPDF();
    const dateFormatted = format(new Date(), 'dd/MM/yyyy');
    
    doc.setFontSize(16);
    doc.text(`Day Close Report - Billing Software`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${dateFormatted}`, 14, 22);
    
    doc.setFontSize(12);
    doc.text('--- Sales Summary ---', 14, 32);
    doc.setFontSize(10);
    doc.text(`Cash Sales: Rs. ${totalCashSales.toFixed(2)}`, 14, 38);
    doc.text(`Online Sales: Rs. ${totalOnlineSales.toFixed(2)}`, 14, 44);
    doc.text(`Credit Sales: Rs. ${totalCreditSales.toFixed(2)}`, 14, 50);
    doc.text(`Total Sales: Rs. ${totalSales.toFixed(2)}`, 14, 56);
    
    doc.setFontSize(12);
    doc.text('--- Expenses ---', 14, 66);
    doc.setFontSize(10);
    doc.text(`Total Expenses: Rs. ${totalExpenses.toFixed(2)}`, 14, 72);
    
    doc.setFontSize(14);
    doc.text(`Cash In Hand: Rs. ${cashInHand.toFixed(2)}`, 14, 82);
    
    autoTable(doc, {
      startY: 92,
      head: [['Item Name', 'Qty Sold', 'Revenue (Rs)']],
      body: topItems.map(it => [it.name, it.quantity.toString(), it.revenue.toFixed(2)]),
    });

    doc.save(`Day_Close_${dateFormatted.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] bg-[#fcf9f2]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#5c1315]">Day Close Report</h2>
        <button 
          onClick={handlePrintDayClose}
          className="bg-[#5c1315] text-white p-2 rounded-full hover:bg-[#4a0f11]"
        >
          <Printer size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex flex-col items-center">
          <span className="text-xs text-gray-500 font-semibold uppercase">Total Sales</span>
          <span className="text-xl font-bold text-gray-800 mt-1">₹{totalSales.toFixed(2)}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex flex-col items-center">
          <span className="text-xs text-red-500 font-semibold uppercase">Total Expenses</span>
          <span className="text-xl font-bold text-red-600 mt-1">₹{totalExpenses.toFixed(2)}</span>
        </div>
        <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200 col-span-2 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm text-green-800 font-bold uppercase flex items-center"><TrendingUp size={16} className="mr-1" /> Profit / Cash in Hand</span>
            <span className="text-xs text-green-600 mt-1">Total Sales - Total Expenses</span>
          </div>
          <span className="text-2xl font-black text-green-700">₹{cashInHand.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4 mb-6">
        <h3 className="font-bold text-[#5c1315] border-b pb-2 mb-3">Sales Breakdown</h3>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Cash:</span>
          <span className="font-semibold text-gray-800">₹{totalCashSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Online:</span>
          <span className="font-semibold text-gray-800">₹{totalOnlineSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Credit (Udhari):</span>
          <span className="font-semibold text-red-600">₹{totalCreditSales.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4">
        <h3 className="font-bold text-[#5c1315] border-b pb-2 mb-3">Top Selling Items (Graph)</h3>
        {topItems.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                <Bar dataKey="revenue" fill="#5c1315" radius={[0, 4, 4, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-4">No sales yet today.</p>
        )}
      </div>
    </div>
  );
}
