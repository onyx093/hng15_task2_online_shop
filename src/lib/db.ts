import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { Category, Product, Order, OrderItem, User } from '@/types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './seed';

// In-memory fallback store for local development before DATABASE_URL is configured
class MemoryStore {
  categories: Category[] = [...INITIAL_CATEGORIES];
  products: Product[] = [...INITIAL_PRODUCTS];
  users: Map<string, User> = new Map();
  orders: Map<string, Order> = new Map();

  constructor() {
    // Add a default demo user
    this.users.set('demo_user_1', {
      id: 'demo_user_1',
      google_id: 'google_1234567890',
      email: 'demo.shopper@aurahome.com',
      name: 'Elena Rostova',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      role: 'customer',
      created_at: new Date().toISOString(),
    });
  }
}

const globalStore = (global as unknown as { __auraMemoryStore?: MemoryStore });
if (!globalStore.__auraMemoryStore) {
  globalStore.__auraMemoryStore = new MemoryStore();
}
const memoryStore = globalStore.__auraMemoryStore;

export function isNeonConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));
}

export function getNeonSql(): NeonQueryFunction<false, false> | null {
  if (!isNeonConfigured()) return null;
  try {
    return neon(process.env.DATABASE_URL!);
  } catch (error) {
    console.error('Failed to create Neon client:', error);
    return null;
  }
}

let dbInitialized = false;

export async function initDatabase(): Promise<{ success: boolean; message: string; isNeon: boolean }> {
  const sql = getNeonSql();
  if (!sql) {
    return {
      success: true,
      message: 'Using in-memory development store (DATABASE_URL not configured).',
      isNeon: false,
    };
  }

  try {
    // Create Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        google_id VARCHAR(128) UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        role VARCHAR(32) DEFAULT 'customer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        slug VARCHAR(128) NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        compare_at_price NUMERIC(10, 2),
        category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
        image_url TEXT NOT NULL,
        images JSONB NOT NULL DEFAULT '[]'::jsonb,
        rating NUMERIC(2, 1) DEFAULT 5.0,
        rating_count INTEGER DEFAULT 0,
        stock INTEGER DEFAULT 10,
        featured BOOLEAN DEFAULT false,
        dimensions VARCHAR(128),
        materials VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        order_number VARCHAR(64) NOT NULL UNIQUE,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(64),
        shipping_address TEXT NOT NULL,
        shipping_city VARCHAR(128) NOT NULL,
        shipping_state VARCHAR(128) NOT NULL,
        shipping_postal_code VARCHAR(32) NOT NULL,
        shipping_country VARCHAR(128) NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        total_amount NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(64) NOT NULL DEFAULT 'card',
        payment_status VARCHAR(32) NOT NULL DEFAULT 'paid',
        order_status VARCHAR(32) NOT NULL DEFAULT 'confirmed',
        mailgun_message_id VARCHAR(255),
        mailgun_status VARCHAR(32) DEFAULT 'pending',
        email_preview_html TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Order Items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
        product_title VARCHAR(255) NOT NULL,
        product_image TEXT NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        total_price NUMERIC(10, 2) NOT NULL
      );
    `;

    // Seed categories if empty
    const existingCategories = (await sql`SELECT count(*) FROM categories`) as { count: string }[];
    if (parseInt(existingCategories[0]?.count || '0', 10) === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await sql`
          INSERT INTO categories (id, name, slug, description, image_url)
          VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.description}, ${cat.image_url})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Seed products if empty
    const existingProducts = (await sql`SELECT count(*) FROM products`) as { count: string }[];
    if (parseInt(existingProducts[0]?.count || '0', 10) === 0) {
      for (const prod of INITIAL_PRODUCTS) {
        await sql`
          INSERT INTO products (
            id, title, slug, description, price, compare_at_price,
            category_id, image_url, images, rating, rating_count,
            stock, featured, dimensions, materials
          )
          VALUES (
            ${prod.id}, ${prod.title}, ${prod.slug}, ${prod.description},
            ${prod.price}, ${prod.compare_at_price ?? null}, ${prod.category_id},
            ${prod.image_url}, ${JSON.stringify(prod.images)}, ${prod.rating},
            ${prod.rating_count}, ${prod.stock}, ${prod.featured ?? false},
            ${prod.dimensions ?? null}, ${prod.materials ?? null}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    dbInitialized = true;
    return { success: true, message: 'Neon database initialized & seeded successfully.', isNeon: true };
  } catch (error) {
    console.error('Neon database initialization error:', error);
    return { success: false, message: (error as Error).message, isNeon: true };
  }
}

// Auto-run init check lazily
async function ensureDb() {
  if (!dbInitialized && isNeonConfigured()) {
    await initDatabase();
  }
}

// --- Product & Category Queries ---

export async function getCategories(): Promise<Category[]> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();
      const rows = (await sql`SELECT * FROM categories ORDER BY name ASC`) as Category[];
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      console.error('Error fetching categories from Neon, falling back to memory store:', e);
    }
  }
  return memoryStore.categories;
}

export async function getProducts(options?: {
  category?: string;
  search?: string;
  sort?: string;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();
      let queryStr = `
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;
      const params: (string | number | boolean)[] = [];

      if (options?.category && options.category !== 'all') {
        params.push(options.category);
        queryStr += ` AND (p.category_id = $${params.length} OR c.slug = $${params.length})`;
      }

      if (options?.featuredOnly) {
        params.push(true);
        queryStr += ` AND p.featured = $${params.length}`;
      }

      if (options?.search) {
        params.push(`%${options.search.toLowerCase()}%`);
        queryStr += ` AND (LOWER(p.title) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`;
      }

      if (options?.sort === 'price-low') {
        queryStr += ` ORDER BY p.price ASC`;
      } else if (options?.sort === 'price-high') {
        queryStr += ` ORDER BY p.price DESC`;
      } else if (options?.sort === 'rating') {
        queryStr += ` ORDER BY p.rating DESC`;
      } else {
        queryStr += ` ORDER BY p.created_at DESC`;
      }

      // Execute dynamic query with neon parameter array
      const rawRows = await (sql as unknown as (q: string, p?: unknown[]) => Promise<unknown[]>)(queryStr, params);
      type DbProductRow = {
        id: string;
        title: string;
        slug: string;
        description: string;
        price: string | number;
        compare_at_price?: string | number | null;
        category_id: string;
        category_name?: string;
        image_url: string;
        images: string[] | string;
        rating: string | number;
        rating_count: number;
        stock: number;
        featured?: boolean;
        dimensions?: string;
        materials?: string;
        created_at?: string;
      };
      const rows = rawRows as unknown as DbProductRow[];

      return rows.map((r) => ({
        ...r,
        price: Number(r.price),
        compare_at_price: r.compare_at_price ? Number(r.compare_at_price) : null,
        rating: Number(r.rating),
        images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images || [],
      }));
    } catch (e) {
      console.error('Error fetching products from Neon, falling back to memory store:', e);
    }
  }

  // Memory fallback
  let items = [...memoryStore.products];

  if (options?.category && options.category !== 'all') {
    items = items.filter((p) => p.category_id === options.category);
  }

  if (options?.featuredOnly) {
    items = items.filter((p) => p.featured);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    items = items.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  if (options?.sort === 'price-low') {
    items.sort((a, b) => a.price - b.price);
  } else if (options?.sort === 'price-high') {
    items.sort((a, b) => b.price - a.price);
  } else if (options?.sort === 'rating') {
    items.sort((a, b) => b.rating - a.rating);
  }

  return items;
}

export async function getProductById(id: string): Promise<Product | null> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();
      type DbProductRow = {
        id: string;
        title: string;
        slug: string;
        description: string;
        price: string | number;
        compare_at_price?: string | number | null;
        category_id: string;
        category_name?: string;
        image_url: string;
        images: string[] | string;
        rating: string | number;
        rating_count: number;
        stock: number;
        featured?: boolean;
        dimensions?: string;
        materials?: string;
        created_at?: string;
      };
      const rawRows = await sql`
        SELECT p.*, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ${id} OR p.slug = ${id}
        LIMIT 1
      `;
      const rows = rawRows as unknown as DbProductRow[];
      if (rows && rows[0]) {
        const r = rows[0];
        return {
          ...r,
          price: Number(r.price),
          compare_at_price: r.compare_at_price ? Number(r.compare_at_price) : null,
          rating: Number(r.rating),
          images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images || [],
        };
      }
    } catch (e) {
      console.error('Error fetching product by ID from Neon:', e);
    }
  }

  return memoryStore.products.find((p) => p.id === id || p.slug === id) || null;
}

// --- Order Operations ---

export async function createOrder(
  order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'items'>,
  items: OrderItem[]
): Promise<Order> {
  const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  const orderNumber = `AURA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const createdAt = new Date().toISOString();

  const fullOrder: Order = {
    ...order,
    id: orderId,
    order_number: orderNumber,
    created_at: createdAt,
    items,
  };

  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();

      // Insert Order into Neon
      await sql`
        INSERT INTO orders (
          id, order_number, user_id, customer_name, customer_email, customer_phone,
          shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country,
          subtotal, shipping_fee, tax, total_amount, payment_method, payment_status,
          order_status, mailgun_message_id, mailgun_status, email_preview_html, notes, created_at
        )
        VALUES (
          ${fullOrder.id}, ${fullOrder.order_number}, ${fullOrder.user_id || null},
          ${fullOrder.customer_name}, ${fullOrder.customer_email}, ${fullOrder.customer_phone || null},
          ${fullOrder.shipping_address}, ${fullOrder.shipping_city}, ${fullOrder.shipping_state},
          ${fullOrder.shipping_postal_code}, ${fullOrder.shipping_country},
          ${fullOrder.subtotal}, ${fullOrder.shipping_fee}, ${fullOrder.tax}, ${fullOrder.total_amount},
          ${fullOrder.payment_method}, ${fullOrder.payment_status}, ${fullOrder.order_status},
          ${fullOrder.mailgun_message_id || null}, ${fullOrder.mailgun_status || 'pending'},
          ${fullOrder.email_preview_html || null}, ${fullOrder.notes || null}, ${fullOrder.created_at}
        );
      `;

      // Insert Order Items into Neon
      for (const item of items) {
        const itemId = `item_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        await sql`
          INSERT INTO order_items (
            id, order_id, product_id, product_title, product_image,
            unit_price, quantity, total_price
          )
          VALUES (
            ${itemId}, ${orderId}, ${item.product_id}, ${item.product_title},
            ${item.product_image}, ${item.unit_price}, ${item.quantity}, ${item.total_price}
          );
        `;

        // Update product stock in Neon
        await sql`
          UPDATE products
          SET stock = GREATEST(0, stock - ${item.quantity})
          WHERE id = ${item.product_id};
        `;
      }

      console.log(`Order ${orderNumber} successfully persisted in Neon PostgreSQL.`);
    } catch (e) {
      console.error('Failed to persist order in Neon, falling back to memory store:', e);
      memoryStore.orders.set(orderId, fullOrder);
    }
  } else {
    // Memory fallback
    memoryStore.orders.set(orderId, fullOrder);
    // Deduct memory stock
    for (const item of items) {
      const prod = memoryStore.products.find((p) => p.id === item.product_id);
      if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }

  return fullOrder;
}

export async function updateOrderEmailStatus(
  orderId: string,
  mailgunMessageId: string | null,
  status: 'sent' | 'failed' | 'mock_logged',
  emailPreviewHtml?: string
): Promise<void> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();
      await sql`
        UPDATE orders
        SET mailgun_message_id = ${mailgunMessageId},
            mailgun_status = ${status},
            email_preview_html = ${emailPreviewHtml || null}
        WHERE id = ${orderId};
      `;
    } catch (e) {
      console.error('Error updating order email status in Neon:', e);
    }
  }

  const memOrder = memoryStore.orders.get(orderId);
  if (memOrder) {
    memOrder.mailgun_message_id = mailgunMessageId;
    memOrder.mailgun_status = status;
    if (emailPreviewHtml) memOrder.email_preview_html = emailPreviewHtml;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();
      type RawDbOrder = {
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
        subtotal: string | number;
        shipping_fee: string | number;
        tax: string | number;
        total_amount: string | number;
        payment_method: string;
        payment_status: 'paid' | 'pending' | 'failed';
        order_status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
        mailgun_message_id?: string | null;
        mailgun_status?: 'sent' | 'failed' | 'mock_logged';
        email_preview_html?: string | null;
        notes?: string | null;
        created_at: string;
      };
      const rawOrders = await sql`
        SELECT * FROM orders WHERE id = ${id} OR order_number = ${id} LIMIT 1
      `;
      const orderRows = rawOrders as unknown as RawDbOrder[];
      if (orderRows && orderRows[0]) {
        const o = orderRows[0];
        type RawDbOrderItem = {
          id: string;
          order_id: string;
          product_id: string;
          product_title: string;
          product_image: string;
          unit_price: string | number;
          quantity: number;
          total_price: string | number;
        };
        const rawItems = await sql`
          SELECT * FROM order_items WHERE order_id = ${o.id}
        `;
        const itemRows = rawItems as unknown as RawDbOrderItem[];

        return {
          ...o,
          subtotal: Number(o.subtotal),
          shipping_fee: Number(o.shipping_fee),
          tax: Number(o.tax),
          total_amount: Number(o.total_amount),
          items: itemRows.map((it) => ({
            ...it,
            unit_price: Number(it.unit_price),
            total_price: Number(it.total_price),
          })),
        };
      }
    } catch (e) {
      console.error('Error fetching order from Neon:', e);
    }
  }

  return memoryStore.orders.get(id) || null;
}

export async function getUserOrders(userIdOrEmail: string): Promise<Order[]> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();
      type RawDbOrder = {
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
        subtotal: string | number;
        shipping_fee: string | number;
        tax: string | number;
        total_amount: string | number;
        payment_method: string;
        payment_status: 'paid' | 'pending' | 'failed';
        order_status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
        mailgun_message_id?: string | null;
        mailgun_status?: 'sent' | 'failed' | 'mock_logged';
        email_preview_html?: string | null;
        notes?: string | null;
        created_at: string;
      };
      const rawOrders = await sql`
        SELECT * FROM orders 
        WHERE user_id = ${userIdOrEmail} OR customer_email = ${userIdOrEmail}
        ORDER BY created_at DESC
      `;
      const orderRows = rawOrders as unknown as RawDbOrder[];
      const fullOrders: Order[] = [];

      for (const o of orderRows) {
        type RawDbOrderItem = {
          id: string;
          order_id: string;
          product_id: string;
          product_title: string;
          product_image: string;
          unit_price: string | number;
          quantity: number;
          total_price: string | number;
        };
        const rawItems = await sql`
          SELECT * FROM order_items WHERE order_id = ${o.id}
        `;
        const itemRows = rawItems as unknown as RawDbOrderItem[];
        fullOrders.push({
          ...o,
          subtotal: Number(o.subtotal),
          shipping_fee: Number(o.shipping_fee),
          tax: Number(o.tax),
          total_amount: Number(o.total_amount),
          items: itemRows.map((it) => ({
            ...it,
            unit_price: Number(it.unit_price),
            total_price: Number(it.total_price),
          })),
        });
      }

      return fullOrders;
    } catch (e) {
      console.error('Error fetching user orders from Neon:', e);
    }
  }

  return Array.from(memoryStore.orders.values())
    .filter((o) => o.user_id === userIdOrEmail || o.customer_email === userIdOrEmail)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// --- User Operations ---

export async function upsertUser(user: {
  id?: string;
  google_id?: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
}): Promise<User> {
  const userId = user.id || `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const fullUser: User = {
    id: userId,
    google_id: user.google_id || null,
    email: user.email.toLowerCase(),
    name: user.name,
    avatar_url: user.avatar_url || null,
    role: user.role || 'customer',
    created_at: new Date().toISOString(),
  };

  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();
      type RawDbUser = {
        id: string;
        google_id?: string | null;
        email: string;
        name: string;
        avatar_url?: string | null;
        role?: string;
        created_at?: string;
      };
      const rawRows = await sql`
        INSERT INTO users (id, google_id, email, name, avatar_url, role)
        VALUES (${fullUser.id}, ${fullUser.google_id}, ${fullUser.email}, ${fullUser.name}, ${fullUser.avatar_url}, ${fullUser.role})
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
          google_id = COALESCE(EXCLUDED.google_id, users.google_id),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const rows = rawRows as unknown as RawDbUser[];
      if (rows && rows[0]) {
        return rows[0];
      }
    } catch (e) {
      console.error('Error upserting user in Neon, using memory store:', e);
    }
  }

  memoryStore.users.set(fullUser.email, fullUser);
  return fullUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await ensureDb();
      type RawDbUser = {
        id: string;
        google_id?: string | null;
        email: string;
        name: string;
        avatar_url?: string | null;
        role?: string;
        created_at?: string;
      };
      const rawRows = await sql`
        SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
      `;
      const rows = rawRows as unknown as RawDbUser[];
      if (rows && rows[0]) return rows[0];
    } catch (e) {
      console.error('Error finding user by email in Neon:', e);
    }
  }
  return memoryStore.users.get(email.toLowerCase()) || null;
}
