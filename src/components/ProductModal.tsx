/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Product, SystemConfig } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  productToEdit?: Product | null;
  config: SystemConfig;
}

const PRODUCT_CATEGORIES = [
  'Articulados & Figuras',
  'Lámparas & Decoración',
  'Merchandising & Eventos',
  'Soportes & Ergonomía',
  'Hogar & Bazar',
  'Ingeniería & Prototipos',
  'Repuestos Técnicos',
  'Litofanías',
  'Otros',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  config,
}) => {
  const currency = config.currencySymbol || '$';

  const [name, setName] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('PLA Premium');
  const [manufacturingCost, setManufacturingCost] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [printTimeHours, setPrintTimeHours] = useState<number>(0);
  const [filamentWeightGrams, setFilamentWeightGrams] = useState<number>(0);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description || '');
      setMaterial(productToEdit.material);
      setManufacturingCost(productToEdit.manufacturingCost);
      setRetailPrice(productToEdit.retailPrice);
      setWholesalePrice(productToEdit.wholesalePrice);
      setPrintTimeHours(productToEdit.printTimeHours || 0);
      setFilamentWeightGrams(productToEdit.filamentWeightGrams || 0);
    } else {
      setName('');
      setCategory(PRODUCT_CATEGORIES[0]);
      setDescription('');
      setMaterial('PLA Premium');
      setManufacturingCost(2000);
      setRetailPrice(5000);
      setWholesalePrice(3800);
      setPrintTimeHours(4);
      setFilamentWeightGrams(100);
    }
  }, [productToEdit, isOpen]);

  // Calculations
  const retailProfit = Math.max(0, retailPrice - manufacturingCost);
  const wholesaleProfit = Math.max(0, wholesalePrice - manufacturingCost);
  const retailMarginPercent = manufacturingCost > 0
    ? ((retailProfit / manufacturingCost) * 100).toFixed(1)
    : '100.0';
  const wholesaleMarginPercent = manufacturingCost > 0
    ? ((wholesaleProfit / manufacturingCost) * 100).toFixed(1)
    : '100.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresa el nombre del producto.');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      description: description.trim(),
      material: material.trim(),
      manufacturingCost: Number(manufacturingCost) || 0,
      retailPrice: Number(retailPrice) || 0,
      wholesalePrice: Number(wholesalePrice) || 0,
      printTimeHours: Number(printTimeHours) || 0,
      filamentWeightGrams: Number(filamentWeightGrams) || 0,
      isActive: true,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {productToEdit ? 'Editar Producto del Catálogo' : 'Nuevo Producto / Lista de Precios'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Llaveros con Logo Personalizado"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Material habitual</label>
              <input
                type="text"
                placeholder="Ej: PLA Seda / PETG"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea
              rows={2}
              placeholder="Detalles sobre resolución, opciones de colores o medidas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Pricing Grid */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
            <span className="text-xs font-bold uppercase text-purple-900 block">
              Costos y Precios de Venta
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Costo Fabricación ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={manufacturingCost}
                  onChange={(e) => setManufacturingCost(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Precio Minorista ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Precio Mayorista ($)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Profit & Margin Display */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">
                  Ganancia Minorista:
                </span>
                <p className="text-base font-extrabold text-emerald-900 font-mono">
                  {currency}{retailProfit.toLocaleString('es-AR')}{' '}
                  <span className="text-xs font-normal text-emerald-700">({retailMarginPercent}%)</span>
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200">
                <span className="text-[11px] text-cyan-800 font-semibold block">
                  Ganancia Mayorista:
                </span>
                <p className="text-base font-extrabold text-cyan-900 font-mono">
                  {currency}{wholesaleProfit.toLocaleString('es-AR')}{' '}
                  <span className="text-xs font-normal text-cyan-700">({wholesaleMarginPercent}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Technical printing references */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Horas aprox. de impresión</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={printTimeHours}
                onChange={(e) => setPrintTimeHours(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Gramos aprox. de filamento</label>
              <input
                type="number"
                min="0"
                value={filamentWeightGrams}
                onChange={(e) => setFilamentWeightGrams(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
            >
              Guardar en Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
