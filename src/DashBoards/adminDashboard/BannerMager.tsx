import React, { useState, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Trash2, Plus, Image as ImageIcon, Cloud, 
  Loader2, RefreshCw, Layout, Layers, Link2, Type
} from 'lucide-react';
import { 
  useGetAllBannersQuery, 
  useCreateBannerMutation, 
  useDeleteBannerMutation 
} from '../../features/Apis/BannerApi';

const BannerMAnagement = () => {
  // --- CLOUDINARY CONFIG ---
  const CLOUD_NAME = 'dwibg4vvf';
  const UPLOAD_PRESET = 'tickets'; 

  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: 'Explore More',
    ctaLink: '',
    type: 'hero' as 'hero' | 'side',
    priority: 10
  });

  // --- API HOOKS ---
  const { data: banners, isLoading: bannersLoading, refetch } = useGetAllBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  // --- HANDLERS ---
  const handleUploadAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return Swal.fire('Error', 'Please select a banner image.', 'error');

    try {
      setUploadProgress(1);
      const cloudData = new FormData();
      cloudData.append('file', file);
      cloudData.append('upload_preset', UPLOAD_PRESET);

      // 1. Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        cloudData,
        { onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total || 1))) }
      );

      // 2. Create in Backend
      await createBanner({
        ...formData,
        imageUrl: response.data.secure_url,
      }).unwrap();

      Swal.fire({ title: 'Deployed', text: 'Banner added to site.', icon: 'success', background: '#0D0D0D', color: '#C9A24D' });
      setIsModalOpen(false);
      setFile(null);
      setUploadProgress(0);
    } catch (err) {
      Swal.fire('Error', 'Banner deployment failed.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Remove Banner?',
      text: 'This will affect the live storefront.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C9A24D',
      background: '#0D0D0D',
      color: '#fff'
    });

    if (result.isConfirmed) {
      await deleteBanner(id);
      Swal.fire('Removed', 'Banner deleted.', 'success');
    }
  };

  return (
    <div className="bg-[#080808] border border-white/5 p-8 rounded-sm min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-8 mb-12">
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white flex items-center gap-3">
            <Layout size={16} className="text-[#C9A24D]" /> Storefront Banners
          </h2>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">Manage Hero Sliders & Promotions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C9A24D] text-black px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all"
        >
          Create Banner
        </button>
      </div>

      {/* GRID VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {banners?.map((banner) => (
          <div key={banner.id} className="group relative bg-[#0D0D0D] border border-white/5 overflow-hidden flex flex-col">
            <div className="relative aspect-video">
              <img 
                src={banner.imageUrl.replace('/upload/', '/upload/w_600,f_auto/')} 
                alt="" 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-[7px] font-black px-3 py-1 uppercase tracking-widest ${banner.type === 'hero' ? 'bg-[#C9A24D] text-black' : 'bg-white text-black'}`}>
                  {banner.type}
                </span>
                <span className="bg-black/80 text-white text-[7px] px-3 py-1 uppercase tracking-widest border border-white/10">
                  Priority: {banner.priority}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-2">
              <h3 className="text-white text-[11px] font-bold uppercase tracking-wider truncate">{banner.title}</h3>
              <p className="text-gray-500 text-[9px] uppercase tracking-widest truncate">{banner.subtitle}</p>
              <div className="pt-4 flex justify-between items-center border-t border-white/5 mt-4">
                <span className="text-[8px] text-gray-400 font-mono">{banner.ctaLink || 'No Link'}</span>
                <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:text-white transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#0F0F0F] border border-white/10 w-full max-w-lg p-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A24D] mb-10 text-center">New Banner Deployment</h3>
            
            <form onSubmit={handleUploadAndCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] text-gray-500 uppercase font-black">Banner Type</label>
                <div className="flex gap-2">
                  {['hero', 'side'].map((t) => (
                    <button key={t} type="button" onClick={() => setFormData({...formData, type: t as any})}
                      className={`flex-1 py-3 text-[9px] font-black uppercase border tracking-widest transition-all ${formData.type === t ? 'border-[#C9A24D] text-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/5 text-gray-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] text-gray-500 uppercase font-black">Title</label>
                <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/10 p-4 text-[10px] text-white focus:border-[#C9A24D] outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[8px] text-gray-500 uppercase font-black">Subtitle</label>
                <input value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-black border border-white/10 p-4 text-[10px] text-white focus:border-[#C9A24D] outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[8px] text-gray-500 uppercase font-black">CTA Link (e.g., /perfumes)</label>
                <input value={formData.ctaLink} onChange={(e) => setFormData({...formData, ctaLink: e.target.value})} className="w-full bg-black border border-white/10 p-4 text-[10px] text-white focus:border-[#C9A24D] outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[8px] text-gray-500 uppercase font-black">Priority (Higher = First)</label>
                <input type="number" value={formData.priority} onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 p-4 text-[10px] text-white focus:border-[#C9A24D] outline-none" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] text-gray-500 uppercase font-black">Background Image</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full bg-black border border-white/10 p-4 text-[10px] text-gray-500" required />
              </div>

              {uploadProgress > 0 && (
                <div className="md:col-span-2 h-[2px] bg-white/5">
                  <div className="h-full bg-[#C9A24D] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}

              <button type="submit" disabled={isCreating} className="md:col-span-2 bg-[#C9A24D] text-black py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white flex items-center justify-center gap-3">
                {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Deploy Banner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerMAnagement;