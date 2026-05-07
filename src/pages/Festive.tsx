import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, Sparkles } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

const Festive = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products-festive"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data.filter((p: any) => p.isFestive);
    },
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 motif-bg opacity-30" />
      
      <section className="relative py-20 md:py-28 border-b border-border/60">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <Sparkles size={18} />
              <p className="text-[11px] uppercase tracking-[0.4em] font-bold">The Festive Edit</p>
              <Sparkles size={18} />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl mb-6">Celebration Styles</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
              Hand-picked pieces curated specifically for celebrations. From heritage lehengas to 
              embellished kurtis, discover the essence of {BRAND_CONFIG.name} elegance.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 relative">
        <div className="container">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Curating your collection...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {products.map((product: any, index: number) => (
                <ProductCard key={product._id} product={{...product, id: product._id}} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border border-dashed border-border gold-frame-thin">
              <p className="font-serif text-2xl mb-2 text-muted-foreground">Your Festive Edit is evolving.</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Check back shortly for new curated pieces.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Festive;
