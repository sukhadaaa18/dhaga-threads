import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import type { Product, Category } from "@/data/products";
import { useState, useMemo } from "react";
import { SlidersHorizontal, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, Link } from "react-router-dom";
import { CATEGORY_META } from "@/data/products";

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
  heroImage?: string;
}

export const CollectionPage = ({ eyebrow, title, subtitle, products, heroImage }: Props) => {
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [filterFabric, setFilterFabric] = useState<string | null>(null);
  const [filterSize, setFilterSize] = useState<string | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFabricOpen, setIsFabricOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const fabrics = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.fabric))).filter(Boolean);
  }, [products]);

  const sizes = ["S", "M", "L", "XL", "XXL"];

  const sortedProducts = useMemo(() => {
    let filtered = products;
    if (filterFabric) filtered = filtered.filter(p => p.fabric === filterFabric);
    if (filterSize) {
      filtered = filtered.filter(p => 
        !p.outOfStockSizes || 
        !p.outOfStockSizes.includes(filterSize)
      );
    }
    
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        CATEGORY_META[p.category as Category]?.label.toLowerCase().includes(q)
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [products, sortBy, filterFabric, filterSize, query]);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-blush">
        <div className="absolute inset-0 motif-bg" />
        {heroImage ? (
          <div className="container relative grid md:grid-cols-2 gap-10 items-center py-12 md:py-16">
            <div className="order-2 md:order-1">
              <SectionHeading align="left" eyebrow={eyebrow} title={title} subtitle={subtitle} />
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-6">
                {products.length} {products.length === 1 ? "piece" : "pieces"}
              </p>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="absolute -inset-3 border border-primary/30 hidden md:block" />
              <img
                src={heroImage}
                alt={title}
                width={800}
                height={1000}
                className="relative w-full h-[50vh] md:h-[60vh] object-cover shadow-luxe"
              />
            </div>
          </div>
        ) : (
          <div className="container relative py-14 md:py-20">
            {query ? (
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-4 animate-pulse">Search Results</p>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                  Showing results for <span className="italic">"{query}"</span>
                </h1>
                <Link to="/new-arrivals" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border-b border-muted-foreground/30 pb-1">
                  <X size={12} /> Clear Search
                </Link>
              </div>
            ) : (
              <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
            )}
          </div>
        )}
      </section>

      <section className="py-10 md:py-14 bg-background relative overflow-hidden">
        <div className="absolute inset-0 motif-bg" />
        <div className="container relative">
          {/* CONTROL BAR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-6 border-b border-primary/10">
            <div className="flex flex-wrap gap-4">
              {/* FABRIC FILTER DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsFabricOpen(!isFabricOpen);
                    setIsSizeOpen(false);
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold px-6 py-2.5 border transition-all bg-card",
                    filterFabric ? "border-primary text-primary" : "border-primary/20 text-foreground hover:border-primary/40"
                  )}
                >
                  Fabric{filterFabric ? `: ${filterFabric}` : ''}
                  <ChevronDown size={14} className={cn("transition-transform", isFabricOpen && "rotate-180")} />
                </button>

                {isFabricOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsFabricOpen(false)} />
                    <div className="absolute left-0 top-full mt-2 w-56 bg-card border border-primary/10 shadow-luxe z-50 py-2">
                      <button
                        onClick={() => {
                          setFilterFabric(null);
                          setIsFabricOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] uppercase tracking-wider text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors text-left"
                      >
                        All Fabrics
                        {!filterFabric && <Check size={12} className="text-primary" />}
                      </button>
                      {fabrics.map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setFilterFabric(f);
                            setIsFabricOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] uppercase tracking-wider text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors text-left"
                        >
                          {f}
                          {filterFabric === f && <Check size={12} className="text-primary" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* SIZE FILTER DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsSizeOpen(!isSizeOpen);
                    setIsFabricOpen(false);
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold px-6 py-2.5 border transition-all bg-card",
                    filterSize ? "border-primary text-primary" : "border-primary/20 text-foreground hover:border-primary/40"
                  )}
                >
                  Size{filterSize ? `: ${filterSize}` : ''}
                  <ChevronDown size={14} className={cn("transition-transform", isSizeOpen && "rotate-180")} />
                </button>

                {isSizeOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSizeOpen(false)} />
                    <div className="absolute left-0 top-full mt-2 w-48 bg-card border border-primary/10 shadow-luxe z-50 py-2">
                      <button
                        onClick={() => {
                          setFilterSize(null);
                          setIsSizeOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] uppercase tracking-wider text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors text-left"
                      >
                        All Sizes
                        {!filterSize && <Check size={12} className="text-primary" />}
                      </button>
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setFilterSize(s);
                            setIsSizeOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] uppercase tracking-wider text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors text-left"
                        >
                          {s}
                          {filterSize === s && <Check size={12} className="text-primary" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SORT DROPDOWN (Right Side) */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFabricOpen(false);
                  setIsSizeOpen(false);
                }}
                className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold text-foreground border border-primary/20 px-6 py-2.5 hover:border-primary transition-all bg-card"
              >
                <SlidersHorizontal size={14} className="text-primary" />
                Sort By
                <ChevronDown size={14} className={cn("transition-transform", isSortOpen && "rotate-180")} />
              </button>

              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-primary/10 shadow-luxe z-50 py-2">
                    {[
                      { id: 'newest', label: 'Newest Arrivals' },
                      { id: 'price-asc', label: 'Price: Low to High' },
                      { id: 'price-desc', label: 'Price: High to Low' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id as "newest" | "price-asc" | "price-desc");
                          setIsSortOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] uppercase tracking-wider text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors text-left"
                      >
                        {opt.label}
                        {sortBy === opt.id && <Check size={12} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 font-serif text-2xl italic">
              New pieces coming soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 lg:gap-10">
              {sortedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
