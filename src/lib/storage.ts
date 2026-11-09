/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Order,
  Product,
  Client,
  Income,
  Expense,
  ExpenseCategory,
  UserAccount,
  SystemConfig,
  OrderStatus,
} from '../types';
import {
  initialOrders,
  initialProducts,
  initialClients,
  initialIncomes,
  initialExpenses,
  initialCategories,
  initialUsers,
  initialConfig,
} from './mockData';
import { getSupabase, getSupabaseConfig } from './supabase';

// Channel for instant multi-tab & multi-window synchronization
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('3dna_realtime_sync')
  : null;

// Store keys
const STORAGE_KEYS = {
  ORDERS: '3dna_orders',
  PRODUCTS: '3dna_products',
  CLIENTS: '3dna_clients',
  INCOMES: '3dna_incomes',
  EXPENSES: '3dna_expenses',
  CATEGORIES: '3dna_categories',
  USERS: '3dna_users',
  CONFIG: '3dna_config',
  ACTIVE_USER: '3dna_active_user',
};

// Listeners
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners(actionType?: string, payload?: unknown) {
  listeners.forEach((listener) => listener());
  if (syncChannel && actionType) {
    syncChannel.postMessage({ type: actionType, payload, timestamp: Date.now() });
  }
}

// Attach listener to broadcast channel
if (syncChannel) {
  syncChannel.onmessage = (event) => {
    // Another tab sent an update, notify all components
    listeners.forEach((listener) => listener());
  };
}

// Helper to get from local fallback store
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key}`, e);
  }
}

// Initialize seed data if empty
export function initStore(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setLocal(STORAGE_KEYS.ORDERS, initialOrders);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setLocal(STORAGE_KEYS.PRODUCTS, initialProducts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    setLocal(STORAGE_KEYS.CLIENTS, initialClients);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INCOMES)) {
    setLocal(STORAGE_KEYS.INCOMES, initialIncomes);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
    setLocal(STORAGE_KEYS.EXPENSES, initialExpenses);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    setLocal(STORAGE_KEYS.CATEGORIES, initialCategories);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setLocal(STORAGE_KEYS.USERS, initialUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    setLocal(STORAGE_KEYS.CONFIG, initialConfig);
  }
}

// Subscribe to store updates
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// =================== GETTERS ===================

export function getOrders(): Order[] {
  return getLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
}

export function getProducts(): Product[] {
  return getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
}

export function getClients(): Client[] {
  return getLocal<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
}

export function getIncomes(): Income[] {
  return getLocal<Income[]>(STORAGE_KEYS.INCOMES, initialIncomes);
}

export function getExpenses(): Expense[] {
  return getLocal<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
}

export function getCategories(): ExpenseCategory[] {
  return getLocal<ExpenseCategory[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
}

export function getUsers(): UserAccount[] {
  return getLocal<UserAccount[]>(STORAGE_KEYS.USERS, initialUsers);
}

export function getConfig(): SystemConfig {
  return getLocal<SystemConfig>(STORAGE_KEYS.CONFIG, initialConfig);
}

export function getActiveUser(): UserAccount {
  const users = getUsers();
  const savedActive = getLocal<UserAccount | null>(STORAGE_KEYS.ACTIVE_USER, null);
  if (savedActive && users.some((u) => u.id === savedActive.id)) {
    return savedActive;
  }
  return users[0]; // Admin by default
}

export function setActiveUser(user: UserAccount): void {
  setLocal(STORAGE_KEYS.ACTIVE_USER, user);
  notifyListeners('USER_CHANGED', user);
}

// =================== ORDERS ACTIONS ===================

export function getNextOrderNumber(): string {
  const orders = getOrders();
  let maxNum = 100;
  orders.forEach((o) => {
    const numPart = parseInt(o.orderNumber.replace(/\D/g, ''), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  });
  return `PED-${maxNum + 1}`;
}

export function createOrder(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'pendingBalance' | 'totalAgreed'>
): Order {
  const orders = getOrders();
  const orderNumber = getNextOrderNumber();
  const totalAgreed = orderData.agreedPrice * orderData.quantity;
  const pendingBalance = Math.max(0, totalAgreed - (orderData.deposit || 0));

  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    totalAgreed,
    deposit: orderData.deposit || 0,
    pendingBalance,
  };

  const updatedOrders = [newOrder, ...orders];
  setLocal(STORAGE_KEYS.ORDERS, updatedOrders);

  // If a deposit was received, register an income entry automatically!
  if (newOrder.deposit > 0) {
    createIncome({
      date: new Date().toISOString().split('T')[0],
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      clientName: newOrder.clientName,
      concept: `Seña inicial pedido #${newOrder.orderNumber} (${newOrder.productName})`,
      amount: newOrder.deposit,
      paymentMethod: 'Transferencia / Mercado Pago',
      notes: 'Registrado automáticamente al crear el pedido.',
    }, false); // don't double update pending balance
  }

  // Update or create client
  updateClientSummary(newOrder.clientName, newOrder.clientPhone);

  notifyListeners('ORDER_CREATED', newOrder);

  // Also sync to Supabase if connected
  syncToSupabase('pedidos', 'INSERT', newOrder);

  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const current = orders[index];
  const agreedPrice = updates.agreedPrice !== undefined ? updates.agreedPrice : current.agreedPrice;
  const quantity = updates.quantity !== undefined ? updates.quantity : current.quantity;
  const deposit = updates.deposit !== undefined ? updates.deposit : current.deposit;
  const totalAgreed = agreedPrice * quantity;
  const pendingBalance = Math.max(0, totalAgreed - deposit);

  const updated: Order = {
    ...current,
    ...updates,
    agreedPrice,
    quantity,
    totalAgreed,
    deposit,
    pendingBalance,
  };

  orders[index] = updated;
  setLocal(STORAGE_KEYS.ORDERS, orders);

  updateClientSummary(updated.clientName, updated.clientPhone);
  notifyListeners('ORDER_UPDATED', updated);
  syncToSupabase('pedidos', 'UPDATE', updated);

  return updated;
}

export function updateOrderStatus(id: string, status: OrderStatus, cancellationReason?: string): boolean {
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return false;

  const updates: Partial<Order> = { status };
  if (status === 'Cancelado') {
    updates.cancelledAt = new Date().toISOString();
    if (cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }
  }

  updateOrder(id, updates);
  return true;
}

export function deleteOrder(id: string): boolean {
  const orders = getOrders();
  const orderToDelete = orders.find((o) => o.id === id);
  if (!orderToDelete) return false;

  const filtered = orders.filter((o) => o.id !== id);
  setLocal(STORAGE_KEYS.ORDERS, filtered);

  updateClientSummary(orderToDelete.clientName, orderToDelete.clientPhone);
  notifyListeners('ORDER_DELETED', { id });
  syncToSupabase('pedidos', 'DELETE', { id });

  return true;
}

// =================== PRODUCTS ACTIONS ===================

export function createProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'retailMarginPercent' | 'wholesaleMarginPercent'>
): Product {
  const products = getProducts();
  const retailMarginPercent = productData.manufacturingCost > 0
    ? ((productData.retailPrice - productData.manufacturingCost) / productData.manufacturingCost) * 100
    : 100;
  const wholesaleMarginPercent = productData.manufacturingCost > 0
    ? ((productData.wholesalePrice - productData.manufacturingCost) / productData.manufacturingCost) * 100
    : 100;

  const newProduct: Product = {
    ...productData,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
    retailMarginPercent: Number(retailMarginPercent.toFixed(2)),
    wholesaleMarginPercent: Number(wholesaleMarginPercent.toFixed(2)),
  };

  const updated = [newProduct, ...products];
  setLocal(STORAGE_KEYS.PRODUCTS, updated);
  notifyListeners('PRODUCT_CREATED', newProduct);
  syncToSupabase('productos', 'INSERT', newProduct);

  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = products[index];
  const manufacturingCost = updates.manufacturingCost !== undefined ? updates.manufacturingCost : current.manufacturingCost;
  const retailPrice = updates.retailPrice !== undefined ? updates.retailPrice : current.retailPrice;
  const wholesalePrice = updates.wholesalePrice !== undefined ? updates.wholesalePrice : current.wholesalePrice;

  const retailMarginPercent = manufacturingCost > 0
    ? ((retailPrice - manufacturingCost) / manufacturingCost) * 100
    : 100;
  const wholesaleMarginPercent = manufacturingCost > 0
    ? ((wholesalePrice - manufacturingCost) / manufacturingCost) * 100
    : 100;

  const updated: Product = {
    ...current,
    ...updates,
    manufacturingCost,
    retailPrice,
    wholesalePrice,
    retailMarginPercent: Number(retailMarginPercent.toFixed(2)),
    wholesaleMarginPercent: Number(wholesaleMarginPercent.toFixed(2)),
  };

  products[index] = updated;
  setLocal(STORAGE_KEYS.PRODUCTS, products);
  notifyListeners('PRODUCT_UPDATED', updated);
  syncToSupabase('productos', 'UPDATE', updated);

  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PRODUCTS, filtered);
  notifyListeners('PRODUCT_DELETED', { id });
  syncToSupabase('productos', 'DELETE', { id });
  return true;
}

// =================== CLIENTS ACTIONS ===================

export function updateClientSummary(clientName: string, clientPhone?: string): void {
  const clients = getClients();
  const orders = getOrders();
  const clientOrders = orders.filter((o) => o.clientName.trim().toLowerCase() === clientName.trim().toLowerCase());

  const totalOrders = clientOrders.length;
  const totalSpent = clientOrders
    .filter((o) => o.status !== 'Cancelado')
    .reduce((sum, o) => sum + o.totalAgreed, 0);
  const pendingBalance = clientOrders
    .filter((o) => o.status !== 'Cancelado')
    .reduce((sum, o) => sum + o.pendingBalance, 0);

  const existingIndex = clients.findIndex(
    (c) => c.name.trim().toLowerCase() === clientName.trim().toLowerCase()
  );

  if (existingIndex >= 0) {
    clients[existingIndex] = {
      ...clients[existingIndex],
      phone: clientPhone || clients[existingIndex].phone,
      totalOrders,
      totalSpent,
      pendingBalance,
    };
  } else if (clientName.trim()) {
    clients.push({
      id: `cli-${Date.now()}`,
      name: clientName.trim(),
      phone: clientPhone || '',
      createdAt: new Date().toISOString(),
      totalOrders,
      totalSpent,
      pendingBalance,
    });
  }

  setLocal(STORAGE_KEYS.CLIENTS, clients);
}

export function createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'pendingBalance'>): Client {
  const clients = getClients();
  const newClient: Client = {
    ...clientData,
    id: `cli-${Date.now()}`,
    createdAt: new Date().toISOString(),
    totalOrders: 0,
    totalSpent: 0,
    pendingBalance: 0,
  };
  const updated = [newClient, ...clients];
  setLocal(STORAGE_KEYS.CLIENTS, updated);
  notifyListeners('CLIENT_CREATED', newClient);
  syncToSupabase('clientes', 'INSERT', newClient);
  return newClient;
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const clients = getClients();
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updated = { ...clients[index], ...updates };
  clients[index] = updated;
  setLocal(STORAGE_KEYS.CLIENTS, clients);
  notifyListeners('CLIENT_UPDATED', updated);
  syncToSupabase('clientes', 'UPDATE', updated);
  return updated;
}

export function deleteClient(id: string): boolean {
  const clients = getClients();
  const filtered = clients.filter((c) => c.id !== id);
  setLocal(STORAGE_KEYS.CLIENTS, filtered);
  notifyListeners('CLIENT_DELETED', { id });
  syncToSupabase('clientes', 'DELETE', { id });
  return true;
}

// =================== INCOMES ACTIONS ===================

export function createIncome(
  incomeData: Omit<Income, 'id' | 'createdAt'>,
  updateOrderBalance = true
): Income {
  const incomes = getIncomes();
  const newIncome: Income = {
    ...incomeData,
    id: `inc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const updatedIncomes = [newIncome, ...incomes];
  setLocal(STORAGE_KEYS.INCOMES, updatedIncomes);

  // If linked to an order, automatically update order's deposit and pending balance
  if (updateOrderBalance && incomeData.orderId) {
    const orders = getOrders();
    const orderIndex = orders.findIndex((o) => o.id === incomeData.orderId);
    if (orderIndex >= 0) {
      const order = orders[orderIndex];
      const newDeposit = order.deposit + incomeData.amount;
      const newPendingBalance = Math.max(0, order.totalAgreed - newDeposit);
      orders[orderIndex] = {
        ...order,
        deposit: newDeposit,
        pendingBalance: newPendingBalance,
      };
      setLocal(STORAGE_KEYS.ORDERS, orders);
      updateClientSummary(order.clientName, order.clientPhone);
    }
  }

  notifyListeners('INCOME_CREATED', newIncome);
  syncToSupabase('ingresos', 'INSERT', newIncome);

  return newIncome;
}

export function deleteIncome(id: string): boolean {
  const incomes = getIncomes();
  const filtered = incomes.filter((i) => i.id !== id);
  setLocal(STORAGE_KEYS.INCOMES, filtered);
  notifyListeners('INCOME_DELETED', { id });
  syncToSupabase('ingresos', 'DELETE', { id });
  return true;
}

// =================== EXPENSES ACTIONS ===================

export function createExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expenseData,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newExpense, ...expenses];
  setLocal(STORAGE_KEYS.EXPENSES, updated);
  notifyListeners('EXPENSE_CREATED', newExpense);
  syncToSupabase('gastos', 'INSERT', newExpense);

  return newExpense;
}

export function deleteExpense(id: string): boolean {
  const expenses = getExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  setLocal(STORAGE_KEYS.EXPENSES, filtered);
  notifyListeners('EXPENSE_DELETED', { id });
  syncToSupabase('gastos', 'DELETE', { id });
  return true;
}

// =================== CATEGORIES ACTIONS ===================

export function createCategory(name: string, isEquipment: boolean): ExpenseCategory {
  const categories = getCategories();
  const newCat: ExpenseCategory = {
    id: `cat-${Date.now()}`,
    name,
    isEquipment,
  };
  const updated = [...categories, newCat];
  setLocal(STORAGE_KEYS.CATEGORIES, updated);
  notifyListeners('CATEGORY_CREATED', newCat);
  syncToSupabase('categorias_gastos', 'INSERT', newCat);
  return newCat;
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter((c) => c.id !== id);
  setLocal(STORAGE_KEYS.CATEGORIES, filtered);
  notifyListeners('CATEGORY_DELETED', { id });
  syncToSupabase('categorias_gastos', 'DELETE', { id });
  return true;
}

// =================== USERS ACTIONS ===================

export function createUser(userData: Omit<UserAccount, 'id'>): UserAccount {
  const users = getUsers();
  const newUser: UserAccount = {
    ...userData,
    id: `usr-${Date.now()}`,
  };
  const updated = [...users, newUser];
  setLocal(STORAGE_KEYS.USERS, updated);
  notifyListeners('USER_CREATED', newUser);
  syncToSupabase('usuarios', 'INSERT', newUser);
  return newUser;
}

export function updateUser(id: string, updates: Partial<UserAccount>): UserAccount | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const updated = { ...users[index], ...updates };
  users[index] = updated;
  setLocal(STORAGE_KEYS.USERS, users);
  notifyListeners('USER_UPDATED', updated);
  syncToSupabase('usuarios', 'UPDATE', updated);
  return updated;
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  if (users.length <= 1) return false; // Prevent deleting last user
  const filtered = users.filter((u) => u.id !== id);
  setLocal(STORAGE_KEYS.USERS, filtered);
  notifyListeners('USER_DELETED', { id });
  syncToSupabase('usuarios', 'DELETE', { id });
  return true;
}

// =================== CONFIG ACTIONS ===================

export function updateConfig(updates: Partial<SystemConfig>): SystemConfig {
  const config = getConfig();
  const updated = { ...config, ...updates };
  setLocal(STORAGE_KEYS.CONFIG, updated);

  if (updates.supabaseUrl !== undefined || updates.supabaseAnonKey !== undefined) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('3dna_supabase_override', JSON.stringify({
        url: updated.supabaseUrl,
        anonKey: updated.supabaseAnonKey,
      }));
    }
  }

  notifyListeners('CONFIG_UPDATED', updated);
  return updated;
}

// =================== BACKUP & RESTORE ===================

export function exportBackupJSON(): string {
  const data = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    system: '3DNA - Sistema de Gestión de Impresión 3D',
    orders: getOrders(),
    products: getProducts(),
    clients: getClients(),
    incomes: getIncomes(),
    expenses: getExpenses(),
    categories: getCategories(),
    config: getConfig(),
    users: getUsers(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.orders || !data.products) {
      return { success: false, message: 'El archivo de respaldo no tiene el formato esperado de 3DNA.' };
    }

    if (Array.isArray(data.orders)) setLocal(STORAGE_KEYS.ORDERS, data.orders);
    if (Array.isArray(data.products)) setLocal(STORAGE_KEYS.PRODUCTS, data.products);
    if (Array.isArray(data.clients)) setLocal(STORAGE_KEYS.CLIENTS, data.clients);
    if (Array.isArray(data.incomes)) setLocal(STORAGE_KEYS.INCOMES, data.incomes);
    if (Array.isArray(data.expenses)) setLocal(STORAGE_KEYS.EXPENSES, data.expenses);
    if (Array.isArray(data.categories)) setLocal(STORAGE_KEYS.CATEGORIES, data.categories);
    if (Array.isArray(data.users)) setLocal(STORAGE_KEYS.USERS, data.users);
    if (data.config) setLocal(STORAGE_KEYS.CONFIG, { ...initialConfig, ...data.config });

    notifyListeners('BACKUP_RESTORED');
    return { success: true, message: 'Copia de seguridad restaurada exitosamente.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Error al procesar el archivo: ${errorMsg}` };
  }
}

export function resetToSeedData(): void {
  setLocal(STORAGE_KEYS.ORDERS, initialOrders);
  setLocal(STORAGE_KEYS.PRODUCTS, initialProducts);
  setLocal(STORAGE_KEYS.CLIENTS, initialClients);
  setLocal(STORAGE_KEYS.INCOMES, initialIncomes);
  setLocal(STORAGE_KEYS.EXPENSES, initialExpenses);
  setLocal(STORAGE_KEYS.CATEGORIES, initialCategories);
  setLocal(STORAGE_KEYS.CONFIG, initialConfig);
  setLocal(STORAGE_KEYS.USERS, initialUsers);
  notifyListeners('RESET_TO_SEED');
}

// =================== SUPABASE BACKGROUND SYNC ===================

async function syncToSupabase(table: string, action: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    if (action === 'INSERT') {
      await supabase.from(table).insert(payload);
    } else if (action === 'UPDATE') {
      await supabase.from(table).update(payload).eq('id', payload.id);
    } else if (action === 'DELETE') {
      await supabase.from(table).delete().eq('id', payload.id);
    }
  } catch (err) {
    console.warn(`Supabase sync background error on table ${table}:`, err);
  }
}
