import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export default function AdminCategories() {
  const { profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', icon_url: '', sort_order: '0' });

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      setLocation('/');
    }
  }, [profile, loading, setLocation]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const addCategory = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('categories').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'เพิ่มหมวดหมู่สำเร็จ' });
      setIsAddOpen(false);
      setFormData({ name: '', slug: '', icon_url: '', sort_order: '0' });
    },
    onError: (error: any) => {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'ลบหมวดหมู่สำเร็จ' });
    }
  });

  if (loading || profile?.role !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการหมวดหมู่</h1>
          <p className="text-muted-foreground mt-1">เพิ่มลบแก้ไขหมวดหมู่สินค้า</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> เพิ่มหมวดหมู่</Button>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>รายการหมวดหมู่</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ลำดับ</TableHead>
                <TableHead>ไอคอน</TableHead>
                <TableHead>ชื่อหมวดหมู่</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">กำลังโหลด...</TableCell></TableRow>
              ) : categories && categories.length > 0 ? (
                categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.sort_order}</TableCell>
                    <TableCell>
                      {c.icon_url ? <img src={c.icon_url} alt={c.name} className="w-8 h-8 object-contain" /> : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.slug}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => {
                        if (confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?')) deleteCategory.mutate(c.id);
                      }}>ลบ</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center py-8">ไม่มีหมวดหมู่</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อหมวดหมู่</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>URL รูปภาพไอคอน (ถ้ามี)</Label>
              <Input value={formData.icon_url} onChange={e => setFormData({...formData, icon_url: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>ลำดับ</Label>
              <Input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button onClick={() => addCategory.mutate({...formData, sort_order: parseInt(formData.sort_order)})}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
