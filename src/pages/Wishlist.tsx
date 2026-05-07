import { useShop } from "@/store/shop";
import { type Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const Wishlist = () => {
  const ids = useShop((s) => s.wishlist);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/products");
        const mapped = data.map((p: Product & { _id: string }) => ({ ...p, id: p._id }));

        const filtered = mapped.filter((p: Product) => ids.includes(p.id));
        setItems(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ids]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden min-h-[70vh]">
      <div className="absolute inset-0 motif-bg" />
      <div className="container relative">
        <SectionHeading eyebrow="Saved For Later" title="Your Wishlist" />
        {items.length === 0 ? (
          <div className="text-center mt-16">
            <p className="font-serif italic text-2xl text-muted-foreground mb-8">
              Your wishlist is gently waiting.
            </p>
            <Link
              to="/"
              className="inline-block bg-foreground text-background px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors"
            >
              Discover Pieces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12 mt-14">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;
