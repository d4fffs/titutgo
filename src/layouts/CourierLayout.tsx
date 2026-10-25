import { useState } from 'react';
import {
  Bike, Shield, Store, RefreshCw, Search, Package, Wallet, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CampusNavbar } from '../components/shared/CampusNavbar';

// Courier Pages
import { CourierDashboard } from '../pages/courier/CourierDashboard';
import { CourierAvailableOrders } from '../pages/courier/CourierAvailableOrders';
import { CourierDeliveries } from '../pages/courier/CourierDeliveries';
import { CourierEarnings } from '../pages/courier/CourierEarnings';
import { CourierProfile } from '../pages/courier/CourierProfile';

type CourierTab = 'dashboard' | 'cari' | 'antar' | 'cuan' | 'profil';

export function CourierLayout() {
  const { state, currentCourier, setRole } = useApp();
  const [activeTab, setActiveTab] = useState<CourierTab>('dashboard');

  const pendingCount = state.orders.filter((o) => o.status === 'pending_courier').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Top Campus Navbar */}
      <CampusNavbar activeTab="courier" />

      {/* Main Body with Sidebar ("TitutGo Hub") */}
      <div className="dashboard-wrapper" style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar (Desktop) */}
        <aside
          className="hide-on-mobile"
          style={{
            width: 220,
            background: '#FFFFFF',
            boxShadow: '1px 0 3px rgba(15, 30, 61, 0.04)',
            padding: '20px 14px',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Sidebar Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 16px' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#0265DC',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bike size={18} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#0F1E3D' }}>
              TitutGo Hub
            </span>
          </div>

          {/* Mode Aktif Card */}
          <div style={{
            background: '#EFF6FF',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 20,
            boxShadow: '0 2px 6px rgba(2, 101, 220, 0.08)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#0265DC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PERAN AKTIF
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#0F1E3D', marginTop: 2 }}>
              Kurir Mahasiswa 🛵
            </div>
          </div>

          {/* Nav Items (Duolingo 3D Button Style) */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={activeTab === 'dashboard' ? 'btn btn-primary' : 'btn-pill'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 900,
                textAlign: 'left',
              }}
            >
              <Bike size={16} />
              <span style={{ flex: 1 }}>Dashboard Jastip</span>
            </button>

            <button
              onClick={() => setActiveTab('cari')}
              className={activeTab === 'cari' ? 'btn btn-primary' : 'btn-pill'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 900,
                textAlign: 'left',
              }}
            >
              <span>🔍</span>
              <span style={{ flex: 1 }}>Cari Pesanan</span>
              {pendingCount > 0 && (
                <span className="badge badge-accent" style={{ fontSize: 10, padding: '1px 6px' }}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('antar')}
              className={activeTab === 'antar' ? 'btn btn-primary' : 'btn-pill'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 900,
                textAlign: 'left',
              }}
            >
              <span>📦</span>
              <span style={{ flex: 1 }}>Pengantaran</span>
            </button>

            <button
              onClick={() => setActiveTab('cuan')}
              className={activeTab === 'cuan' ? 'btn btn-primary' : 'btn-pill'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 900,
                textAlign: 'left',
              }}
            >
              <span>💰</span>
              <span style={{ flex: 1 }}>Dompet & Saldo</span>
            </button>

            <button
              onClick={() => setActiveTab('profil')}
              className={activeTab === 'profil' ? 'btn btn-primary' : 'btn-pill'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 900,
                textAlign: 'left',
              }}
            >
              <span>👤</span>
              <span style={{ flex: 1 }}>Profil Kurir</span>
            </button>

            <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0' }} />

            <button
              onClick={() => setRole('user')}
              className="btn-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                color: '#64748B',
                textAlign: 'left',
              }}
            >
              <Store size={16} />
              <span>Mode Pemesan</span>
            </button>

            <button
              onClick={() => setRole('admin')}
              className="btn-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                color: '#64748B',
                textAlign: 'left',
              }}
            >
              <Shield size={16} />
              <span>Admin Console</span>
            </button>

            <button
              onClick={() => setRole(null)}
              className="btn-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                color: '#64748B',
                textAlign: 'left',
              }}
            >
              <RefreshCw size={14} />
              <span>Ganti Peran</span>
            </button>
          </nav>

          {/* Bottom Courier Status */}
          <div style={{
            paddingTop: 16,
            fontSize: 11.5,
            color: '#64748B',
          }}>
            <div style={{ fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', fontSize: 10 }}>STATUS SISTEM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 900, color: currentCourier?.isAvailable ? '#16A34A' : '#64748B' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentCourier?.isAvailable ? '#16A34A' : '#94A3B8' }} className={currentCourier?.isAvailable ? 'duo-pulse' : ''} />
              <span>{currentCourier?.isAvailable ? 'Siap Antar 🟢' : 'Istirahat ⚪'}</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="responsive-main-padding pad-bottom-for-mobile-nav" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
            {activeTab !== 'dashboard' && (
              <div style={{ marginBottom: 16 }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0265DC',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ← Kembali ke Dashboard
                </button>
              </div>
            )}
            {activeTab === 'dashboard' && (
              <CourierDashboard onNavigate={(page) => {
                if (page === 'cari') setActiveTab('cari');
                else if (page === 'pengantaran') setActiveTab('antar');
                else if (page === 'pendapatan') setActiveTab('cuan');
                else if (page === 'profil') setActiveTab('profil');
              }} />
            )}
            {activeTab === 'cari' && <CourierAvailableOrders />}
            {activeTab === 'antar' && <CourierDeliveries />}
            {activeTab === 'cuan' && <CourierEarnings />}
            {activeTab === 'profil' && <CourierProfile />}
          </div>
        </main>
      </div>

      {/* Courier Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-bar" aria-label="Navigasi Kurir Mobile">
        {[
          { key: 'dashboard', label: 'Home', icon: Bike },
          { key: 'cari', label: 'Cari Order', icon: Search, badge: pendingCount },
          { key: 'antar', label: 'Pengantaran', icon: Package },
          { key: 'cuan', label: 'Saldo Cuan', icon: Wallet },
          { key: 'profil', label: 'Profil', icon: User },
        ].map(({ key, label, icon: Icon, badge }) => {
          const isSelected = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key as CourierTab)}
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
                padding: '6px 8px',
              }}
            >
              <Icon size={20} color={isSelected ? '#0265DC' : '#64748B'} />
              <span>{label}</span>
              {badge !== undefined && badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 10,
                  background: '#EA580C',
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
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
