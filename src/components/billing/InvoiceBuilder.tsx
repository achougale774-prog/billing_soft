'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Customer, Product, InvoiceItem } from '@/types';
import { calculateItemTotal, formatCurrency } from '@/utils/helpers';
import { addDays, format } from 'date-fns';

interface InvoiceBuilderProps {
  onSave: (data: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerGst?: string;
    items: InvoiceItem[];
    subTotal: number;
    totalDiscount: number;
    totalGst: number;
    grandTotal: number;
    roundOff: number;
    issueDate: string;
    dueDate: string;
    notes?: string;
    terms?: string;
  }) => void;
  onCancel: () => void;
}

export function InvoiceBuilder({ onSave, onCancel }: InvoiceBuilderProps) {
  const { customers, products, loadCustomers, loadProducts, settings } = useStore();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 15), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState(settings.invoiceNotes || '');
  const [terms, setTerms] = useState(settings.invoiceTerms || '');

  useEffect(() => { loadCustomers(); loadProducts(); }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addItem = (product: Product) => {
    const totals = calculateItemTotal(1, product.price, 0, product.gstRate);
    const newItem: InvoiceItem = {
      id: Date.now().toString() + Math.random(),
      productId: product.id,
      productName: product.name,
      description: product.description,
      quantity: 1,
      unitPrice: product.price,
      gstRate: product.gstRate,
      discount: 0,
      total: totals.subTotal,
      gstAmount: totals.gstAmount,
      finalAmount: totals.finalAmount,
    };
    setItems([...items, newItem]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const newItems = [...items];
    const item = { ...newItems[index], ...updates };
    const totals = calculateItemTotal(item.quantity, item.unitPrice, item.discount, item.gstRate);
    newItems[index] = { ...item, ...totals };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.total - item.total * (1 - item.discount / 100)), 0);
  const totalGst = items.reduce((sum, item) => sum + item.gstAmount, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.finalAmount, 0);
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);

  const handleSave = () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    onSave({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      customerPhone: selectedCustomer.phone,
      customerAddress: selectedCustomer.address,
      customerGst: selectedCustomer.gstNumber,
      items,
      subTotal,
      totalDiscount,
      totalGst,
      grandTotal: finalTotal,
      roundOff,
      issueDate,
      dueDate,
      notes,
      terms,
    });
  };

  return (
    <div className="space-y-6">
      {/* Customer Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer</h3>
        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-primary-50 rounded-lg p-4">
            <div>
              <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-600">{selectedCustomer.email} • {selectedCustomer.phone}</p>
              <p className="text-sm text-gray-500">{selectedCustomer.address}</p>
              {selectedCustomer.gstNumber && (
                <p className="text-sm text-gray-500">GST: {selectedCustomer.gstNumber}</p>
              )}
            </div>
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search and select customer..."
              className="w-full pl-10"
              value={customerSearch}
              onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
              onFocus={() => setShowCustomerDropdown(true)}
            />
            {showCustomerDropdown && customerSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <p className="p-3 text-gray-500 text-sm">No customers found</p>
                ) : (
                  filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => { setSelectedCustomer(customer); setCustomerSearch(''); setShowCustomerDropdown(false); }}
                    >
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email} • {customer.phone}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Issue Date</label>
          <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          <span className="text-sm text-gray-500">{items.length} items</span>
        </div>

        {/* Add Product */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search and add product..."
            className="w-full pl-10"
            value={productSearch}
            onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
            onFocus={() => setShowProductDropdown(true)}
          />
          {showProductDropdown && productSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="p-3 text-gray-500 text-sm">No products found</p>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center justify-between"
                    onClick={() => addItem(product)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <span className="font-semibold text-primary-600">₹{product.price}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Product</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 w-24">Qty</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">Price</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 w-20">Disc%</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">GST</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">Total</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity} 
                        onChange={e => updateItem(index, { quantity: parseFloat(e.target.value) || 1 })}
                        className="w-20 text-center py-1"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input 
                        type="number" 
                        value={item.unitPrice} 
                        onChange={e => updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="w-28 text-right py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={item.discount} 
                        onChange={e => updateItem(index, { discount: parseFloat(e.target.value) || 0 })}
                        className="w-16 text-center py-1"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600">
                      {formatCurrency(item.gstAmount)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900">
                      {formatCurrency(item.finalAmount)}
                    </td>
                    <td className="px-3 py-2">
                      <button 
                        onClick={() => removeItem(index)}
                        className="p-1 hover:bg-red-50 rounded text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Plus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>Search and add products above</p>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="card">
        <div className="space-y-2 max-w-sm ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sub Total:</span>
            <span className="font-medium">{formatCurrency(subTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Discount:</span>
            <span className="font-medium text-red-600">-{formatCurrency(totalDiscount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total GST:</span>
            <span className="font-medium">{formatCurrency(totalGst)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Round Off:</span>
            <span className="font-medium">{formatCurrency(roundOff)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Grand Total:</span>
            <span className="font-bold text-xl text-primary-600">{formatCurrency(finalTotal)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Invoice notes..."
          />
        </div>
        <div className="form-group">
          <label className="form-label">Terms & Conditions</label>
          <textarea 
            value={terms} 
            onChange={e => setTerms(e.target.value)}
            rows={3}
            placeholder="Terms and conditions..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button onClick={onCancel} className="btn-secondary px-8">Cancel</button>
        <button onClick={handleSave} className="btn-primary px-8">
          Create Invoice
        </button>
      </div>
    </div>
  );
}
