import React, { useState, useMemo } from "react";
import { 
  useGetAllProductsQuery, 
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation 
} from "../../features/Apis/products.Api";
import { useGetCategoriesQuery, useGetSubCategoriesQuery } from "../../features/Apis/Categories.APi";
import { Plus, Edit3, Trash2, Search, X, Package, Save, ChevronDown, Sparkles, Filter, Fingerprint } from "lucide-react";
import toast from "react-hot-toast";

const UnifiedProductManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // --- API HOOKS ---
  // Fetches all products based on search
  const { data: products, isLoading: productsLoading } = useGetAllProductsQuery({ search: searchTerm });
  
  // Fetches main categories for the selector and table labels
  const { data: categoriesData } = useGetCategoriesQuery({});
  
  // Fetches ALL subcategories once to handle the table mapping and dependent dropdowns
  const { data: subCategoriesData } = useGetSubCategoriesQuery({ limit: 1000 });
  
  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    subcategoryId: "",
    description: "",
    basePrice: ""
  });

  // --- LOGIC: DEPENDENT DROPDOWNS ---
  // Filters the subcategories based on the Category ID selected in the form
  const subCategoryOptions = useMemo(() => {
    if (!formData.categoryId || !subCategoriesData?.data) return [];
    return subCategoriesData.data.filter((sub: any) => sub.categoryId === formData.categoryId);
  }, [formData.categoryId, subCategoriesData]);

  // --- HANDLERS ---
  const handleOpenPanel = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || "",
        description: product.description || "",
        basePrice: product.basePrice.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: "", 
        categoryId: categoriesData?.data?.[0]?.id || "", 
        subcategoryId: "",
        description: "", 
        basePrice: "" 
      });
    }
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Syncing with Global Archive...");
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice)
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, updates: payload }).unwrap();
        toast.success("Masterpiece Updated", { id: loadingToast });
      } else {
        await createProduct(payload).unwrap();
        toast.success("New Entry Established", { id: loadingToast });
      }
      setIsPanelOpen(false);
    } catch (err) {
      toast.error("Vault Access Denied", { id: loadingToast });
    }
  };

  if (productsLoading) return <div className="p-20 text-[#C9A24D] text-center animate-pulse tracking-[0.5em] uppercase text-xs">Decrypting Inventory Ledger...</div>;

  return (
    <div className="relative min-h-screen pb-20 px-4 md:px-0 animate-in fade-in duration-700">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#C9A24D]/10 pb-10">
        <div>
          <h1 className="text-5xl font-extralight tracking-tighter text-white">
            Inventory <span className="text-[#C9A24D] font-bold not-italic">Vault</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] mt-4 font-black italic">Maison de Luxe Master Registry</p>
        </div>
        <button 
          onClick={() => handleOpenPanel()}
          className="bg-[#C9A24D] text-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center gap-3 shadow-2xl"
        >
          <Plus size={16} strokeWidth={3} /> Establish New Entry
        </button>
      </div>

      {/* 2. TABLE AND SEARCH */}
      <div className="bg-[#0B0B0B] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center gap-6 bg-[#111]/30">
          <Search size={18} className="text-[#C9A24D]" />
          <input 
            type="text" 
            placeholder="Filter by Product Name..." 
            className="bg-transparent outline-none text-xs uppercase tracking-[0.2em] w-full text-white placeholder:text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter size={16} className="text-gray-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#C9A24D] text-[10px] uppercase tracking-[0.3em] bg-[#050505] border-b border-white/5">
                <th className="p-8 font-black">Item Details</th>
                <th className="p-8 font-black">Lineage</th>
                <th className="p-8 font-black">Market Value</th>
                <th className="p-8 font-black text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {products?.data?.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center text-[#C9A24D] group-hover:border-[#C9A24D]/40 transition-all">
                        <Package size={20} strokeWidth={1} />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-widest uppercase text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-500 italic mt-1 line-clamp-1 max-w-[250px]">{p.description || "No description provided."}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-white font-bold">
                        {/* THE FIX: Manually find the name using the ID from categoriesData */}
                        {categoriesData?.data?.find((c: any) => c.id === p.categoryId)?.name || "Uncategorized"}
                      </span>
                      <span className="text-[9px] text-gray-600 uppercase tracking-tighter flex items-center gap-1 italic">
                        <Fingerprint size={10} />
                        {subCategoriesData?.data?.find((s: any) => s.id === p.subcategoryId)?.name || "Primary Line"}
                      </span>
                    </div>
                  </td>
                  <td className="p-8 font-mono text-sm text-[#C9A24D]">
                    KES {parseFloat(p.basePrice).toLocaleString()}
                  </td>
                  <td className="p-8 text-right space-x-4">
                    <button onClick={() => handleOpenPanel(p)} className="text-gray-600 hover:text-[#C9A24D] transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => { if(confirm("Archiving this entry?")) deleteProduct(p.id) }} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. SLIDE-OVER PANEL */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPanelOpen(false)} />
          
          <div className="relative w-full md:w-[550px] bg-[#0F0F0F] border-l border-[#C9A24D]/30 shadow-[-50px_0_100px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-500 h-full flex flex-col">
            
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-[#141414]">
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#C9A24D]">
                {editingProduct ? "Refine Masterpiece" : "Establish New Entry"}
              </h2>
              <button onClick={() => setIsPanelOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Product Identity */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
                  <Sparkles size={12} className="text-[#C9A24D]" /> Product Identity
                </label>
                <input 
                  required
                  className="w-full bg-transparent border-b border-white/10 py-4 text-sm outline-none focus:border-[#C9A24D] transition-all text-white uppercase tracking-widest"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Lineage (Categories) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Main Vault (Category)</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full bg-[#111] border border-white/10 p-4 text-[11px] uppercase tracking-widest outline-none appearance-none focus:border-[#C9A24D] text-white cursor-pointer"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value, subcategoryId: ""})}
                    >
                      <option value="" disabled>Select Category</option>
                      {categoriesData?.data?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Sub-Family Line</label>
                  <div className="relative">
                    <select 
                      disabled={!formData.categoryId}
                      className="w-full bg-[#111] border border-white/10 p-4 text-[11px] uppercase tracking-widest outline-none appearance-none focus:border-[#C9A24D] text-white disabled:opacity-20 cursor-pointer"
                      value={formData.subcategoryId}
                      onChange={(e) => setFormData({...formData, subcategoryId: e.target.value})}
                    >
                      <option value="">No Sub-Family</option>
                      {subCategoryOptions.map((sub: any) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* Valuation */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Market Valuation (KES)</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#C9A24D] font-mono">/</span>
                  <input 
                    type="number"
                    required
                    className="w-full bg-transparent border-b border-white/10 py-4 pl-6 text-2xl outline-none focus:border-[#C9A24D] transition-all font-mono text-white"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Curatorial Notes</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 p-6 text-xs outline-none focus:border-[#C9A24D] transition-all italic text-gray-300 leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter product details, olfactory notes, or specifications..."
                />
              </div>
            </form>

            <div className="p-10 bg-[#0F0F0F] border-t border-white/5">
              <button 
                onClick={handleSubmit}
                disabled={isCreating}
                className="w-full bg-[#C9A24D] text-black py-5 text-[12px] font-black uppercase tracking-[0.5em] hover:bg-white transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                <Save size={18} /> {editingProduct ? "Synchronize Vault" : "Commit to Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedProductManager;