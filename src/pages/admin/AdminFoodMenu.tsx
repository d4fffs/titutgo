import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import { FOOD_CATEGORY_LABELS } from '../../data/mockData';
import type { FoodItem, FoodCategory, Canteen } from '../../types';

const CATEGORIES: FoodCategory[] = ['makanan_berat', 'makanan_ringan', 'minuman', 'dessert', 'sarapan'];

interface FoodFormData {
  name: string;
  description: string;
  price: string;
  category: FoodCategory;
  canteenId: string;
  imageUrl: string;
  isAvailable: boolean;
}

function FoodItemModal({
  item,
  canteens,
  onSave,
  onClose,
}: {
  item: FoodItem | null;
  canteens: Canteen[];
  onSave: (data: FoodFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FoodFormData>({
    name: item?.name ?? '',
    description: item?.description ?? '',
    price: item?.price.toString() ?? '',
    category: item?.category ?? 'makanan_berat',
    canteenId: item?.canteenId ?? (canteens[0]?.id ?? ''),
    imageUrl: item?.imageUrl ?? '',
    isAvailable: item?.isAvailable ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FoodFormData, string>>>({});

  function validate(): boolean {
    const e: Partial<Record<keyof FoodFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Harga harus angka positif';
    if (!form.canteenId) e.canteenId = 'Pilih kantin';
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
          <span className="modal-title">{item ? 'Edit Item Makanan' : 'Tambah Item Makanan'}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nama Item *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Deskripsi</label>
              <textarea className="form-input form-textarea" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Harga (IDR) *</label>
                <input className="form-input" type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-input form-select" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value as FoodCategory }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{FOOD_CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Kantin *</label>
              <select className="form-input form-select" value={form.canteenId} onChange={(e) => setForm(f => ({ ...f, canteenId: e.target.value }))}>
                {canteens.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.canteenId && <span className="form-error">{errors.canteenId}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">URL Gambar</label>
              <input className="form-input" value={form.imageUrl} placeholder="https://..." onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="toggle">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm(f => ({ ...f, isAvailable: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Tersedia</span>
            </div>
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

export function AdminFoodMenu() {
  const { state, addFoodItem, updateFoodItem, deleteFoodItem } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editItem, setEditItem] = useState<FoodItem | null | undefined>(undefined); // undefined = closed
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = state.foodItems.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSave = (data: FoodFormData) => {
    if (editItem) {
      updateFoodItem({ ...editItem, ...data, price: Number(data.price) });
      showToast('Item diperbarui', 'success');
    } else {
      addFoodItem({ ...data, price: Number(data.price) });
      showToast('Item ditambahkan', 'success');
    }
    setEditItem(undefined);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteFoodItem(deleteId);
      showToast('Item dihapus', 'success');
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
            Katalog Menu Makanan 🍜
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
            Kelola daftar menu, harga, ketersediaan, dan tenant kantin
          </p>
        </div>
        <button
          className="btn btn-accent"
          style={{ padding: '10px 18px', fontSize: 13.5, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setEditItem(null)}
        >
          <Plus size={16} /> Tambah Menu Baru 🍰
        </button>
      </div>

      {/* Filters */}
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
            placeholder="Cari nama makanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input form-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            width: 190,
            borderRadius: 14,
            border: 'none',
            boxShadow: '0 1px 3px rgba(15, 30, 61, 0.05)',
            fontWeight: 800,
          }}
        >
          <option value="all">Semua Kategori</option>
          {Object.entries(FOOD_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Menu</th>
                <th>Kategori</th>
                <th>Kantin</th>
                <th>Harga</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748B', fontWeight: 700 }}>Tidak ada menu ditemukan</td></tr>
              ) : filtered.map((food) => {
                const canteen = state.canteens.find((c) => c.id === food.canteenId);
                return (
                  <tr key={food.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {food.imageUrl && (
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 12, border: '2px solid #E2E8F0' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 13.5, color: '#0F1E3D' }}>{food.name}</div>
                          <div style={{ fontSize: 11.5, color: '#64748B', maxWidth: 190 }} className="truncate">{food.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: 11, padding: '3px 8px' }}>
                        {FOOD_CATEGORY_LABELS[food.category]}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>{canteen?.name ?? '-'}</td>
                    <td style={{ fontWeight: 900, color: '#0F1E3D' }}>{formatIDR(food.price)}</td>
                    <td>
                      <span className={`badge ${food.isAvailable ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 11 }}>
                        {food.isAvailable ? '🟢 Tersedia' : '🔴 Habis'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn-pill"
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center' }}
                          onClick={() => setEditItem(food)}
                          title="Edit Menu"
                        >
                          <Pencil size={13} color="#0265DC" />
                        </button>
                        <button
                          className="btn-pill"
                          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', borderColor: '#FECACA' }}
                          onClick={() => setDeleteId(food.id)}
                          title="Hapus Menu"
                        >
                          <Trash2 size={13} color="#DC2626" />
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

      {editItem !== undefined && (
        <FoodItemModal
          item={editItem}
          canteens={state.canteens}
          onSave={handleSave}
          onClose={() => setEditItem(undefined)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Hapus Item"
          message="Yakin ingin menghapus item ini? Item yang dihapus tidak dapat dikembalikan."
          confirmLabel="Ya, Hapus"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
