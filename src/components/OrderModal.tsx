/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Calculator, Clock } from 'lucide-react';
import { Order, OrderStatus, Product, Client, SystemConfig } from '../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: any) => void;
  orderToEdit?: Order | null;
  products: Product[];
  clients: Client[];
  config: SystemConfig;
  nextOrderNumber: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  products,
  clients,
  config,
  nextOrderNumber,
}) => {
  const currency = config.currencySymbol || '$';

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [color, setColor] = useState('Blanco');
  const [material, setMaterial] = useState('PLA Premium');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [agreedPrice, setAgreedPrice] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>('Recibido');
  const [notes, setNotes] = useState('');

  // Default delivery date: 3 days ahead
  useEffect(() => {
    if (orderToEdit) {
      setClientName(orderToEdit.clientName);
      setClientPhone(orderToEdit.clientPhone || '');
      setSelectedProductId(orderToEdit.productId || '');
      setProductName(orderToEdit.productName);
      setDescription(orderToEdit.description || '');
      setQuantity(orderToEdit.quantity);
      setColor(orderToEdit.color);
      setMaterial(orderToEdit.material);
      setEstimatedDeliveryDate(orderToEdit.estimatedDeliveryDate);
      setCostPrice(orderToEdit.costPrice);
      setRetailPrice(orderToEdit.retailPrice);
      setWholesalePrice(orderToEdit.wholesalePrice);
      setAgreedPrice(orderToEdit.agreedPrice);
      setDeposit(orderToEdit.deposit);
      setStatus(orderToEdit.status);
      setNotes(orderToEdit.notes || '');
    } else {
      // New order defaults
      setClientName('');
      setClientPhone('');
      setSelectedProductId('');
      setProductName('');
      setDescription('');
      setQuantity(1);
      setColor('Negro');
      setMaterial('PLA Premium');
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setEstimatedDeliveryDate(d.toISOString().split('T')[0]);
      setCostPrice(0);
      setRetailPrice(0);
      setWholesalePrice(0);
      setAgreedPrice(0);
      setDeposit(0);
      setStatus('Recibido');
      setNotes('');
    }
  }, [orderToEdit, isOpen]);

  // When a product from catalog is selected, autofill prices and details
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) return;

    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setProductName(prod.name);
      setMaterial(prod.material || 'PLA Premium');
      setCostPrice(prod.manufacturingCost);
      setRetailPrice(prod.retailPrice);
      setWholesalePrice(prod.wholesalePrice);
      setAgreedPrice(prod.retailPrice); // default to retail
      if (prod.description && !description) {
        setDescription(prod.description);
      }
    }
  };

  // When an existing client is selected
  const handleSelectClient = (name: string) => {
    setClientName(name);
    const cli = clients.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (cli && cli.phone) {
      setClientPhone(cli.phone);
    }
  };

  // Calculations
  const totalAgreed = agreedPrice * quantity;
  const pendingBalance = Math.max(0, totalAgreed - deposit);
  const estimatedProfit = (agreedPrice - costPrice) * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !productName.trim() || !estimatedDeliveryDate) {
      alert('Por favor completa el nombre del cliente, producto y fecha de entrega.');
      return;
    }

    onSave({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      productId: selectedProductId || undefined,
      productName: productName.trim(),
      description: description.trim(),
      quantity: Number(quantity) || 1,
      color: color.trim() || 'Estándar',
      material: material.trim() || 'PLA',
      estimatedDeliveryDate,
      costPrice: Number(costPrice) || 0,
      retailPrice: Number(retailPrice) || 0,
      wholesalePrice: Number(wholesalePrice) || 0,
      agreedPrice: Number(agreedPrice) || 0,
      deposit: Number(deposit) || 0,
      status,
      notes: notes.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-purple-950 to-purple-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-yellow-400 text-purple-950 px-2 py-0.5 rounded">
                {orderToEdit ? orderToEdit.orderNumber : nextOrderNumber}
              </span>
              <span className="text-xs text-purple-200">3DNA · Itá Ibaté</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {orderToEdit ? 'Modificar Pedido' : 'Nuevo Pedido de Impresión 3D'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Cliente Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
              1. Datos del Cliente
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  required
                  list="client-suggestions"
                  placeholder="Ej: Lucas Fernández"
                  value={clientName}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <datalist id="client-suggestions">
                  {clients.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono (WhatsApp)
                </label>
                <input
                  type="text"
                  placeholder="Ej: +54 3786 123456"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Producto y Especificaciones 3D */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
              2. Pieza y Especificaciones de Impresión
            </h4>

            {/* Select from catalog */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargar desde Catálogo de Productos
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
              >
                <option value="">-- Personalizado / Elegir del Catálogo --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.material}) — Minorista: {currency}{p.retailPrice.toLocaleString('es-AR')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Producto Solicitado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Dragón Articulado Tricolor 45cm"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="PLA Premium">PLA Premium</option>
                  <option value="PLA Seda Tricolor">PLA Seda Tricolor</option>
                  <option value="PLA Mármol">PLA Mármol</option>
                  <option value="PETG Alta Resistencia">PETG Alta Resistencia</option>
                  <option value="ABS Técnico">ABS Técnico</option>
                  <option value="TPU Flexible">TPU Flexible</option>
                  <option value="Resina UV">Resina UV de Alta Definición</option>
                  <option value="Otro">Otro material</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color / Acabado
                </label>
                <input
                  type="text"
                  placeholder="Ej: Fucsia Seda / Negro Mate"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha Entrega Estimada *
                </label>
                <input
                  type="date"
                  required
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción / Especificaciones del Trabajo
              </label>
              <textarea
                rows={2}
                placeholder="Relleno 20%, altura de capa 0.16mm, grabado de nombre en la base..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Precios, Seña y Saldo */}
          <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center justify-between">
              <span>3. Precios, Seña y Saldo</span>
              <span className="text-[11px] text-purple-700 font-normal">
                Modifica el precio acordado libremente
              </span>
            </h4>

            {/* Price references */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block">Costo Fabricación:</span>
                <input
                  type="number"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                  className="w-full font-mono text-slate-700 font-bold bg-transparent border-0 p-0 focus:outline-none"
                />
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block">Precio Minorista:</span>
                <span className="font-mono text-slate-800 font-bold">{currency}{retailPrice.toLocaleString('es-AR')}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block">Precio Mayorista:</span>
                <span className="font-mono text-slate-800 font-bold">{currency}{wholesalePrice.toLocaleString('es-AR')}</span>
              </div>
            </div>

            {/* Inputs: Agreed Price & Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Precio Unitario Acordado ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-white border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono font-extrabold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  Seña Recibida ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-white border-2 border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-extrabold text-emerald-800"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Banner */}
            <div className="p-3 rounded-lg bg-white border border-purple-200 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-slate-500 block">Total Acordado:</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {currency}{totalAgreed.toLocaleString('es-AR')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Seña Cobrada:</span>
                <span className="font-mono font-extrabold text-emerald-700 text-sm">
                  {currency}{deposit.toLocaleString('es-AR')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Saldo Pendiente:</span>
                <span className="font-mono font-extrabold text-amber-600 text-sm">
                  {currency}{pendingBalance.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Estado y Observaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado del Pedido
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
              >
                <option value="Recibido">1. Recibido</option>
                <option value="Pendiente de confirmación">2. Pendiente de confirmación</option>
                <option value="Pendiente de producción">3. Pendiente de producción</option>
                <option value="En producción">4. En producción</option>
                <option value="Terminado">5. Terminado</option>
                <option value="Listo para retirar">6. Listo para retirar</option>
                <option value="Entregado">7. Entregado</option>
                <option value="Cancelado">8. Cancelado</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones Internas del Taller
              </label>
              <input
                type="text"
                placeholder="Ej: Esperando bobina de filamento; impreso en la Ender 3 v3..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs md:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-amber-500"
            >
              {orderToEdit ? 'Guardar Cambios' : 'Confirmar y Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
