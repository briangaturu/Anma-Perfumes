import React, { useState } from "react";
import { 
  useGetAllProductsQuery, 
  useGetAllFlashDealsQuery, 
  useCreateFlashDealMutation, 
  useIncrementFlashDealSaleMutation,
  useUpdateFlashDealMutation
} from "../../features/Apis/products.Api";
import { Zap, Plus, Search, Calendar, Tag, BarChart3, X, Save, Clock, Flame, ChevronRight, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

const FlashDealManager = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  // Queries
  const { data: deals, isLoading: dealsLoading } = useGetAllFlashDealsQuery();
  const { data: products } = useGetAllProductsQuery({ limit: 1000 });

  // Mutations
  const [createDeal] = useCreateFlashDealMutation();
  const [updateDeal] = useUpdateFlashDealMutation();
  const [testSale] = useIncrementFlashDealSaleMutation();

  const [formData, setFormData] = useState({
    productId: "",
    flashPrice: "",
    startTime: "",
    endTime: "",
    dealStock: 0,
    isActive: true
  });

  const handleOpenPanel = (deal: any = null) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        productId: deal.productId,
        flashPrice: deal.flashPrice.toString(),
        startTime: deal.startTime.split(".")[0], // Format for datetime-local
        endTime: deal.endTime.split(".")[0],
        dealStock: deal.dealStock,
        isActive: deal.isActive
      });
    } else {
      setEditingDeal(null);
      setFormData({
        productId: "",
        flashPrice: "",
        startTime: "",
        endTime: "",
        dealStock: 50,
        isActive: true
      });
    }
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loading = toast.loading("Synchronizing Time-Limited Offer...");
    try {
      if (editingDeal) {
        await updateDeal({ id: editingDeal.id, updates: formData }).unwrap();
        toast.success("Deal Updated", { id: loading });
      } else {
        await createDeal(formData).unwrap();
        toast.success("Flash Deal Ignited", { id: loading });
      }
      setIsPanelOpen(false);
    } catch (err) {
      toast.error("Vault Logic Error", { id: loading });
    }
  };

  const handleTestSale = async (id: string) => {
    try {
      await testSale(id).unwrap();
      toast.success("Atomic Sale Simulated");
    } catch (err) {
      toast.error("Stock Depleted");
    }
  };

  if (dealsLoading) return <div className="p-20 text-center text-[#C9A24D] animate-pulse uppercase tracking-[0.5em] text-xs">Calibrating Flash Clocks...</div>;

  return (
    <div className="relative min-h-screen p-4 md:p-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#C9A24D]/20 pb-10 gap-6">
        <div>
          <h1 className="text-5xl font-extralight tracking-tighter text-white">
            Flash <span className="text-[#C9A24D] font-bold not-italic underline decoration-1 underline-offset-8">Deals</span>
          </h1>
          <p className="text-[#C9A24D]/50 text-[10px] uppercase tracking-[0.5em] mt-4 font-bold flex items-center gap-2">
            <Flame size={12} className="animate-pulse" /> High-Velocity Scent Acquisition
          </p>
        </div>
        <button 
          onClick={() => handleOpenPanel()} 
          className="bg-[#C9A24D] text-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-xl flex items-center gap-3"
        >
          <Plus size={14} /> Schedule New Ignition
        </button>
      </div>

      {/* STATS PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
        {[
          { label: "Active Deals", val: deals?.filter(d => d.isActive).length, icon: Flame },
          { label: "Total Units Sold", val: deals?.reduce((acc, curr) => acc + curr.unitsSold, 0), icon: BarChart3 },
          { label: "Upcoming Trajectories", val: deals?.filter(d => new Date(d.startTime) > new Date()).length, icon: Clock },
        ].map((s, i) => (
          <div key={i} className="bg-[#0B0B0B] border border-white/5 p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[#C9A24D]">
              <s.icon size={16} />
              <span className="text-[9px] uppercase tracking-widest font-black opacity-30 italic">Metric_{i+1}</span>
            </div>
            <p className="text-2xl font-light text-white mt-2">{s.val}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* DEALS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {deals?.map((deal) => {
          const product = products?.data?.find(p => p.id === deal.productId);
          const percentSold = (deal.unitsSold / deal.dealStock) * 100;

          return (
            <div key={deal.id} className={`bg-[#0B0B0B] border p-6 group transition-all duration-500 hover:translate-x-2 ${deal.isActive ? "border-[#C9A24D]/30" : "border-white/5"}`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                
                <div className="flex gap-6 items-center">
                  <div className={`w-12 h-12 flex items-center justify-center border ${deal.isActive ? "border-[#C9A24D] text-[#C9A24D]" : "border-gray-800 text-gray-800"}`}>
                    <Zap size={20} className={deal.isActive ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">{product?.name || "Unknown Product"}</h4>
                    <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-tighter">Vault ID: {deal.id}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-10">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Pricing (KES)</p>
                    <p className="text-sm font-mono text-[#C9A24D]">{parseFloat(deal.flashPrice).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Stock Velocity</p>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-1 bg-white/5 overflow-hidden">
                        <div className="h-full bg-[#C9A24D] transition-all duration-1000" style={{ width: `${percentSold}%` }} />
                      </div>
                      <span className="text-[10px] text-white font-mono">{deal.unitsSold}/{deal.dealStock}</span>
                    </div>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">Trajectory</p>
                    <p className="text-[10px] text-gray-400 font-mono">Ends: {new Date(deal.endTime).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <button onClick={() => handleTestSale(deal.id)} className="flex-1 lg:flex-none border border-white/5 px-4 py-2 text-[9px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Test Sale</button>
                  <button onClick={() => handleOpenPanel(deal)} className="p-2 text-gray-500 hover:text-[#C9A24D] transition-colors"><Edit3 size={16} /></button>
                  <ChevronRight size={16} className="text-gray-800" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLIDE PANEL */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full md:w-[600px] bg-[#0B0B0B] border-l border-[#C9A24D]/20 p-12 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-16">
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#C9A24D]">{editingDeal ? "Adjust Trajectory" : "Configure Flash Deal"}</h2>
              <X size={24} className="text-gray-500 cursor-pointer" onClick={() => setIsPanelOpen(false)} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-4">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block">Target Masterpiece</label>
                <select 
                  className="w-full bg-transparent border-b border-white/10 py-4 text-xs text-white outline-none focus:border-[#C9A24D] appearance-none"
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  required
                >
                  <option value="">Select from Registry</option>
                  {products?.data?.map(p => (
                    <option key={p.id} value={p.id} className="bg-black text-white">{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block">Flash Price (KES)</label>
                  <input 
                    type="number"
                    className="w-full bg-transparent border-b border-white/10 py-4 text-lg text-[#C9A24D] outline-none focus:border-[#C9A24D] font-mono"
                    value={formData.flashPrice}
                    onChange={(e) => setFormData({...formData, flashPrice: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block">Inventory Reserve</label>
                  <input 
                    type="number"
                    className="w-full bg-transparent border-b border-white/10 py-4 text-lg text-white outline-none focus:border-[#C9A24D] font-mono"
                    value={formData.dealStock}
                    onChange={(e) => setFormData({...formData, dealStock: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block flex items-center gap-2"><Clock size={12} /> Start Time</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-[#111] border border-white/5 p-4 text-[10px] text-white outline-none focus:border-[#C9A24D]"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold block flex items-center gap-2"><Clock size={12} /> End Time</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-[#111] border border-white/5 p-4 text-[10px] text-white outline-none focus:border-[#C9A24D]"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="pt-12">
                <button type="submit" className="w-full bg-[#C9A24D] text-black py-6 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white transition-all shadow-2xl flex items-center justify-center gap-4">
                  <Save size={18} /> Commit Deal to Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashDealManager;