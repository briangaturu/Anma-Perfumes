import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  ShoppingCart, ShieldCheck, Truck, RotateCcw, 
  Star, ChevronRight, PlayCircle, Clock, ArrowLeft, AlertTriangle 
} from "lucide-react";

// API & Redux Actions
import { useGetProductDetailsQuery, useGetAllProductsQuery } from "../features/Apis/products.Api";
import { useGetCategoryDetailsQuery } from "../features/Apis/Categories.APi";
import { addToCart } from "../features/Cart/cartSlice";
import Navbar from "../components/Navbar";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });

  // 1. Core Data Fetching
  const { data: product, isLoading, isError } = useGetProductDetailsQuery(id!);
  
  // Logic: Only consider the deal active if the isActive flag is true
  const activeDeal = product?.flashDeals?.find((d: any) => d.isActive);

  // 2. Contextual Data
  const { data: similarData } = useGetAllProductsQuery(
    { categoryId: product?.categoryId, limit: 6 }, 
    { skip: !product?.categoryId }
  );
  const { data: categoryInfo } = useGetCategoryDetailsQuery(product?.categoryId!, { 
    skip: !product?.categoryId 
  });

  const similarProducts = similarData?.data?.filter((p: any) => p.id !== id) || [];
  const currentMedia = product?.media?.[selectedMediaIdx];

  // 3. Stock & Timer Logic (Only if flash deal exists)
  const totalStock = activeDeal ? activeDeal.dealStock : 0;
  const soldUnits = activeDeal ? activeDeal.unitsSold : 0;
  const remainingStock = totalStock - soldUnits;
  const stockPercentage = totalStock > 0 ? (soldUnits / totalStock) * 100 : 0;
  const isLowStock = activeDeal && remainingStock > 0 && remainingStock < 10;

  useEffect(() => {
    if (!activeDeal) return;
    const interval = setInterval(() => {
      const diff = new Date(activeDeal.endTime).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeDeal]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedMediaIdx(0);
  }, [id]);

  // 4. Add to Cart Handler
  const handleAddToCart = () => {
    if (!product) return;
    const finalPrice = activeDeal ? parseFloat(activeDeal.flashPrice) : parseFloat(product.basePrice);
    
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.media?.[0]?.url || "",
      quantity: 1
    }));
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#C9A24D] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (isError || !product) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
      <p className="opacity-40 uppercase tracking-[0.3em] mb-4">Masterpiece Not Found</p>
      <Link to="/" className="text-[#C9A24D] text-xs font-bold hover:underline">Return to Store</Link>
    </div>
  );

  return (
    <div key={id} className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-16">
        {/* --- BREADCRUMBS --- */}
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30 mb-8 overflow-hidden whitespace-nowrap">
          <Link to="/" className="hover:text-[#C9A24D]">Store</Link>
          <ChevronRight size={10} />
          <span className="truncate">{categoryInfo?.name || "Collection"}</span>
          <ChevronRight size={10} />
          <span className="text-[#C9A24D] truncate font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT: MEDIA (Image/Video) --- */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
              <div className="aspect-square flex items-center justify-center bg-[#0D0D0D]">
                {currentMedia?.type.includes("video") ? (
                  <video src={currentMedia.url} controls autoPlay muted className="w-full h-full object-cover" />
                ) : (
                  <img src={currentMedia?.url} className="w-full h-full object-contain p-8" alt={product.name} />
                )}
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
              {product.media?.map((m: any, idx: number) => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMediaIdx(idx)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedMediaIdx === idx ? "border-[#C9A24D]" : "border-white/5 opacity-40 hover:opacity-100"
                  }`}
                >
                  <img src={m.type.includes("video") ? product.media?.[0]?.url : m.url} className="w-full h-full object-cover" alt="thumb" />
                  {m.type.includes("video") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <PlayCircle size={20} className="text-[#C9A24D]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* --- CENTER: PRICING & BUYING --- */}
          <div className="lg:col-span-4 flex flex-col">
            <h1 className="text-4xl font-extralight tracking-tight mb-2 leading-tight uppercase">{product.name}</h1>
            <div className="flex items-center gap-2 mb-8">
              <div className="flex text-[#C9A24D]">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#C9A24D" stroke="none" />)}
              </div>
              <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold italic">Bespoke Collection</span>
            </div>

            {/* Price & Scarcity Card */}
            <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl mb-8">
              {/* Only show timer if deal is active */}
              {activeDeal && (
                <div className="bg-[#C9A24D] px-5 py-2 flex items-center justify-between">
                  <span className="text-black font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock size={12} strokeWidth={3} /> Flash Deal Ends:
                  </span>
                  <span className="text-black font-mono font-bold text-xs">
                    {timeLeft.hours}h : {timeLeft.mins}m : {timeLeft.secs}s
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-5xl font-bold text-[#C9A24D]">
                    KES {activeDeal ? parseFloat(activeDeal.flashPrice).toLocaleString() : parseFloat(product.basePrice).toLocaleString()}
                  </span>
                  {activeDeal && (
                    <span className="text-xl text-white/20 line-through font-light">
                      KES {parseFloat(product.basePrice).toLocaleString()}
                    </span>
                  )}
                </div>
                
                {/* Visual price label */}
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-6">Retail Price (Inc. Taxes)</p>

                {/* Stock Indicator - Only show for Active Flash Deals */}
                {activeDeal && (
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className={isLowStock ? "text-red-500 animate-pulse" : "text-[#C9A24D]"} />
                        <span className="text-[9px] uppercase font-bold tracking-widest text-white/50">
                          {isLowStock ? "Extremely Limited" : "Offer Availability"}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black ${isLowStock ? "text-red-500" : "text-[#C9A24D]"}`}>
                        {remainingStock} PIECES LEFT
                      </span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 shadow-[0_0_10px] ${isLowStock ? 'bg-red-500 shadow-red-500' : 'bg-[#C9A24D] shadow-[#C9A24D]'}`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-white/40 leading-relaxed mb-10 font-light border-l border-[#C9A24D]/20 pl-4">
              {product.description}
            </p>

            <button 
              onClick={handleAddToCart}
              className="w-full py-5 bg-[#C9A24D] hover:bg-white text-black font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-[#C9A24D]/20 text-xs flex items-center justify-center gap-3 active:scale-95"
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
              Add to Cart
            </button>
          </div>

          {/* --- RIGHT: TRUST COLUMN --- */}
          <div className="lg:col-span-3">
            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-8 shadow-2xl sticky top-32">
              <h3 className="text-[10px] font-bold text-[#C9A24D] uppercase tracking-[0.4em] mb-4 border-b border-white/5 pb-2">Service Excellence</h3>
              <div className="flex gap-4 items-start">
                <Truck size={20} className="text-[#C9A24D] shrink-0" />
                <div><p className="text-[11px] font-bold uppercase tracking-wider">Fast Delivery</p><p className="text-[10px] text-white/30 mt-1 leading-relaxed">Secure dispatch within 48h.</p></div>
              </div>
              <div className="flex gap-4 items-start">
                <RotateCcw size={20} className="text-[#C9A24D] shrink-0" />
                <div><p className="text-[11px] font-bold uppercase tracking-wider">Returns</p><p className="text-[10px] text-white/30 mt-1 leading-relaxed">7-Day complimentary service.</p></div>
              </div>
              <div className="flex gap-4 items-start border-t border-white/5 pt-6">
                <ShieldCheck size={20} className="text-[#C9A24D] shrink-0" />
                <div><p className="text-[11px] font-bold uppercase tracking-wider">Authenticity</p><p className="text-[10px] text-white/30 mt-1 leading-relaxed">Certified original item.</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SIMILAR PRODUCTS --- */}
        {similarProducts.length > 0 && (
          <section className="mt-24 border-t border-white/5 pt-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em]">Similar <span className="text-[#C9A24D]">Creations</span></h2>
              <Link to="/perfumes" className="text-[10px] text-[#C9A24D] hover:underline uppercase font-bold tracking-widest">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {similarProducts.map((item: any) => (
                <Link key={item.id} to={`/product/${item.id}`} className="group block">
                  <div className="aspect-square bg-[#111] border border-white/5 rounded-2xl overflow-hidden mb-3 p-6 flex items-center justify-center transition-all group-hover:border-[#C9A24D]/30">
                    <img src={item.media?.[0]?.url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                  </div>
                  <h4 className="text-[10px] uppercase text-white/50 truncate tracking-tighter group-hover:text-white">{item.name}</h4>
                  <p className="text-sm font-bold text-[#C9A24D] mt-1">KES {parseFloat(item.basePrice).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProductDetailPage;