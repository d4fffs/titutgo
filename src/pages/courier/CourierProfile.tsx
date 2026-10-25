import { LogOut, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { formatIDR } from '../../utils/currency';

export function CourierProfile() {
  const { state, currentCourier, setRole, setDemoCourier, setCourierAvailability } = useApp();

  if (!currentCourier) return null;

  const myOrders = state.orders.filter((o) => o.courierId === currentCourier.id);
  const completedOrders = myOrders.filter((o) => o.status === 'completed');
  const activeOrders = myOrders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.serviceFee, 0);

  return (
    <div style={{ padding: '20px', maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Profile Card */}
      <div className="bento-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <div
            style={{
              position: 'relative',
              width: 64,
              height: 64,
              borderRadius: 22,
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(2, 101, 220, 0.12)',
            }}
          >
            <SiTitutMascot size={52} mood="delivering" interactive />
            <span style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: currentCourier.isAvailable ? '#16A34A' : '#94A3B8',
              boxShadow: '0 0 0 2px white',
            }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
                {currentCourier.name} 🛵
              </h2>
              {currentCourier.isEnabled && (
                <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 800 }}>
                  <ShieldCheck size={13} /> Mitra Resmi PENS
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#64748B', fontFamily: 'monospace', marginTop: 3 }}>
              NIM: {currentCourier.studentId}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <span
                className={`badge ${currentCourier.isAvailable ? 'badge-success' : 'badge-danger'}`}
                style={{ fontSize: 11, fontWeight: 800 }}
              >
                {currentCourier.isAvailable ? '🟢 Siap Antar' : '⚪ Istirahat'}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle & Courier Operational Info */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 16,
          padding: '14px 18px',
          marginBottom: 16,
          boxShadow: '0 1px 4px rgba(15, 30, 61, 0.04)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>KENDARAAN & PLAT</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F1E3D', marginTop: 2 }}>Motor Honda Beat • L 4392 ZT</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>PERFORMA / RATING</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#16A34A', marginTop: 2 }}>⭐ 4.9 / 5.0 (38 Antaran)</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div style={{ textAlign: 'center', padding: '12px 10px', background: '#F8FAFC', borderRadius: 14, boxShadow: '0 1px 3px rgba(15, 30, 61, 0.04)' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0F1E3D' }}>{myOrders.length}</div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, marginTop: 2 }}>Total Tugas</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px 10px', background: '#F0FDF4', borderRadius: 14, boxShadow: '0 1px 3px rgba(15, 30, 61, 0.04)' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#16A34A' }}>{completedOrders.length}</div>
            <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, marginTop: 2 }}>Selesai ✓</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px 10px', background: '#EFF6FF', borderRadius: 14, boxShadow: '0 1px 3px rgba(15, 30, 61, 0.04)' }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#0265DC' }}>{formatIDR(totalEarnings)}</div>
            <div style={{ fontSize: 11, color: '#0265DC', fontWeight: 700, marginTop: 2 }}>Komisi 🪙</div>
          </div>
        </div>
      </div>

      {/* Status Toggle Card */}
      <div className="bento-card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0F1E3D' }}>
              Status Ketersediaan Kurir
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: 600 }}>
              {currentCourier.isAvailable
                ? '🟢 Kamu sedang online dan siap menerima notifikasi order!'
                : '⚪ Istirahat dulu sejenak setelah kuliah / praktikum.'}
            </div>
          </div>
          <button
            className={`btn btn-sm ${currentCourier.isAvailable ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 900, flexShrink: 0 }}
            onClick={() => setCourierAvailability(currentCourier.id, !currentCourier.isAvailable)}
          >
            {currentCourier.isAvailable ? 'Online (ON)' : 'Offline (OFF)'}
          </button>
        </div>
      </div>

      {/* Mascot Comic Cheer */}
      <div className="bento-card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
      }}>
        <SiTitutMascot size={50} mood={activeOrders.length > 0 ? 'delivering' : 'happy'} interactive />
        <div className="duo-speech-bubble" style={{ flex: 1, fontSize: 12.5, color: '#0265DC', fontWeight: 800 }}>
          {activeOrders.length > 0 ? (
            <>🛵 "Semangat mengantar rek! Ada {activeOrders.length} pesanan yang lagi nunggu kamu!"</>
          ) : (
            <>💬 "Hai cak {currentCourier.name.split(' ')[0]}! Yuk cek tab Cari Pesanan buat gaspol dapat komisi jastip!"</>
          )}
        </div>
      </div>

      {/* Demo Courier Switcher */}
      <div className="bento-card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 900, color: '#0F1E3D', marginBottom: 12 }}>
          Ganti Akun Demo Kurir Mitra:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {state.couriers.map((c) => (
            <button
              key={c.id}
              className={`btn btn-sm ${c.id === currentCourier.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDemoCourier(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12.5, fontWeight: 800 }}
            >
              {c.id === currentCourier.id && <CheckCircle2 size={14} />}
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Exit Role Button */}
      <button
        className="btn btn-outline"
        style={{ width: '100%', padding: '12px 18px', fontSize: 14, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onClick={() => setRole(null)}
      >
        <LogOut size={16} />
        Ganti Role Akun / Ke Beranda
      </button>
    </div>
  );
}
