import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useMyTickets, useSubmitTicket } from '@/hooks/queries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const ticketSchema = z.object({
  type: z.string().min(1, "กรุณาเลือกประเภทปัญหา"),
  subject: z.string().min(5, "หัวข้อต้องมีอย่างน้อย 5 ตัวอักษร"),
  message: z.string().min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function Tickets() {
  const { user, profile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: tickets, isLoading } = useMyTickets(user?.id);
  const submitTicket = useSubmitTicket();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      type: '',
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    if (!loading && !profile) {
      setLocation('/login');
    }
  }, [profile, loading, setLocation]);

  const onSubmit = async (data: TicketFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await submitTicket.mutateAsync({
        user_id: user.id,
        type: data.type,
        subject: data.subject,
        message: data.message,
        status: 'open'
      });
      toast({ title: "ส่งข้อความสำเร็จ", description: "แอดมินจะติดต่อกลับโดยเร็วที่สุด" });
      form.reset();
    } catch (error: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !profile) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none">รอตรวจสอบ</Badge>;
      case 'in_progress': return <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-none">กำลังดำเนินการ</Badge>;
      case 'closed': return <Badge className="bg-green-500/20 text-green-500 border-none">ปิดแล้ว</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">แจ้งปัญหา / เคลมสินค้า</h1>
        <p className="text-muted-foreground mt-1">ติดต่อทีมงานเพื่อขอความช่วยเหลือ หรือสอบถามข้อมูล</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <Card className="border-border/50 bg-card h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-primary" />
              เปิด Ticket ใหม่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ประเภทปัญหา</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="เลือกประเภท..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="claim">ขอเคลมสินค้า / บัญชีมีปัญหา</SelectItem>
                          <SelectItem value="payment">ปัญหาการชำระเงิน / เติมเงิน</SelectItem>
                          <SelectItem value="general">สอบถามข้อมูลทั่วไป</SelectItem>
                          <SelectItem value="other">อื่นๆ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หัวข้อ</FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น รหัสผ่านใช้งานไม่ได้ (Order #123)" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รายละเอียด</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="อธิบายปัญหาของคุณให้ละเอียด เพื่อความรวดเร็วในการแก้ไข" 
                          className="min-h-[120px] bg-background" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
                  {isSubmitting ? "กำลังส่ง..." : "ส่งข้อความ"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">ประวัติการแจ้งปัญหา</h2>
          
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {tickets.map(ticket => (
                <Card key={ticket.id} className="border-border/50 bg-card overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">#{ticket.id.substring(0, 6)}</Badge>
                        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          {ticket.type === 'claim' ? 'เคลมสินค้า' : ticket.type === 'payment' ? 'การชำระเงิน' : ticket.type === 'general' ? 'ทั่วไป' : 'อื่นๆ'}
                        </span>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ticket.message}</p>
                    
                    {ticket.admin_reply && (
                      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-1">
                          <MessageSquare className="w-3 h-3" /> แอดมินตอบกลับ:
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-line">{ticket.admin_reply}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm', { locale: th })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border/50 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">คุณยังไม่เคยแจ้งปัญหาใดๆ</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
