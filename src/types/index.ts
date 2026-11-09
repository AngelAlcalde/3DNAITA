/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OrderStatus =
  | 'Recibido'
  | 'Pendiente de confirmación'
  | 'Pendiente de producción'
  | 'En producción'
  | 'Terminado'
  | 'Listo para retirar'
  | 'Entregado'
  | 'Cancelado';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "PED-001"
  createdAt: string; // ISO string
  clientName: string;
  clientPhone: string;
  productName: string;
  productId?: string;
  description: string;
  quantity: number;
  color: string;
  material: string; // PLA, PETG, ABS, TPU, Resina, etc.
  estimatedDeliveryDate: string; // YYYY-MM-DD
  costPrice: number; // Costo estimado unitario
  retailPrice: number; // Precio minorista unitario de lista
  wholesalePrice: number; // Precio mayorista unitario de lista
  agreedPrice: number; // Precio unitario o total acordado final
  totalAgreed: number; // agreedPrice * quantity
  deposit: number; // Seña recibida
  pendingBalance: number; // totalAgreed - deposit
  status: OrderStatus;
  notes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  material: string;
  manufacturingCost: number; // Costo de fabricación
  retailPrice: number; // Precio minorista sugerido
  wholesalePrice: number; // Precio mayorista sugerido
  retailMarginPercent: number; // ((retail - cost) / cost) * 100
  wholesaleMarginPercent: number; // ((wholesale - cost) / cost) * 100
  printTimeHours?: number; // Tiempo estimado de impresión
  filamentWeightGrams?: number; // Peso en gramos
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  pendingBalance: number;
}

export type PaymentMethod =
  | 'Efectivo'
  | 'Transferencia / Mercado Pago'
  | 'Tarjeta de Débito'
  | 'Tarjeta de Crédito'
  | 'Otro';

export interface Income {
  id: string;
  date: string; // YYYY-MM-DD
  orderId?: string;
  orderNumber?: string;
  clientName: string;
  concept: string; // "Seña pedido #PED-001", "Cancelación saldo", etc.
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type ExpenseType = 'Operativo' | 'Equipamiento';

export interface ExpenseCategory {
  id: string;
  name: string;
  isEquipment: boolean; // Si es inversión en maquinaria/equipamiento
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  categoryName: string;
  expenseType: ExpenseType; // Operativo vs Equipamiento
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface FinancialMovement {
  id: string;
  date: string;
  concept: string;
  movementType: 'Ingreso cobrado' | 'Venta acordada pendiente' | 'Gasto operativo' | 'Compra equipamiento';
  amount: number;
  orderId?: string;
  orderNumber?: string;
  isPositive: boolean;
}

export type UserRole = 'Administrador' | 'Operador' | 'Consulta';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
}

export type AccessMode = 'abierta' | 'privada';

export interface SystemConfig {
  businessName: string;
  slogan: string;
  location: string;
  logoUrl: string;
  currencySymbol: string;
  accessMode: AccessMode;
  supabaseUrl: string;
  supabaseAnonKey: string;
  enableRealtime: boolean;
  alertDaysThreshold: number; // Días para alertar entregas próximas (ej: 3)
}
