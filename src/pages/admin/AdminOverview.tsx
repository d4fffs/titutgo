import { CheckCircle, Store, Bike, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatIDR } from '../../utils/currency';
import { FOOD_CATEGORY_LABELS } from '../../data/mockData';

type AdminPage = 'overview' | 'orders' | 'menu' | 'canteens' | 'couriers' | 'users' | 'settings';

interface Props {
  onNavigate: (page: AdminPage) => void;
}

export function AdminOverview({ onNavigate }: Props) {
  const { state } = useApp();
  const { orders, foodItems, couriers, canteens } = state;

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending_courier').length,
    inDelivery: orders.filter((o) => ['courier_assigned', 'purchasing_food', 'ready_for_delivery', 'delivering'].includes(o.status)).length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    totalServiceFees: orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.serviceFee, 0),
  };

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const pendingOrders = orders.filter((o) => o.status === 'pending_courier').slice(0, 3);
  const availableCouriers = couriers.filter((c) => c.isEnabled && c.isAvailable).length;
  const activeCanteens = canteens.filter((c) => c.isActive).length;
  const availableItems = foodItems.filter((f) => f.isAvailable).length;

  const categories = Object.entries(
    foodItems.reduce<Record<string, number>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = 0;
      acc[item.category]++;
      return acc;
    }, {})
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Card with Mascot */}

      {/* Stats Bento Grid with Duolingo 3D styling */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 26 }}>
        <div className="stat-card" style={{ padding: '18px 20px' }}>
          <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 900 }}>TOTAL PESANAN</span>
          <div className="stat-card-value" style={{ fontSize: 26, fontWeight: 900, color: '#0F1E3D' }}>{stats.total}</div>
          <span className="stat-card-sub" style={{ fontSize: 11, fontWeight: 700 }}>Seluruh transaksi</span>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px' }}>
          <span className="stat-card-label" style={{ color: '#D97706', fontSize: 11, fontWeight: 900 }}>MENUNGGU KURIR</span>
          <div className="stat-card-value" style={{ color: '#D97706', fontSize: 26, fontWeight: 900 }}>{stats.pending}</div>
          <span className="stat-card-sub" style={{ fontSize: 11, fontWeight: 700 }}>Belum diambil</span>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px' }}>
          <span className="stat-card-label" style={{ color: '#0265DC', fontSize: 11, fontWeight: 900 }}>SEDANG DIKIRIM</span>
          <div className="stat-card-value" style={{ color: '#0265DC', fontSize: 26, fontWeight: 900 }}>{stats.inDelivery}</div>
          <span className="stat-card-sub" style={{ fontSize: 11, fontWeight: 700 }}>Kurir di jalan</span>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px' }}>
          <span className="stat-card-label" style={{ color: '#16A34A', fontSize: 11, fontWeight: 900 }}>SUKSES DIANTAR</span>
          <div className="stat-card-value" style={{ color: '#16A34A', fontSize: 26, fontWeight: 900 }}>{stats.completed}</div>
          <span className="stat-card-sub" style={{ fontSize: 11, fontWeight: 700 }}>Sampai tujuan</span>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px' }}>
          <span className="stat-card-label" style={{ fontSize: 11, fontWeight: 900 }}>TOTAL KOMISI</span>
          <div className="stat-card-value" style={{ fontSize: 22, fontWeight: 900, color: '#0F1E3D' }}>
            {formatIDR(stats.totalServiceFees)}
          </div>
          <span className="stat-card-sub" style={{ fontSize: 11, fontWeight: 700 }}>Total cuan jastip</span>
        </div>
      </div>

      {/* Action / Partner Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Kurir & Kantin Status Bento */}
        <div className="bento-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-navy)' }}>
              Kapasitas Mitra & Kantin
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--color-neutral-50)', borderRadius: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-dark)' }}>
                <Bike size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-navy)' }}>{availableCouriers}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>Kurir mahasiswa aktif ({couriers.filter(c => c.isEnabled).length} terdaftar)</div>
              </div>
              <button className="btn-pill" onClick={() => onNavigate('couriers')} style={{ fontSize: 11.5, padding: '4px 12px' }}>
                Kelola
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--color-neutral-50)', borderRadius: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                <Store size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-navy)' }}>{activeCanteens}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>Kantin buka ({canteens.length} total)</div>
              </div>
              <button className="btn-pill" onClick={() => onNavigate('canteens')} style={{ fontSize: 11.5, padding: '4px 12px' }}>
                Kelola
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--color-neutral-50)', borderRadius: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                <CheckCircle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-navy)' }}>{availableItems}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>Menu tersedia ({foodItems.length} di katalog)</div>
              </div>
              <button className="btn-pill" onClick={() => onNavigate('menu')} style={{ fontSize: 11.5, padding: '4px 12px' }}>
                Kelola
              </button>
            </div>
          </div>
        </div>

        {/* Category Breakdown Bento */}
        <div className="bento-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-navy)' }}>
              Komposisi Kategori Menu
            </h3>
            <button className="btn-pill" onClick={() => onNavigate('menu')} style={{ fontSize: 11.5, padding: '4px 12px' }}>
              Tambah Menu
            </button>
          </div>

          <div className="bento-num-list">
            {categories.map(([cat, count], idx) => (
              <div key={cat} className="bento-num-item">
                <div>
                  <span className="bento-num-prefix">0{idx + 1}</span>
                  <span>{FOOD_CATEGORY_LABELS[cat] ?? cat}</span>
                </div>
                <span style={{ fontWeight: 900, color: 'var(--color-navy)' }}>{count} menu</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Needs Attention Alert (if pending orders) */}
      {pendingOrders.length > 0 && (
        <div className="bento-card" style={{ padding: 24, marginBottom: 28, background: '#FFFBEB', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={20} color="#D97706" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#92400E' }}>
                Perhatian: {pendingOrders.length} Pesanan Menunggu Kurir
              </h3>
            </div>
            <button
              className="btn-pill"
              onClick={() => onNavigate('orders')}
              style={{ background: '#D97706', color: 'white', border: 'none', fontSize: 12 }}
            >
              Tugaskan Kurir
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingOrders.map((order) => {
              const user = state.users.find((u) => u.id === order.userId);
              const canteen = state.canteens.find((c) => c.id === order.canteenId);
              return (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'white', borderRadius: 12 }}>
                  <div>
                    <span className="order-id" style={{ marginRight: 8 }}>{order.id}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)' }}>
                      {user?.name} • {canteen?.name} → {order.deliveryPoint}
                    </span>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Canteen Sales Breakdown Bento Card */}
      <div className="bento-card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
              🏪 Rekapitulasi Penjualan per Kantin Kampus
            </h3>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
              Data omzet dan transaksi unik masing-masing mitra kantin PENS
            </p>
          </div>
          <button className="btn-pill" onClick={() => onNavigate('canteens')} style={{ fontSize: 12, padding: '5px 14px' }}>
            Kelola Kantin
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Kantin</th>
                <th>Lokasi Kampus</th>
                <th>Pesanan Selesai</th>
                <th>Omzet Makanan (GMV)</th>
                <th>Ongkir / Jastip</th>
                <th>Status Operasional</th>
              </tr>
            </thead>
            <tbody>
              {canteens.map((c) => {
                const cOrders = orders.filter((o) => o.canteenId === c.id);
                const compOrders = cOrders.filter((o) => o.status === 'completed');
                const foodGmv = compOrders.reduce((sum, o) => sum + o.subtotal, 0);
                const deliveryFees = compOrders.reduce((sum, o) => sum + o.serviceFee, 0);

                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 800, color: '#0F1E3D' }}>{c.name}</td>
                    <td style={{ fontSize: 12, color: '#64748B' }}>📍 {c.location}</td>
                    <td style={{ fontWeight: 700 }}>
                      {compOrders.length} <span style={{ fontSize: 11, color: '#94A3B8' }}>/ {cOrders.length} total</span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#16A34A' }}>
                      {formatIDR(foodGmv)}
                    </td>
                    <td style={{ fontWeight: 700, color: '#0284C7' }}>
                      {formatIDR(deliveryFees)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 9999,
                          background: c.isActive ? '#DCFCE7' : '#F1F5F9',
                          color: c.isActive ? '#15803D' : '#64748B',
                        }}
                      >
                        {c.isActive ? 'Buka' : 'Tutup'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders Bento */}
      <div className="bento-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-navy)' }}>
            Pesanan Terbaru Masuk
          </h3>
          <button className="btn-pill" onClick={() => onNavigate('orders')} style={{ fontSize: 12, padding: '5px 14px' }}>
            Lihat Semua Pesanan
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID Pesanan</th>
                <th>Pemesan</th>
                <th>Kantin</th>
                <th>Titik Antar</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const user = state.users.find((u) => u.id === order.userId);
                const canteen = state.canteens.find((c) => c.id === order.canteenId);
                return (
                  <tr key={order.id}>
                    <td><span className="order-id">{order.id}</span></td>
                    <td style={{ fontWeight: 700 }}>{user?.name}</td>
                    <td>{canteen?.name}</td>
                    <td>📍 {order.deliveryPoint}</td>
                    <td style={{ fontWeight: 800, color: 'var(--color-navy)' }}>{formatIDR(order.total)}</td>
                    <td><StatusBadge status={order.status} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
