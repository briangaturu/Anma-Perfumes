import React, { useState, useMemo, useEffect } from "react";
import { 
  useGetAllProductsQuery, 
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductAvailabilityQuery 
} from "../../features/Apis/products.Api";
import { useGetCategoriesQuery, useGetSubCategoriesQuery } from "../../features/Apis/Categories.APi";
import { 
  Plus, Edit3, Trash2, Search, X, Package, Save, Link, FileText
} from "lucide-react";
import toast from "react-hot-toast";

const UnifiedProductManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"details" | "inventory">("details");

  // --- API HOOKS ---
  const { data: products, isLoading: productsLoading } = useGetAllProductsQuery({ search: searchTerm });
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: subCategoriesData } = useGetSubCategoriesQuery({ limit: 1000 });
  
  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const { data: availability } = useGetProductAvailabilityQuery(editingProduct?.id ?? "", {
    skip: !editingProduct?.id
  });

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryId: "",
    subcategoryId: "",
    description: "",
    basePrice: "",
  });

  // --- HELPERS ---
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-generate slug when name changes (only for new products)
  useEffect(() => {
    if (!editingProduct && formData.name) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.name) }));
    }
  }, [formData.name, editingProduct]);

  const subCategoryOptions = useMemo(() => {
    if (!formData.categoryId || !subCategoriesData?.data) return [];
    return subCategoriesData.data.filter((sub: any) => sub.categoryId === formData.categoryId);
  }, [formData.categoryId, subCategoriesData]);

  // --- CORE HANDLERS ---
  const handleOpenPanel = (product: any = null) => {
    setActiveTab("details");
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || "",
        description: product.description || "",
        basePrice: product.basePrice,
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: "", 
        slug: "",
        categoryId: categoriesData?.data?.[0]?.id || "", 
        subcategoryId: "",
        description: "", 
        basePrice: "",
      });
    }
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing Masterpiece...");
    
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId !== "" ? formData.subcategoryId : null,
        description: formData.description.trim() || null,
        basePrice: Number(formData.basePrice), 
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, updates: payload }).unwrap();
        toast.success("Archive Entry Updated", { id: loadingToast });
      } else {
        await createProduct(payload).unwrap();
        toast.success("New Masterpiece Registered", { id: loadingToast });
      }
      
      setIsPanelOpen(false);
    } catch (err: any) {
      const errorDetail = err.data?.error?.[0]?.message || err.data?.message || "Protocol Violation";
      toast.error(errorDetail, { id: loadingToast });
    }
  };

  if (productsLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-12 h-12 border-2 border-[#C9A24D] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#C9A24D] text-center animate-pulse tracking-[0.5em] uppercase text-xs font-black">Decrypting Ledger...</div>
    </div>
  );

  return (
    <div className="relative min-h-screen pb-20 px-4 md:px-0 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#C9A24D]/10 pb-10">
        <div>
          <h1 className="text-5xl font-extralight tracking-tighter text-white">
            Trinity <span className="text-[#C9A24D] font-bold">Vault</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] mt-4 font-black italic">Master Registry</p>
        </div>
        <button 
          onClick={() => handleOpenPanel()}
          className="bg-[#C9A24D] text-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={16} strokeWidth={3} /> New Entry
        </button>
      </div>

      {/* SEARCH & TABLE */}
      <div className="bg-[#0B0B0B] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center gap-6 bg-[#111]/30">
          <Search size={18} className="text-[#C9A24D]" />
          <input 
            type="text" 
            placeholder="Search Registry..." 
            className="bg-transparent outline-none text-xs uppercase tracking-[0.2em] w-full text-white placeholder:text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#C9A24D] text-[10px] uppercase tracking-[0.3em] bg-[#050505] border-b border-white/5">
                <th className="p-8 font-black">Identity</th>
                <th className="p-8 font-black">Lineage</th>
                <th className="p-8 font-black">Value</th>
                <th className="p-8 font-black text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {products?.data?.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-8 flex items-center gap-6">
                    <div className="w-10 h-10 bg-black border border-[#C9A24D]/20 flex items-center justify-center text-[#C9A24D]">
                      <Package size={16}/>
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase text-white tracking-wide">{p.name}</p>
                      <p className="text-[10px] text-gray-600 font-mono italic">{p.slug}</p>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-[10px] text-white font-bold block mb-1">
                        {categoriesData?.data?.find((c: any) => c.id === p.categoryId)?.name || 'General'}
                    </span>
                    <span className="text-[9px] text-gray-600 uppercase italic">
                        Sub: {subCategoriesData?.data?.find((s: any) => s.id === p.subcategoryId)?.name || "Primary"}
                    </span>
                  </td>
                  <td className="p-8 font-mono text-sm text-[#C9A24D]">
                    KES {parseFloat(p.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-8 text-right space-x-6">
                    <button onClick={() => handleOpenPanel(p)} className="text-gray-500 hover:text-[#C9A24D] transition-colors"><Edit3 size={16}/></button>
                    <button onClick={() => confirm("Execute Deletion Protocol?") && deleteProduct(p.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PANEL */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setIsPanelOpen(false)} />
          <div className="relative w-full md:w-[650px] bg-[#0F0F0F] border-l border-[#C9A24D]/30 h-full flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            
            {/* TAB NAV */}
            <div className="p-8 border-b border-white/5 flex justify-between bg-[#141414]">
               <div className="flex gap-12">
                  <button 
                    onClick={() => setActiveTab("details")} 
                    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 ${activeTab==='details' ? 'text-[#C9A24D]' : 'text-gray-600'}`}
                  >
                    Registry Details
                    {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A24D]" />}
                  </button>
                  {editingProduct && (
                    <button 
                        onClick={() => setActiveTab("inventory")} 
                        className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 ${activeTab==='inventory' ? 'text-[#C9A24D]' : 'text-gray-600'}`}
                    >
                        Inventory Map
                        {activeTab === 'inventory' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C9A24D]" />}
                    </button>
                  )}
               </div>
               <button onClick={() => setIsPanelOpen(false)} className="hover:rotate-90 transition-transform duration-300">
                 <X size={24} className="text-gray-500"/>
               </button>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {activeTab === "details" ? (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* IDENTITY GRID */}
                  <div className="grid grid-cols-2 gap-10">
                    <div className="group space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Official Name</label>
                      <input 
                        required 
                        className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-[#C9A24D] text-white transition-all" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2 font-black"><Link size={10}/> Slug Identifier</label>
                      <input 
                        className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-[#C9A24D] text-gray-400 font-mono text-xs" 
                        value={formData.slug} 
                        onChange={e => setFormData({...formData, slug: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* LINEAGE GRID */}
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Category</label>
                      <select 
                        required 
                        className="w-full bg-[#111] border border-white/5 p-4 text-xs text-white outline-none focus:border-[#C9A24D]/50" 
                        value={formData.categoryId} 
                        onChange={e => setFormData({...formData, categoryId: e.target.value, subcategoryId: ""})}
                      >
                        {categoriesData?.data?.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Sub-Family</label>
                      <select 
                        className="w-full bg-[#111] border border-white/5 p-4 text-xs text-white outline-none focus:border-[#C9A24D]/50" 
                        value={formData.subcategoryId} 
                        onChange={e => setFormData({...formData, subcategoryId: e.target.value})}
                      >
                        <option value="">None / Primary</option>
                        {subCategoryOptions.map((sub: any) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="space-y-4">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2 font-black">
                        <FileText size={10}/> Technical Description
                    </label>
                    <textarea 
                        rows={5}
                        className="w-full bg-[#111] border border-white/5 p-4 text-xs text-white outline-none focus:border-[#C9A24D]/50 resize-none leading-relaxed"
                        placeholder="Enter the masterpiece specifications and history..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  {/* PRICE */}
                  <div className="space-y-4 pt-6">
                    <label className="text-[10px] text-[#C9A24D] uppercase tracking-[0.4em] font-black">Market Valuation (KES)</label>
                    <div className="flex items-baseline gap-4 border-b border-white/10 pb-4">
                        <span className="text-xl text-gray-600 font-light">KES</span>
                        <input 
                            type="number" 
                            required 
                            step="0.01"
                            className="w-full bg-transparent text-5xl font-mono text-[#C9A24D] outline-none placeholder:text-gray-900" 
                            value={formData.basePrice} 
                            placeholder="0.00"
                            onChange={e => setFormData({...formData, basePrice: e.target.value})}
                        />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right duration-500">
                   {availability?.map((b: any) => (
                      <div key={b.branchId} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-sm group hover:border-[#C9A24D]/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-[#C9A24D] shadow-[0_0_10px_#C9A24D]"></div>
                            <span className="text-xs text-gray-400 uppercase tracking-[0.2em] font-black">{b.branchName}</span>
                        </div>
                        <span className="text-sm font-mono text-white bg-black px-4 py-1 border border-white/10">{b.quantity} UNITS</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="p-10 border-t border-white/5 bg-[#141414]">
              <button 
                onClick={handleSubmit} 
                disabled={isCreating} 
                className="w-full bg-[#C9A24D] text-black py-5 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white hover:tracking-[0.6em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
              >
                <Save size={18}/> {editingProduct ? "Sync Archive" : "Commit New Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedProductManager;