'use client';

import { 
  Customer, Product, Invoice, Expense, AppSettings,
  Payment, InvoiceStatus 
} from '@/types';

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
  CUSTOMERS: 'billing_customers',
  PRODUCTS: 'billing_products',
  INVOICES: 'billing_invoices',
  EXPENSES: 'billing_expenses',
  SETTINGS: 'billing_settings',
  INVOICE_COUNTER: 'billing_invoice_counter',
} as const;

// ==================== GENERIC CRUD ====================
function getItems<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItems<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(items));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ==================== CUSTOMERS ====================
export const customerDb = {
  getAll: (): Customer[] => getItems<Customer>(STORAGE_KEYS.CUSTOMERS),

  getById: (id: string): Customer | undefined => {
    return customerDb.getAll().find(c => c.id === id);
  },

  create: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const items = customerDb.getAll();
    items.push(newCustomer);
    setItems(STORAGE_KEYS.CUSTOMERS, items);
    return newCustomer;
  },

  update: (id: string, updates: Partial<Customer>): Customer | null => {
    const items = customerDb.getAll();
    const index = items.findIndex(c => c.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    setItems(STORAGE_KEYS.CUSTOMERS, items);
    return items[index];
  },

  delete: (id: string): boolean => {
    const items = customerDb.getAll().filter(c => c.id !== id);
    setItems(STORAGE_KEYS.CUSTOMERS, items);
    return true;
  },

  search: (query: string): Customer[] => {
    const q = query.toLowerCase();
    return customerDb.getAll().filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  },
};

// ==================== PRODUCTS ====================
export const productDb = {
  getAll: (): Product[] => getItems<Product>(STORAGE_KEYS.PRODUCTS),

  getById: (id: string): Product | undefined => {
    return productDb.getAll().find(p => p.id === id);
  },

  create: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const items = productDb.getAll();
    items.push(newProduct);
    setItems(STORAGE_KEYS.PRODUCTS, items);
    return newProduct;
  },

  update: (id: string, updates: Partial<Product>): Product | null => {
    const items = productDb.getAll();
    const index = items.findIndex(p => p.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    setItems(STORAGE_KEYS.PRODUCTS, items);
    return items[index];
  },

  delete: (id: string): boolean => {
    const items = productDb.getAll().filter(p => p.id !== id);
    setItems(STORAGE_KEYS.PRODUCTS, items);
    return true;
  },

  search: (query: string): Product[] => {
    const q = query.toLowerCase();
    return productDb.getAll().filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  },

  getCategories: (): string[] => {
    const categories = new Set(productDb.getAll().map(p => p.category));
    return Array.from(categories);
  },
};

// ==================== INVOICES ====================
export const invoiceDb = {
  getAll: (): Invoice[] => getItems<Invoice>(STORAGE_KEYS.INVOICES),

  getById: (id: string): Invoice | undefined => {
    return invoiceDb.getAll().find(i => i.id === id);
  },

  getByNumber: (number: string): Invoice | undefined => {
    return invoiceDb.getAll().find(i => i.invoiceNumber === number);
  },

  generateInvoiceNumber: (): string => {
    const counter = parseInt(localStorage.getItem(STORAGE_KEYS.INVOICE_COUNTER) || '0') + 1;
    localStorage.setItem(STORAGE_KEYS.INVOICE_COUNTER, counter.toString());
    const settings = settingsDb.get();
    const prefix = settings.invoicePrefix || 'INV';
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${String(counter).padStart(5, '0')}`;
  },

  create: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'payments' | 'paidAmount' | 'balanceDue'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      invoiceNumber: invoiceDb.generateInvoiceNumber(),
      payments: [],
      paidAmount: 0,
      balanceDue: invoice.grandTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const items = invoiceDb.getAll();
    items.push(newInvoice);
    setItems(STORAGE_KEYS.INVOICES, items);
    return newInvoice;
  },

  update: (id: string, updates: Partial<Invoice>): Invoice | null => {
    const items = invoiceDb.getAll();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    setItems(STORAGE_KEYS.INVOICES, items);
    return items[index];
  },

  updateStatus: (id: string, status: InvoiceStatus): Invoice | null => {
    return invoiceDb.update(id, { status });
  },

  addPayment: (invoiceId: string, payment: Omit<Payment, 'id' | 'createdAt'>): Invoice | null => {
    const invoice = invoiceDb.getById(invoiceId);
    if (!invoice) return null;

    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const updatedPayments = [...invoice.payments, newPayment];
    const paidAmount = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = Math.max(0, invoice.grandTotal - paidAmount);
    const status: InvoiceStatus = balanceDue <= 0 ? 'paid' : 
      new Date(invoice.dueDate) < new Date() ? 'overdue' : 'sent';

    return invoiceDb.update(invoiceId, {
      payments: updatedPayments,
      paidAmount,
      balanceDue,
      status,
    });
  },

  delete: (id: string): boolean => {
    const items = invoiceDb.getAll().filter(i => i.id !== id);
    setItems(STORAGE_KEYS.INVOICES, items);
    return true;
  },

  filter: (filters: { status?: string; customerId?: string; dateFrom?: string; dateTo?: string; search?: string }): Invoice[] => {
    let items = invoiceDb.getAll();

    if (filters.status && filters.status !== 'all') {
      items = items.filter(i => i.status === filters.status);
    }
    if (filters.customerId) {
      items = items.filter(i => i.customerId === filters.customerId);
    }
    if (filters.dateFrom) {
      items = items.filter(i => i.issueDate >= filters.dateFrom);
    }
    if (filters.dateTo) {
      items = items.filter(i => i.issueDate <= filters.dateTo);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(i => 
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};

// ==================== EXPENSES ====================
export const expenseDb = {
  getAll: (): Expense[] => getItems<Expense>(STORAGE_KEYS.EXPENSES),

  getById: (id: string): Expense | undefined => {
    return expenseDb.getAll().find(e => e.id === id);
  },

  create: (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const items = expenseDb.getAll();
    items.push(newExpense);
    setItems(STORAGE_KEYS.EXPENSES, items);
    return newExpense;
  },

  update: (id: string, updates: Partial<Expense>): Expense | null => {
    const items = expenseDb.getAll();
    const index = items.findIndex(e => e.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    setItems(STORAGE_KEYS.EXPENSES, items);
    return items[index];
  },

  delete: (id: string): boolean => {
    const items = expenseDb.getAll().filter(e => e.id !== id);
    setItems(STORAGE_KEYS.EXPENSES, items);
    return true;
  },

  filter: (dateFrom?: string, dateTo?: string, category?: string): Expense[] => {
    let items = expenseDb.getAll();
    if (dateFrom) items = items.filter(e => e.date >= dateFrom);
    if (dateTo) items = items.filter(e => e.date <= dateTo);
    if (category) items = items.filter(e => e.category === category);
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getCategories: (): string[] => {
    const categories = new Set(expenseDb.getAll().map(e => e.category));
    return Array.from(categories);
  },

  getTotalByDateRange: (from: string, to: string): number => {
    return expenseDb.filter(from, to).reduce((sum, e) => sum + e.amount, 0);
  },
};

// ==================== SETTINGS ====================
const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'Your Company Name',
  companyAddress: '123 Business Street, City, State - 123456',
  companyPhone: '+91 98765 43210',
  companyEmail: 'contact@company.com',
  companyGst: 'GST1234567890',
  currency: '₹',
  defaultTaxRate: 18,
  invoicePrefix: 'INV',
  invoiceTerms: 'Payment due within 15 days. Late payments subject to 2% monthly interest.',
  invoiceNotes: 'Thank you for your business!',
  theme: 'light',
};

export const settingsDb = {
  get: (): AppSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },

  save: (settings: Partial<AppSettings>): AppSettings => {
    const current = settingsDb.get();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  reset: (): AppSettings => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  },
};

// ==================== BACKUP & EXPORT ====================
export const dbBackup = {
  export: (): string => {
    const data = {
      customers: customerDb.getAll(),
      products: productDb.getAll(),
      invoices: invoiceDb.getAll(),
      expenses: expenseDb.getAll(),
      settings: settingsDb.get(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  import: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.customers) setItems(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.products) setItems(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.invoices) setItems(STORAGE_KEYS.INVOICES, data.invoices);
      if (data.expenses) setItems(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      return true;
    } catch {
      return false;
    }
  },

  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  getStats: () => {
    return {
      customers: customerDb.getAll().length,
      products: productDb.getAll().length,
      invoices: invoiceDb.getAll().length,
      expenses: expenseDb.getAll().length,
    };
  },
};

export { STORAGE_KEYS };
