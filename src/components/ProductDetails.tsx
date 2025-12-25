import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  ShoppingCart, ShieldCheck, Truck, RotateCcw, 
  Star, ChevronRight, PlayCircle, Clock, AlertTriangle, 
  Loader2, ExternalLink 
} from "lucide-react";

// API & Redux Actions
import { 
    useGetProductDetailsQuery, 
    useGetAllProductsQuery, 
    useGetProductMediaQuery 
} from "../features/Apis/products.Api";
import { useGetCategoryDetailsQuery } from "../features/Apis/Categories.APi";
import { addToCart } from "../features/Cart/cartSlice";
import Navbar from "../components/Navbar";

// --- ENHANCED SUB-COMPONENT FOR SIMILAR PRODUCTS ---
const SimilarProductCard = ({ item }: { item: any }) => {
  const { data: media, isLoading: mediaLoading } = useGetProductMediaQuery(item.id);

  const displayImage = media?.find((m: any) => m.type === "image")?.url 
    || "https://images.unsplash.com/photo-1590156221122-c4465fe46b70?auto=format&fit=crop&q=80&w=800";

  return (
    <Link to={`/product/${item.id}`} className="group relative block">
      {/* Cinematic Portrait Container */}
      <div className="relative aspect-[4/5] bg-[#0A0A0A] rounded-sm overflow-hidden border border-white/5 transition-all duration-700 group-hover:border-[#C9A24D]/40 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        
        {mediaLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#C9A24D]/20" size={20} />
            </div>
        ) : (
            <img 
                src={displayImage} 
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" 
                alt={item.name} 
            />
        )}

        {/* Glassmorphism Action Bar */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em] py-3 text-center flex items-center justify-center gap-2">
                View Masterpiece <ExternalLink size={10} />
            </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="mt-5 space-y-1 px-1">
        <div className="flex justify-between items-center">
            <h4 className="text-[10px] uppercase text-white/40 tracking-[0.2em] font-light group-hover:text-white transition-colors duration-300 truncate pr-2">
                {item.name}
            </h4>
            <div className="h-[1px] w-0 group-hover:w-6 bg-[#C9A24D] transition-all duration-500" />
        </div>
        <p className="text-xs font-bold text-[#C9A24D] tracking-tight">
            KES {parseFloat(item.basePrice).toLocaleString()}
        </p>
      </div>
    </Link>
  );
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });

  const { data: product, isLoading, isError } = useGetProductDetailsQuery(id!);
  const activeDeal = product?.flashDeals?.find((d: any) => d.isActive);

  const { data: similarData } = useGetAllProductsQuery(
    { categoryId: product?.categoryId, limit: 6 }, 
    { skip: !product?.categoryId }
  );
  const { data: categoryInfo } = useGetCategoryDetailsQuery(product?.categoryId!, { 
    skip: !product?.categoryId 
  });

  const similarProducts = similarData?.data?.filter((p: any) => p.id !== id) || [];
  const currentMedia = product?.media?.[selectedMediaIdx];

  // Stock & Timer Logic
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
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30 mb-8 overflow-hidden whitespace-nowrap">
          <Link to="/" className="hover:text-[#C9A24D]">Store</Link>
          <ChevronRight size={10} />
          <span className="truncate">{categoryInfo?.name || "Collection"}</span>
          <ChevronRight size={10} />
          <span className="text-[#C9A24D] truncate font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
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
                  <img src={m.type.includes("video") ? (product.media?.find((img:any) => img.type === 'image')?.url || m.url) : m.url} className="w-full h-full object-cover" alt="thumb" />
                  {m.type.includes("video") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <PlayCircle size={20} className="text-[#C9A24D]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <h1 className="text-4xl font-extralight tracking-tight mb-2 leading-tight uppercase">{product.name}</h1>
            <div className="flex items-center gap-2 mb-8">
              <div className="flex text-[#C9A24D]">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#C9A24D" stroke="none" />)}
              </div>
              <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold italic">Bespoke Collection</span>
            </div>

            <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl mb-8">
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
                
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-6">
                    {activeDeal ? "Limited Time Flash Price" : "Standard Retail Price"} (Inc. Taxes)
                </p>

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

        {/* --- BEAUTIFIED SIMILAR PRODUCTS SECTION --- */}
        {similarProducts.length > 0 && (
          <section className="mt-40 border-t border-white/5 pt-24 relative overflow-hidden">
             {/* Decorative Background Text */}
             <div className="absolute top-10 left-0 text-[140px] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase whitespace-nowrap">
                The Collection The Collection
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <span className="text-[#C9A24D] text-[10px] font-black uppercase tracking-[0.5em] block mb-3">Curated Selection</span>
                        <h2 className="text-4xl font-extralight uppercase tracking-tighter">
                            Similar <span className="text-[#C9A24D] font-black italic">Creations</span>
                        </h2>
                    </div>
                    <Link to="/perfumes" className="group flex items-center gap-4 text-[10px] text-white/40 hover:text-[#C9A24D] uppercase font-bold tracking-[0.4em] transition-all">
                        View Complete Archive
                        <div className="w-10 h-[1px] bg-white/10 group-hover:bg-[#C9A24D] group-hover:w-16 transition-all duration-500" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-16">
                {similarProducts.slice(0, 5).map((item: any) => (
                    <SimilarProductCard key={item.id} item={item} />
                ))}
                </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProductDetailPage;