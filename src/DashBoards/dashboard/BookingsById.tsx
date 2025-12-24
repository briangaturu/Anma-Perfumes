import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Toaster, toast } from "react-hot-toast";
import PuffLoader from "react-spinners/PuffLoader";

import {
  useGetBookingsByUserNationalIdQuery,
  useUpdateBookingMutation,
  useCancelBookingMutation,
} from "../../features/APIS/BookingsApi";

import { eventApi } from "../../features/APIS/EventsApi";
import { ticketApi } from "../../features/APIS/ticketsType.Api";
import { paymentApi } from "../../features/APIS/PaymentApi";

interface BookingData {
  bookingId: number;
  eventId: number;
  quantity: number;
  totalAmount: string;
  bookingStatus: "Pending" | "Confirmed" | "Cancelled";
  ticketTypeId: number;
  createdAt: string;
}

interface TicketTypeData {
  ticketTypeId: number;
  name: string;
  price: number;
}

interface EventData {
  eventId: number;
  title: string;
}

const BookingsByNationalId: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [searchNationalId, setSearchNationalId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  const {
    data: bookings,
    error,
    isLoading,
    isSuccess,
  } = useGetBookingsByUserNationalIdQuery(searchNationalId!, {
    skip: searchNationalId === null,
  });

  const { data: events } = eventApi.useGetAllEventsQuery({});
  const { data: ticketTypes } = ticketApi.useGetAllTicketTypesQuery({});
  const { data: payments } = paymentApi.useGetPaymentsByNationalIdQuery(user?.nationalId, {
    skip: !user?.nationalId,
  });

  const [updateBooking] = useUpdateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const [createCheckoutSession] = paymentApi.useCreateCheckoutSessionMutation();

  useEffect(() => {
    if (user?.nationalId) {
      setSearchNationalId(user.nationalId);
    }
  }, [user]);

  useEffect(() => {
    if (!bookings || !payments || !user?.nationalId) return;

    bookings.forEach((booking: BookingData) => {
      const completedPayment = payments.find(
        (payment: any) =>
          payment.bookingId === booking.bookingId &&
          payment.paymentStatus === "Completed"
      );

      if (completedPayment && booking.bookingStatus === "Pending") {
        updateBooking({
          bookingId: booking.bookingId,
          body: {
            bookingStatus: "Confirmed",
            quantity: booking.quantity,
            totalAmount: booking.totalAmount,
            ticketTypeId: booking.ticketTypeId,
            eventId: booking.eventId,
            nationalId: user.nationalId,
          },
        })
          .unwrap()
          .then(() => {
            toast.success(`✅ Booking #${booking.bookingId} auto-confirmed!`, {
              duration: 4000,
              style: {
                background: "#1f2937",
                color: "#a7f3d0",
              },
            });
          })
          .catch((err) => {
            console.error(`Failed to confirm booking #${booking.bookingId}`, err);
          });
      }
    });
  }, [bookings, payments, updateBooking, user?.nationalId]);

  const handleEditClick = async (booking: BookingData) => {
    if (!ticketTypes) {
      Swal.fire("Error", "Ticket types not loaded yet.", "error");
      return;
    }

    if (booking.bookingStatus !== "Pending") {
      Swal.fire("Not Editable", "Only pending bookings can be edited.", "warning");
      return;
    }

    const ticketOptions = ticketTypes
      .map(
        (ticket: TicketTypeData) =>
          `<option value="${ticket.ticketTypeId}" ${
            ticket.ticketTypeId === booking.ticketTypeId ? "selected" : ""
          }>${ticket.name}</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Edit Booking",
      html: `
        <input id="quantity" class="swal2-input" type="number" min="1" value="${booking.quantity}">
        <select id="ticketTypeId" class="swal2-input">${ticketOptions}</select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      preConfirm: () => {
        const quantity = Number((document.getElementById("quantity") as HTMLInputElement).value);
        const ticketTypeId = Number(
          (document.getElementById("ticketTypeId") as HTMLSelectElement).value
        );
        if (!quantity || quantity < 1) {
          Swal.showValidationMessage("Quantity must be at least 1");
          return;
        }
        return { quantity, ticketTypeId };
      },
    });

    if (!formValues) return;

    const newTicket = ticketTypes.find(
      (t: TicketTypeData) => t.ticketTypeId === formValues.ticketTypeId
    );
    const totalAmount = ((newTicket?.price || 0) * formValues.quantity).toFixed(2);

    try {
      await updateBooking({
        bookingId: booking.bookingId,
        body: {
          quantity: formValues.quantity,
          totalAmount,
          bookingStatus: booking.bookingStatus,
          ticketTypeId: formValues.ticketTypeId,
          eventId: booking.eventId,
          nationalId: user.nationalId,
        },
      }).unwrap();
      Swal.fire("Success", "Booking updated.", "success");
    } catch {
      Swal.fire("Error", "Update failed.", "error");
    }
  };

  const handleCancel = async (bookingId: number) => {
    const booking = bookings?.find((b: BookingData) => b.bookingId === bookingId);
    if (!booking || booking.bookingStatus !== "Pending") {
      Swal.fire("Not Allowed", "Only pending bookings can be cancelled.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Cancel booking?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await cancelBooking(bookingId).unwrap();
      Swal.fire("Cancelled", "Booking cancelled successfully.", "success");
    } catch {
      Swal.fire("Error", "Failed to cancel booking.", "error");
    }
  };

  const handlePayNow = async (booking: BookingData) => {
    if (!user?.nationalId) {
      Swal.fire("Error", "You must be logged in to pay.", "error");
      return;
    }

    const event = events?.find((e: EventData) => e.eventId === booking.eventId);
    const ticket = ticketTypes?.find((t: TicketTypeData) => t.ticketTypeId === booking.ticketTypeId);

    const confirm = await Swal.fire({
      title: "Confirm Payment",
      html: `
        <p><strong>Event:</strong> ${event?.title ?? "Unknown"}</p>
        <p><strong>Ticket:</strong> ${ticket?.name ?? "Unknown"}</p>
        <p><strong>Total:</strong> KSH ${Number(booking.totalAmount).toFixed(2)}</p>
        <p>You will be redirected to the secure payment page.</p>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Pay Now",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      const sessionPayload = {
        amount: Math.round(Number(booking.totalAmount) * 100),
        nationalId: Number(user.nationalId),
        bookingId: booking.bookingId,
        currency: "kes",
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
      };

      const session = await createCheckoutSession(sessionPayload).unwrap();

      if (session.url) {
        window.location.href = session.url;
      } else {
        Swal.fire("Error", "Failed to initiate payment.", "error");
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      Swal.fire("Error", "Payment failed to initiate.", "error");
    }
  };

  const renderError = () => {
    if (!error || !("status" in error)) return null;
    if (error.data && typeof error.data === "object" && "error" in error.data) {
      return (error.data as { error?: string }).error;
    }
    return "Error loading bookings.";
  };

  const sortedBookings = [...(bookings || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredBookings = sortedBookings.filter((booking: BookingData) => {
    const event = events?.find((e: EventData) => e.eventId === booking.eventId);
    return event?.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const indexOfLast = currentPage * bookingsPerPage;
  const indexOfFirst = indexOfLast - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  return (
    <div className="min-h-screen p-6 bg-base-100 mt-20">
      <Toaster />
      <div className="max-w-7xl mx-auto p-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 shadow-xl animate-fadeIn transition-all duration-700">
        <div className="rounded-xl bg-base-100 p-6">
          <h1 className="text-2xl font-semibold text-primary mb-4">
            Hey, {user?.firstName || "there"} 👋
          </h1>

          <h2 className="text-3xl font-bold text-secondary mb-4">Your Bookings</h2>

          <input
            type="text"
            placeholder="Search by event title..."
            className="input input-bordered w-full max-w-sm mb-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {isLoading && (
            <div className="flex justify-center items-center my-10 animate-fadeIn">
              <PuffLoader color="#a855f7" size={60} />
            </div>
          )}

          {renderError() && <p className="text-error">{renderError()}</p>}

          {isSuccess && currentBookings.length ? (
            <div className="overflow-x-auto rounded-lg my-4 animate-fadeIn transition-all duration-700">
              <table className="table table-zebra text-sm bg-base-100 rounded-lg">
                <thead className="text-xs uppercase bg-base-200 text-primary font-semibold">
                  <tr>
                    <th>Booking ID</th>
                    <th>Event</th>
                    <th>Ticket</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking: BookingData) => {
                    const event = events?.find((e: EventData) => e.eventId === booking.eventId);
                    const ticket = ticketTypes?.find(
                      (t: TicketTypeData) => t.ticketTypeId === booking.ticketTypeId
                    );
                    const price = Number(ticket?.price) || 0;

                    return (
                      <tr key={booking.bookingId} className="hover:bg-base-200">
                        <td>{booking.bookingId}</td>
                        <td>{event?.title ?? "Unknown"}</td>
                        <td>{ticket?.name ?? "Unknown"}</td>
                        <td>KSH {price.toFixed(2)}</td>
                        <td>{booking.quantity}</td>
                        <td>KSH {Number(booking.totalAmount).toFixed(2)}</td>
                        <td>{booking.bookingStatus}</td>
                        <td>{new Date(booking.createdAt).toLocaleString()}</td>
                        <td className="space-y-1 flex flex-col">
                          <button
                            onClick={() => handleEditClick(booking)}
                            disabled={booking.bookingStatus !== "Pending"}
                            className={`btn btn-xs ${
                              booking.bookingStatus !== "Pending"
                                ? "btn-disabled"
                                : "btn-warning"
                            }`}
                          >
                            Edit
                          </button>

                          {booking.bookingStatus === "Pending" && (
                            <>
                              <button
                                onClick={() => handleCancel(booking.bookingId)}
                                className="btn btn-xs btn-error"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handlePayNow(booking)}
                                className="btn btn-xs btn-primary"
                              >
                                Pay Now
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ✅ Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn btn-sm ${currentPage === i + 1 ? "btn-active" : ""}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isLoading && <p className="text-info">No bookings found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsByNationalId;
