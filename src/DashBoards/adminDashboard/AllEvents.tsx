import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { eventApi } from "../../features/APIS/EventsApi";
import { venueApi } from "../../features/APIS/VenueApi";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { useSelector } from "react-redux";
import type { RootState } from "../../App/store";

const MySwal = withReactContent(Swal);

// ✅ Add enum values
const eventStatusEnum = ["upcoming", "in_progress", "ended", "cancelled"] as const;
type EventStatus = (typeof eventStatusEnum)[number];

interface VenueData {
  venueId: number;
  name: string;
  capacity: number;
}

interface EventData {
  eventId: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venueId: number;
  ticketPrice: number;
  ticketsTotal: number;
  createdAt: string;
  status: EventStatus;
  venue?: VenueData;
}

export const EventDetailsPage = () => {
  const { data: allEvents = [], isLoading, error, refetch } = eventApi.useGetAllEventsQuery({ pollingInterval: 30000 });
  const { data: allVenues = [] } = venueApi.useGetAllVenuesQuery({});
  const [createEvent] = eventApi.useCreateEventMutation();
  const [updateEvent] = eventApi.useUpdateEventMutation();
  const [deleteEvent] = eventApi.useDeleteEventMutation();
  const firstName = useSelector((state: RootState) => state.auth.user?.firstName);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories: string[] = Array.from(new Set(allEvents.map((e: EventData) => e.category)));

  const filteredEvents = allEvents
    .map((event: EventData) => {
      const now = new Date();
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      return {
        ...event,
        status: eventDateTime <= now && event.status !== "ended" && event.status !== "cancelled" ? "in_progress" : event.status,
      };
    })
    .filter((event: EventData) => {
      return (
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter ? event.category === categoryFilter : true) &&
        (dateFilter ? event.date === dateFilter : true)
      );
    });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const displayedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openEventModal = async (initialData?: EventData) => {
    const { value } = await MySwal.fire({
      title: initialData ? "Edit Event" : "Add New Event",
      html: `
        <input id="title" class="swal2-input" placeholder="Title" value="${initialData?.title ?? ""}">
        <input id="description" class="swal2-input" placeholder="Description" value="${initialData?.description ?? ""}">
        <input id="category" class="swal2-input" placeholder="Category" value="${initialData?.category ?? ""}">
        <input id="date" class="swal2-input" type="date" value="${initialData?.date ?? ""}">
        <input id="time" class="swal2-input" type="time" value="${initialData?.time ?? ""}">
        <input id="ticketPrice" class="swal2-input" type="number" placeholder="Ticket Price" value="${initialData?.ticketPrice ?? ""}">
        <input id="ticketsTotal" class="swal2-input" type="number" placeholder="Tickets Total" value="${initialData?.ticketsTotal ?? ""}">
        <select id="venueId" class="swal2-input">
          ${allVenues
            .map(
              (v: VenueData) =>
                `<option value="${v.venueId}" ${initialData?.venueId === v.venueId ? "selected" : ""}>${v.name}</option>`
            )
            .join("")}
        </select>
        <select id="status" class="swal2-input">
          ${eventStatusEnum
            .map(
              (status) =>
                `<option value="${status}" ${initialData?.status === status ? "selected" : ""}>${status.replace("_", " ")}</option>`
            )
            .join("")}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: initialData ? "Update" : "Create",
      width: "600px",
      customClass: { popup: "glass-modal" },
      preConfirm: () => {
        const title = (document.getElementById("title") as HTMLInputElement).value.trim();
        const description = (document.getElementById("description") as HTMLInputElement).value.trim();
        const category = (document.getElementById("category") as HTMLInputElement).value.trim();
        const date = (document.getElementById("date") as HTMLInputElement).value;
        const time = (document.getElementById("time") as HTMLInputElement).value;
        const ticketPrice = Number((document.getElementById("ticketPrice") as HTMLInputElement).value);
        const ticketsTotal = Number((document.getElementById("ticketsTotal") as HTMLInputElement).value);
        const venueId = Number((document.getElementById("venueId") as HTMLSelectElement).value);
        const status = (document.getElementById("status") as HTMLSelectElement).value as EventStatus;

        if (!title || !venueId || !date || !time || !ticketPrice || !ticketsTotal || !status) {
          Swal.showValidationMessage("⚠️ Essential fields are required");
          return;
        }

        return {
          eventId: initialData?.eventId,
          title,
          description,
          category,
          date,
          time,
          ticketPrice,
          ticketsTotal,
          venueId,
          status,
        };
      },
    });

    if (!value) return;

    try {
      if (value.eventId) {
        await updateEvent(value).unwrap();
        MySwal.fire("Updated!", "Event updated successfully.", "success");
      } else {
        await createEvent(value).unwrap();
        MySwal.fire("Created!", "Event created successfully.", "success");
      }
      refetch();
    } catch (err: any) {
      MySwal.fire("Error", err?.data?.message || "Failed to save event.", "error");
    }
  };

  const handleDelete = async (eventId: number) => {
    const confirm = await MySwal.fire({
      title: "Are you sure?",
      text: "This event will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "glass-modal" },
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteEvent(eventId).unwrap();
      MySwal.fire("Deleted!", "Event has been removed.", "success");
      refetch();
    } catch (err: any) {
      MySwal.fire("Error", err?.data?.message || "Failed to delete event.", "error");
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const colorMap: Record<EventStatus, string> = {
      upcoming: "bg-blue-500",
      in_progress: "bg-yellow-500",
      ended: "bg-gray-500",
      cancelled: "bg-red-500",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded text-white ${colorMap[status]}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-base-100 text-base-content">
      <div className="mb-6 text-xl sm:text-2xl font-semibold text-primary">
        👋 Hey {firstName}, welcome!
      </div>
      <div className="w-full max-w-6xl mx-auto bg-base-200 rounded-xl border border-base-300 shadow-lg p-6 overflow-x-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-primary">All Events</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by event title"
              className="input input-bordered w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select select-bordered w-full sm:w-64"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="input input-bordered w-full sm:w-64"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button onClick={() => openEventModal()} className="btn btn-success">
              ➕ Add Event
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-error text-center text-lg font-semibold">
            Something went wrong. Please try again.
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <PuffLoader color="#22d3ee" />
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center text-info text-lg">No events found.</div>
        ) : (
          <>
            <table className="table table-zebra text-sm">
              <thead>
                <tr className="text-primary-content bg-primary text-xs uppercase">
                  <th>Title</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedEvents.map((event: EventData) => (
                  <tr key={event.eventId}>
                    <td>{event.title}</td>
                    <td>{event.venue?.name}</td>
                    <td>{new Date(`${event.date}T${event.time}`).toLocaleDateString()}</td>
                    <td>{getStatusBadge(event.status)}</td>
                    <td>{new Date(event.createdAt).toLocaleDateString()}</td>
                    <td className="space-x-2">
                      <button onClick={() => openEventModal(event)} className="btn btn-xs btn-info">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(event.eventId)} className="btn btn-xs btn-error">
                        <FaDeleteLeft />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

           
            <div className="flex justify-center mt-6 gap-4 items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-base-300 hover:bg-base-200 rounded disabled:opacity-50"
                disabled={currentPage === 1}
              >
                ◀ Previous
              </button>
              <span className="text-base-content font-medium">
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

