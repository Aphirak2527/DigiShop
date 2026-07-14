import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useProducts, useCategories, useAnnouncements } from '@/hooks/queries';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Zap, Wallet, Monitor, Mail, MessageSquare, Home as HomeIcon, Headphones,
  UserPlus, CreditCard, ShoppingCart,
  ChevronRight, Star, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Mock recent purchases ─────────────────────────────────────────────────────
const RECENT = [
  { product: 'Prime Video 30 วัน', user: 'ko***25', time: '10 นาทีที่แล้ว', color: '#00A8E1', letter: 'P' },
  { product: 'Netflix 1 เดือน (ทีวี/ค...)', user: 'bb***op', time: '11 นาทีที่แล้ว', color: '#E50914', letter: 'N' },
  { product: 'Netflix 1 เดือน (มือถือ...)', user: 'te***ak', time: '17 นาทีที่แล้ว', color: '#E50914', letter: 'N' },
  { product: 'Disney+ 30 วัน (ทุก...)', user: 'no***79', time: '21 นาทีที่แล้ว', color: '#113CCF', letter: 'D' },
  { product: 'Spotify Premium 1 เดือน', user: 'pa***na', time: '35 นาทีที่แล้ว', color: '#1DB954', letter: 'S' },
  { product: 'YouTube Premium 1 เดือน', user: 'so***55', time: '42 นาทีที่แล้ว', color: '#FF0000', letter: 'Y' },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'สมาชิกทั้งหมด', value: '20,250', sub: '↗ เติบโตต่อเนื่อง', color: '#FF8C00', textColor: '#FF8C00' },
  { label: 'ออเดอร์สะสม', value: '106,260', sub: '↗ +247 วันนี้', color: '#1E88E5', textColor: '#1E88E5' },
  { label: 'รายการเติมเงิน', value: '82,395', sub: '↗ +189 วันนี้', color: '#43A047', textColor: '#43A047' },
  { label: 'สินค้าพร้อมขาย', value: '339', sub: '📦 สต็อกพร้อมส่ง', color: '#7B1FA2', textColor: '#7B1FA2' },
];

// ── Menu items ────────────────────────────────────────────────────────────────
const MENU = [
  { label: 'เติมเงิน', sub: 'TOP UP', icon: Wallet, color: '#FF8C00', bg: '#FFF3E0', href: '/topup' },
  { label: 'แอพพรีเมียม', sub: 'PREMIUM', icon: Monitor, color: '#1E88E5', bg: '#E3F2FD', href: '/products' },
  { label: 'ซื้อเมล/บัญชี', sub: 'EMAIL', icon: Mail, color: '#D81B60', bg: '#FCE4EC', href: '/products' },
  { label: 'ซื้อ OTP', sub: 'SMS/OTP', icon: MessageSquare, color: '#43A047', bg: '#E8F5E9', href: '/products?cat=otp' },
  { label: 'ยืนยันครัวเรือน', sub: 'HOUSEHOLD', icon: HomeIcon, color: '#E53935', bg: '#FFEBEE', href: '#' },
  { label: 'ติดต่อแอดมิน', sub: 'CONTACT', icon: Headphones, color: '#06C755', bg: '#E8F5E9', href: '/tickets' },
];

// ── How-to steps ─────────────────────────────────────────────────────────────
const HOW_TO = [
  { num: 1, title: 'สมัครสมาชิก', desc: 'สมัครฟรี ใช้อีเมล Gmail หรือ Google/LINE ใช้เวลาไม่ถึง 1 นาที', href: '/register', cta: 'สมัครเลย →', icon: UserPlus, bg: '#FFF3E0', color: '#FF8C00' },
  { num: 2, title: 'เติมเงินเข้าระบบ', desc: 'รองรับ TrueMoney Wallet, สลิปธนาคาร และคูปองโค้ด ระบบเข้าอัตโนมัติ', href: '/topup', cta: 'เติมเงิน →', icon: CreditCard, bg: '#E3F2FD', color: '#1E88E5' },
  { num: 3, title: 'เลือกซื้อสินค้า', desc: 'เลือกแอพที่ต้องการ ราคาถูก สต็อกพร้อมส่ง จ่ายด้วยยอดในกระเป๋า', href: '/products', cta: 'ดูสินค้า →', icon: ShoppingCart, bg: '#E8F5E9', color: '#43A047' },
  { num: 4, title: 'ใช้งาน + Support', desc: 'รับบัญชีทันทีหลังสั่งซื้อ มีทีม Support พร้อมช่วยเหลือ 24 ชั่วโมง', href: '/tickets', cta: 'ติดต่อ →', icon: Headphones, bg: '#F3E5F5', color: '#7B1FA2' },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ = [
  { q: 'สินค้าใช้งานได้นานแค่ไหน?', a: 'ขึ้นอยู่กับแพ็กเกจที่เลือก ตั้งแต่ 7 วัน, 30 วัน, 90 วัน ไปจนถึง 1 ปี โดยนับจากวันที่รับบัญชี' },
  { q: 'มีปัญหาสามารถเคลมได้หรือไม่?', a: 'ได้เลย! หากบัญชีมีปัญหาภายใน 24 ชั่วโมงแรก แจ้งผ่านระบบ Ticket พร้อมหลักฐาน ทีมงานพร้อมช่วยเหลือ' },
  { q: 'เติมเงินได้ช่องทางไหนบ้าง?', a: 'รองรับ PromptPay / QR Code, โอนธนาคาร, TrueMoney Wallet และคูปองส่วนลด' },
  { q: 'สินค้าส่งเร็วแค่ไหน?', a: 'ระบบส่งบัญชีอัตโนมัติทันทีหลังชำระเงิน ไม่ต้องรอ ไม่ต้องรบกวนแอดมิน' },
  { q: 'บริการยืนยันครัวเรือน Netflix คืออะไร?', a: 'บริการช่วยยืนยันที่อยู่ (Household) เพื่อให้ใช้งาน Netflix นอกบ้านได้ตามปกติ ไม่ถูก lock' },
  { q: 'ติดต่อแอดมินได้ที่ไหน?', a: 'ติดต่อได้ผ่านระบบ Ticket ในเว็บไซต์ ตลอด 24 ชั่วโมง' },
];

// ── Wave SVG background for stats cards ──────────────────────────────────────
function WaveBg({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 400 90"
      className="absolute bottom-0 left-0 right-0 w-full opacity-15"
      preserveAspectRatio="none"
    >
      <path d="M0,55 C80,20 160,75 240,45 C320,15 370,55 400,35 L400,90 L0,90 Z" fill={color} />
    </svg>
  );
}

// ── Countdown display ─────────────────────────────────────────────────────────
function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-foreground/90 text-white text-sm font-bold w-9 h-9 rounded-lg flex items-center justify-center leading-none tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[9px] text-white/70 mt-0.5">{label}</span>
    </div>
  );
}

export default function Home() {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: announcements } = useAnnouncements();

  const flashSale = products?.filter(
    p => p.is_flash_sale && p.is_active && new Date(p.flash_sale_end_at || 0) > new Date()
  ) ?? [];

  // Countdown from 7 days
  const [timeLeft, setTimeLeft] = useState(() => {
    const totalSec = 7 * 24 * 3600 + 11 * 3600 + 49 * 60 + 21;
    return totalSec;
  });

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const mins = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex flex-col">

      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-orange-400 to-amber-400 px-5 pt-6 pb-8">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <span className="text-white/90 text-xs font-medium">ร้านค้าที่ไว้วางใจได้</span>
            </div>
            <h1 className="text-white font-bold text-xl leading-tight mb-1">
              PremShop<br />
              <span className="text-yellow-200">บริการแอพสตรีมมิ่งราคาถูก</span>
            </h1>
            <p className="text-white/80 text-xs mb-4">ดูหนัง ซีรีส์ การ์ตูน ครบที่เดียว!<br />ส่งอัตโนมัติ 24 ชั่วโมง</p>
            <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-bold rounded-full shadow-md text-xs px-4" asChild>
              <Link href="/products">ดูสินค้าทั้งหมด →</Link>
            </Button>
          </div>
          {/* Illustration placeholder */}
          <div className="w-28 h-28 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30">
            <div className="text-center">
              <div className="text-3xl mb-1">🎬</div>
              <div className="text-white/90 text-[10px] font-medium">Netflix · Disney+<br />Spotify · HBO</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Flash Sale ───────────────────────────────────────────── */}
      {flashSale.length > 0 && (
        <section className="px-4 pt-4 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 fill-white" />
                FLASH SALE
              </div>
              {/* Countdown */}
              <div className="flex items-center gap-1">
                <TimeBox value={days} label="วัน" />
                <span className="text-foreground/70 font-bold text-lg leading-none -mt-3">:</span>
                <TimeBox value={hours} label="ชม." />
                <span className="text-foreground/70 font-bold text-lg leading-none -mt-3">:</span>
                <TimeBox value={mins} label="นาที" />
                <span className="text-foreground/70 font-bold text-lg leading-none -mt-3">:</span>
                <TimeBox value={secs} label="วิ" />
              </div>
            </div>
          </div>

          {/* Horizontal scroll product list */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {flashSale.map(p => (
              <div key={p.id} className="min-w-[150px] max-w-[150px]">
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── เมนูแนะนำ ────────────────────────────────────────────── */}
      <section className="px-4 pt-5 pb-3">
        <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base text-foreground">เมนูแนะนำ</h2>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">Recommend Menu</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-full text-xs border-primary text-primary h-7 px-3" asChild>
              <Link href="/tickets">💬 ติดต่อแอดมิน</Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {MENU.map((item) => (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1.5 group">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95"
                  style={{ backgroundColor: item.bg }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-foreground leading-tight">{item.label}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{item.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ประกาศข่าวสาร ─────────────────────────────────────────── */}
      {announcements && announcements.length > 0 && (
        <section className="px-4 pt-2 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <span className="font-bold text-base">ประกาศข่าวสาร</span>
              <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                LIVE
              </span>
            </div>
            <Link href="/announcements" className="flex items-center gap-0.5 text-xs text-primary font-medium">
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {announcements.slice(0, 4).map(ann => (
              <div key={ann.id} className="min-w-[220px] bg-white rounded-2xl border border-border/50 shadow-sm p-3.5 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">
                      {ann.type === 'promotion' ? '🔥' : ann.type === 'update' ? '🔧' : ann.type === 'maintenance' ? '⚠️' : '📢'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground line-clamp-1">{ann.title}</div>
                    {ann.type === 'promotion' && (
                      <Badge className="text-[9px] bg-orange-100 text-orange-600 border-orange-200 px-1.5 py-0 h-4 font-medium">โปรโมชัน</Badge>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{ann.content}</p>
                <Link href="/announcements" className="text-[11px] text-primary font-semibold mt-1.5 block">
                  ดูเพิ่มเติม →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ประวัติสั่งซื้อล่าสุด (mock feed) ───────────────────── */}
      <section className="px-4 pt-2 pb-3">
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">ประวัติสั่งซื้อล่าสุด</div>
              <div className="text-[10px] text-muted-foreground">อัพเดตแบบ Real-time</div>
            </div>
            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
              Live
            </span>
          </div>
          {RECENT.map((r, i) => (
            <div key={i} className={cn("flex items-center gap-3 px-4 py-2.5", i < RECENT.length - 1 && "border-b border-border/20")}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: r.color }}
              >
                {r.letter}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">{r.product}</div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <span>👤</span>
                  <span className="text-primary font-medium">{r.user}</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{r.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats cards ──────────────────────────────────────────── */}
      <section className="px-4 pt-2 pb-3 grid grid-cols-2 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="relative bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden px-4 pt-3 pb-5 min-h-[90px]">
            <WaveBg color={s.color} />
            <div className="relative z-10">
              <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
              <div className="text-2xl font-extrabold" style={{ color: s.textColor }}>{s.value}</div>
              <div className="text-[10px] mt-0.5" style={{ color: s.textColor }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── All products ─────────────────────────────────────────── */}
      <section className="px-4 pt-2 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">สินค้าทั้งหมด</h2>
          <Link href="/products" className="flex items-center gap-0.5 text-xs text-primary font-medium">
            ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(products?.filter(p => p.is_active) ?? []).slice(0, 8).map(p => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
        {(products?.filter(p => p.is_active).length ?? 0) > 8 && (
          <Button variant="outline" className="w-full mt-3 rounded-xl border-primary text-primary" asChild>
            <Link href="/products">ดูสินค้าทั้งหมด ({products?.filter(p => p.is_active).length} รายการ)</Link>
          </Button>
        )}
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="px-4 pt-2 pb-3">
          <h2 className="font-bold text-base mb-3">หมวดหมู่สินค้า</h2>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-2xl border border-border/50 shadow-sm px-4 py-3 min-w-[90px] hover:border-primary/50 transition-colors"
              >
                {cat.icon_url ? (
                  <img src={cat.icon_url} alt={cat.name} className="w-8 h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {cat.name.charAt(0)}
                  </div>
                )}
                <span className="text-[11px] font-medium text-foreground text-center leading-tight line-clamp-2">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── คำแนะนำและวิธีใช้งาน ─────────────────────────────────── */}
      <section className="px-4 pt-2 pb-3">
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: '#FFF3E0' }}>📖</div>
            <div>
              <h2 className="font-bold text-base">คำแนะนำและวิธีใช้งาน</h2>
              <p className="text-[11px] text-muted-foreground">เริ่มต้นใช้บริการได้ใน 4 ขั้นตอนง่ายๆ</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {HOW_TO.map(step => (
              <div key={step.num} className="rounded-2xl p-3.5" style={{ backgroundColor: step.bg }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: step.color + '20' }}>
                  <step.icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <div className="font-bold text-sm text-foreground mb-1">{step.num}. {step.title}</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{step.desc}</p>
                <Link href={step.href} className="text-xs font-semibold" style={{ color: step.color }}>
                  {step.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="px-4 pt-2 pb-6">
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-base">❓</div>
            <div>
              <h2 className="font-bold text-base">คำถามที่พบบ่อย</h2>
              <p className="text-[11px] text-muted-foreground">คำถามและคำตอบที่ลูกค้าถามมากที่สุด</p>
            </div>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border/50 rounded-xl px-4 overflow-hidden"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground py-3 hover:no-underline text-left">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-3 leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="px-4 pb-4 text-center">
        <div className="text-sm font-bold text-foreground mb-0.5">
          <span className="text-foreground">Prem</span><span className="text-primary">Shop</span>
        </div>
        <div className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} ร้านค้าดิจิทัลพรีเมียม · All rights reserved.</div>
      </div>

    </div>
  );
}
