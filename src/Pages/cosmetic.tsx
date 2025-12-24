import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- TYPES ---
interface Cosmetic {
  id: string;
  name: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  availableBranches: string[];
  category: "Skincare" | "Makeup" | "Lipstick" | "Foundation";
  skinType: "All" | "Oily" | "Dry" | "Sensitive";
  badge?: string;
  finish?: string; // e.g., Matte, Glow, Satin
}

// --- STATIC DATA ---
const COSMETICS_DATA: Cosmetic[] = [
  {
    id: "c1",
    name: "Velvet Matte Lipstick",
    brand: "Anma Beauty",
    originalPrice: 45,
    discountedPrice: 35,
    image: "https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&w=400&q=80",
    availableBranches: ["Westlands", "Mombasa"],
    category: "Lipstick",
    skinType: "All",
    finish: "Matte",
    badge: "BEST SELLER"
  },
  {
    id: "c2",
    name: "Radiant Foundation",
    brand: "Luxe Glow",
    originalPrice: 80,
    discountedPrice: 65,
    image: "https://images.unsplash.com/photo-1599733589046-10c005739ef0?auto=format&fit=crop&w=400&q=80",
    availableBranches: ["Nairobi Central"],
    category: "Foundation",
    skinType: "Dry",
    finish: "Glow",
    badge: "NEW"
  },
  {
    id: "c3",
    name: "Hydrating Serum",
    brand: "Anma Skin",
    originalPrice: 110,
    discountedPrice: 110,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    availableBranches: ["Westlands", "Nairobi Central"],
    category: "Skincare",
    skinType: "Sensitive",
    badge: "PURE"
  },
];

const BRANCHES = ["All Branches", "Westlands", "Nairobi Central", "Mombasa"];
const SKIN_TYPES = ["All", "Oily", "Dry", "Sensitive"];

const CosmeticsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");
  const [selectedSkinType, setSelectedSkinType] = useState<string>("All");

  const filteredCosmetics = useMemo(() => {
    return COSMETICS_DATA.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranch === "All Branches" || c.availableBranches.includes(selectedBranch);
      const matchesSkin = selectedSkinType === "All" || c.skinType === selectedSkinType;

      return matchesSearch && matchesBranch && matchesSkin;
    });
  }, [searchTerm, selectedBranch, selectedSkinType]);

  return (
    <main className="bg-[#0B0B0B] min-h-screen text-white">
      <Navbar />

      {/* HERO / SEARCH SECTION */}
      <section className="bg-[#141414] py-16 px-4 border-b border-[#C9A24D]/20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#C9A24D] mb-4 uppercase tracking-tighter">Anma Beauty</h1>
          <p className="text-gray-400 mb-10 tracking-widest text-sm">Enhance your natural radiance with our premium selection</p>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Branch Filter */}
            <select
              className="bg-[#0B0B0B] border border-[#C9A24D]/30 rounded-full py-4 px-6 focus:outline-none text-white appearance-none"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {BRANCHES.map(b => <option key={b} value={b}>{b === "All Branches" ? "Select Branch" : b}</option>)}
            </select>

            {/* Skin Type Filter */}
            <select
              className="bg-[#0B0B0B] border border-[#C9A24D]/30 rounded-full py-4 px-6 focus:outline-none text-white appearance-none"
              value={selectedSkinType}
              onChange={(e) => setSelectedSkinType(e.target.value)}
            >
              {SKIN_TYPES.map(s => <option key={s} value={s}>{s === "All" ? "All Skin Types" : `${s} Skin`}</option>)}
            </select>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search beauty..."
                className="w-full bg-[#0B0B0B] border border-[#C9A24D]/30 rounded-full py-4 px-12 focus:outline-none text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-5 top-4.5 text-[#C9A24D]">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* SMALL SIDEBAR FOR CATEGORIES */}
        <aside className="w-full lg:w-48 flex-shrink-0">
          <h3 className="text-[#C9A24D] font-bold text-xs uppercase mb-6 tracking-[0.2em]">Beauty Menu</h3>
          <div className="space-y-4 text-gray-400 text-sm">
            {["Face", "Lips", "Eyes", "Skincare", "Accessories"].map(cat => (
              <div key={cat} className="hover:text-white cursor-pointer transition-colors border-l border-white/10 pl-4 py-1 hover:border-[#C9A24D]">
                {cat}
              </div>
            ))}
          </div>
        </aside>

        {/* LISTINGS */}
        <section className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCosmetics.map((item) => (
              <div key={item.id} className="bg-[#141414] group rounded-sm border border-white/5 overflow-hidden flex flex-col">
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {item.badge && (
                    <span className="absolute top-2 left-2 bg-white text-black text-[9px] font-black px-2 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow text-center">
                  <p className="text-[#C9A24D] text-[10px] uppercase font-bold tracking-widest mb-1">{item.brand}</p>
                  <h3 className="text-sm font-medium h-10 line-clamp-2 mb-2">{item.name}</h3>
                  
                  {/* Beauty Specific Tag */}
                  <div className="flex justify-center gap-2 mb-4">
                    <span className="text-[10px] text-gray-500 border border-gray-800 px-2 py-0.5 rounded-sm">
                      {item.skinType} Skin
                    </span>
                    {item.finish && (
                      <span className="text-[10px] text-[#C9A24D] border border-[#C9A24D]/30 px-2 py-0.5 rounded-sm">
                        {item.finish}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-center items-center gap-2 mb-4">
                       <span className="text-lg font-bold">KES {item.discountedPrice}</span>
                       {item.discountedPrice < item.originalPrice && (
                         <span className="text-gray-500 line-through text-xs">KES {item.originalPrice}</span>
                       )}
                    </div>
                    
                    <button className="w-full py-2.5 bg-transparent border border-white hover:bg-white hover:text-black text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                      Add To Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCosmetics.length === 0 && (
            <div className="text-center py-24 border border-dashed border-white/10 rounded-xl">
              <p className="text-gray-500">No beauty products match your current filters.</p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default CosmeticsPage;