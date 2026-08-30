-- Blueprints Club database schema
-- Safe to run more than once in the Neon SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE membership_tier AS ENUM ('monthly', '6month', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'printing', 'ready', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE print_type AS ENUM ('bw', 'color');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery', 'construction_site');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('new', 'contacted', 'quoted', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  company text,
  address text,
  is_member boolean NOT NULL DEFAULT false,
  membership_tier membership_tier,
  membership_expires_at timestamptz,
  role user_role NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Keep this migration compatible with the original prototype profiles table.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_idx ON profiles (lower(email));

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  status order_status NOT NULL DEFAULT 'pending',
  print_type print_type NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  delivery_fee numeric(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  binding_fee numeric(10, 2) NOT NULL DEFAULT 0 CHECK (binding_fee >= 0),
  tax_amount numeric(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  delivery_type delivery_type,
  delivery_address text,
  distance_miles numeric(8, 2) CHECK (distance_miles >= 0),
  is_construction_site boolean NOT NULL DEFAULT false,
  file_url text,
  file_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS binding_fee numeric(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount numeric(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_group_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_payment_link_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_payment_url text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_payment_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS files_deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS orders_user_id_created_at_idx ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_created_at_idx ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_group_id_idx ON orders (order_group_id);
CREATE INDEX IF NOT EXISTS orders_square_order_id_idx ON orders (square_order_id);

CREATE TABLE IF NOT EXISTS order_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  print_type print_type NOT NULL,
  page_count integer NOT NULL CHECK (page_count > 0),
  sets integer NOT NULL CHECK (sets > 0),
  sheet_count integer NOT NULL CHECK (sheet_count > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_files_order_id_idx ON order_files (order_id, created_at);
CREATE INDEX IF NOT EXISTS order_files_created_at_idx ON order_files (created_at);

CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status order_status,
  new_status order_status NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_status_history ADD COLUMN IF NOT EXISTS previous_status order_status;
ALTER TABLE order_status_history ADD COLUMN IF NOT EXISTS new_status order_status;
ALTER TABLE order_status_history ADD COLUMN IF NOT EXISTS changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- The original prototype used a required text `status` column. New status
-- history rows use `previous_status` and `new_status`, so keep the legacy
-- column nullable when upgrading an existing database.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'order_status_history'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE order_status_history ALTER COLUMN status DROP NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx ON order_status_history (order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  square_subscription_id text UNIQUE,
  status subscription_status NOT NULL DEFAULT 'active',
  tier membership_tier NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS subscriptions_user_id_status_idx ON subscriptions (user_id, status);

CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  details text,
  status quote_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS sample_name text;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS sample_image text;

CREATE INDEX IF NOT EXISTS quote_requests_status_created_at_idx ON quote_requests (status, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_set_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS quote_requests_set_updated_at ON quote_requests;
CREATE TRIGGER quote_requests_set_updated_at BEFORE UPDATE ON quote_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_status_history (order_id, new_status)
    VALUES (NEW.id, NEW.status);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, previous_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_record_status_change ON orders;
CREATE TRIGGER orders_record_status_change AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION record_order_status_change();
