import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, MapPin, RefreshCcw, Save, Trash2, 
  Loader2, Box, Check, Info, TrendingUp 
} from "lucide-react";
import { toast } from "sonner";

// APIs
import { useGetAllProductsQuery } from "../../features/Apis/products.Api";
import { useGetBranchesQuery } from "../../features/Apis/Branch.Api";
import { 
  useGetInventoryByBranchQuery, 
  useSyncStandardStockMutation,
  useDeleteInventoryRecordMutation 
} from "../../features/Apis/Inventory.Api";

const StandardInventoryAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeBranch, setActiveBranch] = useState("");

  const { data: branchesData } = useGetBranchesQuery();
  const { data: productsData } = useGetAllProductsQuery({ limit: 100 });
  
  const { data: branchStock, isFetching: stockLoading } = useGetInventoryByBranchQuery(activeBranch, { 
    skip: !activeBranch,
    refetchOnMountOrArgChange: true 
  });

  const [syncStock] = useSyncStandardStockMutation();
  const [deleteRecord] = useDeleteInventoryRecordMutation();

  const branches = branchesData?.data || [];

  useEffect(() => {
    if (branches.length > 0 && !activeBranch) setActiveBranch(branches[0].id);
  }, [branches, activeBranch]);

  const inventoryList = useMemo(() => {
    const rawProducts = Array.isArray(productsData) ? productsData : (productsData as any)?.data || [];
    const stockItems = Array.isArray(branchStock) ? (branchStock as any).data || branchStock : [];

    return rawProducts
      .filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((p: any) => {
        const stockRecord = stockItems.find((s: any) => s.productId === p.id);
        return {
          productId: p.id,
          inventoryId: stockRecord?.id,
          name: p.name,
          currentQty: stockRecord ? stockRecord.quantity : 0,
          reorderLevel: stockRecord ? stockRecord.reorderLevel : 5,
          isLinked: !!stockRecord,
        };
      });
  }, [productsData, branchStock, searchTerm]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-[#C9A24D]">
      <div className="max-w-7xl mx-auto">
        
        {/* --- CINEMATIC HEADER --- */}
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <div className="h-[1px] w-10 bg-[#C9A24D]" />
               <span className="text-[#C9A24D] text-[10px] font-black uppercase tracking-[0.6em]">Management Console</span>
            </div>
            <h1 className="text-6xl font-extralight tracking-tighter uppercase leading-none">
              Vault <span className="text-[#C9A24D] font-black italic">Sync</span>
            </h1>
          </div>

          <div className="w-full md:w-auto space-y-4">
             <p className="text-[9px] text-gray-500 uppercase tracking-widest text-right font-bold">Select Active Location</p>
             <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBranch(b.id)}
                    className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                      activeBranch === b.id 
                      ? "bg-[#C9A24D] text-black shadow-[0_0_30px_rgba(201,162,77,0.2)] scale-105" 
                      : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
          </div>
        </header>

        {/* --- INTERACTIVE SEARCH --- */}
        <div className="mb-12 relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-gray-600 group-focus-within:text-[#C9A24D] transition-colors" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="FILTER BY MASTERPIECE NAME..." 
            className="w-full bg-white/[0.02] border border-white/10 rounded-3xl py-7 pl-16 pr-8 outline-none text-[14px] tracking-[0.2em] uppercase focus:border-[#C9A24D]/40 focus:bg-white/[0.04] transition-all duration-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- INVENTORY GRID --- */}
        {stockLoading && !inventoryList.length ? (
          <div className="py-60 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="animate-spin text-[#C9A24D]" size={48} strokeWidth={1} />
            <p className="text-[10px] uppercase tracking-[0.8em] text-[#C9A24D] animate-pulse">Establishing Secure Uplink...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {inventoryList.map((item) => (
              <InventoryCard 
                key={`${activeBranch}-${item.productId}-${item.currentQty}`} // Force re-render on data change
                item={item} 
                branchId={activeBranch}
                onSync={syncStock}
                onDelete={deleteRecord}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const InventoryCard = ({ item, branchId, onSync, onDelete }: any) => {
  const [qty, setQty] = useState(item.currentQty);
  const [loading, setLoading] = useState(false);

  const isLow = qty <= item.reorderLevel;
  const hasChanged = qty !== item.currentQty;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onSync({ 
        productId: item.productId, 
        branchId, 
        quantity: Number(qty), 
        reorderLevel: 5 
      }).unwrap();
      toast.success(`${item.name} Vault Updated`);
    } catch (err) {
      toast.error("Uplink Interrupted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative group bg-[#0A0A0A] border ${isLow ? 'border-red-900/30 shadow-[0_0_40px_rgba(220,38,38,0.05)]' : 'border-white/5'} rounded-[2.5rem] p-8 transition-all duration-700 hover:translate-y-[-8px] hover:border-[#C9A24D]/40`}>
      
      {/* Visual Indicator Background */}
      <div className="absolute top-10 right-10 text-[80px] font-black text-white/[0.01] select-none pointer-events-none italic">
        {qty.toString().padStart(2, '0')}
      </div>

      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-bold uppercase tracking-tighter leading-tight group-hover:text-[#C9A24D] transition-colors">{item.name}</h3>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
               <span className={`text-[9px] font-black uppercase tracking-widest ${isLow ? 'text-red-500' : 'text-emerald-500/60'}`}>
                 {isLow ? 'Critically Low' : 'Secure Level'}
               </span>
            </div>
          </div>
          {item.isLinked && (
            <button 
                onClick={() => { if(confirm("Purge from branch?")) onDelete(item.inventoryId) }} 
                className="p-3 rounded-full hover:bg-red-500/10 text-gray-800 hover:text-red-500 transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* --- LATEST STOCK GAUGE --- */}
        <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <span>Vault Density</span>
                <span className={isLow ? "text-red-400" : "text-white"}>{qty} Units</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${isLow ? 'bg-red-600' : 'bg-[#C9A24D]'}`}
                    style={{ width: `${Math.min((qty / 40) * 100, 100)}%` }}
                />
            </div>
        </div>

        {/* --- CONTROLS HUD --- */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-3 flex items-center gap-4">
          <div className="flex flex-1 items-center justify-between px-2">
            <button 
              type="button"
              onClick={() => setQty(Math.max(0, qty - 1))} 
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all text-2xl font-light"
            >-</button>
            
            <input 
              type="number" 
              value={qty} 
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              className="bg-transparent text-center text-3xl font-light text-[#C9A24D] outline-none w-20 tracking-tighter"
            />

            <button 
              type="button"
              onClick={() => setQty(qty + 1)} 
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all text-2xl font-light"
            >+</button>
          </div>

          <button 
            onClick={handleUpdate}
            disabled={!hasChanged || loading}
            className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              hasChanged 
              ? "bg-[#C9A24D] text-black shadow-[0_0_30px_rgba(201,162,77,0.4)] scale-105 active:scale-95" 
              : "bg-white/5 text-gray-700 cursor-not-allowed"
            }`}
          >
            {loading ? <RefreshCcw size={22} className="animate-spin" /> : <Save size={22} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StandardInventoryAdmin;