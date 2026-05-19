import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed';

export interface KitchenOrder {
  id: string;
  tableId: string;
  items: CartItem[];
  status: OrderStatus;
  timestamp: string;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'Cash' | 'Online' | 'Credit';
  type: 'Sales' | 'Purchases';
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface StoreState {
  isLoggedIn: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;

  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (id: string) => void;

  // Table-wise carts
  carts: Record<string, CartItem[]>;
  addToCart: (tableId: string, item: MenuItem, quantity: number) => void;
  updateCartItemQty: (tableId: string, id: string, qty: number) => void;
  removeFromCart: (tableId: string, id: string) => void;
  clearCart: (tableId: string) => void;

  // Kitchen Orders (KOT)
  kitchenOrders: KitchenOrder[];
  sendToKitchen: (tableId: string, items: CartItem[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;
}

const defaultMenu: MenuItem[] = [
  { id: '1', name: '25 GRAM', price: 10.00 },
  { id: '2', name: '75 GRAM', price: 30.00 },
  { id: '3', name: '400 GRAM', price: 200.00 },
  { id: '4', name: '500 GRAM', price: 250.00 },
  { id: '5', name: '50 GRAM', price: 25.00 },
  { id: '6', name: '100 GRAM', price: 50.00 },
  { id: '7', name: '200 GRAM', price: 100.00 },
  { id: '8', name: '300 GRAM', price: 150.00 },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      login: (user, pass) => {
        if (user === 'abhishek' && pass === 'abhishek') {
          set({ isLoggedIn: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isLoggedIn: false }),

      menuItems: defaultMenu,
      addMenuItem: (item) => set((state) => ({ menuItems: [...state.menuItems, { ...item, id: uuidv4() }] })),
      deleteMenuItem: (id) => set((state) => ({ menuItems: state.menuItems.filter((i) => i.id !== id) })),

      carts: {},
      addToCart: (tableId, item, quantity) => set((state) => {
        const tableCart = state.carts[tableId] || [];
        const existing = tableCart.find((c) => c.menuItem.id === item.id);
        
        let newTableCart;
        if (existing) {
          newTableCart = tableCart.map((c) => c.id === existing.id ? { ...c, quantity: c.quantity + quantity } : c);
        } else {
          newTableCart = [...tableCart, { id: uuidv4(), menuItem: item, quantity }];
        }
        
        return { carts: { ...state.carts, [tableId]: newTableCart } };
      }),
      updateCartItemQty: (tableId, id, qty) => set((state) => {
        const tableCart = state.carts[tableId] || [];
        return {
          carts: { ...state.carts, [tableId]: tableCart.map((c) => c.id === id ? { ...c, quantity: qty } : c) }
        };
      }),
      removeFromCart: (tableId, id) => set((state) => {
        const tableCart = state.carts[tableId] || [];
        return {
          carts: { ...state.carts, [tableId]: tableCart.filter((c) => c.id !== id) }
        };
      }),
      clearCart: (tableId) => set((state) => ({
        carts: { ...state.carts, [tableId]: [] }
      })),

      kitchenOrders: [],
      sendToKitchen: (tableId, items) => set((state) => {
        const newOrder: KitchenOrder = {
          id: uuidv4(),
          tableId,
          items,
          status: 'Pending',
          timestamp: new Date().toISOString()
        };
        return {
          kitchenOrders: [...state.kitchenOrders, newOrder],
          carts: { ...state.carts, [tableId]: [] } // Clear cart after sending to kitchen
        };
      }),
      updateOrderStatus: (orderId, status) => set((state) => {
        const order = state.kitchenOrders.find(o => o.id === orderId);
        let newNotifications = state.notifications;
        
        if (order && status === 'Ready') {
          newNotifications = [{
            id: uuidv4(),
            message: `${order.tableId} ची ऑर्डर तयार आहे!`,
            read: false,
            timestamp: new Date().toISOString()
          }, ...state.notifications];
        }
        
        return {
          kitchenOrders: state.kitchenOrders.map(o => o.id === orderId ? { ...o, status } : o),
          notifications: newNotifications
        };
      }),

      notifications: [],
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),

      transactions: [],
      addTransaction: (tx) => set((state) => ({
        transactions: [{ ...tx, id: uuidv4(), date: new Date().toISOString() }, ...state.transactions]
      })),

      expenses: [],
      addExpense: (expense) => set((state) => ({
        expenses: [{ ...expense, id: uuidv4(), date: new Date().toISOString() }, ...state.expenses]
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
      })),
    }),
    {
      name: 'rc-chicken65-storage-v2',
    }
  )
);
