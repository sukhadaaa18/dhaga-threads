import { CollectionPage } from "@/components/CollectionPage";
import { type Product } from "@/data/products";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const Sale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      const saleItems = data
        .filter((p: Product) => p.originalPrice && (p.originalPrice > p.price))
        .map((p: Product & { _id: string }) => ({ ...p, id: p._id }));
      setProducts(saleItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <CollectionPage
      eyebrow="Atelier Sale"
      title="Quietly Discounted"
      subtitle="A small, considered selection — the same craftsmanship, gently priced."
      products={products}
    />
  );
};

export default Sale;
