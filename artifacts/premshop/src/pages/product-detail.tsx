import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useProduct } from '@/hooks/queries';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ShoppingCart, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: product, isLoading } = useProduct(id || '');
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; data?: string; error?: string } | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square md:aspect-auto md:h-[500px] w-full rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full mt-4" />
          <Skeleton className="h-12 w-full mt-8" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">ไม่พบสินค้า</h2>
        <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
          กลับไปหน้ารวมสินค้า
        </Link>
      </div>
    );
  }

  const isFlashSale = product.is_flash_sale && product.flash_sale_price && new Date(product.flash_sale_end_at || Date.now() + 100000) > new Date();
  const currentPrice = isFlashSale ? product.flash_sale_price! : product.price;

  // Real fallback URLs mapping
  const getFallbackImage = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('netflix')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/200px-Netflix_2015_logo.svg.png';
    if (lowerName.includes('disney')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/200px-Disney%2B_logo.svg.png';
    if (lowerName.includes('youtube')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/200px-YouTube_Logo_2017.svg.png';
    if (lowerName.includes('spotify')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/200px-Spotify_logo_without_text.svg.png';
    return null;
  };

  const imageUrl = product.image_url || getFallbackImage(product.name);

  const handleBuyClick = () => {
    if (!user || !profile) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า",
        variant: "destructive"
      });
      setLocation('/login');
      return;
    }

    if (profile.balance < currentPrice) {
      toast({
        title: "ยอดเงินไม่เพียงพอ",
        description: `คุณมียอดเงิน ${profile.balance.toFixed(2)} ฿ แต่สินค้ามีราคา ${currentPrice.toFixed(2)} ฿`,
        variant: "destructive"
      });
      return;
    }

    setIsConfirmOpen(true);
  };

  const executePurchase = async () => {
    if (!user || !profile || !product) return;
    
    setIsPurchasing(true);
    try {
      // Fetch available account
      const { data: accounts, error: accountError } = await supabase
        .from('product_accounts')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_sold', false)
        .limit(1);

      if (accountError || !accounts || accounts.length === 0) {
        throw new Error('สินค้าหมดกระทันหัน กรุณาลองใหม่ภายหลัง');
      }

      const account = accounts[0];

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          product_id: product.id,
          unit_price: currentPrice,
          total_price: currentPrice,
          status: 'completed',
          account_data: account.account_data
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Mark account as sold
      await supabase
        .from('product_accounts')
        .update({ is_sold: true, order_id: order.id })
        .eq('id', account.id);

      // Deduct balance
      await supabase
        .from('profiles')
        .update({ balance: profile.balance - currentPrice })
        .eq('id', user.id);

      // Update product stats
      await supabase
        .from('products')
        .update({ stock: product.stock - 1, sold_count: product.sold_count + 1 })
        .eq('id', product.id);

      // Record transaction
      await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: user.id,
          amount: -currentPrice,
          type: 'purchase',
          status: 'completed',
          reference: `Order #${order.id.substring(0, 8)}`
        }]);

      setPurchaseResult({ success: true, data: account.account_data });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate profile by fetching session
      supabase.auth.getSession();
      
      toast({
        title: "สั่งซื้อสำเร็จ!",
        description: "ระบบได้ทำการส่งมอบบัญชีให้คุณแล้ว",
      });

    } catch (error: any) {
      console.error("Purchase error:", error);
      setPurchaseResult({ success: false, error: error.message || "เกิดข้อผิดพลาดในการทำรายการ" });
    } finally {
      setIsPurchasing(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        กลับไปหน้ารวมสินค้า
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Side */}
        <div className="rounded-2xl overflow-hidden bg-secondary border border-border/50 aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center relative">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-2/3 h-2/3 object-contain drop-shadow-2xl" />
          ) : (
            <div className="text-8xl font-bold text-foreground/20">{product.name.charAt(0)}</div>
          )}
          {isFlashSale && (
            <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-lg py-1 px-4 shadow-lg animate-pulse">
              Flash Sale
            </Badge>
          )}
        </div>

        {/* Info Side */}
        <div className="flex flex-col">
          {product.category && (
            <Badge variant="outline" className="w-fit mb-4 text-primary border-primary/30 bg-primary/10">
              {product.category.name}
            </Badge>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-end gap-4 mb-6 pb-6 border-b border-border/50">
            <span className="text-5xl font-bold text-primary tracking-tight">฿{currentPrice.toFixed(2)}</span>
            {(isFlashSale || product.original_price) && (
              <span className="text-2xl text-muted-foreground line-through mb-1">
                ฿{(product.original_price || product.price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex gap-6 mb-8">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">สถานะสินค้า</span>
              <div className="flex items-center mt-1">
                <div className={`w-2.5 h-2.5 rounded-full mr-2 ${product.stock > 0 ? 'bg-green-500' : 'bg-destructive'}`}></div>
                <span className="font-medium">{product.stock > 0 ? `พร้อมส่ง (${product.stock})` : 'สินค้าหมด'}</span>
              </div>
            </div>
            <div className="w-[1px] bg-border/50"></div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">ขายแล้ว</span>
              <span className="font-medium mt-1">{product.sold_count} ชิ้น</span>
            </div>
          </div>

          <div className="mb-8 flex-1">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-muted-foreground" />
              รายละเอียดสินค้า
            </h3>
            <div className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed bg-secondary/30 p-4 rounded-xl border border-border/30">
              {product.description || "ไม่มีรายละเอียดสินค้าระบุไว้"}
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full text-lg h-14 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all font-bold"
            disabled={product.stock <= 0}
            onClick={handleBuyClick}
            data-testid="button-buy-now"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock > 0 ? 'ซื้อเลย' : 'สินค้าหมดชั่วคราว'}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl">ยืนยันการสั่งซื้อ</DialogTitle>
            <DialogDescription>
              โปรดตรวจสอบรายการสินค้าก่อนยืนยันการสั่งซื้อ
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-4 bg-secondary/50 rounded-lg border border-border/50 my-4">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="w-12 h-12 object-contain mr-4" />
            ) : (
              <div className="w-12 h-12 bg-background rounded flex items-center justify-center mr-4">{product.name.charAt(0)}</div>
            )}
            <div className="flex-1">
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-sm text-muted-foreground">จำนวน 1 รายการ</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-primary">฿{currentPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm py-2 px-1 border-t border-border/50">
            <span className="text-muted-foreground">ยอดเงินคงเหลือของคุณ:</span>
            <span className="font-medium">฿{profile?.balance?.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm py-2 px-1 text-primary">
            <span>ยอดเงินหลังหัก:</span>
            <span className="font-bold">฿{((profile?.balance || 0) - currentPrice).toFixed(2)}</span>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isPurchasing}>
              ยกเลิก
            </Button>
            <Button onClick={executePurchase} disabled={isPurchasing}>
              {isPurchasing ? 'กำลังดำเนินการ...' : 'ยืนยันการซื้อ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={purchaseResult !== null} onOpenChange={(open) => !open && setPurchaseResult(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {purchaseResult?.success ? (
                <><CheckCircle2 className="w-6 h-6 text-green-500" /> สั่งซื้อสำเร็จ</>
              ) : (
                <><AlertTriangle className="w-6 h-6 text-destructive" /> เกิดข้อผิดพลาด</>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="my-6">
            {purchaseResult?.success ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">รายละเอียดบัญชีของคุณ (ระบบได้บันทึกไว้ในประวัติการสั่งซื้อแล้ว):</p>
                <div className="p-4 bg-background border border-border rounded-lg relative group">
                  <pre className="text-sm whitespace-pre-wrap font-mono break-all text-primary/90">
                    {purchaseResult.data}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
                {purchaseResult?.error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setPurchaseResult(null)} className="w-full">
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
