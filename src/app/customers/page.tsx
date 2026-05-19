'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, User } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Customer } from '@/types';
import { toast } from 'sonner';

export default function CustomersPage() {
  const { customers, loadCustomers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', gstNumber: ''
  });

  useEffect(() => { loadCustomers(); }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      toast.success('Customer updated successfully');
    } else {
      addCustomer(formData);
      toast.success('Customer added successfully');
    }
    closeModal();
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        gstNumber: customer.gstNumber || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '', gstNumber: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '', gstNumber: '' });
  };

  const handleDelete = (customer: Customer) => {
    deleteCustomer(customer.id);
    toast.success('Customer deleted');
    setDeleteConfirm(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer database</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Address</th>
              <th>GST Number</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No customers found</p>
                  <p className="text-sm mt-1">Add your first customer to get started</p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm">{customer.phone}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </td>
                  <td className="max-w-xs truncate">{customer.address}</td>
                  <td>{customer.gstNumber || '-'}</td>
                  <td className="no-print">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openModal(customer)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(customer)}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Customer name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Full address"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">GST Number</label>
            <input 
              value={formData.gstNumber} 
              onChange={e => setFormData({...formData, gstNumber: e.target.value})}
              placeholder="GST1234567890"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              {editingCustomer ? 'Update' : 'Add'} Customer
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
