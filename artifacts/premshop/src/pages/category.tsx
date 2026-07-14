import { useParams } from 'wouter';
import { useProducts, useCategories } from '@/hooks/queries';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  
  const category = categories?.find(c => c.slug === slug);
  const categoryProducts = products?.filter(p => p.category_id === category?.id && p.is_active) || [];

  if (!isLoadingCategories && !category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">ไม่พบหมวดหมู่</h2>
        <p className="text-muted-foreground mb-6">หมวดหมู่ที่คุณค้นหาไม่มีอยู่ในระบบ</p>
        <Link href="/products" className="text-primary hover:underline">
          ดูสินค้าทั้งหมด
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        กลับไปหน้ารวมสินค้า
      </Link>
      
      <div className="flex items-center gap-4">
        {isLoadingCategories ? (
          <Skeleton className="h-10 w-48" />
        ) : (
          <>
            {category?.icon_url ? (
               <img src={category.icon_url} alt={category.name} className="w-10 h-10 object-contain" />
            ) : (
               <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                 {category?.name.charAt(0)}
               </div>
            )}
            <h1 className="text-3xl font-bold">หมวดหมู่: {category?.name}</h1>
          </>
        )}
      </div>

      <div className="w-full h-[1px] bg-border/50"></div>

      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          ))}
        </div>
      ) : categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-2xl border border-border/30">
          <h3 className="text-lg font-semibold">ไม่มีสินค้าในหมวดหมู่นี้</h3>
        </div>
      )}
    </div>
  );
}
