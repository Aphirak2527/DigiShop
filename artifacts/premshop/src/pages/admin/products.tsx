import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogScrollArea } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminProducts() {
  const { profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [accountDataInput, setAccountDataInput] = useState('');

  const [formData, setFormData] = useState({
    name: '', category_id: '', description: '', price: 0, original_price: 0,
    image_url: '', stock: 0, is_flash_sale: false, flash_sale_price: 0,
    is_active: true
  });

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      setLocation('/');
    }
  }, [profile, loading, setLocation]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    }
  });

  const addProduct = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('products').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'เพิ่มสินค้าสำเร็จ' });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    }
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase.from('products').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const addAccounts = useMutation({
    mutationFn: async ({ productId, accounts }: { productId: string, accounts: string[] }) => {
      const payload = accounts.filter(a => a.trim()).map(acc => ({
        product_id: productId,
        account_data: acc.trim(),
        is_sold: false
      }));
      if (payload.length === 0) return;
      
      const { error } = await supabase.from('product_accounts').insert(payload);
      if (error) throw error;

      // Update stock
      const product = products?.find((p: any) => p.id === productId);
      await supabase.from('products').update({ stock: (product?.stock || 0) + payload.length }).eq('id', productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'เพิ่มบัญชีสินค้าสำเร็จ' });
      setIsAccountsOpen(false);
      setAccountDataInput('');
    },
    onError: (error: any) => {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '', category_id: categories?.[0]?.id || '', description: '', price: 0, original_price: 0,
      image_url: '', stock: 0, is_flash_sale: false, flash_sale_price: 0, is_active: true
    });
  };

  if (loading || profile?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการสินค้า</h1>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}><Plus className="w-4 h-4 mr-2" /> เพิ่มสินค้า</Button>
      </div>

      <Card className="border-border/50 bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รูป</TableHead>
                <TableHead>ชื่อสินค้า</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>ราคา</TableHead>
                <TableHead>สต็อก</TableHead>
                <TableHead>ขายแล้ว</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">กำลังโหลด...</TableCell></TableRow>
              ) : products && products.length > 0 ? (
                products.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">{p.name.charAt(0)}</div>}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}
                      {p.is_flash_sale && <Badge variant="destructive" className="ml-2 text-[10px]">Flash Sale</Badge>}
                    </TableCell>
                    <TableCell>{p.category?.name}</TableCell>
                    <TableCell className="text-primary font-bold">฿{p.price.toFixed(2)}</TableCell>
                    <TableCell>{p.stock > 0 ? <Badge className="bg-green-500/20 text-green-500">{p.stock}</Badge> : <Badge variant="destructive">หมด</Badge>}</TableCell>
                    <TableCell>{p.sold_count}</TableCell>
                    <TableCell>
                      <Switch checked={p.is_active} onCheckedChange={(val) => toggleActive.mutate({ id: p.id, is_active: val })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" title="เพิ่มสต็อก (บัญชี)" onClick={() => { setSelectedProduct(p); setIsAccountsOpen(true); }}>
                          <KeyRound className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={8} className="text-center py-8">ไม่มีสินค้า</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>ชื่อสินค้า</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>หมวดหมู่</Label>
              <Select value={formData.category_id} onValueChange={(val) => setFormData({...formData, category_id: val})}>
                <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL รูปภาพ (ถ้ามี)</Label>
              <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>รายละเอียด</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>ราคาขาย (บาท)</Label>
              <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>ราคาเต็ม (บาท) - ใส่ 0 ถ้าไม่มี</Label>
              <Input type="number" value={formData.original_price} onChange={e => setFormData({...formData, original_price: parseFloat(e.target.value)})} />
            </div>
            
            <div className="col-span-2 p-4 border border-border/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label>เปิดใช้งาน Flash Sale</Label>
                <Switch checked={formData.is_flash_sale} onCheckedChange={(val) => setFormData({...formData, is_flash_sale: val})} />
              </div>
              {formData.is_flash_sale && (
                <div className="space-y-2">
                  <Label>ราคา Flash Sale</Label>
                  <Input type="number" value={formData.flash_sale_price} onChange={e => setFormData({...formData, flash_sale_price: parseFloat(e.target.value)})} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button onClick={() => addProduct.mutate({...formData, category_id: formData.category_id || categories?.[0]?.id})}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Accounts Modal */}
      <Dialog open={isAccountsOpen} onOpenChange={setIsAccountsOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>เพิ่มสต็อกบัญชี: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ข้อมูลบัญชี (1 บรรทัดต่อ 1 บัญชี)</Label>
              <p className="text-xs text-muted-foreground">เช่น email:password หรือ URL รับสินค้า</p>
              <Textarea 
                value={accountDataInput} 
                onChange={e => setAccountDataInput(e.target.value)} 
                rows={10} 
                className="font-mono text-sm"
                placeholder="user1@email.com:pass123&#10;user2@email.com:pass456"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccountsOpen(false)}>ยกเลิก</Button>
            <Button onClick={() => addAccounts.mutate({ productId: selectedProduct.id, accounts: accountDataInput.split('\n') })}>
              เพิ่ม {accountDataInput.split('\n').filter(a => a.trim()).length} บัญชี
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
