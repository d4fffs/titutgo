import { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, ShoppingBag, Bell, X, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiTitutMascot } from './SiTitutMascot';
import { SafeImage } from './SafeImage';
import { formatIDR } from '../../utils/currency';
import { ORDER_STATUS_LABELS } from '../../utils/orderTransitions';

interface Props {
  activeTab?: 'roles' | 'user' | 'courier' | 'admin' | 'cart';
  onNavigateTab?: (tab: 'roles' | 'user' | 'courier' | 'admin' | 'cart') => void;
  onSearchChange?: (q: string) => void;
  onSelectCanteen?: (canteenId: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

export function CampusNavbar({
  activeTab = 'roles',
  onNavigateTab,
  onSearchChange,
  onSelectCanteen,
  searchValue = '',
  showSearch = true,
}: Props) {
  const { state, setRole, cartCount, addToCart } = useApp();
  const [internalSearch, setInternalSearch] = useState(searchValue);
  const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMascotSpeech, setShowMascotSpeech] = useState(false);

  // Sync external search prop if controlled without effect cascading
  if (searchValue !== prevSearchValue) {
    setPrevSearchValue(searchValue);
    setInternalSearch(searchValue);
  }

  // Derive genuine dynamic notifications from real state orders
  const notifications = useMemo(() => {
    return state.orders.slice(0, 4).map((order) => {
      const isCompleted = order.status === 'completed';
      const isCancelled = order.status === 'cancelled';
      return {
        id: order.id,
        title: `Pesanan #${order.id}`,
        desc: `${ORDER_STATUS_LABELS[order.status]} • ${order.deliveryPoint}`,
        time: new Date(order.updatedAt || order.createdAt).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        unread: !isCompleted && !isCancelled,
      };
    });
  }, [state.orders]);

  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks & Escape key to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (mascotRef.current && !mascotRef.current.contains(e.target as Node)) {
        setShowMascotSpeech(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSearchDropdown(false);
        setShowNotifications(false);
        setShowMascotSpeech(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTabClick = (tab: 'roles' | 'user' | 'courier' | 'admin' | 'cart') => {
    if (onNavigateTab) {
      onNavigateTab(tab);
      return;
    }

    if (tab === 'roles') {
      setRole(null);
    } else if (tab === 'user') {
      setRole('user');
    } else if (tab === 'courier') {
      setRole('kurir');
    } else if (tab === 'admin') {
      setRole('admin');
    }
  };

  const handleSearchInput = (val: string) => {
    setInternalSearch(val);
    setShowSearchDropdown(val.trim().length > 0);
    onSearchChange?.(val);
  };

  // Filter items for search dropdown
  const query = internalSearch.toLowerCase().trim();
  const matchedFoods = query
    ? state.foodItems.filter(
        (f) =>
          f.isAvailable &&
          (f.name.toLowerCase().includes(query) || f.category.toLowerCase().includes(query))
      ).slice(0, 4)
    : [];
  const matchedCanteens = query
    ? state.canteens.filter((c) => c.name.toLowerCase().includes(query) || c.location.toLowerCase().includes(query)).slice(0, 2)
    : [];

  const unreadCount = notifications.filter((n) => n.unread && !readNotifIds.has(n.id)).length;

  return (
    <header
      className="campus-header-responsive"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(15, 30, 61, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left: Brand + Campus Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <button
          onClick={() => handleTabClick('roles')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          title="Kembali ke Pilihan Peran"
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#0265DC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: 16,
            }}
          >
            T
          </div>
          <span style={{ fontSize: 19, fontWeight: 900, color: '#0F1E3D', letterSpacing: '-0.03em' }}>
            TitutGo
          </span>
        </button>

        {/* Location Pill (Clean soft background) */}
        <div
          className="hide-on-mobile"
          style={{
            alignItems: 'center',
            gap: 5,
            background: '#F1F5F9',
            padding: '5px 12px',
            borderRadius: 9999,
            fontSize: 11.5,
            fontWeight: 700,
            color: '#334155',
          }}
        >
          <MapPin size={12} color="#0265DC" />
          <span>PENS Sukolilo</span>
        </div>
      </div>

      {/* Center Search (Fully Interactive) */}
      {showSearch && (
        <div
          ref={searchRef}
          className="hide-on-mobile"
          style={{
            flex: 1,
            maxWidth: 340,
            position: 'relative',
            alignItems: 'center',
          }}
        >
          <Search size={14} style={{ position: 'absolute', left: 12, color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Cari makanan atau kantin..."
            value={internalSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => {
              if (internalSearch.trim().length > 0) setShowSearchDropdown(true);
            }}
            style={{
              width: '100%',
              padding: '8px 30px 8px 34px',
              borderRadius: 9999,
              border: 'none',
              background: '#F1F5F9',
              fontSize: 12.5,
              outline: 'none',
              color: '#1E293B',
              transition: 'all 0.2s ease',
            }}
          />
          {internalSearch && (
            <button
              onClick={() => handleSearchInput('')}
              style={{
                position: 'absolute',
                right: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              <X size={13} />
            </button>
          )}

          {/* Interactive Search Dropdown */}
          {showSearchDropdown && (matchedFoods.length > 0 || matchedCanteens.length > 0) && (
            <div
              style={{
                position: 'absolute',
                top: '105%',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
                zIndex: 60,
                overflow: 'hidden',
                padding: 8,
              }}
            >
              {matchedFoods.length > 0 && (
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#64748B', padding: '6px 8px', textTransform: 'uppercase' }}>
                    Menu Makanan
                  </div>
                  {matchedFoods.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        addToCart(f.id);
                        setShowSearchDropdown(false);
                        handleTabClick('user');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                          <SafeImage
                            src={f.imageUrl}
                            alt={f.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F1E3D' }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: '#0265DC', fontWeight: 600 }}>{formatIDR(f.price)}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: '#0265DC', fontWeight: 700 }}>+ Tambah</span>
                    </div>
                  ))}
                </div>
              )}

              {matchedCanteens.length > 0 && (
                <div style={{ borderTop: matchedFoods.length > 0 ? '1px solid #F1F5F9' : 'none', marginTop: 4, paddingTop: 4 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#64748B', padding: '6px 8px', textTransform: 'uppercase' }}>
                    Kantin Kampus
                  </div>
                  {matchedCanteens.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        if (onSelectCanteen) {
                          onSelectCanteen(c.id);
                        } else {
                          handleTabClick('user');
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Store size={14} color="#0265DC" />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F1E3D' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>📍 {c.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right: Role Switcher & Notifications & Mascot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Mobile Active Role Pill (Shown only on small screens) */}
        <div
          className="hide-on-desktop"
          style={{
            alignItems: 'center',
            background: '#EFF6FF',
            color: '#0265DC',
            padding: '4px 10px',
            borderRadius: 9999,
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {activeTab === 'roles' ? 'Pilih Peran' : activeTab === 'user' ? 'Pelanggan' : activeTab === 'courier' ? 'Kurir' : 'Admin'}
        </div>

        {/* Clean Modern Role Switcher (Hidden on mobile < 640px to prevent overflow) */}
        <div
          className="navbar-role-switcher-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: '#F1F5F9',
            padding: '3px',
            borderRadius: 9999,
          }}
        >
          {(['roles', 'user', 'courier', 'admin'] as const).map((tab) => {
            const labelMap = { roles: 'Peran', user: 'User', courier: 'Kurir', admin: 'Admin' };
            const isTabActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 9999,
                  border: 'none',
                  background: isTabActive ? '#0F1E3D' : 'transparent',
                  color: isTabActive ? '#FFFFFF' : '#64748B',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isTabActive ? '0 2px 8px rgba(15, 30, 61, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>

        {/* Notifications Icon (Interactive) */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
            }}
            title="Notifikasi Kampus"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: '#DC2626',
                  color: 'white',
                  fontSize: 9,
                  fontWeight: 800,
                  width: 15,
                  height: 15,
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 320,
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.15)',
                zIndex: 70,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F1E3D' }}>Notifikasi Pesanan</div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      setReadNotifIds(new Set(notifications.map((n) => n.id)));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 11,
                      color: '#0265DC',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Tandai Dibaca
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: '#64748B', fontSize: 12.5 }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📬</div>
                    Belum ada riwayat pesanan aktif.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUnread = n.unread && !readNotifIds.has(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setReadNotifIds((prev) => new Set([...prev, n.id]));
                          handleTabClick('user');
                          setShowNotifications(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F1F5F9',
                          background: isUnread ? '#EFF6FF' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#0F1E3D' }}>{n.title}</span>
                          <span style={{ fontSize: 10, color: '#94A3B8' }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.4 }}>{n.desc}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart Icon (Interactive - opens Cart) */}
        <button
          onClick={() => handleTabClick('cart')}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            padding: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#334155',
          }}
          title="Buka Keranjang Pesanan"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#0265DC',
                color: 'white',
                fontSize: 9.5,
                fontWeight: 800,
                minWidth: 16,
                height: 16,
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>

        {/* Mascot Avatar (Interactive with speech bubble) */}
        <div
          ref={mascotRef}
          style={{ position: 'relative' }}
        >
          <div
            onClick={() => setShowMascotSpeech(!showMascotSpeech)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#EFF6FF',
              boxShadow: '0 2px 6px rgba(2, 101, 220, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            title="Klik SiTitut Maskot PENS"
          >
            <SiTitutMascot size={26} mood={showMascotSpeech ? 'excited' : 'happy'} animated />
          </div>

          {/* Interactive Mascot Speech Popover (Duolingo Style) */}
          {showMascotSpeech && (
            <div
              className="duo-speech-bubble"
              style={{
                position: 'absolute',
                top: '125%',
                right: 0,
                width: 250,
                background: '#FFFFFF',
                color: '#0F1E3D',
                padding: '14px 16px',
                borderRadius: 20,
                boxShadow: '0 12px 30px rgba(15, 30, 61, 0.12)',
                zIndex: 70,
                fontSize: 12.5,
                fontWeight: 700,
                lineHeight: 1.45,
                display: 'block',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#0265DC', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>🦉 SiTitut Ngomong:</span>
              </div>
              <div style={{ color: '#334155' }}>
                "Cak & Ning, jam istirahat bentar lagi! Buruan titip jastip sebelum kantin rame rek! 🛵💨"
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
