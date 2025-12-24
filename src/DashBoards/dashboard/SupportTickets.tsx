import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, MessageSquare } from 'lucide-react';
import type { RootState } from '../../App/store';
import {
  useGetSupportTicketsByNationalIdQuery,
  useCreateSupportTicketMutation,
  useUpdateSupportTicketMutation,
  useDeleteSupportTicketMutation,
} from '../../features/APIS/supportTicketsApi';
import { adminResponseApi } from '../../features/APIS/AdminReponse';
import { PuffLoader } from 'react-spinners';

interface SupportTicket {
  ticketId: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  nationalId: number;
  createdAt?: string;
  updatedAt?: string;
}

const AdminResponses = ({ ticketId }: { ticketId: number }) => {
  const { data: responses = [], isLoading } = adminResponseApi.useGetResponsesByTicketQuery(ticketId);

  if (isLoading || responses.length === 0) return null;

  return (
    <div className="mt-4 bg-base-200 p-4 rounded-lg shadow-inner border border-base-300">
      <h4 className="text-base font-semibold text-base-content mb-3 flex items-center gap-2">
        <MessageSquare size={18} className="opacity-70" />
        Admin Responses
      </h4>
      <ul className="space-y-3">
        {responses.map((res) => (
          <li
            key={res.responseId}
            className="bg-base-300 p-3 rounded-md text-sm border border-base-300 hover:bg-base-100 transition"
          >
            <p className="text-base-content leading-relaxed">{res.message}</p>
            <p className="text-xs opacity-60 mt-2 italic">
              {new Date(res.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ticketVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 },
};

const UserSupportTickets = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);
  const { data: tickets = [], refetch, isLoading } = useGetSupportTicketsByNationalIdQuery(nationalId);
  const [createTicket, { isLoading: isSubmitting }] = useCreateSupportTicketMutation();
  const [updateTicket] = useUpdateSupportTicketMutation();
  const [deleteTicket] = useDeleteSupportTicketMutation();

  const [form, setForm] = useState({ subject: '', description: '', priority: 'Medium' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isEdit = editingId !== null;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const resetForm = () => {
    setForm({ subject: '', description: '', priority: 'Medium' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, nationalId, ...(isEdit && { ticketId: editingId }) };

    try {
      if (isEdit) {
        await updateTicket(payload).unwrap();
        toast.success('Ticket updated successfully!');
      } else {
        await createTicket(payload).unwrap();
        toast.success('Ticket created successfully!');
      }
      resetForm();
      refetch();
    } catch {
      toast.error('Failed to submit ticket');
    }
  };

  const handleEdit = (ticket: SupportTicket) => {
    setForm({ subject: ticket.subject, description: ticket.description, priority: ticket.priority });
    setEditingId(ticket.ticketId);
    setIsModalOpen(true);
  };

  const handleDelete = async (ticketId: number) => {
    const result = await Swal.fire({
      title: 'Delete this ticket?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#1f2937',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        await deleteTicket(ticketId).unwrap();
        toast.success('Ticket deleted successfully');
        refetch();
      } catch {
        toast.error('Failed to delete ticket');
      }
    }
  };

  const filteredTickets = tickets.filter((ticket: any) => {
    const status = ticket.status?.toLowerCase();
    const matchesFilter =
      filterStatus === 'All' ||
      (filterStatus === 'Pending' && status === 'open') ||
      (filterStatus === 'Completed' && ['resolved', 'closed'].includes(status));
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 mt-15">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-base-content underline">Support Tickets</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">+ New Ticket</button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tickets..."
          className="input input-bordered w-full md:max-w-xs"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="select select-bordered w-full md:max-w-xs"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as any);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Tickets</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <p className="flex justify-center items-center min-h-screen"><PuffLoader /></p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-base-content/60 text-center mt-8">No matching tickets found.</p>
      ) : (
        <>
          <ul className="space-y-6">
            <AnimatePresence>
              {paginatedTickets.map((ticket: SupportTicket) => {
                const lowerStatus = ticket.status?.toLowerCase();
                const canEdit = lowerStatus === 'open';
                const canDelete = ['open', 'closed', 'resolved'].includes(lowerStatus);
                return (
                  <motion.li
                    key={ticket.ticketId}
                    variants={ticketVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    transition={{ duration: 0.3 }}
                    className="bg-base-100 border border-base-300 rounded-lg shadow p-4 text-base-content"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                        <p className="mt-1">{ticket.description}</p>
                        <p className="text-sm mt-2 opacity-70">
                          <span className="font-medium">Priority:</span> {ticket.priority} |{' '}
                          <span className="font-medium">Status:</span> {ticket.status} |{' '}
                          <span className="font-bold">Created At:</span>{' '}
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}
                        </p>
                        <AdminResponses ticketId={ticket.ticketId} />
                      </div>
                      <div className="flex gap-2 pl-4">
                        <button
                          onClick={() => canEdit && handleEdit(ticket)}
                          className={`btn btn-circle btn-ghost ${
                            canEdit ? 'text-warning' : 'text-base-300 cursor-not-allowed'
                          }`}
                          disabled={!canEdit}
                          title={canEdit ? 'Edit Ticket' : 'Only open tickets can be edited'}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => canDelete && handleDelete(ticket.ticketId)}
                          className={`btn btn-circle btn-ghost ${
                            canDelete ? 'text-error' : 'text-base-300 cursor-not-allowed'
                          }`}
                          disabled={!canDelete}
                          title="Delete Ticket"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2 flex-wrap">
              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setCurrentPage(page)}
                    disabled={currentPage === page}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-base-100 text-base-content w-full max-w-xl p-6 rounded-xl shadow-xl relative border border-base-300"
            >
              <button onClick={resetForm} className="absolute top-3 right-4 text-base-content hover:text-error text-2xl font-bold">
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Ticket' : 'New Support Ticket'}</h2>
              <form onSubmit={handleSubmit}>
                <label className="block mb-1 text-sm font-medium">Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full mb-4"
                  placeholder="Enter subject"
                />
                <label className="block mb-1 text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="textarea textarea-bordered w-full mb-4"
                  placeholder="Describe your issue..."
                />
                <label className="block mb-1 text-sm font-medium">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="select select-bordered w-full mb-6"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isEdit ? 'Update' : 'Submit'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-ghost">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSupportTickets;
