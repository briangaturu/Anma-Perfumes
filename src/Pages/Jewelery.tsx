import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- TYPES ---
interface Jewelry {
  id: string;
  name: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  availableBranches: string[];
  category: "Rings" | "Necklaces" | "Bracelets" | "Earrings" | "Watches";
  material: "Gold" | "Silver" | "Diamond" | "Rose Gold";
  badge?: string;
  karat?: string;
}

// --- MASSIVE DATASET (20+ Items) ---
const JEWELRY_DATA: Jewelry[] = [
  // RINGS
  { id: "j1", name: "Eternity Diamond Band", brand: "Anma Fine Jewelry", originalPrice: 1200, discountedPrice: 950, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands", "Nairobi Central"], category: "Rings", material: "Diamond", karat: "18K", badge: "PREMIUM" },
  { id: "j2", name: "Classic Gold Chain", brand: "Anma Luxe", originalPrice: 450, discountedPrice: 450, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands"], category: "Necklaces", material: "Gold", karat: "22K", badge: "NEW" },
  { id: "j3", name: "Sterling Silver Bracelet", brand: "Anma Essentials", originalPrice: 180, discountedPrice: 150, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80", availableBranches: ["Mombasa", "Nairobi Central"], category: "Bracelets", material: "Silver", karat: "Sterling" },
  { id: "j4", name: "Sapphire Solitaire Ring", brand: "Anma Fine Jewelry", originalPrice: 800, discountedPrice: 720, image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands"], category: "Rings", material: "Gold", karat: "18K" },
  { id: "j5", name: "Rose Gold Infinity Ring", brand: "Anma Luxe", originalPrice: 300, discountedPrice: 250, image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&w=400&q=80", availableBranches: ["Nairobi Central"], category: "Rings", material: "Rose Gold", karat: "14K" },

  // WATCHES
  { id: "w1", name: "Royal Oyster Gold Watch", brand: "Anma Timepieces", originalPrice: 2500, discountedPrice: 2100, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands"], category: "Watches", material: "Gold", badge: "HOT" },
  { id: "w2", name: "Midnight Silver Chrono", brand: "Anma Timepieces", originalPrice: 600, discountedPrice: 550, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80", availableBranches: ["Mombasa"], category: "Watches", material: "Silver" },
  { id: "w3", name: "Diamond Bezel Quartz", brand: "Anma Timepieces", originalPrice: 3500, discountedPrice: 3500, image: "https://images.unsplash.com/photo-1542491595-3075c4962942?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands"], category: "Watches", material: "Diamond", badge: "EXCLUSIVE" },

  // NECKLACES
  { id: "n1", name: "Pearl Drop Pendant", brand: "Anma Fine Jewelry", originalPrice: 220, discountedPrice: 190, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80", availableBranches: ["Nairobi Central"], category: "Necklaces", material: "Silver", karat: "Sterling" },
  { id: "n2", name: "Chunky Gold Link", brand: "Anma Essentials", originalPrice: 500, discountedPrice: 420, image: "https://images.unsplash.com/photo-1611085507273-038ad81bb699?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands", "Mombasa"], category: "Necklaces", material: "Gold", karat: "18K" },
  { id: "n3", name: "Diamond Heart Necklace", brand: "Anma Luxe", originalPrice: 1500, discountedPrice: 1300, image: "https://images.unsplash.com/photo-1599643477877-537ef5278533?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands"], category: "Necklaces", material: "Diamond", badge: "TRENDING" },

  // EARRINGS
  { id: "e1", name: "Diamond Stud Earrings", brand: "Anma Luxe", originalPrice: 900, discountedPrice: 850, image: "https://images.unsplash.com/photo-1535633302704-b02f4fad253b?auto=format&fit=crop&w=400&q=80", availableBranches: ["Nairobi Central"], category: "Earrings", material: "Diamond" },
  { id: "e2", name: "Gold Hoop 24mm", brand: "Anma Essentials", originalPrice: 120, discountedPrice: 100, image: "https://images.unsplash.com/photo-1590548784585-643d2b9f2922?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands", "Mombasa"], category: "Earrings", material: "Gold", karat: "22K" },
  { id: "e3", name: "Rose Gold Drop Earrings", brand: "Anma Fine Jewelry", originalPrice: 350, discountedPrice: 280, image: "https://images.unsplash.com/photo-1616593437250-06294d54b63e?auto=format&fit=crop&w=400&q=80", availableBranches: ["Nairobi Central"], category: "Earrings", material: "Rose Gold" },

  // BRACELETS
  { id: "b1", name: "Diamond Tennis Bracelet", brand: "Anma Luxe", originalPrice: 4000, discountedPrice: 3800, image: "https://images.unsplash.com/photo-1535633602704-b02f4fad253b?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands"], category: "Bracelets", material: "Diamond", badge: "PREMIUM" },
  { id: "b2", name: "Braided Gold Bangle", brand: "Anma Essentials", originalPrice: 600, discountedPrice: 540, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80", availableBranches: ["Mombasa"], category: "Bracelets", material: "Gold", karat: "18K" },
  { id: "b3", name: "Silver Charm Bracelet", brand: "Anma Essentials", originalPrice: 150, discountedPrice: 120, image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=400&q=80", availableBranches: ["Nairobi Central"], category: "Bracelets", material: "Silver" },
  
  // EXTRA PRODUCTS
  { id: "j6", name: "Gold Wedding Band", brand: "Anma Fine Jewelry", originalPrice: 400, discountedPrice: 350, image: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?auto=format&fit=crop&w=400&q=80", availableBranches: ["Westlands"], category: "Rings", material: "Gold" },
  { id: "w4", name: "Lady Datejust Silver", brand: "Anma Timepieces", originalPrice: 1200, discountedPrice: 1100, image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=400&q=80", availableBranches: ["Nairobi Central"], category: "Watches", material: "Silver" },
  { id: "n4", name: "Gold Choker", brand: "Anma Essentials", originalPrice: 280, discountedPrice: 200, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80", availableBranches: ["Mombasa"], category: "Necklaces", material: "Gold" },
];

const BRANCHES = ["All Branches", "Westlands", "Nairobi Central", "Mombasa"];
const MATERIALS = ["All Materials", "Gold", "Silver", "Diamond", "Rose Gold"];

const JewelryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("All Materials");
  const [visibleCount, setVisibleCount] = useState<number>(12); // Initial visible products

  const filteredJewelry = useMemo(() => {
    return JEWELRY_DATA.filter((j) => {
      const matchesSearch = j.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            j.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranch === "All Branches" || j.availableBranches.includes(selectedBranch);
      const matchesMaterial = selectedMaterial === "All Materials" || j.material === selectedMaterial;

      return matchesSearch && matchesBranch && matchesMaterial;
    });
  }, [searchTerm, selectedBranch, selectedMaterial]);

  const loadMore = () => setVisibleCount((prev) => prev + 8);

  return (
    <main className="bg-[#0B0B0B] min-h-screen text-white">
      <Navbar />

      {/* HERO / SEARCH SECTION */}
      <section className="bg-[#141414] py-16 px-4 border-b border-[#C9A24D]/20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#C9A24D] mb-4 uppercase tracking-tighter italic">The Jewelry Vault</h1>
          <p className="text-gray-400 mb-10 tracking-[0.3em] text-[10px] uppercase font-bold">Timeless Pieces • Exceptional Craft</p>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="bg-[#0B0B0B] border border-[#C9A24D]/30 rounded-full py-4 px-6 focus:outline-none text-white appearance-none cursor-pointer"
              value={selectedBranch}
              onChange={(e) => {setSelectedBranch(e.target.value); setVisibleCount(12);}}
            >
              {BRANCHES.map(b => <option key={b} value={b}>{b === "All Branches" ? "Filter by Store" : b}</option>)}
            </select>

            <select
              className="bg-[#0B0B0B] border border-[#C9A24D]/30 rounded-full py-4 px-6 focus:outline-none text-white appearance-none cursor-pointer"
              value={selectedMaterial}
              onChange={(e) => {setSelectedMaterial(e.target.value); setVisibleCount(12);}}
            >
              {MATERIALS.map(m => <option key={m} value={m}>{m === "All Materials" ? "All Metals" : m}</option>)}
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                className="w-full bg-[#0B0B0B] border border-[#C9A24D]/30 rounded-full py-4 px-12 focus:outline-none text-white shadow-lg"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setVisibleCount(12);}}
              />
              <span className="absolute left-5 top-4.5 text-[#C9A24D]">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="text-[#C9A24D] font-bold text-xs uppercase mb-6 tracking-widest border-b border-white/10 pb-2">Collections</h3>
            <div className="space-y-4 text-gray-500 text-sm">
              {["Full Vault", "Engagement", "Luxury Timepieces", "Gold Chains", "Diamond Series"].map(cat => (
                <div key={cat} className="hover:text-white cursor-pointer transition-colors border-l-2 border-transparent hover:border-[#C9A24D] pl-4">
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* LISTINGS */}
        <section className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJewelry.slice(0, visibleCount).map((item) => (
              <div key={item.id} className="bg-[#141414] group rounded-md border border-white/5 overflow-hidden flex flex-col hover:border-[#C9A24D]/40 transition-all duration-300">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#1A1A1A]">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                  />
                  {item.badge && (
                    <span className="absolute top-3 left-3 bg-[#C9A24D] text-black text-[8px] font-black px-2 py-0.5 tracking-tighter">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow text-center">
                  <p className="text-[#C9A24D] text-[9px] uppercase font-bold tracking-[0.2em] mb-1">{item.brand}</p>
                  <h3 className="text-xs font-medium h-9 line-clamp-2 mb-2 leading-tight">{item.name}</h3>
                  
                  <div className="flex justify-center gap-1 mb-4">
                    <span className="text-[9px] text-gray-500 bg-black/40 px-2 py-0.5 rounded-sm">
                      {item.material}
                    </span>
                    {item.karat && (
                      <span className="text-[9px] text-[#C9A24D] bg-[#C9A24D]/10 px-2 py-0.5 rounded-sm font-bold">
                        {item.karat}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-center items-center gap-2 mb-4">
                       <span className="text-base font-bold">KES {item.discountedPrice.toLocaleString()}</span>
                       {item.discountedPrice < item.originalPrice && (
                         <span className="text-gray-500 line-through text-[10px]">KES {item.originalPrice.toLocaleString()}</span>
                       )}
                    </div>
                    
                    <button className="w-full py-2.5 bg-transparent border border-white/20 hover:bg-[#C9A24D] hover:text-black hover:border-[#C9A24D] text-white text-[9px] font-bold uppercase tracking-widest transition-all">
                      View Piece
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LOAD MORE BUTTON */}
          {visibleCount < filteredJewelry.length && (
            <div className="mt-16 text-center">
              <button 
                onClick={loadMore}
                className="px-10 py-4 bg-[#141414] border border-[#C9A24D]/40 text-[#C9A24D] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#C9A24D] hover:text-black transition-all"
              >
                Load More Pieces
              </button>
            </div>
          )}

          {filteredJewelry.length === 0 && (
            <div className="text-center py-32 bg-[#141414]/50 rounded-xl border border-dashed border-white/10">
              <p className="text-gray-500 italic">"No pieces match your current vault selection..."</p>
              <button onClick={() => {setSearchTerm(""); setSelectedMaterial("All Materials");}} className="mt-4 text-[#C9A24D] text-sm underline">Clear Filters</button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default JewelryPage;