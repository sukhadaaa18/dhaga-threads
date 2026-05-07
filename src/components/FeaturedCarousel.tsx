import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { formatINR } from "@/data/products";

interface Props {
  items: Product[];
}

/**
 * Center-focused 3D carousel.
 * Center card pops (scale up, sharp), side cards shrink, fade and recede in depth.
 * Mobile: swipe (drag) supported via framer-motion.
 */
export const FeaturedCarousel = ({ items }: Props) => {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const len = items.length;
  const next = () => setActive((a) => (a + 1) % len);
  const prev = () => setActive((a) => (a - 1 + len) % len);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const timer = useRef<number | null>(null);
  useEffect(() => {
    timer.current = window.setInterval(() => {
      setActive((a) => (a + 1) % len);
    }, 5500);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [len]);

  const pause = () => {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  const offsetOf = (i: number) => {
    let d = i - active;
    if (d > len / 2) d -= len;
    if (d < -len / 2) d += len;
    return d;
  };

  const cardWidth = isMobile ? 240 : 340;
  const gap = isMobile ? 170 : 290;

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={pause}
      onMouseLeave={() => {
        if (!timer.current) {
          timer.current = window.setInterval(() => {
            setActive((a) => (a + 1) % len);
          }, 5500);
        }
      }}
    >
      <div
        className="relative h-[500px] md:h-[620px] flex items-center justify-center"
        style={{ perspective: "1800px" }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) next();
            else if (info.offset.x > 60) prev();
          }}
        >
          {items.map((p, i) => {
            const off = offsetOf(i);
            const abs = Math.abs(off);
            const isCenter = off === 0;
            const x = off * gap;
            const scale = isCenter ? 1 : abs === 1 ? 0.78 : 0.6;
            const rotateY = off * -16;
            const z = -abs * 220;
            const opacity = abs > 2 ? 0 : isCenter ? 1 : abs === 1 ? 0.55 : 0.25;
            const blur = isCenter ? 0 : Math.min(abs * 1.5, 4);
            const zIndex = 10 - abs;

            return (
              <motion.div
                key={p.id}
                className="absolute"
                style={{
                  zIndex,
                  width: cardWidth,
                }}
                animate={{
                  x,
                  scale,
                  rotateY,
                  z,
                  opacity,
                  filter: `blur(${blur}px)`,
                }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => !isCenter && setActive(i)}
              >
                <Link
                  to={isCenter ? `/product/${p.id}` : "#"}
                  onClick={(e) => !isCenter && e.preventDefault()}
                  className={`block w-full ${
                    isCenter ? "cursor-pointer" : "cursor-pointer pointer-events-auto"
                  }`}
                  draggable={false}
                >
                  <div
                    className={`relative gold-frame bg-card transition-all duration-700 ${
                      isCenter ? "shadow-luxe border-primary/40 scale-[1.02]" : "shadow-card border-border/40"
                    } ${isCenter ? "shadow-[0_20px_50px_-12px_rgba(197,165,114,0.3)]" : ""}`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        draggable={false}
                        width={800}
                        height={1024}
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-[2000ms]",
                          isCenter ? "scale-100" : "scale-105 saturate-[0.8]"
                        )}
                      />
                      {isCenter && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                          <div className="absolute inset-0 border-[8px] border-white/5 pointer-events-none" />
                        </>
                      )}
                    </div>
                  </div>

                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Center info */}
      <div className="text-center mt-6 min-h-[110px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={items[active].id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-2">
              {items[active].tag ?? "Featured"}
            </p>
            <h3 className="font-serif text-3xl md:text-4xl mb-2">
              {items[active].name}
            </h3>
            <p className="font-serif text-xl text-primary mb-4">
              {formatINR(items[active].price)}
            </p>
            <Link
              to={`/product/${items[active].id}`}
              className="inline-block text-xs uppercase tracking-[0.25em] text-foreground border-b border-primary/50 pb-1 hover:text-primary hover:border-primary transition-colors"
            >
              Discover the Piece
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-2 md:left-8 top-[230px] md:top-[290px] -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-border hover:border-primary hover:text-primary transition-colors flex items-center justify-center z-20"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-8 top-[230px] md:top-[290px] -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-border hover:border-primary hover:text-primary transition-colors flex items-center justify-center z-20"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-px transition-all duration-500 ${
              i === active ? "w-10 bg-primary" : "w-5 bg-border"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
