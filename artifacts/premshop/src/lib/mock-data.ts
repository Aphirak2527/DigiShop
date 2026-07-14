import { Category, Product, Announcement } from '@/lib/supabase';

const now = new Date().toISOString();
const flashEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Video Streaming', icon_url: 'https://cdn-icons-png.flaticon.com/512/2168/2168243.png', slug: 'streaming', sort_order: 1, created_at: now },
  { id: 'cat-2', name: 'Music Streaming', icon_url: 'https://cdn-icons-png.flaticon.com/512/651/651758.png', slug: 'music', sort_order: 2, created_at: now },
  { id: 'cat-3', name: 'รหัส OTP / เบอร์รับรหัส', icon_url: 'https://cdn-icons-png.flaticon.com/512/2913/2913461.png', slug: 'otp', sort_order: 3, created_at: now },
  { id: 'cat-4', name: 'บัญชี / อีเมล', icon_url: 'https://cdn-icons-png.flaticon.com/512/747/747376.png', slug: 'accounts', sort_order: 4, created_at: now },
];

const streamingCat = MOCK_CATEGORIES[0];
const musicCat = MOCK_CATEGORIES[1];
const otpCat = MOCK_CATEGORIES[2];

export const MOCK_PRODUCTS: Product[] = [
  // ─── Netflix ───────────────────────────────────────────────────────────────
  {
    id: 'p-netflix-1m', category_id: 'cat-1', name: 'Netflix Premium 1 เดือน',
    description: '✅ Netflix Premium 4 จอ UHD\n✅ รองรับทุกอุปกรณ์ (TV, Mobile, PC)\n✅ ดูได้ทันทีหลังซื้อ\n✅ บัญชีส่วนตัว ไม่แชร์\n⚠️ ใช้งานได้ 30 วันนับจากวันที่รับบัญชี',
    price: 99, original_price: 149,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
    stock: 25, is_flash_sale: true, flash_sale_price: 79, flash_sale_end_at: flashEnd,
    is_active: true, sold_count: 4821, created_at: now, category: streamingCat,
  },
  {
    id: 'p-netflix-3m', category_id: 'cat-1', name: 'Netflix Premium 3 เดือน',
    description: '✅ Netflix Premium 4 จอ UHD\n✅ ประหยัดกว่าซื้อรายเดือน 10%\n✅ รองรับทุกอุปกรณ์ (TV, Mobile, PC)\n✅ บัญชีส่วนตัว ไม่แชร์\n⚠️ ใช้งานได้ 90 วัน',
    price: 269, original_price: 399,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
    stock: 18, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 2103, created_at: now, category: streamingCat,
  },
  {
    id: 'p-netflix-6m', category_id: 'cat-1', name: 'Netflix Premium 6 เดือน',
    description: '✅ Netflix Premium 4 จอ UHD\n✅ ประหยัดกว่าซื้อรายเดือน 16%\n✅ รองรับทุกอุปกรณ์\n⚠️ ใช้งานได้ 180 วัน',
    price: 499, original_price: 699,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
    stock: 10, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 987, created_at: now, category: streamingCat,
  },
  {
    id: 'p-netflix-1y', category_id: 'cat-1', name: 'Netflix Premium 1 ปี',
    description: '✅ Netflix Premium 4 จอ UHD\n✅ ประหยัดที่สุด! คุ้มกว่า 25%\n✅ รองรับทุกอุปกรณ์\n⚠️ ใช้งานได้ 365 วัน',
    price: 899, original_price: 1299,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
    stock: 5, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 432, created_at: now, category: streamingCat,
  },

  // ─── Disney+ ───────────────────────────────────────────────────────────────
  {
    id: 'p-disney-1m', category_id: 'cat-1', name: 'Disney+ Hotstar 1 เดือน',
    description: '✅ Disney+ Hotstar ครบทุก Content\n✅ Marvel, Star Wars, Pixar, National Geographic\n✅ ซีรีส์ไทยและเอเชียพิเศษ\n✅ รองรับ 4K HDR\n⚠️ ใช้งานได้ 30 วัน',
    price: 89, original_price: 99,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/320px-Disney%2B_logo.svg.png',
    stock: 20, is_flash_sale: true, flash_sale_price: 69, flash_sale_end_at: flashEnd,
    is_active: true, sold_count: 5309, created_at: now, category: streamingCat,
  },
  {
    id: 'p-disney-3m', category_id: 'cat-1', name: 'Disney+ Hotstar 3 เดือน',
    description: '✅ Disney+ Hotstar ครบทุก Content\n✅ Marvel, Star Wars, Pixar\n✅ ประหยัดกว่ารายเดือน 10%\n⚠️ ใช้งานได้ 90 วัน',
    price: 239, original_price: 279,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/320px-Disney%2B_logo.svg.png',
    stock: 15, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 1892, created_at: now, category: streamingCat,
  },
  {
    id: 'p-disney-1y', category_id: 'cat-1', name: 'Disney+ Hotstar 1 ปี',
    description: '✅ Disney+ Hotstar ครบทุก Content\n✅ ประหยัดสูงสุด 23%\n✅ รองรับ 4K HDR\n⚠️ ใช้งานได้ 365 วัน',
    price: 849, original_price: 1099,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/320px-Disney%2B_logo.svg.png',
    stock: 8, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 761, created_at: now, category: streamingCat,
  },

  // ─── YouTube Premium ────────────────────────────────────────────────────────
  {
    id: 'p-yt-1m', category_id: 'cat-1', name: 'YouTube Premium 1 เดือน',
    description: '✅ ไม่มีโฆษณาคั่นในทุกวิดีโอ\n✅ เล่น Background ได้ (ปิดหน้าจอแล้วฟังต่อ)\n✅ ดาวน์โหลดไว้ดูออฟไลน์\n✅ รวม YouTube Music Premium\n⚠️ ใช้งานได้ 30 วัน',
    price: 69, original_price: 89,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/320px-YouTube_Logo_2017.svg.png',
    stock: 30, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 3892, created_at: now, category: streamingCat,
  },
  {
    id: 'p-yt-3m', category_id: 'cat-1', name: 'YouTube Premium 3 เดือน',
    description: '✅ ไม่มีโฆษณา ดูตลอด 3 เดือน\n✅ เล่น Background + ออฟไลน์\n✅ รวม YouTube Music Premium\n⚠️ ใช้งานได้ 90 วัน',
    price: 189, original_price: 249,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/320px-YouTube_Logo_2017.svg.png',
    stock: 20, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 1543, created_at: now, category: streamingCat,
  },
  {
    id: 'p-yt-1y', category_id: 'cat-1', name: 'YouTube Premium 1 ปี',
    description: '✅ ไม่มีโฆษณาตลอด 1 ปีเต็ม\n✅ เล่น Background + ออฟไลน์\n✅ รวม YouTube Music Premium\n✅ ประหยัด 30%\n⚠️ ใช้งานได้ 365 วัน',
    price: 699, original_price: 999,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/320px-YouTube_Logo_2017.svg.png',
    stock: 12, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 621, created_at: now, category: streamingCat,
  },

  // ─── HBO Max ────────────────────────────────────────────────────────────────
  {
    id: 'p-hbo-1m', category_id: 'cat-1', name: 'HBO Max 1 เดือน',
    description: '✅ HBO Original Series ทุกเรื่อง\n✅ Game of Thrones, House of the Dragon, The Last of Us\n✅ หนัง DC Comics ทุกเรื่อง\n✅ รองรับ 4K HDR Dolby Vision\n⚠️ ใช้งานได้ 30 วัน',
    price: 119, original_price: 149,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/HBO_logo.svg/320px-HBO_logo.svg.png',
    stock: 12, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 1445, created_at: now, category: streamingCat,
  },
  {
    id: 'p-hbo-3m', category_id: 'cat-1', name: 'HBO Max 3 เดือน',
    description: '✅ HBO Original Series ทุกเรื่อง\n✅ Game of Thrones, The Last of Us, True Detective\n✅ ประหยัดกว่ารายเดือน 10%\n⚠️ ใช้งานได้ 90 วัน',
    price: 319, original_price: 429,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/HBO_logo.svg/320px-HBO_logo.svg.png',
    stock: 8, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 567, created_at: now, category: streamingCat,
  },

  // ─── Mono Max ───────────────────────────────────────────────────────────────
  {
    id: 'p-mono-1m', category_id: 'cat-1', name: 'Mono Max 1 เดือน',
    description: '✅ หนังไทยและต่างประเทศ HD หลายพันเรื่อง\n✅ ซีรีส์ใหม่อัพเดททุกสัปดาห์\n✅ รองรับ iOS, Android, Smart TV\n⚠️ ใช้งานได้ 30 วัน',
    price: 49, original_price: 59,
    image_url: null,
    stock: 15, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 2201, created_at: now, category: streamingCat,
  },
  {
    id: 'p-mono-3m', category_id: 'cat-1', name: 'Mono Max 3 เดือน',
    description: '✅ หนังไทยและต่างประเทศ HD หลายพันเรื่อง\n✅ ประหยัดกว่ารายเดือน 12%\n⚠️ ใช้งานได้ 90 วัน',
    price: 129, original_price: 169,
    image_url: null,
    stock: 10, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 891, created_at: now, category: streamingCat,
  },

  // ─── VIU ────────────────────────────────────────────────────────────────────
  {
    id: 'p-viu-1m', category_id: 'cat-1', name: 'VIU Premium 1 เดือน',
    description: '✅ ซีรีส์เกาหลียอดนิยมไม่อั้น\n✅ ซับไทย ซับอังกฤษ ครบ\n✅ อัพเดทตอนใหม่เร็วที่สุดในไทย\n✅ ซีรีส์ไทย ญี่ปุ่น จีน ครบ\n⚠️ ใช้งานได้ 30 วัน',
    price: 39, original_price: 49,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Viu-logo.svg/320px-Viu-logo.svg.png',
    stock: 20, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 3167, created_at: now, category: streamingCat,
  },
  {
    id: 'p-viu-3m', category_id: 'cat-1', name: 'VIU Premium 3 เดือน',
    description: '✅ ซีรีส์เกาหลียอดนิยมไม่อั้น\n✅ ซับไทย ครบ\n✅ ประหยัดกว่ารายเดือน 15%\n⚠️ ใช้งานได้ 90 วัน',
    price: 99, original_price: 139,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Viu-logo.svg/320px-Viu-logo.svg.png',
    stock: 12, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 1032, created_at: now, category: streamingCat,
  },

  // ─── Prime Video ────────────────────────────────────────────────────────────
  {
    id: 'p-prime-1m', category_id: 'cat-1', name: 'Amazon Prime Video 1 เดือน',
    description: '✅ หนังและซีรีส์ Amazon Original\n✅ The Boys, Rings of Power, Reacher\n✅ รองรับ 4K UHD HDR10+ Dolby Vision\n✅ ดาวน์โหลดไว้ดูออฟไลน์\n⚠️ ใช้งานได้ 30 วัน',
    price: 79, original_price: 99,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/320px-Amazon_Prime_Video_logo.svg.png',
    stock: 18, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 1388, created_at: now, category: streamingCat,
  },
  {
    id: 'p-prime-3m', category_id: 'cat-1', name: 'Amazon Prime Video 3 เดือน',
    description: '✅ Amazon Original ทุกเรื่อง\n✅ The Boys, Rings of Power, Reacher\n✅ ประหยัดกว่ารายเดือน 12%\n⚠️ ใช้งานได้ 90 วัน',
    price: 209, original_price: 279,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/320px-Amazon_Prime_Video_logo.svg.png',
    stock: 10, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 589, created_at: now, category: streamingCat,
  },

  // ─── Spotify ────────────────────────────────────────────────────────────────
  {
    id: 'p-spotify-1m', category_id: 'cat-2', name: 'Spotify Premium 1 เดือน',
    description: '✅ ฟังเพลงไม่มีโฆษณา\n✅ ดาวน์โหลดเพลงไว้ฟังออฟไลน์ไม่อั้น\n✅ คุณภาพเสียงสูงสุด 320kbps\n✅ ข้ามเพลงได้ไม่จำกัด\n⚠️ ใช้งานได้ 30 วัน',
    price: 59, original_price: 79,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
    stock: 30, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 7144, created_at: now, category: musicCat,
  },
  {
    id: 'p-spotify-3m', category_id: 'cat-2', name: 'Spotify Premium 3 เดือน',
    description: '✅ ฟังเพลงไม่มีโฆษณา 3 เดือน\n✅ ดาวน์โหลดออฟไลน์ไม่อั้น\n✅ ประหยัดกว่ารายเดือน 10%\n⚠️ ใช้งานได้ 90 วัน',
    price: 159, original_price: 219,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
    stock: 22, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 3521, created_at: now, category: musicCat,
  },
  {
    id: 'p-spotify-6m', category_id: 'cat-2', name: 'Spotify Premium 6 เดือน',
    description: '✅ ฟังเพลงไม่มีโฆษณา 6 เดือน\n✅ ดาวน์โหลดออฟไลน์ไม่อั้น\n✅ ประหยัดกว่ารายเดือน 16%\n⚠️ ใช้งานได้ 180 วัน',
    price: 299, original_price: 419,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
    stock: 15, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 1872, created_at: now, category: musicCat,
  },
  {
    id: 'p-spotify-1y', category_id: 'cat-2', name: 'Spotify Premium 1 ปี',
    description: '✅ ฟังเพลงไม่มีโฆษณาตลอด 1 ปี\n✅ ดาวน์โหลดออฟไลน์ไม่อั้น\n✅ คุ้มที่สุด ประหยัด 31%\n⚠️ ใช้งานได้ 365 วัน',
    price: 549, original_price: 799,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
    stock: 8, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 943, created_at: now, category: musicCat,
  },

  // ─── OTP ────────────────────────────────────────────────────────────────────
  {
    id: 'p-otp-th', category_id: 'cat-3', name: 'รหัส OTP เบอร์ไทย (1 ครั้ง)',
    description: '✅ รับรหัส OTP เบอร์ไทย (+66)\n✅ ใช้สมัครแอพต่างๆ เช่น LINE, TikTok, Facebook\n✅ รองรับแทบทุกแอพพลิเคชัน\n✅ ส่งรหัสภายใน 1-3 นาที\n⚠️ ใช้ได้ 1 ครั้งต่อรหัส',
    price: 25, original_price: null,
    image_url: 'https://cdn-icons-png.flaticon.com/512/2913/2913461.png',
    stock: 100, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 5752, created_at: now, category: otpCat,
  },
  {
    id: 'p-otp-intl', category_id: 'cat-3', name: 'รหัส OTP เบอร์ต่างประเทศ (1 ครั้ง)',
    description: '✅ รับรหัส OTP เบอร์ต่างประเทศ (US/UK/MY)\n✅ รองรับ ChatGPT, Telegram, WhatsApp, Binance\n✅ ส่งรหัสภายใน 1-5 นาที\n⚠️ ใช้ได้ 1 ครั้งต่อรหัส',
    price: 35, original_price: null,
    image_url: 'https://cdn-icons-png.flaticon.com/512/2913/2913461.png',
    stock: 80, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 2341, created_at: now, category: otpCat,
  },
  {
    id: 'p-otp-pack5', category_id: 'cat-3', name: 'รหัส OTP เบอร์ไทย แพ็ก 5 ครั้ง',
    description: '✅ รหัส OTP เบอร์ไทย (+66) จำนวน 5 รหัส\n✅ ประหยัดกว่าซื้อแยก 20%\n✅ รองรับ LINE, TikTok, Facebook และอื่นๆ\n⚠️ รหัสมีอายุ 30 วันหลังจากรับ',
    price: 99, original_price: 125,
    image_url: 'https://cdn-icons-png.flaticon.com/512/2913/2913461.png',
    stock: 50, is_flash_sale: false, flash_sale_price: null, flash_sale_end_at: null,
    is_active: true, sold_count: 1123, created_at: now, category: otpCat,
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '🎉 ยินดีต้อนรับสู่ PremShop!',
    content: 'PremShop — ร้านค้าดิจิทัลพรีเมียมที่คุณไว้วางใจ\n\nเราจำหน่ายบัญชี Streaming และสินค้าดิจิทัลราคาถูก จัดส่งอัตโนมัติทันทีหลังชำระเงิน ไม่ต้องรอ 24 ชั่วโมง\n\n📦 สินค้าที่เรามี:\n• Netflix, Disney+, YouTube Premium\n• HBO Max, Mono Max, VIU\n• Spotify, Amazon Prime Video\n• รหัส OTP เบอร์ไทยและต่างประเทศ\n\n💬 มีปัญหา? ติดต่อเราผ่านระบบ Ticket ได้ตลอด 24 ชั่วโมง',
    type: 'news',
    image_url: null,
    likes_count: 42,
    created_at: now,
  },
  {
    id: 'ann-2',
    title: '⚡ Flash Sale สุดพิเศษ! Netflix + Disney+ ลดสูงสุด 25%',
    content: '🔥 โปรโมชัน Flash Sale สัปดาห์นี้เท่านั้น!\n\n• Netflix Premium 1 เดือน ราคาพิเศษ 79฿ (ปกติ 99฿)\n• Disney+ Hotstar 1 เดือน ราคาพิเศษ 69฿ (ปกติ 89฿)\n\n⏰ โปรนี้มีจำกัด! สิ้นสุดในอีก 7 วัน\n\n📌 วิธีซื้อ: เติมเงินเข้ากระเป๋า → เลือกสินค้า → ซื้อทันที',
    type: 'promotion',
    image_url: null,
    likes_count: 89,
    created_at: now,
  },
  {
    id: 'ann-3',
    title: '📖 วิธีการสั่งซื้อและรับสินค้า',
    content: 'ขั้นตอนง่ายๆ เพียง 3 ขั้นตอน:\n\n1️⃣ สมัครสมาชิก / เข้าสู่ระบบ\n2️⃣ เติมเงินเข้ากระเป๋า PremShop โอนผ่าน PromptPay\n3️⃣ เลือกสินค้าและกดซื้อ ระบบตัดยอดอัตโนมัติ รับบัญชีทันที\n\n⚠️ อย่าเปลี่ยนรหัสผ่านหลักของบัญชีที่ซื้อ',
    type: 'news',
    image_url: null,
    likes_count: 156,
    created_at: now,
  },
  {
    id: 'ann-4',
    title: '🔧 อัพเดทระบบ: ปรับปรุงความเร็วการจัดส่ง',
    content: 'เราได้ปรับปรุงระบบจัดส่งบัญชีอัตโนมัติให้เร็วขึ้น 3 เท่า เพิ่มสต็อกสินค้าทุกรายการ และปรับปรุงหน้า Dashboard ให้ใช้งานง่ายขึ้น',
    type: 'update',
    image_url: null,
    likes_count: 67,
    created_at: now,
  },
  {
    id: 'ann-5',
    title: '💳 วิธีเติมเงินและนโยบายคืนเงิน',
    content: '📌 วิธีเติมเงิน:\n• โอนผ่าน PromptPay / QR Code ในหน้า "เติมเงิน"\n• ขั้นต่ำ 20 บาท อนุมัติภายใน 5-15 นาที\n\n📌 นโยบายคืนเงิน:\n• คืนเงินได้หากบัญชีใช้งานไม่ได้ภายใน 24 ชม.\n• แจ้งผ่านระบบ Ticket พร้อมหลักฐาน',
    type: 'news',
    image_url: null,
    likes_count: 203,
    created_at: now,
  },
];

export const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';
