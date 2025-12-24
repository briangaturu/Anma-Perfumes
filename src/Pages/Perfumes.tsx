import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- TYPES (Updated with Intensity and Notes) ---
interface Perfume {
  id: string;
  name: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  availableBranches: string[];
  category: string;
  badge?: string;
  intensity: number; // Scale 1-5
  notes: string;     // e.g., "Vanilla, Amber, Oud"
}

// --- STATIC DATA ---
const PERFUMES_DATA: Perfume[] = [
  {
    id: "p1",
    name: "Vanilla Oud",
    brand: "Anma Private Collection",
    originalPrice: 120,
    discountedPrice: 95,
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=400&q=80",
    availableBranches: ["Westlands", "Nairobi Central"],
    category: "Oriental",
    badge: "HOT",
    intensity: 5,
    notes: "Top: Vanilla | Heart: Saffron | Base: Agarwood"
  },
  {
    id: "p2",
    name: "Midnight Rose",
    brand: "Anma Luxury",
    originalPrice: 150,
    discountedPrice: 150,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80",
    availableBranches: ["Westlands"],
    category: "Floral",
    badge: "NEW",
    intensity: 3,
    notes: "Top: Rose | Heart: Pink Pepper | Base: Musk"
  },
  {
    id: "p3",
    name: "Desert Musk",
    brand: "Classic Scents",
    originalPrice: 90,
    discountedPrice: 75,
    image: "https://images.unsplash.com/photo-1547671722-1263ef2ec39c?auto=format&fit=crop&w=400&q=80",
    availableBranches: ["Mombasa", "Nairobi Central"],
    category: "Woody",
    intensity: 4,
    notes: "Top: Bergamot | Heart: Cedar | Base: White Musk"
  },
];

const BRANCHES = ["All Branches", "Westlands", "Nairobi Central", "Mombasa"];

const PerfumesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("All Branches");

  // Logic to search by Name OR Brand AND Filter by selected Branch
  const filteredPerfumes = useMemo(() => {
    return PERFUMES_DATA.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBranch = 
        selectedBranch === "All Branches" || 
        p.availableBranches.includes(selectedBranch);

      return matchesSearch && matchesBranch;
    });
  }, [searchTerm, selectedBranch]);

  return (
    <main className="bg-[#0B0B0B] min-h-screen text-white">
      <Navbar />

      {/* SEARCH HEADER SECTION */}
      <section className="bg-[#141414] py-12 px-4 border-b border-[#C9A24D]/20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-[#C9A24D] mb-4">Our Perfume Collection</h1>
          <p className="text-gray-400 mb-8">Discover exclusive scents available at your nearest branch.</p>
          
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
            {/* Branch Dropdown */}
            <div className="relative w-full md:w-1/3">
              <select
                className="w-full bg-[#0B0B0B] border border-[#C9A24D]/30 rounded-full py-4 px-6 appearance-none focus:outline-none focus:border-[#C9A24D] text-white cursor-pointer"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {BRANCHES.map(branch => (
                  <option key={branch} value={branch} className="bg-[#141414]">{branch}</option>
                ))}
              </select>
              <span className="absolute right-5 top-5 text-[#C9A24D] pointer-events-none text-xs">▼</span>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-2/3">
              <input
                type="text"
                placeholder="Search by perfume name or brand..."
                className="w-full bg-[#0B0B0B] border border-[#C9A24D]/30 rounded-full py-4 px-12 focus:outline-none focus:border-[#C9A24D] transition-all text-white shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-5 top-4.5 text-[#C9A24D]">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR FILTERS */}
        <aside className="lg:col-span-3 space-y-6 hidden lg:block">
          <div className="bg-[#141414] p-6 rounded-xl border border-white/5">
            <h3 className="text-[#C9A24D] font-bold uppercase tracking-widest text-sm mb-4">Categories</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-[#C9A24D] cursor-pointer transition">Oriental</li>
              <li className="hover:text-[#C9A24D] cursor-pointer transition">Woody</li>
              <li className="hover:text-[#C9A24D] cursor-pointer transition">Floral</li>
              <li className="hover:text-[#C9A24D] cursor-pointer transition">Fresh</li>
            </ul>
          </div>

          <div className="bg-[#141414] p-6 rounded-xl border border-white/5">
            <h3 className="text-[#C9A24D] font-bold uppercase tracking-widest text-sm mb-4">Quick Scent Guide</h3>
            <div className="text-[11px] text-gray-500 leading-relaxed">
              Find the perfect longevity and sillage for any occasion.
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <section className="lg:col-span-9">
          <div className="flex justify-between items-center mb-6 px-2">
            <p className="text-gray-400">
              {selectedBranch !== "All Branches" ? `Available in ${selectedBranch}` : "All Fragrances"} ({filteredPerfumes.length})
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPerfumes.map((perfume) => (
              <div 
                key={perfume.id} 
                className="bg-[#141414] rounded-xl overflow-hidden border border-white/5 group hover:border-[#C9A24D]/50 transition-all shadow-xl flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
                  <img 
                    src={perfume.image} 
                    alt={perfume.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {perfume.badge && (
                    <span className="absolute top-3 left-3 bg-[#C9A24D] text-black text-[10px] font-bold px-2 py-1 rounded">
                      {perfume.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col">
                  <p className="text-[#C9A24D] text-[10px] uppercase tracking-tighter mb-1 font-semibold">{perfume.brand}</p>
                  <h3 className="text-lg font-medium mb-1 truncate">{perfume.name}</h3>
                  
                  {/* Notes Info */}
                  <p className="text-[10px] text-gray-500 italic mb-2 line-clamp-1">{perfume.notes}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-white font-bold text-lg">KES {perfume.discountedPrice}</span>
                    {perfume.discountedPrice < perfume.originalPrice && (
                      <span className="text-gray-500 line-through text-sm">KES {perfume.originalPrice}</span>
                    )}
                  </div>

                  {/* Intensity Scale */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] text-gray-500 uppercase">Intensity</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div 
                          key={step} 
                          className={`h-1 w-3 rounded-full ${step <= perfume.intensity ? 'bg-[#C9A24D]' : 'bg-white/10'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Branch Availability Tags */}
                  <div className="flex flex-wrap gap-1 mt-auto mb-4">
                    {perfume.availableBranches.map((branch) => (
                      <span 
                        key={branch} 
                        className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors ${
                          branch === selectedBranch 
                          ? "bg-[#C9A24D] text-black border-[#C9A24D]" 
                          : "bg-white/5 text-gray-400 border-white/10"
                        }`}
                      >
                        {branch}
                      </span>
                    ))}
                  </div>

                  <button className="w-full py-2 bg-[#C9A24D] text-black font-bold rounded-md hover:bg-[#E0B860] transition-colors text-sm">
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPerfumes.length === 0 && (
            <div className="text-center py-20 bg-[#141414] rounded-2xl border border-dashed border-white/10">
              <p className="text-gray-500 text-xl font-serif italic mb-4">"No fragrances found for this selection..."</p>
              <button 
                onClick={() => {setSearchTerm(""); setSelectedBranch("All Branches");}}
                className="text-[#C9A24D] border-b border-[#C9A24D] pb-1 hover:text-white hover:border-white transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default PerfumesPage;