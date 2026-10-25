import { useState } from 'react';
import { Home, UtensilsCrossed, ShoppingBag, User, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CampusNavbar } from '../components/shared/CampusNavbar';

// User Pages
import { UserHome } from '../pages/user/UserHome';
import { UserMenu } from '../pages/user/UserMenu';
import { UserCanteenDetail } from '../pages/user/UserCanteenDetail';
import { UserOrders } from '../pages/user/UserOrders';
import { UserProfile } from '../pages/user/UserProfile';
import { UserCart } from '../pages/user/UserCart';

type UserPage = 'home' | 'menu' | 'canteen' | 'orders' | 'profile' | 'cart';

const NAV_ITEMS: { key: UserPage; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Beranda', icon: Home },
  { key: 'menu', label: 'Katalog Menu', icon: UtensilsCrossed },
  { key: 'orders', label: 'Pesanan', icon: ShoppingBag },
  { key: 'cart', label: 'Keranjang', icon: ShoppingCart },
  { key: 'profile', label: 'Profil', icon: User },
];

export function UserLayout() {
  const { state, cartCount, setRole } = useApp();
  const [activePage, setActivePage] = useState<UserPage>('home');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(null);

  const handleSelectCanteen = (canteenId: string) => {
    setSelectedCanteenId(canteenId);
    setActivePage('canteen');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <UserHome onNavigate={setActivePage} onSelectCanteen={handleSelectCanteen} />;
      case 'canteen':
        return (
          <UserCanteenDetail
            canteenId={selectedCanteenId || state.canteens[0]?.id || ''}
            onBack={() => {
              setActivePage('home');
            }}
            onSelectCanteen={handleSelectCanteen}
            onNavigateToCart={() => setActivePage('cart')}
          />
        );
      case 'menu':
        return <UserMenu initialCanteenId={selectedCanteenId ?? undefined} onSelectCanteen={handleSelectCanteen} />;
      case 'orders':
        return <UserOrders />;
      case 'profile':
        return <UserProfile />;
      case 'cart':
        return (
          <UserCart
            onBack={() => (selectedCanteenId ? setActivePage('canteen') : setActivePage('home'))}
            onOrderPlaced={() => setActivePage('orders')}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Top Campus Navbar */}
      <CampusNavbar
        activeTab="user"
        onSelectCanteen={handleSelectCanteen}
        onNavigateTab={(tab) => {
          if (tab === 'roles') setRole(null);
          else if (tab === 'courier') setRole('kurir');
          else if (tab === 'admin') setRole('admin');
          else if (tab === 'cart') setActivePage('cart');
          else if (tab === 'user') {
            setSelectedCanteenId(null);
            setActivePage('home');
          }
        }}
      />

      {/* Subnav for user pages with clean pills (Desktop/Tablet) */}
      <div
        className="hide-on-mobile"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(15, 30, 61, 0.04)',
          padding: '10px 16px',
        }}
      >
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div className="subnav-scrollable" style={{ display: 'flex', gap: 8 }}>
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const isSelected = activePage === key || (key === 'home' && activePage === 'canteen');
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'home') setSelectedCanteenId(null);
                    setActivePage(key);
                  }}
                  className={isSelected ? 'btn btn-primary' : 'btn-pill'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {key === 'cart' && cartCount > 0 && (
                    <span style={{
                      background: isSelected ? '#EA580C' : '#0265DC',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 900,
                      padding: '1px 7px',
                      borderRadius: 9999,
                    }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="responsive-main-padding pad-bottom-for-mobile-nav" style={{ flex: 1, padding: '24px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          {renderPage()}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar for Smart Devices */}
      <nav className="mobile-bottom-bar" aria-label="Navigasi Bawah Mobile">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isSelected = activePage === key || (key === 'home' && activePage === 'canteen');
          return (
            <button
              key={key}
              onClick={() => {
                if (key === 'home') setSelectedCanteenId(null);
                setActivePage(key);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                color: isSelected ? '#0265DC' : '#64748B',
                fontWeight: isSelected ? 800 : 600,
                fontSize: 11,
                cursor: 'pointer',
                position: 'relative',
                padding: '6px 10px',
              }}
            >
              <Icon size={20} color={isSelected ? '#0265DC' : '#64748B'} />
              <span>{label}</span>
              {key === 'cart' && cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 12,
                  background: '#0265DC',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 900,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
