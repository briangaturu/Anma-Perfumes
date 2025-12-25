import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetActiveFlashDealsQuery, useGetProductMediaQuery } from "../features/Apis/products.Api";
import { ChevronRight, Loader2, Zap } from "lucide-react";

// --- SUB-COMPONENT FOR INDIVIDUAL CARDS ---
const FlashDealCard = ({ deal, now }: { deal: any; now: number }) => {
  const product = deal.product;
  
  // FETCH MEDIA SPECIFICALLY FOR THIS PRODUCT
  const { data: media, isLoading: mediaLoading } = useGetProductMediaQuery(deal.productId);

  // LOGIC: Find the first image
  const displayImage = media?.find((m: any) => m.type === "image")?.url 
    || "https://images.unsplash.com/photo-1590156221122-c4465fe46b70?auto=format&fit=crop&q=80&w=800";

  // CALCULATE DISCOUNT PERCENTAGE
  const basePrice = Number(product?.basePrice) || 0;
  const flashPrice = Number(deal.flashPrice) || 0;
  const discountPercent = deal.discountPercentage || Math.round(((basePrice - flashPrice) / basePrice) * 100);

  // STOCK CALCULATION
  const stockRemaining = Math.max(0, deal.dealStock - deal.unitsSold);
  const stockProgress = (deal.unitsSold / deal.dealStock) * 100;

  // TIMER LOGIC
  const timeLeft = new Date(deal.endTime).getTime() - now;
  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <Link
      to={`/product/${deal.productId}`}
      className="group bg-[#0A0A0A] border border-white/5 hover:border-[#C9A24D]/40 transition-all duration-700 relative overflow-hidden"
    >
      {/* Visual Asset */}
      <div className="relative h-72 overflow-hidden bg-black flex items-center justify-center">
        {mediaLoading ? (
          <Loader2 className="animate-spin text-[#C9A24D]" size={20} />
        ) : (
          <img
            src={displayImage}
            alt={product?.name}
            className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
        
        {/* TOP BADGES */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-[#C9A24D] text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-2xl">
                <Zap size={10} fill="currentColor" /> {discountPercent}% OFF
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white px-2 py-1 text-[9px] font-mono">
                {deal.unitsSold} / {deal.dealStock} SOLD
            </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] truncate group-hover:text-[#C9A24D] transition-colors">
            {product?.name || "Luxury Masterpiece"}
            </h3>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">Limited Inventory Release</p>
        </div>
        
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-light text-[#C9A24D] italic">${deal.flashPrice}</span>
          <span className="text-[10px] text-white/20 line-through tracking-widest">${product?.basePrice}</span>
        </div>

        {/* STOCK PROGRESS SECTION */}
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold">
                <span className="text-gray-500">Availability</span>
                <span className={stockRemaining < 10 ? "text-red-500 animate-pulse" : "text-white"}>
                    {stockRemaining} Left in Vault
                </span>
            </div>
            <div className="w-full h-[3px] bg-white/5 overflow-hidden">
                <div 
                    className="h-full bg-[#C9A24D] transition-all duration-1000 shadow-[0_0_8px_#C9A24D]" 
                    style={{ width: `${stockProgress}%` }}
                />
            </div>
        </div>

        {/* FOOTER TIMER */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[7px] text-gray-600 uppercase tracking-[0.5em] mb-1 font-black">Offer Ends In</span>
            <div className="flex gap-2 text-[12px] font-mono text-white">
              <span className="w-6">{hours}h</span>
              <span className="text-[#C9A24D] animate-pulse">:</span>
              <span className="w-6">{minutes}m</span>
              <span className="text-[#C9A24D] animate-pulse">:</span>
              <span className="w-6">{seconds}s</span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-full border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-[#C9A24D] group-hover:text-black group-hover:border-[#C9A24D] transition-all duration-500">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- MAIN LISTING COMPONENT ---
const FlashDeals: React.FC = () => {
  const { data: flashDeals, isLoading } = useGetActiveFlashDealsQuery();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return (
    <div className="py-24 text-center">
        <Loader2 className="mx-auto animate-spin text-[#C9A24D] mb-4" size={32} />
        <span className="text-[#C9A24D] text-[10px] uppercase tracking-[0.5em] font-black">Synchronizing Vault...</span>
    </div>
  );

  if (!flashDeals?.length) return null;

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="bg-[#050505] p-10 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,1)]">
        <div className="mb-12 border-b border-white/5 pb-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h2 className="text-5xl font-extralight text-white tracking-tighter uppercase">
                    Maison <span className="text-[#C9A24D] font-black italic">Flash</span>
                </h2>
                <p className="text-gray-600 text-[9px] uppercase tracking-[0.6em] mt-3">Priority access to temporal collections</p>
            </div>
            <div className="hidden md:block h-[1px] flex-1 bg-white/5 mx-10 mb-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {flashDeals.map((deal) => (
            <FlashDealCard key={deal.id} deal={deal} now={now} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;