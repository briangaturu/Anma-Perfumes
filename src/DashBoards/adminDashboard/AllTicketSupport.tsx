import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  useGetAllSupportTicketsQuery,
  useUpdateSupportTicketMutation,
} from "../../features/APIS/supportTicketsApi";
import {
  MessageCircle,
  Pencil,
  Save,
  X,
  CircleCheck,
  Loader2,
  ClipboardList,
  AlertCircle,
  MailCheck,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { adminResponseApi } from "../../features/APIS/AdminReponse";
import type { RootState } from "../../App/store";

interface Ticket {
  ticketId: number;
  subject: string;
  description: string;
  nationalId: number;
  status: string;
  priority: string;
}

const ticketVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 },
};

const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];
const priorityOptions = ["Low", "Medium", "High"];
const ITEMS_PER_PAGE = 6;

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High": return "bg-red-500";
    case "Medium": return "bg-yellow-500";
    case "Low": return "bg-green-500";
    default: return "bg-gray-400";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Open": return "bg-red-500";
    case "In Progress": return "bg-yellow-500";
    case "Resolved": return "bg-green-500";
    case "Closed": return "bg-gray-500";
    default: return "bg-gray-300";
  }
};

const AdminSupportTickets = () => {
  const { data: tickets = [], refetch, isLoading } = useGetAllSupportTicketsQuery({});
  const [updateTicketStatus] = useUpdateSupportTicketMutation();
  const [createAdminResponse] = adminResponseApi.useCreateAdminResponseMutation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("Open");
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const admin = useSelector((state: RootState) => state.auth.user);

  const {
    data: ticketResponses = [],
    refetch: refetchResponses,
    isFetching: isFetchingResponses,
  } = adminResponseApi.useGetResponsesByTicketQuery(
    expandedTicketId ?? -1,  // 🛠️ Fix for typing issue
    { skip: expandedTicketId === null }
  );

  const handleStatusChange = (ticketId: number, currentStatus: string) => {
    setEditingId(ticketId);
    setNewStatus(currentStatus);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateTicketStatus({ ticketId: editingId, status: newStatus }).unwrap();
      toast.success("Ticket status updated!");
      setEditingId(null);
      refetch();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const openModal = (ticketId: number) => {
    setActiveTicketId(ticketId);
    const modal = document.getElementById("response_modal") as HTMLDialogElement | null;
    modal?.showModal();
  };

  const handleSubmitResponse = async () => {
    if (!activeTicketId || !responseMessage || !admin?.nationalId) {
      toast.error("Missing required data.");
      return;
    }
    try {
      await createAdminResponse({
        ticketId: activeTicketId,
        nationalId: admin.nationalId,
        message: responseMessage,
      }).unwrap();
      setResponseMessage("");
      const modal = document.getElementById("response_modal") as HTMLDialogElement | null;
      modal?.close();
      await refetchResponses();
      Swal.fire({
        icon: "success",
        title: "Response Sent",
        text: "Your response has been submitted successfully.",
        confirmButtonColor: "#4ade80",
      });
    } catch {
      toast.error("Failed to send response.");
    }
  };

  const countByStatus = (status: string) =>
    tickets.filter((ticket: Ticket) => ticket.status === status).length;

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket: Ticket) => {
      const matchesText =
        ticket.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.nationalId.toString().includes(searchText);
      const matchesStatus = !filterStatus || ticket.status === filterStatus;
      const matchesPriority = !filterPriority || ticket.priority === filterPriority;
      return matchesText && matchesStatus && matchesPriority;
    });
  }, [tickets, searchText, filterStatus, filterPriority]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTickets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTickets, currentPage]);

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 p-6 bg-base-100 text-base-content transition-colors duration-300">
      <h1 className="text-4xl font-bold text-base-content mb-8">Admin - Support Tickets</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[{
          label: "Total",
          count: tickets.length,
          color: "from-indigo-500 to-purple-500",
          icon: <ClipboardList className="w-5 h-5 inline-block mr-2" />,
        }, {
          label: "Resolved",
          count: countByStatus("Resolved"),
          color: "from-green-500 to-emerald-500",
          icon: <CircleCheck className="w-5 h-5 inline-block mr-2" />,
        }, {
          label: "In Progress",
          count: countByStatus("In Progress"),
          color: "from-yellow-500 to-orange-500",
          icon: <Loader2 className="w-5 h-5 inline-block mr-2 animate-spin" />,
        }, {
          label: "Open",
          count: countByStatus("Open"),
          color: "from-rose-500 to-red-500",
          icon: <AlertCircle className="w-5 h-5 inline-block mr-2" />,
        }].map(({ label, count, color, icon }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className={`rounded-2xl shadow-lg text-white p-6 bg-gradient-to-br ${color} hover:scale-[1.03] transition-all duration-300`}
          >
            <div className="text-sm uppercase tracking-wide font-medium flex items-center">{icon}{label}</div>
            <div className="text-3xl font-bold mt-2">{count}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search by subject, description, or NID"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input input-bordered w-64"
          />
        </div>
        <select className="select select-bordered" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <select className="select select-bordered" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {priorityOptions.map(priority => <option key={priority} value={priority}>{priority}</option>)}
        </select>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mb-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Tickets List */}
      {isLoading ? (
        <p className="text-base-content/70">Loading tickets...</p>
      ) : paginatedTickets.length === 0 ? (
        <p className="text-base-content/70">No tickets found.</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          <AnimatePresence>
            {paginatedTickets.map((ticket: Ticket) => (
              <motion.div
                key={ticket.ticketId}
                variants={ticketVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                transition={{ duration: 0.3 }}
                className="w-full md:w-[48%] lg:w-[32%] bg-base-200 border border-base-300 text-base-content hover:shadow-xl transition-all duration-300 rounded-xl p-6"
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-xl font-semibold">{ticket.subject}</h3>
                    <p className="mt-1">{ticket.description}</p>
                    <div className="text-sm mt-3 space-y-1">
                      <div>
                        <span className="font-medium">Priority:</span>{" "}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        {editingId === ticket.ticketId ? (
                          <select
                            className="mt-1 select select-bordered"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedTicketId(expandedTicketId === ticket.ticketId ? null : ticket.ticketId)}
                      className="text-sm mt-2 underline flex items-center gap-1"
                    >
                      {expandedTicketId === ticket.ticketId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedTicketId === ticket.ticketId ? "Hide" : "Show"} Responses
                    </button>

                    {expandedTicketId === ticket.ticketId && (
                      <div className="mt-2 bg-base-300 p-2 rounded text-sm border border-base-200">
                        {isFetchingResponses ? (
                          <p>Loading responses...</p>
                        ) : ticketResponses.length > 0 ? (
                          ticketResponses.map((r) => (
                            <div key={r.responseId} className="border-b border-base-200 py-1">
                              <div className="font-medium">{r.message}</div>
                              <div className="text-xs opacity-70">{new Date(r.createdAt).toLocaleString()}</div>
                            </div>
                          ))
                        ) : (
                          <p>No responses yet.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {editingId === ticket.ticketId ? (
                      <>
                        <button onClick={handleUpdate} className="btn btn-success">
                          <Save size={16} /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn">
                          <X size={16} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStatusChange(ticket.ticketId, ticket.status)} className="btn btn-primary">
                          <Pencil size={16} /> Change Status
                        </button>
                        <button onClick={() => openModal(ticket.ticketId)} className="btn btn-accent">
                          <MessageCircle size={16} /> Respond
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Response Modal */}
      <dialog id="response_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Respond to Support Ticket</h3>
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Type your response here..."
            className="textarea textarea-bordered w-full h-32"
          ></textarea>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn" type="submit">
                <X size={16} /> Cancel
              </button>
              <button type="button" onClick={handleSubmitResponse} className="btn btn-primary">
                <MailCheck size={16} /> Send Response
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AdminSupportTickets;
