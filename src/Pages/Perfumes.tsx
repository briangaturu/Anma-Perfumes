import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useGetCategoryDetailsQuery } from "../features/Apis/Categories.APi";
import { useGetAllProductsQuery } from "../features/Apis/products.Api";

const PERFUME_CATEGORY_ID = "41b8ee5a-b37c-4428-b60b-ce15e4a30d6e";

type SortOption = "latest" | "price-low" | "price-high";

const PerfumesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubCat, setSelectedSubCat] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  // 1. DATA FETCHING
  const { data: categoryData, isLoading: catLoading } = useGetCategoryDetailsQuery(PERFUME_CATEGORY_ID);
  const { data: productsData, isLoading: prodLoading } = useGetAllProductsQuery({ 
    categoryId: PERFUME_CATEGORY_ID,
    limit: 100 
  });

  // 2. FLASH DEAL HELPER
  const getActiveFlashDeal = (product: any) => {
    if (!product.flashDeals || product.flashDeals.length === 0) return null;
    const now = new Date();
    return product.flashDeals.find((deal: any) => {
      return deal.isActive && now >= new Date(deal.startTime) && now <= new Date(deal.endTime);
    });
  };

  // 3. FILTERING & SORTING LOGIC
  const processedPerfumes = useMemo(() => {
    // FIX: If productsData is already the array, use it. Otherwise, check for .data
    const rawList = Array.isArray(productsData) ? productsData : productsData?.data || [];

    let filtered = rawList.filter((p: any) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubCat = selectedSubCat === "all" || p.subcategoryId === selectedSubCat;
      return matchesSearch && matchesSubCat;
    });

    return filtered.sort((a: any, b: any) => {
      const dealA = getActiveFlashDeal(a);
      const dealB = getActiveFlashDeal(b);
      const priceA = dealA ? parseFloat(dealA.flashPrice) : parseFloat(a.basePrice);
      const priceB = dealB ? parseFloat(dealB.flashPrice) : parseFloat(b.basePrice);

      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [searchTerm, selectedSubCat, sortBy, productsData]);

  if (catLoading || prodLoading) return (
    <div className="h-screen bg-[#0B0B0B] flex items-center justify-center text-[#C9A24D] uppercase tracking-[0.5em] animate-pulse">
      Curating Collection...
    </div>
  );

  return (
    <main className="bg-[#0B0B0B] min-h-screen text-white font-sans">
      <Navbar />

      <header className="pt-32 pb-12 px-6 border-b border-[#C9A24D]/10 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-light italic mb-2 tracking-tighter uppercase">
              The <span className="text-[#C9A24D] not-italic font-bold">Fragrance</span> Gallery
            </h1>
            <p className="text-gray-500 uppercase text-[10px] tracking-[0.4em] font-bold">
              {categoryData?.description || "Exquisite Selection"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
            <div className="relative border-b border-white/20 min-w-[200px]">
              <input
                type="text"
                placeholder="SEARCH..."
                className="bg-transparent py-2 focus:outline-none text-[11px] uppercase tracking-widest w-full text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent border-b border-white/20 py-2 text-[11px] uppercase tracking-widest focus:outline-none cursor-pointer text-[#C9A24D]"
            >
              <option value="latest" className="bg-black">Newest First</option>
              <option value="price-low" className="bg-black">Price: Low-High</option>
              <option value="price-high" className="bg-black">Price: High-Low</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* SIDEBAR */}
        <aside className="lg:col-span-3">
          <div className="sticky top-32">
            <h3 className="text-white text-[11px] font-black uppercase tracking-[0.3em] mb-8 pb-4 border-b border-white/5">
              Fragrance Families
            </h3>
            <ul className="space-y-6">
              <li 
                onClick={() => setSelectedSubCat("all")}
                className={`text-[11px] uppercase tracking-[0.2em] cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                  selectedSubCat === "all" ? "text-[#C9A24D] translate-x-2" : "text-gray-500 hover:text-white"
                }`}
              >
                <div className={`h-[1px] w-4 bg-[#C9A24D] transition-all ${selectedSubCat === "all" ? "opacity-100" : "opacity-0"}`} />
                All Perfumes
              </li>
              {categoryData?.subcategories?.map((sub) => (
                <li 
                  key={sub.id}
                  onClick={() => setSelectedSubCat(sub.id)}
                  className={`text-[11px] uppercase tracking-[0.2em] cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                    selectedSubCat === sub.id ? "text-[#C9A24D] translate-x-2" : "text-gray-500 hover:text-white"
                  }`}
                >
                  <div className={`h-[1px] w-4 bg-[#C9A24D] transition-all ${selectedSubCat === sub.id ? "opacity-100" : "opacity-0"}`} />
                  {sub.name}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* GRID */}
        <section className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-16">
            {processedPerfumes.map((product: any) => {
              const activeDeal = getActiveFlashDeal(product);
              
              // IMAGE LOGIC: Targeting your 'image/jpeg' structure
              const imageItem = product.media?.find((m: any) => m.type.includes("image"));
              const displayImg = imageItem?.url || "https://via.placeholder.com/600x800";
              
              return (
                <div key={product.id} className="group flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#111] mb-6">
                    <img 
                      src={displayImg} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
                    />
                    
                    {activeDeal && (
                      <div className="absolute top-0 right-0 bg-[#C9A24D] text-black text-[9px] font-black px-4 py-2 uppercase tracking-widest z-10">
                        Private Offer
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                      <button 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="bg-white text-black px-10 py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#C9A24D] transition-colors"
                      >
                        Discover
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[14px] font-light tracking-[0.1em] group-hover:text-[#C9A24D] transition-colors uppercase italic">
                      {product.name}
                    </h2>
                    
                    <div className="flex items-center gap-3">
                      {activeDeal ? (
                        <>
                          <span className="text-white font-bold text-sm">KES {parseFloat(activeDeal.flashPrice).toLocaleString()}</span>
                          <span className="text-gray-600 line-through text-[10px]">KES {parseFloat(product.basePrice).toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-sm font-light tracking-widest text-gray-400">KES {parseFloat(product.basePrice).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default PerfumesPage;