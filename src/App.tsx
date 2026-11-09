/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  initStore,
  subscribe,
  getOrders,
  getProducts,
  getClients,
  getIncomes,
  getExpenses,
  getCategories,
  getUsers,
  getConfig,
  getActiveUser,
  setActiveUser,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  createProduct,
  updateProduct,
  deleteProduct,
  createClient,
  updateClient,
  deleteClient,
  createIncome,
  deleteIncome,
  createExpense,
  deleteExpense,
  createCategory,
  deleteCategory,
  createUser,
  deleteUser,
  updateConfig,
  getNextOrderNumber,
} from './lib/storage';
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
} from './types';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { KanbanView } from './components/KanbanView';
import { ProductsView } from './components/ProductsView';
import { ClientsView } from './components/ClientsView';
import { IncomeView } from './components/IncomeView';
import { ExpensesView } from './components/ExpensesView';
import { FinancesView } from './components/FinancesView';
import { ExportView } from './components/ExportView';
import { SettingsView } from './components/SettingsView';
import { OrderModal } from './components/OrderModal';
import { PrintTicketModal } from './components/PrintTicketModal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  // Initialize store on mount
  useEffect(() => {
    initStore();
  }, []);

  // Reactive state
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [config, setConfig] = useState<SystemConfig>(getConfig());
  const [activeUser, setActiveUserState] = useState<UserAccount>(getActiveUser());

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync state helper
  const reloadState = () => {
    setOrders(getOrders());
    setProducts(getProducts());
    setClients(getClients());
    setIncomes(getIncomes());
    setExpenses(getExpenses());
    setCategories(getCategories());
    setUsers(getUsers());
    setConfig(getConfig());
    setActiveUserState(getActiveUser());
  };

  useEffect(() => {
    reloadState();
    const unsubscribe = subscribe(() => {
      reloadState();
    });
    return () => unsubscribe();
  }, []);

  // Title mapping
  const viewTitles: Record<NavigationTab, string> = {
    dashboard: 'Panel Principal · Dashboard',
    orders: 'Gestión de Pedidos',
    kanban: 'Tablero de Producción 3D',
    products: 'Productos & Lista de Precios',
    clients: 'Clientes',
    incomes: 'Ingresos & Señas',
    expenses: 'Gastos & Compras',
    finances: 'Caja & Finanzas',
    export: 'Exportación & Reportes',
    settings: 'Configuración General',
  };

  // Handlers for orders
  const handleOpenNewOrder = () => {
    if (config.accessMode === 'privada' && activeUser.role === 'Consulta') {
      alert('Tu usuario tiene rol de Consulta. No tienes permisos para crear pedidos.');
      return;
    }
    setOrderToEdit(null);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    if (config.accessMode === 'privada' && activeUser.role === 'Consulta') {
      alert('Tu usuario tiene rol de Consulta. No tienes permisos para modificar pedidos.');
      return;
    }
    setOrderToEdit(order);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (orderData: any) => {
    if (orderToEdit) {
      updateOrder(orderToEdit.id, orderData);
    } else {
      createOrder(orderData);
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (config.accessMode === 'privada' && activeUser.role !== 'Administrador') {
      alert('Solo el Administrador tiene permiso para eliminar pedidos permanentemente.');
      return;
    }
    deleteOrder(id);
  };

  const handleUpdateOrderStatus = (id: string, status: OrderStatus, reason?: string) => {
    if (config.accessMode === 'privada' && activeUser.role === 'Consulta') {
      alert('Tu usuario tiene rol de Consulta. No tienes permisos para cambiar estados.');
      return;
    }
    updateOrderStatus(id, status, reason);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900 font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        config={config}
        activeUser={activeUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <Header
          config={config}
          activeUser={activeUser}
          onOpenNewOrder={handleOpenNewOrder}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setCurrentTab('settings')}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          currentViewTitle={viewTitles[currentTab]}
        />

        {/* Viewport content */}
        <main className="flex-1 p-3 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              incomes={incomes}
              expenses={expenses}
              products={products}
              clients={clients}
              config={config}
              onNavigateTab={setCurrentTab}
              onSelectOrder={(ord) => {
                setOrderToEdit(ord);
                setIsOrderModalOpen(true);
              }}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView
              orders={orders}
              config={config}
              onOpenNewOrder={handleOpenNewOrder}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              onPrintTicket={(order) => setOrderToPrint(order)}
              onSwitchToKanban={() => setCurrentTab('kanban')}
            />
          )}

          {currentTab === 'kanban' && (
            <KanbanView
              orders={orders.filter((o) => o.status !== 'Cancelado')}
              config={config}
              onUpdateStatus={handleUpdateOrderStatus}
              onSelectOrder={handleEditOrder}
              onOpenNewOrder={handleOpenNewOrder}
              onSwitchToTable={() => setCurrentTab('orders')}
              onPrintTicket={(order) => setOrderToPrint(order)}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              config={config}
              onCreateProduct={(data) => createProduct(data)}
              onUpdateProduct={(id, updates) => updateProduct(id, updates)}
              onDeleteProduct={(id) => deleteProduct(id)}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              orders={orders}
              config={config}
              onCreateClient={(data) => createClient(data)}
              onUpdateClient={(id, updates) => updateClient(id, updates)}
              onDeleteClient={(id) => deleteClient(id)}
              onSelectOrder={(ord) => {
                setOrderToEdit(ord);
                setIsOrderModalOpen(true);
              }}
            />
          )}

          {currentTab === 'incomes' && (
            <IncomeView
              incomes={incomes}
              orders={orders}
              config={config}
              onCreateIncome={(data) => createIncome(data)}
              onDeleteIncome={(id) => deleteIncome(id)}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              categories={categories}
              config={config}
              onCreateExpense={(data) => createExpense(data)}
              onDeleteExpense={(id) => deleteExpense(id)}
              onCreateCategory={(name, isEquip) => createCategory(name, isEquip)}
              onDeleteCategory={(id) => deleteCategory(id)}
            />
          )}

          {currentTab === 'finances' && (
            <FinancesView
              incomes={incomes}
              expenses={expenses}
              orders={orders}
              config={config}
              onNavigateToExport={() => setCurrentTab('export')}
            />
          )}

          {currentTab === 'export' && (
            <ExportView
              orders={orders}
              incomes={incomes}
              expenses={expenses}
              products={products}
              clients={clients}
              config={config}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              config={config}
              users={users}
              activeUser={activeUser}
              onUpdateConfig={(updates) => updateConfig(updates)}
              onCreateUser={(u) => createUser(u)}
              onDeleteUser={(id) => deleteUser(id)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        orderToEdit={orderToEdit}
        products={products}
        clients={clients}
        config={config}
        nextOrderNumber={getNextOrderNumber()}
      />

      <PrintTicketModal
        order={orderToPrint}
        config={config}
        onClose={() => setOrderToPrint(null)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        activeUser={activeUser}
        onSelectUser={(u) => setActiveUser(u)}
        config={config}
      />
    </div>
  );
}
