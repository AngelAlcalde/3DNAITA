/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Radio, Shield, Globe, Menu } from 'lucide-react';
import { UserAccount, SystemConfig } from '../types';
import { getSupabaseConfig } from '../lib/supabase';

interface HeaderProps {
  config: SystemConfig;
  activeUser: UserAccount;
  onOpenNewOrder: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  currentViewTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  activeUser,
  onOpenNewOrder,
  onToggleSidebar,
  onOpenSettings,
  onOpenLogin,
  currentViewTitle,
}) => {
  const { isConfigured } = getSupabaseConfig();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Zone 1: Mobile toggle & Breadcrumb / Section title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-purple-900 rounded-lg md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-purple-950 tracking-tight hidden sm:inline">3DNA</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="font-semibold text-slate-800 truncate text-base md:text-lg">
            {currentViewTitle}
          </h1>
        </div>
      </div>

      {/* Zone 2: Realtime sync indicator & Mode badge */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
            isConfigured
              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
          title="Ver estado de base de datos"
        >
          <Radio className={`w-3.5 h-3.5 ${isConfigured ? 'text-cyan-600 animate-pulse' : 'text-amber-600'}`} />
          <span className="font-medium whitespace-nowrap">
            {isConfigured ? 'Supabase Realtime Online' : 'Modo Local / Pestañas Sincronizadas'}
          </span>
        </button>

        <div className="flex items-center gap-1.5 text-slate-600">
          {config.accessMode === 'abierta' ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              <Globe className="w-3 h-3" /> Acceso Abierto
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium border border-purple-200">
              <Shield className="w-3 h-3" /> Modo Privado
            </span>
          )}
        </div>
      </div>

      {/* Zone 3: 1 Primary Action + User Profile button */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-1.5 px-3.5 md:px-4 py-2 text-xs md:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-sm rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nuevo Pedido</span>
        </button>

        <button
          onClick={onOpenLogin}
          className="flex items-center gap-2 p-1 md:px-3 md:py-1.5 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors text-left"
          title="Cambiar usuario o modalidad"
        >
          <div className="w-7 h-7 rounded-md bg-purple-900 text-white flex items-center justify-center font-bold text-xs shadow-inner">
            {activeUser.name.charAt(0)}
          </div>
          <div className="hidden xl:block">
            <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
              {activeUser.name}
            </p>
            <p className="text-[10px] text-purple-700 font-medium leading-none mt-1">
              {activeUser.role}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};
