import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  useGetAllTicketTypesQuery,
  useUpdateTicketTypeMutation,
  useDeleteTicketTypeMutation,
  useCreateTicketTypeMutation,
} from '../../features/APIS/ticketsType.Api';
import { eventApi } from '../../features/APIS/EventsApi';

import type { RootState } from '../../App/store';

export const TicketTypes = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  const { data: ticketTypes, error, isLoading, refetch } = useGetAllTicketTypesQuery({});
  const [deleteTicketType, { isLoading: isDeleting }] = useDeleteTicketTypeMutation();
  const [updateTicketType, { isLoading: isUpdating }] = useUpdateTicketTypeMutation();
  const [createTicketType, { isLoading: isCreating }] = useCreateTicketTypeMutation();

  const [eventNames, setEventNames] = useState<Record<number, string>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<any>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    eventId: '',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    eventId: '',
  });

  const [filterText, setFilterText] = useState('');
  const [filterEventId, setFilterEventId] = useState('');

  const { data: allEvents, isLoading: isEventsLoading } = eventApi.useGetAllEventsQuery({});

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    if (allEvents) {
      const eventsMap: Record<number, string> = {};
      allEvents.forEach((event: any) => {
        eventsMap[event.eventId] = event.title;
      });
      setEventNames(eventsMap);
    }
  }, [allEvents]);

  const handleDeleteTicketType = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteTicketType(id).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Ticket type deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error('Failed to delete ticket type:', err);
        Swal.fire('Error!', 'Failed to delete ticket type.', 'error');
      }
    }
  };

  const handleEditClick = (ticket: any) => {
    setCurrentTicket(ticket);
    setEditFormData({
      name: ticket.name,
      price: ticket.price,
      quantity: ticket.quantity,
      eventId: ticket.eventId.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket) return;

    const { name, price, quantity, eventId } = editFormData;
    if (!eventId || !name || !price || !quantity) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all fields before updating.',
      });
      return;
    }

    const payload = {
      id: currentTicket.ticketTypeId,
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      eventId: parseInt(eventId),
    };

    try {
      await updateTicketType(payload).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Ticket type updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      setIsEditModalOpen(false);
      setCurrentTicket(null);
    } catch (err) {
      console.error('Failed to update ticket type:', err);
      Swal.fire('Error!', 'Failed to update ticket type.', 'error');
    }
  };

  const handleCreateTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, price, quantity, eventId } = createFormData;

    if (!eventId || !name || !price || !quantity) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all fields before submitting.',
      });
      return;
    }

    const payload = {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      eventId: parseInt(eventId),
    };

    try {
      await createTicketType(payload).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Created!',
        text: 'New ticket type created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      setIsCreateModalOpen(false);
      setCreateFormData({ name: '', price: '', quantity: '', eventId: '' });
      refetch();
    } catch (err) {
      console.error('Failed to create ticket type:', err);
      Swal.fire('Error!', 'Failed to create ticket type.', 'error');
    }
  };

  return (
    <div className="min-h-screen text-white py-10 px-5 bg-gray-900">
      <div className="max-w-4xl mx-auto rounded-lg shadow-lg p-5 bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-orange-500">Ticket Types</h2>
          <button
            className="btn bg-green-600 text-white hover:bg-green-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + New Ticket Type
          </button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Search by ticket name..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="input input-bordered w-full md:w-1/2 bg-gray-700 text-white"
          />
          <select
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
            className="select select-bordered w-full md:w-1/3 bg-gray-700 text-white"
          >
            <option value="">All Events</option>
            {allEvents?.map((event: any) => (
              <option key={event.eventId} value={event.eventId}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {isLoading || isEventsLoading ? (
          <p className="text-gray-400">Loading ticket types...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load ticket types</p>
        ) : (
          <div className="space-y-4">
            {ticketTypes
              ?.filter((ticket: any) => {
                const matchesName = ticket.name.toLowerCase().includes(filterText.toLowerCase());
                const matchesEvent = filterEventId
                  ? ticket.eventId === parseInt(filterEventId)
                  : true;
                return matchesName && matchesEvent;
              })
              .map((ticket: any) => {
                const eventName = eventNames[ticket.eventId] || 'Unknown Event';

                return (
                  <div
                    key={ticket.ticketTypeId}
                    className="bg-white/5 backdrop-blur-xl border border-orange-400/20 p-4 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-orange-400"
                  >
                    <h4 className="text-xl font-bold text-orange-400">{ticket.name}</h4>
                    <p className="text-gray-300">Price: ${ticket.price}</p>
                    <p className="text-gray-300">Quantity Available: {ticket.quantity}</p>
                    <p className="text-gray-400 font-semibold italic">Event Name: {eventName}</p>

                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => handleEditClick(ticket)}
                        className="btn bg-orange-500 text-white hover:bg-orange-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTicketType(ticket.ticketTypeId)}
                        className="btn bg-red-500 text-white hover:bg-red-600"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <dialog id="edit_ticket_modal" className="modal modal-open">
          <div className="modal-box bg-gray-800 text-white">
            <h3 className="font-bold text-lg text-orange-400">Edit Ticket Type</h3>
            <form onSubmit={handleUpdateTicketType} className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">Event</span>
                </label>
                <select
                  className="select select-bordered w-full bg-gray-700 text-white"
                  value={editFormData.eventId}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, eventId: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select an Event
                  </option>
                  {allEvents?.map((event: any) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">Ticket Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-gray-700 text-white"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full bg-gray-700 text-white"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">Quantity</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full bg-gray-700 text-white"
                  value={editFormData.quantity}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-warning" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Ticket'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentTicket(null);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <dialog id="create_ticket_modal" className="modal modal-open">
          <div className="modal-box bg-gray-800 text-white">
            <h3 className="font-bold text-lg text-green-400">Create New Ticket Type</h3>
            <form onSubmit={handleCreateTicketType} className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">Event</span>
                </label>
                <select
                  className="select select-bordered w-full bg-gray-700 text-white"
                  value={createFormData.eventId}
                  onChange={(e) => setCreateFormData({ ...createFormData, eventId: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select an Event
                  </option>
                  {allEvents?.map((event: any) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">Ticket Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full bg-gray-700 text-white"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full bg-gray-700 text-white"
                  value={createFormData.price}
                  onChange={(e) => setCreateFormData({ ...createFormData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-400">Quantity</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full bg-gray-700 text-white"
                  value={createFormData.quantity}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-success" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Ticket'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default TicketTypes;
