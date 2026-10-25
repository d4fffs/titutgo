import type { OrderStatus, Role } from '../types';

// ─── Status Labels ────────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_courier: 'Menunggu Kurir',
  courier_assigned: 'Kurir Ditugaskan',
  purchasing_food: 'Sedang Beli Makanan',
  ready_for_delivery: 'Siap Dikirim',
  delivering: 'Dalam Pengantaran',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending_courier: 'status-pending',
  courier_assigned: 'status-assigned',
  purchasing_food: 'status-purchasing',
  ready_for_delivery: 'status-ready',
  delivering: 'status-delivering',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
};

// ─── Status Transitions ───────────────────────────────────────────────────────

// Valid transitions from each status
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_courier: ['courier_assigned', 'cancelled'],
  courier_assigned: ['purchasing_food', 'cancelled'],
  purchasing_food: ['ready_for_delivery', 'cancelled'],
  ready_for_delivery: ['delivering'],
  delivering: ['completed'],
  completed: [],
  cancelled: [],
};

// ─── Permission Rules ─────────────────────────────────────────────────────────

// Which transitions can each role trigger?
const ROLE_TRANSITION_PERMISSIONS: Record<Role, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  admin: {
    pending_courier: ['cancelled'],
    courier_assigned: ['cancelled'],
    purchasing_food: ['cancelled'],
  },
  kurir: {
    pending_courier: ['courier_assigned'],
    courier_assigned: ['purchasing_food'],
    purchasing_food: ['ready_for_delivery'],
    ready_for_delivery: ['delivering'],
    delivering: ['completed'],
  },
  user: {
    pending_courier: ['cancelled'],
    courier_assigned: ['cancelled'],
  },
};

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  role: Role
): boolean {
  const allowedForRole = ROLE_TRANSITION_PERMISSIONS[role][from] ?? [];
  return allowedForRole.includes(to);
}

export function getAvailableTransitions(
  status: OrderStatus,
  role: Role
): OrderStatus[] {
  return ROLE_TRANSITION_PERMISSIONS[role][status] ?? [];
}

export function isCancellable(status: OrderStatus): boolean {
  return ['pending_courier', 'courier_assigned', 'purchasing_food'].includes(status);
}

export function isTerminal(status: OrderStatus): boolean {
  return status === 'completed' || status === 'cancelled';
}

// ─── Transition Action Labels ─────────────────────────────────────────────────

export const TRANSITION_LABELS: Partial<Record<OrderStatus, string>> = {
  courier_assigned: 'Terima Pesanan',
  purchasing_food: 'Mulai Beli Makanan',
  ready_for_delivery: 'Makanan Siap',
  delivering: 'Mulai Antar',
  completed: 'Selesai Antar',
  cancelled: 'Batalkan Pesanan',
};

// ─── Status Order (for timeline display) ─────────────────────────────────────

export const STATUS_TIMELINE: OrderStatus[] = [
  'pending_courier',
  'courier_assigned',
  'purchasing_food',
  'ready_for_delivery',
  'delivering',
  'completed',
];
