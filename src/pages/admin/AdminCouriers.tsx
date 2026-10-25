import { useState } from 'react';
import { Eye, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import type { Courier } from '../../types';

function CourierDetailModal({ courier, onClose }: { courier: Courier; onClose: () => void }) {
  const { state } = useApp();
  const assigned = state.orders.filter((o) => o.courierId === courier.id);
  const active = assigned.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const completed = assigned.filter((o) => o.status === 'completed');
  const earnings = completed.reduce((s, o) => s + o.serviceFee, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{courier.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>NIM: {courier.studentId}</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label">Total Antar</div>
              <div className="stat-card-value" style={{ fontSize: 20 }}>{assigned.length}</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label">Selesai</div>
              <div className="stat-card-value" style={{ fontSize: 20, color: 'var(--color-success)' }}>{completed.length}</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label">Pendapatan</div>
              <div className="stat-card-value" style={{ fontSize: 16 }}>{formatIDR(earnings)}</div>
            </div>
          </div>

          {active.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: 8 }}>Pesanan Aktif ({active.length})</div>
              {active.map((o) => {
                const user = state.users.find((u) => u.id === o.userId);
                return (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-navy)' }}>{o.id}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginLeft: 8 }}>• {user?.name}</span>
                    </div>
                    <StatusBadge status={o.status} size="sm" />
                  </div>
                );
              })}
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: 8 }}>Pesanan Selesai ({completed.length})</div>
              {completed.map((o) => {
                const user = state.users.find((u) => u.id === o.userId);
                return (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-navy)' }}>{o.id}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginLeft: 8 }}>• {user?.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>+{formatIDR(o.serviceFee)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {assigned.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--color-neutral-500)', textAlign: 'center', padding: '16px 0' }}>Belum ada pesanan yang ditangani</p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

export function AdminCouriers() {
  const { state, updateCourier } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);

  const handleToggleEnabled = (courier: Courier) => {
    const hasActiveOrders = state.orders.some(
      (o) => o.courierId === courier.id && !['completed', 'cancelled'].includes(o.status)
    );
    if (courier.isEnabled && hasActiveOrders) {
      showToast('Kurir memiliki pesanan aktif. Pesanan tersebut tidak akan terpengaruh.', 'info');
    }
    updateCourier({ ...courier, isEnabled: !courier.isEnabled });
    showToast(`Kurir ${courier.isEnabled ? 'dinonaktifkan' : 'diaktifkan'}`, 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
            Manajemen Kurir Mahasiswa 🛵
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
            {state.couriers.length} kurir mitra terdaftar di sistem TitutGo kampus PENS
          </p>
        </div>
        <span className="badge badge-accent" style={{ fontSize: 12, fontWeight: 900 }}>
          {state.couriers.filter(c => c.isAvailable && c.isEnabled).length} Kurir Standby
        </span>
      </div>

      <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Kurir</th>
                <th>NIM</th>
                <th>Ketersediaan</th>
                <th>Pesanan Aktif</th>
                <th>Selesai</th>
                <th>Total Komisi</th>
                <th>Status Akun</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {state.couriers.map((courier) => {
                const orders = state.orders.filter((o) => o.courierId === courier.id);
                const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
                const completedOrders = orders.filter((o) => o.status === 'completed');
                const earnings = completedOrders.reduce((s, o) => s + o.serviceFee, 0);

                return (
                  <tr key={courier.id}>
                    <td style={{ fontWeight: 900, color: '#0F1E3D' }}>{courier.name}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#64748B' }}>{courier.studentId}</td>
                    <td>
                      <span className={`badge ${courier.isAvailable ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 11 }}>
                        {courier.isAvailable ? '🟢 Siap Antar' : '⚪ Istirahat'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 900, color: activeOrders.length > 0 ? '#0265DC' : '#64748B' }}>
                      {activeOrders.length > 0 ? `⚡ ${activeOrders.length} Order` : '0'}
                    </td>
                    <td style={{ fontWeight: 800 }}>{completedOrders.length}</td>
                    <td style={{ fontWeight: 900, color: '#16A34A' }}>{formatIDR(earnings)} 🪙</td>
                    <td>
                      <span className={`badge ${courier.isEnabled ? 'badge-primary' : 'badge-danger'}`} style={{ fontSize: 11 }}>
                        {courier.isEnabled ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          className="btn-pill"
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center' }}
                          onClick={() => setSelectedCourier(courier)}
                          title="Lihat detail kurir"
                        >
                          <Eye size={14} color="#0265DC" />
                        </button>
                        <button
                          className={`btn btn-sm ${courier.isEnabled ? 'btn-outline' : 'btn-accent'}`}
                          style={{ padding: '6px 12px', fontSize: 11.5, fontWeight: 800 }}
                          onClick={() => handleToggleEnabled(courier)}
                        >
                          {courier.isEnabled ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCourier && (
        <CourierDetailModal courier={selectedCourier} onClose={() => setSelectedCourier(null)} />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
