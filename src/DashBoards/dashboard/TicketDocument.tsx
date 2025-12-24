import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TicketDocumentProps } from './types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4f46e5',
  },
  eventName: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  row: {
    marginBottom: 6,
  },
  label: {
    fontWeight: 700,
    color: '#374151',
  },
  value: {
    color: '#111827',
  },
  footer: {
    marginTop: 30,
    fontSize: 12,
    textAlign: 'center',
    color: 'gray',
  },
});

const TicketDocument: React.FC<TicketDocumentProps> = ({
  user,
  event,
  ticketType,
  booking,
  total,
  paymentStatus,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>🎫 TicketStream Events</Text>
      <Text style={styles.eventName}>Event: {event.title}</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Name: </Text>
            <Text style={styles.value}>{user.firstName} {user.lastName}</Text>
          </Text>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>National ID: </Text>
            <Text style={styles.value}>{user.nationalId}</Text>
          </Text>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Ticket Type: </Text>
            <Text style={styles.value}>{ticketType.name}</Text>
          </Text>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Quantity: </Text>
            <Text style={styles.value}>{booking.quantity}</Text>
          </Text>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Total: </Text>
            <Text style={styles.value}>${total.toFixed(2)}</Text>
          </Text>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Payment Status: </Text>
            <Text style={styles.value}>{paymentStatus}</Text>
          </Text>
        </View>

        <View style={styles.row}>
          <Text>
            <Text style={styles.label}>Booking Date: </Text>
            <Text style={styles.value}>
              {new Date(booking.createdAt).toLocaleString()}
            </Text>
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>
        ✅ Thank you for booking with TicketStream Events!
      </Text>
    </Page>
  </Document>
);

export default TicketDocument;
