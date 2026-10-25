// ─── Role Types ───────────────────────────────────────────────────────────────

export type Role = 'admin' | 'kurir' | 'user';

// ─── Order Status ─────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_courier'
  | 'courier_assigned'
  | 'purchasing_food'
  | 'ready_for_delivery'
  | 'delivering'
  | 'completed'
  | 'cancelled';

// ─── Food Category ────────────────────────────────────────────────────────────

export type FoodCategory =
  | 'makanan_berat'
  | 'makanan_ringan'
  | 'minuman'
  | 'dessert'
  | 'sarapan';

// ─── Canteen ──────────────────────────────────────────────────────────────────

export interface Canteen {
  id: string;
  name: string;
  description: string;
  location: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Food Item ────────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  canteenId: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
}

import type { GeoPoint, DeliveryPricingConfig, DeliveryPricingSnapshot } from '../utils/deliveryPricing';

// ─── User & Customer Profile ──────────────────────────────────────────────────

export interface SavedAddress {
  id: string;
  label: string; // 'Rumah' | 'Kantor' | 'Kost' | 'Kampus' | dll
  fullAddress: string;
  streetNotes?: string; // No rumah, patokan, gedung, lantai
  coordinates: GeoPoint;
  isDefault?: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  phone: string; // Nomor HP aktif untuk koordinasi pengantaran (wajib)
  email?: string;
  studentId?: string; // Optional: untuk akun mahasiswa lama / opsional sivitas
  studyProgram?: string; // Optional: program studi jika mahasiswa
  userType?: 'umum' | 'mahasiswa'; // Tipe pelanggan
  role: 'user';
  isActive: boolean;
  favorites: string[];
  savedAddresses?: SavedAddress[];
  createdAt: string;
}

// ─── Courier ──────────────────────────────────────────────────────────────────

export interface Courier {
  id: string;
  name: string;
  studentId: string;
  isAvailable: boolean;
  isEnabled: boolean;
  createdAt: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  foodItemId: string;
  quantity: number;
  priceAtOrder: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  courierId: string | null;
  items: OrderItem[];
  canteenId: string;
  deliveryPoint: string;
  deliveryNotes: string;
  deliveryCoordinates?: GeoPoint;
  deliveryDistanceKm?: number; // Jarak rute jalan riil (km)
  deliveryBaseFee?: number; // Biaya dasar saat transaksi dibuat
  deliveryRatePerKm?: number; // Tarif per km saat transaksi dibuat
  serviceFee: number; // Komisi ongkir pengantaran kurir
  appFee?: number; // Biaya layanan aplikasi jika ada
  subtotal: number;
  total: number;
  status: OrderStatus;
  pricingSnapshot?: DeliveryPricingSnapshot;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  foodItemId: string;
  quantity: number;
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  currentRole: Role | null;
  currentUserId: string | null;
  currentCourierId: string | null;
  users: AppUser[];
  couriers: Courier[];
  canteens: Canteen[];
  foodItems: FoodItem[];
  orders: Order[];
  cart: CartItem[];
  pricingConfig: DeliveryPricingConfig;
  demoVersion: number;
}

// ─── Delivery Points (Gedung & Lab Resmi PENS Sukolilo untuk Pilihan Cepat) ───

export const DELIVERY_POINTS = [
  // Gedung D3 PENS
  'Gedung D3 - Lobby Utama Lt. 1',
  'Gedung D3 - Lab Komputer & Multimedia (Lt. 2)',
  'Gedung D3 - Lab Telekomunikasi (Lt. 3)',
  'Gedung D3 - Perpustakaan D3 (Lt. 2)',
  'Gedung D3 - Ruang HIMA & Ormawa',
  // Gedung D4 PENS
  'Gedung D4 - Lobby Gedung D4 Baru (Lt. 1)',
  'Gedung D4 - Lab Sistem Tenaga Listrik / STL (Lt. 3)',
  'Gedung D4 - Lab AI & Rekayasa Perangkat Lunak (Lt. 2)',
  'Gedung D4 - Lab DSP & Elektronika Digital (Lt. 2)',
  'Gedung D4 - Ruang Dosen & Administrasi (Lt. 1)',
  // Gedung Pascasarjana (13 Lantai)
  'Gedung Pascasarjana - Lobby Utama Lt. 1',
  'Gedung Pascasarjana - Perpustakaan Pasca (Lt. 2)',
  'Gedung Pascasarjana - Innovation & Startup Space (Lt. 5)',
  'Gedung Pascasarjana - Mini Theater PENS (Lt. 6)',
  'Gedung Pascasarjana - Lab Riset Terapan (Lt. 8)',
  // Fasilitas Kampus & Pusat Kegiatan
  'Gedung Kemahasiswaan & BEM PENS',
  'Hall & Lapangan Merah PENS (Red Square)',
  'Workshop Mekatronika & Lab Robotika (EROC)',
  'Masjid An-Nahl PENS',
  'Gazebo Taman PENS & Student Corner',
] as const;

export type DeliveryPoint = typeof DELIVERY_POINTS[number];

