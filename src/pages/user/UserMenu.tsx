import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import { FOOD_CATEGORY_LABELS } from '../../data/mockData';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { SafeImage } from '../../components/shared/SafeImage';
import { FoodDetailModal } from '../../components/shared/FoodDetailModal';
import type { FoodItem, FoodCategory } from '../../types';

interface UserMenuProps {
  initialCanteenId?: string;
  onSelectCanteen?: (canteenId: string) => void;
}

export function UserMenu({ initialCanteenId, onSelectCanteen }: UserMenuProps = {}) {
  const { state, addToCart } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const [search, setSearch] = useState('');
  const [canteenFilter, setCanteenFilter] = useState<string | 'all'>(initialCanteenId ?? 'all');
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const filtered = state.foodItems.filter((f) => {
    const canteen = state.canteens.find((c) => c.id === f.canteenId);
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      (canteen?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchCat = categoryFilter === 'all' || f.category === categoryFilter;
    const matchCanteen = canteenFilter === 'all' || f.canteenId === canteenFilter;
    return matchSearch && matchCat && matchCanteen;
  });

  const handleQuickAdd = (item: FoodItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const canteen = state.canteens.find((c) => c.id === item.canteenId);
    if (!item.isAvailable || !(canteen?.isActive)) {
      showToast('Item tidak tersedia', 'error');
      return;
    }
    addToCart(item.id);
    showToast(`${item.name} ditambahkan`, 'success');
  };

  const categories: FoodCategory[] = ['makanan_berat', 'makanan_ringan', 'minuman', 'dessert', 'sarapan'];

  return (
    <div style={{ width: '100%', paddingBottom: 48 }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D' }}>
          Menu Kantin
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
          Pesan makanan dan minuman favoritmu dari kantin kampus.
        </p>
      </div>

      {/* Search Input Pill */}
      <div style={{
        position: 'relative',
        marginBottom: 20,
      }}>
        <Search size={18} style={{
          position: 'absolute',
          left: 18,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748B',
        }} />
        <input
          style={{
            width: '100%',
            padding: '13px 20px 13px 48px',
            borderRadius: 9999,
            border: 'none',
            boxShadow: '0 2px 10px rgba(15, 30, 61, 0.05)',
            background: 'white',
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            outline: 'none',
            color: 'var(--color-navy)',
          }}
          placeholder="Cari makanan lezat atau kantin PENS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Canteen Filter Pills */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>PILIH KANTIN KAMPUS:</span>
          {canteenFilter !== 'all' && (
            <button
              onClick={() => setCanteenFilter('all')}
              style={{ background: 'none', border: 'none', color: '#0265DC', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', padding: 0 }}
            >
              Tampilkan Semua Kantin
            </button>
          )}
        </div>
        <div className="scroll-x-chips" style={{ paddingBottom: 8, marginBottom: 4 }}>
          <button
            onClick={() => setCanteenFilter('all')}
            className={`chip ${canteenFilter === 'all' ? 'active' : ''}`}
            style={{ flexShrink: 0 }}
          >
            Semua Kantin ({state.canteens.filter((c) => c.isActive).length})
          </button>
          {state.canteens.filter((c) => c.isActive).map((c) => {
            const isSelected = canteenFilter === c.id;
            const count = state.foodItems.filter((f) => f.canteenId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setCanteenFilter(c.id);
                  onSelectCanteen?.(c.id);
                }}
                className={`chip ${isSelected ? 'active' : ''}`}
                style={{ flexShrink: 0 }}
              >
                <span>{c.name.replace('FoodLAB PENS — ', '')}</span>
                <span style={{ fontSize: 11, opacity: 0.85 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="scroll-x-chips" style={{ marginBottom: 18, paddingBottom: 8 }}>
        <button
          className={`chip ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
          style={{ flexShrink: 0 }}
        >
          Semua ({state.foodItems.length})
        </button>
        {categories.map((cat) => {
          const count = state.foodItems.filter((f) => f.category === cat).length;
          return (
            <button
              key={cat}
              className={`chip ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
              style={{ flexShrink: 0 }}
            >
              {FOOD_CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-neutral-500)' }}>
          {filtered.length} menu tersedia
        </span>
      </div>

      {/* Food Grid */}
      {filtered.length === 0 ? (
        <div className="bento-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <SiTitutMascot size={64} />
          </div>
          <div className="empty-state-title" style={{ fontSize: 17, fontWeight: 800, color: '#0F1E3D' }}>Menu tidak ditemukan</div>
          <div className="empty-state-desc" style={{ margin: '8px auto 16px', color: '#64748B' }}>Coba cari dengan kata kunci lain atau ubah kategori kantin</div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearch('');
              setCategoryFilter('all');
              setCanteenFilter('all');
            }}
          >
            Reset Semua Filter & Pencarian
          </button>
        </div>
      ) : (
        <div className="food-grid-responsive">
          {filtered.map((item) => {
            const canteen = state.canteens.find((c) => c.id === item.canteenId);
            const isUnavailable = !item.isAvailable || !(canteen?.isActive ?? false);
            const inCart = state.cart.find((c) => c.foodItemId === item.id);
            return (
              <div
                key={item.id}
                className={`food-card ${isUnavailable ? 'food-card-unavailable' : ''}`}
                onClick={() => setSelectedItem(item)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', height: 145, background: '#F1F5F9', overflow: 'hidden' }}>
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="food-card-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isUnavailable && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(16,29,58,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 9999 }}>
                        Tidak Tersedia
                      </span>
                    </div>
                  )}
                  {inCart && !isUnavailable && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'var(--color-navy)', color: 'white',
                      fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 9999,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}>
                      {inCart.quantity} di keranjang
                    </div>
                  )}
                </div>

                <div className="food-card-body">
                  <div className="food-card-name">{item.name}</div>
                  <div className="food-card-canteen">📍 {canteen?.name}</div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: 8,
                  }}>
                    <div className="food-card-price">{formatIDR(item.price)}</div>

                    {!isUnavailable && (
                      <button
                        onClick={(e) => handleQuickAdd(item, e)}
                        className="btn btn-accent btn-sm"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 12,
                        }}
                        title="Tambah ke Keranjang"
                      >
                        <Plus size={16} />
                        <span>Tambah</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSelectCanteen={onSelectCanteen}
        />
      )}
    </div>
  );
}
