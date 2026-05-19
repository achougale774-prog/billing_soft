'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const { invoices, expenses, settings, loadInvoices, loadExpenses } = useStore();
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  useEffect(() => { loadInvoices(); loadExpenses(); }, []);

  const filteredInvoices = invoices.filter(i => i.issueDate >= dateFrom && i.issueDate <= dateTo);
  const filteredExpenses = expenses.filter(e => e.date >= dateFrom && e.date <= dateTo);

  const totalRevenue = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalPaid = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPending = filteredInvoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.balanceDue, 0);
  const totalOverdue = filteredInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.balanceDue, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Category breakdown
  const expenseByCategory = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  // Invoice status breakdown
  const statusData = [
    { name: 'Paid', value: filteredInvoices.filter(i => i.status === 'paid').length },
    { name: 'Sent', value: filteredInvoices.filter(i => i.status === 'sent').length },
    { name: 'Overdue', value: filteredInvoices.filter(i => i.status === 'overdue').length },
    { name: 'Draft', value: filteredInvoices.filter(i => i.status === 'draft').length },
  ].filter(d => d.value > 0);

  // Daily trend
  const dailyData: Record<string, { revenue: number; expenses: number }> = {};
  filteredInvoices.forEach(i => {
    const date = i.issueDate;
    if (!dailyData[date]) dailyData[date] = { revenue: 0, expenses: 0 };
    dailyData[date].revenue += i.grandTotal;
  });
  filteredExpenses.forEach(e => {
    if (!dailyData[e.date]) dailyData[e.date] = { revenue: 0, expenses: 0 };
    dailyData[e.date].expenses += e.amount;
  });

  const trendData = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date: formatDate(date),
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
    }));

  const handleExportReport = () => {
    const report = {
      period: { from: dateFrom, to: dateTo },
      summary: { totalRevenue, totalPaid, totalPending, totalOverdue, totalExpenses, netProfit },
      invoices: filteredInvoices,
      expenses: filteredExpenses,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${dateFrom}-to-${dateTo}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Financial reports and insights</p>
        </div>
        <button onClick={handleExportReport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Date Filter */}
      <div className="card mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">From:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">To:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <span className="text-sm text-gray-500 ml-auto">
          {filteredInvoices.length} invoices • {filteredExpenses.length} expenses
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue, settings.currency)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid, settings.currency)}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, settings.currency)}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit, settings.currency)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Expenses Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses Trend</h3>
          {trendData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No data for selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value, settings.currency)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {categoryData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No expense data for selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, settings.currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Invoice Status */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Distribution</h3>
        {statusData.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No invoice data for selected period</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-4">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="flex-1 font-medium">{item.name}</span>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Outstanding Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-800">{formatCurrency(totalPending, settings.currency)}</p>
        </div>
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-700 font-medium">Overdue Amount</p>
          <p className="text-2xl font-bold text-red-800">{formatCurrency(totalOverdue, settings.currency)}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Collection Rate</p>
          <p className="text-2xl font-bold text-blue-800">
            {totalRevenue > 0 ? `${((totalPaid / totalRevenue) * 100).toFixed(1)}%` : '0%'}
          </p>
        </div>
      </div>
    </div>
  );
}
