import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[PremShop] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Create a .env file with these values. See SETUP.md for instructions.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// ─── Types ────────────────────────────────────────────────────────────────────

export type Profile = {
  id: string
  username: string
  email: string
  role: 'user' | 'admin'
  balance: number
  created_at: string
}

export type Category = {
  id: string
  name: string
  icon_url: string | null
  slug: string
  sort_order: number
  created_at: string
}

export type Product = {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  image_url: string | null
  stock: number
  is_flash_sale: boolean
  flash_sale_price: number | null
  flash_sale_end_at: string | null
  is_active: boolean
  sold_count: number
  created_at: string
  category?: Category
}

export type ProductAccount = {
  id: string
  product_id: string
  account_data: string
  is_sold: boolean
  order_id: string | null
  created_at: string
}

export type Order = {
  id: string
  user_id: string
  product_id: string
  unit_price: number
  total_price: number
  status: 'completed' | 'pending' | 'refunded'
  account_data: string | null
  created_at: string
  product?: Product
}

export type WalletTransaction = {
  id: string
  user_id: string
  amount: number
  type: 'topup' | 'purchase' | 'refund'
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  reference: string | null
  slip_url: string | null
  created_at: string
}

export type Announcement = {
  id: string
  title: string
  content: string
  type: 'news' | 'promotion' | 'update' | 'maintenance'
  image_url: string | null
  likes_count: number
  created_at: string
}

export type Ticket = {
  id: string
  user_id: string
  type: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'closed'
  admin_reply: string | null
  created_at: string
}
