import type { OrderStatus } from '../../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/orderTransitions';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const label = ORDER_STATUS_LABELS[status];
  const colorClass = ORDER_STATUS_COLORS[status];
  return (
    <span className={`badge ${colorClass} ${size === 'sm' ? 'text-xs' : ''}`}>
      {label}
    </span>
  );
}
