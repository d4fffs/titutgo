import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
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

// ─── Initial State ────────────────────────────────────────────────────────────

const DEMO_VERSION = 4; // Bump version untuk lingkup internal satu kampus PENS

function getInitialState(): AppState {
  const saved = loadState();
  if (saved && saved.demoVersion === DEMO_VERSION) {
    return {
      currentRole: saved.currentRole ?? null,
      currentUserId: saved.currentUserId ?? DEFAULT_DEMO_USER_ID,
      currentCourierId: saved.currentCourierId ?? DEFAULT_DEMO_COURIER_ID,
      users: saved.users ?? INITIAL_USERS,
      couriers: saved.couriers ?? INITIAL_COURIERS,
      canteens: saved.canteens ?? INITIAL_CANTEENS,
      foodItems: saved.foodItems ?? INITIAL_FOOD_ITEMS,
      orders: saved.orders ?? INITIAL_ORDERS,
      cart: saved.cart ?? [],
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
    orders: INITIAL_ORDERS,
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
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  // Persist state to localStorage (except currentRole to avoid auto-login on refresh)
  useEffect(() => {
    const { currentRole: _role, ...toSave } = state;
    saveState({ ...toSave, currentRole: null });
  }, [state]);

  const setRole = useCallback((role: Role | null) => dispatch({ type: 'SET_ROLE', role }), []);
  const setDemoUser = useCallback((userId: string) => dispatch({ type: 'SET_DEMO_USER', userId }), []);
  const setDemoCourier = useCallback((courierId: string) => dispatch({ type: 'SET_DEMO_COURIER', courierId }), []);
  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO' }), []);

  const createOrder = useCallback(
    (
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

      // Single source of truth: kalkulasi ulang di level server/state
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
        userId: state.currentUserId ?? 'user-1',
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

      dispatch({ type: 'CREATE_ORDER', order });
    },
    [state.foodItems, state.currentUserId, state.pricingConfig]
  );

  const transitionOrder = useCallback((orderId: string, status: OrderStatus, courierId?: string, note?: string) => {
    dispatch({ type: 'TRANSITION_ORDER', orderId, status, courierId, note });
  }, []);

  const addToCart = useCallback((foodItemId: string) => dispatch({ type: 'ADD_TO_CART', foodItemId }), []);
  const removeFromCart = useCallback((foodItemId: string) => dispatch({ type: 'REMOVE_FROM_CART', foodItemId }), []);
  const updateCartQty = useCallback((foodItemId: string, quantity: number) => dispatch({ type: 'UPDATE_CART_QTY', foodItemId, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const addFoodItem = useCallback((item: Omit<FoodItem, 'id' | 'createdAt'>) => {
    const newItem: FoodItem = {
      ...item,
      id: `food-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_FOOD_ITEM', item: newItem });
  }, []);

  const updateFoodItem = useCallback((item: FoodItem) => dispatch({ type: 'UPDATE_FOOD_ITEM', item }), []);
  const deleteFoodItem = useCallback((id: string) => dispatch({ type: 'DELETE_FOOD_ITEM', id }), []);

  const addCanteen = useCallback((canteen: Omit<Canteen, 'id' | 'createdAt'>) => {
    dispatch({
      type: 'ADD_CANTEEN',
      canteen: { ...canteen, id: `canteen-${Date.now()}`, createdAt: new Date().toISOString() },
    });
  }, []);

  const updateCanteen = useCallback((canteen: Canteen) => dispatch({ type: 'UPDATE_CANTEEN', canteen }), []);
  const deleteCanteen = useCallback((id: string) => dispatch({ type: 'DELETE_CANTEEN', id }), []);
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
  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;
  const currentCourier = state.couriers.find((c) => c.id === state.currentCourierId) ?? null;

  const cartSubtotal = state.cart.reduce((sum, ci) => {
    const food = state.foodItems.find((f) => f.id === ci.foodItemId);
    return sum + (food?.price ?? 0) * ci.quantity;
  }, 0);
  // Default estimate cart total (base fee + minimum distance)
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
