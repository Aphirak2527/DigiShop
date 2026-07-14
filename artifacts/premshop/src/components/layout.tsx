import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LogOut, LayoutDashboard, History, LifeBuoy, Wallet, Settings,
  Menu, Home, Bell, User, Monitor, ChevronRight, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const [location] = useLocation();

  const handleSignOut = async () => { await signOut(); };

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">

      {/* ── Top header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border/50 shadow-sm">
        <div className="max-w-2xl mx-auto h-14 flex items-center justify-between px-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-lg">
              <span className="text-foreground">Prem</span>
              <span className="text-primary">Shop</span>
            </span>
          </Link>

          {/* Right: user chip + hamburger */}
          <div className="flex items-center gap-2">
            {profile ? (
              <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1.5 border border-border/50">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-medium text-foreground/70">{profile.username}</span>
                  <span className="text-xs font-bold text-primary">฿{profile.balance.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" asChild className="rounded-full text-xs h-8 border-primary text-primary hover:bg-primary hover:text-white">
                <Link href="/login">เข้าสู่ระบบ</Link>
              </Button>
            )}

            {/* Hamburger drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 bg-white">
                {/* User profile header */}
                {profile ? (
                  <div className="bg-primary px-5 py-6 text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{profile.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-semibold text-base">{profile.username}</span>
                          <span className="text-[10px] bg-white/20 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" /> สมาชิก
                          </span>
                        </div>
                        <div className="text-sm text-white/80">ยอดเงิน ฿{profile.balance.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-primary px-5 py-6 text-white text-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="secondary" asChild className="rounded-full text-primary">
                        <Link href="/login">เข้าสู่ระบบ</Link>
                      </Button>
                      <Button size="sm" asChild className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/30 border">
                        <Link href="/register">สมัครสมาชิก</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Menu links */}
                <div className="py-2">
                  <DrawerLink href="/" icon={Home} label="หน้าแรก" active={isActive('/')} />
                  <DrawerLink href="/products" icon={Monitor} label="สินค้าทั้งหมด" active={isActive('/products')} />
                  <DrawerLink href="/announcements" icon={Bell} label="ประกาศข่าวสาร" active={isActive('/announcements')} />
                  {profile && (
                    <>
                      <div className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">บัญชีของฉัน</div>
                      <DrawerLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/dashboard')} />
                      <DrawerLink href="/topup" icon={Wallet} label="เติมเงิน" active={isActive('/topup')} />
                      <DrawerLink href="/history" icon={History} label="ประวัติสั่งซื้อ" active={isActive('/history')} />
                      <DrawerLink href="/tickets" icon={LifeBuoy} label="แจ้งปัญหา" active={isActive('/tickets')} />
                      {profile.role === 'admin' && (
                        <>
                          <div className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin</div>
                          <DrawerLink href="/admin" icon={Settings} label="Admin Panel" active={isActive('/admin')} />
                        </>
                      )}
                      <div className="border-t border-border/50 mt-2 pt-2 mx-3">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          ออกจากระบบ
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl w-full mx-auto pb-24 md:pb-8">
        {children}
      </main>

      {/* ── Bottom nav (mobile) ─────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border/50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto flex items-end justify-around h-16 px-2">
          <BottomNavItem icon={Wallet} label="เติมเงิน" href="/topup" active={isActive('/topup')} />
          <BottomNavItem icon={Monitor} label="ซื้อแอพ" href="/products" active={isActive('/products')} />

          {/* Floating center home button */}
          <Link href="/" className="flex flex-col items-center -mt-5">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
              isActive('/') ? "bg-primary shadow-[0_4px_12px_rgba(249,115,22,0.4)]" : "bg-primary"
            )}>
              <Home className="w-6 h-6 text-white" />
            </div>
          </Link>

          <BottomNavItem icon={Bell} label="แจ้งเตือน" href="/announcements" active={isActive('/announcements')} />
          <BottomNavItem
            icon={User}
            label="บัญชี"
            href={profile ? '/dashboard' : '/login'}
            active={isActive('/dashboard') || isActive('/login')}
          />
        </div>
      </nav>
    </div>
  );
}

function DrawerLink({ href, icon: Icon, label, active }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between px-4 py-2.5 mx-3 rounded-xl text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}

function BottomNavItem({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-0">
      <Icon className={cn("w-5 h-5 transition-colors", active ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-[10px] font-medium transition-colors truncate", active ? "text-primary" : "text-muted-foreground")}>
        {label}
      </span>
    </Link>
  );
}
