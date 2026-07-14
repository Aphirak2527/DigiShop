import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useSubmitTopup, useWalletTransactions } from '@/hooks/queries';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, UploadCloud, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function Topup() {
  const { user, profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitTopup = useSubmitTopup();
  const { data: transactions } = useWalletTransactions(user?.id);

  const [amount, setAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      setLocation('/login');
    }
  }, [profile, loading, setLocation]);

  const topupHistory = transactions?.filter(t => t.type === 'topup') || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "ระบุจำนวนเงินไม่ถูกต้อง", variant: "destructive" });
      return;
    }
    if (!file) {
      toast({ title: "กรุณาแนบสลิปโอนเงิน", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload to supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('slips')
        .upload(fileName, file);

      if (uploadError) {
        // Create bucket if it doesn't exist and retry (for development only)
        if (uploadError.message.includes('Bucket not found')) {
           toast({ title: "ระบบยังไม่ได้สร้าง Storage Bucket 'slips'", description: "กรุณาสร้าง bucket ใน Supabase", variant: "destructive" });
           throw new Error("Storage bucket 'slips' not found. Admin needs to create it.");
        }
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('slips')
        .getPublicUrl(fileName);

      // 2. Insert transaction
      await submitTopup.mutateAsync({
        user_id: user.id,
        amount: numAmount,
        type: 'topup',
        status: 'pending',
        slip_url: publicUrlData.publicUrl
      });

      toast({
        title: "ส่งคำขอเติมเงินสำเร็จ",
        description: "กรุณารอแอดมินตรวจสอบยอดเงินสักครู่",
      });

      setAmount('');
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('slip-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งคำขอเติมเงินได้",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !profile) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">เติมเงิน</h1>
        <p className="text-muted-foreground mt-1">ยอดเงินคงเหลือ: <span className="text-primary font-bold">฿{profile.balance.toFixed(2)}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Topup Form */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              ช่องทาง PromptPay
            </CardTitle>
            <CardDescription>สแกน QR Code ด้านล่างเพื่อโอนเงิน และแนบสลิปยืนยัน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6 bg-white p-4 rounded-xl border-4 border-primary/20 w-48 mx-auto">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="PromptPay QR" className="w-full h-full opacity-50" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">จำนวนเงินที่โอน (บาท)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  min="1"
                  placeholder="เช่น 100" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-background"
                  required
                  data-testid="input-topup-amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slip-upload">หลักฐานการโอนเงิน (สลิป)</Label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-6 flex flex-col items-center justify-center bg-background/50 relative hover:bg-secondary/50 transition-colors">
                  <Input 
                    id="slip-upload" 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    required
                    data-testid="input-topup-slip"
                  />
                  <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">
                    {file ? file.name : 'คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากมาวาง'}
                  </span>
                </div>
              </div>
              
              <Button type="submit" className="w-full font-bold" disabled={isUploading} data-testid="button-submit-topup">
                {isUploading ? "กำลังอัปโหลด..." : "แจ้งโอนเงิน"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>ประวัติการเติมเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {topupHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">ไม่มีประวัติการเติมเงิน</div>
              ) : (
                topupHistory.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex flex-col">
                      <span className="font-medium">฿{tx.amount.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: th })}
                      </span>
                    </div>
                    <div>
                      {tx.status === 'completed' || tx.status === 'approved' ? (
                        <Badge className="bg-green-500/20 text-green-500 border-none flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> อนุมัติแล้ว
                        </Badge>
                      ) : tx.status === 'pending' ? (
                        <Badge variant="secondary" className="text-yellow-500 bg-yellow-500/10 border-none flex items-center gap-1">
                          <Clock className="w-3 h-3" /> รอตรวจสอบ
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-destructive/20 text-destructive border-none flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> ปฏิเสธ
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
