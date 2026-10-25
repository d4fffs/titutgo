import { useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import type { AppUser } from '../../types';

function UserDetailModal({ user, onClose }: { user: AppUser; onClose: () => void }) {
  const { state } = useApp();
  const orders = state.orders.filter((o) => o.userId === user.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>
              {user.phone ? `📱 ${user.phone}` : 'Tanpa No. HP'} {user.email ? `• ✉️ ${user.email}` : ''}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label">Total Pesanan</div>
              <div className="stat-card-value" style={{ fontSize: 20 }}>{orders.length}</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label">Status Akun</div>
              <div style={{ marginTop: 4 }}>
                <span className={`badge ${user.isActive ? 'status-completed' : 'status-cancelled'}`}>
                  {user.isActive ? 'Aktif' : 'Dinonaktifkan'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Operational Details */}
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 12.5 }}>
            <div style={{ fontWeight: 800, color: '#0F1E3D', marginBottom: 6 }}>Informasi Pelanggan</div>
            <div style={{ color: '#475569', marginBottom: 4 }}>
              <strong>Tipe:</strong> {user.studentId ? `Mahasiswa Sivitas (NIM: ${user.studentId})` : 'Masyarakat Umum'}
            </div>
            {user.savedAddresses && user.savedAddresses.length > 0 && (
              <div>
                <strong>Alamat Tersimpan:</strong>
                <ul style={{ paddingLeft: 18, margin: '4px 0 0' }}>
                  {user.savedAddresses.map((addr) => (
                    <li key={addr.id} style={{ color: '#64748B' }}>
                      <strong>{addr.label}:</strong> {addr.fullAddress} {addr.streetNotes ? `(${addr.streetNotes})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {orders.length > 0 ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: 8 }}>Riwayat Pesanan</div>
              {orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-navy)' }}>{o.id}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginLeft: 8 }}>• {formatIDR(o.total)}</span>
                    <div style={{ fontSize: 11, color: '#64748B' }}>📍 {o.deliveryPoint}</div>
                  </div>
                  <StatusBadge status={o.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--color-neutral-500)', textAlign: 'center' }}>Belum ada pesanan</p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const { state, updateUser } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const query = search.toLowerCase().trim();
  const filtered = state.users.filter((u) =>
    u.name.toLowerCase().includes(query) ||
    (u.phone && u.phone.includes(query)) ||
    (u.email && u.email.toLowerCase().includes(query)) ||
    (u.studentId && u.studentId.includes(query))
  );

  const handleToggle = (user: AppUser) => {
    updateUser({ ...user, isActive: !user.isActive });
    showToast(`Pengguna ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`, 'success');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
            Manajemen Pelanggan (Umum & Sivitas) 👥
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
            {state.users.length} akun pelanggan terdaftar untuk layanan jastip TitutGo
          </p>
        </div>
        <span className="badge badge-primary" style={{ fontSize: 12, fontWeight: 900 }}>
          {state.users.filter(u => u.isActive).length} Pengguna Aktif
        </span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-wrapper" style={{ maxWidth: 380 }}>
          <Search size={15} className="search-icon" />
          <input
            className="form-input search-input"
            style={{
              borderRadius: 14,
              border: 'none',
              boxShadow: '0 1px 3px rgba(15, 30, 61, 0.05)',
              fontWeight: 700,
            }}
            placeholder="Cari nama, no HP, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>Kontak HP & Email</th>
                <th>Tipe Pelanggan</th>
                <th>Total Pesanan</th>
                <th>Status Akun</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const orderCount = state.orders.filter((o) => o.userId === user.id).length;
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 900, color: '#0F1E3D' }}>{user.name}</div>
                      {user.savedAddresses && user.savedAddresses.length > 0 && (
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          📍 {user.savedAddresses[0].label}: {user.savedAddresses[0].fullAddress.slice(0, 32)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0265DC' }}>{user.phone || '-'}</div>
                      {user.email && <div style={{ fontSize: 11, color: '#64748B' }}>{user.email}</div>}
                    </td>
                    <td>
                      {user.studentId ? (
                        <span className="badge badge-primary" style={{ fontSize: 11 }}>
                          🎓 Sivitas (NIM {user.studentId})
                        </span>
                      ) : (
                        <span className="badge badge-accent" style={{ fontSize: 11 }}>
                          Masyarakat Umum
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 800 }}>{orderCount} Order</td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 11 }}>
                        {user.isActive ? '🟢 Aktif' : '🔴 Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          className="btn-pill"
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => setSelectedUser(user)}
                          title="Lihat detail pesanan pengguna"
                        >
                          <Eye size={13} /> Detail
                        </button>
                        <button
                          className={`btn-pill ${user.isActive ? 'btn-pill-danger' : 'btn-pill-success'}`}
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleToggle(user)}
                        >
                          {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
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

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
