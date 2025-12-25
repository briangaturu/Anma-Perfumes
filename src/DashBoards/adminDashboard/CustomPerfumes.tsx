import React from 'react';
import { 
  useGetAllCustomPerfumesQuery,
  useUpdateCustomPerfumeStatusMutation, 
  useDeleteCustomPerfumeMutation 
} from '../../features/Apis/CustomPerfumes.Api';

export const MixingLabQueue: React.FC = () => {
  // 1. Fetch all orders directly in the component
  const { data: orders, isLoading, isError } = useGetAllCustomPerfumesQuery();
  
  const [updateStatus, { isLoading: isUpdating }] = useUpdateCustomPerfumeStatusMutation();
  const [deleteOrder] = useDeleteCustomPerfumeMutation();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this custom blend?")) {
      await deleteOrder(id);
    }
  };

  if (isLoading) return <div className="p-10 text-[#C9A24D] text-center font-serif animate-pulse">Opening the Alchemist Vault...</div>;
  
  if (isError) return <div className="p-10 text-red-500 text-center">Error loading the mixing queue. Check connection.</div>;

  return (
    <div className="p-6 bg-[#0B0B0B] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-[#C9A24D]">Mixing Lab Queue</h2>
          <p className="text-gray-500 text-xs uppercase tracking-widest">Master Bespoke Fulfillment</p>
        </div>
        <div className="bg-[#141414] px-4 py-2 border border-[#C9A24D]/30 rounded">
          <span className="text-[#C9A24D] font-bold">{orders?.length || 0}</span>
          <span className="text-xs text-gray-400 ml-2 uppercase">Pending Blends</span>
        </div>
      </div>
      
      <div className="grid gap-6">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-[#141414] border border-white/5 hover:border-[#C9A24D]/40 transition-all p-5 rounded-lg flex flex-col md:flex-row justify-between gap-6">
              
              {/* Order Info & Customer Details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    order.status === 'received' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'in_preparation' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-xl text-white">"{order.customName || 'Untitled Blend'}"</h3>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                   <div className="flex flex-col">
                      <span className="text-gray-500 uppercase text-[9px]">Customer</span>
                      <span className="text-white font-medium">{order.user?.fullName || 'Guest'}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-gray-500 uppercase text-[9px]">Specifications</span>
                      <span className="text-gray-300">{order.bottleSize} | {order.strength}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-gray-500 uppercase text-[9px]">Total Price</span>
                      <span className="text-[#C9A24D] font-bold">KES {order.totalPrice}</span>
                   </div>
                </div>
                
                {/* THE RECIPE CARD */}
                <div className="mt-4 p-4 bg-black/60 rounded-md border-l-2 border-[#C9A24D]">
                  <p className="text-[10px] text-[#C9A24D] uppercase font-black mb-3 tracking-tighter">Mixing Formula</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                    {order.bases?.map((b) => (
                      <li key={b.id} className="flex flex-col border-b border-white/5 pb-1">
                        <span className="text-sm font-semibold text-gray-200">{b.base.name}</span>
                        <span className="text-[10px] text-gray-500 italic line-clamp-1">{b.base.notes}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.providesOwnBottle && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <p className="text-[10px] text-red-400 font-bold uppercase">Waiting for customer bottle</p>
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex flex-col justify-center gap-3 min-w-[180px] bg-black/20 p-4 rounded-lg">
                <label className="text-[9px] uppercase text-gray-500 font-bold">Update Progress</label>
                <select 
                  value={order.status}
                  disabled={isUpdating}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="bg-[#1a1a1a] border border-white/10 p-2 text-xs rounded-md text-white outline-none focus:border-[#C9A24D] cursor-pointer"
                >
                  <option value="received">Received</option>
                  <option value="in_preparation">Blending</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="shipped">Shipped</option>
                </select>
                
                <div className="h-[1px] bg-white/5 my-1" />
                
                <button 
                  onClick={() => handleDelete(order.id)}
                  className="text-[10px] uppercase font-bold text-gray-600 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Discard Blend
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
            <p className="text-gray-500 italic">No custom orders in the queue yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};