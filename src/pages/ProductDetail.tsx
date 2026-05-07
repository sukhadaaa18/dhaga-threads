import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, Truck, Award, RefreshCw, Calendar, Loader2, X, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { type Product, formatINR, formatDate, CATEGORY_META } from "@/data/products";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/useAuth";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { BRAND_CONFIG } from "@/config/brand";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);

  const addToCart = useShop((s) => s.addToCart);
  const cart = useShop((s) => s.cart);
  const inCart = cart.some(item => item.product.id === id);
  const toggleWish = useShop((s) => s.toggleWishlist);
  const wishlist = useShop((s) => s.wishlist);
  const wished = wishlist.includes(id ?? "");

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("M");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [bookedDates, setBookedDates] = useState<any[]>([]);
  const [bookingPhone, setBookingPhone] = useState(user?.phone || "");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    loadProduct();
    loadBookedDates();
  }, [id]);

  useEffect(() => {
    if (user?.phone) setBookingPhone(user.phone);
  }, [user]);

  const loadBookedDates = async () => {
    try {
      const { data } = await api.get(`/reservations/product/${id}`);
      setBookedDates(data);
    } catch (e) { console.error(e); }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      const p = { ...data, id: data._id };
      setProduct(p);

      // Load related
      const { data: all } = await api.get("/products");
      const filtered = all
        .filter((item: any) => item._id !== id && item.category === data.category)
        .slice(0, 3)
        .map((item: any) => ({ ...item, id: item._id }));
      setRelated(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleReserve = async () => {
    if (!user) {
      toast.error("Please login to reserve");
      navigate("/auth");
      return;
    }
    if (!bookingDate) {
      toast.error("Please select a visit date");
      return;
    }

    // Open the confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };

  const finalizeReservation = async () => {
    if (!bookingPhone) {
      toast.error("Please provide a contact number");
      return;
    }

    setBookingLoading(true);
    try {
      await api.post("/reservations", {
        productId: id,
        startDate: bookingDate,
        phone: bookingPhone,
        totalPrice: product!.price
      });
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setBookingDate("");
      loadBookedDates();
      setIsRequested(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-32 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="font-serif text-xl">Loading your piece...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-32 text-center">
        <p className="font-serif text-3xl mb-6">This piece could not be found.</p>
        <Link to="/" className="text-primary uppercase tracking-[0.2em] text-xs border-b border-primary pb-1">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background border-b border-primary/5">
        <div className="container py-4 text-xs text-muted-foreground uppercase tracking-widest">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2 opacity-30">/</span>
          <Link to={CATEGORY_META[product.category]?.path || "/"} className="hover:text-primary transition-colors">
            {CATEGORY_META[product.category]?.label || product.category}
          </Link>
          <span className="mx-2 opacity-30">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>
      </div>


      <section className="bg-background pt-10 pb-14 md:pb-20 relative overflow-hidden">
        {/* Subtle Motif Background */}
        <div className="absolute inset-0 motif-bg opacity-[0.08]" />

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
            {/* Left: Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="md:sticky md:top-28"
            >
              <div className="gold-frame bg-card overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.01]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-auto block object-cover"
                />
              </div>
            </motion.div>

            {/* Right: Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="mb-8">
                {product.tag && (
                  <span className="inline-block text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-4 px-3 py-1 border border-primary/20 rounded-full bg-primary/5">
                    {product.tag}
                  </span>
                )}
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-5">
                  <span className="font-serif text-3xl text-primary font-light">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground/60 line-through text-lg">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6 mb-10 border-y border-primary/5 py-8">
                <p className="text-muted-foreground leading-relaxed italic text-base md:text-lg">
                  "{product.description}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <p className="text-[11px] uppercase tracking-[0.3em] text-foreground font-bold">
                    {product.fabric}
                  </p>
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-foreground font-bold">Select Size</p>
                  <button onClick={() => setShowSizeGuide(true)} className="text-[10px] uppercase tracking-widest text-primary border-b border-primary/30 hover:border-primary transition-all">
                    Size Guide ↗
                  </button>
                </div>
                <div className="flex flex-wrap gap-4">
                  {ALL_SIZES.map((s) => {
                    const isSoldOut = product.outOfStockSizes?.includes(s) || product.isOutOfStock;
                    return (
                      <button
                        key={s}
                        disabled={isSoldOut}
                        onClick={() => setSize(s)}
                        className={cn(
                          "w-12 h-12 rounded-full border text-[11px] font-bold transition-all duration-500 flex items-center justify-center relative",
                          size === s && !isSoldOut
                            ? "bg-foreground text-background border-foreground shadow-lg scale-110"
                            : isSoldOut
                              ? "bg-muted/10 text-muted-foreground/30 border-dashed border-border/40 cursor-not-allowed"
                              : "bg-transparent text-foreground/60 border-border/60 hover:border-primary hover:text-primary"
                        )}
                      >
                        {s}
                        {isSoldOut && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-40">
                            <div className="w-6 h-[1px] bg-muted-foreground/50 rotate-45" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reservation / Boutique Visit - Cleaner Glass Card */}
              <div className="mb-12 p-8 glass-card border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Calendar size={60} />
                </div>
                
                <div className="relative z-10">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Private Experience</p>
                  <h3 className="font-serif text-2xl mb-4">Boutique Appointment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Experience this piece in person at our Kolhapur atelier. 
                    We will reserve it exclusively for you for 8 days.
                  </p>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foreground/60 font-bold ml-1">Visit Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-background/50 border border-primary/20 p-4 text-sm outline-none focus:border-primary/60 transition-all font-serif"
                      />
                    </div>

                    <button
                      disabled={bookingLoading || isRequested || product.isOutOfStock}
                      onClick={handleReserve}
                      className={cn(
                        "w-full py-4 text-[11px] uppercase tracking-[0.4em] transition-all duration-500 font-bold",
                        isRequested
                          ? "bg-green-500/10 text-green-600 border border-green-200"
                          : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white"
                      )}
                    >
                      {bookingLoading ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : isRequested ? (
                        "Request Received"
                      ) : (
                        "Request Reservation"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  disabled={product.isOutOfStock}
                  onClick={() => {
                    if (inCart) {
                      navigate("/cart");
                      return;
                    }
                    for (let i = 0; i < qty; i++) addToCart(product);
                    navigate("/cart");
                  }}
                  className={cn(
                    "flex-[2] py-5 text-[11px] uppercase tracking-[0.4em] font-bold transition-all duration-500 shadow-xl",
                    product.isOutOfStock
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : inCart
                        ? "bg-green-600 text-white"
                        : "bg-foreground text-background hover:bg-primary"
                  )}
                >
                  {product.isOutOfStock ? "Out of Stock" : inCart ? "View in Bag" : "Add to Cart"}
                </button>
                
                <button
                  onClick={() => toggleWish(product.id)}
                  className={cn(
                    "flex-1 py-5 border flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] font-bold transition-all",
                    wished ? "bg-primary/5 border-primary text-primary" : "border-border hover:border-primary/40 text-foreground/60 hover:text-primary"
                  )}
                >
                  <Heart size={16} fill={wished ? "currentColor" : "none"} />
                  {wished ? "Saved" : "Save"}
                </button>
              </div>

              {/* Trust Badges - Cleaner Horizontal Layout */}
              <div className="flex items-center justify-between py-6 border-t border-primary/5">
                {[
                  { icon: Truck, label: "Free Shipping" },
                  { icon: Award, label: "Handcrafted" },
                  { icon: RefreshCw, label: "Easy Returns" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <item.icon size={18} className="text-primary/60" strokeWidth={1.2} />
                    <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {related.length > 0 && (
        <section className="py-14 md:py-24 bg-secondary/20 relative overflow-hidden border-t border-primary/5">
          <div className="absolute inset-0 motif-bg opacity-40" />

          <div className="container relative">
            <h2 className="font-serif text-3xl md:text-4xl text-center mb-14">You May Also Love</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[250] bg-foreground/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border w-full max-w-md p-10 text-center gold-frame relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
              <Calendar size={30} />
            </div>
            <h2 className="font-serif text-3xl mb-2">Finalize Visit</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-8 font-bold">Boutique Appointment</p>

            <div className="space-y-6 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-[0.2em] text-foreground font-semibold">Confirm Contact Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  autoFocus
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  className="w-full bg-transparent border border-primary/30 p-4 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-serif gold-frame-thin"
                />
                <p className="text-[10px] text-muted-foreground mt-1 italic leading-relaxed">
                  * We will use this number to coordinate your visit and confirm availability.
                </p>
              </div>

              <div className="bg-muted/30 p-4 border border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Selected Visit Date:</p>
                <p className="font-serif text-lg text-foreground">{formatDate(bookingDate)}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 text-[10px] uppercase tracking-[0.2em] border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={bookingLoading}
                  onClick={finalizeReservation}
                  className="flex-1 bg-foreground text-background py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-colors flex items-center justify-center gap-2 font-bold"
                >
                  {bookingLoading ? <Loader2 size={14} className="animate-spin" /> : "Confirm Visit"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[250] bg-foreground/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border w-full max-w-md p-10 text-center gold-frame relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
              <Award size={40} />
            </div>
            <h2 className="font-serif text-3xl mb-4">Request Received</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Your visit request for the <span className="text-foreground font-semibold">"{product.name}"</span> has been successfully logged.
              <br /><br />
              We'll review your request and contact you shortly to confirm your appointment.
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.3em] hover:bg-primary transition-colors font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle size={14} /> Track Appointment Status
            </button>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Continue Browsing
            </button>
            <div className="mt-6 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              DHAGA — Exclusive Atelier
            </div>
          </motion.div>
        </div>
      )}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[200] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border w-full max-w-2xl p-8 gold-frame animate-scale-in relative">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="font-serif text-3xl mb-6">Size Guide</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="p-3 border-b border-border">Size</th>
                    <th className="p-3 border-b border-border">Bust (in)</th>
                    <th className="p-3 border-b border-border">Waist (in)</th>
                    <th className="p-3 border-b border-border">Hip (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { s: "XS", b: "32", w: "26", h: "35" },
                    { s: "S", b: "34", w: "28", h: "37" },
                    { s: "M", b: "36", w: "30", h: "39" },
                    { s: "L", b: "38", w: "32", h: "41" },
                    { s: "XL", b: "40", w: "34", h: "43" },
                  ].map((row) => (
                    <tr key={row.s} className="hover:bg-muted/30">
                      <td className="p-3 border-b border-border font-bold">{row.s}</td>
                      <td className="p-3 border-b border-border">{row.b}</td>
                      <td className="p-3 border-b border-border">{row.w}</td>
                      <td className="p-3 border-b border-border">{row.h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-[11px] text-muted-foreground italic leading-relaxed">
              * Measurements are in inches. If you are between sizes, we recommend choosing the larger size for a better drape.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;
