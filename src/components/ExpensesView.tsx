/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  Search,
  ArrowUpRight,
  Trash2,
  FolderPlus,
  Cpu,
  Receipt,
  Layers,
} from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseType, PaymentMethod, SystemConfig } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  config: SystemConfig;
  onCreateExpense: (data: any) => void;
  onDeleteExpense: (id: string) => void;
  onCreateCategory: (name: string, isEquipment: boolean) => void;
  onDeleteCategory: (id: string) => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Transferencia / Mercado Pago',
  'Efectivo',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Otro',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  categories,
  config,
  onCreateExpense,
  onDeleteExpense,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const currency = config.currencySymbol || '$';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos'); // 'todos', 'Operativo', 'Equipamiento'
  const [filterCategoryId, setFilterCategoryId] = useState<string>('todos');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // New Expense form
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');

  // New Category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIsEquipment, setNewCatIsEquipment] = useState(false);

  // Totals
  const totalOperational = expenses
    .filter((e) => e.expenseType === 'Operativo')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalEquipment = expenses
    .filter((e) => e.expenseType === 'Equipamiento')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = totalOperational + totalEquipment;

  const filteredExpenses = expenses.filter((e) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      e.description.toLowerCase().includes(term) ||
      e.categoryName.toLowerCase().includes(term) ||
      (e.notes && e.notes.toLowerCase().includes(term));
    const matchesType = filterType === 'todos' || e.expenseType === filterType;
    const matchesCategory = filterCategoryId === 'todos' || e.categoryId === filterCategoryId;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleOpenExpenseModal = () => {
    setDate(new Date().toISOString().split('T')[0]);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setDescription('');
    setAmount(0);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setNotes('');
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0 || !categoryId) {
      alert('Por favor completa la descripción, categoría e importe válido.');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    const categoryName = cat ? cat.name : 'Varios';
    const expenseType: ExpenseType = cat && cat.isEquipment ? 'Equipamiento' : 'Operativo';

    onCreateExpense({
      date,
      categoryId,
      categoryName,
      expenseType,
      description: description.trim(),
      amount: Number(amount),
      paymentMethod,
      notes: notes.trim(),
    });

    setIsExpenseModalOpen(false);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onCreateCategory(newCatName.trim(), newCatIsEquipment);
    setNewCatName('');
    setNewCatIsEquipment(false);
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gastos, Compras & Inversión</h2>
          <p className="text-xs text-slate-500">
            Distingue gastos operativos de filamento y luz de las compras de impresoras 3D y maquinaria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-purple-700" />
            <span>Gestionar Categorías</span>
          </button>

          <button
            onClick={handleOpenExpenseModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* Overview Cards: Operational vs Equipment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Gastos Operativos (Insumos)</span>
          <p className="text-xl font-extrabold text-slate-800 font-mono tabular-nums mt-1">
            {currency}{totalOperational.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-400">Filamentos, repuestos, servicios, etc.</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-purple-200 shadow-xs">
          <span className="text-xs font-semibold text-purple-900 block flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-purple-600" /> Inversión en Equipamiento
          </span>
          <p className="text-xl font-extrabold text-purple-900 font-mono tabular-nums mt-1">
            {currency}{totalEquipment.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-purple-700">Impresoras 3D y maquinaria productiva</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block">Total Salidas de Dinero</span>
          <p className="text-xl font-extrabold text-white font-mono tabular-nums mt-1">
            {currency}{totalExpenses.toLocaleString('es-AR')}
          </p>
          <span className="text-[11px] text-slate-400">Descontado de la caja total</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descripción o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="py-2 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
        >
          <option value="todos">Todos los Tipos de Gasto</option>
          <option value="Operativo">Sólo Gastos Operativos</option>
          <option value="Equipamiento">Sólo Maquinaria / Equipamiento</option>
        </select>

        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className="py-2 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
        >
          <option value="todos">Todas las Categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.isEquipment ? '(Equipamiento)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4 text-right">Importe</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No hay gastos o compras registradas.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4">
                      {exp.expenseType === 'Equipamiento' ? (
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          Equipamiento
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          Operativo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {exp.categoryName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{exp.description}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-400 italic">{exp.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-fuchsia-700">
                      -{currency}{exp.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este registro de gasto?')) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded"
                        title="Eliminar gasto"
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

      {/* New Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Registrar Salida de Dinero / Gasto</h3>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha del Gasto *
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
                    Categoría *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.isEquipment ? '(Inversión / Maquinaria)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción del Gasto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 3 bobinas filamento PLA negro, boquilla acero endurecido..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Importe ($) *
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
                      className="w-full pl-7 pr-3 py-2 text-base font-mono font-extrabold text-fuchsia-900 bg-white border-2 border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500"
                    />
                  </div>
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
                  Observaciones / Proveedor
                </label>
                <input
                  type="text"
                  placeholder="Nombre de proveedor, número de factura o detalle..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <h3 className="text-base font-bold text-slate-900">Categorías de Gastos</h3>

            {/* Existing categories list */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 max-h-56">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{c.name}</span>
                    {c.isEquipment && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                        Maquinaria / Inversión
                      </span>
                    )}
                  </div>
                  {categories.length > 1 && (
                    <button
                      onClick={() => onDeleteCategory(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new category form */}
            <form onSubmit={handleSaveCategory} className="pt-3 border-t border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Agregar Nueva Categoría</span>
              <input
                type="text"
                required
                placeholder="Ej: Resinas y Químicos de Lavado"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCatIsEquipment}
                  onChange={(e) => setNewCatIsEquipment(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Es inversión en maquinaria o equipamiento (se separa de los gastos operativos)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                >
                  Añadir Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
