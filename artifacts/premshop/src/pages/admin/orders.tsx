import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function AdminOrders() {
  const { profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      setLocation('/');
    }
  }, [profile, loading, setLocation]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profile:profiles(username, email), product:products(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'admin'
  });

  if (loading || profile?.role !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการคำสั่งซื้อ</h1>
          <p className="text-muted-foreground mt-1">ประวัติการซื้อสินค้าทั้งหมด</p>
        </div>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>รายการคำสั่งซื้อล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>ผู้ใช้</TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead>ยอดรวม</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">กำลังโหลด...</TableCell></TableRow>
              ) : orders && orders.length > 0 ? (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.substring(0, 8)}</TableCell>
                    <TableCell>{format(new Date(o.created_at), 'dd/MM/yyyy HH:mm', { locale: th })}</TableCell>
                    <TableCell>
                      <div className="font-medium">{o.profile?.username}</div>
                      <div className="text-xs text-muted-foreground">{o.profile?.email}</div>
                    </TableCell>
                    <TableCell>{o.product?.name || 'ลบแล้ว'}</TableCell>
                    <TableCell className="font-bold text-primary">฿{o.total_price.toFixed(2)}</TableCell>
                    <TableCell>
                      {o.status === 'completed' ? <Badge className="bg-green-500/20 text-green-500 border-none">สำเร็จ</Badge> :
                       <Badge variant="secondary">{o.status}</Badge>}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center py-8">ไม่มีคำสั่งซื้อ</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
