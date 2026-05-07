import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { type Product, formatINR } from "@/data/products";
import { useShop } from "@/store/shop";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: Props) => {
  const addToCart = useShop((s) => s.addToCart);
  const toggleWish = useShop((s) => s.toggleWishlist);
  const wished = useShop((s) => s.wishlist.includes(product.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div className="gold-frame relative overflow-hidden bg-card">
        <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1024}
            className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
          />

          {product.tag && (
            <span className="absolute top-4 left-4 z-10 glass-card px-3 py-1 editorial-text text-primary border border-primary/30">
              {product.tag}
            </span>
          )}

          {product.isOutOfStock && (
            <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="glass-card px-6 py-2 editorial-text text-destructive border border-destructive/30 font-bold uppercase tracking-widest shadow-lg">
                Sold Out
              </span>
            </div>
          )}



          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-background/20 backdrop-blur-[2px]">
            <span className="glass-card px-5 py-2.5 editorial-text text-primary shadow-luxe transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              View Details
            </span>
          </div>
        </Link>
      </div>

      <div className="pt-4 px-1">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-serif text-lg text-foreground truncate mr-3">{product.name}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through opacity-60">
                {formatINR(product.originalPrice)}
              </span>
            )}
            <span className="font-serif text-base text-primary">
              {formatINR(product.price)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            {product.fabric}
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => toggleWish(product.id)}
              className={cn(
                "transition-all duration-300 transform hover:scale-110",
                wished ? "text-primary" : "text-foreground/30 hover:text-primary"
              )}
              title={wished ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart size={16} fill={wished ? "currentColor" : "none"} strokeWidth={1.2} />
            </button>
            <button
              onClick={() => addToCart(product)}
              className="text-foreground/30 hover:text-primary transition-all duration-300 transform hover:scale-110"
              title="Add to Cart"
            >
              <ShoppingBag size={16} strokeWidth={1.2} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
