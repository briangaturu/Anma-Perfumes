import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { Compass, MapPin, ArrowUpRight, Globe, Loader2 } from "lucide-react";
import { useGetBranchesQuery } from "../features/Apis/Branch.Api";
import BranchDetailView from "../components/BranchVeiwDetail";

const BranchesPage: React.FC = () => {
  const { data: branchesResponse, isLoading } = useGetBranchesQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const branches = branchesResponse?.data || [];

  return (
    <main className="bg-[#050505] min-h-screen text-white selection:bg-[#C9A24D] selection:text-black">
      <Navbar />

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-[#050505] z-10" />
          <motion.img 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "linear" }}
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover opacity-40 grayscale"
          />
        </div>
        
        <div className="relative z-20 text-center space-y-8 px-6">
          <motion.div
            initial={{ opacity: 0, tracking: "0em" }}
            animate={{ opacity: 1, tracking: "0.8em" }}
            transition={{ duration: 1.5 }}
          >
            <span className="text-[#C9A24D] text-[10px] font-black uppercase">The Global Network</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-6xl md:text-8xl font-serif italic tracking-tighter"
          >
            Our <span className="text-white/30 not-italic">Boutiques</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center"
          >
            <div className="h-20 w-[1px] bg-gradient-to-b from-[#C9A24D] to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* 2. THE DISCOVERY BAR */}
      <section className="max-w-7xl mx-auto px-6 -translate-y-12 relative z-30">
        <div className="bg-[#0A0A0A]/80 border border-white/5 p-10 flex flex-col md:flex-row justify-between items-center gap-8 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-8">
            <div className="relative">
                <Compass className="text-[#C9A24D] animate-pulse" size={40} strokeWidth={1} />
                <div className="absolute inset-0 bg-[#C9A24D]/20 blur-xl rounded-full" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-1">Live Registry</p>
              <p className="text-2xl font-serif text-white">{branches.length} <span className="text-sm font-sans uppercase tracking-widest text-gray-600 ml-2">Active Locations</span></p>
            </div>
          </div>
          <div className="h-[50px] w-[1px] bg-white/10 hidden md:block" />
          <p className="text-xs text-gray-400 max-w-sm font-light italic leading-relaxed text-center md:text-left">
            Every ANMA boutique is a curated sanctuary where the trinity of high jewellery, haute cosmetics, and rare fragrances converge.
          </p>
        </div>
      </section>

      {/* 3. THE REFINED COMPACT GRID */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#C9A24D]" size={32} />
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600">Syncing Registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {branches.map((branch: any, index: number) => (
              <motion.div 
                key={branch.id || branch._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedId(branch.id || branch._id)}
                className="group cursor-pointer"
              >
                {/* Image Container with Luxury Overlay */}
                <div className="relative aspect-[16/11] overflow-hidden bg-[#0D0D0D] border border-white/5 mb-6 group-hover:border-[#C9A24D]/40 transition-colors duration-700">
                  <img 
                    src={branch.gallery?.[0] || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80"} 
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100 transition-all duration-1000 ease-out" 
                    alt={branch.name} 
                  />
                  
                  {/* Floating ID Tag */}
                  <div className="absolute top-0 right-0 p-4 translate-x-full group-hover:translate-x-0 transition-transform duration-500">
                     <span className="text-[8px] font-black text-white/40 uppercase tracking-widest bg-black/60 px-2 py-1 backdrop-blur-md">
                        {branch.code}
                     </span>
                  </div>

                  {/* Discover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40">
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md">
                        <ArrowUpRight size={20} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Info Area */}
                <div className="space-y-4 px-2">
                  <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[#C9A24D] text-[9px] font-black uppercase tracking-[0.4em] mb-2">{branch.city}</p>
                        <h3 className="text-2xl font-serif italic tracking-tight group-hover:text-[#C9A24D] transition-colors">
                          {branch.name}
                        </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-300 transition-colors">
                    <MapPin size={12} className="text-[#C9A24D]/60" />
                    <p className="text-[10px] font-light tracking-wide line-clamp-1">{branch.address}</p>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex gap-8">
                    <TrinityDot active={branch.offersJewellery} label="Jewellery" />
                    <TrinityDot active={branch.offersCosmetics} label="Cosmetics" />
                    <TrinityDot active={branch.offersPerfumes} label="Fragrance" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. LUXURY CTA SECTION */}
      <section className="bg-[#080808] border-y border-white/5 py-32 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block p-4 border border-[#C9A24D]/20 rounded-full mb-10"
          >
            <Globe className="text-[#C9A24D]" size={32} strokeWidth={1} />
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-serif italic mb-8">Virtual Concierge</h2>
          <p className="text-gray-500 text-sm font-light max-w-lg mx-auto mb-12 leading-relaxed italic">
            "For those who demand excellence beyond borders. Connect with our master advisors for a digital showing of our latest acquisitions."
          </p>
          <button className="relative group px-16 py-6 bg-transparent overflow-hidden">
            <div className="absolute inset-0 border border-white/10 group-hover:border-[#C9A24D] transition-colors" />
            <div className="absolute inset-0 bg-[#C9A24D] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 text-white group-hover:text-black text-[10px] font-black uppercase tracking-[0.6em] transition-colors">
                Initialize Consultation
            </span>
          </button>
        </div>
        {/* Background Decorative Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-serif italic text-white/[0.01] whitespace-nowrap pointer-events-none uppercase">
          ELEGANCE
        </div>
      </section>

      {/* THE DETAIL DRAWER CONNECTION */}
      {selectedId && (
        <BranchDetailView 
          branchId={selectedId} 
          onClose={() => setSelectedId(null)} 
        />
      )}

      <Footer />
    </main>
  );
};

// --- SMALL HELPER ---
const TrinityDot = ({ active, label }: { active: boolean; label: string }) => (
  <div className={`flex items-center gap-2 transition-all duration-700 ${active ? "opacity-100" : "opacity-5 grayscale"}`}>
    <div className="w-1.5 h-1.5 bg-[#C9A24D] rounded-full shadow-[0_0_8px_rgba(201,162,77,0.4)]" />
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default BranchesPage;