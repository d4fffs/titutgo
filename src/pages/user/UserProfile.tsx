import { useState } from 'react';
import {
  Heart,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../utils/currency';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { POPULAR_SURABAYA_LOCATIONS } from '../../utils/geocoding';
import type { SavedAddress } from '../../types';

export function UserProfile() {
  const { state, currentUser, setRole, setDemoUser, updateUser, addSavedAddress, deleteSavedAddress } =
    useApp();
  const { toasts, showToast, removeToast } = useToast();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name ?? '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone ?? '');
  const [editEmail, setEditEmail] = useState(currentUser?.email ?? '');

  // Add address modal state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Rumah');
  const [addressFull, setAddressFull] = useState('');
  const [addressNotes, setAddressNotes] = useState('');

  if (!currentUser) return null;

  const userOrders = state.orders.filter((o) => o.userId === currentUser.id);
  const completedOrders = userOrders.filter((o) => o.status === 'completed');
  const totalSpent = completedOrders.reduce((s, o) => s + o.total, 0);
  const favorites = state.foodItems.filter((f) => currentUser.favorites.includes(f.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Nama lengkap wajib diisi', 'error');
      return;
    }
    if (!editPhone.trim() || editPhone.length < 8) {
      showToast('Nomor telepon aktif wajib diisi', 'error');
      return;
    }

    updateUser({
      ...currentUser,
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || undefined,
    });

    setIsEditingProfile(false);
    showToast('Profil pelanggan berhasil diperbarui!', 'success');
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressFull.trim()) {
      showToast('Alamat lengkap wajib diisi', 'error');
      return;
    }

    // Default to PENS campus coordinates if not picked
    const matchedPreset = POPULAR_SURABAYA_LOCATIONS.find((p) =>
      addressFull.toLowerCase().includes(p.district.toLowerCase()) ||
      addressFull.toLowerCase().includes(p.name.toLowerCase())
    );

    const coords = matchedPreset ? matchedPreset.coordinates : { lat: -7.2758, lng: 112.7937 };

    const newAddr: Omit<SavedAddress, 'id'> = {
      label: addressLabel,
      fullAddress: addressFull.trim(),
      streetNotes: addressNotes.trim() || undefined,
      coordinates: coords,
      isDefault: (currentUser.savedAddresses?.length ?? 0) === 0,
    };

    addSavedAddress(newAddr);
    setShowAddAddressModal(false);
    setAddressFull('');
    setAddressNotes('');
    showToast('Alamat baru berhasil ditambahkan!', 'success');
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', paddingBottom: 48 }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
          Profil Mahasiswa & Sivitas PENS
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Kelola profil dan daftar lokasi/lab favorit pengantaran makananmu di kampus PENS.
        </p>
      </div>

      {/* Profile Card Bento */}
      <div className="bento-card" style={{ padding: '24px 26px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #0F1E3D, #0265DC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Poppins', sans-serif",
                fontSize: 26,
                fontWeight: 900,
                color: 'white',
                boxShadow: '0 8px 20px rgba(15, 30, 61, 0.14)',
              }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0F1E3D',
                }}
              >
                {currentUser.name}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap', fontSize: 12.5, color: '#64748B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={13} color="#0265DC" /> {currentUser.phone || 'Belum ada nomor HP'}
                </span>
                {currentUser.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={13} color="#64748B" /> {currentUser.email}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 800 }}>
                  ● Sivitas PENS Sukolilo
                </span>
                {currentUser.studentId && (
                  <span className="badge" style={{ background: '#F1F5F9', color: '#475569', fontSize: 11, fontWeight: 700 }}>
                    🎓 {currentUser.studyProgram ?? 'Sivitas PENS'} (NIM: {currentUser.studentId})
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            className="btn-pill"
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              setEditName(currentUser.name);
              setEditPhone(currentUser.phone);
              setEditEmail(currentUser.email ?? '');
              setIsEditingProfile(true);
            }}
          >
            <Edit2 size={14} color="#0265DC" />
            <span>Edit Kontak Profil</span>
          </button>
        </div>

        {/* Customer Operational Contacts Box */}
        <div
          style={{
            background: '#F8FAFC',
            borderRadius: 16,
            padding: '14px 18px',
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(15, 30, 61, 0.04)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
              NOMOR TELEPON AKTIF
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1E3D', marginTop: 2 }}>
              {currentUser.phone || '0812-xxxx-xxxx'}
            </div>
            <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2 }}>
              ✓ Siap digunakan kurir untuk koordinasi COD & lokasi
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
              EMAIL KONFIRMASI (OPSIONAL)
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1E3D', marginTop: 2 }}>
              {currentUser.email || 'Tidak dicantumkan'}
            </div>
          </div>

          {currentUser.studentId && (
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                IDENTITAS AKADEMIK MAHASISWA / SIVITAS PENS
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 2 }}>
                {currentUser.studyProgram ?? 'Sivitas PENS'} • {currentUser.studentId}
              </div>
            </div>
          )}
        </div>

        {/* Stats Bento */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ textAlign: 'center', padding: '14px 10px', background: '#F8FAFC', borderRadius: 16 }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 900, color: '#0F1E3D' }}>
              {userOrders.length}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginTop: 2 }}>
              Total Pesanan
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 10px', background: '#F8FAFC', borderRadius: 16 }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 900, color: '#16A34A' }}>
              {completedOrders.length}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginTop: 2 }}>
              Selesai Diantar
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 10px', background: '#F8FAFC', borderRadius: 16 }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 900, color: '#0265DC' }}>
              {formatIDR(totalSpent)}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginTop: 2 }}>
              Total Belanja
            </div>
          </div>
        </div>
      </div>

      {/* Saved Addresses Manager Bento */}
      <div className="bento-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F1E3D', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={18} color="#EA580C" /> Daftar Alamat Pengiriman Tersimpan
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0' }}>
              Alamat terpisah dari identitas akun. Kamu dapat memilih alamat berbeda saat checkout.
            </p>
          </div>

          <button
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowAddAddressModal(true)}
          >
            <Plus size={14} />
            <span>Tambah Alamat</span>
          </button>
        </div>

        {currentUser.savedAddresses && currentUser.savedAddresses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentUser.savedAddresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 900, background: '#EFF6FF', color: '#0265DC', padding: '2px 8px', borderRadius: 9999 }}>
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle2 size={12} /> Utama
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F1E3D', marginTop: 4 }}>
                    {addr.fullAddress}
                  </div>
                  {addr.streetNotes && (
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Patokan: {addr.streetNotes}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    deleteSavedAddress(addr.id);
                    showToast(`Alamat "${addr.label}" dihapus`, 'success');
                  }}
                  className="btn-ghost"
                  style={{ color: '#DC2626', padding: 8, borderRadius: 8 }}
                  title="Hapus alamat ini"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 10px', color: '#64748B', fontSize: 13 }}>
            Belum ada alamat tersimpan. Klik "+ Tambah Alamat" untuk menyimpan alamat rumah, kost, atau kantormu.
          </div>
        )}
      </div>

      {/* Switch Demo User Bento */}
      <div className="bento-card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0F1E3D', marginBottom: 10 }}>
          Ganti Akun Demo Pelanggan
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {state.users.map((u) => (
            <button
              key={u.id}
              className={`chip ${u.id === currentUser.id ? 'active' : ''}`}
              onClick={() => {
                setDemoUser(u.id);
                showToast(`Beralih ke akun ${u.name}`, 'success');
              }}
            >
              {u.name} {u.phone ? `(${u.phone})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Favorites Bento */}
      {favorites.length > 0 && (
        <div className="bento-card" style={{ padding: '20px 22px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Heart size={16} color="#DC2626" fill="#DC2626" />
            <span style={{ fontSize: 14, fontWeight: 800, color: '#0F1E3D' }}>
              Menu Favorit ({favorites.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {favorites.map((food) => {
              const canteen = state.canteens.find((c) => c.id === food.canteenId);
              return (
                <div key={food.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                  <img
                    src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                    alt={food.name}
                    style={{ width: 44, height: 40, objectFit: 'cover', borderRadius: 10 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F1E3D' }}>{food.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B' }}>{canteen?.name}</div>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F1E3D' }}>{formatIDR(food.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Logout / Switch Role Action */}
      <button
        className="btn-pill btn-pill-primary"
        style={{ width: '100%', justifyContent: 'space-between', padding: '12px 14px 12px 22px' }}
        onClick={() => setRole(null)}
      >
        <span>Ganti Peran Akun</span>
        <div className="btn-pill-circle-icon">
          <LogOut size={14} />
        </div>
      </button>

      {/* Modal: Edit Customer Profile Contacts */}
      {isEditingProfile && (
        <div className="modal-overlay" onClick={() => setIsEditingProfile(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Informasi Kontak Pelanggan</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setIsEditingProfile(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor WhatsApp / HP Aktif *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    required
                  />
                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    Digunakan kurir untuk konfirmasi dan koordinasi pengantaran makanan.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Email (Opsional)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="nama@email.com"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsEditingProfile(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Saved Delivery Address */}
      {showAddAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddAddressModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Tambah Alamat Pengantaran</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowAddAddressModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateAddress}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Label Titik Kampus PENS</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Gedung D4', 'Gedung D3', 'Gedung Pasca', 'Lab', 'Ormawa / Hall', 'Lainnya'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddressLabel(lbl)}
                        className={`chip ${addressLabel === lbl ? 'active' : ''}`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Gedung, Lab, atau Ruangan di PENS *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressFull}
                    onChange={(e) => setAddressFull(e.target.value)}
                    placeholder="Contoh: Lab AI & RPL, Gedung D4 Baru Lt. 2, Kampus PENS"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detail Meja / Patokan Ruangan (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressNotes}
                    onChange={(e) => setAddressNotes(e.target.value)}
                    placeholder="Contoh: Meja praktikum sisi barat dekat jendela"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddAddressModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
