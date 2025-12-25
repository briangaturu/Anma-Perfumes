import React, { useState, useEffect } from "react";
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  useGetBranchesQuery, 
  useCreateBranchMutation, 
  useUpdateBranchMutation, 
  useDeleteBranchMutation,
  useUpdateBranchStatusMutation,
} from "../../features/Apis/Branch.Api";
import { Plus, Edit2, Trash2, X, Cloud, Loader2, Check, LayoutGrid, Settings2 } from "lucide-react";

const BranchAdminManager: React.FC = () => {
  // --- CLOUDINARY CONFIG ---
  const cloud_name = 'dwibg4vvf';
  const preset_key = 'tickets';

  const { data: branchesResponse, isLoading } = useGetBranchesQuery();
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();
  const [updateStatus] = useUpdateBranchStatusMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  
  // --- UPLOAD STATE ---
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- FORM STATE ---
  const [formData, setFormData] = useState<any>({
    name: "", code: "", city: "", address: "", contactNumber: "",
    email: "", storeHours: "", googleMapsUrl: "", gallery: [],
    offersJewellery: true, offersCosmetics: true, offersPerfumes: true,
    status: "active"
  });

  useEffect(() => {
    if (editingBranch) {
      setFormData({
        ...editingBranch,
        gallery: editingBranch.gallery || []
      });
    } else {
      setFormData({
        name: "", code: "", city: "", address: "", contactNumber: "",
        email: "", storeHours: "", googleMapsUrl: "", gallery: [],
        offersJewellery: true, offersCosmetics: true, offersPerfumes: true,
        status: "active"
      });
    }
  }, [editingBranch, isModalOpen]);

  // --- CLOUDINARY HANDLER ---
  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', preset_key);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        cloudFormData,
        { onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total || 1))) }
      );

      const newImageUrl = response.data.secure_url;
      setFormData((prev: any) => ({
        ...prev,
        gallery: [...(prev.gallery || []), newImageUrl]
      }));

      setUploadProgress(0);
      setUploading(false);
      Swal.fire({ title: 'Success', text: 'Asset added to boutique vault.', icon: 'success', background: '#0D0D0D', color: '#C9A24D' });
    } catch (err) {
      setUploading(false);
      Swal.fire('Error', 'Upload protocol failed.', 'error');
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      gallery: prev.gallery.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.gallery.length < 1) {
      return Swal.fire('Wait', 'A boutique requires at least one display image.', 'warning');
    }

    try {
      if (editingBranch) {
        await updateBranch({ id: editingBranch.id || editingBranch._id, updates: formData }).unwrap();
        // Handle explicit status update if it changed
        if(formData.status !== editingBranch.status) {
            await updateStatus({ id: editingBranch.id || editingBranch._id, status: formData.status }).unwrap();
        }
        Swal.fire({ title: 'Updated', text: 'Boutique registry synchronized.', icon: 'success', background: '#0D0D0D', color: '#C9A24D' });
      } else {
        await createBranch(formData).unwrap();
        Swal.fire({ title: 'Success', text: 'New boutique registered.', icon: 'success', background: '#0D0D0D', color: '#C9A24D' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      Swal.fire('Error', err.data?.message || "An error occurred", 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently remove the boutique from the registry.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C9A24D',
      cancelButtonColor: '#d33',
      background: '#0D0D0D',
      color: '#fff'
    });

    if (result.isConfirmed) {
      await deleteBranch(id);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen p-8 text-white font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-12 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-[#C9A24D] text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-2 mb-2">
            <Settings2 size={14}/> ANMA Management
          </h2>
          <h1 className="text-4xl font-serif">Boutique Registry</h1>
        </div>
        <button 
          onClick={() => { setEditingBranch(null); setIsModalOpen(true); }}
          className="bg-[#C9A24D] text-black px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl"
        >
          Add New Boutique
        </button>
      </div>

      {/* LISTING */}
      <div className="max-w-7xl mx-auto space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#C9A24D]" /></div>
        ) : branchesResponse?.data.map((branch: any) => (
          <div key={branch.id || branch._id} className="bg-[#0D0D0D] border border-white/5 p-6 flex items-center justify-between group hover:border-[#C9A24D]/30 transition-all">
            <div className="flex items-center gap-8">
              <div className="w-24 h-14 bg-black overflow-hidden border border-white/10">
                <img src={branch.gallery?.[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-1">{branch.name}</h3>
                <div className="flex items-center gap-4 text-[9px] text-gray-500 uppercase tracking-widest">
                    <span>{branch.city} — {branch.code}</span>
                    <span className={`px-2 py-0.5 border ${branch.status === 'active' ? 'border-green-500/30 text-green-500' : 'border-yellow-500/30 text-yellow-500'}`}>
                        {branch.status}
                    </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => { setEditingBranch(branch); setIsModalOpen(true); }} className="text-gray-500 hover:text-[#C9A24D] transition-colors"><Edit2 size={18}/></button>
              <button onClick={() => handleDelete(branch.id || branch._id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* SLIDE-OVER FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <form 
            onSubmit={handleSubmit}
            className="relative w-full max-w-xl bg-[#0B0B0B] h-full p-12 border-l border-[#C9A24D]/20 overflow-y-auto space-y-8"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h2 className="text-2xl font-serif italic text-[#C9A24D]">{editingBranch ? "Refine Boutique" : "New Creation"}</h2>
              <X className="cursor-pointer text-gray-500 hover:text-white" onClick={() => setIsModalOpen(false)} />
            </div>

            {/* CLOUDINARY UPLOAD SECTION */}
            <div className="space-y-4">
              <label className="text-[9px] uppercase text-[#C9A24D] font-bold tracking-[0.3em] flex justify-between items-center">
                Visual Gallery <span>{formData.gallery?.length}/8 Assets</span>
              </label>
              
              <div className="grid grid-cols-4 gap-3">
                {formData.gallery?.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square bg-black border border-white/10 group">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {formData.gallery?.length < 8 && (
                    <label className="aspect-square border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A24D]/50 hover:bg-[#C9A24D]/5 transition-all group">
                        <input type="file" className="hidden" onChange={handleCloudinaryUpload} disabled={uploading} />
                        {uploading ? <Loader2 className="animate-spin text-[#C9A24D]" size={20} /> : <Plus className="text-gray-600 group-hover:text-[#C9A24D]" size={20} />}
                    </label>
                )}
              </div>
              
              {uploadProgress > 0 && (
                <div className="w-full bg-white/5 h-[1px]">
                  <div className="bg-[#C9A24D] h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput label="Boutique Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
              <FormInput label="Registry Code" value={formData.code} onChange={(v) => setFormData({...formData, code: v})} />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <FormInput label="City" value={formData.city} onChange={(v) => setFormData({...formData, city: v})} />
                <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">Operational Status</label>
                    <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="bg-black border border-white/10 p-4 text-[11px] outline-none focus:border-[#C9A24D] text-white appearance-none"
                    >
                        <option value="active">Active</option>
                        <option value="renovating">Renovating</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <FormInput label="Physical Address" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} />

            <div className="grid grid-cols-2 gap-6">
              <FormInput label="Concierge Phone" value={formData.contactNumber} onChange={(v) => setFormData({...formData, contactNumber: v})} />
              <FormInput label="Liaison Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
            </div>

            <FormInput label="Service Hours" value={formData.storeHours} onChange={(v) => setFormData({...formData, storeHours: v})} />
            <FormInput label="Google Maps Liaison" value={formData.googleMapsUrl} onChange={(v) => setFormData({...formData, googleMapsUrl: v})} />

            {/* SERVICE TOGGLES */}
            <div className="pt-4 border-t border-white/5">
                <label className="text-[9px] uppercase text-[#C9A24D] font-bold tracking-[0.3em] mb-4 block">Trinity Services</label>
                <div className="grid grid-cols-3 gap-4">
                    <ServiceToggle label="Jewellery" active={formData.offersJewellery} onClick={() => setFormData({...formData, offersJewellery: !formData.offersJewellery})} />
                    <ServiceToggle label="Cosmetics" active={formData.offersCosmetics} onClick={() => setFormData({...formData, offersCosmetics: !formData.offersCosmetics})} />
                    <ServiceToggle label="Perfumes" active={formData.offersPerfumes} onClick={() => setFormData({...formData, offersPerfumes: !formData.offersPerfumes})} />
                </div>
            </div>

            <button 
              type="submit" 
              disabled={uploading || isCreating || isUpdating}
              className="w-full bg-[#C9A24D] text-black py-5 font-black uppercase text-[11px] tracking-[0.4em] hover:bg-white transition-all disabled:opacity-20 shadow-2xl flex justify-center items-center gap-2"
            >
              {(isCreating || isUpdating) ? <><Loader2 size={14} className="animate-spin" /> Synchronizing...</> : (editingBranch ? "Update Registry" : "Complete Registration")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- HELPERS ---

const FormInput = ({ label, value, onChange }: { label: string, value?: string, onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">{label}</label>
    <input 
      type="text" 
      required
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-black border border-white/10 p-4 text-[11px] outline-none focus:border-[#C9A24D] transition-all text-white placeholder:text-gray-800"
    />
  </div>
);

const ServiceToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        type="button"
        onClick={onClick}
        className={`flex items-center justify-between p-3 border transition-all ${active ? 'border-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/5 opacity-40'}`}
    >
        <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
        {active ? <Check size={12} className="text-[#C9A24D]" /> : <div className="w-3 h-3" />}
    </button>
);

export default BranchAdminManager;