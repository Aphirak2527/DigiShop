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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminAnnouncements() {
  const { profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'news', image_url: '' });

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      setLocation('/');
    }
  }, [profile, loading, setLocation]);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const addAnnouncement = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('announcements').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'เพิ่มประกาศสำเร็จ' });
      setIsAddOpen(false);
      setFormData({ title: '', content: '', type: 'news', image_url: '' });
    },
    onError: (error: any) => {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    }
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'ลบประกาศสำเร็จ' });
    }
  });

  if (loading || profile?.role !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการประกาศข่าวสาร</h1>
        </div>
        <Button onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4 mr-2" /> เพิ่มประกาศ</Button>
      </div>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>รายการประกาศ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ประเภท</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead>เนื้อหา</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">กำลังโหลด...</TableCell></TableRow>
              ) : announcements && announcements.length > 0 ? (
                announcements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><Badge variant="outline">{a.type}</Badge></TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{a.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{a.content}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => {
                        if (confirm('ลบประกาศนี้?')) deleteAnnouncement.mutate(a.id);
                      }}>ลบ</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center py-8">ไม่มีประกาศ</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>เพิ่มประกาศใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ประเภท</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">ข่าวสาร</SelectItem>
                  <SelectItem value="promotion">โปรโมชั่น</SelectItem>
                  <SelectItem value="update">อัปเดต</SelectItem>
                  <SelectItem value="maintenance">ปรับปรุงระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>หัวข้อ</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>เนื้อหา</Label>
              <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>URL รูปภาพ (ถ้ามี)</Label>
              <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button onClick={() => addAnnouncement.mutate(formData)}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
