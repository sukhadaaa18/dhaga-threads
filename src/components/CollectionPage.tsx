import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { SectionHeading } from "./SectionHeading";
import { PageTransition } from "./PageTransition";

interface CollectionPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
  heroImage?: string;
}

export const CollectionPage = ({ eyebrow, title, subtitle, products, heroImage }: CollectionPageProps) => {
  return (
    <PageTransition>
      <section className="py-14 md:py-20 bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 motif-bg" />
        
        <div className="container relative">
          {heroImage && (
            <div className="mb-16 aspect-[21/9] w-full overflow-hidden gold-frame shadow-2xl">
              <img 
                src={heroImage} 
                alt={title} 
                className="w-full h-full object-cover animate-scale-in"
              />
            </div>
          )}

          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif italic text-2xl text-muted-foreground">
                No pieces found in this collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12 mt-14">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
};
