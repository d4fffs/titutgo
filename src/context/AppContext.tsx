import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AppState, Role, Order, OrderStatus, FoodItem, Canteen, Courier, AppUser, CartItem, OrderItem, SavedAddress } from '../types';
import {
  INITIAL_CANTEENS,
  INITIAL_FOOD_ITEMS,
  INITIAL_USERS,
  INITIAL_COURIERS,
  INITIAL_ORDERS,
  DEFAULT_DEMO_USER_ID,
  DEFAULT_DEMO_COURIER_ID,
} from '../data/mockData';
import { loadState, saveState, clearState } from '../utils/storage';
import { canTransition } from '../utils/orderTransitions';
import {
  DEFAULT_PRICING_CONFIG,
  computeDeliveryPricing,
  createDeliveryPricingSnapshot,
  type DeliveryPricingConfig,
  type GeoPoint,
} from '../utils/deliveryPricing';
import { supabase } from '../lib/supabase';
import {
  canteenService,
  productService,
  orderService,
  profileService,
  authService,
  type SignUpParams,
} from '../services/api';

// ─── Initial State ────────────────────────────────────────────────────────────

const DEMO_VERSION = 11; // Bump version for strict session isolation

function getInitialState(): AppState {
  const saved = loadState();
  if (saved && saved.demoVersion === DEMO_VERSION) {
    return {
      currentRole: null, // Always require explicit role/login on fresh boot
      currentUserId: saved.currentUserId ?? DEFAULT_DEMO_USER_ID,
      currentCourierId: saved.currentCourierId ?? DEFAULT_DEMO_COURIER_ID,
      users: saved.users ?? INITIAL_USERS,
      couriers: saved.couriers ?? INITIAL_COURIERS,
      canteens: saved.canteens ?? INITIAL_CANTEENS,
      foodItems: saved.foodItems ?? INITIAL_FOOD_ITEMS,
      orders: [], // Orders must be fetched per authenticated session from Supabase RLS
      cart: [], // Cart is isolated per session and never leaked
      pricingConfig: saved.pricingConfig ?? DEFAULT_PRICING_CONFIG,
      demoVersion: DEMO_VERSION,
    };
  }
  return {
    currentRole: null,
    currentUserId: DEFAULT_DEMO_USER_ID,
    currentCourierId: DEFAULT_DEMO_COURIER_ID,
    users: INITIAL_USERS,
    couriers: INITIAL_COURIERS,
    canteens: INITIAL_CANTEENS,
    foodItems: INITIAL_FOOD_ITEMS,
    orders: [],
    cart: [],
    pricingConfig: DEFAULT_PRICING_CONFIG,
    demoVersion: DEMO_VERSION,
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_ROLE'; role: Role | null }
  | { type: 'SET_DEMO_USER'; userId: string }
  | { type: 'SET_DEMO_COURIER'; courierId: string }
  | { type: 'RESET_DEMO' }
  // DB Sync
  | { type: 'SET_USERS'; users: AppUser[] }
  | { type: 'SET_COURIERS'; couriers: Courier[] }
  | { type: 'SET_CANTEENS'; canteens: Canteen[] }
  | { type: 'SET_FOOD_ITEMS'; items: FoodItem[] }
  | { type: 'SET_ORDERS'; orders: Order[] }
  // Orders
  | { type: 'CREATE_ORDER'; order: Order }
  | { type: 'TRANSITION_ORDER'; orderId: string; status: OrderStatus; courierId?: string; note?: string }
  // Cart
  | { type: 'ADD_TO_CART'; foodItemId: string }
  | { type: 'REMOVE_FROM_CART'; foodItemId: string }
  | { type: 'UPDATE_CART_QTY'; foodItemId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  // Food Items
  | { type: 'ADD_FOOD_ITEM'; item: FoodItem }
  | { type: 'UPDATE_FOOD_ITEM'; item: FoodItem }
  | { type: 'DELETE_FOOD_ITEM'; id: string }
  // Canteens
  | { type: 'ADD_CANTEEN'; canteen: Canteen }
  | { type: 'UPDATE_CANTEEN'; canteen: Canteen }
  | { type: 'DELETE_CANTEEN'; id: string }
  // Couriers
  | { type: 'UPDATE_COURIER'; courier: Courier }
  // Users & Profiles
  | { type: 'UPDATE_USER'; user: AppUser }
  | { type: 'ADD_SAVED_ADDRESS'; userId: string; address: SavedAddress }
  | { type: 'DELETE_SAVED_ADDRESS'; userId: string; addressId: string }
  // Favorites
  | { type: 'TOGGLE_FAVORITE'; userId: string; foodItemId: string }
  // Courier availability
  | { type: 'SET_COURIER_AVAILABILITY'; courierId: string; isAvailable: boolean }
  // Pricing Configuration
  | { type: 'UPDATE_PRICING_CONFIG'; config: Partial<DeliveryPricingConfig> };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.role };

    case 'SET_DEMO_USER':
      return { ...state, currentUserId: action.userId };

    case 'SET_DEMO_COURIER':
      return { ...state, currentCourierId: action.courierId };

    case 'RESET_DEMO':
      clearState();
      return {
        currentRole: null,
        currentUserId: DEFAULT_DEMO_USER_ID,
        currentCourierId: DEFAULT_DEMO_COURIER_ID,
        users: INITIAL_USERS,
        couriers: INITIAL_COURIERS,
        canteens: INITIAL_CANTEENS,
        foodItems: INITIAL_FOOD_ITEMS,
        orders: INITIAL_ORDERS,
        cart: [],
        pricingConfig: DEFAULT_PRICING_CONFIG,
        demoVersion: DEMO_VERSION,
      };

    case 'SET_USERS':
      return { ...state, users: action.users };

    case 'SET_COURIERS':
      return { ...state, couriers: action.couriers };

    case 'SET_CANTEENS':
      return { ...state, canteens: action.canteens };

    case 'SET_FOOD_ITEMS':
      return { ...state, foodItems: action.items };

    case 'SET_ORDERS':
      return { ...state, orders: action.orders };

    case 'CREATE_ORDER':
      return { ...state, orders: [action.order, ...state.orders], cart: [] };

    case 'TRANSITION_ORDER': {
      const now = new Date().toISOString();
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== action.orderId) return o;
          const currentRole = state.currentRole ?? 'user';
          if (!canTransition(o.status, action.status, currentRole)) return o;
          return {
            ...o,
            status: action.status,
            courierId: action.courierId !== undefined ? action.courierId : o.courierId,
            updatedAt: now,
            statusHistory: [
              ...o.statusHistory,
              { status: action.status, timestamp: now, note: action.note },
            ],
          };
        }),
      };
    }

    case 'ADD_TO_CART': {
      const existing = state.cart.find((c) => c.foodItemId === action.foodItemId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.foodItemId === action.foodItemId
              ? { ...c, quantity: c.quantity + 1 }
              : c
          ),
        };
      }
      return { ...state, cart: [...state.cart, { foodItemId: action.foodItemId, quantity: 1 }] };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((c) => c.foodItemId !== action.foodItemId) };

    case 'UPDATE_CART_QTY':
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter((c) => c.foodItemId !== action.foodItemId) };
      }
      return {
        ...state,
        cart: state.cart.map((c) =>
          c.foodItemId === action.foodItemId ? { ...c, quantity: action.quantity } : c
        ),
      };

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'ADD_FOOD_ITEM':
      return { ...state, foodItems: [...state.foodItems, action.item] };

    case 'UPDATE_FOOD_ITEM':
      return {
        ...state,
        foodItems: state.foodItems.map((f) => (f.id === action.item.id ? action.item : f)),
      };

    case 'DELETE_FOOD_ITEM':
      return { ...state, foodItems: state.foodItems.filter((f) => f.id !== action.id) };

    case 'ADD_CANTEEN':
      return { ...state, canteens: [...state.canteens, action.canteen] };

    case 'UPDATE_CANTEEN':
      return {
        ...state,
        canteens: state.canteens.map((c) => (c.id === action.canteen.id ? action.canteen : c)),
      };

    case 'DELETE_CANTEEN':
      return { ...state, canteens: state.canteens.filter((c) => c.id !== action.id) };

    case 'UPDATE_COURIER':
      return {
        ...state,
        couriers: state.couriers.map((c) => (c.id === action.courier.id ? action.courier : c)),
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.user.id ? action.user : u)),
      };

    case 'ADD_SAVED_ADDRESS':
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId
            ? { ...u, savedAddresses: [...(u.savedAddresses ?? []), action.address] }
            : u
        ),
      };

    case 'DELETE_SAVED_ADDRESS':
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId
            ? { ...u, savedAddresses: (u.savedAddresses ?? []).filter((a) => a.id !== action.addressId) }
            : u
        ),
      };

    case 'TOGGLE_FAVORITE': {
      return {
        ...state,
        users: state.users.map((u) => {
          if (u.id !== action.userId) return u;
          const isFav = u.favorites.includes(action.foodItemId);
          return {
            ...u,
            favorites: isFav
              ? u.favorites.filter((id) => id !== action.foodItemId)
              : [...u.favorites, action.foodItemId],
          };
        }),
      };
    }

    case 'SET_COURIER_AVAILABILITY':
      return {
        ...state,
        couriers: state.couriers.map((c) =>
          c.id === action.courierId ? { ...c, isAvailable: action.isAvailable } : c
        ),
      };

    case 'UPDATE_PRICING_CONFIG':
      return {
        ...state,
        pricingConfig: {
          ...state.pricingConfig,
          ...action.config,
        },
      };

    default:
      return state;
  }
}

// ─── Order Creation Input Meta ────────────────────────────────────────────────

export interface OrderDeliveryMeta {
  coordinates?: GeoPoint;
  distanceKm?: number;
  deliveryBaseFee?: number;
  deliveryRatePerKm?: number;
  deliveryFee?: number;
  appFee?: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface AppProfile {
  id: string;
  full_name: string;
  phone?: string | null;
  role: 'user' | 'courier' | 'admin';
  student_id?: string | null;
  study_program?: string | null;
  avatar_url?: string | null;
}

interface AppContextValue {
  state: AppState;
  setRole: (role: Role | null) => void;
  setDemoUser: (userId: string) => void;
  setDemoCourier: (courierId: string) => void;
  resetDemo: () => void;
  createOrder: (
    items: CartItem[],
    canteenId: string,
    deliveryPoint: string,
    deliveryNotes: string,
    meta?: OrderDeliveryMeta
  ) => void;
  transitionOrder: (orderId: string, status: OrderStatus, courierId?: string, note?: string) => void;
  addToCart: (foodItemId: string) => void;
  removeFromCart: (foodItemId: string) => void;
  updateCartQty: (foodItemId: string, quantity: number) => void;
  clearCart: () => void;
  addFoodItem: (item: Omit<FoodItem, 'id' | 'createdAt'>) => void;
  updateFoodItem: (item: FoodItem) => void;
  deleteFoodItem: (id: string) => void;
  addCanteen: (canteen: Omit<Canteen, 'id' | 'createdAt'>) => void;
  updateCanteen: (canteen: Canteen) => void;
  deleteCanteen: (id: string) => void;
  updateCourier: (courier: Courier) => void;
  updateUser: (user: AppUser) => void;
  addSavedAddress: (address: Omit<SavedAddress, 'id'>) => void;
  deleteSavedAddress: (addressId: string) => void;
  toggleFavorite: (foodItemId: string) => void;
  setCourierAvailability: (courierId: string, isAvailable: boolean) => void;
  updatePricingConfig: (config: Partial<DeliveryPricingConfig>) => void;
  // Helpers
  currentUser: AppUser | null;
  currentCourier: Courier | null;
  cartTotal: number;
  cartSubtotal: number;
  cartCount: number;
  pricingConfig: DeliveryPricingConfig;
  // Supabase Auth Integration
  authUser: User | null;
  authProfile: AppProfile | null;
  isAuthLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOut: () => Promise<void>;
  isDbConnected: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authProfile, setAuthProfile] = useState<AppProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // 1. Initial Load: Auth Session & DB Data
  useEffect(() => {
    let isMounted = true;

    async function initAuthAndData() {
      try {
        // Check session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user && isMounted) {
          const user = sessionData.session.user;
          setAuthUser(user);
          const profile = await authService.getCurrentProfile(user.id);
          if (profile && isMounted) {
            setAuthProfile(profile as AppProfile);
            const appRole: Role = profile.role === 'courier' ? 'kurir' : (profile.role as Role);
            dispatch({ type: 'SET_ROLE', role: appRole });
            if (profile.role === 'courier') {
              dispatch({ type: 'SET_DEMO_COURIER', courierId: profile.id });
            } else {
              dispatch({ type: 'SET_DEMO_USER', userId: profile.id });
            }
          }
        }

        // Fetch Profiles from DB
        const { users: dbUsers, couriers: dbCouriers } = await profileService.fetchProfiles();
        if (dbUsers.length > 0 && isMounted) {
          dispatch({ type: 'SET_USERS', users: dbUsers });
        }
        if (dbCouriers.length > 0 && isMounted) {
          dispatch({ type: 'SET_COURIERS', couriers: dbCouriers });
        }

        // Fetch Canteens from DB
        const canteens = await canteenService.fetchCanteens();
        if (canteens.length > 0 && isMounted) {
          dispatch({ type: 'SET_CANTEENS', canteens });
          setIsDbConnected(true);
        }

        // Fetch Products from DB
        const products = await productService.fetchProducts();
        if (products.length > 0 && isMounted) {
          dispatch({ type: 'SET_FOOD_ITEMS', items: products });
        }

        // Fetch Orders from DB
        const orders = await orderService.fetchOrders();
        if (isMounted) {
          dispatch({ type: 'SET_ORDERS', orders });
        }
      } catch (err) {
        console.warn('Database initialization note:', err);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }

    initAuthAndData();

    // Listen to Supabase Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setAuthUser(null);
        setAuthProfile(null);
        dispatch({ type: 'CLEAR_CART' });
        dispatch({ type: 'SET_ORDERS', orders: [] });
      } else if (session?.user) {
        setAuthUser(session.user);
        const profile = await authService.getCurrentProfile(session.user.id);
        if (profile && isMounted) {
          setAuthProfile(profile as AppProfile);
          const appRole: Role = profile.role === 'courier' ? 'kurir' : (profile.role as Role);
          dispatch({ type: 'SET_ROLE', role: appRole });
          if (profile.role === 'courier') {
            dispatch({ type: 'SET_DEMO_COURIER', courierId: profile.id });
          } else {
            dispatch({ type: 'SET_DEMO_USER', userId: profile.id });
          }
        }
        try {
          const freshOrders = await orderService.fetchOrders();
          if (isMounted) {
            dispatch({ type: 'SET_ORDERS', orders: freshOrders });
          }
        } catch {
          // ignore error if network is offline
        }
      }
    });

    // Realtime subscription for Orders
    const unsubscribeOrders = orderService.subscribeToOrders(async () => {
      try {
        const freshOrders = await orderService.fetchOrders();
        if (isMounted) {
          dispatch({ type: 'SET_ORDERS', orders: freshOrders });
        }
      } catch (err) {
        console.error('Realtime order sync error:', err);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      unsubscribeOrders();
    };
  }, []);

  // Persist state to localStorage (strictly exclude session-specific orders, cart, and role to prevent cross-account leaks)
  useEffect(() => {
    const { currentRole: _role, orders: _orders, cart: _cart, ...toSave } = state;
    saveState({ ...toSave, currentRole: null });
  }, [state]);

  // Auth Functions
  const signIn = useCallback(async (email: string, password: string) => {
    const data = await authService.signIn(email, password);
    if (data.user) {
      setAuthUser(data.user);
      const profile = await authService.getCurrentProfile(data.user.id);
      if (profile) {
        setAuthProfile(profile as AppProfile);
        const appRole: Role = profile.role === 'courier' ? 'kurir' : (profile.role as Role);
        dispatch({ type: 'SET_ROLE', role: appRole });
        if (profile.role === 'courier') {
          dispatch({ type: 'SET_DEMO_COURIER', courierId: profile.id });
        } else {
          dispatch({ type: 'SET_DEMO_USER', userId: profile.id });
        }
      }
      // Guarantee session isolation: clear previous cart and load only this user's DB orders
      dispatch({ type: 'CLEAR_CART' });
      try {
        const freshOrders = await orderService.fetchOrders();
        dispatch({ type: 'SET_ORDERS', orders: freshOrders });
      } catch (err) {
        console.warn('Order fetch after signin note:', err);
      }
    }
  }, []);

  const signUp = useCallback(async (params: SignUpParams) => {
    const data = await authService.signUp(params);
    if (data.user) {
      setAuthUser(data.user);
      const profile = await authService.getCurrentProfile(data.user.id);
      if (profile) {
        setAuthProfile(profile as AppProfile);
        const appRole: Role = profile.role === 'courier' ? 'kurir' : (profile.role as Role);
        dispatch({ type: 'SET_ROLE', role: appRole });
        if (profile.role === 'courier') {
          dispatch({ type: 'SET_DEMO_COURIER', courierId: profile.id });
        } else {
          dispatch({ type: 'SET_DEMO_USER', userId: profile.id });
        }
      }
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'SET_ORDERS', orders: [] });
    }
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setAuthUser(null);
    setAuthProfile(null);
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'SET_ORDERS', orders: [] });
    dispatch({ type: 'SET_ROLE', role: null });
    clearState();
  }, []);

  const setRole = useCallback((role: Role | null) => dispatch({ type: 'SET_ROLE', role }), []);
  const setDemoUser = useCallback((userId: string) => dispatch({ type: 'SET_DEMO_USER', userId }), []);
  const setDemoCourier = useCallback((courierId: string) => dispatch({ type: 'SET_DEMO_COURIER', courierId }), []);
  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO' }), []);

  const createOrder = useCallback(
    async (
      items: CartItem[],
      canteenId: string,
      deliveryPoint: string,
      deliveryNotes: string,
      meta?: OrderDeliveryMeta
    ) => {
      const foodItems = state.foodItems;
      const orderItems: OrderItem[] = items.map((ci) => {
        const food = foodItems.find((f) => f.id === ci.foodItemId);
        return {
          foodItemId: ci.foodItemId,
          quantity: ci.quantity,
          priceAtOrder: food?.price ?? 0,
        };
      });
      const subtotal = orderItems.reduce((sum, i) => sum + i.priceAtOrder * i.quantity, 0);

      const distanceKm = meta?.distanceKm && meta.distanceKm > 0 ? meta.distanceKm : 1.0;
      const pricingResult = computeDeliveryPricing(distanceKm, 15, state.pricingConfig);
      
      const deliveryFee = pricingResult.deliveryFee;
      const appFee = pricingResult.appFee;
      const total = subtotal + deliveryFee + appFee;

      const now = new Date().toISOString();
      const id = `ORD-${String(Date.now()).slice(-6)}`;

      const destinationCoords = meta?.coordinates ?? {
        lat: -7.2798,
        lng: 112.7905,
      };

      const pricingSnapshot = createDeliveryPricingSnapshot(
        deliveryPoint,
        destinationCoords,
        pricingResult,
        state.pricingConfig
      );

      const order: Order = {
        id,
        userId: authUser ? authUser.id : (state.currentUserId ?? 'user-1'),
        courierId: null,
        items: orderItems,
        canteenId,
        deliveryPoint,
        deliveryNotes,
        deliveryCoordinates: destinationCoords,
        deliveryDistanceKm: pricingResult.distanceKm,
        deliveryBaseFee: pricingResult.baseFee,
        deliveryRatePerKm: pricingResult.ratePerKm,
        serviceFee: deliveryFee,
        appFee,
        subtotal,
        total,
        status: 'pending_courier',
        pricingSnapshot,
        createdAt: now,
        updatedAt: now,
        statusHistory: [{ status: 'pending_courier', timestamp: now }],
      };

      // Persist to Supabase
      try {
        await orderService.createOrder({
          canteenId,
          deliveryPoint,
          deliveryNotes,
          items,
          serviceFee: deliveryFee,
          appFee,
        });

        dispatch({ type: 'CLEAR_CART' });

        // Immediately fetch fresh orders from DB so that state has the real ID, order_number, and user_id!
        const freshOrders = await orderService.fetchOrders();
        dispatch({ type: 'SET_ORDERS', orders: freshOrders });
      } catch (err) {
        console.error('Backend order creation error, using local fallback:', err);
        // Optimistic local update as fallback
        dispatch({ type: 'CREATE_ORDER', order });
      }
    },
    [state.foodItems, state.currentUserId, state.pricingConfig, authUser]
  );

  const transitionOrder = useCallback(
    async (orderId: string, status: OrderStatus, courierId?: string, note?: string) => {
      // Optimistic update
      dispatch({ type: 'TRANSITION_ORDER', orderId, status, courierId, note });

      // Persist to Supabase
      try {
        await orderService.updateOrderStatus(orderId, status, courierId, note);
        // Refresh orders from DB to guarantee live sync
        const freshOrders = await orderService.fetchOrders();
        dispatch({ type: 'SET_ORDERS', orders: freshOrders });
      } catch (err) {
        console.warn('Backend transition persistence note:', err);
      }
    },
    []
  );

  const addToCart = useCallback((foodItemId: string) => dispatch({ type: 'ADD_TO_CART', foodItemId }), []);
  const removeFromCart = useCallback((foodItemId: string) => dispatch({ type: 'REMOVE_FROM_CART', foodItemId }), []);
  const updateCartQty = useCallback((foodItemId: string, quantity: number) => dispatch({ type: 'UPDATE_CART_QTY', foodItemId, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const addFoodItem = useCallback(async (item: Omit<FoodItem, 'id' | 'createdAt'>) => {
    const newItem: FoodItem = {
      ...item,
      id: `food-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_FOOD_ITEM', item: newItem });

    try {
      await productService.createProduct(item);
    } catch (err) {
      console.warn('Product create persistence note:', err);
    }
  }, []);

  const updateFoodItem = useCallback(async (item: FoodItem) => {
    dispatch({ type: 'UPDATE_FOOD_ITEM', item });
    try {
      await productService.updateProduct(item.id, item);
    } catch (err) {
      console.warn('Product update persistence note:', err);
    }
  }, []);

  const deleteFoodItem = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_FOOD_ITEM', id });
    try {
      await productService.deleteProduct(id);
    } catch (err) {
      console.warn('Product delete persistence note:', err);
    }
  }, []);

  const addCanteen = useCallback(async (canteen: Omit<Canteen, 'id' | 'createdAt'>) => {
    const newCanteen: Canteen = {
      ...canteen,
      id: `canteen-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CANTEEN', canteen: newCanteen });
    try {
      await canteenService.createCanteen(canteen);
    } catch (err) {
      console.warn('Canteen create persistence note:', err);
    }
  }, []);

  const updateCanteen = useCallback(async (canteen: Canteen) => {
    dispatch({ type: 'UPDATE_CANTEEN', canteen });
    try {
      await canteenService.updateCanteen(canteen.id, canteen);
    } catch (err) {
      console.warn('Canteen update persistence note:', err);
    }
  }, []);

  const deleteCanteen = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_CANTEEN', id });
    try {
      await canteenService.deleteCanteen(id);
    } catch (err) {
      console.warn('Canteen delete persistence note:', err);
    }
  }, []);

  const updateCourier = useCallback((courier: Courier) => dispatch({ type: 'UPDATE_COURIER', courier }), []);
  const updateUser = useCallback((user: AppUser) => dispatch({ type: 'UPDATE_USER', user }), []);

  const addSavedAddress = useCallback((address: Omit<SavedAddress, 'id'>) => {
    if (state.currentUserId) {
      const newAddress: SavedAddress = {
        ...address,
        id: `addr-${Date.now()}`,
      };
      dispatch({ type: 'ADD_SAVED_ADDRESS', userId: state.currentUserId, address: newAddress });
    }
  }, [state.currentUserId]);

  const deleteSavedAddress = useCallback((addressId: string) => {
    if (state.currentUserId) {
      dispatch({ type: 'DELETE_SAVED_ADDRESS', userId: state.currentUserId, addressId });
    }
  }, [state.currentUserId]);

  const toggleFavorite = useCallback((foodItemId: string) => {
    if (state.currentUserId) {
      dispatch({ type: 'TOGGLE_FAVORITE', userId: state.currentUserId, foodItemId });
    }
  }, [state.currentUserId]);

  const setCourierAvailability = useCallback((courierId: string, isAvailable: boolean) => {
    dispatch({ type: 'SET_COURIER_AVAILABILITY', courierId, isAvailable });
  }, []);

  const updatePricingConfig = useCallback((config: Partial<DeliveryPricingConfig>) => {
    dispatch({ type: 'UPDATE_PRICING_CONFIG', config });
  }, []);

  // Derived helpers
  const currentUser: AppUser | null = authProfile && authProfile.role === 'user'
    ? {
        id: authProfile.id,
        name: authProfile.full_name,
        phone: authProfile.phone || '0812-3456-7890',
        email: authUser?.email,
        studentId: authProfile.student_id || undefined,
        studyProgram: authProfile.study_program || undefined,
        role: 'user',
        isActive: true,
        favorites: state.users.find((u) => u.id === authProfile.id)?.favorites ?? ['1', '2'],
        savedAddresses: state.users.find((u) => u.id === authProfile.id)?.savedAddresses ?? [
          {
            id: 'addr-default',
            label: 'Lab Utama (D4)',
            fullAddress: 'Lab AI & Rekayasa Perangkat Lunak, Gedung D4 Baru Lt. 2, Kampus PENS',
            streetNotes: 'Meja praktikum',
            coordinates: { lat: -7.2755, lng: 112.7936 },
            isDefault: true,
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
      }
    : (state.users.find((u) => u.id === state.currentUserId) ?? state.users[0] ?? null);

  const currentCourier: Courier | null = authProfile && authProfile.role === 'courier'
    ? {
        id: authProfile.id,
        name: authProfile.full_name,
        studentId: authProfile.student_id || '3121500099',
        isAvailable: state.couriers.find((c) => c.id === authProfile.id)?.isAvailable ?? true,
        isEnabled: true,
        createdAt: '2024-01-01T00:00:00Z',
      }
    : (state.couriers.find((c) => c.id === state.currentCourierId) ?? state.couriers[0] ?? null);

  const cartSubtotal = state.cart.reduce((sum, ci) => {
    const food = state.foodItems.find((f) => f.id === ci.foodItemId);
    return sum + (food?.price ?? 0) * ci.quantity;
  }, 0);
  const defaultEstimateOngkir = state.pricingConfig.baseFee + (1 * state.pricingConfig.ratePerKm);
  const cartTotal = cartSubtotal + (state.cart.length > 0 ? defaultEstimateOngkir : 0);
  const cartCount = state.cart.reduce((sum, ci) => sum + ci.quantity, 0);

  const value: AppContextValue = {
    state,
    setRole,
    setDemoUser,
    setDemoCourier,
    resetDemo,
    createOrder,
    transitionOrder,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    addCanteen,
    updateCanteen,
    deleteCanteen,
    updateCourier,
    updateUser,
    addSavedAddress,
    deleteSavedAddress,
    toggleFavorite,
    setCourierAvailability,
    updatePricingConfig,
    currentUser,
    currentCourier,
    cartTotal,
    cartSubtotal,
    cartCount,
    pricingConfig: state.pricingConfig,
    authUser,
    authProfile,
    isAuthLoading,
    signIn,
    signUp,
    signOut,
    isDbConnected,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
