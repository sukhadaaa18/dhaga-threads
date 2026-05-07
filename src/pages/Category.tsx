import { useParams } from "react-router-dom";
import { CollectionPage } from "@/components/CollectionPage";
import { CATEGORIES, CATEGORY_META, type Category as CatType, type Product } from "@/data/products";
import NotFound from "./NotFound";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const Category = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const cat = CATEGORIES.find((c) => c === slug) as CatType | undefined;
  
  useEffect(() => {
    if (cat) {
      loadProducts();
    }
  }, [slug]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products`);
      const filtered = data
        .filter((p: any) => p.category === slug)
        .map((p: any) => ({ ...p, id: p._id }));
      setProducts(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!cat) return <NotFound />;
  
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const meta = CATEGORY_META[cat];
  
  return (
    <CollectionPage
      eyebrow={meta.eyebrow}
      title={meta.label}
      subtitle={meta.subtitle}
      products={products}
      heroImage={meta.image}
    />
  );
};

export default Category;
