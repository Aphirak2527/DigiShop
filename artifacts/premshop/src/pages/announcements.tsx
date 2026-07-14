import { useAnnouncements } from '@/hooks/queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Megaphone, Bell, Wrench, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function Announcements() {
  const { data: announcements, isLoading } = useAnnouncements();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return <Bell className="w-4 h-4" />;
      case 'promotion': return <Zap className="w-4 h-4 text-primary" />;
      case 'update': return <Megaphone className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'news': return 'ข่าวสาร';
      case 'promotion': return 'โปรโมชั่น';
      case 'update': return 'อัปเดต';
      case 'maintenance': return 'ปรับปรุงระบบ';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold">ประกาศจากระบบ</h1>
          <p className="text-muted-foreground mt-1">ติดตามข่าวสาร อัปเดต และโปรโมชั่นล่าสุด</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : announcements?.length ? (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="border-border/50 bg-card hover:bg-card/80 transition-colors overflow-hidden">
              {announcement.image_url && (
                <div className="w-full h-48 bg-secondary overflow-hidden">
                  <img src={announcement.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="flex items-center gap-1.5 bg-background">
                    {getTypeIcon(announcement.type)}
                    {getTypeLabel(announcement.type)}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <CalendarDays className="w-3 h-3 mr-1" />
                    {format(new Date(announcement.created_at), 'd MMMM yyyy HH:mm', { locale: th })}
                  </div>
                </div>
                <CardTitle className="text-xl md:text-2xl text-primary leading-tight">
                  {announcement.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {announcement.content}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-2xl border border-border/30">
            <Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">ยังไม่มีประกาศใดๆ</h3>
            <p className="text-muted-foreground text-sm">ประกาศใหม่ๆ จะแสดงที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
}
