/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Shield, KeyRound, Check, UserCheck, AlertCircle } from 'lucide-react';
import { UserAccount, SystemConfig } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  activeUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
  config: SystemConfig;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  activeUser,
  onSelectUser,
  config,
}) => {
  const [selectedUserId, setSelectedUserId] = useState(activeUser.id);
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.id === selectedUserId);
    if (user) {
      onSelectUser(user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-900 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Control de Acceso · 3DNA</h3>
              <p className="text-xs text-purple-700 font-medium">Hecho en Itá Ibaté</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {config.accessMode === 'abierta' ? (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <span>
              <strong>El sistema está en Modalidad Abierta.</strong> Puedes alternar entre perfiles para probar los permisos de Administrador, Operador y Consulta.
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-600">
            Selecciona tu cuenta de usuario para autenticarte en el sistema de gestión del taller:
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Usuario</label>
            <div className="space-y-1.5">
              {users.map((u) => {
                const isSelected = selectedUserId === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-xs md:text-sm text-slate-900 block leading-tight">
                          {u.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">@{u.username}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                        {u.role}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-purple-700 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Ingresa tu clave de acceso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              (Para demostración en AI Studio, cualquier contraseña es aceptada para cambiar de rol)
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
