'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Trash2, FileText, Printer, CreditCard, Download } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InvoiceBuilder } from '@/components/billing/InvoiceBuilder';
import { InvoicePrint } from '@/components/billing/InvoicePrint';
import { Invoice, InvoiceStatus } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/utils/helpers';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const { 
    invoices, loadInvoices, addInvoice, deleteInvoice, addPayment, settings 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Invoice | null>(null);
  const [paymentData, setPaymentData] = useState({ amount: 0, method: 'cash', date: '', notes: '', transactionId: '' });

  useEffect(() => { loadInvoices(); }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = (data: any) => {
    addInvoice(data);
    toast.success('Invoice created successfully');
    setIsCreateModalOpen(false);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || paymentData.amount <= 0) return;

    if (paymentData.amount > paymentInvoice.balanceDue) {
      toast.error('Payment amount cannot exceed balance due');
      return;
    }

    addPayment(paymentInvoice.id, {
      amount: paymentData.amount,
      method: paymentData.method as any,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      notes: paymentData.notes,
      transactionId: paymentData.transactionId,
    });

    toast.success('Payment recorded successfully');
    setPaymentInvoice(null);
    setPaymentData({ amount: 0, method: 'cash', date: '', notes: '', transactionId: '' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (invoice: Invoice) => {
    const dataStr = JSON.stringify(invoice, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice exported');
  };

  const handleDelete = (invoice: Invoice) => {
    deleteInvoice(invoice.id);
    toast.success('Invoice deleted');
    setDeleteConfirm(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="text-gray-500 mt-1">Manage invoices and payments</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice number or customer..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
          className="w-40"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Balance</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No invoices found</p>
                  <p className="text-sm mt-1">Create your first invoice to get started</p>
                </td>
              </tr>
            ) : (
              filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="font-semibold text-primary-600">{invoice.invoiceNumber}</td>
                  <td>
                    <p className="font-medium text-gray-900">{invoice.customerName}</p>
                    <p className="text-xs text-gray-500">{invoice.customerEmail}</p>
                  </td>
                  <td>{formatDate(invoice.issueDate)}</td>
                  <td>{formatDate(invoice.dueDate)}</td>
                  <td className="font-semibold">{formatCurrency(invoice.grandTotal, settings.currency)}</td>
                  <td>
                    <span className={`badge ${getStatusColor(invoice.status)} capitalize`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <span className={invoice.balanceDue > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {formatCurrency(invoice.balanceDue, settings.currency)}
                    </span>
                  </td>
                  <td className="no-print">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setViewInvoice(invoice)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {invoice.balanceDue > 0 && (
                        <button 
                          onClick={() => {
                            setPaymentInvoice(invoice);
                            setPaymentData({ ...paymentData, amount: invoice.balanceDue });
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-green-600"
                          title="Add Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleExport(invoice)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Export"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(invoice)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                        title="Delete"
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

      {/* Create Invoice Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Invoice" size="xl">
        <InvoiceBuilder 
          onSave={handleCreateInvoice} 
          onCancel={() => setIsCreateModalOpen(false)} 
        />
      </Modal>

      {/* View Invoice Modal */}
      <Modal isOpen={!!viewInvoice} onClose={() => setViewInvoice(null)} title="Invoice Details" size="xl">
        {viewInvoice && (
          <div>
            <div className="no-print flex gap-2 mb-4">
              <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={() => handleExport(viewInvoice)} className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
            <InvoicePrint invoice={viewInvoice} />
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={!!paymentInvoice} onClose={() => setPaymentInvoice(null)} title="Record Payment" size="md">
        {paymentInvoice && (
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Invoice: <span className="font-semibold">{paymentInvoice.invoiceNumber}</span></p>
              <p className="text-sm text-gray-600">Balance Due: <span className="font-bold text-red-600">{formatCurrency(paymentInvoice.balanceDue, settings.currency)}</span></p>
            </div>
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input 
                type="number"
                step="0.01"
                max={paymentInvoice.balanceDue}
                value={paymentData.amount} 
                onChange={e => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select 
                value={paymentData.method} 
                onChange={e => setPaymentData({...paymentData, method: e.target.value})}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input 
                type="date"
                value={paymentData.date} 
                onChange={e => setPaymentData({...paymentData, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transaction ID</label>
              <input 
                value={paymentData.transactionId} 
                onChange={e => setPaymentData({...paymentData, transactionId: e.target.value})}
                placeholder="Optional transaction reference"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea 
                value={paymentData.notes} 
                onChange={e => setPaymentData({...paymentData, notes: e.target.value})}
                rows={2}
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setPaymentInvoice(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Record Payment</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice "${deleteConfirm?.invoiceNumber}"? This action cannot be undone.`}
      />
    </div>
  );
}
