import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- TYPES ---
interface Perfume {
  id: string;
  name: string;
  pricePerMl: number;
  image: string;
  notes: string;
}

interface MixingItem {
  perfume: Perfume;
}

// --- DATA ---
const AVAILABLE_PERFUMES: Perfume[] = [
  { id: "p1", name: "Oud Wood", pricePerMl: 80, notes: "Woody, Earthy, Intense", image: "https://images.unsplash.com/photo-1544467316-e97a182d9de0?auto=format&fit=crop&w=200&q=80" },
  { id: "p2", name: "Vanilla Sky", pricePerMl: 40, notes: "Sweet, Gourmand, Warm", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=200&q=80" },
  { id: "p3", name: "Rose Seduction", pricePerMl: 60, notes: "Floral, Petals, Velvet", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=200&q=80" },
  { id: "p4", name: "Bergamot Bloom", pricePerMl: 45, notes: "Citrus, Sharp, Energetic", image: "https://images.unsplash.com/photo-1557170334-a7c3d40d04c5?auto=format&fit=crop&w=200&q=80" },
  { id: "p5", name: "Amber Night", pricePerMl: 70, notes: "Resinous, Deep, Smoky", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=200&q=80" },
];

const BOTTLE_SIZES = [
  { size: 5, label: "5ml Travel", price: 150 },
  { size: 10, label: "10ml Pocket", price: 300 },
  { size: 30, label: "30ml Classic", price: 600 },
  { size: 50, label: "50ml Luxury", price: 1000 },
];

const CONCENTRATIONS = [
  { type: "Standard", upcharge: 0, desc: "15% Oil - Everyday wear" },
  { type: "Intense", upcharge: 800, desc: "25% Oil - Evening wear" },
  { type: "Extrait", upcharge: 1500, desc: "35% Oil - 24hr Longevity" },
];

const BespokePerfumePage: React.FC = () => {
  // --- STATE ---
  const [selectedMix, setSelectedMix] = useState<MixingItem[]>([]);
  const [selectedSize, setSelectedSize] = useState(BOTTLE_SIZES[0]);
  const [selectedConcentration, setSelectedConcentration] = useState(CONCENTRATIONS[0]);
  const [hasOwnBottle, setHasOwnBottle] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);

  // --- PRICING LOGIC ---
  const totalPrice = useMemo(() => {
    if (selectedMix.length === 0) return 0;
    const avgPerfumePrice = selectedMix.reduce((acc, curr) => acc + curr.perfume.pricePerMl, 0) / selectedMix.length;
    const ingredientsCost = avgPerfumePrice * selectedSize.size;
    const bottleCost = hasOwnBottle ? 0 : selectedSize.price;
    return ingredientsCost + bottleCost + selectedConcentration.upcharge;
  }, [selectedMix, selectedSize, hasOwnBottle, selectedConcentration]);

  const addToMix = (perfume: Perfume) => {
    if (selectedMix.length < 3 && !selectedMix.find(m => m.perfume.id === perfume.id)) {
      setSelectedMix([...selectedMix, { perfume }]);
    }
  };

  const handleOrder = () => {
    setIsOrdered(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="bg-[#0B0B0B] min-h-screen text-white pb-20">
      <Navbar />

      {/* TRACKER OVERLAY (Visible only after ordering) */}
      {isOrdered && (
        <section className="max-w-7xl mx-auto px-4 mt-10 animate-fade-in">
          <div className="bg-[#141414] border border-[#C9A24D] p-8 rounded-lg mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🧪</div>
            <h2 className="text-[#C9A24D] font-bold uppercase tracking-widest text-sm mb-4">Order Status: Mix in Progress</h2>
            <p className="text-2xl font-serif mb-6">"{customLabel || 'Your Signature Blend'}"</p>
            
            <div className="flex justify-between text-[10px] mb-2 text-gray-400 uppercase font-bold">
              <span className="text-[#C9A24D]">Analyzing Recipe</span>
              <span>Blending</span>
              <span>Maturing</span>
              <span>Bottling</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#C9A24D] h-full w-[25%] transition-all duration-1000"></div>
            </div>
            <p className="text-[11px] text-gray-500 mt-4 italic">* Our perfumers are currently balancing your chosen oils. Maturation takes 7-14 days.</p>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 pt-12">
        <header className="mb-12">
          <h1 className="text-5xl font-serif font-bold text-[#C9A24D] mb-2 italic">The Bespoke Bar</h1>
          <p className="text-gray-500 uppercase tracking-[0.4em] text-xs">Craft your unique scent profile</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: SELECTION (Ingredients) */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-4">1. Choose Base Scents (Max 3)</h3>
            <div className="grid gap-4">
              {AVAILABLE_PERFUMES.map(p => (
                <div key={p.id} className="bg-[#141414] p-4 flex items-center justify-between border border-white/5 hover:border-[#C9A24D]/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-14 h-14 object-cover rounded shadow-lg" />
                    <div>
                      <h4 className="text-sm font-bold">{p.name}</h4>
                      <p className="text-[10px] text-gray-500">{p.notes}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToMix(p)}
                    disabled={selectedMix.length >= 3 || !!selectedMix.find(m => m.perfume.id === p.id)}
                    className="bg-[#C9A24D]/10 text-[#C9A24D] px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-[#C9A24D] hover:text-black disabled:opacity-20 transition-all"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE: THE MIXING LAB */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <h3 className="text-white font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-4">2. The Mixing Bowl</h3>
              <div className="bg-[#141414] aspect-square rounded-full border-2 border-dashed border-[#C9A24D]/20 flex flex-col items-center justify-center p-10 text-center relative">
                {selectedMix.length === 0 ? (
                  <p className="text-gray-600 italic text-sm">Add perfumes from the list to begin blending...</p>
                ) : (
                  <div className="w-full space-y-6">
                    {selectedMix.map(item => (
                      <div key={item.perfume.id} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#C9A24D]">
                          <span>{item.perfume.name}</span>
                          <button onClick={() => setSelectedMix(selectedMix.filter(m => m.perfume.id !== item.perfume.id))} className="text-red-400">Remove</button>
                        </div>
                        <div className="h-1.5 bg-black rounded-full overflow-hidden">
                          <div className="h-full bg-[#C9A24D]" style={{ width: `${100 / selectedMix.length}%` }}></div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4">
                      <div className="w-16 h-16 border-2 border-[#C9A24D] rounded-full mx-auto flex items-center justify-center animate-pulse">🧪</div>
                      <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">Balanced Master Blend</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: FINISHING & PRICE */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-4">3. Finishing Touches</h3>
            
            <div className="space-y-8">
              {/* Bottle Selection */}
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block">Bottle Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {BOTTLE_SIZES.map(b => (
                    <button 
                      key={b.size}
                      onClick={() => setSelectedSize(b)}
                      className={`p-3 text-[10px] font-bold border transition-all ${selectedSize.size === b.size ? 'border-[#C9A24D] bg-[#C9A24D]/10 text-[#C9A24D]' : 'border-white/5 text-gray-500 hover:border-white/20'}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concentration */}
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block">Scent Strength</label>
                <div className="space-y-2">
                  {CONCENTRATIONS.map(c => (
                    <button 
                      key={c.type}
                      onClick={() => setSelectedConcentration(c)}
                      className={`w-full p-4 flex justify-between items-center border transition-all ${selectedConcentration.type === c.type ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/5'}`}
                    >
                      <div className="text-left">
                        <p className={`text-[11px] font-bold ${selectedConcentration.type === c.type ? 'text-[#C9A24D]' : 'text-white'}`}>{c.type}</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-tighter">{c.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold">+{c.upcharge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Label */}
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block">Custom Bottle Name</label>
                <input 
                  type="text"
                  placeholder="e.g. For My Love, Morning Glow"
                  className="w-full bg-black border border-white/10 p-4 text-xs outline-none focus:border-[#C9A24D] transition-all"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
              </div>

              {/* Own Bottle Toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded">
                <input 
                  type="checkbox" 
                  checked={hasOwnBottle} 
                  onChange={() => setHasOwnBottle(!hasOwnBottle)}
                  className="accent-[#C9A24D]"
                />
                <span className="text-[10px] text-gray-400 font-bold uppercase">I'm providing my own bottle (- KES {selectedSize.price})</span>
              </label>

              {/* Summary & Checkout */}
              <div className="bg-[#141414] p-8 border-t-4 border-[#C9A24D] shadow-2xl">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Total Estimate</p>
                    <p className="text-3xl font-bold text-[#C9A24D]">KES {totalPrice.toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={handleOrder}
                  disabled={selectedMix.length === 0}
                  className="w-full bg-[#C9A24D] text-black font-black py-5 uppercase text-xs tracking-[0.3em] hover:bg-white transition-all disabled:opacity-20"
                >
                  Confirm & Blend
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
};

export default BespokePerfumePage;