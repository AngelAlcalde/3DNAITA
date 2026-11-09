/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  Clock,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Package,
  X,
} from 'lucide-react';
import { Client, Order, SystemConfig } from '../types';

interface ClientsViewProps {
  clients: Client[];
  orders: Order[];
  config: SystemConfig;
  onCreateClient: (data: any) => void;
  onUpdateClient: (id: string, updates: any) => void;
  onDeleteClient: (id: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  orders,
  config,
  onCreateClient,
  onUpdateClient,
  onDeleteClient,
  onSelectOrder,
}) => {
  const currency = config.currencySymbol || '$';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  const handleOpenNew = () => {
    setClientToEdit(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setClientToEdit(c);
    setName(c.name);
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (clientToEdit) {
      onUpdateClient(clientToEdit.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
      });
    } else {
      onCreateClient({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
      });
    }
    setIsModalOpen(false);
  };

  const handleWhatsApp = (client: Client) => {
    if (!client.phone) return;
    const cleanPhone = client.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `¡Hola ${client.name}! Te escribimos desde 3DNA – Impresión 3D (Itá Ibaté). Esperamos que te encuentres muy bien. ¿En qué proyecto o pieza 3D podemos ayudarte hoy?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Get orders history for selected client
  const clientOrdersHistory = selectedClientForHistory
    ? orders.filter(
        (o) =>
          o.clientName.trim().toLowerCase() ===
          selectedClientForHistory.name.trim().toLowerCase()
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Directorio de Clientes</h2>
          <p className="text-xs text-slate-500">
            Historial de pedidos, saldos pendientes y contacto directo por WhatsApp.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4 text-center">Pedidos</th>
                <th className="py-3 px-4 text-right">Total Comprado</th>
                <th className="py-3 px-4 text-right">Saldo Pendiente</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-purple-50/30 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{client.name}</div>
                      {client.notes && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {client.notes}
                        </div>
                      )}
                    </td>

                    {/* Phone & WhatsApp */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-700">{client.phone || '-'}</span>
                        {client.phone && (
                          <button
                            onClick={() => handleWhatsApp(client)}
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Abrir chat en WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Total orders */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {client.totalOrders}
                    </td>

                    {/* Total spent */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {currency}{client.totalSpent.toLocaleString('es-AR')}
                    </td>

                    {/* Pending balance */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      {client.pendingBalance > 0 ? (
                        <span className="text-amber-600">
                          {currency}{client.pendingBalance.toLocaleString('es-AR')}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Al día</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedClientForHistory(client)}
                          className="px-2.5 py-1 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 transition-colors"
                        >
                          Ver Historial
                        </button>
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="p-1.5 text-slate-400 hover:text-amber-700 rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Full Order History Drawer / Modal */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Historial de Pedidos · {selectedClientForHistory.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Tel: {selectedClientForHistory.phone || 'Sin teléfono'} · Total comprado:{' '}
                  <strong>{currency}{selectedClientForHistory.totalSpent.toLocaleString('es-AR')}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForHistory(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {clientOrdersHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs italic">
                  Este cliente no tiene pedidos registrados aún.
                </div>
              ) : (
                clientOrdersHistory.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onSelectOrder(ord);
                      setSelectedClientForHistory(null);
                    }}
                    className="p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded">
                          {ord.orderNumber}
                        </span>
                        <span className="font-bold text-slate-900">{ord.productName}</span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        {ord.quantity} u. · {ord.material} ({ord.color}) · Entrega: {ord.estimatedDeliveryDate}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-extrabold text-slate-900 block">
                        {currency}{ord.totalAgreed.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[11px] font-semibold text-purple-700">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-medium">
                Saldo pendiente actual:{' '}
                <strong className={selectedClientForHistory.pendingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                  {currency}{selectedClientForHistory.pendingBalance.toLocaleString('es-AR')}
                </strong>
              </span>
              <button
                onClick={() => setSelectedClientForHistory(null)}
                className="px-4 py-1.5 font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {clientToEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Marcelo Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Ej: +54 3786 112233"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Ej: cliente@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones / Notas
                </label>
                <textarea
                  rows={2}
                  placeholder="Preferencias de horario, comercio, etc."
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
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
