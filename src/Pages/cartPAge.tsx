import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { RootState } from "../App/store";
import { clearCart, removeFromCart, updateQuantity } from "../features/Cart/cartSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useGetProductAvailabilityQuery } from "../features/Apis/Inventory.Api";
import { 
  Trash2, Plus, Minus, 
  ShoppingBag, Store, Truck, 
  Smartphone, ArrowRight, Loader2,
  ShieldCheck, Zap, CheckCircle2, X 
} from "lucide-react";
import { useGetShippingRatesQuery } from "../features/Apis/ShippingRates.Api";
import { useCreateOrderMutation } from "../features/Apis/Orders.Api"; 
import { useInitiateStkPushMutation, useGetPaymentsByOrderIdQuery } from "../features/Apis/Mpesa.Api"; 
import toast from "react-hot-toast";

/* --- SUB-COMPONENT: REFINED ITEM ROW --- */
const CartItemRow = ({ item, onStockError }: { item: any, onStockError: (msg: React.ReactNode) => void }) => {
  const dispatch = useDispatch();
  const { data: inventoryData, isFetching } = useGetProductAvailabilityQuery(item.id);

  const stockLevel = useMemo(() => {
    if (!inventoryData?.data) return item.countInStock || 0;
    const branchInv = inventoryData.data.find((v: any) => v.branchId === item.branchId);
    return branchInv ? branchInv.quantity : 0;
  }, [inventoryData, item.branchId]);

  const handleUpdate = (change: number) => {
    const nextQty = item.quantity + change;
    if (nextQty < 1) return;
    if (change > 0 && nextQty > stockLevel) {
        onStockError(
            <div className="flex flex-col items-center gap-2">
                <span className="text-[#C9A24D] font-black text-[10px] uppercase tracking-widest">Inventory Limit</span>
                <p className="text-white/60 text-[9px] uppercase">Only {stockLevel} units reserved for {item.branchName}</p>
            </div>
        );
        return;
    }
    dispatch(updateQuantity({ cartItemId: item.cartItemId, change }));
  };

  return (
    <div className="py-10 flex flex-col md:flex-row gap-10 group relative border-b border-white/5 last:border-0">
      <div className="relative w-full md:w-40 h-52 bg-[#0A0A0A] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <img src={item.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={item.name} />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
             <p className="text-[8px] font-black text-[#C9A24D] uppercase tracking-tighter">{item.branchName}</p>
          </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between py-2">
          <div className="flex justify-between items-start">
              <div>
                  <p className="text-[9px] text-[#C9A24D] font-black uppercase tracking-[0.3em] mb-2">Eau De Parfum</p>
                  <h3 className="text-2xl font-serif italic text-white tracking-tight uppercase mb-2">{item.name}</h3>
                  <div className="flex items-center gap-4 text-white/30 text-[9px] font-mono">
                      <span>REF: {item.id.slice(-8).toUpperCase()}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full"/>
                      <span className={stockLevel < 5 ? 'text-amber-500' : 'text-green-500'}>
                        {stockLevel < 5 ? `ONLY ${stockLevel} LEFT` : 'IN STOCK'}
                      </span>
                  </div>
              </div>
              <button onClick={() => dispatch(removeFromCart(item.cartItemId))} className="p-3 bg-white/5 rounded-full text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
                  <Trash2 size={16} />
              </button>
          </div>

          <div className="flex justify-between items-end mt-8">
              <div className="space-y-4">
                  <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">Quantity Selection</p>
                  <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-2xl p-1 w-fit">
                      <button onClick={() => handleUpdate(-1)} className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors"><Minus size={14}/></button>
                      <span className="w-12 text-center text-sm font-mono font-bold text-[#C9A24D]">{item.quantity}</span>
                      <button onClick={() => handleUpdate(1)} disabled={isFetching} className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white">
                        {isFetching ? <Loader2 size={14} className="animate-spin text-[#C9A24D]" /> : <Plus size={14}/>}
                      </button>
                  </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-1">Total Valuation</p>
                <p className="text-3xl font-mono font-bold text-white tracking-tighter italic">
                    <span className="text-sm font-light mr-2 text-white/40">KES</span>
                    {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
          </div>
      </div>
    </div>
  );
};

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cart = useSelector((state: RootState) => state.cart.items);
  const authUser = useSelector((state: RootState) => state.auth?.user); 
  
  const cartBranchIds = useMemo(() => Array.from(new Set(cart.map(item => item.branchId))), [cart]);
  const { data: shippingRates } = useGetShippingRatesQuery(cartBranchIds);
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [initiateStkPush, { isLoading: isInitiatingMpesa }] = useInitiateStkPushMutation();

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [selectedAreaName, setSelectedAreaName] = useState<string>(""); 
  const [streetAddress, setStreetAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [inventoryError, setInventoryError] = useState<{id: string, msg: React.ReactNode} | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  // Polling logic for real-time status updates
  const { data: paymentStatus, refetch: manualRefetch } = useGetPaymentsByOrderIdQuery(activeOrderId as string, {
    pollingInterval: 3000,
    skip: !activeOrderId || !showPaymentModal || isPaid,
  });

  useEffect(() => {
    if (paymentStatus && paymentStatus.some((p: any) => p.status === 'success')) {
      setIsPaid(true);
      toast.success("Payment Received! Finalizing Acquisition...");
      const timer = setTimeout(() => {
        dispatch(clearCart());
        setShowPaymentModal(false);
        navigate("/");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, dispatch, navigate]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const shippingDetails = useMemo(() => {
    if (deliveryMethod === "pickup" || !selectedAreaName || !shippingRates) return { total: 0 };
    let total = 0;
    const uniqueBranches = Array.from(new Set(cart.map(i => i.branchId)));
    uniqueBranches.forEach(bId => {
      const rate = shippingRates.find(r => String(r.branchId) === String(bId) && r.areaName === selectedAreaName);
      if (rate) total += parseFloat(rate.fee);
    });
    return { total };
  }, [deliveryMethod, cart, shippingRates, selectedAreaName]);

  const totalAmount = subtotal + shippingDetails.total;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.id) return toast.error("Authentication required.");
    if (deliveryMethod === "delivery" && !selectedAreaName) return toast.error("Logistics: Area missing.");
    if (!phoneNumber) return toast.error("Enter M-Pesa contact.");

    const loadId = toast.loading("Processing Order thru Secure Gateway...");

    try {
      const orderPayload = {
        userId: authUser.id,
        branchId: cart[0]?.branchId,
        orderType: deliveryMethod,
        salesChannel: "website",
        customerPhone: phoneNumber,
        shippingAddress: streetAddress || "N/A - Boutique Pickup",
        shippingArea: selectedAreaName || "Boutique Location",
        subtotal,
        shippingFee: shippingDetails.total,
        totalAmount,
        paymentMethod: "mpesa",
        payment_status: "pending",
        items: cart.map(item => ({
          productId: item.id,
          variantId: item.variantId || null,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        }))
      };

      const res = await createOrder(orderPayload).unwrap();
      const newOrderId = res.data?.id || res.id;
      setActiveOrderId(newOrderId);

      toast.loading("Invoking M-Pesa Prompt...", { id: loadId });
      
      await initiateStkPush({
        amount: totalAmount,
        phoneNumber: phoneNumber.replace(/\D/g, ""), 
        orderId: newOrderId,
        userId: authUser.id
      }).unwrap();

      toast.success("Manifest Generated & Sent to Phone", { id: loadId });
      setShowPaymentModal(true);
    } catch (err: any) {
      toast.error(err?.data?.errorMessage || "Registry Sync Failed", { id: loadId });
    }
  };

  const triggerManualCheck = () => {
    toast.loading("Interrogating Gateway...");
    manualRefetch();
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#050505] min-h-screen text-white flex flex-col items-center justify-center font-sans">
        <Navbar />
        <ShoppingBag size={60} className="text-white/5 mb-6" />
        <h2 className="text-3xl font-serif italic mb-10 tracking-widest text-white/40 uppercase">Your tray is vacant</h2>
        <Link to="/" className="border border-[#C9A24D] text-[#C9A24D] px-14 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.5em] hover:bg-[#C9A24D] hover:text-black transition-all">Explore the Collection</Link>
      </div>
    );
  }

  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#C9A24D]/30">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-48 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          <div className="lg:col-span-8 space-y-16">
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#C9A24D]">
                    <ShieldCheck size={14}/>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Verified Inventory</span>
                </div>
                <h1 className="text-7xl md:text-8xl font-serif italic text-white tracking-tighter">Your <span className="text-[#C9A24D] not-italic">Tray</span></h1>
            </header>

            <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] px-10 py-6 backdrop-blur-sm">
              {cart.map((item) => (
                <div key={item.cartItemId} className="relative">
                  {inventoryError?.id === item.cartItemId && (
                      <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-3xl flex items-center justify-center rounded-[2.5rem] border border-[#C9A24D]/20 px-12 text-center">
                          <div className="animate-in zoom-in duration-300">
                             {inventoryError.msg} 
                             <button onClick={() => setInventoryError(null)} className="mt-10 text-[10px] text-black bg-[#C9A24D] uppercase font-black px-10 py-4 rounded-full tracking-widest hover:bg-white transition-all">Update Selection</button>
                          </div>
                      </div>
                  )}
                  <CartItemRow item={item} onStockError={(msg) => setInventoryError({ id: item.cartItemId, msg })} />
                </div>
              ))}
            </div>

            <section className="bg-gradient-to-br from-[#0A0A0A] to-[#050505] p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
                <div className="flex items-center gap-5 mb-14">
                    <div className="w-12 h-12 bg-[#C9A24D]/10 rounded-full flex items-center justify-center text-[#C9A24D]"><Truck size={22} /></div>
                    <h2 className="text-4xl font-serif italic uppercase tracking-tight">Fulfillment <span className="text-[#C9A24D] not-italic font-sans font-bold text-sm ml-2 tracking-[0.3em]">Mode</span></h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
                    <button onClick={() => setDeliveryMethod("delivery")} className={`group p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center gap-4 text-center ${deliveryMethod === "delivery" ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/5 opacity-20 hover:opacity-100'}`}>
                        <Truck size={28} className={deliveryMethod === "delivery" ? 'text-[#C9A24D]' : 'text-white'} />
                        <p className="text-xs font-black uppercase tracking-widest">Doorstep Delivery</p>
                    </button>
                    <button onClick={() => setDeliveryMethod("pickup")} className={`group p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center gap-4 text-center ${deliveryMethod === "pickup" ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/5 opacity-20 hover:opacity-100'}`}>
                        <Store size={28} className={deliveryMethod === "pickup" ? 'text-[#C9A24D]' : 'text-white'} />
                        <p className="text-xs font-black uppercase tracking-widest">Boutique Pickup</p>
                    </button>
                </div>

                {deliveryMethod === "delivery" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-4">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[0.3em] ml-4">Dispatch Destination</label>
                            <select className="w-full bg-black border border-white/5 p-7 rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#C9A24D] appearance-none" value={selectedAreaName} onChange={(e) => setSelectedAreaName(e.target.value)}>
                                <option value="">SELECT REGION...</option>
                                {Array.from(new Set(shippingRates?.map(r => r.areaName))).map(area => (<option key={area as string} value={area as string}>{String(area).toUpperCase()}</option>))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[0.3em] ml-4">Street / Landmark</label>
                            <textarea placeholder="STREET, BUILDING, LANDMARK..." className="w-full bg-black border border-white/5 p-7 rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none focus:border-[#C9A24D] min-h-[90px] resize-none text-white" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
                        </div>
                    </div>
                )}
            </section>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-40 h-fit">
            <div className="bg-[#0A0A0A] p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-[#C9A24D] text-center">Checkout Summary</h3>
                <div className="space-y-6">
                    <div className="flex justify-between text-[10px] text-white/40 font-black uppercase tracking-widest">
                        <span>Merchandise</span>
                        <span className="font-mono text-white">KES {subtotal.toLocaleString()}</span>
                    </div>
                    {deliveryMethod === "delivery" && (
                        <div className="flex justify-between text-[10px] text-white/40 font-black uppercase tracking-widest">
                            <span>Logistics</span>
                            <span className="font-mono text-white">KES {shippingDetails.total.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="h-[1px] bg-white/5 my-8" />
                    <div className="text-center py-6">
                        <p className="text-6xl font-bold text-white font-mono tracking-tighter italic">
                            <span className="text-sm font-light mr-2 opacity-20">KES</span>
                            {totalAmount.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C9A24D]"><Smartphone size={18}/></div>
                        <input type="tel" placeholder="07XX XXX XXX" className="w-full bg-black border border-white/5 py-7 pl-16 pr-6 rounded-[2rem] text-center text-xs font-mono outline-none focus:border-[#C9A24D] text-white" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </div>

                    <button onClick={() => setAgreedToTerms(!agreedToTerms)} className={`w-full p-5 rounded-[2rem] border text-[8px] font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 ${agreedToTerms ? 'border-[#C9A24D] text-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/5 text-white/20'}`}>
                        {agreedToTerms && <CheckCircle2 size={12}/>}
                        Accept Terms of Acquisition
                    </button>

                    <button 
                        onClick={handlePlaceOrder} 
                        disabled={!agreedToTerms || isCreatingOrder || isInitiatingMpesa} 
                        className="group w-full bg-white text-black font-black py-8 rounded-[2.5rem] uppercase text-[11px] tracking-[0.5em] flex items-center justify-center gap-3 hover:bg-[#C9A24D] transition-all disabled:opacity-20"
                    >
                        {(isCreatingOrder || isInitiatingMpesa) ? <Loader2 size={18} className="animate-spin" /> : <>Complete Acquisition <ArrowRight size={18}/></>}
                    </button>
                    
                    <div className="flex items-center justify-center gap-4 text-white/20">
                        <Zap size={10} />
                        <span className="text-[7px] uppercase tracking-[0.5em] font-black">Encrypted SSL</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-[50px] px-6">
            <div className="bg-[#0A0A0A] p-16 rounded-[4rem] border border-[#C9A24D]/20 w-full max-w-lg text-center shadow-[0_0_100px_rgba(201,162,77,0.1)] relative">
                {!isPaid && (
                   <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-all"><X size={20}/></button>
                )}
                
                {isPaid ? (
                  <div className="animate-in zoom-in duration-500">
                    <CheckCircle2 className="text-[#3EB035] mx-auto mb-8" size={80} />
                    <h3 className="text-4xl font-serif italic text-white uppercase tracking-tight mb-4">Acquisition Secured</h3>
                    <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 mb-8 inline-block">
                        <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">M-Pesa Ref</p>
                        <p className="text-sm font-mono text-[#C9A24D] font-bold">
                          {paymentStatus?.find((p: any) => p.status === 'success')?.transactionReference || "VERIFIED"}
                        </p>
                    </div>
                    <p className="text-white/40 text-[9px] uppercase tracking-[0.4em]">Redirecting...</p>
                  </div>
                ) : (
                  <>
                    <Smartphone className="text-[#C9A24D] mx-auto mb-8" size={50} />
                    <h3 className="text-4xl font-serif italic text-white uppercase tracking-tight mb-4">M-Pesa Authorization</h3>
                    <p className="text-white/40 text-[9px] uppercase tracking-[0.4em] mb-4">Registry Ref: {activeOrderId?.slice(0, 8)}</p>
                    <div className="flex items-center justify-center gap-3 text-[#C9A24D] mb-12 animate-pulse">
                       <Loader2 size={14} className="animate-spin"/>
                       <span className="text-[8px] font-black uppercase tracking-widest">Awaiting Daraja Signal...</span>
                    </div>
                    <div className="space-y-6">
                      <button onClick={triggerManualCheck} className="w-full border border-white/5 text-white/40 font-black py-7 rounded-[2rem] uppercase text-[9px] tracking-[0.5em] hover:border-[#C9A24D] hover:text-[#C9A24D] transition-all">Manual Verify</button>
                      <button onClick={() => {setShowPaymentModal(false); navigate("/");}} className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">View Receipt Later</button>
                    </div>
                  </>
                )}
            </div>
        </div>
      )}
      <Footer />
    </main>
  );
};

export default CartPage;