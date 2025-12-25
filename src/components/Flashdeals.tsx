import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetActiveFlashDealsQuery } from "../features/Apis/products.Api";

const FlashDeals: React.FC = () => {
  const { data: flashDeals, isLoading } = useGetActiveFlashDealsQuery();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return <div className="p-8 text-[#C9A24D] animate-pulse">Loading Luxury Deals...</div>;
  if (!flashDeals?.length) return null;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="bg-[#141414] rounded-2xl p-8 shadow-2xl border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-light text-white tracking-tight">
              Flash <span className="text-[#C9A24D] font-bold">Sale</span>
            </h2>
            <p className="text-white/40 text-sm mt-1 uppercase tracking-[0.2em]">Limited Time Exclusives</p>
          </div>
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-[#C9A24D]/30">
            <div className="w-2 h-2 bg-[#C9A24D] rounded-full animate-ping" />
            <span className="text-[#C9A24D] font-mono text-sm font-bold uppercase tracking-tighter">Live Offers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {flashDeals.map((deal) => {
            const product = (deal as any).product;
            const timeLeft = new Date(deal.endTime).getTime() - now;
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);

            return (
              <Link
                to={`/product/${deal.productId}`}
                key={deal.id}
                className="group bg-[#1A1A1A] rounded-xl overflow-hidden border border-white/5 hover:border-[#C9A24D]/50 transition-all duration-500 hover:-translate-y-2 shadow-xl"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={product?.media?.[0]?.url || "https://images.unsplash.com/photo-1583467875263-d50dec37a88c?q=80&w=500"}
                    alt={product?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md text-[10px] text-[#C9A24D] font-bold border border-[#C9A24D]/20">
                    {deal.unitsSold} CLAIMED
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-white font-light text-lg truncate mb-2">{product?.name || "Luxury Item"}</h3>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-2xl font-bold text-[#C9A24D]">${deal.flashPrice}</span>
                    <span className="text-sm text-white/30 line-through">${product?.basePrice}</span>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">Ends In</span>
                    <span className="text-sm font-mono text-white">
                      {hours}h {minutes}m {seconds}s
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;