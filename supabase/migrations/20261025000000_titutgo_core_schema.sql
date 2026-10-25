-- ============================================================
-- TITUTGO PENS: Production Database Schema & Security
-- ============================================================

-- 1. ENUMS
create type public.app_role as enum ('user', 'courier', 'admin');
create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'picked_up',
  'on_delivery',
  'delivered',
  'cancelled'
);
create type public.payment_status as enum ('unpaid', 'pending', 'paid', 'failed', 'refunded');
create type public.task_status as enum ('available', 'accepted', 'picked_up', 'delivered', 'cancelled');

-- 2. CANTEENS
create table if not exists public.canteens (
  id bigint generated always as identity primary key,
  name text not null,
  description text not null default '',
  location text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. CATEGORIES
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. PRODUCTS
create table if not exists public.products (
  id bigint generated always as identity primary key,
  canteen_id bigint not null references public.canteens(id) on delete cascade,
  category_id bigint references public.categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  image_url text,
  stock_quantity integer not null default 50 check (stock_quantity >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role public.app_role not null default 'user',
  avatar_url text,
  student_id text,
  study_program text,
  account_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. ORDERS
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_number text not null unique,
  user_id uuid not null references public.profiles(id),
  canteen_id bigint not null references public.canteens(id),
  courier_id uuid references public.profiles(id),
  subtotal integer not null check (subtotal >= 0),
  jastip_fee integer not null default 2000 check (jastip_fee >= 0),
  delivery_fee integer not null default 3000 check (delivery_fee >= 0),
  total_amount integer not null check (total_amount >= 0),
  delivery_location text not null,
  customer_note text not null default '',
  order_status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. ORDER ITEMS
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id),
  product_name_snapshot text not null,
  unit_price_snapshot integer not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

-- 8. PAYMENTS
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  provider text not null default 'QRIS',
  provider_reference text,
  amount integer not null check (amount >= 0),
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. COURIER TASKS
create table if not exists public.courier_tasks (
  id bigint generated always as identity primary key,
  order_id bigint not null unique references public.orders(id) on delete cascade,
  courier_id uuid references public.profiles(id),
  task_status public.task_status not null default 'available',
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. ORDER STATUS HISTORY
create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  changed_by uuid references public.profiles(id),
  previous_status public.order_status,
  new_status public.order_status not null,
  note text,
  created_at timestamptz not null default now()
);

-- 11. INDEXES
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_courier_id on public.orders(courier_id);
create index if not exists idx_orders_canteen_id on public.orders(canteen_id);
create index if not exists idx_orders_order_status on public.orders(order_status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

create index if not exists idx_courier_tasks_order_id on public.courier_tasks(order_id);
create index if not exists idx_courier_tasks_courier_id on public.courier_tasks(courier_id);
create index if not exists idx_courier_tasks_status on public.courier_tasks(task_status);

create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_products_canteen_id on public.products(canteen_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_profiles_role on public.profiles(role);
