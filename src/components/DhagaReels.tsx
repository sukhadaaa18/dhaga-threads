import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

export const DhagaReels = () => {
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [reels, setReels] = useState<any[]>([]);
  const [baseReels, setBaseReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const loadReels = async () => {
      try {
        const { data } = await api.get("/products");
        const productsWithVideo = data.filter((p: any) => p.reelVideo);
        
        if (productsWithVideo.length > 0) {
          setBaseReels(productsWithVideo);
          // Start with two sets for immediate infinite feel
          setReels([...productsWithVideo, ...productsWithVideo]);
        } else {
          setReels([]);
        }
      } catch (error) {
        console.error("Failed to load reels", error);
      } finally {
        setLoading(false);
      }
    };
    loadReels();
  }, []);

  // PLAY ACTIVE VIDEO
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;

      if (i === active) {
        vid.muted = true; // REQUIRED for autoplay
        vid.currentTime = 0;
        vid.play().catch(() => {
          console.log("Autoplay failed");
        });
      } else {
        vid.pause();
      }
    });
  }, [active, reels]);

  // SCROLL → ACTIVE INDEX + INFINITE LOGIC
  useEffect(() => {
    const el = containerRef.current;
    if (!el || reels.length === 0) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const idx = Math.round(el.scrollTop / el.clientHeight);
        setActive(idx);

        // INFINITE LOGIC: If we are near the end of the current list, append baseReels again
        if (idx >= reels.length - 3) {
          setReels(prev => [...prev, ...baseReels]);
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reels, baseReels]);

  const goTo = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;

    const next = Math.max(0, idx); // No upper limit because it's infinite
    el.scrollTo({ top: next * el.clientHeight, behavior: "smooth" });
  };

  const toggleLike = (id: string) => {
    setLiked((p) => ({ ...p, [id]: !p[id] }));
  };

  if (loading) {
    return (
      <div className="h-[640px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-[640px] flex flex-col items-center justify-center text-center p-10 bg-secondary/20 rounded-[2.4rem] border border-dashed border-primary/30">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MessageCircle size={32} className="text-primary/40" />
        </div>
        <h3 className="font-serif text-xl mb-2 text-primary">No Reels Yet</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Add a "Reel Video" to any product in the Admin panel to see it featured here in motion.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[380px] sm:max-w-[420px]">
      <div className="relative rounded-[2.4rem] bg-foreground p-2 shadow-luxe">
        <div className="absolute left-1/2 top-2 z-30 -translate-x-1/2 w-28 h-5 rounded-b-2xl bg-foreground" />

        <div
          ref={containerRef}
          className="relative h-[640px] sm:h-[680px] w-full overflow-y-scroll snap-y snap-mandatory rounded-[2rem] bg-background scrollbar-none"
        >
          {reels.map((r, i) => {
            const isActive = i === active;
            const isLiked = !!liked[r._id || r.id];

            return (
              <section
                key={`${r._id || r.id}-${i}`}
                className="relative h-full w-full snap-start overflow-hidden"
              >
                {/* VIDEO */}
                <motion.video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={r.reelVideo}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="auto"
                  className="absolute inset-0 h-full w-full object-cover"
                  animate={
                    isActive
                      ? { scale: [1, 1.05], opacity: 1 }
                      : { scale: 1, opacity: 0.5 }
                  }
                />

                {/* GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />

                {/* CONTENT */}
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end text-white">
                  <div className="flex-1 pr-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-1">
                       {r.category?.replace(/-/g, ' ')}
                    </p>
                    <h3 className="text-xl font-semibold leading-tight mb-1">{r.name}</h3>
                    <p className="text-xs opacity-80 line-clamp-2 mb-3">{r.description}</p>

                    <Link
                      to={`/product/${r._id || r.id}`}
                      className="inline-block bg-white text-black px-5 py-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-primary hover:text-white transition-all"
                    >
                      Shop Piece →
                    </Link>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-5 items-center pb-2">
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => toggleLike(r._id || r.id)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <Heart
                          fill={isLiked ? "#C8A1E0" : "none"}
                          className={isLiked ? "text-primary" : "text-white"}
                          size={20}
                        />
                      </button>
                      <span className="text-[10px] font-bold tracking-tighter">{isLiked ? 'Liked' : 'Save'}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <MessageCircle size={20} />
                      </div>
                      <span className="text-[10px] font-bold tracking-tighter">Ask</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <Share2 size={20} />
                      </div>
                      <span className="text-[10px] font-bold tracking-tighter">Share</span>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* NAV */}
      <div className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 flex-col gap-3">
        <button 
          onClick={() => goTo(active - 1)}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
        >
          <ChevronUp size={20} />
        </button>
        <button 
          onClick={() => goTo(active + 1)}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
        >
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
};