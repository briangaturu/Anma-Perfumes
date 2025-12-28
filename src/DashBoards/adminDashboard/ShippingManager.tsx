import React, { useState, useMemo } from "react";
import { 
  useGetShippingRatesQuery, 
  useCreateShippingRateMutation, 
  useUpdateShippingRateMutation, 
  useDeleteShippingRateMutation,
} from "../../features/Apis/ShippingRates.Api";
import { useGetBranchesQuery } from "../../features/Apis/Branch.Api"; 
import { 
  Truck, Plus, Search, MapPin, 
  BarChart3, X, Save, Clock, 
  Building2, ChevronRight, Edit3, 
  DollarSign, Package, ShieldCheck 
} from "lucide-react";
import toast from "react-hot-toast";

const ShippingAdmin = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);

  // Queries
  const { data: rates, isLoading: ratesLoading } = useGetShippingRatesQuery();
  const { data: branches } = useGetBranchesQuery();

  // Mutations
  const [createRate] = useCreateShippingRateMutation();
  const [updateRate] = useUpdateShippingRateMutation();
  const [deleteRate] = useDeleteShippingRateMutation();

  const [formData, setFormData] = useState({
    areaName: "",
    fee: "",
    branchId: "", 
    minOrderForFreeShipping: "",
    estimatedDeliveryTime: "",
    requiresLandmark: true,
    landmarkPlaceholder: "E.g. Near the main clock tower",
    isAvailable: true
  });

  const handleOpenPanel = (rate: any = null) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        areaName: rate.areaName,
        fee: rate.fee.toString(),
        branchId: rate.branchId,
        minOrderForFreeShipping: rate.minOrderForFreeShipping?.toString() || "",
        estimatedDeliveryTime: rate.estimatedDeliveryTime,
        requiresLandmark: rate.requiresLandmark,
        landmarkPlaceholder: rate.landmarkPlaceholder,
        isAvailable: rate.isAvailable
      });
    } else {
      setEditingRate(null);
      setFormData({
        areaName: "",
        fee: "",
        branchId: branches?.data[0]?.id || "",
        minOrderForFreeShipping: "",
        estimatedDeliveryTime: "1-2 hours",
        requiresLandmark: true,
        landmarkPlaceholder: "E.g. Near the main clock tower",
        isAvailable: true
      });
    }
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loading = toast.loading("Calibrating Logistics Profile...");
    try {
      if (editingRate) {
        await updateRate({ id: editingRate.id, updates: formData }).unwrap();
        toast.success("Route Updated", { id: loading });
      } else {
        await createRate(formData).unwrap();
        toast.success("New Route Established", { id: loading });
      }
      setIsPanelOpen(false);
    } catch (err) {
      toast.error("Vault Logic Error", { id: loading });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Permanent Action: Dissolve this logistics route?")) {
      try {
        await deleteRate(id).unwrap();
        toast.success("Route Purged");
      } catch (err) {
        toast.error("Operation Failed");
      }
    }
  };

  if (ratesLoading) return <div className="p-20 text-center text-[#C9A24D] animate-pulse uppercase tracking-[0.5em] text-xs">Synchronizing Vault Logistics...</div>;

  return (
    <div className="relative min-h-screen p-6 md:p-12 lg:p-16 animate-in fade-in duration-700 bg-[#0B0B0B]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#C9A24D]/20 pb-12 gap-8">
        <div>
          <h1 className="text-5xl font-extralight tracking-tighter text-white">
            Vault <span className="text-[#C9A24D] font-bold not-italic underline decoration-1 underline-offset-8">Logistics</span>
          </h1>
          <p className="text-[#C9A24D]/50 text-[10px] uppercase tracking-[0.5em] mt-4 font-bold flex items-center gap-2">
            <ShieldCheck size={12} className="animate-pulse" /> Secure Distribution Management
          </p>
        </div>
        <button 
          onClick={() => handleOpenPanel()} 
          className="bg-[#C9A24D] text-black px-12 py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-2xl flex items-center gap-3"
        >
          <Plus size={14} /> Establish New Route
        </button>
      </div>

      {/* STATS PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 mb-16">
        {[
          { label: "Active Routes", val: rates?.filter(r => r.isAvailable).length, icon: MapPin },
          { label: "Free Shipping Zones", val: rates?.filter(r => parseFloat(r.minOrderForFreeShipping) > 0).length, icon: Package },
          { label: "Linked Vaults", val: branches?.data.length, icon: Building2 },
          { label: "Avg Fee (KES)", val: rates?.length ? (rates.reduce((a, b) => a + parseFloat(b.fee), 0) / rates.length).toFixed(0) : 0, icon: DollarSign },
        ].map((s, i) => (
          <div key={i} className="bg-[#0e0e0e] border border-white/5 p-8 flex flex-col gap-2 group hover:border-[#C9A24D]/20 transition-all">
            <div className="flex justify-between items-center text-[#C9A24D]">
              <s.icon size={16} />
              <span className="text-[9px] uppercase tracking-widest font-black opacity-30 italic">LOG_0{i+1}</span>
            </div>
            <p className="text-3xl font-light text-white mt-3">{s.val}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ROUTES LIST */}
      <div className="grid grid-cols-1 gap-6">
        {rates?.map((rate) => {
          const branch = branches?.data.find(b => b.id === rate.branchId);
          return (
            <div key={rate.id} className={`bg-[#0e0e0e] border p-8 group transition-all duration-500 hover:translate-x-2 ${rate.isAvailable ? "border-[#C9A24D]/20" : "border-white/5 opacity-50"}`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                
                <div className="flex gap-8 items-center">
                  <div className={`w-14 h-14 flex items-center justify-center border ${rate.isAvailable ? "border-[#C9A24D] text-[#C9A24D]" : "border-gray-800 text-gray-800"}`}>
                    <Truck size={24} className={rate.isAvailable ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">{rate.areaName}</h4>
                    <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-widest flex items-center gap-2">
                      <Building2 size={10} /> {branch?.name || "Global Hub"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-12">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Logistics Fee</p>
                    <p className="text-sm font-mono text-[#C9A24D]">KES {parseFloat(rate.fee).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Threshold</p>
                    <p className="text-[10px] text-white font-mono">
                      {rate.minOrderForFreeShipping ? `Free > KES ${parseFloat(rate.minOrderForFreeShipping).toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Execution Time</p>
                    <p className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                      <Clock size={12} /> {rate.estimatedDeliveryTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full lg:w-auto">
                  <button onClick={() => handleDelete(rate.id)} className="flex-1 lg:flex-none border border-white/5 px-6 py-3 text-[9px] uppercase tracking-widest text-gray-500 hover:text-red-500 hover:border-red-500/20 transition-all">Dissolve</button>
                  <button onClick={() => handleOpenPanel(rate)} className="p-3 text-gray-500 hover:text-[#C9A24D] transition-colors bg-white/5 rounded-full"><Edit3 size={18} /></button>
                  <ChevronRight size={16} className="text-gray-800" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLIDE PANEL (Z-INDEX 10000 TO BYPASS NAVBAR) */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full md:w-[650px] bg-[#0B0B0B] border-l border-[#C9A24D]/20 p-8 md:p-16 flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-20">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#C9A24D] mb-2">Logistics Configuration</h2>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest italic">Route ID: {editingRate?.id || "NEW_ENTITY"}</p>
              </div>
              <X size={28} className="text-gray-500 hover:text-white cursor-pointer transition-colors" onClick={() => setIsPanelOpen(false)} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-16">
              
              {/* Branch Selection */}
              <div className="space-y-6">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block">Origin Vault Selection</label>
                <select 
                  className="w-full bg-transparent border-b border-white/10 py-5 text-xs text-white outline-none focus:border-[#C9A24D] appearance-none"
                  value={formData.branchId}
                  onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                  required
                >
                  <option value="" className="bg-black">Select Source Branch</option>
                  {branches?.data?.map(b => (
                    <option key={b.id} value={b.id} className="bg-black text-white">{b.name} — {b.city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block">Destination Area Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Nyahururu Town Center"
                  className="w-full bg-transparent border-b border-white/10 py-5 text-sm text-white outline-none focus:border-[#C9A24D] transition-all"
                  value={formData.areaName}
                  onChange={(e) => setFormData({...formData, areaName: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-6">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block">Base Delivery Fee (KES)</label>
                  <input 
                    type="number"
                    className="w-full bg-transparent border-b border-white/10 py-5 text-xl text-[#C9A24D] outline-none focus:border-[#C9A24D] font-mono"
                    value={formData.fee}
                    onChange={(e) => setFormData({...formData, fee: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-6">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block">Free Shipping Above</label>
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-transparent border-b border-white/10 py-5 text-xl text-white outline-none focus:border-[#C9A24D] font-mono"
                    value={formData.minOrderForFreeShipping}
                    onChange={(e) => setFormData({...formData, minOrderForFreeShipping: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-6">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block flex items-center gap-2"><Clock size={12} /> Execution ETA</label>
                  <input 
                    type="text"
                    placeholder="e.g. 1-2 Hours"
                    className="w-full bg-[#0e0e0e] border border-white/5 p-5 text-[10px] text-white outline-none focus:border-[#C9A24D]"
                    value={formData.estimatedDeliveryTime}
                    onChange={(e) => setFormData({...formData, estimatedDeliveryTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-6 flex flex-col justify-end">
                   <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setFormData({...formData, requiresLandmark: !formData.requiresLandmark})}>
                      <div className={`w-5 h-5 border flex items-center justify-center transition-all ${formData.requiresLandmark ? "bg-[#C9A24D] border-[#C9A24D]" : "border-white/10"}`}>
                        {formData.requiresLandmark && <X size={12} className="text-black rotate-45" />}
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">Require Landmark</span>
                   </div>
                </div>
              </div>

              <div className="pt-20">
                <button type="submit" className="w-full bg-[#C9A24D] text-black py-7 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95">
                  <Save size={18} /> Commit Profile to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAdmin;