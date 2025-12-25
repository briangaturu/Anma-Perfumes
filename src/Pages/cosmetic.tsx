import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, Search, SlidersHorizontal, 
  Zap, ShoppingBag, X, ChevronRight, ArrowUpDown, Filter, Check
} from "lucide-react";

// API & Redux Actions
import { useGetCategoriesQuery, useGetCategoryDetailsQuery } from "../features/Apis/Categories.APi";
import { useGetAllProductsQuery, useGetProductMediaQuery } from "../features/Apis/products.Api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- SUB-COMPONENT: LUXURY PRODUCT CARD ---
const CosmeticCard = ({ product, navigate }: { product: any, navigate: any }) => {
  const { data: media, isLoading: mediaLoading } = useGetProductMediaQuery(product.id);
  const fallbackImage = "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=800";
  const displayImg = media?.find((m: any) => m.type.includes("image"))?.url || fallbackImage;
  const activeDeal = product.flashDeals?.find((d: any) => d.isActive);

  return (
    <div className="group flex flex-col relative w-full cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="relative aspect-[4/5] bg-[#0A0A0A] overflow-hidden border border-white/5 transition-all duration-700 group-hover:border-[#C9A24D]/30 shadow-2xl">
        {mediaLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
            <Loader2 className="animate-spin text-[#C9A24D]/20" size={20} />
          </div>
        ) : (
          <img 
            src={displayImg} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-110" 
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
          />
        )}
        <div className="absolute top-3 left-3 z-20">
          {activeDeal && (
            <div className="bg-[#C9A24D] text-black text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1 uppercase tracking-widest flex items-center gap-1">
              <Zap size={8} fill="black" /> Deal
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
           <span className="bg-white text-black px-6 py-2.5 text-[8px] font-black uppercase tracking-[0.3em]">
             View Piece
           </span>
        </div>
      </div>
      <div className="mt-5 space-y-1 px-1">
        <p className="text-[9px] text-gray-500 uppercase tracking-widest">{product.subcategory?.name || "ANMA Exclusive"}</p>
        <h2 className="text-[12px] md:text-[14px] font-light tracking-[0.05em] text-white uppercase italic truncate">{product.name}</h2>
        <span className="text-[13px] font-bold text-[#C9A24D]">
          KES {parseFloat(activeDeal ? activeDeal.flashPrice : product.basePrice).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const CosmeticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubCat, setSelectedSubCat] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "price-low" | "price-high">("latest");
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 1. DYNAMIC SEARCH: Get "Cosmetics" ID
  const { data: catSearch, isLoading: searchLoading } = useGetCategoriesQuery({ search: "Cosmetics" });
  const COSMETIC_ID = catSearch?.data?.find(c => c.name.toLowerCase() === "cosmetics")?.id;

  // 2. FETCH DETAILS & PRODUCTS using Dynamic ID
  const { data: categoryData, isLoading: catLoading } = useGetCategoryDetailsQuery(COSMETIC_ID!, { skip: !COSMETIC_ID });
  const { data: productsData, isLoading: prodLoading } = useGetAllProductsQuery(
    { categoryId: COSMETIC_ID, limit: 100 }, 
    { skip: !COSMETIC_ID }
  );

  const processedCosmetics = useMemo(() => {
    const rawList = Array.isArray(productsData) ? productsData : productsData?.data || [];
    
    let filtered = rawList.filter((p: any) => {
      const currentPrice = p.flashDeals?.some((d: any) => d.isActive) 
        ? parseFloat(p.flashDeals.find((d: any) => d.isActive).flashPrice) 
        : parseFloat(p.basePrice);
      
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSub = selectedSubCat === "all" || p.subcategoryId === selectedSubCat;
      const matchesPrice = currentPrice <= maxPrice;
      
      return matchesSearch && matchesSub && matchesPrice;
    });

    return filtered.sort((a: any, b: any) => {
        const priceA = a.flashDeals?.some((d: any) => d.isActive) ? parseFloat(a.flashDeals.find((d: any) => d.isActive).flashPrice) : parseFloat(a.basePrice);
        const priceB = b.flashDeals?.some((d: any) => d.isActive) ? parseFloat(b.flashDeals.find((d: any) => d.isActive).flashPrice) : parseFloat(b.basePrice);

        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [searchTerm, selectedSubCat, sortBy, maxPrice, productsData]);

  if (searchLoading || (COSMETIC_ID && (catLoading || prodLoading))) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
      <Loader2 className="text-[#C9A24D] animate-spin mb-4" size={24} />
      <span className="text-[#C9A24D] text-[9px] uppercase tracking-[0.5em] font-black italic">ANMA LUXE</span>
    </div>
  );

  return (
    <main className="bg-[#050505] min-h-screen text-white">
      <Navbar />

      <header className="pt-32 md:pt-48 pb-12 md:pb-24 px-4 md:px-6 relative border-b border-white/5 overflow-hidden">
        {/* Ghost Background Text */}
        <div className="absolute top-10 left-0 text-[80px] md:text-[180px] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase whitespace-nowrap">
            ANMA PERFUMES & JEWELRY
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-[1px] w-8 bg-[#C9A24D]" />
             <span className="text-[#C9A24D] text-[10px] font-black uppercase tracking-[0.5em]">The Cosmetic Edit</span>
          </div>
          
          <h1 className="text-4xl md:text-[100px] font-extralight tracking-tighter uppercase leading-[0.9] mb-8">
            ANMA <span className="text-[#C9A24D] font-black italic">Cosmetics</span> <br className="hidden md:block" /> 
            <span className="text-white/20 md:mx-2">&</span> <span className="text-white">Jewelry</span>
          </h1>
          
          <div className="flex flex-col md:flex-row gap-6 w-full mt-10">
            <div className="relative border-b border-white/10 flex items-center flex-1 group">
              <Search size={14} className="text-gray-700 transition-colors group-focus-within:text-[#C9A24D]" />
              <input 
                type="text" 
                placeholder="SEARCH THE VAULT..." 
                className="bg-transparent py-4 pl-4 focus:outline-none text-[11px] uppercase tracking-[0.2em] w-full" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="flex gap-4 items-center">
                <button 
                  onClick={() => setIsFilterOpen(true)} 
                  className="flex items-center gap-3 border border-white/10 px-8 py-4 text-[10px] tracking-widest uppercase font-bold text-[#C9A24D] hover:bg-white hover:text-black transition-all"
                >
                   REFINE ARCHIVE <Filter size={14} />
                </button>
                <div className="hidden md:flex items-center gap-3 border-b border-white/10 px-4 h-full">
                    <ArrowUpDown size={14} className="text-gray-600" />
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as any)} 
                      className="bg-transparent py-4 text-[10px] uppercase tracking-[0.2em] focus:outline-none cursor-pointer font-bold text-[#C9A24D]"
                    >
                        <option value="latest" className="bg-black">Newest Arrivals</option>
                        <option value="price-high" className="bg-black">Price: High to Low</option>
                        <option value="price-low" className="bg-black">Price: Low to High</option>
                    </select>
                </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-40 space-y-16">
            <div>
                <h3 className="text-white text-[10px] font-black uppercase tracking-[0.5em] mb-8 pb-4 border-b border-white/5">Collections</h3>
                <ul className="space-y-6">
                  <li 
                    onClick={() => setSelectedSubCat("all")} 
                    className={`text-[10px] uppercase tracking-[0.3em] cursor-pointer transition-all flex items-center justify-between ${selectedSubCat === "all" ? "text-[#C9A24D]" : "text-gray-600 hover:text-white"}`}
                  >
                    All Masterpieces <ChevronRight size={10} className={selectedSubCat === "all" ? "opacity-100" : "opacity-0"} />
                  </li>
                  {categoryData?.subcategories?.map((sub) => (
                      <li 
                        key={sub.id} 
                        onClick={() => setSelectedSubCat(sub.id)} 
                        className={`text-[10px] uppercase tracking-[0.3em] cursor-pointer transition-all flex items-center justify-between ${selectedSubCat === sub.id ? "text-[#C9A24D]" : "text-gray-600 hover:text-white"}`}
                      >
                        {sub.name} <ChevronRight size={10} className={selectedSubCat === sub.id ? "opacity-100" : "opacity-0"} />
                    </li>
                  ))}
                </ul>
            </div>

            <div>
              <div className="flex justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="text-white text-[10px] font-black uppercase tracking-[0.5em]">Investment</h3>
                <span className="text-[10px] text-[#C9A24D] font-bold tracking-widest">KES {maxPrice.toLocaleString()}</span>
              </div>
              <input 
                type="range" min="0" max="100000" step="500" 
                value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
                className="w-full accent-[#C9A24D] bg-white/10 h-[2px] appearance-none cursor-pointer" 
              />
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <section className="lg:col-span-9">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16 md:gap-y-24">
            {processedCosmetics.map((p: any) => (
              <CosmeticCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>

          {processedCosmetics.length === 0 && (
             <div className="py-40 text-center opacity-40">
                <ShoppingBag size={40} strokeWidth={1} className="mx-auto mb-6" />
                <p className="text-[10px] uppercase tracking-[0.5em]">No pieces found in current search</p>
             </div>
          )}
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <div className={`fixed inset-0 z-[100] transition-transform duration-700 ease-in-out ${isFilterOpen ? "translate-y-0" : "translate-y-full"}`}>
         <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setIsFilterOpen(false)} />
         <div className="relative h-full flex flex-col p-10 overflow-y-auto">
            <div className="flex justify-between items-center mb-16">
               <span className="text-[#C9A24D] text-[11px] font-black uppercase tracking-[0.5em]">ANMA REFINE</span>
               <button onClick={() => setIsFilterOpen(false)} className="p-3 bg-white/5 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="space-y-14">
               <section>
                  <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] mb-8 font-bold">Sort By</p>
                  <div className="space-y-3">
                     {[
                        { label: "Newest Arrivals", val: "latest" },
                        { label: "High to Low Price", val: "price-high" },
                        { label: "Low to High Price", val: "price-low" }
                     ].map((opt) => (
                        <button 
                          key={opt.val} 
                          onClick={() => setSortBy(opt.val as any)} 
                          className={`w-full py-4 px-6 text-left text-[11px] uppercase tracking-widest border transition-all flex justify-between items-center ${sortBy === opt.val ? "border-[#C9A24D] text-[#C9A24D] bg-[#C9A24D]/5" : "border-white/5 text-white/40"}`}
                        >
                            {opt.label} {sortBy === opt.val && <Check size={14} />}
                        </button>
                     ))}
                  </div>
               </section>

               <section>
                  <div className="flex justify-between items-end mb-8">
                    <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] font-bold">Investment Ceiling</p>
                    <span className="text-[12px] text-[#C9A24D] font-bold">KES {maxPrice.toLocaleString()}</span>
                  </div>
                  <input type="range" min="0" max="100000" step="1000" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-[#C9A24D]" />
               </section>

               <section className="pb-32">
                  <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] mb-8 font-bold">Collections</p>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => setSelectedSubCat("all")} className={`py-4 text-[10px] uppercase border tracking-widest ${selectedSubCat === "all" ? "border-[#C9A24D] text-[#C9A24D]" : "border-white/5 text-white/30"}`}>All Archive</button>
                     {categoryData?.subcategories?.map((sub) => (
                        <button 
                          key={sub.id} 
                          onClick={() => setSelectedSubCat(sub.id)} 
                          className={`py-4 px-2 text-[10px] uppercase border tracking-widest truncate ${selectedSubCat === sub.id ? "border-[#C9A24D] text-[#C9A24D]" : "border-white/5 text-white/30"}`}
                        >
                          {sub.name}
                        </button>
                     ))}
                  </div>
               </section>
            </div>

            <button 
              onClick={() => setIsFilterOpen(false)} 
              className="fixed bottom-10 left-10 right-10 bg-[#C9A24D] text-black py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
            >
                Confirm Archive View ({processedCosmetics.length})
            </button>
         </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default CosmeticsPage;