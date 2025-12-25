import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCreateCustomPerfumeMutation, useGetBaseScentsQuery } from "../features/Apis/CustomPerfumes.Api";
import type { RootState } from "../App/store";
import { useSelector } from "react-redux";

// --- CATEGORIES ---
const SCENT_CATEGORIES = ["All", "Woody", "Smoky", "Floral", "Fresh", "Resinous", "Oriental"];

// --- PRICING CONSTANTS ---
const BOTTLE_SIZES = [
  { size: 5, label: "5ml Travel" },
  { size: 10, label: "10ml Pocket" },
];

const BOTTLE_TYPES = [
  { id: "standard", label: "Standard Bottle", costs: { 5: 30, 10: 50 } },
  { id: "unique", label: "Unique Bottle", costs: { 5: 75, 10: 150 } }
];

const BespokePerfumePage: React.FC = () => {
  const { data: availableScents, isLoading } = useGetBaseScentsQuery({ activeOnly: true });
  const [createCustomPerfume, { isLoading: isSubmitting }] = useCreateCustomPerfumeMutation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedMix, setSelectedMix] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState(BOTTLE_SIZES[0]);
  const [selectedBottleType, setSelectedBottleType] = useState(BOTTLE_TYPES[0]);
  const [hasOwnBottle, setHasOwnBottle] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  // --- LOGIC: FILTERING ---
  const filteredScents = useMemo(() => {
    return availableScents?.filter(scent => {
      const matchesSearch = scent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            scent.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || scent.notes.toLowerCase().includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [availableScents, searchTerm, activeCategory]);

  // --- LOGIC: PRICING ---
  const totalPrice = useMemo(() => {
    if (selectedMix.length === 0) return 0;
    const avgScentPrice = selectedMix.reduce((acc, curr) => acc + Number(curr.pricePerMl), 0) / selectedMix.length;
    const ingredientsCost = avgScentPrice * selectedSize.size;
    const currentBottleCost = (selectedBottleType.costs as any)[selectedSize.size];
    const bottleCost = hasOwnBottle ? 0 : currentBottleCost;
    return ingredientsCost + bottleCost; 
  }, [selectedMix, selectedSize, selectedBottleType, hasOwnBottle]);

  const handleOrder = async () => {
    if (!user) return alert("Please login to create a custom blend");
    try {
      await createCustomPerfume({
        userId: user.id,
        customName: customLabel || "ANMA Private Blend",
        baseScentIds: selectedMix.map(m => m.id),
        bottleSize: selectedSize.label as any, 
        bottleType: selectedBottleType.id as any,
        strength: "EDP", 
        providesOwnBottle: hasOwnBottle,
        totalPrice: totalPrice.toFixed(2)
      }).unwrap();
      setOrderSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert("Alchemy failed. Please check your connection.");
    }
  };

  return (
    <main className="bg-[#050505] min-h-screen text-white pb-20 selection:bg-[#C9A24D] selection:text-black">
      <Navbar />

      <div className="pt-32 lg:pt-48"> 
        
        {/* SUCCESS STATE OVERLAY */}
        {orderSuccess && (
          <section className="max-w-4xl mx-auto px-4 mb-20 animate-in fade-in zoom-in duration-1000">
            <div className="bg-[#0A0A0A] border border-[#C9A24D] p-12 text-center relative overflow-hidden shadow-[0_0_60px_rgba(201,162,77,0.1)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A24D] to-transparent"></div>
              <p className="text-[#C9A24D] text-[10px] tracking-[0.8em] uppercase mb-6 font-bold">Extraction Initiated</p>
              <h2 className="text-5xl font-serif italic mb-4">Your masterpiece is being bottled.</h2>
              <p className="text-gray-500 text-[11px] uppercase tracking-widest mb-10">Check your account dashboard for blending status.</p>
              <button 
                onClick={() => setOrderSuccess(false)}
                className="px-10 py-4 border border-[#C9A24D] text-[#C9A24D] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#C9A24D] hover:text-black transition-all"
              >
                Create Another Blend
              </button>
            </div>
          </section>
        )}

        <div className="max-w-7xl mx-auto px-4">
          <header className="mb-24 flex flex-col md:flex-row justify-between items-baseline gap-4 border-b border-white/5 pb-10">
            <div>
              <h1 className="text-6xl md:text-8xl font-serif font-bold italic tracking-tighter uppercase leading-none">
                The <span className="text-[#C9A24D] not-italic">Alchemist</span>
              </h1>
              <p className="text-gray-600 uppercase tracking-[0.8em] text-[9px] mt-2">Private Laboratory Services</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-[#C9A24D] font-mono">STATUS: HIGH_FIDELITY_MIXING</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* 1. DISCOVERY */}
            <div className="lg:col-span-4 space-y-10">
              <div className="space-y-6">
                <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.3em] border-l-2 border-[#C9A24D] pl-4">I. Source Elements</h3>
                <input 
                  type="text"
                  placeholder="SEARCH NOTES..."
                  className="w-full bg-[#111] border border-white/5 p-5 text-[10px] uppercase tracking-[0.2em] outline-none focus:border-[#C9A24D]/50 transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {SCENT_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 text-[8px] uppercase font-black border transition-all ${activeCategory === cat ? 'bg-[#C9A24D] text-black border-[#C9A24D]' : 'border-white/5 text-gray-500 hover:text-white'}`}>{cat}</button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-3 bespoke-scrollbar">
                {filteredScents?.map(scent => (
                  <div key={scent.id} className="group bg-[#0A0A0A] p-2 flex items-center justify-between border border-white/5 hover:border-[#C9A24D]/30 transition-all duration-700">
                    <div className="flex items-center gap-4">
                      <img src={scent.imageUrl} className="w-14 h-14 object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80">{scent.name}</h4>
                        <p className="text-[8px] text-gray-600 italic uppercase mt-1">{scent.notes}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedMix(prev => prev.length < 3 && !prev.find(m => m.id === scent.id) ? [...prev, scent] : prev)}
                      className="mr-3 bg-white text-black px-4 py-2 text-[9px] font-black uppercase hover:bg-[#C9A24D] transition-all"
                    >Add</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. THE MIXING BOWL (WITH OVERFLOW SCROLL) */}
            <div className="lg:col-span-4">
              <div className="sticky top-48 space-y-10 text-center">
                <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.3em]">II. Molecular Mixing</h3>
                <div className="relative aspect-square max-w-[340px] mx-auto group">
                    <div className="absolute inset-0 border border-[#C9A24D]/10 rounded-full animate-[spin_40s_linear_infinite]"></div>
                    <div className="bg-[#080808] h-full w-full rounded-full border border-white/5 flex flex-col items-center justify-start p-10 relative overflow-hidden">
                        
                        {/* THE SCROLLABLE INGREDIENT LIST */}
                        <div className="w-full mt-10 space-y-3 overflow-y-auto max-h-[220px] bespoke-scrollbar px-2 z-10">
                            {selectedMix.length === 0 ? (
                                <p className="text-gray-700 italic text-[10px] uppercase tracking-[0.4em] mt-20">Vessel Empty</p>
                            ) : (
                                selectedMix.map((item, idx) => (
                                    <div key={item.id} className="flex justify-between items-center bg-white/[0.03] p-4 border border-white/5 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-500">
                                        <div className="text-left">
                                            <p className="text-[7px] text-[#C9A24D] font-mono uppercase">Element 0{idx+1}</p>
                                            <p className="text-[10px] uppercase font-bold tracking-widest">{item.name}</p>
                                        </div>
                                        <button onClick={() => setSelectedMix(selectedMix.filter(m => m.id !== item.id))} className="text-white/20 hover:text-red-500 transition-colors text-[10px]">✕</button>
                                    </div>
                                ))
                            )}
                        </div>

                        {selectedMix.length > 0 && (
                            <div className="mt-6 animate-pulse">
                                <span className="text-xl">🧪</span>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </div>

            {/* 3. FINISHING */}
            <div className="lg:col-span-4 space-y-10">
              <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.3em] border-r-2 border-[#C9A24D] pr-4 text-right">III. Final Specification</h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">Bespoke Label</label>
                  <input 
                    type="text"
                    placeholder="UNTITLED ATELIER..."
                    className="w-full bg-[#111] border border-white/5 p-5 text-[11px] text-[#C9A24D] uppercase outline-none focus:border-[#C9A24D]/40 transition-all font-bold"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">Vessel Aesthetic</label>
                  <div className="grid grid-cols-2 gap-4">
                    {BOTTLE_TYPES.map(type => (
                      <button 
                        key={type.id}
                        disabled={hasOwnBottle}
                        onClick={() => setSelectedBottleType(type)}
                        className={`p-5 text-[9px] uppercase font-black border transition-all ${selectedBottleType.id === type.id && !hasOwnBottle ? 'border-[#C9A24D] bg-[#C9A24D]/5 text-[#C9A24D]' : 'border-white/5 text-gray-600'} ${hasOwnBottle ? 'opacity-10' : 'hover:border-white/20'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {BOTTLE_SIZES.map(b => (
                    <button key={b.size} onClick={() => setSelectedSize(b)} className={`p-5 text-[9px] uppercase font-black border transition-all ${selectedSize.size === b.size ? 'border-[#C9A24D] bg-[#C9A24D]/5 text-[#C9A24D]' : 'border-white/5 text-gray-600'}`}>
                      {b.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <label className={`flex items-center gap-5 cursor-pointer p-6 border transition-all duration-700 ${hasOwnBottle ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/5 bg-white/[0.01]'}`}>
                    <input type="checkbox" checked={hasOwnBottle} onChange={() => setHasOwnBottle(!hasOwnBottle)} className="w-4 h-4 accent-[#C9A24D]" />
                    <div>
                      <span className="text-[10px] text-white font-black uppercase tracking-[0.2em] block">Providing Personal Vessel</span>
                      <span className="text-[8px] text-[#C9A24D] italic uppercase">Bottle Credit Applied</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* VALUATION */}
              <div className="bg-[#0A0A0A] p-10 border border-[#C9A24D]/20 relative group overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A24D] to-transparent"></div>
                <div className="mb-8">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.4em] mb-4 text-center">Grand Total</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-lg font-light text-[#C9A24D]">KES</span>
                        <span className="text-6xl font-serif font-bold text-white tracking-tighter">
                            {totalPrice.toLocaleString()}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={handleOrder}
                    disabled={selectedMix.length === 0 || isSubmitting}
                    className="w-full bg-[#C9A24D] text-black font-black py-6 uppercase text-[11px] tracking-[0.5em] hover:bg-white transition-all shadow-[0_10px_30px_rgba(201,162,77,0.2)]"
                >
                    {isSubmitting ? "BLENDING..." : "CONFIRM CREATION"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      <style>{`
        .bespoke-scrollbar::-webkit-scrollbar { width: 3px; }
        .bespoke-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .bespoke-scrollbar::-webkit-scrollbar-thumb { background: #C9A24D; border-radius: 10px; }
      `}</style>
    </main>
  );
};

export default BespokePerfumePage;