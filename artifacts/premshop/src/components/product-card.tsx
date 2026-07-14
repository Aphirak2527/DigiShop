import { Link } from 'wouter';
import { Product } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const isFlashSale =
    product.is_flash_sale &&
    product.flash_sale_price &&
    new Date(product.flash_sale_end_at || Date.now() + 100000) > new Date();

  const currentPrice = isFlashSale ? product.flash_sale_price! : product.price;
  const originalPrice = product.original_price ?? product.price;
  const discountPct = originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Stock level for progress bar (cap at 100)
  const maxStock = Math.max(product.stock + product.sold_count, 1);
  const stockPct = Math.min((product.stock / maxStock) * 100, 100);

  const getFallbackImage = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('netflix')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/200px-Netflix_2015_logo.svg.png';
    if (n.includes('disney')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/200px-Disney%2B_logo.svg.png';
    if (n.includes('youtube')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/200px-YouTube_Logo_2017.svg.png';
    if (n.includes('spotify')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/200px-Spotify_logo_without_text.svg.png';
    if (n.includes('hbo')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/HBO_logo.svg/200px-HBO_logo.svg.png';
    if (n.includes('prime') || n.includes('amazon')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/200px-Amazon_Prime_Video_logo.svg.png';
    if (n.includes('viu')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Viu-logo.svg/200px-Viu-logo.svg.png';
    return null;
  };

  const imageUrl = product.image_url || getFallbackImage(product.name);
  const isSoldOut = product.stock <= 0;

  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className={cn(
        "bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
        compact && "rounded-xl"
      )}>
        {/* Image */}
        <div className="relative aspect-square w-full bg-secondary/60 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
              <span className="text-4xl font-bold text-primary/30">{product.name.charAt(0)}</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isFlashSale && discountPct > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border/50">
                หมดแล้ว
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-3 pt-2 pb-1">
          <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </p>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-bold text-primary leading-none">
              ฿{currentPrice.toFixed(0)}
            </span>
            {discountPct > 0 && (
              <span className="text-[11px] text-muted-foreground line-through leading-none">
                ฿{originalPrice.toFixed(0)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
            <span>ขายแล้ว {product.sold_count.toLocaleString()} ชิ้น</span>
            <span className={isSoldOut ? 'text-red-500 font-semibold' : ''}>
              เหลือ {product.stock}
            </span>
          </div>
        </div>

        {/* Stock progress bar */}
        <div className="h-1 bg-muted mx-3 mb-2.5 rounded-full overflow-hidden mt-1">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              stockPct > 50 ? "bg-green-400" : stockPct > 20 ? "bg-amber-400" : "bg-red-400"
            )}
            style={{ width: `${stockPct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
