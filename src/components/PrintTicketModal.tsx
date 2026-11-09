/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, MapPin, Sparkles, Phone, CheckCircle2 } from 'lucide-react';
import { Order, SystemConfig } from '../types';

interface PrintTicketModalProps {
  order: Order | null;
  config: SystemConfig;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({
  order,
  config,
  onClose,
}) => {
  if (!order) return null;

  const currency = config.currencySymbol || '$';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-300 space-y-6 text-slate-900 relative">
        {/* Close button (hidden on print) */}
        <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
          <span className="text-xs font-semibold text-slate-500">
            Vista previa de impresión · Orden de Trabajo & Comprobante
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ficha</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Content */}
        <div className="border-2 border-slate-800 rounded-xl p-6 space-y-5 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-950 p-1 flex items-center justify-center border border-purple-800 shrink-0">
                <img
                  src={config.logoUrl || '/src/assets/images/logo_3dna_brand_1794182176233.jpg'}
                  alt="3DNA Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-950">
                  {config.businessName || '3DNA – Impresión 3D'}
                </h1>
                <p className="text-xs text-purple-900 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-700" />
                  {config.location || 'Itá Ibaté, Corrientes, Argentina'} · {config.slogan || 'Hecho en Itá Ibaté'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Orden de Trabajo Nº
              </span>
              <span className="text-xl font-extrabold font-mono text-purple-950">
                {order.orderNumber}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono">
                {order.createdAt.split('T')[0]}
              </span>
            </div>
          </div>

          {/* Customer & Technical Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-semibold">Cliente:</span>
              <p className="text-sm font-bold text-slate-950">{order.clientName}</p>
              {order.clientPhone && (
                <p className="text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" /> {order.clientPhone}
                </p>
              )}
            </div>

            <div>
              <span className="text-slate-500 block font-semibold">Fecha Prometida de Entrega:</span>
              <p className="text-sm font-bold font-mono text-purple-900">
                {order.estimatedDeliveryDate}
              </p>
              <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                Estado: <strong>{order.status}</strong>
              </span>
            </div>
          </div>

          {/* Piece Specifications Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-300">
              Detalle de la Pieza a Imprimir
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{order.productName}</h4>
                  <p className="text-slate-600 mt-0.5">
                    {order.description || 'Sin especificaciones adicionales.'}
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {order.quantity} u.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-500 block">Material:</span>
                  <strong className="font-semibold">{order.material}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Color / Acabado:</span>
                  <strong className="font-semibold">{order.color}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Precio Unitario:</span>
                  <strong className="font-mono">{currency}{order.agreedPrice.toLocaleString('es-AR')}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <span className="text-slate-500 block">Total Acordado:</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {currency}{order.totalAgreed.toLocaleString('es-AR')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Seña Abonada:</span>
              <span className="text-base font-extrabold font-mono text-emerald-700">
                {currency}{order.deposit.toLocaleString('es-AR')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Saldo a Cancelar:</span>
              <span className="text-base font-extrabold font-mono text-amber-700">
                {currency}{order.pendingBalance.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Observations */}
          {order.notes && (
            <div className="text-xs p-2.5 rounded bg-purple-50/50 border border-purple-200 text-purple-950">
              <strong className="block mb-0.5">Notas de Taller:</strong>
              <p>{order.notes}</p>
            </div>
          )}

          {/* Workshop footer note */}
          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 text-center leading-normal">
            <p>
              ¡Gracias por elegir 3DNA! Fabricación aditiva de precisión en Itá Ibaté.
            </p>
            <p className="mt-1">
              Recomendación: Evitar exponer piezas de PLA al calor excesivo dentro de vehículos cerrados o a temperaturas superiores a 55ºC.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
