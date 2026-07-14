import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, DollarSign, WalletCards } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({ users: 0, revenue: 0, orders: 0, pendingTopups: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      setLocation('/');
    }
  }, [profile, loading, setLocation]);

  useEffect(() => {
    async function fetchStats() {
      if (profile?.role !== 'admin') return;
      
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: pendingTopups } = await supabase.from('wallet_transactions').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      const { data: revenueData } = await supabase.from('orders').select('total_price').eq('status', 'completed');
      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      
      setStats({
        users: usersCount || 0,
        revenue: totalRevenue,
        orders: ordersCount || 0,
        pendingTopups: pendingTopups || 0
      });
      setIsLoading(false);
    }
    
    fetchStats();
  }, [profile]);

  if (loading || profile?.role !== 'admin') return null;

  const adminLinks = [
    { title: 'Products', path: '/admin/products', icon: <ShoppingCart className="w-5 h-5" /> },
    { title: 'Categories', path: '/admin/categories', icon: <ShoppingCart className="w-5 h-5" /> },
    { title: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { title: 'Orders', path: '/admin/orders', icon: <DollarSign className="w-5 h-5" /> },
    { title: 'Topups', path: '/admin/topup', icon: <WalletCards className="w-5 h-5" />, badge: stats.pendingTopups },
    { title: 'Announcements', path: '/admin/announcements', icon: <WalletCards className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">ภาพรวมระบบและเมนูจัดการ</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
             <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">฿{stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.users}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.orders}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">Pending Topups</CardTitle>
              <WalletCards className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.pendingTopups}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">เมนูจัดการ</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {adminLinks.map((link) => (
            <Link key={link.path} href={link.path} className="block group">
              <Card className="h-full bg-card hover:bg-secondary border-border/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3 relative">
                  {link.badge && link.badge > 0 ? (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {link.badge}
                    </div>
                  ) : null}
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {link.icon}
                  </div>
                  <span className="font-semibold">{link.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
