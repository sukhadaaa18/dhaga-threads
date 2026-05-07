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
      <div className="bg-background">
        <div className="container py-3 text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2 opacity-30">/</span>
          <Link to={CATEGORY_META[product.category]?.path || "/"} className="hover:text-primary transition-colors">
            {CATEGORY_META[product.category]?.label || product.category}
          </Link>
          <span className="mx-2 opacity-30">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>
      </div>


      <section className="bg-gradient-blush pt-2 pb-14 md:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 motif-bg opacity-30" />

        <div className="container relative">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="gold-frame bg-card w-full md:sticky md:top-28"
            >
              <div className="overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-auto block"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex flex-col justify-start"
            >

              {product.tag && (
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-primary mb-2 md:mb-4 font-bold">
                  {product.tag}
                </p>
              )}
              <h1 className="font-serif text-3xl md:text-5xl text-foreground mb-4 leading-[1.05]">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-serif text-2xl text-primary">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-muted-foreground line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs uppercase tracking-[0.2em] text-primary border border-primary/40 px-2 py-1">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                  </span>
                )}
              </div>

              {product.isOutOfStock && (
                <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 text-destructive text-center font-bold text-xs uppercase tracking-[0.2em] gold-frame-thin animate-pulse">
                  Sold Out — This piece is currently unavailable
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed mb-3">
                {product.description}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-primary mb-8">
                {product.fabric}
              </p>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-foreground font-bold">Select Size</p>
                  <button onClick={() => setShowSizeGuide(true)} className="text-[10px] uppercase tracking-widest text-primary hover:underline">Size Guide ↗</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {ALL_SIZES.map((s) => {
                    const isSoldOut = product.outOfStockSizes?.includes(s) || product.isOutOfStock;
                    return (
                      <button
                        key={s}
                        disabled={isSoldOut}
                        onClick={() => setSize(s)}
                        className={cn(
                          "w-12 h-12 border text-sm transition-all relative overflow-hidden flex items-center justify-center font-medium",
                          size === s && !isSoldOut
                            ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                            : isSoldOut
                              ? "border-border/40 bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                              : "border-border hover:border-primary hover:text-primary"
                        )}
                      >
                        <span>{s}</span>
                        {isSoldOut && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-40">
                            <div className="w-[150%] h-[1px] bg-muted-foreground rotate-45" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reservation Section - Store Visit Concept */}
              <div className="mb-10 p-7 border border-primary/20 bg-secondary/20 gold-frame animate-fade-in shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-bold">Boutique Appointment</p>
                    <h2 className="font-serif text-2xl text-foreground">Reserve for Store Visit</h2>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                  Reserve this outfit for an in-store visit. Choose the date you plan to visit our boutique. Once confirmed, the product will remain reserved for you for up to 8 days.
                </p>

                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] text-foreground font-semibold ml-1">Choose Your Visit Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-card border border-primary/30 p-4 text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-serif gold-frame-thin"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 ml-1 italic">
                      * Selection is for your visit start. We hold the piece for 8 days upon confirmation.
                    </p>
                  </div>

                  {bookedDates.length > 0 && (
                    <div className="bg-primary/5 p-3 border border-primary/10 rounded">
                      <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Currently Reserved Dates:</p>
                      <div className="flex flex-wrap gap-2">
                        {bookedDates.map((d, i) => (
                          <span key={i} className="text-[9px] bg-background px-2 py-1 border border-border">
                            {formatDate(d.startDate)} - {formatDate(d.endDate)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    disabled={bookingLoading || isRequested || product.isOutOfStock}
                    onClick={handleReserve}
                    className={cn(
                      "w-full py-4 text-xs uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-2 shadow-md",
                      isRequested
                        ? "bg-green-500/10 text-green-600 border border-green-200 cursor-default"
                        : product.isOutOfStock
                          ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-foreground"
                    )}
                  >
                    {bookingLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isRequested ? (
                      <>
                        <CheckCircle size={16} /> Request Sent
                      </>
                    ) : product.isOutOfStock ? (
                      "Inventory Unavailable"
                    ) : (
                      "Request Reservation"
                    )}
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-primary/10">
                  <details className="group">
                    <summary className="list-none cursor-pointer flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
                      <span>How It Works</span>
                      <span className="transition-transform duration-300 group-open:rotate-180">↓</span>
                    </summary>
                    <ul className="space-y-3 mt-5 animate-fade-in">
                      {[
                        "Submit your reservation request",
                        "Our boutique team will call to confirm availability",
                        "Your outfit gets reserved",
                        "Visit the store within the reservation period",
                        "Purchase only if you love it"
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3 text-xs text-muted-foreground items-start">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] flex-shrink-0 font-bold">{i + 1}</span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>

              <div className="flex gap-3 mb-10">
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
                    "flex-1 px-6 py-4 text-xs uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-2",
                    product.isOutOfStock
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : inCart
                        ? "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
                        : "bg-foreground text-background hover:bg-primary"
                  )}
                >
                  {product.isOutOfStock ? (
                    <ShoppingBag size={14} />
                  ) : inCart ? (
                    <CheckCircle size={14} />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                  {product.isOutOfStock ? "Out of Stock" : inCart ? "Already in Bag" : "Add to Cart"}
                </button>
                <button
                  onClick={() => toggleWish(product.id)}
                  className={cn(
                    "w-14 h-14 border flex items-center justify-center transition-colors",
                    wished ? "border-primary text-primary" : "border-border hover:border-primary"
                  )}
                  aria-label="Wishlist"
                >
                  <Heart size={16} fill={wished ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 text-center text-xs">
                <div>
                  <Truck className="mx-auto mb-2 text-primary" size={18} />
                  <p className="text-muted-foreground">Free shipping<br />over ₹5,000</p>
                </div>
                <div>
                  <Award className="mx-auto mb-2 text-primary" size={18} />
                  <p className="text-muted-foreground">Handcrafted<br />in India</p>
                </div>
                <div>
                  <RefreshCw className="mx-auto mb-2 text-primary" size={18} />
                  <p className="text-muted-foreground">Easy 7-day<br />exchange</p>
                </div>
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
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors z-10"
            >
              <X size={20} />
            </button>
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
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors z-10"
            >
              <X size={20} />
            </button>
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
              Close
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
