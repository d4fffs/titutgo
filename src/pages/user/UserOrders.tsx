import { useState } from 'react';
import { Bike, ChevronDown, ChevronUp, MapPin, Building2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import { ORDER_STATUS_LABELS, STATUS_TIMELINE, isCancellable } from '../../utils/orderTransitions';
import type { Order } from '../../types';

function OrderTimeline({ order }: { order: Order }) {
  return (
    <div className="timeline" style={{ marginTop: 14 }}>
      {STATUS_TIMELINE.map((status, idx) => {
        const histEntry = order.statusHistory.find((h) => h.status === status);
        const isCurrent = order.status === status;
        const isDone = order.statusHistory.some((h) => h.status === status);
        const isLast = idx === STATUS_TIMELINE.length - 1;
        return (
          <div key={status} className="timeline-item">
            <div className="timeline-line">
              <div className={`timeline-dot ${isCurrent ? 'active' : isDone ? 'completed' : ''}`} />
              {!isLast && <div className={`timeline-connector ${isDone ? 'completed' : ''}`} />}
            </div>
            <div className="timeline-content">
              <div className="timeline-label" style={{ color: isDone ? 'var(--color-neutral-800)' : 'var(--color-neutral-400)', fontWeight: 700 }}>
                {ORDER_STATUS_LABELS[status]}
                {isCurrent && (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 10,
                    fontWeight: 800,
                    background: 'var(--color-navy)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}>
                    SAAT INI
                  </span>
                )}
              </div>
              {histEntry && (
                <div className="timeline-time">
                  {new Date(histEntry.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {order.status === 'cancelled' && (
        <div className="timeline-item">
          <div className="timeline-line">
            <div className="timeline-dot cancelled" />
          </div>
          <div className="timeline-content">
            <div className="timeline-label" style={{ color: 'var(--color-danger)', fontWeight: 700 }}>Dibatalkan</div>
            {order.statusHistory.filter(h => h.status === 'cancelled').map((h, i) => (
              <div key={i} className="timeline-time">
                {new Date(h.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                {h.note && <> — {h.note}</>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SiTitutMessage({ status }: { status: string }) {
  const messages: Record<string, { text: string; mood: 'happy' | 'thinking' | 'sad' | 'wave' | 'delivering' | 'excited' }> = {
    pending_courier: { text: 'SiTitut lagi carikan kawan kurir mahasiswa terdekat ya! Tunggu bentar 🔍', mood: 'thinking' },
    courier_assigned: { text: 'Kurir sudah menerima pesanan dan menuju ke kantin! 🛵', mood: 'happy' },
    purchasing_food: { text: 'Makanan lagi dimasak & dikemas hangat di kantin! 🍲', mood: 'delivering' },
    ready_for_delivery: { text: 'Makanan siap! Kurir bersiap meluncur ke gedungmu! ⚡', mood: 'excited' },
    delivering: { text: 'Gaspol! Kurir lagi ngebut antar ke titik temumu 🛵💨', mood: 'delivering' },
    completed: { text: 'Pesanan telah sampai dengan selamat! Selamat menikmati ya rek! 😋🎉', mood: 'happy' },
    cancelled: { text: 'Pesanan dibatalkan. SiTitut sedih, tapi gapapa coba pesan lagi nanti ya! 🥺', mood: 'sad' },
  };
  const msg = messages[status];
  if (!msg) return null;
  return (
    <div
      className="duo-speech-bubble left-tail"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        marginBottom: 16,
        background: '#FFFFFF',
      }}
    >
      <SiTitutMascot size={42} mood={msg.mood} animated />
      <span style={{ fontSize: 13, color: 'var(--color-navy)', fontWeight: 700, lineHeight: 1.45 }}>
        {msg.text}
      </span>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { state, transitionOrder } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const canteen = state.canteens.find((c) => c.id === order.canteenId);
  const courier = state.couriers.find((c) => c.id === order.courierId);

  const handleCancel = () => {
    transitionOrder(order.id, 'cancelled', undefined, 'Dibatalkan oleh pengguna');
    showToast('Pesanan dibatalkan', 'success');
    setShowCancelConfirm(false);
  };

  return (
    <>
      <div className="bento-card" style={{ padding: '20px 22px' }}>
        <div className="order-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="order-id">{order.id}</span>
              <span style={{ fontSize: 11, color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <SiTitutMessage status={order.status} />

        {/* Items summary */}
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: 10 }}>
          {order.items.map((item, idx) => {
            const food = state.foodItems.find((f) => f.id === item.foodItemId);
            return (
              <span key={idx}>
                {idx > 0 && ', '}
                {food?.name ?? item.foodItemId} <span style={{ color: 'var(--color-accent-dark)', fontWeight: 800 }}>×{item.quantity}</span>
              </span>
            );
          })}
        </div>

        {/* Location & Courier Info */}
        <div style={{
          display: 'flex',
          gap: 14,
          marginBottom: 16,
          fontSize: 12,
          color: 'var(--color-neutral-500)',
          flexWrap: 'wrap',
          background: 'var(--color-neutral-50)',
          padding: '10px 14px',
          borderRadius: 14,
        }}>
          {canteen && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={13} color="var(--color-accent)" /> Kantin: {canteen.name}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} color="#EA580C" /> Tujuan: {order.deliveryPoint}</span>
          {order.deliveryDistanceKm && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16A34A', fontWeight: 800 }}>
              🛵 Jarak Rute: {order.deliveryDistanceKm} km
            </span>
          )}
          {courier && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bike size={13} color="#16A34A" /> Kurir: {courier.name}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 10, color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pembayaran</span>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-navy)' }}>{formatIDR(order.total)}</div>
          </div>

          <button
            className="btn-pill"
            onClick={() => setExpanded(!expanded)}
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            {expanded ? (
              <><span>Tutup</span> <ChevronUp size={14} /></>
            ) : (
              <><span>Rincian & Lacak</span> <ChevronDown size={14} /></>
            )}
          </button>
        </div>

        {/* Expanded: Price breakdown & Timeline */}
        {expanded && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-neutral-100)' }}>
            {/* Price breakdown box */}
            <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: 12.5 }}>
              <div style={{ fontWeight: 800, color: '#0F1E3D', marginBottom: 6 }}>Rincian Biaya Transparan</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: 3 }}>
                <span>Harga Makanan</span>
                <span style={{ fontWeight: 700, color: '#0F1E3D' }}>{formatIDR(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: 3 }}>
                <span>Ongkir Rute Pengiriman {order.deliveryDistanceKm ? `(${order.deliveryDistanceKm} km)` : ''}</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>{formatIDR(order.serviceFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F1E3D', fontWeight: 900, paddingTop: 6, borderTop: '1px solid #E2E8F0', marginTop: 4 }}>
                <span>Total Pembayaran</span>
                <span>{formatIDR(order.total)}</span>
              </div>
              {order.deliveryNotes && (
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 8, fontStyle: 'italic' }}>
                  Catatan Pengantaran: {order.deliveryNotes}
                </div>
              )}
            </div>

            {courier && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 14px', background: 'var(--color-accent-light)', borderRadius: 14 }}>
                <Bike size={16} color="var(--color-accent-dark)" />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-navy)' }}>Kurir Mitra: {courier.name}</span>
              </div>
            )}
            <OrderTimeline order={order} />
            {isCancellable(order.status) && (
              <button
                className="btn btn-danger btn-sm"
                style={{ marginTop: 14, borderRadius: 9999, padding: '6px 16px' }}
                onClick={() => setShowCancelConfirm(true)}
              >
                Batalkan Pesanan Ini
              </button>
            )}
          </div>
        )}
      </div>

      {showCancelConfirm && (
        <ConfirmDialog
          title="Batalkan Pesanan"
          message={`Yakin ingin membatalkan pesanan ${order.id}?`}
          confirmLabel="Ya, Batalkan"
          onConfirm={handleCancel}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export function UserOrders() {
  const { state, currentUser } = useApp();
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  const userOrders = state.orders
    .filter((o) => o.userId === currentUser?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const activeOrders = userOrders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const displayed = filter === 'active' ? activeOrders : userOrders;

  return (
    <div style={{ width: '100%', paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D' }}>
            Pesanan Saya
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            Pantau status dan riwayat jastip makananmu.
          </p>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`chip ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
            Aktif {activeOrders.length > 0 && `(${activeOrders.length})`}
          </button>
          <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Riwayat ({userOrders.length})
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="bento-card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 12 }}>
            <SiTitutMascot size={72} mood="sad" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F1E3D', marginBottom: 6 }}>
            {filter === 'active' ? 'Tidak Ada Pesanan Aktif' : 'Belum Ada Riwayat'}
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', maxWidth: 320, margin: '0 auto 16px' }}>
            {filter === 'active' ? 'Semua pesananmu sudah selesai diantar.' : 'Pesan makanan lezat dari kantin kampus sekarang!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayed.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
