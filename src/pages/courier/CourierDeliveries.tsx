import { useState } from 'react';
import { MapPin, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import { getAvailableTransitions, ORDER_STATUS_LABELS, TRANSITION_LABELS } from '../../utils/orderTransitions';
import type { Order, OrderStatus } from '../../types';

function DeliveryCard({ order }: { order: Order }) {
  const { state, transitionOrder } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [expanded, setExpanded] = useState(true);
  const [confirmTransition, setConfirmTransition] = useState<OrderStatus | null>(null);

  const canteen = state.canteens.find((c) => c.id === order.canteenId);
  const availableTransitions = getAvailableTransitions(order.status, 'kurir');

  const handleTransition = (newStatus: OrderStatus) => {
    transitionOrder(order.id, newStatus);
    showToast(`Status diperbarui: ${ORDER_STATUS_LABELS[newStatus]}`, 'success');
    setConfirmTransition(null);
  };

  const getActionLabel = (status: OrderStatus): string => {
    return TRANSITION_LABELS[status] ?? ORDER_STATUS_LABELS[status];
  };

  const getActionVariant = (status: OrderStatus): string => {
    if (status === 'completed') return 'btn-accent';
    if (status === 'cancelled') return 'btn-danger';
    return 'btn-primary';
  };

  return (
    <>
      <div className="order-card" style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '18px 20px',
        boxShadow: '0 2px 12px rgba(15, 30, 61, 0.05)',
      }}>
        <div className="order-card-header" style={{ marginBottom: 12 }}>
          <div>
            <div className="order-id" style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D' }}>{order.id}</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
              {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusBadge status={order.status} />
            <button
              className="btn-pill"
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {expanded && (
          <>
            {/* Food items */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                ITEM PESANAN
              </div>
              {order.items.map((item, idx) => {
                const food = state.foodItems.find((f) => f.id === item.foodItemId);
                return (
                  <div key={idx} style={{ fontSize: 13.5, color: '#0F1E3D', fontWeight: 700, marginBottom: 3 }}>
                    🍴 {food?.name ?? item.foodItemId} × {item.quantity}
                  </div>
                );
              })}
            </div>

            {/* Locations */}
            <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 13.5 }}>
                <Store size={15} color="#0265DC" />
                <span style={{ fontWeight: 800, color: '#0F1E3D' }}>Ambil di: {canteen?.name ?? '-'}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginLeft: 23, marginBottom: 8, fontWeight: 600 }}>
                {canteen?.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
                <MapPin size={15} color="#EA580C" />
                <span style={{ fontWeight: 800, color: '#0F1E3D' }}>Antar ke: {order.deliveryPoint}</span>
              </div>
            </div>

            {order.deliveryNotes && (
              <div className="duo-speech-bubble" style={{
                marginBottom: 14,
                padding: '8px 12px',
                background: '#FEF3C7',
                borderColor: '#FDE68A',
                borderBottomColor: '#FCD34D',
                fontSize: 12,
                color: '#B45309',
                fontWeight: 700,
              }}>
                📝 Catatan: {order.deliveryNotes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, padding: '8px 0', borderTop: '2px dashed #E2E8F0' }}>
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>Komisi Jastip Kamu</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#16A34A' }}>+{formatIDR(order.serviceFee)} 🪙</span>
            </div>
          </>
        )}

        {/* Action Buttons */}
        {availableTransitions.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {availableTransitions.map((status) => (
              <button
                key={status}
                className={`btn btn-sm ${getActionVariant(status)}`}
                style={{ flex: 1, padding: '10px 14px', fontSize: 13, fontWeight: 900 }}
                onClick={() => setConfirmTransition(status)}
              >
                {getActionLabel(status)}
              </button>
            ))}
          </div>
        )}

        {order.status === 'completed' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            background: '#ECFDF5',
            borderRadius: 14,
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
          }}>
            <SiTitutMascot size={32} mood="happy" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#15803D' }}>
              Pengantaran selesai! +{formatIDR(order.serviceFee)} masuk dompetmu 🎉
            </span>
          </div>
        )}
      </div>

      {confirmTransition && (
        <ConfirmDialog
          title={getActionLabel(confirmTransition)}
          message={`Konfirmasi: ${getActionLabel(confirmTransition)} untuk pesanan ${order.id}?`}
          confirmLabel="Ya, Lanjutkan! 🚀"
          variant="primary"
          onConfirm={() => handleTransition(confirmTransition)}
          onCancel={() => setConfirmTransition(null)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export function CourierDeliveries() {
  const { state, currentCourier } = useApp();
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  const myOrders = state.orders.filter((o) => o.courierId === currentCourier?.id);
  const activeOrders = myOrders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const displayed = filter === 'active' ? activeOrders : myOrders;

  return (
    <div style={{ padding: '20px', maxWidth: 750, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>Pengantaran Saya 🛵</h2>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Daftar tugas jastip yang kamu tangani</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`chip ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
            ⚡ Aktif {activeOrders.length > 0 && `(${activeOrders.length})`}
          </button>
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            📋 Semua Riwayat
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="empty-state bento-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <SiTitutMascot size={72} mood="thinking" interactive />
          <div className="empty-state-title" style={{ fontSize: 18, fontWeight: 900, color: '#0F1E3D', marginTop: 14 }}>
            {filter === 'active' ? 'Tidak Ada Pengantaran Aktif' : 'Belum Ada Riwayat Pengantaran'}
          </div>
          <div className="duo-speech-bubble" style={{ marginTop: 12, display: 'inline-block', fontSize: 13, color: '#475569' }}>
            {filter === 'active' ? '"Yuk cek tab Cari Pesanan buat mulai ambil orderan baru!" 🛵' : '"Mulai antar pesanan untuk mengumpulkan komisi!" 🪙'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayed
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((order) => (
              <DeliveryCard key={order.id} order={order} />
            ))}
        </div>
      )}
    </div>
  );
}
