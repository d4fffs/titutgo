import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, X, Store, Clock, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import { FOOD_CATEGORY_LABELS } from '../../data/mockData';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { SafeImage } from '../../components/shared/SafeImage';
import { FoodDetailModal } from '../../components/shared/FoodDetailModal';
import type { FoodItem, FoodCategory } from '../../types';

interface Props {
  canteenId: string;
  onBack: () => void;
  onSelectCanteen: (canteenId: string) => void;
  onNavigateToCart: () => void;
}

export function UserCanteenDetail({ canteenId, onBack, onSelectCanteen, onNavigateToCart }: Props) {
  const { state, addToCart, cartCount } = useApp();
  const { toasts, showToast, removeToast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  // Active canteen resolution
  const canteen = state.canteens.find((c) => c.id === canteenId) || state.canteens[0];
  const allActiveCanteens = state.canteens.filter((c) => c.isActive);

  // Filter items that strictly belong to THIS canteen
  const canteenItems = useMemo(() => {
    if (!canteen) return [];
    return state.foodItems.filter((f) => f.canteenId === canteen.id);
  }, [state.foodItems, canteen]);

  // Available categories in this canteen
  const availableCategories = useMemo(() => {
    const cats = new Set<FoodCategory>();
    canteenItems.forEach((f) => cats.add(f.category));
    return Array.from(cats);
  }, [canteenItems]);

  // Filtered menus inside this canteen
  const displayedItems = useMemo(() => {
    return canteenItems.filter((f) => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
        (f.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchCat = categoryFilter === 'all' || f.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [canteenItems, search, categoryFilter]);

  // Subtotal for floating cart bar
  const cartSubtotal = state.cart.reduce((sum, ci) => {
    const food = state.foodItems.find((f) => f.id === ci.foodItemId);
    return sum + (food ? food.price * ci.quantity : 0);
  }, 0);

  const handleQuickAdd = (item: FoodItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable || !canteen?.isActive) {
      showToast('Item tidak tersedia saat ini', 'error');
      return;
    }
    addToCart(item.id);
    showToast(`${item.name} masuk keranjang!`, 'success');
  };

  if (!canteen) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center', padding: 24 }}>
        <p>Kantin tidak ditemukan.</p>
        <button className="btn-pill" onClick={onBack}>Kembali</button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', paddingBottom: 80 }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Top Breadcrumb & Back */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <button
          onClick={onBack}
          className="btn-pill"
          style={{ fontSize: 13 }}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: "'Poppins', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: '#64748B',
        }}>
          <span>Kantin Kampus PENS</span>
          <ChevronRight size={14} />
          <span style={{ color: '#0F1E3D', fontWeight: 800 }}>{canteen.name}</span>
        </div>
      </div>

      {/* Canteen Storefront Hero Card */}
      <div
        className="bento-card"
        style={{
          padding: '24px 28px',
          marginBottom: 20,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          {/* Canteen Icon Avatar */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0265DC',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(2, 101, 220, 0.12)',
          }}>
            <Store size={32} />
          </div>

          {/* Canteen Details */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: '#ECFDF5',
                color: '#059669',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: 9999,
              }}>
                <CheckCircle2 size={11} /> Mitra Resmi PENS
              </span>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: canteen.isActive ? '#F0FDF4' : '#FEF2F2',
                color: canteen.isActive ? '#16A34A' : '#DC2626',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 9999,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: canteen.isActive ? '#16A34A' : '#DC2626',
                }} />
                {canteen.isActive ? 'Buka Sekarang' : 'Tutup'}
              </span>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: '#64748B',
                fontSize: 11.5,
                fontWeight: 600,
              }}>
                <Clock size={12} /> 08:00 - 16:30 WIB
              </span>
            </div>

            <h1 style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#0F1E3D',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
            }}>
              {canteen.name}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#475569',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 10,
            }}>
              <MapPin size={14} color="#0265DC" />
              <span>{canteen.location}</span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ color: '#0265DC', fontWeight: 700 }}>⏱️ Est. 10-15 mnt antar</span>
            </div>

            {canteen.description && (
              <p style={{
                fontSize: 13,
                color: '#64748B',
                lineHeight: 1.5,
                margin: 0,
              }}>
                {canteen.description}
              </p>
            )}
          </div>

          {/* Quick Counter Badge */}
          <div style={{
            background: '#F8FAFC',
            borderRadius: 14,
            padding: '12px 18px',
            textAlign: 'center',
            minWidth: 120,
            boxShadow: '0 1px 3px rgba(15, 30, 61, 0.04)',
          }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0265DC' }}>
              {canteenItems.length}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>
              Menu Tersedia
            </div>
          </div>
        </div>

        {/* Quick Canteen Switcher Pills */}
        <div style={{
          marginTop: 20,
          paddingTop: 16,
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 8,
          }}>
            Pilih Kantin PENS Lainnya:
          </div>
          <div style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
          }}>
            {allActiveCanteens.map((c) => {
              const isCurrent = c.id === canteen.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCanteen(c.id)}
                  className={`chip ${isCurrent ? 'active' : ''}`}
                >
                  <Store size={14} color={isCurrent ? '#FFFFFF' : '#0265DC'} />
                  <span>{c.name.replace('FoodLAB PENS — ', '')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* In-Canteen Search & Category Filter */}
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 20,
      }}>
        {/* Search inside this canteen */}
        <div style={{
          position: 'relative',
          flex: '1 1 260px',
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748B',
          }} />
          <input
            type="text"
            placeholder={`Cari menu di ${canteen.name.replace('FoodLAB PENS — ', '')}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 36px 11px 42px',
              borderRadius: 9999,
              border: 'none',
              boxShadow: '0 2px 8px rgba(15, 30, 61, 0.05)',
              background: '#FFFFFF',
              fontFamily: "'Poppins', sans-serif",
              fontSize: 13.5,
              fontWeight: 600,
              outline: 'none',
              color: '#0F1E3D',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills Scoped to this Canteen */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`chip ${categoryFilter === 'all' ? 'active' : ''}`}
          >
            Semua ({canteenItems.length})
          </button>
          {availableCategories.map((cat) => {
            const count = canteenItems.filter((f) => f.category === cat).length;
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`chip ${isActive ? 'active' : ''}`}
              >
                {FOOD_CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Header Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
          Menampilkan <strong style={{ color: '#0F1E3D' }}>{displayedItems.length} menu</strong> dari {canteen.name}
        </div>
      </div>

      {/* Food Items Grid — STRICTLY FOR THIS CANTEEN */}
      {displayedItems.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 20,
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <SiTitutMascot size={64} mood="thinking" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F1E3D', marginBottom: 4 }}>
            Menu Tidak Ditemukan
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', maxWidth: 360, margin: '0 auto 16px' }}>
            {search ? `Tidak ada menu "${search}" di kantin ini.` : 'Belum ada menu di kategori ini.'}
          </p>
          {(search || categoryFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setCategoryFilter('all'); }}
              style={{
                background: '#0265DC',
                color: 'white',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 9999,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="food-grid-responsive">
          {displayedItems.map((item) => {
            const isUnavailable = !item.isAvailable || !canteen.isActive;
            const inCart = state.cart.find((ci) => ci.foodItemId === item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
                  opacity: isUnavailable ? 0.65 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(2, 101, 220, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.04)';
                }}
              >
                {/* Image Container */}
                <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#F1F5F9' }}>
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(15, 30, 61, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 9999,
                  }}>
                    {FOOD_CATEGORY_LABELS[item.category]}
                  </div>

                  {isUnavailable && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.55)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: 13,
                    }}>
                      Habis
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: '#0F1E3D',
                    margin: '0 0 4px 0',
                    lineHeight: 1.3,
                  }}>
                    {item.name}
                  </h3>

                  {item.description && (
                    <p style={{
                      fontSize: 12,
                      color: '#64748B',
                      margin: '0 0 12px 0',
                      lineHeight: 1.4,
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: 8,
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>Harga Menu</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D', letterSpacing: '-0.02em' }}>
                        {formatIDR(item.price)}
                      </div>
                    </div>

                    <button
                      disabled={isUnavailable}
                      onClick={(e) => handleQuickAdd(item, e)}
                      className={`btn btn-sm ${inCart ? 'btn-accent' : 'btn-outline-navy'}`}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 14,
                      }}
                    >
                      <Plus size={15} />
                      <span>{inCart ? `Tambah (${inCart.quantity})` : 'Tambah'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar (Duolingo Style) */}
      {cartCount > 0 && (
        <div
          className="floating-cart-bar"
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
          maxWidth: 600,
          background: '#0F1E3D',
          border: 'none',
          color: '#FFFFFF',
          borderRadius: 9999,
          padding: '10px 16px 10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 32px rgba(15, 30, 61, 0.35)',
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#0265DC',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: 14,
            }}>
              {cartCount}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Total Pesanan</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800 }}>{formatIDR(cartSubtotal)}</div>
            </div>
          </div>

          <button
            onClick={onNavigateToCart}
            className="btn btn-accent"
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              fontSize: 13,
            }}
          >
            <span>LIHAT KERANJANG</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <FoodDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
