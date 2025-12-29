import React, { useState, useMemo } from "react";
import Swal from 'sweetalert2';
import { 
  useGetAllOrdersQuery, 
  useUpdateOrderStatusMutation, 
  useCancelOrderMutation,
  useDeleteOrderMutation 
} from "../../features/Apis/Orders.Api"; 
import { useGetPaymentsByOrderIdQuery } from "../../features/Apis/Mpesa.Api";
import { useGetProductDetailsQuery } from "../../features/Apis/products.Api"; 
import { 
  Loader2, ChevronDown, ChevronUp, MapPin, Building2, User, 
  ChevronLeft, ChevronRight, Filter, Calendar, Clock, CheckCircle2, 
  ShieldAlert, PackageCheck, Wallet, ShoppingBag, Trash2, Search
} from "lucide-react";

// --- SUB-COMPONENT: FETCH PRODUCT NAME BY ID ---
const ProductName: React.FC<{ productId: string }> = ({ productId }) => {
  const { data: product, isLoading } = useGetProductDetailsQuery(productId);
  if (isLoading) return <span className="animate-pulse opacity-40">Loading item...</span>;
  return <span>{product?.name || "Premium Item"}</span>;
};

// --- SUB-COMPONENT: SYSTEM PAYMENT VERIFICATION ---
const PaymentStatusBadge: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { data: payments, isLoading } = useGetPaymentsByOrderIdQuery(orderId);
  if (isLoading) return <Loader2 size={12} className="animate-spin opacity-20" />;
  const hasSuccessfulPayment = payments?.some(p => p.status === "success");

  return hasSuccessfulPayment ? (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
      <CheckCircle2 size={10} className="text-green-500" />
      <span className="text-[8px] font-black uppercase tracking-widest text-green-500">System Verified</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
      <ShieldAlert size={10} className="text-red-500" />
      <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Unpaid Ledger</span>
    </div>
  );
};

const SuperAdminOrderManager: React.FC = () => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- EXTENDED FILTERS STATE ---
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [specificDate, setSpecificDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const itemsPerPage = 6;

  const { data: ordersData, isLoading: isListLoading } = useGetAllOrdersQuery({ status: "" });
  const orders = useMemo(() => ordersData?.data || ordersData || [], [ordersData]);

  const [updateStatus] = useUpdateOrderStatusMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  // --- LOGIC: PERMANENTLY DELETE ORDER ---
  const handleDeleteAction = async (id: string) => {
    const result = await Swal.fire({
      title: 'Permanent Deletion?',
      text: "This removes the record entirely from the database.",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#1A1A1A',
      confirmButtonText: 'Delete Permanently',
      background: '#0D0D0D',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await deleteOrder(id).unwrap();
        Swal.fire({ title: 'Record Purged', icon: 'success', background: '#0D0D0D', color: '#ef4444' });
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err?.data?.message || 'Delete failed', icon: 'error' });
      }
    }
  };

  const handleCancelAction = async (id: string) => {
    const result = await Swal.fire({
      title: 'Revoke Order?',
      text: "This will cancel the order and restore branch inventory.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C9A24D',
      cancelButtonColor: '#1A1A1A',
      confirmButtonText: 'Yes, Revoke',
      background: '#0D0D0D',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await cancelOrder(id).unwrap();
        Swal.fire({ title: 'Order Revoked', icon: 'success', background: '#0D0D0D', color: '#C9A24D' });
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err?.data?.message || 'Operation failed', icon: 'error' });
      }
    }
  };

  // --- ADVANCED FILTERING LOGIC ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const branchName = (order.branch?.name || order.branchId || "").toLowerCase();
      const customerName = (order.customerName || "").toLowerCase();
      const orderNo = (order.orderNumber || "").toLowerCase();

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesBranch = branchFilter === "all" || branchName.includes(branchFilter.toLowerCase());
      const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter;
      const matchesDate = !specificDate || orderDate === specificDate;
      const matchesSearch = !searchTerm || customerName.includes(searchTerm.toLowerCase()) || orderNo.includes(searchTerm.toLowerCase());

      return matchesStatus && matchesBranch && matchesPayment && matchesDate && matchesSearch;
    });
  }, [orders, statusFilter, branchFilter, paymentFilter, specificDate, searchTerm]);

  // Dynamic list of branches for the filter dropdown
  const uniqueBranches = useMemo(() => {
    const branches = orders.map((o: any) => o.branch?.name || o.branchId).filter(Boolean);
    return Array.from(new Set(branches));
  }, [orders]);

  const stats = useMemo(() => {
    const confirmedTotal = filteredOrders
      .filter((o: any) => o.paymentStatus === 'success')
      .reduce((acc: number, curr: any) => acc + parseFloat(curr.totalAmount), 0);
    const pendingCount = filteredOrders.filter((o: any) => o.status === 'pending').length;
    return { confirmedTotal, pendingCount };
  }, [filteredOrders]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#050505] text-[#D1D1D1] font-sans p-4 md:p-10 pt-28">
      <div className="max-w-7xl mx-auto">
        
        {/* --- STATS OVERVIEW --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#0A0A0A] border border-[#C9A24D]/20 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black mb-1 tracking-widest">Filtered Revenue</p>
              <h3 className="text-2xl font-serif text-white italic">KES {stats.confirmedTotal.toLocaleString()}</h3>
            </div>
            <Wallet className="text-[#C9A24D] opacity-20" size={40}/>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/30 uppercase font-black mb-1 tracking-widest">Selected Pending</p>
              <h3 className="text-2xl font-serif text-white italic">{stats.pendingCount} Orders</h3>
            </div>
            <Clock className="text-amber-500 opacity-20" size={40}/>
          </div>
        </div>

        {/* --- MULTI-FILTER BAR --- */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 mb-8 space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex-1 min-w-[250px]">
              <Search size={14} className="text-white/20"/>
              <input 
                type="text" 
                placeholder="Search Customer or Order ID..."
                className="bg-transparent border-none outline-none text-xs w-full text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Branch Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black uppercase text-white/20 tracking-widest ml-1">Vault/Branch</label>
                <select 
                  className="bg-white/5 border border-white/10 text-[10px] font-bold uppercase p-2 rounded-lg text-[#C9A24D] outline-none"
                  value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="all">All Branches</option>
                  {uniqueBranches.map((b: any) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black uppercase text-white/20 tracking-widest ml-1">Logistics</label>
                <select 
                  className="bg-white/5 border border-white/10 text-[10px] font-bold uppercase p-2 rounded-lg text-[#C9A24D] outline-none"
                  value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black uppercase text-white/20 tracking-widest ml-1">Payment</label>
                <select 
                  className="bg-white/5 border border-white/10 text-[10px] font-bold uppercase p-2 rounded-lg text-[#C9A24D] outline-none"
                  value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="success">Success</option>
                  <option value="pending">Unpaid</option>
                </select>
              </div>

              {/* Date Picker Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black uppercase text-white/20 tracking-widest ml-1">Specific Date</label>
                <input 
                  type="date" 
                  className="bg-white/5 border border-white/10 text-[10px] font-bold p-2 rounded-lg text-[#C9A24D] outline-none invert-[0.8]"
                  value={specificDate} onChange={(e) => setSpecificDate(e.target.value)}
                />
              </div>

              {/* Reset Button */}
              <button 
                onClick={() => { setStatusFilter("all"); setBranchFilter("all"); setPaymentFilter("all"); setSpecificDate(""); setSearchTerm(""); }}
                className="mt-5 text-[8px] font-black uppercase text-white/40 hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* --- ORDER LIST --- */}
        <div className="space-y-4">
          {isListLoading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40"><Loader2 className="animate-spin text-[#C9A24D]" size={32} /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-[#0A0A0A] rounded-2xl border border-dashed border-white/10">
              <Info className="mx-auto text-white/10 mb-4" size={40}/>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No matching records found in registry</p>
            </div>
          ) : (
            paginatedOrders.map((order: any) => {
              const isExpanded = expandedOrderId === order.id;
              const branchName = order.branch?.name || order.branchId || "Unknown Branch";
              
              return (
                <div key={order.id} className={`transition-all duration-300 border rounded-xl overflow-hidden ${isExpanded ? 'border-[#C9A24D]/40 bg-[#0A0A0A]' : 'border-white/5 bg-[#080808] hover:bg-white/[0.01]'}`}>
                  {/* ... Header Content (Same as previous, omitted for brevity but fully intact in logic) ... */}
                  <div onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className="p-6 cursor-pointer flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A24D] font-mono text-xs">
                        {order.orderNumber?.slice(-2) || '!!'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">#{order.orderNumber}</p>
                            <span className="text-[8px] bg-[#C9A24D]/10 px-2 py-0.5 rounded text-[#C9A24D] uppercase font-bold border border-[#C9A24D]/20">{branchName}</span>
                        </div>
                        <p className="text-lg font-serif text-white uppercase tracking-tight">{order.customerName || "Premium Client"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 ml-auto">
                      <PaymentStatusBadge orderId={order.id} />
                      <div className="text-right">
                        <p className="text-lg font-serif text-white italic">KES {parseFloat(order.totalAmount).toLocaleString()}</p>
                        <p className="text-[8px] text-white/20 uppercase font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-[#C9A24D]" /> : <ChevronDown size={18} className="text-white/20" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-8 border-t border-white/5 bg-black/40 animate-in slide-in-from-top-2">
                       {/* ... Expanded Details Content (Same as previous, fully intact) ... */}
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                         <div className="space-y-6">
                            <h4 className="text-[10px] text-[#C9A24D] uppercase tracking-[0.4em] font-black border-b border-white/10 pb-2">Logistics Center</h4>
                            <div className="space-y-4">
                                <div className="flex gap-3"><Building2 size={16} className="text-white/20 mt-1"/><div><p className="text-[10px] text-white/30 uppercase font-black">Dispatched From</p><p className="text-xs font-bold text-white uppercase">{branchName}</p></div></div>
                                <div className="flex gap-3"><User size={16} className="text-white/20 mt-1"/><div><p className="text-[10px] text-white/30 uppercase font-black">Customer</p><p className="text-xs text-white/80">{order.customerPhone}</p></div></div>
                                <div className="flex gap-3"><MapPin size={16} className="text-white/20 mt-1"/><div><p className="text-[10px] text-white/30 uppercase font-black">Delivery</p><p className="text-xs text-white/60">{order.shippingAddress}</p></div></div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <h4 className="text-[10px] text-[#C9A24D] uppercase tracking-[0.4em] font-black border-b border-white/10 pb-2">Manifest</h4>
                            <div className="space-y-3">
                                {order.items?.map((item: any, i: number) => (
                                    <div key={i} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex justify-between">
                                        <div className="text-xs font-serif text-white uppercase tracking-tight"><ProductName productId={item.productId} /></div>
                                        <span className="text-xs font-black text-[#C9A24D]">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                         </div>

                         <div className="space-y-6">
                            <h4 className="text-[10px] text-[#C9A24D] uppercase tracking-[0.4em] font-black border-b border-white/10 pb-2">Authority Control</h4>
                            <StatusControl order={order} updateStatus={updateStatus} />
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button onClick={() => handleCancelAction(order.id)} className="py-3 text-red-500/50 hover:text-red-500 text-[9px] font-black uppercase border border-red-500/10 rounded-lg tracking-[0.1em] transition-all">Revoke</button>
                                <button onClick={() => handleDeleteAction(order.id)} className="flex items-center justify-center gap-2 py-3 bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white text-[9px] font-black uppercase border border-red-500/20 rounded-lg transition-all group">
                                    <Trash2 size={12}/> Delete
                                </button>
                            </div>
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* --- PAGINATION --- */}
        <div className="flex justify-center items-center gap-8 mt-12 pb-10">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-[#0A0A0A] border border-white/10 rounded-full hover:border-[#C9A24D] disabled:opacity-20 transition-all"><ChevronLeft size={18}/></button>
          <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Registry Page <span className="text-[#C9A24D] font-mono">{currentPage}</span> / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-[#0A0A0A] border border-white/10 rounded-full hover:border-[#C9A24D] disabled:opacity-20 transition-all"><ChevronRight size={18}/></button>
        </div>
      </div>
    </div>
  );
};

// --- STATUS PROTECTION ---
const StatusControl = ({ order, updateStatus }: any) => {
    const { data: payments } = useGetPaymentsByOrderIdQuery(order.id);
    const isPaymentConfirmed = payments?.some(p => p.status === "success");

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <select 
                    disabled={!isPaymentConfirmed}
                    value={order.status}
                    onChange={(e) => updateStatus({ id: order.id, status: e.target.value })}
                    className={`bg-white/5 border border-white/10 p-3 text-[10px] text-white uppercase font-black rounded-lg outline-none ${!isPaymentConfirmed ? 'opacity-20 cursor-not-allowed' : 'hover:border-[#C9A24D] cursor-pointer'}`}
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <div className="bg-white/5 border border-white/10 flex flex-col items-center justify-center rounded-lg">
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isPaymentConfirmed ? 'text-green-500' : 'text-amber-500'}`}>{isPaymentConfirmed ? 'Verified' : 'Unpaid'}</span>
                  <span className="text-[7px] text-white/20 uppercase font-bold">Ledger</span>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminOrderManager;