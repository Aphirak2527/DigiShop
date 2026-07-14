import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, History, LifeBuoy, CreditCard, ShoppingBag, Settings } from 'lucide-react';

export default function Dashboard() {
  const { profile, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !profile) {
      setLocation('/login');
    }
  }, [profile, loading, setLocation]);

  if (loading || !profile) {
    return <div className="p-8 text-center">กำลังโหลด...</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">ยินดีต้อนรับ, {profile.username}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card - Highlight */}
        <Card className="md:col-span-2 bg-gradient-to-br from-card to-background border-border/50 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-muted-foreground">ยอดเงินคงเหลือ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="text-5xl font-bold text-primary tracking-tight">
                ฿{profile.balance.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" className="font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]" asChild data-testid="btn-dash-topup">
                <Link href="/topup">
                  <CreditCard className="w-5 h-5 mr-2" />
                  เติมเงิน
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <Link href="/history" className="block group">
            <Card className="border-border/50 bg-card hover:bg-secondary/50 hover:border-primary/50 transition-colors h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">ประวัติสั่งซื้อ</h3>
                  <p className="text-sm text-muted-foreground">ดูรายการบัญชีที่คุณซื้อแล้ว</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/tickets" className="block group">
            <Card className="border-border/50 bg-card hover:bg-secondary/50 hover:border-primary/50 transition-colors h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">แจ้งปัญหา</h3>
                  <p className="text-sm text-muted-foreground">ติดต่อแอดมินหรือขอเคลมสินค้า</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {profile.role === 'admin' && (
          <Card className="border-border/50 bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary text-lg">Admin Panel</h3>
                  <p className="text-sm text-muted-foreground">จัดการสินค้า หมวดหมู่ ผู้ใช้ และดูสถิติ</p>
                </div>
              </div>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <Link href="/admin">ไปที่ Admin Panel</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
