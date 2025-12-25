import React, { useState, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Trash2, Plus, Image as ImageIcon, Video as VideoIcon, Cloud, 
  Loader2, Search, RefreshCw, PlayCircle, Eye 
} from 'lucide-react';
import { 
  useGetAllProductsQuery, 
  useGetProductMediaQuery, 
  useAddMediaMutation,     
  useDeleteMediaMutation    
} from '../../features/Apis/products.Api';

const MediaCrudVault = () => {
  const cloud_name = 'dwibg4vvf';
  const preset_key = 'tickets'; 

  // --- STATE ---
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // --- API HOOKS ---
  const { data: rawResponse, isLoading: productsLoading } = useGetAllProductsQuery({});
  const { data: currentMedia, isFetching: mediaLoading, refetch: refetchMedia } = useGetProductMediaQuery(
    selectedProductId, 
    { skip: !selectedProductId } 
  );

  const [addMedia, { isLoading: isCreating }] = useAddMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  const productList = useMemo(() => {
    if (!rawResponse) return [];
    if (Array.isArray(rawResponse)) return rawResponse;
    return rawResponse.data || rawResponse.products || [];
  }, [rawResponse]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedProductId) return;

    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', preset_key);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        cloudFormData,
        { onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total || 1))) }
      );

      await addMedia({
        productId: selectedProductId,
        url: response.data.secure_url,
        type: uploadType
      }).unwrap();

      setFile(null);
      setUploadProgress(0);
      setIsModalOpen(false);
      Swal.fire({ title: 'Success', text: 'Asset added to vault.', icon: 'success', background: '#0D0D0D', color: '#C9A24D' });
    } catch (err) {
      Swal.fire('Error', 'Upload protocol failed.', 'error');
    }
  };

  const handleDelete = async (mediaId: string) => {
    const result = await Swal.fire({
      title: 'Purge Asset?',
      text: 'This visual will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C9A24D',
      cancelButtonColor: '#111',
      background: '#0D0D0D',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await deleteMedia(mediaId).unwrap();
        Swal.fire('Deleted', 'Asset removed from archive.', 'success');
      } catch (err) {
        Swal.fire('Failed', 'Delete operation interrupted.', 'error');
      }
    }
  };

  return (
    <div className="bg-[#080808] border border-white/5 p-8 rounded-sm space-y-10 min-h-screen">
      
      {/* 1. SELECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white flex items-center gap-3">
            <Cloud size={16} className="text-[#C9A24D]" /> Media Vault CRUD
          </h2>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">Manage lifecycle of product visuals</p>
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <select 
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full md:w-80 bg-black border border-white/10 text-[10px] px-5 py-4 text-[#C9A24D] font-bold uppercase tracking-[0.2em] outline-none"
          >
            <option value="">— SELECT PRODUCT —</option>
            {productList.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <button
            disabled={!selectedProductId}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#C9A24D] text-black px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white disabled:opacity-10 transition-all"
          >
            Add New Visual
          </button>
        </div>
      </div>

      {/* 2. LIVE GALLERY (FIXED VIDEO PREVIEW) */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-bold">Current Archive</h3>
          <button onClick={() => refetchMedia()} className="text-gray-600 hover:text-white transition-colors">
            <RefreshCw size={14} className={mediaLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {selectedProductId ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentMedia?.map((m: any) => (
              <div key={m.id} className="group relative aspect-video bg-black border border-white/5 overflow-hidden rounded-sm">
                
                {/* CONDITIONAL RENDERING FOR IMAGE VS VIDEO */}
                {m.type === 'image' ? (
                  <img 
                    src={m.url} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    alt="Product Asset" 
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video 
                      src={m.url} 
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => e.currentTarget.pause()}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 p-1 rounded">
                      <VideoIcon size={12} className="text-[#C9A24D]" />
                    </div>
                  </div>
                )}
                
                {/* ACTIONS OVERLAY */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-6">
                  <a href={m.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-[8px] uppercase tracking-widest text-white hover:text-[#C9A24D]">
                    <Eye size={20} />
                    View
                  </a>
                  <button 
                    onClick={() => handleDelete(m.id)} 
                    className="flex flex-col items-center gap-1 text-[8px] uppercase tracking-widest text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={20} />
                    Purge
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border border-dashed border-white/5 opacity-20">
            <p className="text-[10px] uppercase tracking-[0.6em]">Select a masterpiece to view archive</p>
          </div>
        )}
      </div>

      {/* 3. UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#0F0F0F] border border-[#C9A24D]/20 w-full max-w-sm p-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C9A24D] mb-8 text-center border-b border-white/5 pb-4">New Asset Injection</h3>
            <form onSubmit={handleUpload} className="space-y-8">
              <div className="flex gap-2">
                {['image', 'video'].map((t) => (
                  <button key={t} type="button" onClick={() => setUploadType(t as any)}
                    className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-[0.2em] border transition-all ${uploadType === t ? 'border-[#C9A24D] text-[#C9A24D] bg-[#C9A24D]/5' : 'border-white/5 text-gray-500'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input type="file" accept={uploadType === 'image' ? 'image/*' : 'video/*'} onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full bg-black border border-white/10 p-4 text-[10px] text-gray-600 cursor-pointer" required />
              {uploadProgress > 0 && (
                <div className="w-full h-[1px] bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#C9A24D] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
              <button type="submit" disabled={isCreating || uploadProgress > 0} className="w-full bg-[#C9A24D] text-black py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white disabled:opacity-20 flex items-center justify-center gap-3">
                {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Confirm Injection
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaCrudVault;