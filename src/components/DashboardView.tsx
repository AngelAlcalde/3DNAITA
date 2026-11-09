/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  Package,
  Clock,
  Printer,
  CheckCircle2,
  Truck,
  AlertTriangle,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  UserX,
  CreditCard,
} from 'lucide-react';
import { Order, Income, Expense, Product, Client, SystemConfig } from '../types';

interface DashboardViewProps {
  orders: Order[];
  incomes: Income[];
  expenses: Expense[];
  products: Product[];
  clients: Client[];
  config: SystemConfig;
  onNavigateTab: (tab: any) => void;
  onSelectOrder: (order: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  incomes,
  expenses,
  products,
  clients,
  config,
  onNavigateTab,
  onSelectOrder,
}) => {
  const currency = config.currencySymbol || '$';
  const todayStr = new Date().toISOString().split('T')[0];

  // ================= CALCULATIONS =================
  const activeOrders = orders.filter((o) => o.status !== 'Cancelado');

  // Status counts
  const countRecibido = orders.filter((o) => o.status === 'Recibido').length;
  const countPendiente = orders.filter(
    (o) => o.status === 'Pendiente de confirmación' || o.status === 'Pendiente de producción'
  ).length;
  const countProduccion = orders.filter((o) => o.status === 'En producción').length;
  const countTerminado = orders.filter(
    (o) => o.status === 'Terminado' || o.status === 'Listo para retirar'
  ).length;
  const countEntregado = orders.filter((o) => o.status === 'Entregado').length;

  // Monthly financials (current year-month)
  const currentMonthPrefix = todayStr.substring(0, 7);
  const monthlyIncomes = incomes.filter((i) => i.date.startsWith(currentMonthPrefix));
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));

  const totalMonthlyIncome = monthlyIncomes.reduce((acc, i) => acc + i.amount, 0);
  const totalMonthlyExpense = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalMonthlyOperational = monthlyExpenses
    .filter((e) => e.expenseType === 'Operativo')
    .reduce((acc, e) => acc + e.amount, 0);

  // Overall financial position
  const totalAllIncomes = incomes.reduce((acc, i) => acc + i.amount, 0);
  const totalAllExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const dineroDisponible = totalAllIncomes - totalAllExpenses;
  const saldoPorCobrar = activeOrders.reduce((acc, o) => acc + o.pendingBalance, 0);
  const gananciaEstimada = totalMonthlyIncome - totalMonthlyOperational;

  // ================= ALERTS =================
  // 1. Pedidos atrasados: fecha entrega < hoy y no entregado ni cancelado
  const delayedOrders = activeOrders.filter(
    (o) => o.status !== 'Entregado' && o.estimatedDeliveryDate < todayStr
  );

  // 2. Entregas próximas: dentro de los próximos N días
  const upcomingThreshold = new Date();
  upcomingThreshold.setDate(upcomingThreshold.getDate() + (config.alertDaysThreshold || 3));
  const upcomingThresholdStr = upcomingThreshold.toISOString().split('T')[0];
  const upcomingOrders = activeOrders.filter(
    (o) =>
      o.status !== 'Entregado' &&
      o.estimatedDeliveryDate >= todayStr &&
      o.estimatedDeliveryDate <= upcomingThresholdStr
  );

  // 3. Pedidos sin seña recibida
  const ordersWithoutDeposit = activeOrders.filter(
    (o) => o.deposit === 0 && o.status !== 'Entregado'
  );

  // 4. Clientes con saldo pendiente
  const clientsWithDebt = clients.filter((c) => c.pendingBalance > 0);

  // Top products sales count
  const productSalesMap = new Map<string, number>();
  activeOrders.forEach((o) => {
    const key = o.productName;
    productSalesMap.set(key, (productSalesMap.get(key) || 0) + o.quantity);
  });
  const topProducts = Array.from(productSalesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Workshop Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-purple-900/20 bg-slate-900 text-white min-h-[140px] flex items-center">
        <img
          src="/src/assets/images/workshop_3dna_farm_1794182190247.jpg"
          alt="Taller de Impresión 3DNA"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/95 via-purple-900/90 to-transparent" />
        <div className="relative z-10 px-6 py-5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-yellow-400 text-purple-950 text-xs font-bold uppercase tracking-wider mb-2">
            Laboratorio 3D Activo
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white text-balance">
            Panel de Control · 3DNA {config.slogan ? `(${config.slogan})` : ''}
          </h2>
          <p className="text-sm text-purple-200 mt-1">
            Gestiona la producción, controla las señas recibidas y monitorea la rentabilidad de las impresoras en tiempo real.
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Disponible en Caja */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Disponible en Caja</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {currency}{dineroDisponible.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Cobrado menos gastos</span>
        </div>

        {/* Saldo Pendiente por Cobrar */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pendiente de Cobro</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-amber-600 font-mono tabular-nums">
            {currency}{saldoPorCobrar.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">En pedidos activos</span>
        </div>

        {/* Ingresos del Mes */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Ingresos del Mes</span>
            <ArrowDownLeft className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-cyan-700 font-mono tabular-nums">
            {currency}{totalMonthlyIncome.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">{monthlyIncomes.length} cobros registrados</span>
        </div>

        {/* Gastos del Mes */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Gastos del Mes</span>
            <ArrowUpRight className="w-4 h-4 text-fuchsia-600" />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-slate-800 font-mono tabular-nums">
            {currency}{totalMonthlyExpense.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Operativos + Equipos</span>
        </div>

        {/* Ganancia Estimada */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-purple-200 mb-2">
            <span className="text-xs font-semibold">Ganancia Operativa</span>
            <TrendingUp className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-yellow-400 font-mono tabular-nums">
            {currency}{gananciaEstimada.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-purple-200">Ingreso - Gastos Op.</span>
        </div>
      </div>

      {/* Production Order Status Bar */}
      <div className="p-4 md:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Estado de la Producción</h3>
            <p className="text-xs text-slate-500">Distribución de los pedidos activos en el taller</p>
          </div>
          <button
            onClick={() => onNavigateTab('kanban')}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            Ver Tablero Kanban <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Recibidos */}
          <div
            onClick={() => onNavigateTab('orders')}
            className="cursor-pointer p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-xs font-medium">Recibidos</span>
              <Package className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{countRecibido}</p>
          </div>

          {/* Pendientes */}
          <div
            onClick={() => onNavigateTab('orders')}
            className="cursor-pointer p-3 rounded-lg bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 transition-colors"
          >
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-xs font-medium">Pendientes</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-amber-800 font-mono tabular-nums">{countPendiente}</p>
          </div>

          {/* En producción */}
          <div
            onClick={() => onNavigateTab('kanban')}
            className="cursor-pointer p-3 rounded-lg bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200 transition-colors"
          >
            <div className="flex items-center justify-between text-purple-800 mb-1">
              <span className="text-xs font-semibold">En Producción</span>
              <Printer className="w-4 h-4 text-purple-600 animate-pulse" />
            </div>
            <p className="text-2xl font-extrabold text-purple-900 font-mono tabular-nums">{countProduccion}</p>
          </div>

          {/* Terminados / Listos */}
          <div
            onClick={() => onNavigateTab('orders')}
            className="cursor-pointer p-3 rounded-lg bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-200 transition-colors"
          >
            <div className="flex items-center justify-between text-cyan-800 mb-1">
              <span className="text-xs font-medium">Listos para Retirar</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-extrabold text-cyan-800 font-mono tabular-nums">{countTerminado}</p>
          </div>

          {/* Entregados */}
          <div
            onClick={() => onNavigateTab('orders')}
            className="cursor-pointer p-3 rounded-lg bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 transition-colors col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-xs font-medium">Entregados</span>
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-800 font-mono tabular-nums">{countEntregado}</p>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Atrasados */}
        <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Pedidos Atrasados ({delayedOrders.length})</span>
          </div>
          {delayedOrders.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay pedidos atrasados. ¡Excelente!</p>
          ) : (
            <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {delayedOrders.map((o) => (
                <li
                  key={o.id}
                  onClick={() => onSelectOrder(o)}
                  className="cursor-pointer text-xs p-2 rounded bg-rose-50 hover:bg-rose-100 flex items-center justify-between"
                >
                  <span className="font-semibold text-rose-950 truncate max-w-[140px]">{o.clientName}</span>
                  <span className="text-[11px] font-mono text-rose-700">{o.orderNumber}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Entregas Próximas */}
        <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Entregas Próximas ({upcomingOrders.length})</span>
          </div>
          {upcomingOrders.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay entregas pendientes en los próximos días.</p>
          ) : (
            <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {upcomingOrders.map((o) => (
                <li
                  key={o.id}
                  onClick={() => onSelectOrder(o)}
                  className="cursor-pointer text-xs p-2 rounded bg-amber-50 hover:bg-amber-100 flex items-center justify-between"
                >
                  <span className="font-semibold text-amber-950 truncate max-w-[130px]">{o.clientName}</span>
                  <span className="text-[10px] text-amber-800 font-medium">{o.estimatedDeliveryDate}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sin Seña */}
        <div className="p-4 rounded-xl bg-white border border-purple-200 shadow-xs">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-2">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span>Sin Seña Recibida ({ordersWithoutDeposit.length})</span>
          </div>
          {ordersWithoutDeposit.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Todos los pedidos tienen seña registrada.</p>
          ) : (
            <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {ordersWithoutDeposit.map((o) => (
                <li
                  key={o.id}
                  onClick={() => onSelectOrder(o)}
                  className="cursor-pointer text-xs p-2 rounded bg-purple-50 hover:bg-purple-100 flex items-center justify-between"
                >
                  <span className="font-semibold text-purple-950 truncate max-w-[130px]">{o.clientName}</span>
                  <span className="text-[11px] font-mono text-purple-700 font-bold">{currency}{o.totalAgreed}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Clientes con Saldo */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
            <UserX className="w-4 h-4 text-slate-600" />
            <span>Saldos Pendientes ({clientsWithDebt.length})</span>
          </div>
          {clientsWithDebt.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay clientes con saldos pendientes.</p>
          ) : (
            <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {clientsWithDebt.map((c) => (
                <li
                  key={c.id}
                  onClick={() => onNavigateTab('clients')}
                  className="cursor-pointer text-xs p-2 rounded bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-900 truncate max-w-[130px]">{c.name}</span>
                  <span className="text-[11px] font-mono text-amber-700 font-bold">
                    {currency}{c.pendingBalance.toLocaleString('es-AR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Visual Analytics & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ingresos vs Gastos</h3>
              <p className="text-xs text-slate-500">Comparativa financiera del mes actual</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-cyan-500" /> Ingresos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-fuchsia-500" /> Gastos
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Ingresos Cobrados ({currency}{totalMonthlyIncome.toLocaleString('es-AR')})</span>
                <span className="text-cyan-700">100%</span>
              </div>
              <div className="w-full h-7 bg-slate-100 rounded-md overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-md transition-all duration-500 flex items-center px-3 text-xs font-bold text-white"
                  style={{ width: `${Math.min(100, Math.max(10, (totalMonthlyIncome / Math.max(totalMonthlyIncome, totalMonthlyExpense, 1)) * 100))}%` }}
                >
                  {currency}{totalMonthlyIncome.toLocaleString('es-AR')}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Gastos Totales ({currency}{totalMonthlyExpense.toLocaleString('es-AR')})</span>
                <span className="text-fuchsia-700">
                  {totalMonthlyIncome > 0
                    ? `${((totalMonthlyExpense / totalMonthlyIncome) * 100).toFixed(1)}% de ingresos`
                    : ''}
                </span>
              </div>
              <div className="w-full h-7 bg-slate-100 rounded-md overflow-hidden">
                <div
                  className="h-full bg-fuchsia-500 rounded-md transition-all duration-500 flex items-center px-3 text-xs font-bold text-white"
                  style={{ width: `${Math.min(100, Math.max(10, (totalMonthlyExpense / Math.max(totalMonthlyIncome, totalMonthlyExpense, 1)) * 100))}%` }}
                >
                  {currency}{totalMonthlyExpense.toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Calculado automáticamente a partir de los ingresos y compras registradas.</span>
            <button
              onClick={() => onNavigateTab('finances')}
              className="font-bold text-purple-700 hover:text-purple-900"
            >
              Ver Finanzas Completas &rarr;
            </button>
          </div>
        </div>

        {/* Top Selling 3D Products */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Productos Más Vendidos</h3>
              <p className="text-xs text-slate-500">Unidades solicitadas en pedidos</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900"
            >
              Catálogo
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay productos registrados en pedidos aún.</p>
            ) : (
              topProducts.map(([productName, qty], index) => (
                <div key={productName} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate">{productName}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-mono tabular-nums px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                    {qty} u.
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
