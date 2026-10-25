import { useState } from 'react';
import { MapPin, Store, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR, SERVICE_FEE } from '../../utils/currency';
import type { Order } from '../../types';

function OrderCard({ order, onAccept }: { order: Order; onAccept: () => void }) {
  const { state } = useApp();
  const canteen = state.canteens.find((c) => c.id === order.canteenId);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="order-card" style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '18px 20px',
        boxShadow: '0 2px 12px rgba(15, 30, 61, 0.05)',
      }}>
        <div className="order-card-header" style={{ marginBottom: 12 }}>
          <div>
            <div className="order-id" style={{ fontSize: 15, fontWeight: 900, color: '#0F1E3D' }}>{order.id}</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              {new Date(order.createdAt).toLocaleString('id-ID', { timeStyle: 'short' })}
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: 13, fontWeight: 900, padding: '4px 10px' }}>
            +{formatIDR(SERVICE_FEE)} 🪙
          </span>
        </div>

        {/* Items */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            ITEM PESANAN
          </div>
          {order.items.map((item, idx) => {
            const food = state.foodItems.find((f) => f.id === item.foodItemId);
            return (
              <div key={idx} style={{ fontSize: 13.5, color: '#0F1E3D', fontWeight: 700, marginBottom: 4 }}>
                🍴 {food?.name ?? item.foodItemId} × {item.quantity}
                <span style={{ fontSize: 12, color: '#64748B', marginLeft: 6, fontWeight: 600 }}>({formatIDR(item.priceAtOrder * item.quantity)})</span>
              </div>
            );
          })}
        </div>

        {/* Locations */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 14,
          padding: '12px 14px',
          background: '#F8FAFC',
          borderRadius: 14,
          border: '1.5px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Store size={15} color="#0265DC" />
            <span style={{ fontWeight: 800, color: '#0F1E3D' }}>Ambil:</span>
            <span style={{ color: '#475569', fontWeight: 600 }}>{canteen?.name ?? '-'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <MapPin size={15} color="#EA580C" />
            <span style={{ fontWeight: 800, color: '#0F1E3D' }}>Antar:</span>
            <span style={{ color: '#475569', fontWeight: 600 }}>{order.deliveryPoint}</span>
          </div>
        </div>

        {order.deliveryNotes && (
          <div className="duo-speech-bubble" style={{
            marginBottom: 14,
            padding: '8px 12px',
            fontSize: 12,
            color: '#B45309',
            background: '#FEF3C7',
            borderColor: '#FDE68A',
            borderBottomColor: '#FCD34D',
            fontWeight: 700,
          }}>
            📝 {order.deliveryNotes}
          </div>
        )}

        <button className="btn btn-accent btn-full" style={{ padding: '12px 16px', fontSize: 14, fontWeight: 900 }} onClick={() => setShowConfirm(true)}>
          Ambil Pesanan Ini 🛵
        </button>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Terima Pesanan Ini? 🛵"
          message={`Terima pesanan ${order.id}? Kamu akan mengambil makanan dari ${canteen?.name ?? 'Kantin'} dan mengantarkannya ke ${order.deliveryPoint}.`}
          confirmLabel="Gas, Ambil Order! 🚀"
          variant="primary"
          onConfirm={() => { onAccept(); setShowConfirm(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

export function CourierAvailableOrders() {
  const { state, currentCourier, transitionOrder } = useApp();
  const { toasts, showToast, removeToast } = useToast();

  const availableOrders = state.orders.filter((o) => o.status === 'pending_courier');

  const handleAccept = (order: Order) => {
    if (!currentCourier?.isAvailable || !currentCourier?.isEnabled) {
      showToast('Aktifkan status tersedia terlebih dahulu!', 'error');
      return;
    }
    transitionOrder(order.id, 'courier_assigned', currentCourier.id);
    showToast(`Pesanan ${order.id} berhasil kamu ambil! Semangat! 🎉`, 'success');
  };

  if (!currentCourier?.isAvailable || !currentCourier?.isEnabled) {
    return (
      <div style={{ padding: '20px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F1E3D', marginBottom: 16 }}>Cari Pesanan 🛵</h2>
        <div className="empty-state bento-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <SiTitutMascot size={72} mood="sad" interactive />
          <div className="empty-state-title" style={{ fontSize: 18, fontWeight: 900, color: '#0F1E3D', marginTop: 14 }}>
            {!currentCourier?.isEnabled ? 'Akunmu Belum Aktif' : 'Kamu Sedang Istirahat 💤'}
          </div>
          <div className="duo-speech-bubble" style={{ marginTop: 12, display: 'inline-block', fontSize: 13, color: '#475569' }}>
            {!currentCourier?.isEnabled
              ? 'Hubungi admin kampus untuk verifikasi dan aktivasi akun kurirmu ya!'
              : 'Aktifkan status "Siap Antar" di toggle atas untuk mulai menerima orderan!'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: 750, margin: '0 auto' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header Banner */}
      <div className="bento-card" style={{
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SiTitutMascot size={46} mood="delivering" />
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>Pesanan Tersedia 🛵</h2>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Rute searah jalan kaki area PENS</div>
          </div>
        </div>
        <span className="badge badge-accent" style={{ fontSize: 12, fontWeight: 900 }}>
          {availableOrders.length} Pesanan Antri
        </span>
      </div>

      {availableOrders.length === 0 ? (
        <div className="empty-state bento-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <SiTitutMascot size={72} mood="thinking" interactive />
          <div className="empty-state-title" style={{ fontSize: 18, fontWeight: 900, color: '#0F1E3D', marginTop: 14 }}>
            Belum Ada Pesanan Antri
          </div>
          <div className="duo-speech-bubble" style={{ marginTop: 12, display: 'inline-block', fontSize: 13, color: '#475569' }}>
            "Kantin lagi sepi nih rek. Tetap standby ya, bentar lagi pasti ada yang nitip!" 🍜
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {availableOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={() => handleAccept(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
