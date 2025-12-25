import React, { useState, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Trash2, Plus, Image as ImageIcon, Cloud, 
  Loader2, Search, RefreshCw, Eye, FlaskConical, DollarSign
} from 'lucide-react';
import { 
  useGetBaseScentsQuery, 
  useCreateBaseScentMutation, 
  useUpdateBaseScentMutation, 
  useDeleteBaseScentMutation 
} from '../../features/Apis/CustomPerfumes.Api';

const BaseScentVault = () => {
  // Cloudinary Config from your setup
  const cloud_name = 'dwibg4vvf';
  const preset_key = 'tickets'; 

  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const [form, setForm] = useState({
    name: '',
    notes: '',
    description: '',
    pricePerMl: '',
    isActive: true
  });

  // --- API HOOKS ---
  const { data: scents, isLoading: scentsLoading, refetch } = useGetBaseScentsQuery({ activeOnly: false });
  const [createScent, { isLoading: isCreating }] = useCreateBaseScentMutation();
  const [updateScent] = useUpdateBaseScentMutation();
  const [deleteScent] = useDeleteBaseScentMutation();

  // --- FILTERING ---
  const filteredScents = useMemo(() => {
    if (!scents) return [];
    return scents.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scents, searchTerm]);

  // --- CLOUDINARY UPLOAD & SAVE ---
  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return Swal.fire('Error', 'Please select an image for the scent.', 'error');

    try {
      setUploadProgress(10);
      const cloudFormData = new FormData();
      cloudFormData.append('file', file);
      cloudFormData.append('upload_preset', preset_key);

      // 1. Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        cloudFormData,
        { onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total || 1))) }
      );

      // 2. Save to Database using the exact fields from your .http file
      await createScent({
        ...form,
        imageUrl: response.data.secure_url,
        pricePerMl: parseFloat(form.pricePerMl) // Ensure numeric value
      }).unwrap();

      // Reset
      setFile(null);
      setUploadProgress(0);
      setForm({ name: '', notes: '', description: '', pricePerMl: '', isActive: true });
      setIsModalOpen(false);
      
      Swal.fire({ 
        title: 'Vault Updated', 
        text: `${form.name} is now available for blending.`, 
        icon: 'success', 
        background: '#0D0D0D', 
        color: '#C9A24D' 
      });
    } catch (err) {
      setUploadProgress(0);
      Swal.fire('Error', 'Failed to register ingredient.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Purge Scent?',
      text: 'This ingredient will be removed from the vault.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C9A24D',
      background: '#0D0D0D',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await deleteScent(id).unwrap();
        Swal.fire('Deleted', 'Scent removed.', 'success');
      } catch (err: any) {
        Swal.fire('Conflict', err.data?.error || 'Cannot delete: Scent is used in active recipes.', 'error');
      }
    }
  };

  return (
    <div className="bg-[#080808] border border-white/5 p-8 rounded-sm space-y-10 min-h-screen">
      
      {/* 1. SELECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white flex items-center gap-3">
            <FlaskConical size={16} className="text-[#C9A24D]" /> Scent Alchemist Vault
          </h2>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">Inventory management for raw perfume oils</p>
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#C9A24D]" size={14} />
            <input 
              type="text"
              placeholder="SEARCH VAULT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black border border-white/10 text-[10px] pl-10 pr-5 py-4 text-[#C9A24D] font-bold uppercase tracking-[0.2em] outline-none md:w-64"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#C9A24D] text-black px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all"
          >
            Add New Ingredient
          </button>
        </div>
      </div>

      {/* 2. LIVE GALLERY */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-bold">Available Ingredients ({filteredScents.length})</h3>
          <button onClick={() => refetch()} className="text-gray-600 hover:text-white transition-colors">
            <RefreshCw size={14} className={scentsLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredScents.map((scent: any) => (
            <div key={scent.id} className="group relative bg-black border border-white/5 p-4 transition-all hover:border-[#C9A24D]/30">
              <div className="aspect-square bg-[#0D0D0D] overflow-hidden mb-4 relative">
                <img 
                  src={scent.imageUrl} 
                  className={`w-full h-full object-cover transition-transform group-hover:scale-110 ${!scent.isActive && 'grayscale opacity-30'}`} 
                  alt={scent.name} 
                />
                {!scent.isActive && (
                   <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-red-600 text-white px-3 py-1">Inactive</span>
                   </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-[12px] font-black uppercase text-white tracking-widest">{scent.name}</h4>
                <p className="text-[9px] text-[#C9A24D] font-serif italic">{scent.notes}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-2">KES {scent.pricePerMl} / ml</p>
              </div>
              
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => updateScent({ id: scent.id, body: { isActive: !scent.isActive }})}
                  className="bg-black/80 p-2 text-white hover:text-[#C9A24D]"
                >
                  <RefreshCw size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(scent.id)}
                  className="bg-black/80 p-2 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#0F0F0F] border border-[#C9A24D]/20 w-full max-w-md p-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C9A24D] mb-8 text-center border-b border-white/5 pb-4">Ingredient Registration</h3>
            
            <form onSubmit={handleUploadAndSave} className="space-y-6">
              <div className="space-y-4">
                <input 
                  type="text" required placeholder="SCENT NAME" 
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-black border border-white/10 p-4 text-[10px] text-[#C9A24D] outline-none uppercase"
                />
                <input 
                  type="text" placeholder="NOTES (e.g. Smoky, Woody)" 
                  value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-black border border-white/10 p-4 text-[10px] text-gray-400 outline-none"
                />
                <textarea 
                  placeholder="DESCRIPTION" 
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-black border border-white/10 p-4 text-[10px] text-gray-400 outline-none h-20"
                />
                <div className="relative">
                  <DollarSign size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="number" required placeholder="PRICE PER ML" 
                    value={form.pricePerMl} onChange={e => setForm({...form, pricePerMl: e.target.value})}
                    className="w-full bg-black border border-white/10 pl-10 pr-4 py-4 text-[10px] text-[#C9A24D] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Scent Visual (Cloudinary)</label>
                <input 
                  type="file" accept="image/*" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  className="w-full bg-black border border-white/10 p-4 text-[10px] text-gray-600 cursor-pointer" 
                  required 
                />
              </div>

              {uploadProgress > 0 && (
                <div className="w-full h-[2px] bg-white/5">
                  <div className="h-full bg-[#C9A24D] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isCreating || uploadProgress > 0} 
                className="w-full bg-[#C9A24D] text-black py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white disabled:opacity-20 flex items-center justify-center gap-3"
              >
                {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Register Scent
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseScentVault;