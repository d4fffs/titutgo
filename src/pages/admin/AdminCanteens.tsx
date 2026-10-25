import { useState } from 'react';
import { Plus, Pencil, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import type { Canteen } from '../../types';

interface CanteenFormData {
  name: string;
  description: string;
  location: string;
  isActive: boolean;
}

function CanteenModal({
  canteen,
  onSave,
  onClose,
}: {
  canteen: Canteen | null;
  onSave: (data: CanteenFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CanteenFormData>({
    name: canteen?.name ?? '',
    description: canteen?.description ?? '',
    location: canteen?.location ?? '',
    isActive: canteen?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CanteenFormData, string>>>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.location.trim()) e.location = 'Lokasi wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(form);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{canteen ? 'Edit Kantin' : 'Tambah Kantin'}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nama Kantin *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Deskripsi</label>
              <textarea className="form-input form-textarea" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Lokasi *</label>
              <input className="form-input" value={form.location} placeholder="Contoh: Gedung A Lantai 1" onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="toggle">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Kantin Aktif</span>
            </div>
            {!form.isActive && (
              <p style={{ fontSize: 12, color: 'var(--color-warning)', background: 'var(--color-warning-light)', padding: '8px 12px', borderRadius: 6 }}>
                Kantin yang tidak aktif tidak dapat menerima pesanan baru dari pengguna.
              </p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminCanteens() {
  const { state, addCanteen, updateCanteen } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [editCanteen, setEditCanteen] = useState<Canteen | null | undefined>(undefined);

  const handleSave = (data: CanteenFormData) => {
    if (editCanteen) {
      updateCanteen({ ...editCanteen, ...data });
      showToast('Kantin diperbarui', 'success');
    } else {
      addCanteen(data);
      showToast('Kantin ditambahkan', 'success');
    }
    setEditCanteen(undefined);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
            Manajemen Kantin Kampus 🏢
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
            {state.canteens.length} kantin mitra resmi terdaftar di area PENS Sukolilo
          </p>
        </div>
        <button
          className="btn btn-accent"
          style={{ padding: '10px 18px', fontSize: 13.5, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setEditCanteen(null)}
        >
          <Plus size={16} /> Tambah Kantin Baru 🏪
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {state.canteens.map((canteen) => {
          const itemCount = state.foodItems.filter((f) => f.canteenId === canteen.id).length;
          const activeOrders = state.orders.filter((o) => o.canteenId === canteen.id && !['completed', 'cancelled'].includes(o.status)).length;

          return (
            <div key={canteen.id} className="bento-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: '#0F1E3D' }}>{canteen.name}</span>
                    <span className={`badge ${canteen.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 11 }}>
                      {canteen.isActive ? '🟢 Aktif Buka' : '🔴 Tutup'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 600 }}>{canteen.description}</p>
                  <p style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>📍 {canteen.location}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
                    <span className="badge badge-primary" style={{ fontSize: 11.5 }}>
                      🍴 {itemCount} Menu Makanan
                    </span>
                    {activeOrders > 0 && (
                      <span className="badge badge-accent" style={{ fontSize: 11.5 }}>
                        ⚡ {activeOrders} Pesanan Sedang Diproses
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '8px 14px', fontSize: 12.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setEditCanteen(canteen)}
                  >
                    <Pencil size={13} /> Edit Kantin
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editCanteen !== undefined && (
        <CanteenModal
          canteen={editCanteen}
          onSave={handleSave}
          onClose={() => setEditCanteen(undefined)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
