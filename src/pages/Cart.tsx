import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { useShop } from "@/store/shop";
import { useAuth } from "@/store/useAuth";
import { formatINR } from "@/data/products";
import { SectionHeading } from "@/components/SectionHeading";
import { cn } from "@/lib/utils";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

const Cart = () => {
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const total = cartTotal();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    pincode: "",
    phone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  const [showAddress, setShowAddress] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/auth");
      return;
    }

    if (!showAddress) {
      setShowAddress(true);
      return;
    }

    if (!address.fullName || !address.street || !address.pincode || !address.phone) {
      toast.error("Please fill all shipping details");
      return;
    }

    setLoading(true);
    try {
      const finalAmount = total + (total >= 5000 ? 0 : 199);
      
      if (paymentMethod === 'Online') {
        // 1. Create Razorpay order on backend
        const { data: rzpOrder } = await api.post("/payments/create-order", {
          amount: finalAmount
        });

        // 2. Load Razorpay script
        const loadScript = (src: string) => {
          return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          setLoading(false);
          return;
        }

        // 3. Open Razorpay Popup
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ShbSUZm1UTFndC',
          amount: rzpOrder.amount,
          currency: "INR",
          name: "DHAGA - Threads of Elegance",
          description: "Purchase from DHAGA Atelier",
          order_id: rzpOrder.id,
          handler: async function (response: any) {
            // Payment success! Now create the actual order in our DB
            await api.post("/orders", {
              items: cart.map(item => ({
                product: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.qty
              })),
              totalPrice: finalAmount,
              address,
              paymentMethod: 'Online',
              paymentStatus: 'Paid',
              razorpayPaymentId: response.razorpay_payment_id
            });
            
            toast.success("Payment Successful! Order placed.");
            clearCart();
            navigate("/");
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: address.phone
          },
          theme: { color: "#C8A1E0" } // Primary color
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        // COD logic
        await api.post("/orders", {
          items: cart.map(item => ({
            product: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.qty
          })),
          totalPrice: finalAmount,
          address,
          paymentMethod: 'COD'
        });
        
        toast.success("Order placed successfully! Please pay cash at the time of delivery.");
        clearCart();
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden min-h-[70vh]">
      <div className="absolute inset-0 motif-bg" />
      <div className="container relative">
        <SectionHeading eyebrow="Your Selection" title="The Cart" />

        {cart.length === 0 ? (
          <div className="text-center mt-16">
            <p className="font-serif italic text-2xl text-muted-foreground mb-8">
              Your cart awaits its first treasure.
            </p>
            <Link
              to="/"
              className="inline-block bg-foreground text-background px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors"
            >
              Begin Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-14 grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {showAddress && (
                <div className="bg-card border border-border p-6 mb-10 gold-frame animate-fade-in">
                  <h3 className="font-serif text-2xl mb-6">Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Full Name" className="cart-input col-span-2" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} />
                    <input placeholder="Street Address" className="cart-input col-span-2" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                    <input placeholder="City" className="cart-input" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                    <input placeholder="Pincode" className="cart-input" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} />
                    <input placeholder="Phone Number" className="cart-input col-span-2" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                  </div>

                  <h3 className="font-serif text-2xl mt-10 mb-6">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setPaymentMethod('COD')}
                      className={cn(
                        "p-4 border text-xs uppercase tracking-[0.2em] transition-all",
                        paymentMethod === 'COD' ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"
                      )}
                    >
                      Cash on Delivery
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('Online')}
                      className={cn(
                        "p-4 border text-xs uppercase tracking-[0.2em] transition-all",
                        paymentMethod === 'Online' ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"
                      )}
                    >
                      Online Payment
                    </button>
                  </div>
                </div>
              )}

              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-5 pb-6 border-b border-border/60 group"
                >
                  <Link to={`/product/${item.product.id}`} className="gold-frame block w-28 sm:w-32 flex-shrink-0">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="font-serif text-xl mb-1 hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {item.product.fabric}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-auto pt-4">
                      <div className="inline-flex items-center border border-border">
                        <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="w-8 h-8 hover:text-primary"><Minus size={12} className="mx-auto" /></button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="w-8 h-8 hover:text-primary"><Plus size={12} className="mx-auto" /></button>
                      </div>
                      <span className="font-serif text-lg text-primary">
                        {formatINR(item.product.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-8 h-fit gold-frame">
              <h3 className="font-serif text-2xl mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm border-b border-border/60 pb-5 mb-5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatINR(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-primary">{total >= 5000 ? "Free" : formatINR(199)}</span>
                </div>
              </div>
              <div className="flex justify-between font-serif text-xl mb-6">
                <span>Total</span>
                <span className="text-primary">{formatINR(total + (total >= 5000 ? 0 : 199))}</span>
              </div>
              <button 
                disabled={loading}
                onClick={handleCheckout}
                className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.25em] hover:bg-primary transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {showAddress ? "Complete Order" : "Proceed to Checkout"}
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-4 italic">
                Wrapped in a DHAGA keepsake box · ships within 48 hours
              </p>
            </div>
          </div>
        )}
      </div>
      <style>{`.cart-input{width:100%;background:transparent;border:1px solid hsl(var(--border));padding:.75rem;font-size:.875rem;outline:none;transition:border-color .2s;margin-bottom:.5rem}.cart-input:focus{border-color:hsl(var(--primary))}`}</style>
    </section>
  );
};

export default Cart;
