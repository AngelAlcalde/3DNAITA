/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Clock, Weight, ArrowUpDown } from 'lucide-react';
import { Product, SystemConfig } from '../types';
import { ProductModal } from './ProductModal';

interface ProductsViewProps {
  products: Product[];
  config: SystemConfig;
  onCreateProduct: (data: any) => void;
  onUpdateProduct: (id: string, updates: any) => void;
  onDeleteProduct: (id: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  config,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const currency = config.currencySymbol || '$';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (prod: Product) => {
    setProductToEdit(prod);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Productos y Lista de Precios</h2>
          <p className="text-xs text-slate-500">
            Catálogo habitual de impresiones 3D con cálculo automático de costos y márgenes de ganancia.
          </p>
        </div>

        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="py-2 px-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
        >
          <option value="todas">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const retailProfit = product.retailPrice - product.manufacturingCost;
          const wholesaleProfit = product.wholesalePrice - product.manufacturingCost;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-slate-400 hover:text-amber-700 rounded"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {product.description || 'Sin descripción detallada.'}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-600 mb-3">
                  <span>Material: <strong>{product.material}</strong></span>
                  {product.printTimeHours ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {product.printTimeHours}h
                    </span>
                  ) : null}
                  {product.filamentWeightGrams ? (
                    <span className="flex items-center gap-1">
                      <Weight className="w-3 h-3 text-slate-400" /> {product.filamentWeightGrams}g
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Pricing & Profit Box */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Costo Fabricación:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {currency}{product.manufacturingCost.toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <span className="text-slate-600">Minorista:</span>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-slate-900">
                      {currency}{product.retailPrice.toLocaleString('es-AR')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      +{currency}{retailProfit.toLocaleString('es-AR')} ({product.retailMarginPercent}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <span className="text-slate-600">Mayorista:</span>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-slate-900">
                      {currency}{product.wholesalePrice.toLocaleString('es-AR')}
                    </span>
                    <span className="text-[10px] text-cyan-700 font-bold block">
                      +{currency}{wholesaleProfit.toLocaleString('es-AR')} ({product.wholesaleMarginPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">¿Eliminar Producto?</h3>
            <p className="text-xs text-slate-600">
              ¿Estás seguro de que deseas eliminar <strong>{productToDelete.name}</strong> del catálogo?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          if (productToEdit) {
            onUpdateProduct(productToEdit.id, data);
          } else {
            onCreateProduct(data);
          }
        }}
        productToEdit={productToEdit}
        config={config}
      />
    </div>
  );
};
