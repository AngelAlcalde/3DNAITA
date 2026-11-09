/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  Columns3,
  Boxes,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  FileSpreadsheet,
  Settings,
  X,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { SystemConfig, UserAccount } from '../types';

export type NavigationTab =
  | 'dashboard'
  | 'orders'
  | 'kanban'
  | 'products'
  | 'clients'
  | 'incomes'
  | 'expenses'
  | 'finances'
  | 'export'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  activeUser: UserAccount;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  config,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    { id: 'orders', label: 'Gestión de Pedidos', icon: PackageCheck },
    { id: 'kanban', label: 'Tablero Producción', icon: Columns3 },
    { id: 'products', label: 'Productos & Precios', icon: Boxes },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'incomes', label: 'Ingresos & Señas', icon: ArrowDownLeft },
    { id: 'expenses', label: 'Gastos & Compras', icon: ArrowUpRight },
    { id: 'finances', label: 'Caja & Finanzas', icon: Wallet },
    { id: 'export', label: 'Exportación & Reportes', icon: FileSpreadsheet },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white flex flex-col border-r border-purple-800/40 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Header */}
        <div className="p-5 border-b border-purple-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-900/80 border border-purple-400/30 overflow-hidden shadow-lg flex items-center justify-center p-0.5 shrink-0">
              <img
                src={config.logoUrl || '/src/assets/images/logo_3dna_brand_1794182176233.jpg'}
                alt="3DNA Logo"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  // Fallback
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">3DNA</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-yellow-400 text-purple-950">
                  Lab
                </span>
              </div>
              <p className="text-[11px] font-medium text-cyan-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> {config.slogan || 'Hecho en Itá Ibaté'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-purple-300 hover:text-white rounded-lg md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Open Mode Disclaimer Banner */}
        {config.accessMode === 'abierta' && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-200 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <span className="leading-tight">
              <strong>Modalidad Abierta:</strong> La información comercial y financiera es compartida y visible para quienes tienen el enlace.
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-purple-950 font-bold shadow-md shadow-purple-950/20 translate-x-1'
                    : 'text-purple-200 hover:text-white hover:bg-purple-800/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-purple-950 stroke-[2.5]' : 'text-purple-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-purple-800/40 text-xs text-purple-300/80 bg-purple-950/60">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">3DNA Gestión v1.0</span>
            <span className="text-[10px] text-cyan-400">Online</span>
          </div>
          <p className="text-[11px] text-purple-300/70 mt-1">
            Itá Ibaté, Corrientes, Argentina
          </p>
        </div>
      </aside>
    </>
  );
};
