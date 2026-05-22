'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, Transaction } from '@/store/useStore';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TransactionPage() {
  const router = useRouter();
  const { isLoggedIn, transactions } = useStore();
  const [tab, setTab] = useState<'Sales' | 'Purchases'>('Sales');
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      loadAllTransactions();
    }
  }, [isLoggedIn, router, transactions, tab]);

  if (!isMounted || !isLoggedIn) return null;

  function loadByDateRange(start: string, end: string) {
    setFromDate(start);
    setToDate(end);
    const filtered = transactions.filter(tx => {
      if (tx.type !== tab) return false;
      const txDate = tx.date.split('T')[0];
      return txDate >= start && txDate <= end;
    });
    setFilteredTransactions(filtered);
  }

  function loadByDate() {
    loadByDateRange(fromDate, toDate);
  }

  function handleThisWeek() {
    const today = new Date();
    loadByDateRange(
      format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    );
  }

  function handleThisMonth() {
    const today = new Date();
    loadByDateRange(
      format(startOfMonth(today), 'yyyy-MM-dd'),
      format(endOfMonth(today), 'yyyy-MM-dd')
    );
  }

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Transaction Report (${tab})`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(fromDate), 'dd/MM/yyyy')} to ${format(new Date(toDate), 'dd/MM/yyyy')}`, 14, 22);
    
    const tableData = filteredTransactions.map(tx => [
      format(parseISO(tx.date), 'dd/MM/yyyy'),
      tx.customerName || 'Customer',
      tx.paymentMethod,
      tx.totalAmount.toFixed(2)
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Customer', 'Payment Mode', 'Amount (Rs)']],
      body: tableData,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 30;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('--- Summary Calculation ---', 14, finalY + 10);
    doc.setFontSize(10);
    doc.text(`Cash Total: Rs. ${totalCash.toFixed(2)}`, 14, finalY + 16);
    doc.text(`Online Total: Rs. ${totalOnline.toFixed(2)}`, 14, finalY + 22);
    doc.text(`Credit (Udhari) Total: Rs. ${totalCredit.toFixed(2)}`, 14, finalY + 28);
    
    doc.setFontSize(12);
    doc.text(`Total Balance (Cash + Online): Rs. ${totalBalance.toFixed(2)}`, 14, finalY + 36);

    doc.save(`Report_${tab}_${fromDate}_to_${toDate}.pdf`);
  };

  function loadAllTransactions() {
    setFilteredTransactions(transactions.filter(tx => tx.type === tab));
  }

  const totalCash = filteredTransactions
    .filter(tx => tx.paymentMethod === 'Cash')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const totalOnline = filteredTransactions
    .filter(tx => tx.paymentMethod === 'Online')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);
    
  const totalCredit = filteredTransactions
    .filter(tx => tx.paymentMethod === 'Credit')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const totalBalance = totalCash + totalOnline;

  return (
    <div className="p-4 overflow-y-auto h-[calc(100vh-140px)] bg-white">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setTab('Sales')}
          className={`flex-1 text-center py-2 font-semibold ${
            tab === 'Sales' ? 'text-[#5c1315] border-b-2 border-[#5c1315]' : 'text-gray-500'
          }`}
        >
          विक्री
        </button>
        <button
          onClick={() => setTab('Purchases')}
          className={`flex-1 text-center py-2 font-semibold ${
            tab === 'Purchases' ? 'text-[#5c1315] border-b-2 border-[#5c1315]' : 'text-gray-500'
          }`}
        >
          खरेदी
        </button>
      </div>

      {/* Date Filters */}
      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-[#5c1315] mb-1">तारीख पासून</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-gray-100 p-2 rounded border border-gray-300 text-sm outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-[#5c1315] mb-1">तारीख पर्यंत</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-gray-100 p-2 rounded border border-gray-300 text-sm outline-none"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={handleThisWeek}
          className="flex-1 bg-blue-50 text-blue-700 py-2 rounded text-xs font-semibold border border-blue-200"
        >
          या आठवड्याचा
        </button>
        <button 
          onClick={handleThisMonth}
          className="flex-1 bg-green-50 text-green-700 py-2 rounded text-xs font-semibold border border-green-200"
        >
          या महिन्याचा
        </button>
        <button 
          onClick={downloadPDF}
          className="flex-1 bg-red-50 text-red-700 py-2 rounded text-xs font-semibold border border-red-200"
        >
          PDF डाउनलोड
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <button 
          onClick={loadByDate}
          className="w-full bg-[#5c1315] text-white py-3 rounded text-sm font-medium hover:bg-[#4a0f11] transition-colors"
        >
          व्यवहार तारखेनुसार पहा
        </button>
        <button 
          onClick={loadAllTransactions}
          className="w-full bg-[#fce899] text-[#5c1315] py-3 rounded text-sm font-medium hover:bg-[#ebd57b] transition-colors"
        >
          सर्व व्यवहार पहा
        </button>
      </div>

      {/* Totals */}
      <div className="flex space-x-2 mb-6">
        <div className="flex-1 bg-[#fff0f3] border border-[#ffe0e6] rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
          <span className="text-[#5c1315] font-semibold text-xs">रोख</span>
          <span className="text-lg font-bold mt-1">₹{totalCash.toFixed(2)}</span>
        </div>
        <div className="flex-1 bg-[#fffff0] border border-[#f0f0d0] rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
          <span className="text-[#5c1315] font-semibold text-xs">ऑनलाईन</span>
          <span className="text-lg font-bold mt-1">₹{totalOnline.toFixed(2)}</span>
        </div>
        <div className="flex-1 bg-[#f0f4ff] border border-[#d0e0ff] rounded-xl p-3 flex flex-col items-center justify-center shadow-sm">
          <span className="text-[#3b5998] font-semibold text-xs">उधारी</span>
          <span className="text-lg font-bold mt-1">₹{totalCredit.toFixed(2)}</span>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-[#5c1315] text-white text-xs grid grid-cols-4 p-3">
          <div>तारीख</div>
          <div>नाव</div>
          <div>पेमेंट</div>
          <div className="text-right">(₹) रक्कम</div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="grid grid-cols-4 p-3 border-b text-sm text-gray-700 items-center">
                <div className="truncate pr-2">{format(parseISO(tx.date), 'dd/MM/yyyy')}</div>
                <div className="truncate pr-2 text-xs">
                  {tx.paymentMethod === 'Credit' && tx.customerName ? tx.customerName : 'Customer'}
                </div>
                <div className="text-xs font-semibold">
                  {tx.paymentMethod === 'Cash' ? 'रोख' : tx.paymentMethod === 'Online' ? 'ऑनलाईन' : 'उधारी'}
                </div>
                <div className="text-right font-bold text-gray-900">₹{tx.totalAmount.toFixed(2)}</div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 text-sm">
              कोणतेही व्यवहार आढळले नाहीत
            </div>
          )}
        </div>
        <div className="bg-[#fce899] p-3 text-right font-bold text-[#5c1315] border-t">
          शिल्लक रक्कम: ₹{totalBalance.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
