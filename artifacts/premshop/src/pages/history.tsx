import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation, Link } from 'wouter';
import { useMyOrders } from '@/hooks/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function History() {
  const { user, profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = useMyOrders(user?.id);
  
  const [revealedData, setRevealedData] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !profile) {
      setLocation('/login');
    }
  }, [profile, loading, setLocation]);

  const toggleReveal = (orderId: string) => {
    setRevealedData(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  if (loading || !profile) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">ประวัติการสั่งซื้อ</h1>
        <p className="text-muted-foreground mt-1">รายการบัญชีทั้งหมดที่คุณสั่งซื้อจากระบบ</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="border-border/50 bg-card overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Product Info */}
                  <div className="p-4 md:p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-border/50 bg-secondary/20 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                          Order #{order.id.substring(0, 8)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), 'dd MMM yy HH:mm', { locale: th })}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg leading-tight mt-1">{order.product?.name || 'สินค้าที่ถูกลบ'}</h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-primary">฿{order.unit_price.toFixed(2)}</span>
                      {order.status === 'completed' ? (
                        <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20 border-none">สำเร็จ</Badge>
                      ) : (
                        <Badge variant="secondary">{order.status}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Account Data */}
                  <div className="p-4 md:p-6 md:w-2/3 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">ข้อมูลบัญชี / สินค้า:</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleReveal(order.id)}
                        className="h-8 px-2 text-xs"
                      >
                        {revealedData[order.id] ? (
                          <><EyeOff className="w-3 h-3 mr-1" /> ซ่อน</>
                        ) : (
                          <><Eye className="w-3 h-3 mr-1" /> แสดงข้อมูล</>
                        )}
                      </Button>
                    </div>

                    <div className="relative flex-1 rounded-lg border border-border/50 bg-background overflow-hidden min-h-[100px]">
                      {revealedData[order.id] ? (
                        <div className="p-4 w-full h-full overflow-auto">
                          <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                            {order.account_data || 'ไม่มีข้อมูล'}
                          </pre>
                        </div>
                      ) : (
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors backdrop-blur-md bg-background/80"
                          onClick={() => toggleReveal(order.id)}
                        >
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Eye className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">คลิกเพื่อดูข้อมูลบัญชี</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {order.product_id && (
                       <div className="mt-4 text-right">
                         <Link href={`/product/${order.product_id}`} className="text-xs text-primary hover:underline inline-flex items-center">
                            ดูรายละเอียดสินค้านี้ <ExternalLink className="w-3 h-3 ml-1" />
                         </Link>
                       </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-2xl border border-border/30">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">ยังไม่มีประวัติการสั่งซื้อ</h3>
          <p className="text-muted-foreground text-sm mt-1">เลือกซื้อสินค้าที่น่าสนใจได้ที่หน้ารวมสินค้า</p>
          <Button asChild className="mt-6">
            <Link href="/products">ไปที่หน้ารวมสินค้า</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
