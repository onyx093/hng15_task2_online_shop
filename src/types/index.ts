export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  category_id: string;
  category_name?: string;
  image_url: string;
  images: string[];
  rating: number;
  rating_count: number;
  stock: number;
  featured?: boolean;
  dimensions?: string;
  materials?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  google_id?: string | null;
  password_hash?: string | null;
  email: string;
  name: string;
  avatar_url?: string | null;
  role?: string;
  created_at?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_title: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'paid' | 'pending' | 'failed';
  order_status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  mailgun_message_id?: string | null;
  mailgun_status?: 'sent' | 'failed' | 'mock_logged';
  email_preview_html?: string | null;
  notes?: string | null;
  created_at: string;
  items: OrderItem[];
}
