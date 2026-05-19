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

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'Cash' | 'Online';
  type: 'Sales' | 'Purchases';
}

interface StoreState {
  isLoggedIn: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;

  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (id: string) => void;

  cart: CartItem[];
  addToCart: (item: MenuItem, quantity: number) => void;
  updateCartItemQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
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

      cart: [],
      addToCart: (item, quantity) => set((state) => {
        const existing = state.cart.find((c) => c.menuItem.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((c) => c.id === existing.id ? { ...c, quantity: c.quantity + quantity } : c)
          };
        }
        return { cart: [...state.cart, { id: uuidv4(), menuItem: item, quantity }] };
      }),
      updateCartItemQty: (id, qty) => set((state) => ({
        cart: state.cart.map((c) => c.id === id ? { ...c, quantity: qty } : c)
      })),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((c) => c.id !== id)
      })),
      clearCart: () => set({ cart: [] }),

      transactions: [],
      addTransaction: (tx) => set((state) => ({
        transactions: [{ ...tx, id: uuidv4(), date: new Date().toISOString() }, ...state.transactions]
      })),
    }),
    {
      name: 'rc-chicken65-storage',
    }
  )
);
