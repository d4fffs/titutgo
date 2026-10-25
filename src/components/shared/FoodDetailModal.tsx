import { useEffect, useRef } from 'react';
import { X, Heart, Building2, ShoppingCart, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from './Toast';
import { formatIDR } from '../../utils/currency';
import { FOOD_CATEGORY_LABELS } from '../../data/mockData';
import { SafeImage } from './SafeImage';
import type { FoodItem } from '../../types';

interface FoodDetailModalProps {
  item: FoodItem;
  onClose: () => void;
  onSelectCanteen?: (canteenId: string) => void;
}

export function FoodDetailModal({ item, onClose, onSelectCanteen }: FoodDetailModalProps) {
  const { state, addToCart, toggleFavorite, currentUser } = useApp();
  const { showToast } = useToast();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const canteen = state.canteens.find((c) => c.id === item.canteenId);
  const cartItem = state.cart.find((c) => c.foodItemId === item.id);
  const isFav = currentUser?.favorites.includes(item.id) ?? false;
  const isCanteenActive = canteen?.isActive ?? true;
  const isAvailable = item.isAvailable && isCanteenActive;

  // Keyboard accessibility: ESC key to dismiss dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ backdropFilter: 'blur(6px)' }}
      role="presentation"
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-modal-name"
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          maxWidth: 480,
          width: '92%',
          background: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        }}
      >
        {/* Modal Image Header */}
        <div style={{ position: 'relative', width: '100%', height: 230, background: '#F1F5F9' }}>
          <SafeImage
            src={item.imageUrl}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Close Button */}
          <button
            ref={closeBtnRef}
            className="btn-icon"
            aria-label="Tutup detail makanan"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(15, 30, 61, 0.75)',
              color: 'white',
              border: 'none',
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onClick={onClose}
          >
            <X size={20} />
          </button>

          {/* Favorite Toggle Button */}
          <button
            className="btn-icon"
            aria-label={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            style={{
              position: 'absolute',
              top: 14,
              right: 60,
              background: 'rgba(15, 30, 61, 0.75)',
              color: isFav ? '#EF4444' : 'white',
              border: 'none',
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onClick={() => toggleFavorite(item.id)}
          >
            <Heart size={20} fill={isFav ? '#EF4444' : 'none'} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '22px 24px' }}>
          {/* Category & Canteen */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#0265DC',
                background: '#EFF6FF',
                padding: '4px 10px',
                borderRadius: 9999,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {FOOD_CATEGORY_LABELS[item.category]}
            </span>

            <div style={{ fontSize: 22, fontWeight: 900, color: '#0F1E3D' }}>
              {formatIDR(item.price)}
            </div>
          </div>

          <h2
            id="food-modal-name"
            style={{
              fontSize: 21,
              fontWeight: 900,
              color: '#0F1E3D',
              margin: '4px 0 6px',
              lineHeight: 1.25,
            }}
          >
            {item.name}
          </h2>

          <div
            onClick={() => {
              if (canteen && onSelectCanteen) {
                onSelectCanteen(canteen.id);
                onClose();
              }
            }}
            style={{
              fontSize: 12.5,
              color: onSelectCanteen ? '#0265DC' : '#64748B',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginBottom: 14,
              cursor: onSelectCanteen ? 'pointer' : 'default',
            }}
          >
            <Building2 size={14} color="#0265DC" />
            <span>{canteen?.name ?? 'Kantin Kampus PENS'}</span>
            {canteen?.location && (
              <span style={{ color: '#94A3B8', fontWeight: 500 }}>• 📍 {canteen.location}</span>
            )}
          </div>

          {/* Description */}
          {item.description ? (
            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              {item.description}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', marginBottom: 20 }}>
              Menu pilihan khas kantin kampus PENS Sukolilo. Disiapkan hangat saat dipesan.
            </p>
          )}

          {/* Status Warning if Out of Stock or Canteen Closed */}
          {!isAvailable && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 14,
                padding: '10px 14px',
                marginBottom: 18,
                fontSize: 12.5,
                fontWeight: 700,
                color: '#DC2626',
              }}
              role="alert"
            >
              <AlertCircle size={16} color="#DC2626" />
              <span>
                {!item.isAvailable
                  ? 'Menu ini sedang habis / tidak tersedia hari ini.'
                  : 'Kantin ini sedang tutup. Silakan pilih kantin lain yang buka.'}
              </span>
            </div>
          )}

          {/* Action Button */}
          <button
            className="btn btn-accent btn-full"
            style={{
              padding: '14px 20px',
              borderRadius: 16,
              fontSize: 14,
              minHeight: 48,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              opacity: isAvailable ? 1 : 0.6,
            }}
            disabled={!isAvailable}
            onClick={() => {
              if (!isAvailable) return;
              addToCart(item.id);
              showToast(`${item.name} berhasil ditambahkan ke keranjang!`, 'success');
              onClose();
            }}
          >
            <ShoppingCart size={18} />
            <span>
              {cartItem
                ? `Tambah Lagi (Sudah Ada ${cartItem.quantity} di Keranjang)`
                : `Tambah ke Keranjang • ${formatIDR(item.price)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
