export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  is_member: boolean;
  membership_tier: "monthly" | "6month" | "yearly" | null;
  membership_expires_at: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: "pending" | "processing" | "printing" | "ready" | "delivered" | "cancelled";
  print_type: "bw" | "color";
  quantity: number;
  unit_price: number;
  total_amount: number;
  delivery_fee: number;
  binding_fee: number;
  tax_amount: number;
  delivery_type: "pickup" | "delivery" | "construction_site" | null;
  delivery_address: string | null;
  distance_miles: number | null;
  is_construction_site: boolean;
  file_url: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  square_subscription_id: string | null;
  status: "active" | "cancelled" | "past_due" | "paused";
  tier: "monthly" | "6month" | "yearly";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface QuoteRequest {
  id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  details: string | null;
  status: "new" | "contacted" | "quoted" | "closed";
  created_at: string;
}
