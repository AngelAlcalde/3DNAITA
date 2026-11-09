/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Printer,
  Calendar,
  AlertCircle,
  MessageCircle,
  Edit2,
  Trash2,
  Eye,
  Columns3,
  ListFilter,
  Check,
} from 'lucide-react';
import { Order, OrderStatus, SystemConfig } from '../types';

interface OrdersViewProps {
  orders: Order[];
  config: SystemConfig;
  onOpenNewOrder: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateStatus: (id: string, status: OrderStatus, reason?: string) => void;
  onPrintTicket: (order: Order) => void;
  onSwitchToKanban: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  config,
  onOpenNewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
  onPrintTicket,
  onSwitchToKanban,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [filterDelayedOnly, setFilterDelayedOnly] = useState(false);
  const [filterPendingBalanceOnly, setFilterPendingBalanceOnly] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const currency = config.currencySymbol || '$';
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering and Sorting
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Search
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          o.orderNumber.toLowerCase().includes(term) ||
          o.clientName.toLowerCase().includes(term) ||
          o.productName.toLowerCase().includes(term) ||
          (o.clientPhone && o.clientPhone.toLowerCase().includes(term));

        if (!matchesSearch) return false;

        // Status
        if (statusFilter !== 'todos') {
          if (statusFilter === 'activos' && o.status === 'Cancelado') return false;
          if (statusFilter === 'cancelados' && o.status !== 'Cancelado') return false;
          if (statusFilter !== 'activos' && statusFilter !== 'cancelados' && o.status !== statusFilter) {
            return false;
          }
        }

        // Atrasados
        if (filterDelayedOnly) {
          if (o.status === 'Entregado' || o.status === 'Cancelado' || o.estimatedDeliveryDate >= todayStr) {
            return false;
          }
        }

        // Saldo pendiente
        if (filterPendingBalanceOnly) {
          if (o.pendingBalance <= 0 || o.status === 'Cancelado') return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Cancelled orders to the end
        if (a.status === 'Cancelado' && b.status !== 'Cancelado') return 1;
        if (a.status !== 'Cancelado' && b.status === 'Cancelado') return -1;
        // Sort by delivery date ascending (closest first)
        return a.estimatedDeliveryDate.localeCompare(b.estimatedDeliveryDate);
      });
  }, [orders, searchTerm, statusFilter, filterDelayedOnly, filterPendingBalanceOnly, todayStr]);

  const allStatuses: OrderStatus[] = [
    'Recibido',
    'Pendiente de confirmación',
    'Pendiente de producción',
    'En producción',
    'Terminado',
    'Listo para retirar',
    'Entregado',
    'Cancelado',
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Recibido':
        return <span className="text-xs font-semibold text-slate-700">Recibido</span>;
      case 'Pendiente de confirmación':
        return <span className="text-xs font-semibold text-amber-700">Pend. Confirmación</span>;
      case 'Pendiente de producción':
        return <span className="text-xs font-semibold text-orange-700">Pend. Producción</span>;
      case 'En producción':
        return <span className="text-xs font-semibold text-purple-700">En Producción</span>;
      case 'Terminado':
        return <span className="text-xs font-semibold text-indigo-700">Terminado</span>;
      case 'Listo para retirar':
        return <span className="text-xs font-semibold text-cyan-700">Listo p/ Retirar</span>;
      case 'Entregado':
        return <span className="text-xs font-semibold text-emerald-700">Entregado</span>;
      case 'Cancelado':
        return <span className="text-xs font-semibold text-rose-700 line-through">Cancelado</span>;
      default:
        return <span className="text-xs text-slate-600">{status}</span>;
    }
  };

  const handleWhatsApp = (order: Order) => {
    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `¡Hola ${order.clientName}! Te contactamos desde 3DNA (Itá Ibaté) sobre tu pedido #${order.orderNumber} (${order.productName}).\nEstado actual: ${order.status}.\nSaldo pendiente: ${currency}${order.pendingBalance.toLocaleString('es-AR')}.\n¡Quedamos a tu disposición!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const confirmCancel = () => {
    if (orderToCancel) {
      onUpdateStatus(orderToCancel.id, 'Cancelado', cancelReason || 'Cancelado por el cliente o taller');
      setOrderToCancel(null);
      setCancelReason('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gestión de Pedidos</h2>
          <p className="text-xs text-slate-500">
            Total {orders.length} pedidos · Mostrando {filteredOrders.length} según filtros
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToKanban}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <Columns3 className="w-4 h-4 text-purple-700" />
            <span>Ver Tablero Kanban</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Pedido</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono, número de pedido o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activos">Sólo Pedidos Activos</option>
              <option value="Recibido">1. Recibido</option>
              <option value="Pendiente de confirmación">2. Pendiente de confirmación</option>
              <option value="Pendiente de producción">3. Pendiente de producción</option>
              <option value="En producción">4. En producción</option>
              <option value="Terminado">5. Terminado</option>
              <option value="Listo para retirar">6. Listo para retirar</option>
              <option value="Entregado">7. Entregado</option>
              <option value="cancelados">8. Cancelados</option>
            </select>
          </div>

          {/* Quick toggle chips */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterDelayedOnly(!filterDelayedOnly)}
              className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                filterDelayedOnly
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Atrasados</span>
            </button>

            <button
              onClick={() => setFilterPendingBalanceOnly(!filterPendingBalanceOnly)}
              className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                filterPendingBalanceOnly
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Con Saldo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3">Pedido</th>
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">Producto & Material</th>
                <th className="py-3 px-3">Cant.</th>
                <th className="py-3 px-3">Entrega Estimada</th>
                <th className="py-3 px-3 text-right">Acordado</th>
                <th className="py-3 px-3 text-right">Seña</th>
                <th className="py-3 px-3 text-right">Saldo</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm">No se encontraron pedidos con los filtros seleccionados.</p>
                    <button
                      onClick={onOpenNewOrder}
                      className="mt-2 text-xs font-bold text-purple-700 hover:text-purple-900"
                    >
                      + Registrar Nuevo Pedido
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isDelayed =
                    order.status !== 'Entregado' &&
                    order.status !== 'Cancelado' &&
                    order.estimatedDeliveryDate < todayStr;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-purple-50/30 transition-colors ${
                        order.status === 'Cancelado' ? 'bg-slate-50/60 opacity-70' : ''
                      }`}
                    >
                      {/* Order Number */}
                      <td className="py-3 px-3 font-mono font-bold text-purple-950 whitespace-nowrap">
                        {order.orderNumber}
                      </td>

                      {/* Client */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{order.clientName}</div>
                        {order.clientPhone && (
                          <div className="text-[11px] text-slate-500 font-mono">{order.clientPhone}</div>
                        )}
                      </td>

                      {/* Product & Material */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900 truncate max-w-[180px]">
                          {order.productName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.material} · {order.color}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-800">
                        {order.quantity} u.
                      </td>

                      {/* Estimated Delivery */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div
                          className={`font-mono tabular-nums text-xs font-semibold ${
                            isDelayed ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {order.estimatedDeliveryDate}
                        </div>
                        {isDelayed && (
                          <span className="text-[10px] text-rose-600 font-bold block">¡Atrasado!</span>
                        )}
                      </td>

                      {/* Total Agreed */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {currency}{order.totalAgreed.toLocaleString('es-AR')}
                      </td>

                      {/* Deposit */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                        {currency}{order.deposit.toLocaleString('es-AR')}
                      </td>

                      {/* Pending Balance */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                        {order.pendingBalance > 0 ? (
                          <span className="text-amber-600">
                            {currency}{order.pendingBalance.toLocaleString('es-AR')}
                          </span>
                        ) : (
                          <span className="text-emerald-600">Pagado</span>
                        )}
                      </td>

                      {/* Status Selector Dropdown */}
                      <td className="py-3 px-3">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as OrderStatus;
                            if (newStatus === 'Cancelado') {
                              setOrderToCancel(order);
                            } else {
                              onUpdateStatus(order.id, newStatus);
                            }
                          }}
                          className="py-1 px-2 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {allStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Detalle */}
                          <button
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded"
                            title="Ver detalles del pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print ticket */}
                          <button
                            onClick={() => onPrintTicket(order)}
                            className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 rounded"
                            title="Imprimir Orden de Trabajo para el Taller"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp */}
                          {order.clientPhone && (
                            <button
                              onClick={() => handleWhatsApp(order)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                              title="Enviar WhatsApp con estado al cliente"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-600" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => onEditOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                            title="Modificar pedido"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                  {selectedOrderForDetail.orderNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedOrderForDetail.productName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Cliente</p>
                <p className="font-semibold text-slate-900">{selectedOrderForDetail.clientName}</p>
              </div>
              <div>
                <p className="text-slate-500">Teléfono</p>
                <p className="font-semibold text-slate-900 font-mono">{selectedOrderForDetail.clientPhone || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-slate-500">Material & Color</p>
                <p className="font-semibold text-slate-900">{selectedOrderForDetail.material} ({selectedOrderForDetail.color})</p>
              </div>
              <div>
                <p className="text-slate-500">Cantidad</p>
                <p className="font-semibold text-slate-900">{selectedOrderForDetail.quantity} unidad(es)</p>
              </div>
              <div>
                <p className="text-slate-500">Fecha de Ingreso</p>
                <p className="font-semibold text-slate-900">{selectedOrderForDetail.createdAt.split('T')[0]}</p>
              </div>
              <div>
                <p className="text-slate-500">Fecha Estimada de Entrega</p>
                <p className="font-semibold text-purple-900 font-mono">{selectedOrderForDetail.estimatedDeliveryDate}</p>
              </div>
            </div>

            {selectedOrderForDetail.description && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Descripción / Especificaciones:</span>
                <p className="text-slate-600">{selectedOrderForDetail.description}</p>
              </div>
            )}

            {selectedOrderForDetail.notes && (
              <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 text-xs">
                <span className="font-semibold text-purple-900 block mb-1">Observaciones internas de taller:</span>
                <p className="text-purple-800">{selectedOrderForDetail.notes}</p>
              </div>
            )}

            {selectedOrderForDetail.status === 'Cancelado' && selectedOrderForDetail.cancellationReason && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <span className="font-bold block mb-1">Motivo de cancelación:</span>
                <p>{selectedOrderForDetail.cancellationReason}</p>
              </div>
            )}

            {/* Financial summary in detail */}
            <div className="p-3 rounded-lg bg-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-slate-500">Total Acordado</p>
                <p className="font-bold text-slate-900 font-mono">{currency}{selectedOrderForDetail.totalAgreed.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-slate-500">Seña Recibida</p>
                <p className="font-bold text-emerald-700 font-mono">{currency}{selectedOrderForDetail.deposit.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <p className="text-slate-500">Saldo Pendiente</p>
                <p className="font-bold text-amber-600 font-mono">{currency}{selectedOrderForDetail.pendingBalance.toLocaleString('es-AR')}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onPrintTicket(selectedOrderForDetail);
                  setSelectedOrderForDetail(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Ficha
              </button>
              <button
                onClick={() => {
                  onEditOrder(selectedOrderForDetail);
                  setSelectedOrderForDetail(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg"
              >
                Modificar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">¿Eliminar Pedido?</h3>
            <p className="text-xs text-slate-600">
              ¿Estás seguro de que deseas eliminar permanentemente el pedido{' '}
              <strong>{orderToDelete.orderNumber}</strong> de <strong>{orderToDelete.clientName}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancelar Pedido {orderToCancel.orderNumber}</h3>
            <p className="text-xs text-slate-600">
              El pedido se conservará en el historial de pedidos cancelados. Por favor ingresa el motivo:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ej: Cliente canceló por demora, falta de stock de filamento especial, etc."
              rows={3}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setOrderToCancel(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Volver sin Cancelar
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
