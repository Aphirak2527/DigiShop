import { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/queries';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Products() {
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeProducts = products?.filter((p) => p.is_active) || [];
  
  const filteredProducts = activeProducts.filter((product) => {
    const matchesCategory = activeCategory ? product.category_id === activeCategory : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">สินค้าทั้งหมด</h1>
          <p className="text-muted-foreground mt-1">เลือกซื้อบัญชีพรีเมียมที่คุณต้องการ</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="ค้นหาสินค้า..." 
            className="pl-9 bg-card border-border/50 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            activeCategory === null 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
          )}
        >
          ทั้งหมด
        </button>
        
        {isLoadingCategories ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))
        ) : (
          categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === cat.id 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
              )}
            >
              {cat.name}
            </button>
          ))
        )}
      </div>

      {/* Product Grid */}
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-2xl border border-border/30">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">ไม่พบสินค้า</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">
            ไม่มีสินค้าที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองเปลี่ยนคำค้นหาหรือหมวดหมู่
          </p>
          <button 
            onClick={() => { setActiveCategory(null); setSearchQuery(''); }}
            className="mt-4 text-primary hover:underline text-sm font-medium"
          >
            ล้างการค้นหา
          </button>
        </div>
      )}
    </div>
  );
}
