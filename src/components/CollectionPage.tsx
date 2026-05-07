import { useState, useMemo } from "react";
import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { PageTransition } from "./PageTransition";
import { SlidersHorizontal, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";

interface CollectionPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
  heroImage?: string;
}

export const CollectionPage = ({ eyebrow, title, subtitle, products, heroImage }: CollectionPageProps) => {
  const [fabricFilter, setFabricFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Fabric
    if (fabricFilter !== "all") {
      result = result.filter(p => 
        p.fabric.toLowerCase().includes(fabricFilter.toLowerCase())
      );
    }

    // Filter by Size (Note: This assumes products have a 'sizes' array or we check stock/outOfStock)
    // For now, we'll filter based on the product's outOfStockSizes if available
    if (sizeFilter !== "all") {
      result = result.filter(p => {
        if (!p.outOfStockSizes) return true; // If no out of stock info, assume available
        return !p.outOfStockSizes.includes(sizeFilter.toUpperCase());
      });
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      // Default order as provided
    }

    return result;
  }, [products, fabricFilter, sizeFilter, sortBy]);

  const clearFilters = () => {
    setFabricFilter("all");
    setSizeFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters = fabricFilter !== "all" || sizeFilter !== "all";

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative pt-24 pb-12 overflow-hidden bg-background">
          <div className="absolute inset-0 motif-bg opacity-10" />
          
          <div className="container relative z-10">
            <div className={heroImage ? "grid lg:grid-cols-2 gap-12 items-center" : "text-center max-w-4xl mx-auto"}>
              <div className={heroImage ? "flex flex-col items-start space-y-4 text-left" : "flex flex-col items-center space-y-4 text-center"}>
                {eyebrow && (
                  <p className="text-[11px] uppercase tracking-[0.4em] text-primary font-bold animate-fade-in">
                    {eyebrow}
                  </p>
                )}
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] animate-slide-up">
                  {title}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed animate-slide-up delay-100">
                  {subtitle}
                </p>
                <div className="flex items-center gap-4 pt-2 animate-fade-in delay-200">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
                    {filteredProducts.length} PIECES
                  </span>
                </div>
              </div>

              {heroImage && (
                <div className="relative group animate-scale-in">
                  <div className="gold-frame aspect-[4/3] md:aspect-[3/2] overflow-hidden shadow-2xl">
                    <img 
                      src={heroImage} 
                      alt={title} 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute -inset-4 border border-primary/10 -z-10 animate-pulse-slow" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-y border-border/60 shadow-sm">
          <div className="container py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <Select value={fabricFilter} onValueChange={setFabricFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-[10px] uppercase tracking-widest bg-transparent border-border/60 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="FABRIC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL FABRICS</SelectItem>
                    <SelectItem value="silk">SILK</SelectItem>
                    <SelectItem value="cotton">COTTON</SelectItem>
                    <SelectItem value="organza">ORGANZA</SelectItem>
                    <SelectItem value="chanderi">CHANDERI</SelectItem>
                    <SelectItem value="georgette">GEORGETTE</SelectItem>
                    <SelectItem value="linen">LINEN</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-[10px] uppercase tracking-widest bg-transparent border-border/60 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="SIZE" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ALL SIZES</SelectItem>
                    <SelectItem value="xs">XS</SelectItem>
                    <SelectItem value="s">S</SelectItem>
                    <SelectItem value="m">M</SelectItem>
                    <SelectItem value="l">L</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                    <SelectItem value="xxl">XXL</SelectItem>
                    <SelectItem value="3xl">3XL</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-primary font-bold hover:text-foreground transition-colors ml-2"
                  >
                    <X size={12} /> CLEAR
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
                  <SlidersHorizontal size={14} className="text-primary" />
                  SORT BY
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-9 text-[10px] uppercase tracking-widest bg-transparent border-border/60 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="SORT BY" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">NEWEST ARRIVALS</SelectItem>
                    <SelectItem value="price-low">PRICE: LOW TO HIGH</SelectItem>
                    <SelectItem value="price-high">PRICE: HIGH TO LOW</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <section className="py-12 relative min-h-[60vh] overflow-hidden bg-background">
          <div className="absolute inset-0 motif-bg opacity-[0.03]" />
          
          <div className="container relative z-10">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="gold-divider mx-auto mb-8" />
                <p className="font-serif italic text-3xl text-muted-foreground/60">
                  {hasActiveFilters ? "No pieces match your selection." : "The collection is currently resting."}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary">
                  {hasActiveFilters ? "Try adjusting your filters" : "Check back soon for new arrivals"}
                </p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="mt-8 px-8 py-3 border border-primary/20 text-[10px] uppercase tracking-widest hover:bg-primary hover:text-background transition-all"
                  >
                    View All Pieces
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16 animate-stagger-fade-in">
                {filteredProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

