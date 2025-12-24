import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { eventApi } from "../../features/APIS/EventsApi";
import { venueApi } from "../../features/APIS/VenueApi";
import { ticketApi } from "../../features/APIS/ticketsType.Api";
import { bookingApi } from "../../features/APIS/BookingsApi";
import PuffLoader from "react-spinners/PuffLoader";

interface TicketBreakdown {
  ticketTypeName: string;
  quantity: number;
  revenue: number;
}

interface EventReport {
  eventId: number;
  eventName: string;
  venueName: string;
  ticketBreakdown: TicketBreakdown[];
  totalTickets: number;
  totalRevenue: number;
  hasBookings: boolean;
}

const pieColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const SalesReport: React.FC = () => {
  const { data: events, isLoading: loadingEvents, error: eventError } = eventApi.useGetAllEventsQuery({});
  const { data: venues, error: venueError } = venueApi.useGetAllVenuesQuery({});
  const [triggerBookings] = bookingApi.useLazyGetBookingsByEventIdQuery();
  const [triggerTicketTypes] = ticketApi.useLazyGetTicketTypesByEventIdQuery();

  const [reportData, setReportData] = useState<EventReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!events || !venues) return;
      setLoading(true);
      setAuthError(false);

      try {
        const eventReports: EventReport[] = [];

        for (const ev of events) {
          try {
            const venue = venues.find((v: any) => v.venueId === ev.venueId);
            const bookings = await triggerBookings(ev.eventId).unwrap();
            const ticketTypes = await triggerTicketTypes(ev.eventId).unwrap();

            const confirmed = (bookings as any[]).filter((b: any) => b.bookingStatus === "Confirmed");

            if (confirmed.length === 0) {
              eventReports.push({
                eventId: ev.eventId,
                eventName: ev?.name?.trim() || `Untitled Event #${ev.eventId}`,
                venueName: venue?.name || "Unknown Venue",
                ticketBreakdown: [],
                totalTickets: 0,
                totalRevenue: 0,
                hasBookings: false,
              });
              continue;
            }

            const breakdown: TicketBreakdown[] = (ticketTypes as any[]).map((tt: any) => {
              const matching = confirmed.filter((b: any) => b.ticketTypeId === tt.ticketTypeId);
              const quantity = matching.reduce((s: number, b: any) => s + b.quantity, 0);
              const revenue = quantity * parseFloat(tt.price);

              return {
                ticketTypeName: tt.name,
                quantity,
                revenue,
              };
            });

            const totalTickets = breakdown.reduce((s, d) => s + d.quantity, 0);
            const totalRevenue = breakdown.reduce((s, d) => s + d.revenue, 0);

            eventReports.push({
              eventId: ev.eventId,
              eventName: ev?.name?.trim() || `Untitled Event #${ev.eventId}`,
              venueName: venue?.name || "Unknown Venue",
              ticketBreakdown: breakdown,
              totalTickets,
              totalRevenue,
              hasBookings: true,
            });
          } catch (err: any) {
            if (err?.status === 401 || err?.originalStatus === 401) {
              setAuthError(true);
              break;
            }
            console.warn(`Skipping event ${ev.eventId} due to error:`, err);
          }
        }

        setReportData(eventReports);
      } catch (error: any) {
        if (error?.status === 401 || error?.originalStatus === 401) {
          setAuthError(true);
        } else {
          console.error("Unexpected error while fetching report:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [events, venues]);

  const exportEventPDF = (event: EventReport) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${event.eventName} — ${event.venueName}`, 14, 20);

    if (event.ticketBreakdown.length === 0) {
      doc.setFontSize(12);
      doc.text("No confirmed bookings.", 14, 30);
    } else {
      autoTable(doc, {
        head: [["Ticket Type", "Quantity", "Revenue"]],
        body: event.ticketBreakdown.map((t) => [
          t.ticketTypeName,
          t.quantity.toString(),
          `KES ${t.revenue.toFixed(2)}`,
        ]),
        startY: 30,
      });
    }

    doc.save(`${event.eventName.replace(/\s+/g, "_")}_Report.pdf`);
  };

  const grandTotalTickets = reportData.reduce((s: number, e: EventReport) => s + e.totalTickets, 0);
  const grandTotalRevenue = reportData.reduce((s: number, e: EventReport) => s + e.totalRevenue, 0);

  if (authError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        🔒 Session expired. Please <a href="/login" className="underline">log in</a> again.
      </div>
    );
  }

  if (loading || loadingEvents) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <PuffLoader color="#3B82F6" size={60} />
      </div>
    );
  }

  if (eventError || venueError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        ❌ Failed to load events or venues. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <h2 className="text-3xl font-bold">🎟️ Ticket Sales Report</h2>

      {reportData.map((ev: EventReport) => (
        <div
          key={ev.eventId}
          className="border border-blue-300 dark:border-blue-600 bg-gray-50 dark:bg-gray-800 shadow rounded-xl p-6 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold">📌 {ev.eventName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">📍 {ev.venueName}</p>
            </div>
            <button
              onClick={() => exportEventPDF(ev)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Download PDF
            </button>
          </div>

          {ev.hasBookings ? (
            <>
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                  <thead>
                    <tr className="bg-blue-100 dark:bg-blue-900 text-left">
                      <th className="p-2">Ticket Type</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ev.ticketBreakdown.map((t, i) => (
                      <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-2">{t.ticketTypeName}</td>
                        <td className="p-2">{t.quantity}</td>
                        <td className="p-2 text-green-600 dark:text-green-400">KES {t.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-6 mt-4 flex-col md:flex-row">
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ev.ticketBreakdown}
                        dataKey="quantity"
                        nameKey="ticketTypeName"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        {ev.ticketBreakdown.map((_, idx: number) => (
                          <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ev.ticketBreakdown}>
                      <XAxis dataKey="ticketTypeName" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="quantity">
                        {ev.ticketBreakdown.map((_, idx: number) => (
                          <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <p className="text-sm font-medium pt-2">
                🎫 Total: <span className="text-blue-600 dark:text-blue-400 font-bold">{ev.totalTickets}</span> tickets /
                <span className="text-green-600 dark:text-green-400 font-bold"> KES {ev.totalRevenue.toFixed(2)}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">❌ No confirmed bookings for this event.</p>
          )}
        </div>
      ))}

      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
        <div className="text-lg font-medium">
          🧾 Grand Total:{" "}
          <span className="text-blue-700 dark:text-blue-300 font-semibold">{grandTotalTickets} tickets</span> /
          <span className="text-green-700 dark:text-green-300 font-semibold"> KES {grandTotalRevenue.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
