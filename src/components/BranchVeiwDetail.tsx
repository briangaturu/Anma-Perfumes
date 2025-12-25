import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Clock, Phone, Mail, Compass, 
  ShieldCheck, Gem, Sparkles, Copy, 
  CheckCircle2, ChevronRight, Layers,
  Globe, Calendar, Award, ExternalLink
} from 'lucide-react';
import { useGetBranchDetailsQuery } from '../features/Apis/Branch.Api';
import Swal from 'sweetalert2';

interface Props {
  branchId: string;
  onClose: () => void;
}

const BranchDetailView: React.FC<Props> = ({ branchId, onClose }) => {
  const { data: branchResponse, isLoading } = useGetBranchDetailsQuery(branchId, {
    skip: !branchId,
  });

  const branch = branchResponse?.data || branchResponse;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${label} copied to clipboard`,
      showConfirmButton: false,
      timer: 1500,
      background: '#0D0D0D',
      color: '#C9A24D'
    });
  };

  if (!branchId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex justify-end overflow-hidden">
        {/* BACKDROP */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        />
        
        {/* DRAWER PANEL */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="relative w-full max-w-3xl bg-[#050505] h-full shadow-[-30px_0_80px_rgba(0,0,0,1)] border-l border-white/5 z-[100000] overflow-y-auto scrollbar-hide flex flex-col"
        >
          {/* STICKY TOP NAV */}
          <div className="sticky top-0 z-50 p-6 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-[1px] bg-[#C9A24D]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#C9A24D]">Boutique Dossier</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">Ref: {branch?.code || '---'}</span>
              </div>
            </div>
            <button onClick={onClose} className="group p-2 flex items-center gap-3 transition-all">
               <span className="text-[9px] uppercase tracking-widest text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-300">Exit View</span>
               <div className="p-2 rounded-full group-hover:bg-white/5 transition-colors">
                <X size={20} className="text-white/60 group-hover:text-white transition-colors" />
               </div>
            </button>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
               <div className="relative">
                  <div className="w-16 h-16 border-t border-[#C9A24D] rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#C9A24D] rounded-full animate-pulse" />
                  </div>
               </div>
               <p className="text-[9px] uppercase tracking-[0.5em] text-gray-600">Syncing Registry...</p>
            </div>
          ) : (
            <div className="flex-1">
              
              {/* 1. CINEMATIC HERO & STATUS */}
              <section className="relative h-[60vh] overflow-hidden bg-black">
                <motion.img 
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.65 }}
                  transition={{ duration: 2.5, ease: "easeOut" }}
                  src={branch?.gallery?.[0]} 
                  className="w-full h-full object-cover" 
                />
                
                {/* DYNAMIC STATUS BADGE */}
                <div className="absolute top-10 right-10">
                    <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border backdrop-blur-xl shadow-2xl ${
                        branch?.status === 'active' 
                        ? 'border-emerald-500/30 bg-emerald-500/10' 
                        : 'border-amber-500/30 bg-amber-500/10'
                    }`}>
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${branch?.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${branch?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${branch?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {branch?.status || 'Active'}
                        </span>
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20" />
                
                <div className="absolute bottom-12 left-12 right-12">
                   <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                   >
                     <div className="flex items-center gap-2 text-[#C9A24D]">
                        <Globe size={14} strokeWidth={1} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em]">{branch?.city} Region</span>
                     </div>
                     <h1 className="text-6xl md:text-8xl font-serif italic text-white tracking-tighter leading-none">
                       {branch?.name}
                     </h1>
                     <div className="flex items-center gap-6 pt-4">
                        <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-medium">
                          <Calendar size={12} /> Established 2024
                        </div>
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-medium">
                          <Award size={12} /> Flagship Residence
                        </div>
                     </div>
                   </motion.div>
                </div>
              </section>

              {/* 2. CATEGORIES AVAILABLE (TRINITY) */}
              <section className="px-12 py-20 bg-[#080808]/50 border-b border-white/5">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                  <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Layers size={14} className="text-[#C9A24D]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C9A24D]">Service Matrix</span>
                      </div>
                      <h2 className="text-3xl font-serif italic text-white">The Trinity Experience</h2>
                  </div>
                  <p className="text-gray-500 text-xs font-light max-w-xs leading-relaxed">
                    Every residence is curated to provide a specific subset of the ANMA trinity. Explore our onsite specialized counters.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <CategoryCard active={branch?.offersJewellery} icon={<Gem size={22}/>} label="Jewellery" desc="High Jewelry & Gems" />
                    <CategoryCard active={branch?.offersCosmetics} icon={<Sparkles size={22}/>} label="Cosmetics" desc="Artisanal Skincare" />
                    <CategoryCard active={branch?.offersPerfumes} icon={<ShieldCheck size={22}/>} label="Perfumes" desc="Private Fragrance" />
                </div>
              </section>

              {/* 3. LOGISTICS GRID */}
              <section className="px-12 py-24 bg-[#050505]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-20 gap-x-16">
                  <DetailRow icon={<MapPin size={20}/>} label="Geographic Coordinates" value={branch?.address} onCopy={() => copyToClipboard(branch?.address, 'Address')} />
                  <DetailRow icon={<Clock size={20}/>} label="Operational Hours" value={branch?.storeHours} />
                  <DetailRow icon={<Phone size={20}/>} label="Concierge Priority Line" value={branch?.contactNumber} onCopy={() => copyToClipboard(branch?.contactNumber, 'Phone')} />
                  <DetailRow icon={<Mail size={20}/>} label="Digital Correspondence" value={branch?.email} onCopy={() => copyToClipboard(branch?.email, 'Email')} />
                </div>
              </section>

              {/* 4. CURATED GALLERY */}
              <section className="px-12 py-20 bg-[#080808]/30">
                <div className="flex items-center justify-between mb-12">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Visual Documentation</span>
                  <div className="h-[1px] flex-1 mx-8 bg-white/5" />
                  <span className="text-[9px] text-gray-700 uppercase tracking-widest">Internal Perspective</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {branch?.gallery?.slice(1, 3).map((img: string, i: number) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 0.98, y: -5 }} 
                      className="group relative aspect-[16/10] bg-[#0D0D0D] border border-white/5 overflow-hidden shadow-2xl"
                    >
                       <img src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt="" />
                       <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all duration-700" />
                       <div className="absolute top-4 left-4 p-2 bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={12} className="text-[#C9A24D]" />
                       </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* 5. CTA SECTION */}
              <section className="px-12 py-32 text-center bg-[#050505] relative overflow-hidden">
                <div className="relative z-10 space-y-12">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-px h-16 bg-gradient-to-b from-[#C9A24D] to-transparent mb-4" />
                    <h2 className="text-4xl md:text-5xl font-serif italic text-white leading-tight">Initialize Your <br/> Visit to {branch?.city}</h2>
                    <p className="text-gray-500 text-sm font-light max-w-sm mx-auto leading-relaxed italic">
                      "Experience the ANMA trinity in person. Our master advisors are ready to welcome you to our {branch?.city} residence."
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <a 
                      href={branch?.googleMapsUrl} 
                      target="_blank" 
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-14 py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.6em] hover:bg-[#C9A24D] transition-all duration-500 group shadow-xl"
                    >
                      <Compass size={18} className="group-hover:rotate-180 transition-transform duration-1000" /> Direct Navigation
                    </a>
                    <button className="w-full sm:w-auto px-14 py-6 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.6em] hover:bg-white/5 transition-all">
                      Secure Appointment
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-[15vw] font-serif italic text-white/[0.02] whitespace-nowrap pointer-events-none">
                  EXCLUSIVE ACCESS
                </div>
              </section>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- SUB-COMPONENTS ---

const CategoryCard = ({ active, icon, label, desc }: any) => (
  <div className={`relative p-8 border transition-all duration-700 group overflow-hidden ${active ? 'bg-white/[0.02] border-white/10' : 'bg-black border-white/5 opacity-10 grayscale cursor-not-allowed'}`}>
    {active && (
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A24D] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    )}
    
    <div className={`mb-8 p-4 rounded-full w-fit border transition-all duration-700 ${active ? 'border-[#C9A24D]/20 bg-[#C9A24D]/5 text-[#C9A24D] group-hover:scale-110' : 'text-gray-700 border-white/5'}`}>
        {icon}
    </div>
    <div className="space-y-2">
        <div className="flex items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-white">{label}</span>
            {active && <CheckCircle2 size={12} className="text-emerald-500" />}
        </div>
        <p className="text-[9px] uppercase tracking-widest text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
    
    {active && (
        <div className="mt-8 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-[#C9A24D] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            Explore <ChevronRight size={12} />
        </div>
    )}
  </div>
);

const DetailRow = ({ icon, label, value, onCopy }: any) => (
  <div className="group space-y-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 text-[#C9A24D]">
        <div className="p-3 rounded-lg bg-[#C9A24D]/5 border border-[#C9A24D]/10 group-hover:border-[#C9A24D]/40 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em]">{label}</span>
      </div>
      {onCopy && (
        <button 
          onClick={onCopy} 
          className="p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-500 hover:text-white hover:bg-white/5 rounded-md"
        >
          <Copy size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
    <div className="h-px w-full bg-white/5 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-[#C9A24D] to-transparent w-0 group-hover:w-full transition-all duration-1000 ease-in-out" />
    </div>
    <p className="text-sm font-light text-gray-400 leading-relaxed group-hover:text-white transition-colors pl-1">
      {value || "Registry Confidential / By Appointment"}
    </p>
  </div>
);

export default BranchDetailView;