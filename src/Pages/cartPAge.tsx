import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- TYPES ---
interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  details?: string;
}

const INITIAL_CART: CartItem[] = [
  {
    id: "c1",
    name: "Eternity Diamond Band",
    category: "Jewellery",
    price: 95000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80",
    details: "Size: 7 | 18K White Gold"
  },
  {
    id: "custom-p1",
    name: "Midnight in Nairobi (Custom)",
    category: "Bespoke Perfume",
    price: 4500,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=200&q=80",
    details: "Mix: Oud, Rose, Amber | 30ml"
  }
];

const CartPage: React.FC = () => {
  // --- STATE ---
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New State for Business Logic
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  // --- CALCULATIONS ---
  const subtotal = useMemo(() => 
    cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), 
  [cart]);

  const shippingCost = useMemo(() => {
    if (deliveryMethod === "pickup" || subtotal > 50000) return 0;
    return 500;
  }, [deliveryMethod, subtotal]);

  const giftWrapCost = isGiftWrapped ? 500 : 0;
  const total = subtotal + shippingCost + giftWrapCost;

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleMpesaPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert("Please agree to the Terms & Conditions first.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(`STK Push sent to ${phoneNumber}. Please enter your M-Pesa PIN.`);
      setShowMpesaModal(false);
    }, 2000);
  };

  return (
    <main className="bg-[#0B0B0B] min-h-screen text-white relative">
      <Navbar />

      {/* --- M-PESA MODAL --- */}
      {showMpesaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => !isProcessing && setShowMpesaModal(false)}></div>
          <div className="relative bg-[#141414] border border-[#C9A24D]/30 w-full max-w-md p-8 shadow-2xl animate-fade-in rounded-lg">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#3EB035] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-black text-xl italic">M</span>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#C9A24D]">Secure Payment</h2>
              <p className="text-gray-500 text-[10px] mt-1 tracking-widest uppercase">Anma Beauty Checkout</p>
            </div>

            <form onSubmit={handleMpesaPay} className="space-y-6">
              <div className="bg-black/50 p-4 border border-white/5 space-y-2">
                <div className="flex justify-between text-[10px] text-gray-500 uppercase"><span>Recipient</span><span className="text-white">Anma Beauty Ltd</span></div>
                <div className="flex justify-between text-sm font-bold"><span>Total Amount</span><span className="text-[#C9A24D]">KES {total.toLocaleString()}</span></div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-500">M-Pesa Registered Number</label>
                <input 
                  type="tel" 
                  placeholder="07XXXXXXXX" 
                  required
                  className="w-full bg-black border border-white/10 p-4 text-white outline-none focus:border-[#C9A24D]"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#3EB035] text-white font-black py-4 uppercase text-xs tracking-widest transition-all hover:brightness-110 disabled:opacity-50"
              >
                {isProcessing ? "Connecting to Safaricom..." : "Pay Now"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MAIN CART CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-serif font-bold text-[#C9A24D] mb-12">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT: CART ITEMS */}
          <div className="lg:col-span-8 space-y-8">
            {cart.length > 0 ? cart.map((item) => (
              <div key={item.id} className="flex gap-6 border-b border-white/5 pb-8 group">
                <div className="w-24 h-32 overflow-hidden bg-[#141414]">
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{item.category}</p>
                      <p className="text-xs text-[#C9A24D] mt-2 italic">{item.details}</p>
                    </div>
                    <p className="font-bold">KES {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center mt-6 gap-6">
                    <div className="flex items-center border border-white/10 text-xs">
                       <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 hover:bg-white/5">-</button>
                       <span className="px-4 py-1 border-x border-white/10">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 hover:bg-white/5">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-[10px] uppercase text-gray-600 hover:text-red-500">Remove</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 border border-dashed border-white/10">
                <p className="text-gray-500 italic">Your bag is empty.</p>
              </div>
            )}
          </div>

          {/* RIGHT: SUMMARY & CHECKOUT OPTIONS */}
          <div className="lg:col-span-4">
            <div className="bg-[#141414] p-8 border border-white/5 space-y-8 sticky top-24">
              <h3 className="uppercase text-xs font-bold tracking-[0.3em] border-b border-white/10 pb-4">Checkout Details</h3>
              
              {/* Delivery Choice */}
              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 uppercase font-bold">Delivery Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDeliveryMethod("delivery")}
                    className={`py-3 text-[10px] font-bold uppercase border transition-all ${deliveryMethod === "delivery" ? 'border-[#C9A24D] text-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/10 text-gray-500'}`}
                  >
                    Doorstep
                  </button>
                  <button 
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`py-3 text-[10px] font-bold uppercase border transition-all ${deliveryMethod === "pickup" ? 'border-[#C9A24D] text-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/10 text-gray-500'}`}
                  >
                    Store Pickup
                  </button>
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="PROMO CODE" 
                  className="flex-1 bg-black border border-white/10 p-3 text-[10px] outline-none focus:border-[#C9A24D]"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button className="px-4 bg-white/5 text-[10px] font-bold hover:bg-white/10 uppercase">Apply</button>
              </div>

              {/* Gift Wrap Toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-black/40 border border-white/5">
                <input 
                  type="checkbox" 
                  className="accent-[#C9A24D]"
                  checked={isGiftWrapped}
                  onChange={() => setIsGiftWrapped(!isGiftWrapped)}
                />
                <span className="text-[10px] uppercase font-bold text-gray-400">Add Luxury Gift Wrap (+ KES 500)</span>
              </label>

              {/* Final Math */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs text-gray-400"><span>Subtotal</span><span>KES {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-[#C9A24D] font-bold" : ""}>
                    {shippingCost === 0 ? "FREE" : `KES ${shippingCost}`}
                  </span>
                </div>
                {isGiftWrapped && <div className="flex justify-between text-xs text-gray-400"><span>Gift Wrap</span><span>KES 500</span></div>}
                
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Order Total</span>
                  <span className="text-3xl font-bold text-[#C9A24D]">KES {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="accent-[#C9A24D] mt-1" 
                    checked={agreedToTerms}
                    onChange={() => setAgreedToTerms(!agreedToTerms)}
                  />
                  <span className="text-[9px] text-gray-500 leading-relaxed uppercase">
                    I agree to the <span className="underline text-white">terms of service</span> and understand custom perfumes are non-refundable.
                  </span>
                </label>
              </div>

              <button 
                onClick={() => setShowMpesaModal(true)}
                disabled={cart.length === 0 || !agreedToTerms}
                className="w-full bg-[#3EB035] text-white font-black py-5 uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-[#3EB035]/10 disabled:opacity-20"
              >
                📱 Pay with M-Pesa
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default CartPage;