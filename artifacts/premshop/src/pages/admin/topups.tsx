import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function AdminTopup() {
  const { profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      setLocation('/');
    }
  }, [profile, loading, setLocation]);

  const { data: topups, isLoading } = useQuery({
    queryKey: ['admin_topups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*, profile:profiles(username, email)')
        .eq('type', 'topup')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'admin'
  });

  const processTopup = useMutation({
    mutationFn: async ({ id, status, userId, amount }: { id: string, status: 'approved' | 'rejected', userId: string, amount: number }) => {
      // Begin transaction-like approach
      // Update tx status
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .update({ status })
        .eq('id', id);
      if (txError) throw txError;

      // If approved, update user balance
      if (status === 'approved') {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .single();
        if (userError) throw userError;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ balance: (userData.balance || 0) + amount })
          .eq('id', userId);
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_topups'] });
      toast({ title: 'อัปเดตสถานะสำเร็จ' });
    },
    onError: (error: any) => {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    }
  });

  if (loading || profile?.role !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการการเติมเงิน</h1>
          <p className="text-muted-foreground mt-1">อนุมัติหรือปฏิเสธคำขอเติมเงิน</p>
        </div>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>รายการเติมเงินล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>ผู้ใช้</TableHead>
                <TableHead>จำนวนเงิน</TableHead>
                <TableHead>สลิป</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">กำลังโหลด...</TableCell></TableRow>
              ) : topups && topups.length > 0 ? (
                topups.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{format(new Date(t.created_at), 'dd/MM/yyyy HH:mm', { locale: th })}</TableCell>
                    <TableCell>
                      <div className="font-medium">{t.profile?.username}</div>
                      <div className="text-xs text-muted-foreground">{t.profile?.email}</div>
                    </TableCell>
                    <TableCell className="font-bold text-primary">฿{t.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {t.slip_url ? (
                        <a href={t.slip_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-medium">ดูสลิป</a>
                      ) : (
                        <span className="text-muted-foreground text-sm">ไม่มีสลิป</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {t.status === 'pending' ? <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">รอตรวจสอบ</Badge> :
                       t.status === 'approved' ? <Badge className="bg-green-500/20 text-green-500">อนุมัติแล้ว</Badge> :
                       <Badge variant="destructive" className="bg-destructive/20 text-destructive">ปฏิเสธ</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="destructive" onClick={() => processTopup.mutate({ id: t.id, status: 'rejected', userId: t.user_id, amount: t.amount })}>ปฏิเสธ</Button>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => processTopup.mutate({ id: t.id, status: 'approved', userId: t.user_id, amount: t.amount })}>อนุมัติ</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center py-8">ไม่มีรายการเติมเงิน</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
