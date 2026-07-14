-- ============================================================
-- PremShop — Supabase Database Schema + Seed Data
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  balance    NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, balance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  icon_url   TEXT,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id      UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  price            NUMERIC(10,2) NOT NULL,
  original_price   NUMERIC(10,2),
  image_url        TEXT,
  stock            INT NOT NULL DEFAULT 0,
  is_flash_sale    BOOLEAN NOT NULL DEFAULT FALSE,
  flash_sale_price NUMERIC(10,2),
  flash_sale_end_at TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  sold_count       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── product_accounts ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_accounts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  account_data TEXT NOT NULL,
  is_sold      BOOLEAN NOT NULL DEFAULT FALSE,
  order_id     UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── orders ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  unit_price   NUMERIC(10,2) NOT NULL,
  total_price  NUMERIC(10,2) NOT NULL,
  status       TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','pending','refunded')),
  account_data TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── wallet_transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount     NUMERIC(10,2) NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('topup','purchase','refund')),
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  reference  TEXT,
  slip_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── announcements ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'news' CHECK (type IN ('news','promotion','update','maintenance')),
  image_url   TEXT,
  likes_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── announcement_likes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcement_likes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (announcement_id, user_id)
);

-- ── tickets ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'question',
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','closed')),
  admin_reply TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- profiles: users read their own, admins read all
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- categories: public read, admin write
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO PUBLIC USING (TRUE);
CREATE POLICY "categories_write_admin" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- products: public read active, admin write all
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (is_active = TRUE OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "products_write_admin" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- product_accounts: admin only
CREATE POLICY "product_accounts_admin" ON public.product_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- orders: users see own, admin sees all
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_select_admin" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- wallet_transactions: users see own, admin sees all
CREATE POLICY "wallet_select_own" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallet_select_admin" ON public.wallet_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "wallet_insert_own" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wallet_update_admin" ON public.wallet_transactions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- announcements: public read, admin write
CREATE POLICY "announce_select" ON public.announcements FOR SELECT TO PUBLIC USING (TRUE);
CREATE POLICY "announce_write_admin" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- announcement_likes: authenticated users
CREATE POLICY "likes_select" ON public.announcement_likes FOR SELECT TO PUBLIC USING (TRUE);
CREATE POLICY "likes_insert" ON public.announcement_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON public.announcement_likes FOR DELETE USING (auth.uid() = user_id);

-- tickets: users see own, admin sees all
CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tickets_select_admin" ON public.tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "tickets_insert_own" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update_admin" ON public.tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- Seed Data — Categories
-- ============================================================

INSERT INTO public.categories (name, slug, icon_url, sort_order) VALUES
  ('Video Streaming', 'streaming',  'https://cdn-icons-png.flaticon.com/512/2168/2168243.png', 1),
  ('Music Streaming', 'music',      'https://cdn-icons-png.flaticon.com/512/651/651758.png',   2),
  ('รหัส OTP / เบอร์รับรหัส', 'otp', 'https://cdn-icons-png.flaticon.com/512/2913/2913461.png', 3),
  ('บัญชี / อีเมล', 'accounts',    'https://cdn-icons-png.flaticon.com/512/747/747376.png',   4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed Data — Products (Netflix)
-- ============================================================

-- Netflix 1 เดือน — Flash Sale
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, is_flash_sale, flash_sale_price, flash_sale_end_at, description)
SELECT
  'Netflix Premium 1 เดือน',
  id,
  99.00,  149.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
  25, 4821, TRUE, TRUE, 79.00, NOW() + INTERVAL '7 days',
  E'✅ Netflix Premium 4 จอ UHD\n✅ รองรับทุกอุปกรณ์ (TV, Mobile, PC)\n✅ ดูได้ทันทีหลังซื้อ\n✅ บัญชีส่วนตัว ไม่แชร์\n⚠️ ใช้งานได้ 30 วันนับจากวันที่รับบัญชี'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- Netflix 3 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Netflix Premium 3 เดือน',
  id, 269.00, 399.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
  18, 2103, TRUE,
  E'✅ Netflix Premium 4 จอ UHD\n✅ ประหยัดกว่าซื้อรายเดือน 10%\n✅ รองรับทุกอุปกรณ์ (TV, Mobile, PC)\n✅ บัญชีส่วนตัว ไม่แชร์\n⚠️ ใช้งานได้ 90 วันนับจากวันที่รับบัญชี'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- Netflix 6 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Netflix Premium 6 เดือน',
  id, 499.00, 699.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
  10, 987, TRUE,
  E'✅ Netflix Premium 4 จอ UHD\n✅ ประหยัดกว่าซื้อรายเดือน 16%\n✅ รองรับทุกอุปกรณ์ (TV, Mobile, PC)\n✅ บัญชีส่วนตัว ไม่แชร์\n⚠️ ใช้งานได้ 180 วันนับจากวันที่รับบัญชี'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- Netflix 1 ปี
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Netflix Premium 1 ปี',
  id, 899.00, 1299.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
  5, 432, TRUE,
  E'✅ Netflix Premium 4 จอ UHD\n✅ ประหยัดที่สุด! คุ้มกว่า 25%\n✅ รองรับทุกอุปกรณ์ (TV, Mobile, PC)\n✅ บัญชีส่วนตัว ไม่แชร์\n⚠️ ใช้งานได้ 365 วันนับจากวันที่รับบัญชี'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Products (Disney+)
-- ============================================================

-- Disney+ 1 เดือน — Flash Sale
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, is_flash_sale, flash_sale_price, flash_sale_end_at, description)
SELECT
  'Disney+ Hotstar 1 เดือน',
  id, 89.00, 99.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/320px-Disney%2B_logo.svg.png',
  20, 5309, TRUE, TRUE, 69.00, NOW() + INTERVAL '5 days',
  E'✅ Disney+ Hotstar ครบทุก Content\n✅ Marvel, Star Wars, Pixar, Disney, National Geographic\n✅ ซีรีส์ไทยและเอเชียพิเศษ\n✅ รองรับ 4K HDR\n⚠️ ใช้งานได้ 30 วันนับจากวันที่รับบัญชี'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- Disney+ 3 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Disney+ Hotstar 3 เดือน',
  id, 239.00, 279.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/320px-Disney%2B_logo.svg.png',
  15, 1892, TRUE,
  E'✅ Disney+ Hotstar ครบทุก Content\n✅ Marvel, Star Wars, Pixar, Disney, National Geographic\n✅ ประหยัดกว่าซื้อรายเดือน 10%\n✅ รองรับ 4K HDR\n⚠️ ใช้งานได้ 90 วันนับจากวันที่รับบัญชี'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- Disney+ 1 ปี
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Disney+ Hotstar 1 ปี',
  id, 849.00, 1099.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/320px-Disney%2B_logo.svg.png',
  8, 761, TRUE,
  E'✅ Disney+ Hotstar ครบทุก Content\n✅ Marvel, Star Wars, Pixar, Disney, National Geographic\n✅ ประหยัดสูงสุด 23%\n✅ รองรับ 4K HDR\n⚠️ ใช้งานได้ 365 วันนับจากวันที่รับบัญชี'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Products (YouTube Premium)
-- ============================================================

-- YouTube Premium 1 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'YouTube Premium 1 เดือน',
  id, 69.00, 89.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/320px-YouTube_Logo_2017.svg.png',
  30, 3892, TRUE,
  E'✅ ไม่มีโฆษณาคั่นในทุกวิดีโอ\n✅ เล่นวิดีโอ Background ได้ (ปิดหน้าจอแล้วฟังต่อ)\n✅ ดาวน์โหลดวิดีโอไว้ดูออฟไลน์\n✅ รวม YouTube Music Premium\n✅ บัญชีไทย ใช้ได้ทันที\n⚠️ ใช้งานได้ 30 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- YouTube Premium 3 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'YouTube Premium 3 เดือน',
  id, 189.00, 249.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/320px-YouTube_Logo_2017.svg.png',
  20, 1543, TRUE,
  E'✅ ไม่มีโฆษณาคั่นในทุกวิดีโอ\n✅ เล่นวิดีโอ Background ได้\n✅ ดาวน์โหลดไว้ดูออฟไลน์\n✅ รวม YouTube Music Premium\n✅ ประหยัดกว่ารายเดือน 9%\n⚠️ ใช้งานได้ 90 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- YouTube Premium 1 ปี
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'YouTube Premium 1 ปี',
  id, 699.00, 999.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/320px-YouTube_Logo_2017.svg.png',
  12, 621, TRUE,
  E'✅ ไม่มีโฆษณาคั่นในทุกวิดีโอ\n✅ เล่นวิดีโอ Background ได้\n✅ ดาวน์โหลดไว้ดูออฟไลน์\n✅ รวม YouTube Music Premium\n✅ ประหยัดสูงสุด 30%\n⚠️ ใช้งานได้ 365 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Products (HBO Max)
-- ============================================================

-- HBO Max 1 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'HBO Max 1 เดือน',
  id, 119.00, 149.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/HBO_logo.svg/320px-HBO_logo.svg.png',
  12, 1445, TRUE,
  E'✅ HBO Original Series ทุกเรื่อง\n✅ Game of Thrones, House of the Dragon, The Last of Us\n✅ หนัง DC Comics ทุกเรื่อง\n✅ รองรับ 4K HDR Dolby Vision\n✅ บัญชีส่วนตัว ไม่แชร์\n⚠️ ใช้งานได้ 30 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- HBO Max 3 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'HBO Max 3 เดือน',
  id, 319.00, 429.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/HBO_logo.svg/320px-HBO_logo.svg.png',
  8, 567, TRUE,
  E'✅ HBO Original Series ทุกเรื่อง\n✅ Game of Thrones, House of the Dragon, The Last of Us\n✅ หนัง DC Comics ทุกเรื่อง\n✅ รองรับ 4K HDR Dolby Vision\n✅ ประหยัดกว่ารายเดือน 10%\n⚠️ ใช้งานได้ 90 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Products (Mono Max)
-- ============================================================

-- Mono Max 1 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Mono Max 1 เดือน',
  id, 49.00, 59.00,
  'https://upload.wikimedia.org/wikipedia/commons/8/83/Mono_Max_logo.png',
  15, 2201, TRUE,
  E'✅ หนังไทยและต่างประเทศ HD หลายพันเรื่อง\n✅ ซีรีส์ใหม่อัพเดททุกสัปดาห์\n✅ รองรับ iOS, Android, Smart TV\n✅ ดูได้ไม่อั้น 24 ชั่วโมง\n⚠️ ใช้งานได้ 30 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- Mono Max 3 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Mono Max 3 เดือน',
  id, 129.00, 169.00,
  'https://upload.wikimedia.org/wikipedia/commons/8/83/Mono_Max_logo.png',
  10, 891, TRUE,
  E'✅ หนังไทยและต่างประเทศ HD หลายพันเรื่อง\n✅ ซีรีส์ใหม่อัพเดทรายสัปดาห์\n✅ ประหยัดกว่ารายเดือน 12%\n✅ รองรับทุกอุปกรณ์\n⚠️ ใช้งานได้ 90 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Products (VIU)
-- ============================================================

-- VIU 1 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'VIU Premium 1 เดือน',
  id, 39.00, 49.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Viu-logo.svg/320px-Viu-logo.svg.png',
  20, 3167, TRUE,
  E'✅ ซีรีส์เกาหลียอดนิยมไม่อั้น\n✅ ซับไทย ซับอังกฤษ ครบ\n✅ อัพเดทตอนใหม่เร็วที่สุดในไทย\n✅ ซีรีส์ไทย ญี่ปุ่น จีน ครบ\n✅ รองรับ iOS, Android, Smart TV\n⚠️ ใช้งานได้ 30 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- VIU 3 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'VIU Premium 3 เดือน',
  id, 99.00, 139.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Viu-logo.svg/320px-Viu-logo.svg.png',
  12, 1032, TRUE,
  E'✅ ซีรีส์เกาหลียอดนิยมไม่อั้น\n✅ ซับไทย ซับอังกฤษ ครบ\n✅ อัพเดทตอนใหม่เร็วที่สุดในไทย\n✅ ประหยัดกว่ารายเดือน 15%\n⚠️ ใช้งานได้ 90 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Products (Prime Video)
-- ============================================================

-- Prime Video 1 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Amazon Prime Video 1 เดือน',
  id, 79.00, 99.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/320px-Amazon_Prime_Video_logo.svg.png',
  18, 1388, TRUE,
  E'✅ หนังและซีรีส์ Amazon Original\n✅ The Boys, Rings of Power, Reacher\n✅ รองรับ 4K UHD HDR10+ Dolby Vision\n✅ ดูได้พร้อมกัน 3 หน้าจอ\n✅ ดาวน์โหลดไว้ดูออฟไลน์\n⚠️ ใช้งานได้ 30 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- Prime Video 3 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Amazon Prime Video 3 เดือน',
  id, 209.00, 279.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/320px-Amazon_Prime_Video_logo.svg.png',
  10, 589, TRUE,
  E'✅ หนังและซีรีส์ Amazon Original\n✅ The Boys, Rings of Power, Reacher\n✅ รองรับ 4K UHD HDR10+ Dolby Vision\n✅ ประหยัดกว่ารายเดือน 12%\n⚠️ ใช้งานได้ 90 วัน'
FROM public.categories WHERE slug = 'streaming'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Products (Spotify — Music category)
-- ============================================================

-- Spotify 1 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Spotify Premium 1 เดือน',
  id, 59.00, 79.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
  30, 7144, TRUE,
  E'✅ ฟังเพลงไม่มีโฆษณา\n✅ ดาวน์โหลดเพลงไว้ฟังออฟไลน์ไม่อั้น\n✅ คุณภาพเสียงสูงสุด 320kbps\n✅ ข้ามเพลงได้ไม่จำกัด\n✅ บัญชีส่วนตัว ไม่แชร์\n⚠️ ใช้งานได้ 30 วัน'
FROM public.categories WHERE slug = 'music'
ON CONFLICT DO NOTHING;

-- Spotify 3 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Spotify Premium 3 เดือน',
  id, 159.00, 219.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
  22, 3521, TRUE,
  E'✅ ฟังเพลงไม่มีโฆษณา\n✅ ดาวน์โหลดเพลงออฟไลน์ไม่อั้น\n✅ คุณภาพเสียง 320kbps\n✅ ประหยัดกว่าซื้อรายเดือน 10%\n⚠️ ใช้งานได้ 90 วัน'
FROM public.categories WHERE slug = 'music'
ON CONFLICT DO NOTHING;

-- Spotify 6 เดือน
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Spotify Premium 6 เดือน',
  id, 299.00, 419.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
  15, 1872, TRUE,
  E'✅ ฟังเพลงไม่มีโฆษณา\n✅ ดาวน์โหลดเพลงออฟไลน์ไม่อั้น\n✅ คุณภาพเสียง 320kbps\n✅ ประหยัดกว่าซื้อรายเดือน 16%\n⚠️ ใช้งานได้ 180 วัน'
FROM public.categories WHERE slug = 'music'
ON CONFLICT DO NOTHING;

-- Spotify 1 ปี
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'Spotify Premium 1 ปี',
  id, 549.00, 799.00,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
  8, 943, TRUE,
  E'✅ ฟังเพลงไม่มีโฆษณา\n✅ ดาวน์โหลดเพลงออฟไลน์ไม่อั้น\n✅ คุณภาพเสียง 320kbps\n✅ คุ้มที่สุด ประหยัด 31%\n⚠️ ใช้งานได้ 365 วัน'
FROM public.categories WHERE slug = 'music'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Products (OTP)
-- ============================================================

-- OTP เบอร์ไทย
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'รหัส OTP เบอร์ไทย (1 ครั้ง)',
  id, 25.00, NULL,
  'https://cdn-icons-png.flaticon.com/512/2913/2913461.png',
  100, 5752, TRUE,
  E'✅ รับรหัส OTP เบอร์ไทย (+66)\n✅ ใช้สมัครแอพต่างๆ เช่น LINE, TikTok, Facebook\n✅ รองรับแทบทุกแอพพลิเคชัน\n✅ ส่งรหัสภายใน 1-3 นาที\n⚠️ ใช้ได้ 1 ครั้งต่อรหัส'
FROM public.categories WHERE slug = 'otp'
ON CONFLICT DO NOTHING;

-- OTP เบอร์ต่างประเทศ
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'รหัส OTP เบอร์ต่างประเทศ (1 ครั้ง)',
  id, 35.00, NULL,
  'https://cdn-icons-png.flaticon.com/512/2913/2913461.png',
  80, 2341, TRUE,
  E'✅ รับรหัส OTP เบอร์ต่างประเทศ (US/UK/MY ฯลฯ)\n✅ ใช้สมัครบริการที่ต้องการเบอร์ต่างประเทศ\n✅ รองรับ ChatGPT, Telegram, WhatsApp, Binance\n✅ ส่งรหัสภายใน 1-5 นาที\n⚠️ ใช้ได้ 1 ครั้งต่อรหัส'
FROM public.categories WHERE slug = 'otp'
ON CONFLICT DO NOTHING;

-- OTP แพ็ก 5 ครั้ง
INSERT INTO public.products (name, category_id, price, original_price, image_url, stock, sold_count, is_active, description)
SELECT
  'รหัส OTP เบอร์ไทย แพ็ก 5 ครั้ง',
  id, 99.00, 125.00,
  'https://cdn-icons-png.flaticon.com/512/2913/2913461.png',
  50, 1123, TRUE,
  E'✅ รหัส OTP เบอร์ไทย (+66) จำนวน 5 รหัส\n✅ ประหยัดกว่าซื้อแยก 20%\n✅ ใช้สมัครแอพต่างๆ ได้หลายบัญชี\n✅ ส่งรหัสภายใน 1-3 นาทีต่อรหัส\n⚠️ รหัสมีอายุ 30 วันหลังจากรับ'
FROM public.categories WHERE slug = 'otp'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Sample Product Accounts (Demo)
-- ============================================================
-- หมายเหตุ: ในระบบจริง ให้เพิ่มบัญชีจริงผ่านหน้า Admin > สินค้า > จัดการบัญชี
-- ตัวอย่างด้านล่างเป็นข้อมูลสาธิตเท่านั้น

INSERT INTO public.product_accounts (product_id, account_data, is_sold)
SELECT p.id,
  E'อีเมล: netflix_demo_001@premshop.com\nรหัสผ่าน: PremShop@2025!\nโปรไฟล์: ของคุณ (ช่องที่ 1)\nหมายเหตุ: อย่าเปลี่ยนรหัสผ่านหลัก',
  FALSE
FROM public.products p WHERE p.name = 'Netflix Premium 1 เดือน'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_accounts (product_id, account_data, is_sold)
SELECT p.id,
  E'อีเมล: netflix_demo_002@premshop.com\nรหัสผ่าน: PremShop@2025!\nโปรไฟล์: ของคุณ (ช่องที่ 1)\nหมายเหตุ: อย่าเปลี่ยนรหัสผ่านหลัก',
  FALSE
FROM public.products p WHERE p.name = 'Netflix Premium 1 เดือน'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_accounts (product_id, account_data, is_sold)
SELECT p.id,
  E'อีเมล: spotify_demo_001@premshop.com\nรหัสผ่าน: PremShop@Spotify!\nประเภท: Premium Individual\nหมายเหตุ: อย่าเชื่อมต่อ Facebook',
  FALSE
FROM public.products p WHERE p.name = 'Spotify Premium 1 เดือน'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_accounts (product_id, account_data, is_sold)
SELECT p.id,
  E'อีเมล: spotify_demo_002@premshop.com\nรหัสผ่าน: PremShop@Spotify!\nประเภท: Premium Individual\nหมายเหตุ: อย่าเชื่อมต่อ Facebook',
  FALSE
FROM public.products p WHERE p.name = 'Spotify Premium 1 เดือน'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_accounts (product_id, account_data, is_sold)
SELECT p.id,
  E'รหัส OTP: 485920\nเบอร์: 06X-XXX-XXXX\nแอพ: สำหรับสมัคร LINE\nหมดอายุ: ภายใน 5 นาที',
  FALSE
FROM public.products p WHERE p.name = 'รหัส OTP เบอร์ไทย (1 ครั้ง)'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed Data — Announcements
-- ============================================================

INSERT INTO public.announcements (title, content, type, likes_count) VALUES
  (
    '🎉 ยินดีต้อนรับสู่ PremShop!',
    E'PremShop — ร้านค้าดิจิทัลพรีเมียมที่คุณไว้วางใจ\n\nเราจำหน่ายบัญชี Streaming และสินค้าดิจิทัลราคาถูก จัดส่งอัตโนมัติทันทีหลังชำระเงิน ไม่ต้องรอ 24 ชั่วโมง\n\n📦 สินค้าที่เรามี:\n• Netflix, Disney+, YouTube Premium\n• HBO Max, Mono Max, VIU\n• Spotify, Amazon Prime Video\n• รหัส OTP เบอร์ไทยและต่างประเทศ\n\n💬 มีปัญหา? ติดต่อเราผ่านระบบ Ticket ได้ตลอด 24 ชั่วโมง',
    'news',
    42
  ),
  (
    '⚡ Flash Sale สุดพิเศษ! Netflix + Disney+ ลดสูงสุด 25%',
    E'🔥 โปรโมชัน Flash Sale สัปดาห์นี้เท่านั้น!\n\n• Netflix Premium 1 เดือน ราคาพิเศษ 79฿ (ปกติ 99฿)\n• Disney+ Hotstar 1 เดือน ราคาพิเศษ 69฿ (ปกติ 89฿)\n\n⏰ โปรนี้มีจำกัด! สิ้นสุดในอีก 7 วัน\n\n📌 วิธีซื้อ: เติมเงินเข้ากระเป๋า → เลือกสินค้า → ซื้อทันที ระบบส่งบัญชีอัตโนมัติ',
    'promotion',
    89
  ),
  (
    '📖 วิธีการสั่งซื้อและรับสินค้า',
    E'ขั้นตอนง่ายๆ เพียง 3 ขั้นตอน:\n\n1️⃣ สมัครสมาชิก / เข้าสู่ระบบ\n2️⃣ เติมเงินเข้ากระเป๋า PremShop\n   - โอนผ่าน PromptPay / QR Code\n   - อัพโหลด Slip การโอน\n   - รออนุมัติภายใน 5-15 นาที\n3️⃣ เลือกสินค้าและกดซื้อ\n   - ระบบตัดยอดอัตโนมัติ\n   - รับบัญชี/รหัสทันที\n\n⚠️ กรุณาเปลี่ยนรหัสผ่าน Netflix เฉพาะโปรไฟล์ของคุณเท่านั้น ห้ามเปลี่ยนรหัสผ่านหลัก',
    'news',
    156
  ),
  (
    '🔧 อัพเดทระบบ: ปรับปรุงความเร็วการจัดส่ง',
    E'เราได้ปรับปรุงระบบจัดส่งบัญชีอัตโนมัติให้เร็วขึ้น\n\n✅ สิ่งที่ปรับปรุง:\n• ระบบส่งบัญชีเร็วขึ้น 3 เท่า\n• เพิ่มสต็อกสินค้าทุกรายการ\n• ปรับปรุงหน้า Dashboard ให้ใช้งานง่ายขึ้น\n• เพิ่มระบบ Ticket สำหรับแจ้งปัญหา\n\nขอบคุณที่ใช้บริการ PremShop 🙏',
    'update',
    67
  ),
  (
    '💳 วิธีเติมเงินและนโยบายคืนเงิน',
    E'📌 วิธีเติมเงิน:\n• โอนผ่าน PromptPay เบอร์ 08X-XXX-XXXX\n• โอนผ่าน QR Code ในหน้า "เติมเงิน"\n• ขั้นต่ำ 20 บาท\n• อนุมัติภายใน 5-15 นาที (วันจันทร์-อาทิตย์)\n\n📌 นโยบายคืนเงิน:\n• คืนเงินได้หากบัญชีใช้งานไม่ได้ภายใน 24 ชม.\n• แจ้งผ่านระบบ Ticket พร้อมหลักฐาน\n• ไม่คืนเงินหากเปลี่ยนรหัสผ่านหลัก\n\n📞 ติดต่อ: Ticket ระบบใน 24 ชม.',
    'news',
    203
  )
ON CONFLICT DO NOTHING;
