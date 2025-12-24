import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useSendTicketEmailMutation } from '../../features/APIS/SendngEmails';
import TicketDocument from './TicketDocument';
import type { User } from './types';

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

interface TicketItemProps {
  booking: EnrichedBooking;
  user: User;
}

const TicketItem: React.FC<TicketItemProps> = ({ booking, user }) => {
  const [sendTicketEmail, { isLoading: isSending }] = useSendTicketEmailMutation();
  const [emailSent, setEmailSent] = useState(false);

  const ticketPrice = parseFloat(booking.ticketType.price);
  const total = ticketPrice * booking.quantity;
  const paymentStatus = booking.paymentStatus;

  const handleSendThisTicket = async () => {
    try {
      await sendTicketEmail({
        bookings: [
          {
            bookingId: booking.bookingId.toString(),
            event: { title: booking.eventName },
            ticketType: booking.ticketType,
            quantity: booking.quantity,
            paymentStatus,
            createdAt: booking.createdAt,
          },
        ],
        user,
      }).unwrap();

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (err) {
      console.error('Failed to email ticket', err);
      alert('Failed to send ticket email.');
    }
  };

  return (
  <div className="card bg-base-100 text-base-content border-2 border-purple-500 shadow-md rounded-box p-6">
    <h2 className="text-2xl font-bold text-primary mb-3">🎟 {booking.eventName}</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>National ID:</strong> {user.nationalId}</p>
      <p><strong>Ticket Type:</strong> {booking.ticketType.name}</p>
      <p><strong>Quantity:</strong> {booking.quantity}</p>
      <p><strong>Price per ticket:</strong> ${ticketPrice.toFixed(2)}</p>
      <p><strong>Total:</strong> ${total.toFixed(2)}</p>
      <p><strong>Payment Status:</strong> {paymentStatus}</p>
      <p><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
    </div>

    <div className="mt-4 flex flex-wrap gap-3">
      <PDFDownloadLink
        document={
          <TicketDocument
            user={user}
            event={{ title: booking.eventName }}
            ticketType={booking.ticketType}
            booking={{
              bookingId: booking.bookingId,
              eventId: 0,
              ticketTypeId: 0,
              quantity: booking.quantity,
              createdAt: booking.createdAt,
            }}
            total={total}
            paymentStatus={paymentStatus}
          />
        }
        fileName={`ticket-${booking.bookingId}.pdf`}
      >
        {({ loading }) =>
          loading ? (
            <button className="btn btn-outline btn-disabled loading">Preparing ticket...</button>
          ) : (
            <button className="btn btn-primary">Download Ticket PDF</button>
          )
        }
      </PDFDownloadLink>

      <button
        onClick={handleSendThisTicket}
        disabled={isSending}
        className={`btn ${
          isSending
            ? 'btn-disabled loading'
            : emailSent
            ? 'btn-success'
            : 'btn-accent'
        }`}
      >
        {isSending ? 'Sending...' : emailSent ? 'Sent ✔️' : 'Email This Ticket'}
      </button>
    </div>
  </div>
);


};

export default TicketItem;
