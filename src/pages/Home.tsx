import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-model.png";
import { type Product, CATEGORIES, CATEGORY_META } from "@/data/products";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { DhagaReels } from "@/components/DhagaReels";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    instagramFollowers: "3.5K",
    instagramPosts: "100",
    instagramSaved: "300"
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [resP, resS] = await Promise.all([
          api.get("/products"),
          api.get("/site-settings")
        ]);
        setProducts(resP.data.map((p: Product & { _id: string }) => ({ ...p, id: p._id })));
        if (resS.data) setStats(resS.data);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const featured = products.slice(0, 5);
  const festiveItems = products.filter(p => p.isFestive).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewProduct).slice(0, 4);
  const bestSellers = products.filter(p => p.tag === "Bestseller").slice(0, 4);

  if (loading) return null; // Or a nice skeleton

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-blush border-b border-primary/5">
        <div className="absolute inset-0 motif-bg opacity-10" />

        <div className="container relative grid md:grid-cols-2 items-center min-h-[78vh] gap-10 py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 order-2 md:order-1"
          >

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-foreground mb-5 text-balance">
              Elegance Woven<br />
              <span className="italic text-primary">in Every Thread</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-8">
              Timeless Indian silhouettes, handcrafted with care and intention —
              pieces you don’t just wear for a moment, but return to, again and again.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/new-arrivals"
                className="group shimmer bg-foreground text-background px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors"
              >
                Shop Now
              </Link>
              <Link
                to="/new-arrivals"
                className="text-xs uppercase tracking-[0.25em] text-foreground border-b border-primary/50 px-2 pb-1 hover:text-primary hover:border-primary transition-colors self-end mb-2"
              >
                Explore New Arrivals →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 md:order-2"
          >
            <div className="absolute -inset-4 border border-primary/20 hidden md:block" />
            <div className="relative aspect-[4/5] overflow-hidden shadow-luxe bg-muted">
              <img
                src={heroImg}
                alt="Model in handcrafted Indian wear"
                width={1200}
                height={1500}
                className="w-full h-full object-cover object-[center_25%] transition-transform duration-[2000ms] hover:scale-105"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORY TILES — all 6 */}
      <section className="py-14 md:py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 motif-bg opacity-40" />

        <div className="container relative">
          <SectionHeading
            eyebrow="Shop By Silhouette"
            title="Featured Collections"
            subtitle="From everyday kurtis to heirloom lehengas — explore our signature silhouettes."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-7 mt-10">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={CATEGORY_META[cat].path} className="group block">
                  <div className="gold-frame bg-card overflow-hidden relative">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={CATEGORY_META[cat].image}
                        alt={CATEGORY_META[cat].label}
                        loading="lazy"
                        width={800}
                        height={1000}
                        className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl text-center mt-4 group-hover:text-primary transition-colors">
                    {CATEGORY_META[cat].label}
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground text-center mt-1">
                    {products.filter(p => p.category === cat).length} pieces
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CAROUSEL */}
      {featured.length > 0 && (
        <section className="py-14 md:py-24 bg-gradient-luxe relative overflow-hidden border-y border-primary/5">
          <div className="absolute inset-0 motif-bg opacity-30" />

          <div className="container relative">
            <SectionHeading
              eyebrow="The Atelier"
              title="Featured Collection"
              subtitle="A curation of our most loved pieces — each one a slow conversation between thread, hand and heart."
            />
            <div className="mt-10">
              <FeaturedCarousel items={featured} />
            </div>
          </div>
        </section>
      )}

      {/* DHAGA REELS */}
      <section className="py-14 md:py-24 bg-secondary/20 relative overflow-hidden">
        <div className="absolute inset-0 motif-bg opacity-40" />

        <div className="container relative grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
          <div className="order-2 lg:order-1">
            <SectionHeading
              align="left"
              eyebrow="DHAGA Reels"
              title="The atelier, in motion"
              subtitle="Step into the studio — twirls, threads, and quiet moments from the women and artisans behind every piece."
            />
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm">
              <div className="text-center">
                <p className="font-serif text-3xl text-primary">{stats.instagramFollowers}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">Followers</p>
              </div>
              <div className="text-center border-x border-border/60">
                <p className="font-serif text-3xl text-primary">{stats.instagramPosts}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">Reels</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-3xl text-primary">{stats.instagramSaved}</p>

                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">Saved</p>
              </div>
            </div>
            <a 
              href="https://instagram.com/dhaga_kolhapur" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-8 text-[11px] uppercase tracking-[0.3em] text-primary font-bold border-b border-primary/40 pb-1 hover:border-primary transition-colors"
            >
              Follow @dhaga_kolhapur →
            </a>
            <p className="hidden lg:block text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-6 opacity-60">
              ↑ ↓ &nbsp; Scroll the phone to glide through reels
            </p>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <DhagaReels />
          </div>
        </div>
      </section>



      {festiveItems.length > 0 && (
        <section className="py-14 md:py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 motif-bg" />
          <div className="container relative">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
              <SectionHeading
                align="left"
                eyebrow="✦ Festive Edit"
                title="Dressed for Every Celebration"
                subtitle="Our most-loved pieces for your most cherished moments."
              />
              <Link
                to="/festive"
                className="text-xs uppercase tracking-[0.25em] text-foreground border-b border-primary/50 pb-1 hover:text-primary hover:border-primary transition-colors"
              >
                Explore Festive →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 lg:gap-10">
              {festiveItems.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="py-14 md:py-24 bg-secondary/30 relative overflow-hidden border-y border-primary/5">
          <div className="absolute inset-0 motif-bg opacity-30" />

          <div className="container relative">
            <SectionHeading
              eyebrow="Loved By Many"
              title="Best Sellers"
              subtitle="Pieces that found their way into wardrobes — and stayed."
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mt-10">
              {bestSellers.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS STRIP */}
      {newArrivals.length > 0 && (
        <section className="py-14 md:py-20 bg-background relative overflow-hidden">
          <div className="absolute inset-0 motif-bg" />
          <div className="container relative">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
              <SectionHeading align="left" eyebrow="Just Arrived" title="New This Season" />
              <Link
                to="/new-arrivals"
                className="text-xs uppercase tracking-[0.25em] text-foreground border-b border-primary/50 pb-1 hover:text-primary hover:border-primary transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {newArrivals.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* QUOTE STRIP */}
      <section className="py-14 md:py-24 bg-gradient-luxe relative overflow-hidden">
        <div className="absolute inset-0 motif-bg opacity-40" />

        <div className="container relative text-center max-w-3xl">
          <p className="text-primary text-2xl mb-4">✦</p>
          <p className="font-serif italic text-2xl md:text-3xl text-foreground leading-snug text-balance">
            "Every DHAGA piece carries the breath of the artisan — a thread between
            tradition, hand, and the woman who wears it."
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-5">
            — The House of DHAGA
          </p>
        </div>
      </section>
    </>
  );
};

export default Home;
