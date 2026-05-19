'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Wallet } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Expense } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { toast } from 'sonner';

const EXPENSE_CATEGORIES = [
  'Rent', 'Salaries', 'Utilities', 'Office Supplies', 'Marketing',
  'Travel', 'Maintenance', 'Insurance', 'Raw Materials', 'Other'
];

export default function ExpensesPage() {
  const { expenses, loadExpenses, addExpense, updateExpense, deleteExpense, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: '', description: '', amount: 0, date: '', paymentMethod: 'cash', receiptNo: '', vendor: ''
  });

  useEffect(() => { loadExpenses(); }, []);

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount || !formData.date) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, formData);
      toast.success('Expense updated successfully');
    } else {
      addExpense(formData);
      toast.success('Expense added successfully');
    }
    closeModal();
  };

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        paymentMethod: expense.paymentMethod,
        receiptNo: expense.receiptNo || '',
        vendor: expense.vendor || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({ 
        category: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0], 
        paymentMethod: 'cash', receiptNo: '', vendor: '' 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = (expense: Expense) => {
    deleteExpense(expense.id);
    toast.success('Expense deleted');
    setDeleteConfirm(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="text-gray-500 mt-1">Track and manage business expenses</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Summary Card */}
      <div className="card mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">Total Expenses</p>
            <p className="text-3xl font-bold text-red-700">{formatCurrency(totalExpenses, settings.currency)}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-48"
        >
          <option value="all">All Categories</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Vendor</th>
              <th>Payment</th>
              <th>Amount</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No expenses found</p>
                  <p className="text-sm mt-1">Add your first expense to get started</p>
                </td>
              </tr>
            ) : (
              filteredExpenses.map(expense => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.date)}</td>
                  <td>
                    <span className="badge bg-orange-100 text-orange-700">{expense.category}</span>
                  </td>
                  <td>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    {expense.receiptNo && <p className="text-xs text-gray-500">Receipt: {expense.receiptNo}</p>}
                  </td>
                  <td>{expense.vendor || '-'}</td>
                  <td className="capitalize">{expense.paymentMethod.replace('_', ' ')}</td>
                  <td className="font-semibold text-red-600">{formatCurrency(expense.amount, settings.currency)}</td>
                  <td className="no-print">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openModal(expense)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(expense)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input 
                type="date"
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Expense description"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input 
                type="number"
                step="0.01"
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select 
                value={formData.paymentMethod} 
                onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Vendor</label>
              <input 
                value={formData.vendor} 
                onChange={e => setFormData({...formData, vendor: e.target.value})}
                placeholder="Vendor name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Receipt Number</label>
              <input 
                value={formData.receiptNo} 
                onChange={e => setFormData({...formData, receiptNo: e.target.value})}
                placeholder="Receipt/Ref number"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              {editingExpense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense? This action cannot be undone.`}
      />
    </div>
  );
}
