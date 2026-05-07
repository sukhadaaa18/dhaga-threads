import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package, ShoppingBag, Tag, ImageIcon, X, Loader2, CalendarCheck, BarChart3, Sparkles, Settings as SettingsIcon, Instagram, RefreshCw, Search } from "lucide-react";

import { type Product, type Category, formatINR, formatDate, CATEGORIES, CATEGORY_META } from "@/data/products";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

type Tab = "products" | "orders" | "reservations" | "categories" | "analytics" | "settings";


const Admin = () => {
  const [tab, setTab] = useState<Tab>("products");
  const [items, setItems] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingReservationId, setDeletingReservationId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState({
    instagramFollowers: "3.5K",
    instagramPosts: "100",
    instagramSaved: "300",
    instagramAccessToken: "",
    realWishlistCount: 0
  });
  const [syncing, setSyncing] = useState(false);


  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resP, resO, resR] = await Promise.all([
        api.get("/products"),
        api.get("/orders"),
        api.get("/reservations")
      ]);
      setItems(resP.data.map((p: any) => ({ ...p, id: p._id })));
      setOrders(resO.data);
      setReservations(resR.data);
      const resS = await api.get("/site-settings");
      if (resS.data) setSettings(resS.data);

    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (p: Product) => {
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, p);
        toast.success("Product updated");
      } else {
        // Remove empty ID for new products to avoid database confusion
        const { id, ...newProductData } = p;
        await api.post("/products", newProductData);
        toast.success("Product added");
      }
      loadData();
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      loadData();
      setDeletingId(null);
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success("Status updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      await api.put(`/reservations/${id}/status`, { status });
      toast.success("Reservation updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update reservation");
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      await api.delete(`/reservations/${id}`);
      toast.success("Reservation removed");
      loadData();
      setDeletingReservationId(null);
    } catch (error) {
      toast.error("Failed to delete reservation");
    }
  };

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setLoading(true);
    toast.info(`Uploading ${files.length} pieces... please wait.`);
    
    try {
      for (const file of files) {
        // 1. Upload
        const formData = new FormData();
        formData.append('image', file);
        const { data: uploadRes } = await api.post('/upload', formData);

        // 2. Create Draft
        await api.post('/products', {
          name: file.name.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
          price: 0,
          category: "kurtis",
          fabric: "Silk",
          description: "New handcrafted piece.",
          image: uploadRes.url
        });
      }
      toast.success("Collection uploaded! You can now edit the names and prices in the list below.");
      loadData();
    } catch (err) {
      toast.error("Some uploads failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/30 min-h-[80vh] relative overflow-hidden">
      <div className="absolute inset-0 motif-bg" />
      <div className="container relative py-10 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-2">Atelier</p>
            <h1 className="font-serif text-4xl md:text-5xl">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2 text-xs uppercase tracking-[0.2em] overflow-x-auto pb-2">
            {([
              { k: "products", l: "Products", icon: Package },
              { k: "orders", l: "Orders", icon: ShoppingBag },
              { k: "reservations", l: "Visits", icon: CalendarCheck },
              { k: "analytics", l: "Analytics", icon: BarChart3 },
              { k: "categories", l: "Categories", icon: Tag },
              { k: "settings", l: "Settings", icon: SettingsIcon },

            ] as const).map(({ k, l, icon: Icon }) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={cn(
                  "px-5 py-3 border flex items-center gap-2 transition-colors whitespace-nowrap",
                  tab === k
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border hover:border-primary"
                )}
              >
                <Icon size={14} /> {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { l: "Total Products", v: items.length },
            { l: "Pending Visits", v: reservations.filter(r => r.status === 'pending_confirmation').length },
            { l: "Total Orders", v: orders.length },
            { l: "Total Visits", v: reservations.length },
          ].map((s) => (
            <div key={s.l} className="bg-card border border-border p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{s.l}</p>
              <p className="font-serif text-2xl text-foreground">{s.v}</p>
            </div>
          ))}
        </div>

        {tab === "products" && (
          <div className="bg-card border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-4">
                <h2 className="font-serif text-2xl">Products</h2>
                {filter && (
                  <button 
                    onClick={() => setFilter("")}
                    className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    Filter: {CATEGORY_META[filter as Category]?.label || filter} (Clear ✕)
                  </button>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search pieces..." 
                    className="bg-muted/50 border border-border pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary w-40 md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

              </div>
              <div className="flex gap-2">
                <label className="bg-secondary text-secondary-foreground px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-secondary/80 transition-colors cursor-pointer flex items-center gap-2 border border-border">
                  <ImageIcon size={14} /> Quick Upload
                  <input type="file" multiple accept="image/*" onChange={handleQuickUpload} className="hidden" />
                </label>
                <button
                  onClick={() => { setEditing(null); setShowForm(true); }}
                  className="bg-foreground text-background px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-primary transition-colors flex items-center gap-2"
                >
                  <Plus size={14} /> Add One
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    <tr>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4 hidden md:table-cell">Category</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-left p-4 hidden md:table-cell">Tag</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter(p => {
                        const categoryLabel = CATEGORY_META[p.category as Category]?.label || "";
                        const matchesFilter = !filter || (filter === "festive" ? p.isFestive : filter === "outOfStock" ? p.isOutOfStock : p.category === filter);
                        const matchesSearch = !searchQuery || 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesFilter && matchesSearch;

                      })
                      .map((p, idx) => (
                      <tr key={p.id} className="border-t border-border/60 hover:bg-muted/30 group">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-12 h-14 object-cover" />
                          <div className="flex-1">
                            <input 
                              className="font-serif text-base bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/30 w-full p-1"
                              value={p.name}
                              onChange={async (e) => {
                                const next = [...items];
                                next[idx].name = e.target.value;
                                setItems(next);
                                // Silent sync
                                api.put(`/products/${p.id}`, { name: e.target.value }).catch(console.error);
                              }}
                            />
                            <p className="text-xs text-muted-foreground px-1">{p.fabric}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">
                          {CATEGORY_META[p.category]?.label || p.category}
                        </td>
                        <td className="p-4">
                           <div className="flex items-center text-primary">
                             <span className="mr-1">₹</span>
                             <input 
                              type="number"
                              className="bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/30 w-24 p-1 font-bold"
                              value={p.price}
                              onChange={async (e) => {
                                const val = parseInt(e.target.value) || 0;
                                const next = [...items];
                                next[idx].price = val;
                                setItems(next);
                                // Silent sync
                                api.put(`/products/${p.id}`, { price: val }).catch(console.error);
                              }}
                            />
                           </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {p.isOutOfStock ? (
                            <span className="text-[9px] uppercase tracking-widest bg-destructive/10 text-destructive px-2 py-0.5 border border-destructive/20 font-bold">Sold Out</span>
                          ) : (
                            <span className="text-[9px] uppercase tracking-widest bg-green-100 text-green-600 px-2 py-0.5 border border-green-200 font-bold">Available</span>
                          )}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setEditing(p); setShowForm(true); }} 
                              className="p-2.5 bg-secondary text-secondary-foreground hover:bg-primary/20 transition-all border border-border"
                              title="Edit Piece"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => setDeletingId(p.id)} 
                              className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/20"
                              title="Delete Piece"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="bg-card border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-serif text-2xl">Real-time Orders</h2>
            </div>
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    <tr>
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4 hidden md:table-cell">Date</th>
                      <th className="text-left p-4">Items</th>
                      <th className="text-left p-4">Total</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className="border-t border-border/60 hover:bg-muted/30">
                        <td className="p-4">
                          <p className="font-medium">{o.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{o.user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-primary font-bold">{o.user?.phone || o.address?.phone || "No phone"}</p>
                            {(o.user?.phone || o.address?.phone) && (
                              <a 
                                href={`tel:${o.user?.phone || o.address?.phone}`} 
                                className="text-[9px] uppercase bg-secondary/30 px-2 py-0.5 border border-primary/20 hover:bg-primary/10 transition-colors"
                              >
                                Call
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">
                          {formatDate(o.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="text-xs">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              o.paymentMethod === 'COD' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                            )}>
                              {o.paymentMethod}
                            </span>
                            <p className="mt-1 text-muted-foreground">
                              {o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 font-serif">{formatINR(o.totalPrice)}</td>
                        <td className="p-4">
                          <select 
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                            className="bg-transparent border border-border text-xs p-1 outline-none focus:border-primary"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Return Requested">Return Requested</option>
                            <option value="Return Approved">Return Approved</option>
                            <option value="Return Pickup Scheduled">Return Pickup Scheduled</option>
                            <option value="Return Picked Up">Return Picked Up</option>
                            <option value="Refund Processed">Refund Processed</option>
                            <option value="Return Rejected">Return Rejected</option>

                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "reservations" && (
          <div className="bg-card border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-serif text-2xl">Boutique Visit Requests</h2>
            </div>
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    <tr>
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Outfit</th>
                      <th className="text-left p-4">Visit Date</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r._id} className="border-t border-border/60 hover:bg-muted/30">
                        <td className="p-4">
                          <p className="font-medium">{r.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{r.user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-bold text-primary">{r.phone || r.user?.phone || "No phone"}</p>
                            {(r.phone || r.user?.phone) && (
                               <a 
                                 href={`tel:${r.phone || r.user.phone}`} 
                                 className="text-[9px] uppercase bg-secondary/30 px-2 py-0.5 border border-primary/20 hover:bg-primary/10 transition-colors"
                               >
                                 Call
                               </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                             <img src={r.product?.image} className="w-8 h-10 object-cover" />
                             <div>
                               <p className="font-medium text-xs">{r.product?.name}</p>
                               <p className="text-[10px] text-muted-foreground uppercase">{r.product?.category}</p>
                             </div>
                          </div>
                        </td>
                        <td className="p-4 text-primary font-medium">
                          {formatDate(r.startDate)}
                        </td>
                        <td className="p-4">
                          <select 
                            value={r.status}
                            onChange={(e) => updateReservationStatus(r._id, e.target.value)}
                            className={cn(
                                "bg-transparent border border-border text-xs p-1 outline-none",
                                r.status === 'pending_confirmation' ? "border-primary text-primary" : "border-border"
                            )}
                          >
                            <option value="pending_confirmation">Pending Confirmation</option>
                            <option value="confirmed">Confirmed (Visit Scheduled)</option>
                            <option value="completed">Completed (Visit Done)</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                           <button 
                             onClick={() => setDeletingReservationId(r._id)} 
                             className="p-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/20 rounded"
                             title="Delete Request"
                           >
                             <Trash2 size={14} />
                           </button>
                        </td>
                      </tr>
                    ))}
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-muted-foreground italic font-serif">
                          No boutique visit requests yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              {(() => {
                const successfulOrders = orders.filter(o => o.status !== 'Cancelled');
                const totalRev = successfulOrders.reduce((s,o) => s+o.totalPrice, 0);
                const avgOrder = successfulOrders.length ? totalRev / successfulOrders.length : 0;
                
                return [
                  { l: "Gross Revenue", v: formatINR(totalRev), d: "Total successful sales" },
                  { l: "Average Order", v: formatINR(avgOrder), d: "Revenue per successful purchase" },
                  { l: "Visit Conversion", v: reservations.length ? ((successfulOrders.length / (successfulOrders.length + reservations.length)) * 100).toFixed(1) + "%" : "0%", d: "Lead to sale ratio" },
                ].map((m) => (
                  <div key={m.l} className="bg-card border border-border p-6 gold-frame">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary mb-2 font-bold">{m.l}</p>
                    <p className="font-serif text-3xl mb-1">{m.v}</p>
                    <p className="text-xs text-muted-foreground">{m.d}</p>
                  </div>
                ));
              })()}
            </div>

            <div className="bg-card border border-border p-8 gold-frame">
              <h3 className="font-serif text-2xl mb-8">Sales by Payment Method</h3>
              <div className="flex items-center gap-10">
                <div className="flex-1 space-y-6">
                  {[
                    { l: "Online Payment", v: orders.filter(o => o.paymentMethod === 'Online').length, c: "bg-blue-500" },
                    { l: "Cash on Delivery", v: orders.filter(o => o.paymentMethod === 'COD').length, c: "bg-orange-500" },
                  ].map(p => (
                    <div key={p.l}>
                      <div className="flex justify-between text-xs uppercase tracking-widest mb-2">
                        <span>{p.l}</span>
                        <span className="font-bold">{p.v} orders</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", p.c)} 
                          style={{ width: `${orders.length ? (p.v / orders.length) * 100 : 0}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block w-px h-32 bg-border" />
                <div className="hidden md:block flex-shrink-0 text-center px-10">
                   <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Most Popular</p>
                   <p className="font-serif text-xl text-primary">
                      {orders.filter(o => o.paymentMethod === 'Online').length >= orders.filter(o => o.paymentMethod === 'COD').length ? "Online" : "COD"}
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((c) => (
              <div key={c} className="bg-card border border-border p-6 gold-frame">
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3">Category</p>
                <h3 className="font-serif text-2xl mb-2">{CATEGORY_META[c].label}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {items.filter((p) => p.category === c).length} pieces
                </p>
                <button 
                  onClick={() => { setFilter(c); setTab("products"); }}
                  className="text-xs uppercase tracking-[0.2em] text-foreground border-b border-primary/40 pb-1 hover:text-primary transition-colors"
                >
                  Manage Pieces →
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-card border border-border p-8 gold-frame">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/60">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Instagram size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl">Social Integration</h2>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Manage live numbers and connections</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Followers</label>
                  <input 
                    className="w-full bg-muted border border-border p-3 text-lg font-serif focus:ring-1 focus:ring-primary outline-none" 
                    value={settings.instagramFollowers}
                    onChange={(e) => setSettings({ ...settings, instagramFollowers: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Reels / Posts</label>
                  <input 
                    className="w-full bg-muted border border-border p-3 text-lg font-serif focus:ring-1 focus:ring-primary outline-none" 
                    value={settings.instagramPosts}
                    onChange={(e) => setSettings({ ...settings, instagramPosts: e.target.value })}
                  />
                </div>
                <div className="space-y-2 group">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Saved Pieces</label>
                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold animate-pulse">Live Site Data</span>
                  </div>
                  <div className="relative">
                    <input 
                      className="w-full bg-muted/50 border border-border p-3 text-lg font-serif focus:ring-1 focus:ring-primary outline-none pr-20" 
                      value={settings.instagramSaved}
                      onChange={(e) => setSettings({ ...settings, instagramSaved: e.target.value })}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">
                      Real: {settings.realWishlistCount}
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground italic">Manual override (Real count from site: {settings.realWishlistCount})</p>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-border/60">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Instagram Access Token (Optional)</label>
                    <a href="https://developers.facebook.com/" target="_blank" className="text-[9px] text-primary hover:underline uppercase tracking-widest">How to get token?</a>
                  </div>
                  <input 
                    type="password"
                    placeholder="Enter Meta Developer Token for Auto-Sync"
                    className="w-full bg-muted border border-border p-3 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    value={settings.instagramAccessToken}
                    onChange={(e) => setSettings({ ...settings, instagramAccessToken: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={async () => {
                      try {
                        await api.put("/site-settings", settings);
                        toast.success("Settings saved successfully");
                      } catch (e) {
                        toast.error("Failed to save settings");
                      }
                    }}
                    className="flex-1 bg-foreground text-background py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-primary transition-all shadow-lg"
                  >
                    Save Changes
                  </button>
                  
                  <button 
                    disabled={!settings.instagramAccessToken || syncing}
                    onClick={async () => {
                      setSyncing(true);
                      try {
                        const { data } = await api.post("/site-settings/sync");
                        setSettings(data);
                        toast.success("Live stats synced from Instagram!");
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || "Sync failed. Check your token.");
                      } finally {
                        setSyncing(false);
                      }
                    }}
                    className="flex-1 border border-primary text-primary py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    {syncing ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                    {syncing ? "Syncing..." : "Sync Live Stats"}
                  </button>
                </div>
                
                <p className="text-[9px] text-muted-foreground text-center italic mt-4">
                  * Live Sync requires an Instagram Business account connected to a Meta App Token.
                </p>
              </div>
            </div>
          </div>
        )}

        {deletingReservationId && (
          <div className="fixed inset-0 z-[60] bg-foreground/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border border-border max-w-sm w-full p-8 text-center gold-frame animate-scale-in">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="font-serif text-2xl mb-2">Remove Request?</h3>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest leading-relaxed mb-8">
                Are you sure you want to delete this visit request? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingReservationId(null)} 
                  className="flex-1 py-3 border border-border text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteReservation(deletingReservationId)} 
                  className="flex-1 py-3 bg-destructive text-white text-[10px] uppercase tracking-[0.2em] hover:bg-destructive/80 transition-colors shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingId && (
          <div className="fixed inset-0 z-[60] bg-foreground/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border border-border max-w-sm w-full p-8 text-center gold-frame animate-scale-in">
              <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="font-serif text-2xl mb-2">Remove Piece?</h3>
              <p className="text-muted-foreground text-xs uppercase tracking-widest leading-relaxed mb-8">
                Are you sure you want to remove this piece from your collection? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingId(null)} 
                  className="flex-1 py-3 border border-border text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => onDelete(deletingId)} 
                  className="flex-1 py-3 bg-destructive text-white text-[10px] uppercase tracking-[0.2em] hover:bg-destructive/80 transition-colors shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <ProductForm 
            initial={editing} 
            onSave={onSave} 
            onClose={() => { setShowForm(false); setEditing(null); }} 
          />
        )}
      </div>
    </div>
  );
};

const ProductForm = ({
  initial,
  onClose,
  onSave,
}: {
  initial: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) => {
  const [form, setForm] = useState<Product>(
    initial ? { 
      ...initial, 
      outOfStockSizes: initial.outOfStockSizes || [],
      isSale: initial.isSale ?? false,
      isFestive: initial.isFestive ?? false,
      isNewProduct: initial.isNewProduct ?? false,
      reelVideo: initial.reelVideo || "",

    } : {
      id: "",
      name: "",
      price: 0,
      image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1920",
      category: "dresses",
      description: "",
      fabric: "",
      outOfStockSizes: [],
      isOutOfStock: false,
      isSale: false,
      isFestive: false,
      isNewProduct: false,
      stock: 10,
      reelVideo: ""
    }
  );
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm({ ...form, image: data.url });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoUploading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const { data } = await api.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm({ ...form, reelVideo: data.url });
      toast.success("Reel video uploaded successfully");
    } catch (error) {
      toast.error("Video upload failed");
    } finally {
      setVideoUploading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-2xl">{initial ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="hover:text-primary"><X size={18} /></button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onSave(form); }}
          className="p-6 space-y-5"
        >
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₹)">
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="input" />
            </Field>
            <Field label="Original Price (optional)">
              <input type="number" value={form.originalPrice ?? ""} onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? +e.target.value : undefined })} className="input" />
            </Field>
          </div>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_META[c].label}</option>
              ))}
            </select>
          </Field>
          <Field label="Fabric">
            <input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tag (optional)">
              <input value={form.tag ?? ""} onChange={(e) => setForm({ ...form, tag: e.target.value || undefined })} className="input" />
            </Field>
            <Field label="Stock Quantity">
              <input type="number" value={form.stock ?? 0} onChange={(e) => setForm({ ...form, stock: +e.target.value })} className="input" />
            </Field>
          </div>

          <div className="bg-muted/30 p-5 border border-border space-y-5 gold-frame-thin">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Collection Management</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <label className="flex items-center gap-3 p-3 bg-card border border-border cursor-pointer hover:border-primary transition-colors">
                <input 
                  type="checkbox" 
                  checked={form.isNewProduct} 
                  onChange={(e) => setForm({ ...form, isNewProduct: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold">New Arrival</span>
                  <span className="text-[9px] text-muted-foreground italic">Add to New Arrivals</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-card border border-border cursor-pointer hover:border-primary transition-colors">
                <input 
                  type="checkbox" 
                  checked={form.isFestive} 
                  onChange={(e) => setForm({ ...form, isFestive: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Festive Edit</span>
                  <span className="text-[9px] text-muted-foreground italic">Show in Festive section</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-card border border-border cursor-pointer hover:border-destructive transition-colors col-span-2">
                <input 
                  type="checkbox" 
                  checked={form.isOutOfStock} 
                  onChange={(e) => setForm({ ...form, isOutOfStock: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-destructive focus:ring-destructive"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-destructive">Sold Out</span>
                  <span className="text-[9px] text-muted-foreground italic">Hide from shop</span>
                </div>
              </label>
            </div>

            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4 font-bold">Mark Specific Sizes as Sold Out (Slashed)</p>
              <div className="flex flex-wrap gap-3">
                {["XS", "S", "M", "L", "XL", "XXL"].map(size => {
                  const isSoldOut = form.outOfStockSizes?.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const current = form.outOfStockSizes || [];
                        const next = isSoldOut 
                          ? current.filter(s => s !== size)
                          : [...current, size];
                        setForm({ ...form, outOfStockSizes: next });
                      }}
                      className={cn(
                        "w-12 h-12 border text-[10px] font-bold transition-all relative overflow-hidden",
                        isSoldOut 
                          ? "bg-destructive/10 text-destructive border-destructive/40 shadow-inner" 
                          : "bg-card text-foreground border-border hover:border-primary hover:shadow-md"
                      )}
                    >
                      <span className={cn(isSoldOut && "opacity-50")}>{size}</span>
                      {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="w-[140%] h-[1px] bg-destructive/60 rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-muted-foreground mt-4 italic flex items-center gap-1">
                <Sparkles size={10} className="text-primary" />
                Click a size to show it as "Sold Out" on the website.
              </p>
            </div>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input" />
          </Field>
          <Field label="Product Image">
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 border border-border flex-shrink-0 bg-muted overflow-hidden">
                <img src={form.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center justify-center gap-2 border border-dashed border-border p-4 cursor-pointer hover:border-primary transition-colors text-xs uppercase tracking-[0.1em] w-full">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    {uploading ? "Uploading..." : "Upload Photo"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: "" })}
                      className="text-[9px] uppercase tracking-widest text-destructive hover:text-destructive/80 transition-colors flex items-center justify-center gap-1"
                    >
                      <X size={12} /> Remove Photo
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground mt-2">JPG, PNG or WebP. Max 5MB.</p>
              </div>
            </div>
          </Field>
          <Field label="Reel Video (for Mobile UI)">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-24 border border-border flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                  {form.reelVideo ? (
                    <video src={form.reelVideo} className="w-full h-full object-cover" muted />
                  ) : (
                    <Sparkles size={20} className="text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 border border-dashed border-border p-4 cursor-pointer hover:border-primary transition-colors text-xs uppercase tracking-[0.1em] w-full">
                      {videoUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {videoUploading ? "Uploading..." : "Add Reel Video"}
                      <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={videoUploading} />
                    </label>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">MP4 or WebM. Max 10MB.</p>
                </div>
              </div>
              
              {form.reelVideo && (
                <div className="relative aspect-[9/16] w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden border border-primary/20 shadow-xl group">
                  <video 
                    src={form.reelVideo} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    muted 
                    loop 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, reelVideo: "" })}
                      className="bg-destructive text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      Remove Video
                    </button>
                  </div>
                  <div className="absolute top-3 left-3 bg-primary/80 text-white text-[8px] uppercase tracking-widest px-2 py-1 rounded">
                    Reel Preview
                  </div>
                </div>
              )}
            </div>
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-border py-3 text-xs uppercase tracking-[0.2em] hover:border-primary transition-colors">Cancel</button>
            <button type="submit" disabled={uploading} className="flex-1 bg-foreground text-background py-3 text-xs uppercase tracking-[0.2em] hover:bg-primary transition-colors disabled:opacity-50">
              {initial ? "Update Piece" : "Add to Collection"}
            </button>
          </div>
        </form>
      </div>

      <style>{`.input{width:100%;background:transparent;border:1px solid hsl(var(--border));padding:.6rem .75rem;font-size:.875rem;outline:none;transition:border-color .2s}.input:focus{border-color:hsl(var(--primary))}`}</style>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">{label}</span>
    {children}
  </label>
);

export default Admin;
