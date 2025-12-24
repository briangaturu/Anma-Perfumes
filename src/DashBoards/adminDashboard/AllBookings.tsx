import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { bookingApi } from "../../features/APIS/BookingsApi";
import { eventApi } from "../../features/APIS/EventsApi";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft, FaX } from "react-icons/fa6";
import { useSelector } from "react-redux";
import type { RootState } from "../../App/store";

const MySwal = withReactContent(Swal);

interface Booking {
  bookingId: number;
  nationalId: number;
  eventId: number;
  quantity: number;
  totalAmount: string;
  bookingStatus: "Pending" | "Confirmed" | "Cancelled";
  ticketTypeId: number;
  createdAt: string;
  updatedAt: string;
}

const bookingStatusEnum = ["Pending", "Confirmed", "Cancelled"] as const;
type BookingStatus = (typeof bookingStatusEnum)[number];

export const AllBookings: React.FC = () => {
  const { data: bookings = [], isLoading, error } = bookingApi.useGetAllBookingsQuery(undefined, {
    pollingInterval: 30000,
  });

  const { data: events = [] } = eventApi.useGetAllEventsQuery(undefined);
  const [updateStatus] = bookingApi.useUpdateBookingStatusMutation();
  const [cancelBooking] = bookingApi.useCancelBookingMutation();
  const [deleteBooking] = bookingApi.useDeleteBookingMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const eventMap = new Map<number, string>(events.map((e: any) => [e.eventId, e.title]));

  const firstName = useSelector((state:RootState)=>state.auth.user?.firstName)

  const filteredBookings = bookings.filter((b: Booking) => {
    const eventTitle = eventMap.get(b.eventId) ?? "";
    return (
      (!searchTerm ||
        b.bookingId.toString().includes(searchTerm) ||
        b.nationalId.toString().includes(searchTerm)) &&
      (!statusFilter || b.bookingStatus === statusFilter) &&
      (!eventFilter || eventTitle.toLowerCase().includes(eventFilter.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openStatusModal = async (booking: Booking) => {
    const { value: newStatus } = await MySwal.fire({
      title: `Update status for Booking #${booking.bookingId}`,
      input: "select",
      inputOptions: bookingStatusEnum.reduce((acc, status) => {
        acc[status] = status;
        return acc;
      }, {} as Record<string, string>),
      inputValue: booking.bookingStatus,
      showCancelButton: true,
      confirmButtonText: "Update",
      customClass: { popup: "glass-modal" },
    });

    if (newStatus && newStatus !== booking.bookingStatus) {
      try {
        await updateStatus({ bookingId: booking.bookingId, status: newStatus as BookingStatus }).unwrap();
        MySwal.fire("Success", "Booking status updated.", "success");
      } catch {
        MySwal.fire("Error", "Failed to update status.", "error");
      }
    }
  };

  const handleCancel = async (bookingId: number) => {
    const confirm = await MySwal.fire({
      title: "Cancel booking?",
      text: "This will mark the booking as Cancelled and refund tickets.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel it!",
    });

    if (confirm.isConfirmed) {
      try {
        await cancelBooking(bookingId).unwrap();
        MySwal.fire("Cancelled!", "Booking has been cancelled.", "success");
      } catch {
        MySwal.fire("Error", "Failed to cancel booking.", "error");
      }
    }
  };

  const handleDelete = async (bookingId: number) => {
    const confirm = await MySwal.fire({
      title: "Delete booking?",
      text: "This booking will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteBooking(bookingId).unwrap();
        MySwal.fire("Deleted!", "Booking has been removed.", "success");
      } catch {
        MySwal.fire("Error", "Failed to delete booking.", "error");
      }
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const colorMap: Record<BookingStatus, string> = {
      Pending: "bg-yellow-500",
      Confirmed: "bg-green-500",
      Cancelled: "bg-red-500",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded text-white ${colorMap[status]}`}>{status}</span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PuffLoader color="#14b8a6" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400">Error loading bookings.</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-base-100 text-base-content">
      <div className="mb-6 text-xl sm:text-2xl font-semibold text-primary">
        👋 Hey {firstName}, welcome!
      </div>
      <div className="w-full max-w-7xl mx-auto bg-base-200 border border-base-content/10 shadow-xl rounded-xl p-6 overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-primary">All Bookings</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Booking / National ID"
              className="px-4 py-2 w-full sm:w-48 rounded-md bg-base-300 text-base-content placeholder:text-base-content/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded bg-base-300 text-base-content"
            >
              <option value="">All Statuses</option>
              {bookingStatusEnum.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Filter by Event Name"
              className="px-4 py-2 w-full sm:w-48 rounded-md bg-base-300 text-base-content placeholder:text-base-content/50"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            />
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center text-base-content/70">No bookings match your filters.</div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-md border border-base-content/10 shadow-md">
              <table className="min-w-full text-sm text-base-content border border-base-content/20">
                <thead>
                  <tr className="bg-base-300 text-primary uppercase text-xs border-b border-base-content/10">
                    <th className="px-4 py-2 text-left">Booking ID</th>
                    <th className="px-4 py-2 text-left">National ID</th>
                    <th className="px-4 py-2 text-left">Event</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b: Booking) => (
                    <tr key={b.bookingId} className="border-b border-base-content/10 hover:bg-base-300">
                      <td className="px-4 py-2">{b.bookingId}</td>
                      <td className="px-4 py-2">{b.nationalId}</td>
                      <td className="px-4 py-2">{eventMap.get(b.eventId) ?? "Unknown"}</td>
                      <td className="px-4 py-2">{b.quantity}</td>
                      <td className="px-4 py-2">${Number(b.totalAmount).toFixed(2)}</td>
                      <td className="px-4 py-2">{getStatusBadge(b.bookingStatus)}</td>
                      <td className="px-4 py-2">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => openStatusModal(b)}
                          className="text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-700"
                        ><FaEdit /></button>
                        <button
                          onClick={() => handleCancel(b.bookingId)}
                          className="text-xs px-2 py-1 bg-yellow-600 rounded hover:bg-yellow-700"
                        ><FaX /></button>
                        <button
                          onClick={() => handleDelete(b.bookingId)}
                          className="text-xs px-2 py-1 bg-red-600 rounded hover:bg-red-700"
                        ><FaDeleteLeft /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-base-300 hover:bg-base-200 rounded disabled:opacity-50"
                disabled={currentPage === 1}
              >
                ◀ Previous
              </button>
              <span className="text-base-content">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 bg-base-300 hover:bg-base-200 rounded disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next ▶
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
