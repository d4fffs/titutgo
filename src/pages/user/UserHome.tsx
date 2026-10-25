import { useState } from 'react';
import { Sparkles, Store, ArrowRight, Plus, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { SafeImage } from '../../components/shared/SafeImage';
import { formatIDR } from '../../utils/currency';
import { FOOD_CATEGORY_LABELS } from '../../data/mockData';
import { ToastContainer, useToast } from '../../components/shared/Toast';

type UserPage = 'home' | 'menu' | 'canteen' | 'orders' | 'profile' | 'cart';

interface Props {
  onNavigate: (page: UserPage) => void;
  onSelectCanteen?: (canteenId: string) => void;
}

export function UserHome({ onNavigate, onSelectCanteen }: Props) {
  const { state, currentUser, addToCart } = useApp();
  const { toasts, showToast, removeToast } = useToast();
  const { foodItems, canteens, couriers } = state;

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const activeCouriers = couriers.filter((c) => c.isEnabled && c.isAvailable).length;
  const popularItems = [...foodItems]
    .filter((f) => f.isAvailable && (activeCategory === 'all' || f.category === activeCategory))
    .slice(0, 8);

  const activeCanteens = canteens.filter((c) => c.isActive);

  // Greeting based on mount time
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  });

  const handleQuickAdd = (itemId: string, itemName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(itemId);
    showToast(`${itemName} masuk ke keranjang!`, 'success');
  };

  return (
    <div style={{ width: '100%' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Modern Open Hero Section (Clean canvas, prominent mascot) */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 0.75fr',
          gap: 24,
          alignItems: 'center',
          padding: '12px 4px 30px',
        }}
        className="hero-bento-responsive"
      >
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#EFF6FF',
            color: '#0265DC',
            fontFamily: "'Poppins', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            padding: '5px 14px',
            borderRadius: 9999,
            marginBottom: 12,
          }}>
            <Sparkles size={12} />
            <span>{greeting}, {currentUser?.name?.split(' ')[0] ?? 'Pelanggan'}! 👋</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
            fontWeight: 900,
            color: '#0F1E3D',
            lineHeight: 1.2,
            marginBottom: 10,
            letterSpacing: '-0.03em',
          }}>
            Mau makan apa <span style={{ color: '#0265DC' }}>hari ini?</span>
          </h1>

          <p style={{
            fontSize: 14.5,
            color: '#475569',
            lineHeight: 1.55,
            marginBottom: 20,
            maxWidth: 480,
            fontWeight: 500,
          }}>
            Pesan aneka menu lezat dari FoodLAB & Kantin PENS, diantar hangat dan cepat langsung ke lab praktikum, ruang kelas, atau gedungmu di lingkungan kampus PENS Sukolilo!
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => onNavigate('menu')}
              className="btn btn-primary"
              style={{
                padding: '12px 22px',
                borderRadius: 9999,
                fontSize: 13.5,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Jelajahi Menu Makanan</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Mascot Centerpiece Spotlight */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #E2EEFC 0%, #EFF6FE 100%)',
          borderRadius: 32,
          padding: '24px 20px',
          boxShadow: '0 8px 30px rgba(2, 101, 220, 0.08)',
          textAlign: 'center',
          position: 'relative',
        }}>
          <SiTitutMascot
            size={130}
            mood={activeCouriers > 0 ? 'wave' : 'happy'}
            interactive
            animated
          />
        </div>
      </section>

      {/* Canteen Partners List */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F1E3D' }}>
              Kantin Kampus
            </h2>
          </div>

          <button
            onClick={() => onNavigate('menu')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0265DC',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Lihat Semua</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="canteen-grid-responsive">
          {activeCanteens.map((canteen) => {
            const count = foodItems.filter((f) => f.canteenId === canteen.id && f.isAvailable).length;
            return (
              <div
                key={canteen.id}
                onClick={() => {
                  if (onSelectCanteen) {
                    onSelectCanteen(canteen.id);
                  } else {
                    onNavigate('canteen');
                  }
                }}
                className="bento-card"
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14, background: '#EFF6FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0265DC',
                  boxShadow: '0 2px 6px rgba(2, 101, 220, 0.08)',
                }}>
                  <Store size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1E3D' }}>{canteen.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>📍 {canteen.location} • {count} menu</div>
                </div>
                <ChevronRight size={18} color="#94A3B8" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular Food Items Catalog */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1E3D' }}>
              Menu Populer Hari Ini
            </h2>
          </div>

          {/* Category Chips */}
          <div className="scroll-x-chips">
            <button
              onClick={() => setActiveCategory('all')}
              className={`chip ${activeCategory === 'all' ? 'active' : ''}`}
            >
              Semua Menu
            </button>
            {Object.entries(FOOD_CATEGORY_LABELS).map(([catKey, catLabel]) => (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`chip ${activeCategory === catKey ? 'active' : ''}`}
              >
                {catLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Food Items Grid */}
        <div className="food-grid-responsive">
          {popularItems.map((item) => {
            const canteen = state.canteens.find((c) => c.id === item.canteenId);
            return (
              <div
                key={item.id}
                onClick={() => onNavigate('menu')}
                className="food-card"
                style={{ cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', height: 155, background: '#F1F5F9', overflow: 'hidden' }}>
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="food-card-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: '#0F1E3D',
                    color: 'white',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}>
                    {FOOD_CATEGORY_LABELS[item.category]}
                  </span>
                </div>

                <div className="food-card-body">
                  <div className="food-card-name">
                    {item.name}
                  </div>
                  <div
                    onClick={(e) => {
                      if (canteen && onSelectCanteen) {
                        e.stopPropagation();
                        onSelectCanteen(canteen.id);
                      }
                    }}
                    style={{
                      fontSize: 11.5,
                      color: '#0265DC',
                      marginBottom: 12,
                      cursor: canteen && onSelectCanteen ? 'pointer' : 'default',
                      fontWeight: 700,
                    }}
                    title={canteen ? `Buka ${canteen.name}` : undefined}
                  >
                    📍 {canteen?.name}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: 8,
                  }}>
                    <span className="food-card-price">
                      {formatIDR(item.price)}
                    </span>

                    <button
                      onClick={(e) => handleQuickAdd(item.id, item.name, e)}
                      className="btn btn-accent btn-sm"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 12,
                        minWidth: 36,
                      }}
                      title="Tambah ke Keranjang"
                    >
                      <Plus size={16} />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
