-- ==============================================================================
-- 3DNA – SISTEMA DE GESTIÓN ONLINE DE IMPRESIÓN 3D
-- Script de Base de Datos PostgreSQL para Supabase
-- Hecho en Itá Ibaté, Corrientes, Argentina
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE CATEGORÍAS DE GASTOS
CREATE TABLE IF NOT EXISTS public.categorias_gastos (
  id TEXT PRIMARY KEY DEFAULT ('cat-' || uuid_generate_v4()::text),
  name TEXT NOT NULL,
  is_equipment BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE PRODUCTOS Y LISTA DE PRECIOS
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
  print_time_hours NUMERIC(6,2) DEFAULT 0.0,
  filament_weight_grams NUMERIC(8,2) DEFAULT 0.0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE CLIENTES
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

-- 5. TABLA DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.pedidos (
  id TEXT PRIMARY KEY DEFAULT ('ord-' || uuid_generate_v4()::text),
  order_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  product_name TEXT NOT NULL,
  product_id TEXT REFERENCES public.productos(id) ON DELETE SET NULL,
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
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA DE INGRESOS
CREATE TABLE IF NOT EXISTS public.ingresos (
  id TEXT PRIMARY KEY DEFAULT ('inc-' || uuid_generate_v4()::text),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_id TEXT REFERENCES public.pedidos(id) ON DELETE SET NULL,
  order_number TEXT,
  client_name TEXT NOT NULL,
  concept TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA DE GASTOS Y COMPRAS
CREATE TABLE IF NOT EXISTS public.gastos (
  id TEXT PRIMARY KEY DEFAULT ('exp-' || uuid_generate_v4()::text),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id TEXT REFERENCES public.categorias_gastos(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  expense_type TEXT NOT NULL DEFAULT 'Operativo', -- 'Operativo' o 'Equipamiento'
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA DE USUARIOS DEL SISTEMA
CREATE TABLE IF NOT EXISTS public.usuarios (
  id TEXT PRIMARY KEY DEFAULT ('usr-' || uuid_generate_v4()::text),
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Operador', -- 'Administrador', 'Operador', 'Consulta'
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABLA DE CONFIGURACIÓN
CREATE TABLE IF NOT EXISTS public.configuraciones (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- Habilitar RLS en todas las tablas
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuraciones ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para el acceso web de 3DNA (Modalidad Abierta / Clave Anónima)
CREATE POLICY "Acceso público lectura pedidos" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "Acceso público inserción pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acceso público actualización pedidos" ON public.pedidos FOR UPDATE USING (true);
CREATE POLICY "Acceso público eliminación pedidos" ON public.pedidos FOR DELETE USING (true);

CREATE POLICY "Acceso público lectura productos" ON public.productos FOR SELECT USING (true);
CREATE POLICY "Acceso público inserción productos" ON public.productos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acceso público actualización productos" ON public.productos FOR UPDATE USING (true);
CREATE POLICY "Acceso público eliminación productos" ON public.productos FOR DELETE USING (true);

CREATE POLICY "Acceso público lectura clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Acceso público inserción clientes" ON public.clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Acceso público actualización clientes" ON public.clientes FOR UPDATE USING (true);
CREATE POLICY "Acceso público eliminación clientes" ON public.clientes FOR DELETE USING (true);

CREATE POLICY "Acceso público lectura ingresos" ON public.ingresos FOR SELECT USING (true);
CREATE POLICY "Acceso público inserción ingresos" ON public.ingresos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acceso público actualización ingresos" ON public.ingresos FOR UPDATE USING (true);
CREATE POLICY "Acceso público eliminación ingresos" ON public.ingresos FOR DELETE USING (true);

CREATE POLICY "Acceso público lectura gastos" ON public.gastos FOR SELECT USING (true);
CREATE POLICY "Acceso público inserción gastos" ON public.gastos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acceso público actualización gastos" ON public.gastos FOR UPDATE USING (true);
CREATE POLICY "Acceso público eliminación gastos" ON public.gastos FOR DELETE USING (true);

CREATE POLICY "Acceso público lectura categorias" ON public.categorias_gastos FOR SELECT USING (true);
CREATE POLICY "Acceso público inserción categorias" ON public.categorias_gastos FOR INSERT WITH CHECK (true);

CREATE POLICY "Acceso público lectura usuarios" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "Acceso público lectura configuraciones" ON public.configuraciones FOR SELECT USING (true);

-- 11. HABILITAR REALTIME EN SUPABASE
-- Esto permite que cualquier cambio en las tablas se transmita en vivo
-- a todas las computadoras, notebooks, tablets y celulares conectados
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ingresos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gastos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.productos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;

-- 12. DATOS SEMILLA INICIALES (CATEGORÍAS DE GASTOS)
INSERT INTO public.categorias_gastos (id, name, is_equipment) VALUES
  ('cat-1', 'Filamentos (PLA, PETG, ABS, TPU)', false),
  ('cat-2', 'Repuestos (Boquillas, Hotends, Correas)', false),
  ('cat-3', 'Mantenimiento & Lubricación', false),
  ('cat-4', 'Herramientas (Calibres, Espátulas, Cortantes)', false),
  ('cat-5', 'Electricidad & Servicios', false),
  ('cat-6', 'Embalajes & Envíos', false),
  ('cat-7', 'Accesorios & Tornillería', false),
  ('cat-8', 'Publicidad & Redes Sociales', false),
  ('cat-9', 'Compra de Impresoras 3D', true),
  ('cat-10', 'Equipamiento de Taller (Estanterías, UPS)', true),
  ('cat-11', 'Otros Gastos', false)
ON CONFLICT (id) DO NOTHING;
