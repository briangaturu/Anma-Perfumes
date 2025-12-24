// types.ts
export interface User {
  firstName: string;
  lastName: string;
  nationalId: number;
}

export interface Event {
  title: string;
}

export interface TicketType {
  name: string;
  price: string;
}

export interface Booking {
  bookingId: number;
  ticketTypeId: number;
  eventId: number;
  quantity: number;
  createdAt: string;
}

export interface TicketDocumentProps {
  user: User;
  event: Event;
  ticketType: TicketType;
  booking: Booking;
  total: number;
  paymentStatus: string;
}
