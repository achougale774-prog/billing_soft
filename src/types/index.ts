// ==================== CUSTOMER TYPES ====================
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== PRODUCT/SERVICE TYPES ====================
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // piece, kg, hour, etc.
  hsnCode?: string;
  gstRate: number; // GST %
  stock?: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== INVOICE ITEM TYPES ====================
export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  discount: number; // %
  total: number;
  gstAmount: number;
  finalAmount: number;
}

// ==================== INVOICE TYPES ====================
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card';

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  transactionId?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
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
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes?: string;
  terms?: string;
  payments: Payment[];
  paidAmount: number;
  balanceDue: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== EXPENSE TYPES ====================
export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  receiptNo?: string;
  vendor?: string;
  createdAt: string;
}

// ==================== REPORT TYPES ====================
export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalExpenses: number;
  netProfit: number;
  thisMonthRevenue: number;
  thisMonthExpenses: number;
  customerCount: number;
  productCount: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  totalAmount: number;
  invoiceCount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

// ==================== SETTINGS TYPES ====================
export interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGst: string;
  currency: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  invoiceTerms: string;
  invoiceNotes: string;
  theme: 'light' | 'dark';
}

// ==================== FILTER TYPES ====================
export interface InvoiceFilter {
  status?: InvoiceStatus | 'all';
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DateRange {
  from: string;
  to: string;
}
