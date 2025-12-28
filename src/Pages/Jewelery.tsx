import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, Search, Zap, ShoppingBag, X, 
  ChevronRight, ArrowUpDown, Filter, Check, Gem, MapPin 
} from "lucide-react";

// API & Redux Actions
import { useGetCategoriesQuery, useGetCategoryDetailsQuery } from "../features/Apis/Categories.APi";
import { useGetAllProductsQuery, useGetProductMediaQuery } from "../features/Apis/products.Api";
import { useGetProductAvailabilityQuery } from "../features/Apis/Inventory.Api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- SUB-COMPONENT: LUXURY JEWELLERY CARD WITH INVENTORY ---
const JewelleryCard = ({ product, navigate }: { product: any, navigate: any }) => {
  const { data: media, isLoading: mediaLoading } = useGetProductMediaQuery(product.id);
  const { data: inventoryData } = useGetProductAvailabilityQuery(product.id);

  const fallbackImage = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800";
  const displayImg = media?.find((m: any) => m.type.includes("image"))?.url || fallbackImage;
  const activeDeal = product.flashDeals?.find((d: any) => d.isActive);

  // --- INVENTORY LOGIC: Unique Branches ---
  const availableBranches = useMemo(() => {
    if (!inventoryData?.data) return [];
    const uniqueMap = new Map();
    inventoryData.data.forEach((item: any) => {
      if (item.quantity > 0) {
        uniqueMap.set(item.branchId, {
          branchName: item.branchName,
          quantity: item.quantity
        });
      }
    });
    return Array.from(uniqueMap.values());
  }, [inventoryData]);

  const totalStock = availableBranches.reduce((acc, curr) => acc + (curr as any).quantity, 0);

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

        {/* --- BRANCH TAGS --- */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap gap-1">
          {availableBranches.length > 0 ? (
            availableBranches.map((item: any, idx: number) => (
              <span key={idx} className="bg-black/60 backdrop-blur-md text-[#C9A24D] text-[7px] font-black px-2 py-1 border border-[#C9A24D]/20 uppercase tracking-tighter flex items-center gap-1 shadow-2xl">
                <MapPin size={8} className="text-[#C9A24D]" /> {item.branchName}
              </span>
            ))
          ) : (
            <span className="bg-red-950/40 backdrop-blur-md text-red-400 text-[7px] font-black px-2 py-1 border border-red-500/20 uppercase tracking-tighter">
              Archive Exhausted
            </span>
          )}
        </div>

        <div className="absolute top-3 left-3 z-20">
          {activeDeal && (
            <div className="bg-[#C9A24D] text-black text-[7px] md:text-[8px] font-black px-2 md:px-3 py-1 uppercase tracking-widest flex items-center gap-1 shadow-xl">
              <Zap size={8} fill="black" /> RARE FIND
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex items-center justify-center">
           <span className="bg-white text-black px-6 py-2.5 text-[8px] font-black uppercase tracking-[0.3em]">
             View Piece
           </span>
        </div>
      </div>
      <div className="mt-5 space-y-1.5 px-1 text-center lg:text-left">
        <p className="text-[9px] text-gray-500 uppercase tracking-widest">{product.subcategory?.name || "The Vault"}</p>
        <h2 className="text-[12px] md:text-[14px] font-light tracking-[0.05em] text-white uppercase italic truncate">{product.name}</h2>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center pt-1 gap-2">
            <span className="text-[13px] font-bold text-[#C9A24D]">
                KES {parseFloat(activeDeal ? activeDeal.flashPrice : product.basePrice).toLocaleString()}
            </span>
            <span className="text-[7px] text-white/30 font-black uppercase tracking-[0.2em]">
                {totalStock > 0 ? `${totalStock} In Vault` : "Enquiry Only"}
            </span>
        </div>
      </div>
    </div>
  );
};

const JewelleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubCat, setSelectedSubCat] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "price-low" | "price-high">("latest");
  const [maxPrice, setMaxPrice] = useState<number>(1000000); // Increased ceiling for High Jewellery
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: catSearch, isLoading: searchLoading } = useGetCategoriesQuery({ search: "Jewell" });
  const JEWELLERY_ID = catSearch?.data?.find(c => c.name.toLowerCase().includes("jewell"))?.id;

  const { data: categoryData, isLoading: catLoading } = useGetCategoryDetailsQuery(JEWELLERY_ID!, { skip: !JEWELLERY_ID });
  const { data: productsData, isLoading: prodLoading } = useGetAllProductsQuery(
    { categoryId: JEWELLERY_ID, limit: 100 }, 
    { skip: !JEWELLERY_ID }
  );

  const processedItems = useMemo(() => {
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

  if (searchLoading || (JEWELLERY_ID && (catLoading || prodLoading))) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
      <Loader2 className="text-[#C9A24D] animate-spin mb-4" size={24} />
      <span className="text-[#C9A24D] text-[9px] uppercase tracking-[0.5em] font-black italic">OPENING THE VAULT</span>
    </div>
  );

  return (
    <main className="bg-[#050505] min-h-screen text-white pb-10">
      <Navbar />

      <header className="pt-32 md:pt-48 pb-12 md:pb-24 px-4 md:px-6 relative border-b border-white/5 overflow-hidden">
        <div className="absolute top-10 left-0 text-[70px] md:text-[180px] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase whitespace-nowrap">
            TIMELESS ATELIERS
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-[1px] w-8 bg-[#C9A24D]" />
             <span className="text-[#C9A24D] text-[10px] font-black uppercase tracking-[0.5em]">The Jewellery Edit</span>
          </div>
          
          <h1 className="text-4xl md:text-[100px] font-extralight tracking-tighter uppercase leading-[0.9] mb-8">
            ANMA <span className="text-[#C9A24D] font-black italic">Jewellery</span> <br className="hidden md:block" /> 
            <span className="text-white/20 md:mx-2">&</span> <span className="text-white">Ateliers</span>
          </h1>
          
          <div className="flex flex-col md:flex-row gap-6 w-full mt-10">
            <div className="relative border-b border-white/10 flex items-center flex-1 group focus-within:border-[#C9A24D] transition-all">
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
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
                  {categoryData?.subcategories?.map((sub: any) => (
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
              <div className="flex justify-between items-end mb-8 pb-4 border-b border-white/5">
                <h3 className="text-white text-[10px] font-black uppercase tracking-[0.5em]">Price Limit</h3>
                <span className="text-[11px] font-bold text-[#C9A24D]">KES {maxPrice.toLocaleString()}</span>
              </div>
              <input 
                type="range" min="0" max="1000000" step="5000" value={maxPrice} 
                onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
                className="w-full accent-[#C9A24D] bg-white/10 h-[1px] appearance-none cursor-pointer" 
              />
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16">
            {processedItems.map((p: any) => (
              <JewelleryCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
          {processedItems.length === 0 && (
             <div className="py-40 text-center opacity-40">
                <Gem size={40} strokeWidth={1} className="mx-auto mb-6" />
                <p className="text-[10px] uppercase tracking-[0.5em]">The vault is empty for this criteria</p>
             </div>
          )}
        </section>
      </div>

      {/* MOBILE REFINE MODAL */}
      <div className={`fixed inset-0 z-[100] transition-transform duration-700 ease-in-out ${isFilterOpen ? "translate-y-0" : "translate-y-full"}`}>
         <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={() => setIsFilterOpen(false)} />
         <div className="relative h-full flex flex-col p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
               <span className="text-[#C9A24D] text-[11px] font-black uppercase tracking-[0.5em]">Refine Archive</span>
               <button onClick={() => setIsFilterOpen(false)} className="p-3 bg-white/5 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="space-y-12">
               <section>
                  <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] mb-6">Sort Archive</p>
                  <div className="grid grid-cols-1 gap-2">
                     {[
                        { label: "Newest Pieces", val: "latest" },
                        { label: "Price: High to Low", val: "price-high" },
                        { label: "Price: Low to High", val: "price-low" }
                     ].map((opt) => (
                        <button 
                          key={opt.val} 
                          onClick={() => setSortBy(opt.val as any)} 
                          className={`w-full py-4 px-6 text-left text-[11px] uppercase tracking-widest border transition-all flex justify-between items-center ${sortBy === opt.val ? "border-[#C9A24D] text-[#C9A24D] bg-[#C9A24D]/5" : "border-white/5 text-white/30"}`}
                        >
                            {opt.label} {sortBy === opt.val && <Check size={14} />}
                        </button>
                     ))}
                  </div>
               </section>

               <section>
                  <div className="flex justify-between mb-6">
                    <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em]">Investment Range</p>
                    <span className="text-[12px] text-[#C9A24D] font-bold">KES {maxPrice.toLocaleString()}</span>
                  </div>
                  <input type="range" min="0" max="1000000" step="10000" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-[#C9A24D]" />
               </section>

               <section className="pb-32">
                  <p className="text-gray-600 text-[10px] uppercase tracking-[0.4em] mb-6">By Collection</p>
                  <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => setSelectedSubCat("all")} className={`py-4 text-[10px] uppercase border tracking-widest ${selectedSubCat === "all" ? "border-[#C9A24D] text-[#C9A24D]" : "border-white/5 text-white/30"}`}>All</button>
                     {categoryData?.subcategories?.map((sub: any) => (
                        <button 
                          key={sub.id} 
                          onClick={() => setSelectedSubCat(sub.id)} 
                          className={`py-4 px-2 text-[10px] uppercase border truncate tracking-widest ${selectedSubCat === sub.id ? "border-[#C9A24D] text-[#C9A24D]" : "border-white/5 text-white/30"}`}
                        >
                          {sub.name}
                        </button>
                     ))}
                  </div>
               </section>
            </div>

            <button 
              onClick={() => setIsFilterOpen(false)} 
              className="fixed bottom-8 left-8 right-8 bg-white text-black py-6 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl"
            >
                Confirm Archive Selection ({processedItems.length})
            </button>
         </div>
      </div>

      <Footer />
    </main>
  );
};

export default JewelleryPage;