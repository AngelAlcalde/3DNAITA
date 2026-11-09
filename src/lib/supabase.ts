/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Vite environment variables or runtime settings
let currentSupabaseClient: SupabaseClient | null = null;
let configuredUrl = import.meta.env.VITE_SUPABASE_URL || '';
let configuredAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  // Check localStorage for manually configured keys in Settings
  if (!configuredUrl && typeof window !== 'undefined') {
    const saved = localStorage.getItem('3dna_supabase_override');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey) {
          configuredUrl = parsed.url;
          configuredAnonKey = parsed.anonKey;
        }
      } catch (e) {
        console.error('Error parsing stored Supabase settings', e);
      }
    }
  }

  const isConfigured = Boolean(
    configuredUrl &&
    configuredAnonKey &&
    configuredUrl.startsWith('https://') &&
    configuredUrl.includes('.supabase.co') &&
    configuredAnonKey.length > 20
  );

  return {
    url: configuredUrl,
    anonKey: configuredAnonKey,
    isConfigured,
  };
}

export function initSupabase(url?: string, anonKey?: string): SupabaseClient | null {
  const targetUrl = url || configuredUrl;
  const targetKey = anonKey || configuredAnonKey;

  if (targetUrl && targetKey && targetUrl.startsWith('https://') && targetKey.length > 20) {
    try {
      currentSupabaseClient = createClient(targetUrl, targetKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      return currentSupabaseClient;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      currentSupabaseClient = null;
      return null;
    }
  }
  currentSupabaseClient = null;
  return null;
}

export function getSupabase(): SupabaseClient | null {
  if (!currentSupabaseClient) {
    const { url, anonKey, isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      return initSupabase(url, anonKey);
    }
  }
  return currentSupabaseClient;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; tablesFound?: string[] }> {
  try {
    const client = createClient(url, anonKey);
    // Attempt to query any existing table (e.g., 'pedidos' or system info)
    const { data, error } = await client.from('pedidos').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet, but client connected
      if (error.code === '42P01') {
        return {
          success: true,
          message: '¡Conectado exitosamente a Supabase! Aún no has ejecutado el script SQL para crear las tablas.',
        };
      }
      return {
        success: false,
        message: `Error al conectar con Supabase: ${error.message} (Código: ${error.code})`,
      };
    }

    return {
      success: true,
      message: '¡Conexión y tablas verificadas exitosamente en Supabase!',
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Error de red o conexión: ${errorMessage}`,
    };
  }
}
