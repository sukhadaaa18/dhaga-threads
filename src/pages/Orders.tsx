import { useState, useEffect } from "react";
import { ShoppingBag, Package, Truck, CheckCircle, Clock, Loader2, Calendar, MapPin, RefreshCcw, XCircle, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

import { formatINR, formatDate } from "@/data/products";
import { SectionHeading } from "@/components/SectionHeading";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


const Orders = () => {
  const [tab, setTab] = useState<"orders" | "visits">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Return Flow State
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<any>(null);
  const [returnStep, setReturnStep] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState("Refund");
  const [returnPickupDate, setReturnPickupDate] = useState<Date | undefined>(undefined);


  useEffect(() => {
    const loadData = async () => {
      try {
        const [resO, resV] = await Promise.all([
          api.get("/orders/my"),
          api.get("/reservations/my")
        ]);
        setOrders(resO.data);
        setVisits(resV.data);
      } catch (error) {
        console.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openReturnDialog = (order: any) => {
    setSelectedReturnOrder(order);
    setReturnStep(1);
    setReturnReason("");
    setReturnType("Refund");
    setReturnPickupDate(undefined);
    setReturnDialogOpen(true);
  };

  const handleRequestReturn = async () => {
    if (!selectedReturnOrder) return;
    try {
      await api.put(`/orders/${selectedReturnOrder._id}/request-return`, {
        returnReason,
        returnType,
        returnPickupDate
      });
      setReturnStep(4);
      // Reload orders
      const resO = await api.get("/orders/my");
      setOrders(resO.data);
    } catch (error) {
      toast.error("Failed to submit return request");
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing": return <Clock size={18} />;
      case "Shipped": return <Truck size={18} />;
      case "Delivered": return <CheckCircle size={18} />;
      case "Return Requested": return <RefreshCcw size={18} />;
      case "Returned": return <CheckCircle size={18} />;
      case "Return Rejected": return <XCircle size={18} />;

      default: return <Package size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing": return "text-orange-500 bg-orange-50 border-orange-100";
      case "Shipped": return "text-blue-500 bg-blue-50 border-blue-100";
      case "Delivered": return "text-green-500 bg-green-50 border-green-100";
      case "Cancelled": return "text-red-500 bg-red-50 border-red-100";
      case "Return Requested": return "text-purple-500 bg-purple-50 border-purple-100";
      case "Return Approved": return "text-purple-600 bg-purple-100 border-purple-200";
      case "Return Pickup Scheduled": return "text-blue-500 bg-blue-50 border-blue-100";
      case "Return Picked Up": return "text-blue-600 bg-blue-100 border-blue-200";
      case "Refund Processed": return "text-green-600 bg-green-100 border-green-200";
      case "Returned": return "text-green-500 bg-green-50 border-green-100";
      case "Return Rejected": return "text-red-500 bg-red-50 border-red-100";

      case "confirmed": return "text-primary bg-primary/5 border-primary/20";
      case "pending_confirmation": return "text-orange-500 bg-orange-50 border-orange-100";
      default: return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <section className="py-14 md:py-20 bg-background relative overflow-hidden min-h-[80vh]">
      <div className="absolute inset-0 motif-bg" />
      <div className="container relative">
        <SectionHeading eyebrow="Journey of your pieces" title="My Atelier" />

        <div className="flex justify-center gap-4 mb-14">
          <button 
            onClick={() => setTab("orders")}
            className={cn(
              "px-8 py-3 text-[11px] uppercase tracking-[0.2em] border transition-all font-bold flex items-center gap-2",
              tab === "orders" ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:border-primary"
            )}
          >
            <ShoppingBag size={14} /> My Orders
          </button>
          <button 
            onClick={() => setTab("visits")}
            className={cn(
              "px-8 py-3 text-[11px] uppercase tracking-[0.2em] border transition-all font-bold flex items-center gap-2",
              tab === "visits" ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:border-primary"
            )}
          >
            <Calendar size={14} /> Boutique Visits
          </button>
        </div>

        {tab === "orders" ? (
          <div className="max-w-4xl mx-auto space-y-10">
            {orders.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag className="mx-auto text-muted-foreground/30 mb-6" size={60} strokeWidth={1} />
                <p className="font-serif italic text-2xl text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-card border border-border/60 gold-frame overflow-hidden animate-fade-in shadow-sm">
                  {/* Header */}
                  <div className="p-6 border-b border-border/60 bg-secondary/10 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Order Date</p>
                      <p className="font-serif text-lg">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Amount</p>
                      <p className="font-serif text-lg text-primary">{formatINR(order.totalPrice)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={cn(
                        "px-4 py-2 border rounded-full flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-bold",
                        getStatusColor(order.status)
                      )}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                      {order.status === 'Delivered' && (
                        <button 
                          onClick={() => openReturnDialog(order)}
                          className="text-[10px] uppercase tracking-widest text-primary border-b border-primary/40 hover:text-primary/80 pb-0.5 transition-colors"
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Return Tracker */}
                  {(order.status.startsWith('Return') || order.status === 'Refund Processed') && order.status !== 'Return Rejected' && (
                    <div className="p-6 bg-muted/20 border-b border-border/60">
                      <div className="flex items-center justify-between max-w-2xl mx-auto px-4 relative">
                        {['Return Requested', 'Return Approved', 'Return Pickup Scheduled', 'Return Picked Up', 'Refund Processed'].map((step, idx, arr) => {
                          const currentIndex = arr.indexOf(order.status);
                          const isCompleted = currentIndex >= idx;
                          const isCurrent = currentIndex === idx;
                          return (
                            <div key={step} className="flex flex-col items-center relative z-10 w-full text-center">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center border-2 mb-2 transition-colors relative z-10",
                                isCompleted ? "bg-primary border-primary text-background" : "bg-card border-border text-muted-foreground",
                                isCurrent && "ring-4 ring-primary/20"
                              )}>
                                {isCompleted ? <CheckCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                              </div>
                              <span className={cn(
                                "text-[9px] uppercase tracking-wider font-bold absolute top-8 w-24 left-1/2 -translate-x-1/2",
                                isCompleted ? "text-primary" : "text-muted-foreground"
                              )}>{step.replace('Return ', '')}</span>
                            </div>
                          );
                        })}
                        {/* Connecting Line */}
                        <div className="absolute top-3 left-[10%] right-[10%] h-[2px] bg-border -z-0" />
                        <div 
                          className="absolute top-3 left-[10%] h-[2px] bg-primary -z-0 transition-all duration-500"
                          style={{ 
                            width: (() => {
                              const steps = ['Return Requested', 'Return Approved', 'Return Pickup Scheduled', 'Return Picked Up', 'Refund Processed'];
                              const idx = steps.indexOf(order.status);
                              if (idx === -1) return '0%';
                              return `${(idx / (steps.length - 1)) * 80}%`;
                            })()
                          }}
                        />
                      </div>
                      <div className="h-6" /> {/* Spacer for absolute text */}
                    </div>
                  )}


                  {/* Items */}
                  <div className="p-6 space-y-6">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-16 h-20 bg-muted border border-border flex-shrink-0 flex items-center justify-center text-muted-foreground/30">
                           <Package size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif text-lg leading-tight">{item.name}</h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-[0.1em] mt-1">
                            Qty: {item.quantity} · {formatINR(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10">
            {visits.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="mx-auto text-muted-foreground/30 mb-6" size={60} strokeWidth={1} />
                <p className="font-serif italic text-2xl text-muted-foreground">No boutique visit requests yet.</p>
              </div>
            ) : (
              visits.map((visit) => (
                <div key={visit._id} className="bg-card border border-border/60 gold-frame overflow-hidden animate-fade-in shadow-sm">
                   <div className="p-6 border-b border-border/60 bg-secondary/10 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-muted border border-border flex-shrink-0">
                        <img src={visit.product?.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Selected Garment</p>
                        <h4 className="font-serif text-xl">{visit.product?.name}</h4>
                      </div>
                    </div>
                    <div className={cn(
                      "px-4 py-2 border rounded-full text-[10px] uppercase tracking-[0.15em] font-bold",
                      getStatusColor(visit.status)
                    )}>
                      {visit.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="p-6 grid sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="text-primary mt-1" size={18} />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Visit Date</p>
                        <p className="font-medium">{formatDate(visit.startDate)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Visit valid until {formatDate(visit.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="text-primary mt-1" size={18} />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Boutique Location</p>
                        <p className="font-medium">The DHAGA Atelier, Kolhapur</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Shop no. 5, Muktashram Apartment, Rajarampuri 7th Lane Main Road, Kolhapur 416008</p>
                      </div>
                    </div>
                  </div>
                  {visit.status === 'pending_confirmation' && (
                    <div className="px-6 pb-6 pt-2">
                       <div className="bg-primary/5 border border-primary/20 p-4 flex items-center gap-4">
                          <Clock size={20} className="text-primary animate-pulse" />
                          <p className="text-[11px] text-muted-foreground italic">
                            Our styling concierge will call you shortly to confirm this visit. Once confirmed, this piece will be held exclusively for you.
                          </p>
                       </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Return Dialog */}
        <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
          <DialogContent className="sm:max-w-[500px] gold-frame">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Return Request</DialogTitle>
            </DialogHeader>
            
            {returnStep === 1 && (
              <div className="space-y-6 py-4">
                <p className="text-sm text-muted-foreground">Why are you returning this item?</p>
                <RadioGroup value={returnReason} onValueChange={setReturnReason}>
                  {['Damaged Product', 'Wrong Item Received', 'Size/Fit Issue', 'Quality Not Expected', 'Missing Accessories', 'Changed Mind', 'Other'].map(reason => (
                    <div className="flex items-center space-x-2" key={reason}>
                      <RadioGroupItem value={reason} id={`reason-${reason}`} />
                      <Label htmlFor={`reason-${reason}`}>{reason}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {returnReason === 'Other' && (
                  <Textarea placeholder="Please specify..." className="mt-2 text-sm" />
                )}
                <div className="flex justify-end pt-4">
                  <Button disabled={!returnReason} onClick={() => setReturnStep(2)} className="uppercase tracking-widest text-xs">
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {returnStep === 2 && (
              <div className="space-y-6 py-4">
                <p className="text-sm text-muted-foreground">What would you like?</p>
                <RadioGroup value={returnType} onValueChange={setReturnType}>
                  {['Refund', 'Replacement', 'Exchange'].map(type => (
                    <div className="flex items-center space-x-2" key={type}>
                      <RadioGroupItem value={type} id={`type-${type}`} />
                      <Label htmlFor={`type-${type}`}>{type}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setReturnStep(1)} className="uppercase tracking-widest text-xs">Back</Button>
                  <Button onClick={() => setReturnStep(3)} className="uppercase tracking-widest text-xs">Next Step</Button>
                </div>
              </div>
            )}

            {returnStep === 3 && (
              <div className="space-y-6 py-4">
                <p className="text-sm text-muted-foreground">When should we pick it up?</p>
                <div className="flex justify-center border p-2 bg-card">
                  <CalendarComponent
                    mode="single"
                    selected={returnPickupDate}
                    onSelect={setReturnPickupDate}
                    disabled={(date) => date < new Date()}
                  />
                </div>
                {selectedReturnOrder && (
                  <div className="bg-muted/30 p-4 border border-border">
                    <p className="text-xs uppercase tracking-widest text-primary mb-2">Pickup Address</p>
                    <p className="text-sm font-medium">{selectedReturnOrder.address?.fullName}</p>
                    <p className="text-xs text-muted-foreground">{selectedReturnOrder.address?.street}, {selectedReturnOrder.address?.city} - {selectedReturnOrder.address?.pincode}</p>
                  </div>
                )}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setReturnStep(2)} className="uppercase tracking-widest text-xs">Back</Button>
                  <Button disabled={!returnPickupDate} onClick={handleRequestReturn} className="uppercase tracking-widest text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                    Submit Request
                  </Button>
                </div>
              </div>
            )}
            
            {returnStep === 4 && (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-serif text-2xl">Request Submitted</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Your pickup is scheduled. Our delivery partner will contact you shortly.
                </p>
                <Button onClick={() => setReturnDialogOpen(false)} className="mt-4 uppercase tracking-widest text-xs">
                  Done
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </section>
  );
};

export default Orders;
