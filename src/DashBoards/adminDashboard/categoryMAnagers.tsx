import React, { useState } from "react";
import axios from 'axios'; // Import axios for Cloudinary request
import { 
  useGetCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetCategoryDetailsQuery
} from "../../features/Apis/Categories.APi";
import { Plus, FolderTree, Trash2, ChevronRight, Layers, Image as ImageIcon, Hash, Link as LinkIcon, X, Save, Sparkles, Loader2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

const CategoryManager = () => {
  // --- CLOUDINARY CONFIG ---
  const cloud_name = 'dwibg4vvf';
  const preset_key = 'tickets'; 

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"category" | "subcategory">("category");
  const [editMode, setEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Track upload state

  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    imageUrl: "", 
    slug: "" 
  });

  const { data: categories, isLoading: catsLoading } = useGetCategoriesQuery({});
  const { data: selectedCatDetails, isFetching: detailsLoading } = useGetCategoryDetailsQuery(selectedCatId || "", { skip: !selectedCatId });
  
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createSub] = useCreateSubCategoryMutation();
  const [deleteSub] = useDeleteSubCategoryMutation();

  // --- CLOUDINARY UPLOAD HANDLER ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', preset_key);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        cloudFormData
      );
      setFormData({ ...formData, imageUrl: response.data.secure_url });
      toast.success("Visual Asset Prepared");
    } catch (err) {
      toast.error("Cloudinary Sync Failed");
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = (type: "category" | "subcategory", data: any = null) => {
    setModalType(type);
    setEditMode(!!data);
    if (data) {
      setFormData({
        name: data.name,
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        slug: data.slug || ""
      });
    } else {
      setFormData({ name: "", description: "", imageUrl: "", slug: "" });
    }
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === "category") {
        const payload = { 
            name: formData.name, 
            description: formData.description, 
            imageUrl: formData.imageUrl 
        };
        
        if (editMode && selectedCatId) {
          await updateCategory({ id: selectedCatId, body: payload }).unwrap();
        } else {
          await createCategory(payload).unwrap();
        }
      } else {
        await createSub({ categoryId: selectedCatId!, name: formData.name, slug: formData.slug }).unwrap();
      }
      toast.success("Archive Synchronized");
      setModalOpen(false);
    } catch (err) { 
      toast.error("Operation Failed"); 
    }
  };

  if (catsLoading) return <div className="p-20 text-center text-[#C9A24D] tracking-[0.5em] animate-pulse uppercase text-xs">Accessing Ancient Ledger...</div>;

  return (
    <div className="relative min-h-screen p-4 md:p-8 animate-in fade-in duration-700">
      
      {/* 1. TOP ARCHITECTURE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#C9A24D]/20 pb-10 gap-6">
        <div>
          <h1 className="text-5xl font-extralight tracking-tighter text-white">
            Collection <span className="text-[#C9A24D] font-bold not-italic">Architect</span>
          </h1>
          <p className="text-[#C9A24D]/50 text-[10px] uppercase tracking-[0.5em] mt-4 font-bold">Maison de Luxe Structure</p>
        </div>
        <button 
          onClick={() => openModal("category")} 
          className="bg-[#C9A24D] text-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-xl"
        >
          Establish New Vault
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
        {/* 2. CATEGORY SELECTOR (LEFT) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={14} className="text-[#C9A24D]" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Primary Categories</h3>
          </div>
          
          <div className="space-y-3">
            {categories?.data?.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`group p-6 cursor-pointer border transition-all duration-500 ${
                  selectedCatId === cat.id 
                  ? "bg-[#C9A24D]/10 border-[#C9A24D] translate-x-3 shadow-[0_0_30px_rgba(201,162,77,0.05)]" 
                  : "bg-[#0B0B0B] border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <FolderTree size={16} className={selectedCatId === cat.id ? "text-[#C9A24D]" : "text-gray-700"} />
                    <h4 className={`text-xs font-bold uppercase tracking-widest ${selectedCatId === cat.id ? "text-white" : "text-gray-500"}`}>
                      {cat.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                      className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={16} className={selectedCatId === cat.id ? "text-[#C9A24D]" : "text-gray-800"} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. DETAIL & SUB-FAMILY VIEW (RIGHT) */}
        <div className="lg:col-span-8">
          {!selectedCatId ? (
            <div className="h-full min-h-[500px] border border-dashed border-white/5 flex flex-col items-center justify-center text-gray-800">
              <Layers size={50} strokeWidth={0.5} className="mb-6 opacity-20" />
              <p className="text-[10px] uppercase tracking-[0.4em]">Select a vault to view content</p>
            </div>
          ) : (
            <div className={`space-y-8 animate-in slide-in-from-bottom-4 duration-500 ${detailsLoading ? "opacity-20" : ""}`}>
              <div className="bg-[#0B0B0B] p-10 border border-white/5 group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <h2 className="text-4xl font-bold uppercase tracking-widest text-white">{selectedCatDetails?.name}</h2>
                    <button onClick={() => openModal("category", selectedCatDetails)} className="text-gray-600 hover:text-[#C9A24D] transition-colors">
                      <ImageIcon size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 italic mb-8 max-w-xl leading-relaxed">{selectedCatDetails?.description}</p>
                  <button 
                    onClick={() => openModal("subcategory")}
                    className="bg-white/5 hover:bg-[#C9A24D] hover:text-black border border-white/10 px-6 py-3 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Add Sub-Family Line
                  </button>
                </div>
                {/* Visual texture */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[#C9A24D]/5 to-transparent pointer-events-none" />
              </div>

              {/* SUBCATEGORY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCatDetails?.subcategories?.map((sub) => (
                  <div key={sub.id} className="bg-[#0B0B0B] border border-white/5 p-6 flex justify-between items-center group hover:border-[#C9A24D]/30 transition-all">
                    <div>
                      <div className="flex items-center gap-3">
                        <Hash size={12} className="text-[#C9A24D]" />
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-200">{sub.name}</h5>
                      </div>
                      <p className="text-[9px] font-mono text-gray-600 mt-2 uppercase tracking-tighter italic">URL: {sub.slug}</p>
                    </div>
                    <button onClick={() => { if(confirm("Archiving sub-family?")) deleteSub(sub.id) }} className="p-2 text-gray-800 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. THE ULTIMATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-3xl bg-[#0B0B0B] border border-[#C9A24D]/30 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-[#111] flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C9A24D]">
                {modalType === "category" ? (editMode ? "Modify Category" : "Establish Category") : "New Sub-Family Line"}
              </span>
              <button onClick={() => setModalOpen(false)} className="text-gray-600 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-gray-500 block mb-3 font-bold">Official Name</label>
                    <input 
                      required
                      autoFocus
                      className="w-full bg-transparent border-b border-white/10 py-3 text-sm outline-none focus:border-[#C9A24D] transition-all text-white font-medium uppercase tracking-widest"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  {modalType === "category" ? (
                    <>
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 block mb-3 font-bold">Hero Asset (Cloudinary Upload)</label>
                        <div className="flex flex-col gap-3">
                           <label className="flex items-center justify-center gap-3 bg-white/5 border border-dashed border-white/10 py-3 text-[10px] text-gray-400 hover:border-[#C9A24D] hover:text-white transition-all cursor-pointer">
                              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                              {isUploading ? "Uploading Visual..." : "Select Masterpiece File"}
                              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                           </label>
                           {formData.imageUrl && (
                             <p className="text-[8px] font-mono text-[#C9A24D]/50 truncate">URL: {formData.imageUrl}</p>
                           )}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-widest text-gray-500 block mb-3 font-bold">Curatorial Description</label>
                        <textarea 
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-[#C9A24D] transition-all text-gray-300 italic leading-relaxed"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 block mb-3 font-bold">Navigation Route (Slug)</label>
                      <input 
                        required
                        className="w-full bg-transparent border-b border-white/10 py-3 text-sm outline-none focus:border-[#C9A24D] transition-all text-[#C9A24D] font-mono"
                        placeholder="fragrances/luxury-oud"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                {/* PREVIEW PANEL */}
                <div className="flex flex-col">
                   <h4 className="text-[9px] uppercase tracking-widest text-gray-700 mb-4 font-black italic">Vault Preview</h4>
                   <div className="flex-1 bg-black border border-white/5 relative group min-h-[150px]">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Category Preview" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon size={60} /></div>
                      )}
                   </div>
                   <button 
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-[#C9A24D] text-black py-5 mt-6 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-white transition-all shadow-2xl disabled:opacity-20"
                  >
                    Commit to Vault
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;