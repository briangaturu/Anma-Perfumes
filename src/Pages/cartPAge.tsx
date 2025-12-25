import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { RootState } from "../App/store";
import { clearCart, removeFromCart, updateQuantity } from "../features/Cart/cartSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Trash2, Plus, Minus, ShieldCheck, MapPin, 
  ShoppingBag, Store, Truck, ArrowRight, CheckCircle2,
  Info, CreditCard
} from "lucide-react";

// --- SHIPPING CONFIGURATION ---
const BRANCHES = [
  { 
    id: "nyahururu_main", 
    name: "Nyahururu Main Branch",
    locations: [
      { area: "Tairi Mbili", fee: 50 },
      { area: "Nyahururu Town", fee: 30 },
      { area: "Laikipia University", fee: 150 },
      { area: "Other", fee: 200 }
    ]
  },
  { 
    id: "ubc_laikipia", 
    name: "UBC Branch (Laikipia Uni)",
    locations: [
      { area: "Laikipia University", fee: 0 },
      { area: "Nyumba Tatu", fee: 20 },
      { area: "Nyahururu Town", fee: 70 },
      { area: "Tairi Mbili", fee: 100 },
      { area: "Other", fee: 150 }
    ]
  }
];

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state: RootState) => state.cart.items);
  
  // --- STATE ---
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [selectedArea, setSelectedArea] = useState(BRANCHES[0].locations[0]);
  const [streetAddress, setStreetAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Bag, 2: Details

  // --- CALCULATIONS ---
  const subtotal = useMemo(() => 
    cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), 
  [cart]);

  const shippingCost = useMemo(() => {
    if (deliveryMethod === "pickup" || cart.length === 0) return 0;
    return selectedArea.fee;
  }, [deliveryMethod, cart, selectedArea]);

  const total = subtotal + shippingCost;

  useEffect(() => {
    setSelectedArea(selectedBranch.locations[0]);
  }, [selectedBranch]);

  const handleMpesaPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.match(/^(07|01|254)\d{8}$/)) {
        return alert("Please enter a valid M-Pesa number");
    }
    setShowMpesaModal(true);
  };

  const confirmPayment = () => {
    // Simulated Logic
    alert("STK Push sent!");
    dispatch(clearCart());
    navigate("/");
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#0B0B0B] min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="text-white/20" />
          </div>
          <h2 className="text-3xl font-light italic mb-2 tracking-tight">Your bag is empty</h2>
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-8">Discover our latest collections</p>
          <Link to="/" className="bg-[#C9A24D] text-black px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">
            Start Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <main className="bg-[#0B0B0B] min-h-screen text-white font-sans selection:bg-[#C9A24D]/30">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        {/* --- LUXURY STEPPER --- */}
        <div className="flex items-center justify-center mb-16 space-x-4">
            <div className={`flex items-center gap-2 ${activeStep >= 1 ? 'text-[#C9A24D]' : 'text-white/20'}`}>
                <span className="text-[10px] font-black tracking-widest uppercase">01 Review Bag</span>
            </div>
            <div className="w-12 h-[1px] bg-white/10" />
            <div className={`flex items-center gap-2 ${activeStep >= 2 ? 'text-[#C9A24D]' : 'text-white/20'}`}>
                <span className="text-[10px] font-black tracking-widest uppercase">02 Delivery Details</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 1. PRODUCT LIST */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <h1 className="text-5xl font-light italic tracking-tight">Your <span className="text-[#C9A24D] not-italic font-medium">Bag</span></h1>
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{cart.length} Items Selected</span>
              </div>
              
              <div className="divide-y divide-white/5 border-y border-white/5">
                {cart.map((item) => (
                  <div key={item.id} className="py-8 flex flex-col sm:flex-row gap-8 group">
                    <div className="relative w-full sm:w-32 h-40 bg-[#141414] rounded-2xl overflow-hidden border border-white/5">
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight mb-1">{item.name}</h3>
                          <p className="text-[10px] text-[#C9A24D] font-black uppercase tracking-widest">Fragrance House / Authentic</p>
                        </div>
                        <button onClick={() => dispatch(removeFromCart(item.id))} className="text-white/20 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-6">
                        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                          <button onClick={() => dispatch(updateQuantity({id: item.id, change: -1}))} className="w-8 h-8 flex items-center justify-center hover:text-[#C9A24D]"><Minus size={12}/></button>
                          <span className="w-8 text-center text-xs font-mono font-bold">{item.quantity}</span>
                          <button onClick={() => dispatch(updateQuantity({id: item.id, change: 1}))} className="w-8 h-8 flex items-center justify-center hover:text-[#C9A24D]"><Plus size={12}/></button>
                        </div>
                        <p className="text-xl font-mono font-bold text-white">KES {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. FULFILLMENT FORM */}
            <section className="bg-[#111] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A24D]" />
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 bg-[#C9A24D]/10 rounded-full flex items-center justify-center text-[#C9A24D]">
                    <MapPin size={20} />
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Delivery Details</h2>
              </div>

              {/* Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <button 
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`p-6 rounded-2xl border flex flex-col gap-3 transition-all ${deliveryMethod === "delivery" ? 'border-[#C9A24D] bg-[#C9A24D]/5 shadow-[0_0_20px_rgba(201,162,77,0.1)]' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                >
                  <Truck size={24} className={deliveryMethod === "delivery" ? "text-[#C9A24D]" : "text-white"} />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest">Doorstep Delivery</p>
                    <p className="text-[10px] text-white/40 mt-1 uppercase">Reliable & Secure</p>
                  </div>
                </button>
                <button 
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`p-6 rounded-2xl border flex flex-col gap-3 transition-all ${deliveryMethod === "pickup" ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                >
                  <Store size={24} className={deliveryMethod === "pickup" ? "text-[#C9A24D]" : "text-white"} />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest">Store Pickup</p>
                    <p className="text-[10px] text-[#C9A24D] mt-1 uppercase">Always Free</p>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] ml-1">Dispatching From</label>
                  <select 
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl text-sm focus:border-[#C9A24D] outline-none transition-all appearance-none cursor-pointer"
                    onChange={(e) => setSelectedBranch(BRANCHES.find(b => b.id === e.target.value) || BRANCHES[0])}
                  >
                    {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                {deliveryMethod === "delivery" && (
                  <div className="space-y-3 animate-in slide-in-from-right-4 duration-500">
                    <label className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] ml-1">Your Exact Area</label>
                    <select 
                      className="w-full bg-black border border-white/10 p-5 rounded-2xl text-sm focus:border-[#C9A24D] outline-none transition-all"
                      onChange={(e) => setSelectedArea(selectedBranch.locations.find(l => l.area === e.target.value) || selectedBranch.locations[0])}
                    >
                      {selectedBranch.locations.map(l => (
                        <option key={l.area} value={l.area}>{l.area} (KES {l.fee})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {deliveryMethod === "delivery" && (
                <div className="mt-8 space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                  <label className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em] ml-1">Address Line / Landmark</label>
                  <textarea 
                    rows={2}
                    placeholder="E.g. Laikipia University Gate B, House No. 4, or Landmark..."
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl text-sm focus:border-[#C9A24D] outline-none transition-all resize-none"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-[#111] p-10 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                <ShieldCheck size={150} />
              </div>

              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A24D] mb-10 border-b border-white/5 pb-4">Order Summary</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between text-xs text-white/40 font-bold uppercase tracking-widest">
                  <span>Bag Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40 font-bold uppercase tracking-widest">
                  <span>Shipping Fee</span>
                  <span className={shippingCost === 0 ? "text-[#C9A24D]" : ""}>{shippingCost === 0 ? "FREE" : `KES ${shippingCost}`}</span>
                </div>

                <div className="h-[1px] bg-white/10 my-8" />
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black text-white/20 tracking-[0.4em]">Payable Amount</span>
                  <span className="text-5xl font-bold text-[#C9A24D] font-mono tracking-tighter">
                    KES {total.toLocaleString()}
                  </span>
                </div>

                <div className="pt-10 space-y-4">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#3EB035] group-focus-within:scale-110 transition-transform">
                        <CreditCard size={18} />
                    </div>
                    <input 
                        type="tel" 
                        placeholder="M-PESA NUMBER"
                        className="w-full bg-black border border-white/10 py-5 pl-14 pr-5 rounded-2xl text-center text-sm font-black tracking-widest focus:border-[#3EB035] outline-none transition-all placeholder:text-white/10"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  
                  <label className="flex gap-4 cursor-pointer group px-1">
                    <input 
                        type="checkbox" 
                        className="accent-[#C9A24D] w-4 h-4 mt-1" 
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <span className="text-[9px] text-white/30 uppercase font-black leading-relaxed group-hover:text-white/60 transition-colors tracking-widest">
                        I agree to the <span className="text-[#C9A24D]">bespoke luxury</span> terms of service and refund policy.
                    </span>
                  </label>

                  <button 
                    onClick={handleMpesaPay}
                    disabled={!agreedToTerms || (deliveryMethod === 'delivery' && !streetAddress)}
                    className="group relative w-full bg-[#3EB035] text-white font-black py-6 rounded-2xl uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-3 overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-5 disabled:grayscale"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 italic font-serif text-xl">M</span> 
                    <span className="relative z-10">Pay KES {total.toLocaleString()}</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-6 opacity-20">
                    <CheckCircle2 size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">SSL Encrypted Checkout</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HELP CARD */}
            <div className="mt-6 bg-[#C9A24D]/5 border border-[#C9A24D]/10 p-6 rounded-[2rem] flex items-start gap-4">
                <Info size={18} className="text-[#C9A24D] mt-1 shrink-0" />
                <p className="text-[10px] text-[#C9A24D]/80 leading-relaxed font-medium uppercase tracking-widest">
                    Orders are processed within 2 hours. Delivery to <b>{selectedArea.area}</b> via <b>{selectedBranch.name}</b>.
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SIMPLE MPESA MODAL OVERLAY --- */}
      {showMpesaModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#141414] p-10 rounded-[3rem] border border-[#3EB035]/30 w-full max-w-sm text-center shadow-[0_0_50px_rgba(62,176,53,0.1)]">
                <div className="w-20 h-20 bg-[#3EB035] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-white text-3xl font-serif italic">M</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Check your phone</h3>
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-8 leading-loose">
                    An STK Push has been sent to <b>{phoneNumber}</b>.<br/> Please enter your PIN to confirm payment.
                </p>
                <button 
                    onClick={confirmPayment}
                    className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#C9A24D] transition-all"
                >
                    I Have Paid
                </button>
                <button onClick={() => setShowMpesaModal(false)} className="mt-4 text-[9px] uppercase font-black text-white/20 hover:text-white tracking-widest">
                    Cancel Request
                </button>
            </div>
        </div>
      )}

      <Footer />
    </main>
  );
};

export default CartPage;