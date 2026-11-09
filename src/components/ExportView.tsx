/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Printer,
  FileText,
  Boxes,
  Users,
  CreditCard,
  Receipt,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { Order, Income, Expense, Product, Client, SystemConfig } from '../types';
import {
  exportOrders,
  exportIncomes,
  exportExpenses,
  exportProducts,
  exportClients,
  exportFinancialBalance,
  filterByPeriod,
} from '../lib/exportUtils';

interface ExportViewProps {
  orders: Order[];
  incomes: Income[];
  expenses: Expense[];
  products: Product[];
  clients: Client[];
  config: SystemConfig;
}

export const ExportView: React.FC<ExportViewProps> = ({
  orders,
  incomes,
  expenses,
  products,
  clients,
  config,
}) => {
  const currency = config.currencySymbol || '$';
  const [period, setPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // Filter lists by selected period
  const filteredOrders = filterByPeriod(orders, period, customStart, customEnd);
  const filteredIncomes = filterByPeriod(incomes, period, customStart, customEnd);
  const filteredExpenses = filterByPeriod(expenses, period, customStart, customEnd);

  const showNotification = (msg: string) => {
    setLastActionMessage(msg);
    setTimeout(() => setLastActionMessage(null), 4000);
  };

  const handleExportOrders = () => {
    exportOrders(filteredOrders, exportFormat);
    showNotification(`Archivo de Pedidos descargado en formato ${exportFormat.toUpperCase()}.`);
  };

  const handleExportIncomes = () => {
    exportIncomes(filteredIncomes, exportFormat);
    showNotification(`Archivo de Ingresos descargado en formato ${exportFormat.toUpperCase()}.`);
  };

  const handleExportExpenses = () => {
    exportExpenses(filteredExpenses, exportFormat);
    showNotification(`Archivo de Gastos descargado en formato ${exportFormat.toUpperCase()}.`);
  };

  const handleExportProducts = () => {
    exportProducts(products, exportFormat);
    showNotification(`Lista de Precios y Catálogo descargado en formato ${exportFormat.toUpperCase()}.`);
  };

  const handleExportClients = () => {
    exportClients(clients, exportFormat);
    showNotification(`Directorio de Clientes descargado en formato ${exportFormat.toUpperCase()}.`);
  };

  const handleExportFinancialBalance = () => {
    exportFinancialBalance(filteredIncomes, filteredExpenses, filteredOrders, exportFormat);
    showNotification(`Balance Financiero descargado en formato ${exportFormat.toUpperCase()}.`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Centro de Exportación & Reportes</h2>
          <p className="text-xs text-slate-500">
            Descarga planillas reales en formato Excel (.xls / SpreadsheetML) o CSV, compatibles con Microsoft Excel, Google Sheets y LibreOffice.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Imprimir / Guardar en PDF</span>
        </button>
      </div>

      {lastActionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{lastActionMessage}</span>
        </div>
      )}

      {/* Period Selection & Format Selector */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-700" />
          <span>1. Seleccionar Período de Tiempo y Formato</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Preset periods */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="month">Este Mes Actual (Noviembre 2026)</option>
              <option value="today">Sólo el Día de Hoy</option>
              <option value="week">Últimos 7 Días</option>
              <option value="year">Todo el Año en Curso (2026)</option>
              <option value="all">Todo el Historial Completo</option>
              <option value="custom">Rango Personalizado de Fechas</option>
            </select>
          </div>

          {/* Custom start & end */}
          {period === 'custom' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha Desde</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha Hasta</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </>
          )}

          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Formato de Archivo</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setExportFormat('excel')}
                className={`py-1.5 text-xs font-bold rounded-md transition-colors ${
                  exportFormat === 'excel'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Excel (.xls)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`py-1.5 text-xs font-bold rounded-md transition-colors ${
                  exportFormat === 'csv'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CSV (.csv)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 flex flex-wrap gap-4 border-t border-slate-100">
          <span>Registros a exportar con este filtro:</span>
          <span className="font-semibold text-slate-800">{filteredOrders.length} pedidos</span>
          <span>·</span>
          <span className="font-semibold text-slate-800">{filteredIncomes.length} ingresos</span>
          <span>·</span>
          <span className="font-semibold text-slate-800">{filteredExpenses.length} gastos</span>
        </div>
      </div>

      {/* Export Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pedidos */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Descargar Pedidos</h4>
            <p className="text-xs text-slate-500 mt-1">
              Todos los datos de clientes, productos, materiales, fechas de entrega, importes, señas y estados.
            </p>
          </div>
          <button
            onClick={handleExportOrders}
            className="mt-4 w-full py-2 px-3 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Pedidos ({filteredOrders.length})</span>
          </button>
        </div>

        {/* Ingresos */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-cyan-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-900 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Descargar Ingresos & Señas</h4>
            <p className="text-xs text-slate-500 mt-1">
              Planilla con fecha, pedido relacionado, cliente, concepto, medio de pago e importes cobrados.
            </p>
          </div>
          <button
            onClick={handleExportIncomes}
            className="mt-4 w-full py-2 px-3 text-xs font-bold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Ingresos ({filteredIncomes.length})</span>
          </button>
        </div>

        {/* Gastos */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-fuchsia-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-fuchsia-100 text-fuchsia-900 flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Descargar Gastos & Compras</h4>
            <p className="text-xs text-slate-500 mt-1">
              Registro completo de gastos de filamento, repuestos, luz y compras de impresoras.
            </p>
          </div>
          <button
            onClick={handleExportExpenses}
            className="mt-4 w-full py-2 px-3 text-xs font-bold text-fuchsia-950 bg-fuchsia-300 hover:bg-fuchsia-200 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Gastos ({filteredExpenses.length})</span>
          </button>
        </div>

        {/* Balance Financiero */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Descargar Balance Financiero</h4>
            <p className="text-xs text-slate-500 mt-1">
              Resumen con dinero ingresado, gastos operativos, reinversión, caja disponible y saldo pendiente.
            </p>
          </div>
          <button
            onClick={handleExportFinancialBalance}
            className="mt-4 w-full py-2 px-3 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Balance</span>
          </button>
        </div>

        {/* Catálogo de Precios */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
              <Boxes className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Descargar Lista de Precios</h4>
            <p className="text-xs text-slate-500 mt-1">
              Catálogo de productos con costos, precios minoristas, mayoristas y márgenes calculados.
            </p>
          </div>
          <button
            onClick={handleExportProducts}
            className="mt-4 w-full py-2 px-3 text-xs font-bold text-purple-950 bg-purple-100 hover:bg-purple-200 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Catálogo ({products.length})</span>
          </button>
        </div>

        {/* Directorio de Clientes */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-900 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Descargar Clientes</h4>
            <p className="text-xs text-slate-500 mt-1">
              Listado con teléfonos, pedidos acumulados, total comprado y saldos pendientes.
            </p>
          </div>
          <button
            onClick={handleExportClients}
            className="mt-4 w-full py-2 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Clientes ({clients.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
