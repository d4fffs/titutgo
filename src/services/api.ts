import { supabase } from '../lib/supabase';
import type { Canteen, FoodItem, Order, OrderStatus, Role, AppUser, Courier } from '../types';
import type { Database } from '../types/database.types';

// Map between DB status and Frontend status
export const dbToFrontendStatus: Record<string, OrderStatus> = {
  pending: 'pending_courier',
  confirmed: 'courier_assigned',
  preparing: 'purchasing_food',
  ready_for_pickup: 'ready_for_delivery',
  picked_up: 'delivering',
  on_delivery: 'delivering',
  delivered: 'completed',
  cancelled: 'cancelled',
};

export const frontendToDbStatus: Record<OrderStatus, string> = {
  pending_courier: 'pending',
  courier_assigned: 'confirmed',
  purchasing_food: 'preparing',
  ready_for_delivery: 'ready_for_pickup',
  delivering: 'on_delivery',
  completed: 'delivered',
  cancelled: 'cancelled',
};

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: Role;
  studentId?: string;
  studyProgram?: string;
}

export const authService = {
  async signUp(params: SignUpParams) {
    const dbRole = params.role === 'kurir' ? 'courier' : params.role;
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          phone: params.phone,
          role: dbRole,
          student_id: params.studentId || null,
          study_program: params.studyProgram || null,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
  },

  async getCurrentProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('Profile fetch error:', error);
      return null;
    }
    return data;
  },

  async updateProfile(userId: string, updates: Partial<{ full_name: string; phone: string; student_id: string; study_program: string; avatar_url: string }>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─── PROFILE SERVICE ─────────────────────────────────────────────────────────

export const profileService = {
  async fetchProfiles(): Promise<{ users: AppUser[]; couriers: Courier[] }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching profiles from DB:', error);
      return { users: [], couriers: [] };
    }

    const users: AppUser[] = [];
    const couriers: Courier[] = [];

    for (const p of data || []) {
      if (p.role === 'courier') {
        couriers.push({
          id: p.id,
          name: p.full_name,
          studentId: p.student_id || '3121500099',
          isAvailable: true,
          isEnabled: true,
          createdAt: p.created_at,
        });
      } else {
        users.push({
          id: p.id,
          name: p.full_name,
          phone: p.phone || '081234567890',
          email: p.id,
          studentId: p.student_id || undefined,
          studyProgram: p.study_program || undefined,
          role: 'user',
          isActive: true,
          favorites: [],
          savedAddresses: [],
          createdAt: p.created_at,
        });
      }
    }

    return { users, couriers };
  },
};

// ─── CANTEEN SERVICE ──────────────────────────────────────────────────────────

export const canteenService = {
  async fetchCanteens(): Promise<Canteen[]> {
    const { data, error } = await supabase
      .from('canteens')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Error fetching canteens from DB:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: String(row.id),
      name: row.name,
      description: row.description,
      location: row.location,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  },

  async createCanteen(canteen: Omit<Canteen, 'id' | 'createdAt'>): Promise<Canteen | null> {
    const { data, error } = await supabase
      .from('canteens')
      .insert({
        name: canteen.name,
        description: canteen.description,
        location: canteen.location,
        is_active: canteen.isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: String(data.id),
      name: data.name,
      description: data.description,
      location: data.location,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  },

  async updateCanteen(id: string, updates: Partial<Canteen>) {
    const numId = parseInt(id.replace('canteen-', ''), 10);
    const dbId = isNaN(numId) ? 1 : numId;

    const payload: Database['public']['Tables']['canteens']['Update'] = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { error } = await supabase.from('canteens').update(payload).eq('id', dbId);
    if (error) throw error;
  },

  async deleteCanteen(id: string) {
    const numId = parseInt(id.replace('canteen-', ''), 10);
    const dbId = isNaN(numId) ? 1 : numId;
    const { error } = await supabase.from('canteens').delete().eq('id', dbId);
    if (error) throw error;
  },
};

// ─── PRODUCT SERVICE ──────────────────────────────────────────────────────────

export const productService = {
  async fetchProducts(): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(slug)')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Error fetching products from DB:', error);
      return [];
    }

    return (data || []).map((row) => {
      // Cast category to FoodCategory
      const catSlug = (row.categories as { slug?: string } | null)?.slug || 'makanan_berat';
      return {
        id: String(row.id),
        name: row.name,
        description: row.description,
        price: row.price,
        category: catSlug as FoodItem['category'],
        canteenId: String(row.canteen_id),
        imageUrl: row.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
        isAvailable: row.is_available,
        createdAt: row.created_at,
      };
    });
  },

  async createProduct(item: Omit<FoodItem, 'id' | 'createdAt'>): Promise<FoodItem | null> {
    const canteenId = parseInt(item.canteenId.replace('canteen-', ''), 10) || 1;

    // lookup category id
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', item.category)
      .maybeSingle();

    const categoryId = catData?.id || 1;

    const { data, error } = await supabase
      .from('products')
      .insert({
        canteen_id: canteenId,
        category_id: categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.imageUrl,
        is_available: item.isAvailable,
        stock_quantity: 50,
      })
      .select('*, categories(slug)')
      .single();

    if (error) throw error;

    return {
      id: String(data.id),
      name: data.name,
      description: data.description,
      price: data.price,
      category: item.category,
      canteenId: String(data.canteen_id),
      imageUrl: data.image_url || item.imageUrl,
      isAvailable: data.is_available,
      createdAt: data.created_at,
    };
  },

  async updateProduct(id: string, updates: Partial<FoodItem>) {
    const numId = parseInt(id.replace('food-', ''), 10);
    const dbId = isNaN(numId) ? 1 : numId;

    const payload: Database['public']['Tables']['products']['Update'] = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;

    const { error } = await supabase.from('products').update(payload).eq('id', dbId);
    if (error) throw error;
  },

  async deleteProduct(id: string) {
    const numId = parseInt(id.replace('food-', ''), 10);
    const dbId = isNaN(numId) ? 1 : numId;
    const { error } = await supabase.from('products').delete().eq('id', dbId);
    if (error) throw error;
  },
};

// ─── ORDER SERVICE ────────────────────────────────────────────────────────────

export const orderService = {
  async fetchOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        order_status_history (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching orders from DB:', error);
      return [];
    }

    return (data || []).map((row) => {
      const items = (row.order_items || []).map((item) => ({
        foodItemId: String(item.product_id),
        quantity: item.quantity,
        priceAtOrder: item.unit_price_snapshot,
      }));

      const statusHistory = (row.order_status_history || []).map((h) => ({
        status: dbToFrontendStatus[h.new_status] || 'pending_courier',
        timestamp: h.created_at,
        note: h.note || undefined,
      }));

      return {
        id: String(row.id),
        orderNumber: row.order_number,
        userId: row.user_id,
        courierId: row.courier_id ? String(row.courier_id) : null,
        canteenId: String(row.canteen_id),
        items,
        deliveryPoint: row.delivery_location,
        deliveryNotes: row.customer_note || '',
        serviceFee: row.delivery_fee,
        appFee: row.jastip_fee,
        subtotal: row.subtotal,
        total: row.total_amount,
        status: dbToFrontendStatus[row.order_status] || 'pending_courier',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        statusHistory: statusHistory.length > 0 ? statusHistory : [
          {
            status: dbToFrontendStatus[row.order_status] || 'pending_courier',
            timestamp: row.created_at,
          },
        ],
      };
    });
  },

  async createOrder(order: {
    canteenId: string;
    deliveryPoint: string;
    deliveryNotes: string;
    items: { foodItemId: string; quantity: number }[];
    serviceFee: number;
    appFee?: number;
  }) {
    const canteenIdNum = parseInt(order.canteenId.replace(/\D/g, ''), 10) || 1;
    const itemsPayload = order.items.map((i) => ({
      product_id: parseInt(i.foodItemId.replace(/\D/g, ''), 10) || 1,
      quantity: i.quantity,
    }));

    // Call place_order RPC
    const { data, error } = await supabase.rpc('place_order', {
      p_canteen_id: canteenIdNum,
      p_delivery_location: order.deliveryPoint,
      p_customer_note: order.deliveryNotes || '',
      p_items: itemsPayload,
      p_delivery_fee: order.serviceFee || 3000,
      p_jastip_fee: order.appFee || 2000,
    });

    if (error) {
      console.error('place_order RPC error:', error);
      throw error;
    }

    return data as { success: boolean; order_id: number; order_number: string; total_amount: number; subtotal: number };
  },

  async updateOrderStatus(orderId: string, frontendStatus: OrderStatus, courierId?: string, note?: string) {
    let dbId: number | null = null;
    if (/^\d+$/.test(orderId)) {
      dbId = parseInt(orderId, 10);
    } else {
      const { data: ord } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderId)
        .maybeSingle();
      if (ord) dbId = ord.id;
    }

    if (!dbId) {
      const cleanNum = parseInt(orderId.replace(/\D/g, ''), 10);
      if (!isNaN(cleanNum) && cleanNum > 0 && cleanNum < 100000) {
        dbId = cleanNum;
      }
    }

    if (!dbId) {
      console.warn('Could not resolve database order ID for:', orderId);
      return;
    }

    const dbStatus = frontendToDbStatus[frontendStatus];

    // If courier is claiming order
    if (frontendStatus === 'courier_assigned') {
      try {
        const { error } = await supabase.rpc('courier_claim_order', { p_order_id: dbId });
        if (error) {
          console.warn('courier_claim_order RPC error, fallback to direct update:', error);
          throw error;
        }
        return;
      } catch (err) {
        console.warn('courier_claim_order RPC failed, trying direct update', err);
      }
    }

    // Try courier_update_task_status RPC
    try {
      const { error } = await supabase.rpc('courier_update_task_status', {
        p_order_id: dbId,
        p_new_status: dbStatus,
        p_note: note || undefined,
      });
      if (error) {
        console.warn('courier_update_task_status RPC error, attempting fallback update:', error);
        throw error;
      }
      return;
    } catch (err) {
      console.warn('courier_update_task_status RPC fallback to direct update:', err);
      // Fallback direct update
      const payload: Database['public']['Tables']['orders']['Update'] = {
        order_status: dbStatus as Database['public']['Enums']['order_status'],
      };
      if (courierId && courierId.length > 20) payload.courier_id = courierId;

      await supabase.from('orders').update(payload).eq('id', dbId);
    }
  },

  subscribeToOrders(onUpdate: () => void) {
    const channel = supabase
      .channel('public:orders:realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
