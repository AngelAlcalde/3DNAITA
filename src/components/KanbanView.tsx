/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar,
  AlertCircle,
  Plus,
  Table as TableIcon,
  MessageCircle,
} from 'lucide-react';
import { Order, OrderStatus, SystemConfig } from '../types';

interface KanbanViewProps {
  orders: Order[];
  config: SystemConfig;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onSelectOrder: (order: Order) => void;
  onOpenNewOrder: () => void;
  onSwitchToTable: () => void;
  onPrintTicket: (order: Order) => void;
}

const KANBAN_STAGES: { id: OrderStatus; label: string; color: string; badgeColor: string }[] = [
  { id: 'Recibido', label: '1. Recibido', color: 'border-slate-300 bg-slate-50/50', badgeColor: 'bg-slate-200 text-slate-800' },
  { id: 'Pendiente de confirmación', label: '2. Pend. Confirmación', color: 'border-amber-300 bg-amber-50/30', badgeColor: 'bg-amber-100 text-amber-900' },
  { id: 'Pendiente de producción', label: '3. Pend. Producción', color: 'border-orange-300 bg-orange-50/30', badgeColor: 'bg-orange-100 text-orange-900' },
  { id: 'En producción', label: '4. En Producción', color: 'border-purple-300 bg-purple-50/30', badgeColor: 'bg-purple-100 text-purple-900' },
  { id: 'Terminado', label: '5. Terminado', color: 'border-indigo-300 bg-indigo-50/30', badgeColor: 'bg-indigo-100 text-indigo-900' },
  { id: 'Listo para retirar', label: '6. Listo p/ Retirar', color: 'border-cyan-300 bg-cyan-50/30', badgeColor: 'bg-cyan-100 text-cyan-900' },
  { id: 'Entregado', label: '7. Entregado', color: 'border-emerald-300 bg-emerald-50/30', badgeColor: 'bg-emerald-100 text-emerald-900' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  orders,
  config,
  onUpdateStatus,
  onSelectOrder,
  onOpenNewOrder,
  onSwitchToTable,
  onPrintTicket,
}) => {
  const currency = config.currencySymbol || '$';
  const todayStr = new Date().toISOString().split('T')[0];

  const stageKeys = KANBAN_STAGES.map((s) => s.id);

  const moveOrder = (order: Order, direction: 'left' | 'right') => {
    const currentIndex = stageKeys.indexOf(order.status);
    if (currentIndex === -1) return;

    if (direction === 'left' && currentIndex > 0) {
      onUpdateStatus(order.id, stageKeys[currentIndex - 1]);
    } else if (direction === 'right' && currentIndex < stageKeys.length - 1) {
      onUpdateStatus(order.id, stageKeys[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tablero Kanban de Producción</h2>
          <p className="text-xs text-slate-500">
            Avanza los pedidos por etapa de impresión 3D con un solo clic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToTable}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          >
            <TableIcon className="w-4 h-4 text-slate-600" />
            <span>Vista Tabla</span>
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

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]">
        {KANBAN_STAGES.map((stage, stageIdx) => {
          const stageOrders = orders.filter((o) => o.status === stage.id);

          return (
            <div
              key={stage.id}
              className={`w-72 shrink-0 rounded-xl border flex flex-col max-h-[80vh] shadow-xs ${stage.color}`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200/80 bg-white/80 rounded-t-xl flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">{stage.label}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.badgeColor}`}>
                  {stageOrders.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                {stageOrders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    Sin pedidos en esta etapa
                  </div>
                ) : (
                  stageOrders.map((order) => {
                    const isDelayed =
                      order.status !== 'Entregado' &&
                      order.status !== 'Cancelado' &&
                      order.estimatedDeliveryDate < todayStr;

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-lg p-3 border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-2"
                      >
                        {/* Top: Order number & Delivery date */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`font-mono text-[11px] flex items-center gap-1 ${
                              isDelayed ? 'text-rose-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {order.estimatedDeliveryDate}
                          </span>
                        </div>

                        {/* Product Title & Quantity */}
                        <div>
                          <h4
                            onClick={() => onSelectOrder(order)}
                            className="font-bold text-xs text-slate-900 hover:text-purple-700 cursor-pointer line-clamp-1"
                          >
                            {order.productName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {order.quantity} u. · {order.material} ({order.color})
                          </p>
                        </div>

                        {/* Client name */}
                        <div className="text-xs text-slate-700 font-semibold truncate">
                          {order.clientName}
                        </div>

                        {/* Financial balance pill */}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-mono">
                          <span className="text-slate-500">
                            Total: {currency}{order.totalAgreed.toLocaleString('es-AR')}
                          </span>
                          {order.pendingBalance > 0 ? (
                            <span className="text-amber-700 font-bold">
                              Saldo: {currency}{order.pendingBalance.toLocaleString('es-AR')}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold">Pagado</span>
                          )}
                        </div>

                        {/* Action buttons bar */}
                        <div className="flex items-center justify-between pt-1 text-slate-400">
                          {/* Move left */}
                          <button
                            disabled={stageIdx === 0}
                            onClick={() => moveOrder(order, 'left')}
                            className="p-1 hover:text-purple-700 hover:bg-purple-50 rounded disabled:opacity-20"
                            title="Mover a etapa anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onPrintTicket(order)}
                              className="p-1 hover:text-cyan-700 hover:bg-cyan-50 rounded"
                              title="Imprimir Orden de Trabajo"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                            {order.clientPhone && (
                              <button
                                onClick={() => {
                                  const cleanPhone = order.clientPhone.replace(/\D/g, '');
                                  window.open(`https://wa.me/${cleanPhone}`, '_blank');
                                }}
                                className="p-1 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}
                          </div>

                          {/* Move right */}
                          <button
                            disabled={stageIdx === stageKeys.length - 1}
                            onClick={() => moveOrder(order, 'right')}
                            className="p-1 hover:text-purple-700 hover:bg-purple-50 rounded disabled:opacity-20"
                            title="Avanzar a siguiente etapa"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
