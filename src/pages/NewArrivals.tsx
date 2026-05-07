import { useSearchParams } from "react-router-dom";
import { CollectionPage } from "@/components/CollectionPage";
import { type Product } from "@/data/products";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const NewArrivals = () => {
  const [params] = useSearchParams();
  const q = params.get("q")?.toLowerCase() ?? "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [q]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      const mapped = data.map((p: any) => ({ ...p, id: p._id }));
      
      const filtered = q
        ? mapped.filter(
            (p: Product) =>
              p.name.toLowerCase().includes(q) ||
              p.fabric.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          )
        : mapped.filter((p: Product) => p.tag === "New" || p.isNewProduct);
        
      setProducts(filtered);
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
      eyebrow={q ? "Search results" : "Just Arrived"}
      title={q ? `Results for "${q}"` : "New Arrivals"}
      subtitle={
        q
          ? "Pieces matching your search."
          : "The freshest additions to the DHAGA atelier — woven this season."
      }
      products={products}
    />
  );
};

export default NewArrivals;
