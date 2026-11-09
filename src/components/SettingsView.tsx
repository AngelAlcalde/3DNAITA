/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Shield,
  Globe,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Users,
  KeyRound,
  FileCode,
  MapPin,
} from 'lucide-react';
import { SystemConfig, UserAccount, AccessMode } from '../types';
import { testSupabaseConnection } from '../lib/supabase';
import { exportBackupJSON, importBackupJSON, resetToSeedData } from '../lib/storage';

interface SettingsViewProps {
  config: SystemConfig;
  users: UserAccount[];
  activeUser: UserAccount;
  onUpdateConfig: (updates: Partial<SystemConfig>) => void;
  onCreateUser: (user: any) => void;
  onDeleteUser: (id: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  users,
  activeUser,
  onUpdateConfig,
  onCreateUser,
  onDeleteUser,
}) => {
  const [businessName, setBusinessName] = useState(config.businessName);
  const [slogan, setSlogan] = useState(config.slogan);
  const [location, setLocation] = useState(config.location);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl);
  const [currencySymbol, setCurrencySymbol] = useState(config.currencySymbol);
  const [accessMode, setAccessMode] = useState<AccessMode>(config.accessMode);
  const [alertDaysThreshold, setAlertDaysThreshold] = useState<number>(config.alertDaysThreshold);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.supabaseAnonKey);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Notifications
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // User management form
  const [newUsername, setNewUsername] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Administrador' | 'Operador' | 'Consulta'>('Operador');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      businessName,
      slogan,
      location,
      logoUrl,
      currencySymbol,
      accessMode,
      alertDaysThreshold: Number(alertDaysThreshold) || 3,
      supabaseUrl,
      supabaseAnonKey,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setTestResult({
        success: false,
        message: 'Por favor ingresa la Project URL y la anon / public key de Supabase.',
      });
      return;
    }
    setTestingSupabase(true);
    setTestResult(null);
    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestingSupabase(false);
    setTestResult(res);
  };

  const handleCopySql = () => {
    const sqlScript = `-- 3DNA Base de Datos en Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto en https://supabase.com
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.pedidos (
  id TEXT PRIMARY KEY DEFAULT ('ord-' || uuid_generate_v4()::text),
  order_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  color TEXT NOT NULL DEFAULT 'Blanco',
  material TEXT NOT NULL DEFAULT 'PLA',
  estimated_delivery_date DATE NOT NULL,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  retail_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  wholesale_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  agreed_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_agreed NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  deposit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  pending_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'Recibido',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ingresos (
  id TEXT PRIMARY KEY DEFAULT ('inc-' || uuid_generate_v4()::text),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_id TEXT,
  order_number TEXT,
  client_name TEXT NOT NULL,
  concept TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gastos (
  id TEXT PRIMARY KEY DEFAULT ('exp-' || uuid_generate_v4()::text),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id TEXT,
  category_name TEXT NOT NULL,
  expense_type TEXT NOT NULL DEFAULT 'Operativo',
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.productos (
  id TEXT PRIMARY KEY DEFAULT ('prod-' || uuid_generate_v4()::text),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  material TEXT NOT NULL,
  manufacturing_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  retail_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  wholesale_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  retail_margin_percent NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  wholesale_margin_percent NUMERIC(8,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clientes (
  id TEXT PRIMARY KEY DEFAULT ('cli-' || uuid_generate_v4()::text),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  pending_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ingresos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gastos;`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadBackup = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3DNA_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJSON(content);
      alert(res.message);
    };
    reader.readAsText(file);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newUserName.trim()) return;

    onCreateUser({
      username: newUsername.trim(),
      name: newUserName.trim(),
      role: newUserRole,
    });

    setNewUsername('');
    setNewUserName('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Configuración del Sistema</h2>
          <p className="text-xs text-slate-500">
            Identidad del emprendimiento, conexión a Supabase, modalidad de acceso y respaldos.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ¡Configuración guardada!
          </span>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveGeneral} className="space-y-6">
        {/* 1. Identidad de 3DNA */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-700" />
            <span>1. Identidad del Emprendimiento</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Eslogan Oficial
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Localidad y Provincia
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Símbolo de Moneda (Pesos Argentinos)
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ruta o URL del Logo
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Modalidad de Acceso (Abierta vs Privada) */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-700" />
            <span>2. Modalidad de Acceso Online y Seguridad</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Modalidad Abierta */}
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                accessMode === 'abierta'
                  ? 'border-yellow-400 bg-yellow-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="accessMode"
                  value="abierta"
                  checked={accessMode === 'abierta'}
                  onChange={() => setAccessMode('abierta')}
                  className="text-yellow-500 focus:ring-yellow-400"
                />
                <Globe className="w-4 h-4 text-yellow-600" />
                <span className="font-bold text-xs md:text-sm text-slate-900">
                  Modalidad Abierta
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Permite el acceso directo desde el enlace sin necesidad de iniciar sesión. Ideal para compartir el enlace rápido entre celulares y taller.
              </p>
              <div className="mt-2 text-[11px] text-amber-800 font-medium">
                ⚠️ Toda la información comercial será visible para quienes tengan el link.
              </div>
            </label>

            {/* Modalidad Privada */}
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                accessMode === 'privada'
                  ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="accessMode"
                  value="privada"
                  checked={accessMode === 'privada'}
                  onChange={() => setAccessMode('privada')}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <Shield className="w-4 h-4 text-purple-700" />
                <span className="font-bold text-xs md:text-sm text-slate-900">
                  Modalidad Privada
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requiere usuario y contraseña. Solo los usuarios autorizados (Administrador, Operador, Consulta) pueden ingresar y realizar modificaciones según su rol.
              </p>
              <div className="mt-2 text-[11px] text-purple-700 font-medium">
                🔒 Mayor seguridad para datos financieros y operaciones del taller.
              </div>
            </label>
          </div>
        </div>

        {/* 3. Conexión a Base de Datos en Supabase (PostgreSQL & Realtime) */}
        <div className="p-5 bg-white rounded-xl border-2 border-cyan-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-950 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-600" />
              <span>3. Conexión a Base de Datos Supabase (Cloud & Realtime)</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              Vercel Ready
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Para que la información se guarde en la nube de forma permanente y se sincronice en vivo entre diferentes dispositivos (celulares, notebooks, computadoras del taller), ingresa tus credenciales de Supabase:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                VITE_SUPABASE_URL (Project URL)
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                VITE_SUPABASE_ANON_KEY (anon / public key)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Test connection & SQL button */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              disabled={testingSupabase}
              onClick={handleTestSupabase}
              className="px-4 py-2 text-xs font-bold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
              <span>{testingSupabase ? 'Probando Conexión...' : 'Probar Conexión con Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-slate-600" />
              <span>{copiedSql ? '¡Script SQL Copiado!' : 'Copiar Script SQL para Supabase'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Submit general settings button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs md:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-amber-500"
          >
            Guardar Configuración General
          </button>
        </div>
      </form>

      {/* 4. Administrador de Usuarios y Permisos */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-700" />
          <span>4. Usuarios del Sistema y Roles</span>
        </h3>

        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-purple-900 text-white flex items-center justify-center font-bold text-xs">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{u.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">@{u.username}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {u.role}
                </span>
                {users.length > 1 && (
                  <button
                    onClick={() => onDeleteUser(u.id)}
                    className="text-slate-400 hover:text-rose-600"
                    title="Eliminar usuario"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add user subform */}
        <form onSubmit={handleAddUser} className="pt-3 border-t border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-700 block">Crear Nuevo Usuario</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Nombre completo"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              required
              placeholder="Usuario (login)"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="Administrador">Administrador (Acceso Total)</option>
              <option value="Operador">Operador (Taller & Pedidos)</option>
              <option value="Consulta">Consulta (Visualizar & Exportar)</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-bold text-purple-950 bg-purple-100 hover:bg-purple-200 rounded-lg"
          >
            Añadir Usuario
          </button>
        </form>
      </div>

      {/* 5. Copia de Seguridad & Restauración */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Download className="w-4 h-4 text-purple-700" />
          <span>5. Copia de Seguridad & Respaldo (Backup)</span>
        </h3>

        <p className="text-xs text-slate-600">
          Descarga todos tus pedidos, clientes, precios e ingresos en un archivo seguro para respaldar tu negocio o transferir a otra computadora.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia de Seguridad (.json)</span>
          </button>

          <label className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Restaurar desde Archivo</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('¿Restablecer los datos de ejemplo del taller 3DNA en Itá Ibaté?')) {
                resetToSeedData();
              }
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Reiniciar con datos semilla de prueba
          </button>
        </div>
      </div>
    </div>
  );
};
