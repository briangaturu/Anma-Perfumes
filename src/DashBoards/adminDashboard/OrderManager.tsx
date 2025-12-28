import React, { useState } from "react";
import Swal from 'sweetalert2';
import { 
  useGetAllOrdersQuery, 
  useUpdateOrderStatusMutation, 
  useUpdatePaymentStatusMutation,
  useCancelOrderMutation 
} from "../../features/Apis/Orders.Api"; 
import { 
  Loader2, ShieldCheck, AlertCircle, 
  ChevronDown, ChevronUp, Receipt,
  MapPin, Building2, Activity, User, Package
} from "lucide-react";

const SuperAdminOrderManager: React.FC = () => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [receiptInput, setReceiptInput] = useState("");

  const { data: ordersData, isLoading: isListLoading } = useGetAllOrdersQuery({ status: "" });
  const orders = ordersData?.data || ordersData || [];

  const [updateStatus] = useUpdateOrderStatusMutation();
  const [updatePayment] = useUpdatePaymentStatusMutation();
  const [cancelOrder] = useCancelOrderMutation();

  const handlePaymentSync = async (id: string) => {
    if (!receiptInput) return Swal.fire('Identity Required', 'Enter M-Pesa Code', 'warning');
    try {
      await updatePayment({ id, paymentStatus: 'success', mpesaReceiptNumber: receiptInput }).unwrap();
      setReceiptInput("");
      Swal.fire({ 
        title: 'Payment Verified', 
        icon: 'success', 
        background: '#0D0D0D', 
        color: '#C9A24D',
        confirmButtonColor: '#C9A24D'
      });
    } catch (err) {
      Swal.fire('Sync Failed', 'Unauthorized access or invalid code.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#D1D1D1] font-sans p-4 md:p-10 selection:bg-[#C9A24D]/30">
      
      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#C9A24D] mb-4">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Central Registry</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white italic tracking-tight">Order Chronicle</h1>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-sm">
            <Activity size={16} className="text-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Live Records: {orders?.length || 0}</span>
        </div>
      </header>

      {/* --- ORDER LIST --- */}
      <div className="max-w-7xl mx-auto space-y-4">
        {isListLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <Loader2 className="animate-spin text-[#C9A24D]" size={32} />
            <span className="text-xs uppercase tracking-[0.3em]">Syncing Ledger...</span>
          </div>
        ) : (
          orders.map((order: any) => {
            const isExpanded = expandedOrderId === order.id;
            
            // REAL BRANCH NAME DISCOVERY (Checks nested object first, then flat field)
            const branchName = order.branch?.name || order.branchName || order.branchId?.name || "Main Branch";
            
            // REAL CUSTOMER NAME DISCOVERY
            const customerName = order.customerName || order.user?.name || "Premium Client";

            return (
              <div 
                key={order.id} 
                className={`transition-all duration-500 border rounded-sm overflow-hidden ${isExpanded ? 'border-[#C9A24D]/40 bg-[#0A0A0A]' : 'border-white/5 bg-[#080808] hover:bg-white/[0.02]'}`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-6 md:p-8 cursor-pointer flex flex-wrap items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-white/30 uppercase font-mono tracking-tighter">ID</span>
                        <span className="text-xs font-mono text-white/60">{order.orderNumber || order.id?.slice(0,8)}</span>
                    </div>
                    <div>
                        <p className="text-[9px] text-[#C9A24D] uppercase font-black tracking-widest">Client</p>
                        <p className="text-lg font-serif text-white uppercase tracking-tight">{customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 ml-auto">
                    <div className="hidden lg:block">
                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Branch Origin</p>
                        <div className="flex items-center gap-2">
                             <Building2 size={12} className="text-[#C9A24D]" />
                             <span className="text-[10px] font-bold uppercase text-white">{branchName}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Amount</p>
                        <p className="text-xl font-serif text-white">KES {parseFloat(order.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className={`hidden sm:block px-3 py-1 rounded-full border text-[8px] font-black uppercase ${order.status === 'delivered' ? 'border-green-500/20 text-green-500' : 'border-amber-500/20 text-amber-500'}`}>
                        {order.status}
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-[#C9A24D]" /> : <ChevronDown size={18} className="text-white/20" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-10 md:px-10 md:pb-14 border-t border-white/5 pt-10 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        
                        {/* 1. LOGISTICS & IDENTITY */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] text-[#C9A24D] uppercase tracking-[0.4em] font-black border-b border-white/5 pb-2">Logistics</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User size={16} className="text-white/20" />
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase font-black">Customer</p>
                                        <p className="text-sm font-medium text-white">{customerName}</p>
                                        <p className="text-xs font-mono text-white/50">{order.customerPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-sm">
                                    <Building2 size={16} className="text-[#C9A24D] mt-1" />
                                    <div>
                                        <p className="text-[10px] text-white/40 uppercase font-black">Fulfillment Branch</p>
                                        <p className="text-sm font-bold text-white uppercase">{branchName}</p>
                                        <p className="text-[9px] font-mono text-white/20 break-all">UUID: {order.branchId?.id || order.branchId}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-white/20 mt-1" />
                                    <div>
                                        <p className="text-xs text-white/40 uppercase font-black mb-1">Shipping to</p>
                                        <p className="text-sm font-medium text-white">{order.shippingArea}</p>
                                        <p className="text-xs text-white/50 italic leading-relaxed">{order.shippingAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. ITEM MANIFEST */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] text-[#C9A24D] uppercase tracking-[0.4em] font-black border-b border-white/5 pb-2">Manifest</h4>
                            <div className="space-y-3">
                                {order.items?.map((item: any, idx: number) => {
                                  // REAL PRODUCT NAME DISCOVERY
                                  const prodName = item.product?.name || item.productName || item.name || "Ref: #" + item.productId?.slice(-4);
                                  return (
                                    <div key={idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-10 bg-black border border-white/10 flex items-center justify-center text-[10px] font-mono text-white/40">
                                                {item.quantity}
                                            </div>
                                            <div>
                                                <p className="text-sm font-serif text-white leading-tight mb-1">{prodName}</p>
                                                <p className="text-[9px] text-white/30 uppercase">Unit: KES {parseFloat(item.unitPrice).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-mono text-white/70">KES {parseFloat(item.totalPrice).toLocaleString()}</p>
                                    </div>
                                  );
                                })}
                            </div>
                        </div>

                        {/* 3. FINANCIALS & ACTIONS */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] text-[#C9A24D] uppercase tracking-[0.4em] font-black border-b border-white/5 pb-2">Authority</h4>
                            <div className="bg-[#0D0D0D] border border-white/5 p-5 space-y-3">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40">
                                    <span>Subtotal</span>
                                    <span>KES {parseFloat(order.subtotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] uppercase font-bold text-white/40">
                                    <span>Shipping</span>
                                    <span>KES {parseFloat(order.shippingFee).toLocaleString()}</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                                    <span className="text-[9px] text-[#C9A24D] uppercase font-black">Total</span>
                                    <span className="text-xl font-serif text-white">KES {parseFloat(order.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input 
                                        value={receiptInput}
                                        onChange={(e) => setReceiptInput(e.target.value.toUpperCase())}
                                        className="flex-1 bg-black border border-white/10 p-3 text-xs font-mono text-white outline-none focus:border-[#C9A24D]" 
                                        placeholder="M-PESA CODE" 
                                    />
                                    <button onClick={() => handlePaymentSync(order.id)} className="bg-[#C9A24D] text-black px-5 hover:bg-white transition-all">
                                        <Receipt size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => updateStatus({ id: order.id, status: e.target.value })}
                                        className="bg-white/5 border border-white/10 p-3 text-[10px] text-white uppercase font-black outline-none"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                    <div className="p-3 bg-white/5 border border-white/10 text-center flex items-center justify-center">
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${order.payment_status === 'success' ? 'text-green-500' : 'text-amber-500'}`}>
                                            {order.payment_status}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => cancelOrder(order.id)}
                                    className="w-full py-3 border border-red-900/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 text-[9px] font-black uppercase tracking-[0.4em] transition-all"
                                >
                                    Revoke Order
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@300;500&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
};

export default SuperAdminOrderManager;