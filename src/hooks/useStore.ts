'use client';

import { create } from 'zustand';
import { 
  Customer, Product, Invoice, Expense, AppSettings,
  DashboardStats, MonthlyData, TopCustomer, TopProduct 
} from '@/types';
import { 
  customerDb, productDb, invoiceDb, expenseDb, settingsDb, dbBackup 
} from '@/lib/localDb';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';

interface AppState {
  // Data
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  expenses: Expense[];
  settings: AppSettings;

  // Loading states
  isLoading: boolean;

  // Actions - Customers
  loadCustomers: () => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Actions - Products
  loadProducts: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Actions - Invoices
  loadInvoices: () => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'payments' | 'paidAmount' | 'balanceDue'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addPayment: (invoiceId: string, payment: { amount: number; method: string; date: string; notes?: string; transactionId?: string }) => void;

  // Actions - Expenses
  loadExpenses: () => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Actions - Settings
  loadSettings: () => void;
  saveSettings: (settings: Partial<AppSettings>) => void;

  // Computed - Dashboard
  getDashboardStats: () => DashboardStats;
  getMonthlyData: (months?: number) => MonthlyData[];
  getTopCustomers: (limit?: number) => TopCustomer[];
  getTopProducts: (limit?: number) => TopProduct[];

  // Backup
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  clearAllData: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  customers: [],
  products: [],
  invoices: [],
  expenses: [],
  settings: settingsDb.get(),
  isLoading: false,

  // ==================== CUSTOMERS ====================
  loadCustomers: () => {
    if (typeof window !== 'undefined') {
      set({ customers: customerDb.getAll() });
    }
  },

  addCustomer: (customer) => {
    const newCustomer = customerDb.create(customer);
    set({ customers: customerDb.getAll() });
    return newCustomer;
  },

  updateCustomer: (id, updates) => {
    customerDb.update(id, updates);
    set({ customers: customerDb.getAll() });
  },

  deleteCustomer: (id) => {
    customerDb.delete(id);
    set({ customers: customerDb.getAll() });
  },

  // ==================== PRODUCTS ====================
  loadProducts: () => {
    if (typeof window !== 'undefined') {
      set({ products: productDb.getAll() });
    }
  },

  addProduct: (product) => {
    const newProduct = productDb.create(product);
    set({ products: productDb.getAll() });
    return newProduct;
  },

  updateProduct: (id, updates) => {
    productDb.update(id, updates);
    set({ products: productDb.getAll() });
  },

  deleteProduct: (id) => {
    productDb.delete(id);
    set({ products: productDb.getAll() });
  },

  // ==================== INVOICES ====================
  loadInvoices: () => {
    if (typeof window !== 'undefined') {
      set({ invoices: invoiceDb.getAll() });
    }
  },

  addInvoice: (invoice) => {
    const newInvoice = invoiceDb.create(invoice);
    set({ invoices: invoiceDb.getAll() });
    return newInvoice;
  },

  updateInvoice: (id, updates) => {
    invoiceDb.update(id, updates);
    set({ invoices: invoiceDb.getAll() });
  },

  deleteInvoice: (id) => {
    invoiceDb.delete(id);
    set({ invoices: invoiceDb.getAll() });
  },

  addPayment: (invoiceId, payment) => {
    invoiceDb.addPayment(invoiceId, payment);
    set({ invoices: invoiceDb.getAll() });
  },

  // ==================== EXPENSES ====================
  loadExpenses: () => {
    if (typeof window !== 'undefined') {
      set({ expenses: expenseDb.getAll() });
    }
  },

  addExpense: (expense) => {
    const newExpense = expenseDb.create(expense);
    set({ expenses: expenseDb.getAll() });
    return newExpense;
  },

  updateExpense: (id, updates) => {
    expenseDb.update(id, updates);
    set({ expenses: expenseDb.getAll() });
  },

  deleteExpense: (id) => {
    expenseDb.delete(id);
    set({ expenses: expenseDb.getAll() });
  },

  // ==================== SETTINGS ====================
  loadSettings: () => {
    if (typeof window !== 'undefined') {
      set({ settings: settingsDb.get() });
    }
  },

  saveSettings: (settings) => {
    const updated = settingsDb.save(settings);
    set({ settings: updated });
  },

  // ==================== DASHBOARD STATS ====================
  getDashboardStats: () => {
    const { invoices, expenses, customers, products } = get();

    const totalRevenue = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalPending = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.balanceDue, 0);
    const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.balanceDue, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const now = new Date();
    const monthStart = startOfMonth(now).toISOString();
    const monthEnd = endOfMonth(now).toISOString();

    const thisMonthRevenue = invoices
      .filter(i => i.issueDate >= monthStart && i.issueDate <= monthEnd)
      .reduce((sum, i) => sum + i.grandTotal, 0);

    const thisMonthExpenses = expenses
      .filter(e => e.date >= monthStart && e.date <= monthEnd)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalInvoices: invoices.length,
      totalRevenue,
      totalPaid,
      totalPending,
      totalOverdue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      thisMonthRevenue,
      thisMonthExpenses,
      customerCount: customers.length,
      productCount: products.length,
    };
  },

  // ==================== MONTHLY DATA ====================
  getMonthlyData: (months = 12) => {
    const { invoices, expenses } = get();
    const data: MonthlyData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate).toISOString();
      const monthEnd = endOfMonth(monthDate).toISOString();
      const monthLabel = format(monthDate, 'MMM yyyy');

      const revenue = invoices
        .filter(i => i.issueDate >= monthStart && i.issueDate <= monthEnd)
        .reduce((sum, i) => sum + i.grandTotal, 0);

      const monthExpenses = expenses
        .filter(e => e.date >= monthStart && e.date <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0);

      data.push({
        month: monthLabel,
        revenue,
        expenses: monthExpenses,
        profit: revenue - monthExpenses,
      });
    }

    return data;
  },

  // ==================== TOP CUSTOMERS ====================
  getTopCustomers: (limit = 5) => {
    const { invoices } = get();
    const customerMap = new Map<string, { name: string; amount: number; count: number }>();

    invoices.forEach(inv => {
      const existing = customerMap.get(inv.customerId);
      if (existing) {
        existing.amount += inv.grandTotal;
        existing.count += 1;
      } else {
        customerMap.set(inv.customerId, {
          name: inv.customerName,
          amount: inv.grandTotal,
          count: 1,
        });
      }
    });

    return Array.from(customerMap.entries())
      .map(([id, data]) => ({
        customerId: id,
        customerName: data.name,
        totalAmount: data.amount,
        invoiceCount: data.count,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);
  },

  // ==================== TOP PRODUCTS ====================
  getTopProducts: (limit = 5) => {
    const { invoices } = get();
    const productMap = new Map<string, { name: string; qty: number; revenue: number }>();

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.qty += item.quantity;
          existing.revenue += item.finalAmount;
        } else {
          productMap.set(item.productId, {
            name: item.productName,
            qty: item.quantity,
            revenue: item.finalAmount,
          });
        }
      });
    });

    return Array.from(productMap.entries())
      .map(([id, data]) => ({
        productId: id,
        productName: data.name,
        totalQuantity: data.qty,
        totalRevenue: data.revenue,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  },

  // ==================== BACKUP ====================
  exportData: () => dbBackup.export(),

  importData: (jsonData) => {
    const success = dbBackup.import(jsonData);
    if (success) {
      set({
        customers: customerDb.getAll(),
        products: productDb.getAll(),
        invoices: invoiceDb.getAll(),
        expenses: expenseDb.getAll(),
        settings: settingsDb.get(),
      });
    }
    return success;
  },

  clearAllData: () => {
    dbBackup.clearAll();
    set({
      customers: [],
      products: [],
      invoices: [],
      expenses: [],
      settings: settingsDb.get(),
    });
  },
}));
