import { useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import { ORDER_STATUS_LABELS, STATUS_TIMELINE, isCancellable } from '../../utils/orderTransitions';
import type { Order, OrderStatus } from '../../types';

function OrderTimeline({ order }: { order: Order }) {
  return (
    <div className="timeline" style={{ marginTop: 12 }}>
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
              <div className="timeline-label" style={{ color: isDone ? 'var(--color-neutral-800)' : 'var(--color-neutral-400)' }}>
                {ORDER_STATUS_LABELS[status]}
              </div>
              {histEntry && (
                <div className="timeline-time">
                  {new Date(histEntry.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                  {histEntry.note && <span> — {histEntry.note}</span>}
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
            <div className="timeline-label" style={{ color: 'var(--color-danger)' }}>Dibatalkan</div>
            {order.statusHistory.filter(h => h.status === 'cancelled').map((h, i) => (
              <div key={i} className="timeline-time">
                {new Date(h.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                {h.note && <span> — {h.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onCancel }: { order: Order; onClose: () => void; onCancel: () => void }) {
  const { state } = useApp();
  const user = state.users.find((u) => u.id === order.userId);
  const courier = state.couriers.find((c) => c.id === order.courierId);
  const canteen = state.canteens.find((c) => c.id === order.canteenId);
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <div className="modal-title">Detail Pesanan</div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-navy)', fontWeight: 700 }}>{order.id}</div>
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Pelanggan</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1E3D' }}>{user?.name ?? '-'}</div>
                <div style={{ fontSize: 11.5, color: '#0265DC', fontWeight: 600 }}>
                  {user?.phone ? `📱 ${user.phone}` : user?.studentId ? `NIM: ${user.studentId}` : 'Pelanggan Umum'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Kurir</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1E3D' }}>{courier?.name ?? 'Belum ditugaskan'}</div>
                {courier && <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{courier.studentId}</div>}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Kantin Penjemputan</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{canteen?.name ?? '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Status Pesanan</div>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                  Alamat Tujuan & Rute Jarak
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1E3D' }}>📍 {order.deliveryPoint}</div>
                {order.deliveryDistanceKm && (
                  <div style={{ fontSize: 11.5, color: '#16A34A', fontWeight: 700, marginTop: 2 }}>
                    🛵 Jarak Pengiriman: {order.deliveryDistanceKm} km
                  </div>
                )}
                {order.deliveryNotes && <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>Catatan: {order.deliveryNotes}</div>}
              </div>
            </div>

            {/* Items */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: 8 }}>Item Pesanan</div>
              {order.items.map((item, idx) => {
                const food = state.foodItems.find((f) => f.id === item.foodItemId);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
                    <span style={{ fontSize: 13 }}>{food?.name ?? item.foodItemId} × {item.quantity}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{formatIDR(item.priceAtOrder * item.quantity)}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Subtotal Makanan</span>
                <span style={{ fontSize: 13 }}>{formatIDR(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>
                  Ongkir Jarak Rute {order.deliveryDistanceKm ? `(${order.deliveryDistanceKm} km)` : ''}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>{formatIDR(order.serviceFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Total Pembayaran</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-navy)' }}>{formatIDR(order.total)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: 8 }}>Riwayat Status</div>
              <OrderTimeline order={order} />
            </div>
          </div>
          <div className="modal-footer">
            {isCancellable(order.status) && (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmCancel(true)}>
                Batalkan Pesanan
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>
      {confirmCancel && (
        <ConfirmDialog
          title="Batalkan Pesanan"
          message={`Yakin ingin membatalkan pesanan ${order.id}? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Ya, Batalkan"
          onConfirm={() => { onCancel(); setConfirmCancel(false); }}
          onCancel={() => setConfirmCancel(false)}
        />
      )}
    </>
  );
}

export function AdminOrders() {
  const { state, transitionOrder } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [courierFilter, setCourierFilter] = useState<string>('all');
  const [canteenFilter, setCanteenFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const ALL_STATUSES: OrderStatus[] = [
    'pending_courier', 'courier_assigned', 'purchasing_food', 'ready_for_delivery', 'delivering', 'completed', 'cancelled'
  ];

  const filtered = state.orders.filter((o) => {
    const user = state.users.find((u) => u.id === o.userId);
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      (user?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchCourier = courierFilter === 'all' || o.courierId === courierFilter;
    const matchCanteen = canteenFilter === 'all' || o.canteenId === canteenFilter;
    return matchSearch && matchStatus && matchCourier && matchCanteen;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleCancel = (orderId: string) => {
    transitionOrder(orderId, 'cancelled', undefined, 'Dibatalkan oleh admin');
    setSelectedOrder(null);
    showToast('Pesanan dibatalkan', 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
            Manajemen Pesanan 📦
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
            Kelola dan pantau seluruh transaksi jastip makanan kampus PENS
          </p>
        </div>
        <span className="badge badge-primary" style={{ fontSize: 12, fontWeight: 900 }}>
          {filtered.length} / {state.orders.length} Pesanan
        </span>
      </div>

      {/* Filters with Chunky Duolingo inputs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} className="search-icon" />
          <input
            className="form-input search-input"
            style={{
              borderRadius: 14,
              border: 'none',
              boxShadow: '0 1px 3px rgba(15, 30, 61, 0.05)',
              fontWeight: 700,
            }}
            placeholder="Cari ID atau nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input form-select"
          value={canteenFilter}
          onChange={(e) => setCanteenFilter(e.target.value)}
          style={{
            width: 190,
            borderRadius: 14,
            border: 'none',
            boxShadow: '0 1px 3px rgba(15, 30, 61, 0.05)',
            fontWeight: 800,
          }}
        >
          <option value="all">Semua Kantin</option>
          {state.canteens.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="form-input form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          style={{
            width: 190,
            borderRadius: 14,
            border: 'none',
            boxShadow: '0 1px 3px rgba(15, 30, 61, 0.05)',
            fontWeight: 800,
          }}
        >
          <option value="all">Semua Status</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          className="form-input form-select"
          value={courierFilter}
          onChange={(e) => setCourierFilter(e.target.value)}
          style={{
            width: 190,
            borderRadius: 14,
            border: 'none',
            boxShadow: '0 1px 3px rgba(15, 30, 61, 0.05)',
            fontWeight: 800,
          }}
        >
          <option value="all">Semua Kurir</option>
          {state.couriers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 12.5, color: '#64748B', fontWeight: 700, marginBottom: 12 }}>
        Menampilkan {filtered.length} dari {state.orders.length} pesanan
      </p>

      {/* Desktop Table in Bento Card */}
      <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID Pesanan</th>
                <th>Waktu</th>
                <th>Pelanggan</th>
                <th>Kurir</th>
                <th>Titik Antar</th>
                <th>Total</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748B', fontWeight: 700 }}>Tidak ada pesanan ditemukan</td></tr>
              ) : filtered.map((order) => {
                const user = state.users.find((u) => u.id === order.userId);
                const courier = state.couriers.find((c) => c.id === order.courierId);
                return (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 900, color: '#0F1E3D' }}>{order.id}</span>
                    </td>
                    <td style={{ fontSize: 12, color: '#64748B', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}{' '}
                      {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: 800, color: '#0F1E3D' }}>{user?.name ?? '-'}</td>
                    <td style={{ fontSize: 12.5, color: '#0265DC', fontWeight: 700 }}>{courier?.name ?? '—'}</td>
                    <td style={{ fontSize: 12.5, maxWidth: 200, fontWeight: 600 }}>
                      <div className="truncate">📍 {order.deliveryPoint}</div>
                      {order.deliveryDistanceKm && (
                        <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700 }}>
                          🛵 {order.deliveryDistanceKm} km • Ongkir {formatIDR(order.serviceFee)}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 900, color: '#0F1E3D' }}>{formatIDR(order.total)}</td>
                    <td><StatusBadge status={order.status} size="sm" /></td>
                    <td>
                      <button
                        className="btn-pill"
                        style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setSelectedOrder(order)}
                        title="Lihat detail pesanan"
                      >
                        <Eye size={15} color="#0265DC" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={() => handleCancel(selectedOrder.id)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
