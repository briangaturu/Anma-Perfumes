import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PuffLoader from 'react-spinners/PuffLoader';

import { bookingApi } from '../../features/APIS/BookingsApi';
import { userApi } from '../../features/APIS/UserApi';
import { emailApi } from '../../features/APIS/SendngEmails';
import { eventApi } from '../../features/APIS/EventsApi';
import { ticketApi } from '../../features/APIS/ticketsType.Api';

import TicketItem from './TicketsItem';
import type { RootState } from '../../App/store';

interface EnrichedBooking {
  bookingId: number;
  eventName: string;
  ticketType: {
    name: string;
    price: string;
  };
  quantity: number;
  paymentStatus: string;
  createdAt: string;
}

const TicketDisplay: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);

  const { data: bookings, isLoading: isBookingsLoading } =
    bookingApi.useGetBookingsByUserNationalIdQuery(nationalId!, { skip: !nationalId });

  const { data: user, isLoading: isUserLoading } =
    userApi.useGetUserByNationalIdQuery(nationalId!, { skip: !nationalId });

  const { data: events, isLoading: isEventsLoading } = eventApi.useGetAllEventsQuery({});
  const { data: ticketTypes, isLoading: isTicketTypesLoading } = ticketApi.useGetAllTicketTypesQuery({});

  const [sendTicketEmail, { isLoading: isEmailSending }] = emailApi.useSendTicketEmailMutation();

  const [searchEvent, setSearchEvent] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const TICKETS_PER_PAGE = 6;

  const isLoading =
    isBookingsLoading || isUserLoading || isEventsLoading || isTicketTypesLoading;

  const enrichedBookings: EnrichedBooking[] | undefined = bookings?.map((booking) => {
    const event = events?.find((e: any) => e.eventId === booking.eventId);
    const ticketType = ticketTypes?.find((t: any) => t.ticketTypeId === booking.ticketTypeId);

    return {
      bookingId: booking.bookingId,
      eventName: event?.title || 'Unknown Event',
      ticketType: {
        name: ticketType?.name || 'Unknown',
        price: ticketType?.price || '0',
      },
      quantity: booking.quantity,
      paymentStatus: booking.bookingStatus || 'Unknown',
      createdAt: booking.createdAt,
    };
  });

  const filteredBookings = enrichedBookings
    ?.filter((booking) => {
      const matchesEvent = booking.eventName
        .toLowerCase()
        .includes(searchEvent.toLowerCase());
      const matchesDate = searchDate
        ? new Date(booking.createdAt).toISOString().slice(0, 10) === searchDate
        : true;
      return matchesEvent && matchesDate;
    })
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const totalPages = Math.ceil((filteredBookings?.length || 0) / TICKETS_PER_PAGE);

  const paginatedBookings = filteredBookings?.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  const handleSendEmail = async () => {
    if (!filteredBookings || !user) return;

    try {
      await sendTicketEmail({ bookings: filteredBookings, user }).unwrap();
      alert('Ticket details sent to your email!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again later.');
    }
  };

  const clearFilters = () => {
    setSearchDate('');
    setSearchEvent('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <PuffLoader size={80} color="#4f46e5" />
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center text-base-content mt-10 text-lg">
        No bookings found for this user.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto mt-20 bg-base-100 text-base-content rounded-box shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <input
            type="text"
            placeholder="Search by Event Name"
            value={searchEvent}
            onChange={(e) => {
              setSearchEvent(e.target.value);
              setCurrentPage(1);
            }}
            className="input input-bordered w-full sm:max-w-xs"
          />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => {
              setSearchDate(e.target.value);
              setCurrentPage(1);
            }}
            className="input input-bordered w-full sm:max-w-xs"
          />
        </div>
        <button onClick={clearFilters} className="btn btn-outline btn-sm mt-2 md:mt-0">
          Clear Filters
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSendEmail}
          disabled={isEmailSending}
          className={`btn btn-primary ${isEmailSending ? 'btn-disabled loading' : ''}`}
        >
          {isEmailSending ? 'Sending...' : 'Email My Tickets'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedBookings?.length === 0 && (
          <p className="col-span-full text-center text-base-content">
            No tickets match your search.
          </p>
        )}
        {paginatedBookings?.map((booking) => (
          <TicketItem key={booking.bookingId} booking={booking} user={user!} />
        ))}
      </div>

      <div className="flex justify-center mt-8 gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="btn btn-sm"
        >
          Prev
        </button>

        <span className="text-sm text-base-content mt-1">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn btn-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TicketDisplay;
