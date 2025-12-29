import React, { useState, useMemo } from 'react';
import { 
  useGetAllPaymentsQuery, 
  useGetRevenueReportQuery, 
  useGetStuckTransactionsQuery, 
  useDeletePaymentMutation 
} from '../../features/Apis/Mpesa.Api';
import { 
  Search, RefreshCw, Trash2, 
  ShieldAlert, ChevronLeft, ChevronRight,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentAdmin = () => {
  const { data: payments, isLoading: loadingAll, refetch: refetchAll } = useGetAllPaymentsQuery();
  const { data: revenue } = useGetRevenueReportQuery();
  const { data: stuckData } = useGetStuckTransactionsQuery();
  const [deletePayment] = useDeletePaymentMutation();

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleDelete = async (id: string) => {
    if (window.confirm("Permanent Purge: Remove this transaction?")) {
      try {
        await deletePayment(id).unwrap();
        toast.success("Entry Erased");
      } catch (err) {
        toast.error("Action Failed");
      }
    }
  };

  // Logic: Filtering
  const filteredPayments = useMemo(() => {
    return payments?.filter(p => {
      const matchesSearch = 
        p.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phoneNumber?.includes(searchTerm) ||
        p.checkoutRequestId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }) || [];
  }, [payments, searchTerm, statusFilter]);

  // Logic: Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedData = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[#C9A24D] mb-2">
              <ShieldAlert size={14}/>
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure Ledger</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif italic uppercase tracking-tighter">Finance <span className="text-[#C9A24D] not-italic">Vault</span></h1>
          </div>
          <button onClick={() => refetchAll()} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-[#C9A24D] transition-all group">
            <RefreshCw size={18} className={loadingAll ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
          </button>
        </div>

        {/* --- KPIS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12">
          <div className="bg-[#0A0A0A] border border-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem]">
            <p className="text-[9px] uppercase font-black text-white/30 tracking-widest mb-2">Revenue</p>
            <h2 className="text-3xl md:text-5xl font-mono font-bold text-white italic">
              <span className="text-xs font-light mr-1 opacity-40">KES</span>
              {revenue?.totalRevenue?.toLocaleString()}
            </h2>
          </div>
          <div className="bg-[#0A0A0A] border border-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem]">
            <p className="text-[9px] uppercase font-black text-white/30 tracking-widest mb-2">Stuck Alerts</p>
            <h2 className="text-3xl md:text-5xl font-mono font-bold text-red-500 tracking-tighter">
              {stuckData?.count || 0}
            </h2>
          </div>
          <div className="hidden lg:block bg-[#0A0A0A] border border-white/5 p-10 rounded-[2.5rem]">
            <p className="text-[9px] uppercase font-black text-white/30 tracking-widest mb-2">Total Logs</p>
            <h2 className="text-5xl font-mono font-bold text-[#C9A24D] tracking-tighter">
              {payments?.length || 0}
            </h2>
          </div>
        </div>

        {/* --- FILTERS & SEARCH --- */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C9A24D]" size={18} />
            <input 
                type="text" 
                placeholder="SEARCH REF, PHONE, OR ID..." 
                className="w-full bg-white/[0.02] border border-white/10 p-5 pl-16 rounded-2xl outline-none focus:border-[#C9A24D] text-[10px] font-black uppercase tracking-widest transition-all"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/10 p-2 rounded-2xl">
            <Filter size={14} className="ml-4 text-white/20" />
            <select 
              className="bg-transparent text-[10px] font-black uppercase tracking-widest p-3 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all" className="bg-[#0A0A0A]">All Status</option>
              <option value="success" className="bg-[#0A0A0A]">Success</option>
              <option value="failed" className="bg-[#0A0A0A]">Failed</option>
              <option value="pending" className="bg-[#0A0A0A]">Pending</option>
            </select>
          </div>
        </div>

        {/* --- DATA TABLE / MOBILE CARDS --- */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.03] text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                <tr>
                  <th className="px-10 py-6">Reference / Phone</th>
                  <th className="px-10 py-6">Valuation</th>
                  <th className="px-10 py-6">Status Detail</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedData.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-10 py-6">
                      <p className="text-[11px] text-[#C9A24D] font-mono font-black tracking-widest uppercase">
                        {payment.transactionReference || "---"}
                      </p>
                      <p className="text-[10px] text-white/40 mt-1 font-mono">{payment.phoneNumber || "System Req"}</p>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-mono font-bold text-white">
                        <span className="text-[10px] opacity-30 mr-1">KES</span>
                        {parseFloat(payment.amount).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest w-fit border ${
                          payment.status === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-500' :
                          payment.status === 'failed' ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
                        }`}>
                          {payment.status}
                        </span>
                        {payment.failureReason && <p className="text-[8px] text-white/20 italic truncate max-w-[150px]">{payment.failureReason}</p>}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button onClick={() => handleDelete(payment.id)} className="p-3 text-white/20 hover:text-red-500 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View Card Layout */}
          <div className="md:hidden divide-y divide-white/5">
            {paginatedData.map((payment: any) => (
              <div key={payment.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-[#C9A24D] font-mono font-black tracking-widest">{payment.transactionReference || "NO REF"}</p>
                    <p className="text-[9px] text-white/40 mt-1">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                    payment.status === 'success' ? 'border-green-500/20 text-green-500' : 'border-red-500/20 text-red-500'
                  }`}>
                    {payment.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-mono font-bold">KES {parseFloat(payment.amount).toLocaleString()}</p>
                  <button onClick={() => handleDelete(payment.id)} className="p-2 text-white/20"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-12">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-4 rounded-xl bg-white/5 disabled:opacity-20 hover:bg-[#C9A24D] hover:text-black transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Page <span className="text-[#C9A24D]">{currentPage}</span> of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-4 rounded-xl bg-white/5 disabled:opacity-20 hover:bg-[#C9A24D] hover:text-black transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentAdmin;