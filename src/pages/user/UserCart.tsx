import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Banknote,
  QrCode,
  Building2,
  Search,
  Navigation,
  AlertTriangle,
  Loader2,
  Phone,
  User as UserIcon,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastContainer, useToast } from '../../components/shared/Toast';
import { formatIDR } from '../../utils/currency';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { SiTitutMascot } from '../../components/shared/SiTitutMascot';
import { SafeImage } from '../../components/shared/SafeImage';
import {
  fetchRoadRoute,
  computeDeliveryPricing,
  type GeoPoint,
  type DeliveryPricingResult,
} from '../../utils/deliveryPricing';
import {
  searchLocations,
  PENS_CAMPUS_LOCATIONS,
  POPULAR_SURABAYA_LOCATIONS,
  getDeviceCoordinates,
  type LocationSuggestion,
} from '../../utils/geocoding';

interface Props {
  onBack: () => void;
  onOrderPlaced: () => void;
}

export function UserCart({ onBack, onOrderPlaced }: Props) {
  const { state, updateCartQty, createOrder, currentUser, pricingConfig } = useApp();
  const { toasts, showToast, removeToast } = useToast();

  // Contact inputs
  const [recipientName, setRecipientName] = useState(currentUser?.name ?? '');
  const [recipientPhone, setRecipientPhone] = useState(currentUser?.phone ?? '0812-3456-7890');

  // Address inputs
  const defaultSaved = currentUser?.savedAddresses?.find((a) => a.isDefault) ?? currentUser?.savedAddresses?.[0];
  const [addressSearchQuery, setAddressSearchQuery] = useState(
    defaultSaved ? defaultSaved.fullAddress : PENS_CAMPUS_LOCATIONS[0].fullAddress
  );
  const [selectedAddressName, setSelectedAddressName] = useState(
    defaultSaved ? defaultSaved.fullAddress : PENS_CAMPUS_LOCATIONS[0].fullAddress
  );
  const [selectedCoordinates, setSelectedCoordinates] = useState<GeoPoint>(
    defaultSaved ? defaultSaved.coordinates : PENS_CAMPUS_LOCATIONS[0].coordinates
  );
  const [buildingFilter, setBuildingFilter] = useState<'Semua' | 'D4' | 'D3' | 'Pasca' | 'Fasilitas'>('Semua');
  const [addressDetails, setAddressDetails] = useState(defaultSaved?.streetNotes ?? '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');

  // Autocomplete UI state
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Routing & Pricing calculation state
  const [isCalculatingPricing, setIsCalculatingPricing] = useState(false);
  const [pricingResult, setPricingResult] = useState<DeliveryPricingResult | null>(null);
  const [routingError, setRoutingError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    recipientName?: string;
    recipientPhone?: string;
    address?: string;
    items?: string;
    range?: string;
  }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const cartItems = useMemo(() => {
    return state.cart
      .map((ci) => ({
        cartItem: ci,
        food: state.foodItems.find((f) => f.id === ci.foodItemId),
      }))
      .filter((ci) => ci.food !== undefined);
  }, [state.cart, state.foodItems]);

  const subtotal = cartItems.reduce(
    (sum, { cartItem, food }) => sum + food!.price * cartItem.quantity,
    0
  );

  // Detect primary canteen
  const distinctCanteenIds = Array.from(
    new Set(cartItems.map((ci) => ci.food?.canteenId).filter(Boolean))
  ) as string[];
  const canteenId = distinctCanteenIds[0] ?? '';
  const primaryCanteen = state.canteens.find((c) => c.id === canteenId);

  // Calculate dynamic delivery distance whenever destination coordinates change
  useEffect(() => {
    let isCancelled = false;

    async function calculateDistance() {
      if (!selectedCoordinates) return;
      setIsCalculatingPricing(true);
      setRoutingError(null);

      try {
        const routeData = await fetchRoadRoute(
          pricingConfig.pickupHub.coordinates,
          selectedCoordinates
        );

        if (isCancelled) return;

        const distanceKm = Number((routeData.distanceMeters / 1000).toFixed(2));
        const durationMinutes = Math.max(10, Math.round(routeData.durationSeconds / 60));

        const result = computeDeliveryPricing(
          distanceKm,
          durationMinutes,
          pricingConfig,
          routeData.routeType
        );

        setPricingResult(result);

        if (!result.isWithinRange) {
          setRoutingError(
            `Jarak tujuan (${distanceKm} km) melebihi jangkauan jastip TitutGo (maksimal ${pricingConfig.maxDistanceKm} km). Silakan pilih alamat yang lebih dekat.`
          );
        }
      } catch {
        if (!isCancelled) {
          setRoutingError('Gagal menghitung rute jalan. Silakan coba pilih alamat lain.');
        }
      } finally {
        if (!isCancelled) {
          setIsCalculatingPricing(false);
        }
      }
    }

    calculateDistance();

    return () => {
      isCancelled = true;
    };
  }, [selectedCoordinates, pricingConfig]);

  // Click outside to close location dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle location search typing with debounce
  const handleAddressInputChange = (val: string) => {
    setAddressSearchQuery(val);
    setShowDropdown(true);

    if (val.trim().length >= 2) {
      setIsSearchingLocation(true);
      const timer = setTimeout(async () => {
        const results = await searchLocations(val);
        setSuggestions(results);
        setIsSearchingLocation(false);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setSuggestions(POPULAR_SURABAYA_LOCATIONS.slice(0, 5));
    }
  };

  const handleSelectSuggestion = (loc: LocationSuggestion) => {
    setAddressSearchQuery(loc.fullAddress);
    setSelectedAddressName(loc.fullAddress);
    setSelectedCoordinates(loc.coordinates);
    setShowDropdown(false);
    showToast(`Tujuan diatur ke: ${loc.name}`, 'success');
  };

  const handleUseGPS = async () => {
    setIsLocatingGPS(true);
    try {
      const coords = await getDeviceCoordinates();
      setSelectedCoordinates(coords);
      const gpsAddress = `Lokasi GPS Terdeteksi (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}), Surabaya`;
      setAddressSearchQuery(gpsAddress);
      setSelectedAddressName(gpsAddress);
      setShowDropdown(false);
      showToast('Titik lokasi GPS berhasil diperoleh!', 'success');
    } catch {
      showToast('Izin GPS ditolak atau tidak tersedia. Silakan masukkan alamat manual.', 'error');
    } finally {
      setIsLocatingGPS(false);
    }
  };

  const deliveryFee = pricingResult?.deliveryFee ?? pricingConfig.baseFee;
  const appFee = pricingResult?.appFee ?? pricingConfig.appFee;
  const total = subtotal + (cartItems.length > 0 ? deliveryFee + appFee : 0);

  const validate = () => {
    const e: typeof errors = {};
    if (!recipientName.trim()) e.recipientName = 'Nama penerima wajib diisi';
    if (!recipientPhone.trim() || recipientPhone.length < 8)
      e.recipientPhone = 'Nomor telepon/WhatsApp aktif wajib diisi';
    if (!selectedAddressName.trim()) e.address = 'Alamat tujuan wajib dipilih';
    if (pricingResult && !pricingResult.isWithinRange) {
      e.range = `Alamat melebihi jangkauan maksimum (${pricingConfig.maxDistanceKm} km)`;
    }
    if (cartItems.length === 0) e.items = 'Keranjang belanja masih kosong';
    if (currentUser && currentUser.isActive === false) e.items = 'Akun Anda sedang dinonaktifkan';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOrder = () => {
    if (isSubmitting) return;
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmOrder = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const fullDestination = selectedAddressName;
    const fullNotes = [
      `Penerima: ${recipientName} (${recipientPhone})`,
      addressDetails ? `Detail/Patokan: ${addressDetails}` : '',
      deliveryNotes ? `Catatan: ${deliveryNotes}` : '',
      `Metode Bayar: ${paymentMethod === 'cash' ? 'Tunai COD' : 'QRIS Dinamis'}`,
    ]
      .filter(Boolean)
      .join(' • ');

    createOrder(state.cart, canteenId, fullDestination, fullNotes, {
      coordinates: selectedCoordinates,
      distanceKm: pricingResult?.distanceKm ?? 1.2,
      deliveryBaseFee: pricingResult?.baseFee,
      deliveryRatePerKm: pricingResult?.ratePerKm,
      deliveryFee,
      appFee,
    });

    showToast('Pesanan berhasil dibuat! Kawan kurir sedang bersiap 🚀', 'success');
    setShowConfirm(false);

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderPlaced();
    }, 900);
  };

  const filteredCampusSpots = useMemo(() => {
    if (buildingFilter === 'Semua') return PENS_CAMPUS_LOCATIONS.slice(0, 8);
    return PENS_CAMPUS_LOCATIONS.filter((l) => l.buildingGroup === buildingFilter);
  }, [buildingFilter]);

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
        <button className="btn-pill" onClick={onBack} style={{ marginBottom: 20 }}>
          <ArrowLeft size={16} />
          <span>Kembali ke Menu</span>
        </button>
        <div className="bento-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <SiTitutMascot size={80} mood="thinking" interactive />
          </div>
          <div
            className="duo-speech-bubble"
            style={{
              margin: '0 auto 16px',
              maxWidth: 320,
              fontSize: 13,
            }}
          >
            "Wah, keranjangmu masih kosong nih! Yuk pesan makanan enak dari kantin PENS!"
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F1E3D', marginBottom: 6 }}>
            Keranjang Masih Kosong
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748B', maxWidth: 320, margin: '0 auto 24px', fontWeight: 600 }}>
            Pilih makanan favoritmu dari tenant kampus PENS, SiTitut dan kawan kurir mahasiswa siap antar ke lab atau kelasmu!
          </p>
          <button className="btn btn-accent btn-lg" onClick={onBack}>
            <span>CARI MAKANAN SEKARANG</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', width: '100%', paddingBottom: 54 }}>
      <button className="btn-pill" onClick={onBack} style={{ marginBottom: 16 }}>
        <ArrowLeft size={15} />
        <span>Kembali ke Menu</span>
      </button>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#0265DC', padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
          <span>PENGANTARAN KAMPUS PENS SUKOLILO</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F1E3D', margin: 0 }}>
          Checkout & Titik Antar Gedung
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Pilih gedung, lab, atau ruangan tujuan di kampus PENS. Ongkir terjangkau dihitung transparan dari kantin kampus langsung ke mejamu!
        </p>
      </div>

      <div className="cart-checkout-grid">
        {/* Left Column: Cart Items + Recipient Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Bento 1: Contact Recipient */}
          <div className="bento-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F1E3D', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserIcon size={17} color="#0265DC" /> Informasi Kontak Pemesan (Mahasiswa / Sivitas PENS)
            </h3>

            <div className="cart-recipient-grid">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>Nama Lengkap *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ borderRadius: 12, padding: '9px 12px', fontSize: 13 }}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama pemesan..."
                />
                {errors.recipientName && <span className="form-error">{errors.recipientName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>Nomor WhatsApp / HP *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="tel"
                    className="form-input"
                    style={{ borderRadius: 12, padding: '9px 12px 9px 34px', fontSize: 13 }}
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>
                {errors.recipientPhone && <span className="form-error">{errors.recipientPhone}</span>}
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
              💡 Kurir akan menghubungi via WhatsApp/Telepon saat pesanan makanan tiba di lokasi Anda.
            </div>
          </div>

          {/* Bento 2: Food Items List */}
          <div className="bento-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F1E3D', margin: 0 }}>
                Menu yang Dipesan ({cartItems.length})
              </h3>
              {primaryCanteen && (
                <span style={{ fontSize: 11.5, color: '#0265DC', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Store size={13} /> {primaryCanteen.name}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cartItems.map(({ cartItem, food }) => (
                <div
                  key={food!.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <SafeImage
                    src={food!.imageUrl}
                    alt={food!.name}
                    style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F1E3D' }}>{food!.name}</div>
                    <div style={{ fontSize: 12, color: '#0265DC', fontWeight: 700 }}>
                      {formatIDR(food!.price)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F1F5F9', borderRadius: 9999, padding: 3 }}>
                    <button
                      className="btn-ghost"
                      style={{ width: 26, height: 26, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => updateCartQty(food!.id, cartItem.quantity - 1)}
                    >
                      {cartItem.quantity === 1 ? <Trash2 size={13} color="#DC2626" /> : <Minus size={13} />}
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 800, minWidth: 20, textAlign: 'center' }}>
                      {cartItem.quantity}
                    </span>
                    <button
                      className="btn-ghost"
                      style={{ width: 26, height: 26, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => updateCartQty(food!.id, cartItem.quantity + 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Destination Address & Dynamic Ongkir Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Bento 3: Destination Address Picker */}
          <div className="bento-card" style={{ padding: 22 }} ref={searchContainerRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F1E3D', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={17} color="#EA580C" /> Titik Temu & Gedung Antar di PENS
              </h3>

              <button
                type="button"
                onClick={handleUseGPS}
                disabled={isLocatingGPS}
                className="btn-pill"
                style={{ padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#0265DC' }}
                title="Gunakan titik GPS perangkat saat ini"
              >
                {isLocatingGPS ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Menemukan...
                  </>
                ) : (
                  <>
                    <Navigation size={12} /> Titik GPS
                  </>
                )}
              </button>
            </div>

            {/* Quick Filter Group by Building in PENS */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
                PILIH GEDUNG KAMPUS PENS:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['Semua', 'D4', 'D3', 'Pasca', 'Fasilitas'] as const).map((bldg) => (
                  <button
                    key={bldg}
                    type="button"
                    onClick={() => setBuildingFilter(bldg)}
                    className={buildingFilter === bldg ? 'chip active' : 'chip'}
                    style={{
                      padding: '4px 10px',
                      fontSize: 11.5,
                      fontWeight: 800,
                      borderRadius: 9999,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {bldg === 'Semua' ? '🏢 Semua Titik' : bldg === 'D4' ? 'Gedung D4 Baru' : bldg === 'D3' ? 'Gedung D3 Pusat' : bldg === 'Pasca' ? 'Pascasarjana' : 'Fasilitas & Lab'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Clickable Spots in PENS */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
                PILIHAN CEPAT LOKASI & LAB:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {filteredCampusSpots.map((spot) => {
                  const isSelected = selectedAddressName === spot.fullAddress;
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(spot)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: 9999,
                        border: isSelected ? '1px solid #0265DC' : '1px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#FFFFFF',
                        color: isSelected ? '#0265DC' : '#334155',
                        fontSize: 11.5,
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <MapPin size={11} color={isSelected ? '#0265DC' : '#94A3B8'} />
                      <span>{spot.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Address Search Input with Autocomplete */}
            <div className="form-group" style={{ position: 'relative', marginBottom: 12 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Cari Gedung, Ruang Kelas, Lab, atau Ormawa PENS</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ borderRadius: 12, padding: '10px 12px 10px 36px', fontSize: 13 }}
                  value={addressSearchQuery}
                  onChange={(e) => handleAddressInputChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length === 0) setSuggestions(PENS_CAMPUS_LOCATIONS.slice(0, 8));
                    setShowDropdown(true);
                  }}
                  placeholder="Ketik nama gedung, lab, atau ruangan..."
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 40,
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)',
                    marginTop: 4,
                    maxHeight: 250,
                    overflowY: 'auto',
                    padding: 6,
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#64748B', padding: '6px 8px', textTransform: 'uppercase' }}>
                    {isSearchingLocation ? 'Mencari lokasi di PENS...' : 'Saran Titik Temu & Lab PENS'}
                  </div>

                  {suggestions.map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => handleSelectSuggestion(loc)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <MapPin size={15} color="#0265DC" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0F1E3D' }}>{loc.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.3 }}>{loc.fullAddress}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>

            {/* Additional details (Ruangan / Nomor Meja / Lantai) */}
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Detail Meja / Ruang Kelas / Lantai (Patokan Spesifik)</label>
              <input
                className="form-input"
                style={{ borderRadius: 12, padding: '9px 12px', fontSize: 13 }}
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
                placeholder="Contoh: Lab RPL Meja Baris 2 dekat jendela / Ruang Dosen D4 Lt. 1 Meja 4"
              />
            </div>

            {/* Delivery Notes */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 12 }}>Catatan / Instruksi untuk Kurir Mahasiswa (Opsional)</label>
              <textarea
                className="form-input form-textarea"
                style={{ borderRadius: 12, minHeight: 50, fontSize: 13 }}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Contoh: Tolong titip di meja satpam lobi jika saya sedang ujian/praktikum..."
              />
            </div>
          </div>

          {/* Bento 4: Dynamic Ongkir Route & Transparent Price Breakdown */}
          <div className="bento-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F1E3D', marginBottom: 14 }}>
              Rincian Ongkir & Pembayaran
            </h3>

            {/* Pickup & Destination Distance Indicator */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 16,
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569', marginBottom: 6 }}>
                <Building2 size={14} color="#0265DC" />
                <span>Asal Pickup: <strong>{pricingConfig.pickupHub.name}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, paddingTop: 6, borderTop: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isCalculatingPricing ? (
                    <span style={{ fontSize: 12, color: '#0265DC', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                      <Loader2 size={14} className="animate-spin" /> Menghitung rute koridor kampus...
                    </span>
                  ) : (
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0F1E3D', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Navigation size={14} color="#16A34A" />
                      Jarak Koridor: {pricingResult?.distanceKm ?? '0.3'} km • Ongkir Flat Rp 2.000
                    </span>
                  )}
                </div>

                <span style={{ fontSize: 11, background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: 9999, fontWeight: 800 }}>
                  ~{pricingResult?.durationMinutes ?? 5} Menit Antar
                </span>
              </div>
            </div>

            {/* Error / Warning if out of service range */}
            {routingError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 12,
                  padding: '10px 14px',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: 12,
                  color: '#991B1B',
                  lineHeight: 1.4,
                }}
              >
                <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{routingError}</span>
              </div>
            )}

            {/* Transparent Cost Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Subtotal Makanan</span>
                <span style={{ fontWeight: 700, color: '#0F1E3D' }}>{formatIDR(subtotal)}</span>
              </div>

              {pricingConfig.ratePerKm > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Biaya Dasar Jastip Kampus</span>
                    <span style={{ fontWeight: 700, color: '#0F1E3D' }}>{formatIDR(pricingConfig.baseFee)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>
                      Tarif Jarak ({pricingResult?.billableDistanceKm ?? 1} km × {formatIDR(pricingConfig.ratePerKm)}/km)
                    </span>
                    <span style={{ fontWeight: 700, color: '#16A34A' }}>
                      {formatIDR((pricingResult?.billableDistanceKm ?? 1) * pricingConfig.ratePerKm)}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Ongkir Jastip Kampus (Flat)</span>
                  <span style={{ fontWeight: 700, color: '#16A34A' }}>{formatIDR(deliveryFee)}</span>
                </div>
              )}

              {pricingConfig.appFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Biaya Layanan Aplikasi</span>
                  <span style={{ fontWeight: 700, color: '#0F1E3D' }}>{formatIDR(pricingConfig.appFee)}</span>
                </div>
              )}

              {(pricingConfig.ratePerKm > 0 || pricingConfig.appFee > 0) && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px dashed #CBD5E1',
                    fontWeight: 700,
                    color: '#0265DC',
                  }}
                >
                  <span>Total Ongkos Kirim</span>
                  <span>{formatIDR(deliveryFee)}</span>
                </div>
              )}
            </div>

            {/* Final Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 12,
                borderTop: '2px solid #E2E8F0',
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                  Total Pembayaran Akhir
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0F1E3D' }}>
                  {formatIDR(total)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#16A34A', fontWeight: 700 }}>
                <ShieldCheck size={16} color="#16A34A" />
                <span>Harga Transparan</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: 12, marginBottom: 8 }}>Metode Pembayaran</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={paymentMethod === 'cash' ? 'chip active' : 'chip'}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <Banknote size={16} />
                  <span>Tunai (COD)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={paymentMethod === 'qris' ? 'chip active' : 'chip'}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <QrCode size={16} />
                  <span>QRIS</span>
                </button>
              </div>
            </div>

            {/* Order Action Button */}
            {errors.items && <p className="form-error" style={{ marginBottom: 12 }}>{errors.items}</p>}
            {errors.range && <p className="form-error" style={{ marginBottom: 12 }}>{errors.range}</p>}

            <button
              className="btn btn-accent btn-lg btn-full"
              style={{ fontSize: 15, padding: '14px 20px', borderRadius: 16 }}
              disabled={isSubmitting || (pricingResult !== null && !pricingResult.isWithinRange) || isCalculatingPricing}
              onClick={handleOrder}
            >
              <span>
                {isSubmitting
                  ? 'Memproses Pesanan...'
                  : isCalculatingPricing
                  ? 'Menghitung Ongkir...'
                  : `PESAN SEKARANG • ${formatIDR(total)} 🛵`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Konfirmasi Pemesanan Jastip"
          message={`Tujuan: ${selectedAddressName}\nJarak Rute: ${pricingResult?.distanceKm ?? 1.0} km\nOngkir: ${formatIDR(deliveryFee)}\nTotal Pembayaran: ${formatIDR(total)}\n\nLanjutkan pemesanan?`}
          confirmLabel="Ya, Pesan Sekarang"
          variant="primary"
          onConfirm={confirmOrder}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
