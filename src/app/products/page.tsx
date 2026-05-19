'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Product } from '@/types';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { products, loadProducts, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, unit: 'piece', hsnCode: '', gstRate: 18, stock: 0, category: ''
  });

  useEffect(() => { loadProducts(); }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      toast.success('Product updated successfully');
    } else {
      addProduct(formData);
      toast.success('Product added successfully');
    }
    closeModal();
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        hsnCode: product.hsnCode || '',
        gstRate: product.gstRate,
        stock: product.stock || 0,
        category: product.category
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: 0, unit: 'piece', hsnCode: '', gstRate: 18, stock: 0, category: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: 0, unit: 'piece', hsnCode: '', gstRate: 18, stock: 0, category: '' });
  };

  const handleDelete = (product: Product) => {
    deleteProduct(product.id);
    toast.success('Product deleted');
    setDeleteConfirm(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products & Services</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, category, or description..."
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
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>GST</th>
              <th>Stock</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No products found</p>
                  <p className="text-sm mt-1">Add your first product to get started</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-gray-100 text-gray-700">{product.category}</span>
                  </td>
                  <td className="font-semibold">₹{product.price.toLocaleString('en-IN')}</td>
                  <td>{product.gstRate}%</td>
                  <td>{product.stock || '-'}</td>
                  <td className="no-print">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openModal(product)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(product)}
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Product name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Product description"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Price *</label>
              <input 
                type="number"
                value={formData.price} 
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select 
                value={formData.unit} 
                onChange={e => setFormData({...formData, unit: e.target.value})}
              >
                <option value="piece">Piece</option>
                <option value="kg">KG</option>
                <option value="meter">Meter</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="liter">Liter</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="e.g. Electronics"
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST Rate (%)</label>
              <input 
                type="number"
                value={formData.gstRate} 
                onChange={e => setFormData({...formData, gstRate: parseFloat(e.target.value) || 0})}
                placeholder="18"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">HSN Code</label>
              <input 
                value={formData.hsnCode} 
                onChange={e => setFormData({...formData, hsnCode: e.target.value})}
                placeholder="HSN code"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock</label>
              <input 
                type="number"
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              {editingProduct ? 'Update' : 'Add'} Product
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
