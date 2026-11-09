/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, ArrowDownLeft, Trash2, Calendar, CreditCard, Filter } from 'lucide-react';
import { Income, Order, PaymentMethod, SystemConfig } from '../types';

interface IncomeViewProps {
  incomes: Income[];
  orders: Order[];
  config: SystemConfig;
  onCreateIncome: (data: any) => void;
  onDeleteIncome: (id: string) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Transferencia / Mercado Pago',
  'Efectivo',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Otro',
];

export const IncomeView: React.FC<IncomeViewProps> = ({
  incomes,
  orders,
  config,
  onCreateIncome,
  onDeleteIncome,
}) => {
  const currency = config.currencySymbol || '$';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Income form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderId, setOrderId] = useState('');
  const [clientName, setClientName] = useState('');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');

  // Orders with pending balance
  const ordersWithDebt = orders.filter((o) => o.status !== 'Cancelado' && o.pendingBalance > 0);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const filteredIncomes = incomes.filter((i) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      i.concept.toLowerCase().includes(term) ||
      i.clientName.toLowerCase().includes(term) ||
      (i.orderNumber && i.orderNumber.toLowerCase().includes(term));
    const matchesMethod = selectedMethod === 'todos' || i.paymentMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const handleSelectOrder = (id: string) => {
    setOrderId(id);
    if (!id) return;

    const ord = orders.find((o) => o.id === id);
    if (ord) {
      setClientName(ord.clientName);
      setConcept(`Pago/Seña Pedido #${ord.orderNumber} (${ord.productName})`);
      setAmount(ord.pendingBalance); // Suggest remaining balance
    }
  };

  const handleOpenModal = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setOrderId('');
    setClientName('');
    setConcept('');
    setAmount(0);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !concept.trim() || amount <= 0) {
      alert('Por favor completa el cliente, concepto e importe válido.');
      return;
    }

    const selectedOrder = orders.find((o) => o.id === orderId);

    onCreateIncome({
      date,
      orderId: orderId || undefined,
      orderNumber: selectedOrder ? selectedOrder.orderNumber : undefined,
      clientName: clientName.trim(),
      concept: concept.trim(),
      amount: Number(amount),
      paymentMethod,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Registro de Ingresos & Señas</h2>
          <p className="text-xs text-slate-500">
            Cada cobro efectivo actualiza automáticamente el saldo pendiente del pedido correspondiente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-500 block">Total Cobrado Real:</span>
            <span className="font-mono font-extrabold text-cyan-700 text-base">
              {currency}{totalIncome.toLocaleString('es-AR')}
            </span>
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Ingreso</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, concepto o pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="py-2 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
        >
          <option value="todos">Todos los medios de pago</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Incomes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Pedido</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4 text-right">Importe Cobrado</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No hay ingresos registrados con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-cyan-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {inc.date}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-900 whitespace-nowrap">
                      {inc.orderNumber || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {inc.clientName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{inc.concept}</div>
                      {inc.notes && (
                        <div className="text-[11px] text-slate-400 italic">{inc.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                        {inc.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-extrabold text-cyan-800 text-sm">
                      +{currency}{inc.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este registro de ingreso?')) {
                            onDeleteIncome(inc.id);
                          }
                        }}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Registrar Cobro de Ingreso / Seña</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha del Cobro *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vincular a Pedido (Opcional)
                  </label>
                  <select
                    value={orderId}
                    onChange={(e) => handleSelectOrder(e.target.value)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Sin pedido vinculado --</option>
                    {ordersWithDebt.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} · {o.clientName} (Saldo: {currency}{o.pendingBalance.toLocaleString('es-AR')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mariana Romero"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medio de Pago *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Concepto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Seña 50% pedido #PED-108 / Cancelación total de saldo"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Importe Cobrado ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-base font-mono font-extrabold text-cyan-900 bg-white border-2 border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones
                </label>
                <input
                  type="text"
                  placeholder="Número de comprobante, transferido a alias, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                >
                  Registrar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
