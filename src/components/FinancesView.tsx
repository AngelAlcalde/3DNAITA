/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
  Filter,
  DollarSign,
  Download,
} from 'lucide-react';
import { Income, Expense, Order, SystemConfig } from '../types';

interface FinancesViewProps {
  incomes: Income[];
  expenses: Expense[];
  orders: Order[];
  config: SystemConfig;
  onNavigateToExport: () => void;
}

type MovementType =
  | 'Ingreso cobrado'
  | 'Venta acordada pendiente'
  | 'Gasto operativo'
  | 'Inversión equipamiento';

interface ChronologicalMovement {
  id: string;
  date: string;
  concept: string;
  type: MovementType;
  amount: number;
  orderNumber?: string;
  notes?: string;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  incomes,
  expenses,
  orders,
  config,
  onNavigateToExport,
}) => {
  const currency = config.currencySymbol || '$';
  const [filterType, setFilterType] = useState<string>('todos');

  // Core Financial calculations
  const totalIngresado = incomes.reduce((sum, i) => sum + i.amount, 0);

  const totalGastosOperativos = expenses
    .filter((e) => e.expenseType === 'Operativo')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalEquipamiento = expenses
    .filter((e) => e.expenseType === 'Equipamiento')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalGastos = totalGastosOperativos + totalEquipamiento;

  const dineroDisponible = totalIngresado - totalGastos;

  const saldoPendienteCobro = orders
    .filter((o) => o.status !== 'Cancelado')
    .reduce((sum, o) => sum + o.pendingBalance, 0);

  const gananciaOperativa = totalIngresado - totalGastosOperativos;

  // Build Chronological Movements
  const movements: ChronologicalMovement[] = useMemo(() => {
    const list: ChronologicalMovement[] = [];

    // Real incomes
    incomes.forEach((i) => {
      list.push({
        id: `m-inc-${i.id}`,
        date: i.date,
        concept: i.concept,
        type: 'Ingreso cobrado',
        amount: i.amount,
        orderNumber: i.orderNumber,
        notes: i.notes,
      });
    });

    // Expenses
    expenses.forEach((e) => {
      list.push({
        id: `m-exp-${e.id}`,
        date: e.date,
        concept: `${e.categoryName} - ${e.description}`,
        type: e.expenseType === 'Equipamiento' ? 'Inversión equipamiento' : 'Gasto operativo',
        amount: e.amount,
        notes: e.notes,
      });
    });

    // Active orders with pending balances (Venta acordada pendiente)
    orders
      .filter((o) => o.status !== 'Cancelado' && o.pendingBalance > 0)
      .forEach((o) => {
        list.push({
          id: `m-ord-${o.id}`,
          date: o.createdAt.split('T')[0],
          concept: `Saldo por cobrar pedido #${o.orderNumber} (${o.clientName})`,
          type: 'Venta acordada pendiente',
          amount: o.pendingBalance,
          orderNumber: o.orderNumber,
          notes: `Entrega: ${o.estimatedDeliveryDate}`,
        });
      });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [incomes, expenses, orders]);

  const filteredMovements = movements.filter((m) => {
    if (filterType === 'todos') return true;
    return m.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Caja & Finanzas</h2>
          <p className="text-xs text-slate-500">
            Libro de movimientos, dinero disponible en caja y control estricto de cobranzas.
          </p>
        </div>

        <button
          onClick={onNavigateToExport}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
        >
          <Download className="w-4 h-4 text-purple-700" />
          <span>Descargar Balance en Excel</span>
        </button>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Dinero disponible */}
        <div className="p-4 rounded-xl bg-white border-2 border-emerald-300 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Dinero Disponible en Caja
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
            {currency}{dineroDisponible.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-500">
            Cobrado real ({currency}{totalIngresado.toLocaleString('es-AR')}) menos gastos totales
          </span>
        </div>

        {/* Saldo pendiente de cobro */}
        <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Saldo Pendiente de Cobro
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
            {currency}{saldoPendienteCobro.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-500">
            Ventas pactadas pendientes de entrega o cobro final
          </span>
        </div>

        {/* Ganancia Operativa Estimada */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950 to-purple-900 text-white shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-purple-200 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">
              Ganancia Operativa
            </span>
            <TrendingUp className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-yellow-400 font-mono tabular-nums">
            {currency}{gananciaOperativa.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-purple-200">
            Ingresos cobrados menos gastos operativos de insumos
          </span>
        </div>

        {/* Dinero Total Ingresado */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Dinero Ingresado</span>
          <p className="text-xl font-extrabold text-cyan-800 font-mono tabular-nums mt-1">
            +{currency}{totalIngresado.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-400">Total de señas y pagos cobrados en caja</span>
        </div>

        {/* Gastos Operativos */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Gastos Operativos (Filamento/Luz)</span>
          <p className="text-xl font-extrabold text-slate-800 font-mono tabular-nums mt-1">
            -{currency}{totalGastosOperativos.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-400">Costos recurrentes de producción</span>
        </div>

        {/* Reinversión en Maquinaria */}
        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 shadow-xs">
          <span className="text-xs font-bold text-purple-900 block flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-purple-700" /> Reinversión en Maquinaria & Taller
          </span>
          <p className="text-xl font-extrabold text-purple-900 font-mono tabular-nums mt-1">
            {currency}{totalEquipamiento.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-purple-700">Impresoras 3D y mejoras patrimoniales</span>
        </div>
      </div>

      {/* Movement Ledger Filters */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <h3 className="font-bold text-slate-900 text-sm">Historial Cronológico de Movimientos</h3>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 shrink-0">Filtrar por:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
          >
            <option value="todos">Todos los movimientos</option>
            <option value="Ingreso cobrado">Ingresos cobrados</option>
            <option value="Gasto operativo">Gastos operativos</option>
            <option value="Inversión equipamiento">Inversión en maquinaria</option>
            <option value="Venta acordada pendiente">Ventas pendientes de cobro</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Tipo de Movimiento</th>
                <th className="py-3 px-4">Concepto / Detalle</th>
                <th className="py-3 px-4">Pedido</th>
                <th className="py-3 px-4 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No hay movimientos para mostrar.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  let badge = null;
                  let amountColor = 'text-slate-800';
                  let prefix = '';

                  switch (mov.type) {
                    case 'Ingreso cobrado':
                      badge = (
                        <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                          Ingreso Cobrado
                        </span>
                      );
                      amountColor = 'text-cyan-800 font-extrabold';
                      prefix = '+';
                      break;
                    case 'Gasto operativo':
                      badge = (
                        <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          Gasto Operativo
                        </span>
                      );
                      amountColor = 'text-slate-700 font-bold';
                      prefix = '-';
                      break;
                    case 'Inversión equipamiento':
                      badge = (
                        <span className="text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          Compra Equipamiento
                        </span>
                      );
                      amountColor = 'text-purple-900 font-bold';
                      prefix = '-';
                      break;
                    case 'Venta acordada pendiente':
                      badge = (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Saldo Pendiente
                        </span>
                      );
                      amountColor = 'text-amber-600 font-semibold italic';
                      prefix = '⏳ ';
                      break;
                  }

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {mov.date}
                      </td>
                      <td className="py-3 px-4">{badge}</td>
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        <div>{mov.concept}</div>
                        {mov.notes && (
                          <div className="text-[11px] text-slate-400 italic">{mov.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-900 whitespace-nowrap">
                        {mov.orderNumber || '-'}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono tabular-nums ${amountColor}`}>
                        {prefix}{currency}{mov.amount.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
