import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { venueApi } from "../../features/APIS/VenueApi";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { useSelector } from "react-redux";
import type { RootState } from "../../App/store";

const MySwal = withReactContent(Swal);

interface VenueData {
  venueId: number;
  name: string;
  address: string;
  capacity: number;
  status: "available" | "booked";
  createdAt: string;
}

export const AllVenues = () => {
  const {
    data: allVenues = [],
    isLoading,
    error,
    refetch,
  } = venueApi.useGetAllVenuesQuery(undefined, {
    pollingInterval: 60_000,
    refetchOnMountOrArgChange: true,
  });

  const [createVenue] = venueApi.useCreateVenueMutation();
  const [updateVenue] = venueApi.useUpdateVenueMutation();
  const [deleteVenue] = venueApi.useDeleteVenueMutation();
  const firstName = useSelector((state:RootState)=>state.auth.user?.firstName)

  const [searchTerm, setSearchTerm] = useState("");

  const filteredVenues = allVenues.filter((v: VenueData) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toBackendPayload = (data: Partial<VenueData>) => {
    const { status, ...rest } = data;
    return { ...rest, status };
  };

  const openVenueModal = async (initial?: VenueData) => {
    const { value } = await MySwal.fire({
      title: initial ? "Edit Venue" : "Add New Venue",
      html: `
        <input id="venue-name" class="swal2-input" placeholder="Venue Name" value="${initial?.name ?? ""}" />
        <input id="venue-address" class="swal2-input" placeholder="Address" value="${initial?.address ?? ""}" />
        <input id="venue-capacity" class="swal2-input" type="number" placeholder="Capacity" value="${initial?.capacity ?? ""}" />
        <select id="venue-status" class="swal2-input">
          <option value="available" ${initial?.status === "available" ? "selected" : ""}>✅ Available</option>
          <option value="booked" ${initial?.status === "booked" ? "selected" : ""}>📌 Booked</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: initial ? "Update" : "Create",
      width: "600px",
      customClass: { popup: "glass-modal" },
      preConfirm: () => {
        const name = (document.getElementById("venue-name") as HTMLInputElement).value.trim();
        const address = (document.getElementById("venue-address") as HTMLInputElement).value.trim();
        const capacity = Number((document.getElementById("venue-capacity") as HTMLInputElement).value);
        const status = ((document.getElementById("venue-status") as HTMLSelectElement).value || "available") as "available" | "booked";

        if (!name || !address || !capacity) {
          Swal.showValidationMessage("All fields are required.");
          return;
        }

        const payload: Partial<VenueData> = { name, address, capacity, status };
        if (initial) payload.venueId = initial.venueId;
        return payload;
      },
    });

    if (!value) return;

    try {
      if (value.venueId) {
        await updateVenue(toBackendPayload(value)).unwrap();
        MySwal.fire("Updated!", "Venue updated successfully.", "success");
      } else {
        await createVenue(toBackendPayload(value)).unwrap();
        MySwal.fire("Created!", "Venue created successfully.", "success");
      }
      refetch();
    } catch (err: any) {
      MySwal.fire("Error", err?.data?.message || "Failed to save venue.", "error");
    }
  };

  const handleStatusChange = async (venue: VenueData, newStatus: "available" | "booked") => {
    if (venue.status === newStatus) return;

    try {
      await updateVenue(toBackendPayload({ venueId: venue.venueId, status: newStatus })).unwrap();
      refetch();
    } catch (err: any) {
      MySwal.fire("Error", err?.data?.message || "Failed to update status.", "error");
    }
  };

  const handleDelete = async (venueId: number) => {
    const c = await MySwal.fire({
      title: "Are you sure?",
      text: "This venue will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "glass-modal" },
    });

    if (!c.isConfirmed) return;

    try {
      await deleteVenue(venueId).unwrap();
      MySwal.fire("Deleted!", "Venue has been removed.", "success");
      refetch();
    } catch (err: any) {
      MySwal.fire("Error!", err?.data?.message || "Failed to delete venue.", "error");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-base-100 text-base-content">
      <div className="mb-6 text-xl sm:text-2xl font-semibold text-primary">
        👋 Hey {firstName}, welcome!
      </div>
      <div className="w-full max-w-6xl mx-auto bg-base-200 rounded-xl border border-base-300 shadow-lg p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-primary">All Venues</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by venue name"
              className="input input-bordered w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => openVenueModal()} className="btn btn-success">
              ➕ Add Venue
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
        ) : filteredVenues.length === 0 ? (
          <div className="text-center text-info text-lg">No venues found.</div>
        ) : (
          <table className="table table-zebra text-sm">
            <thead>
              <tr className="text-primary-content bg-primary text-xs uppercase">
                <th>Name</th>
                <th>Address</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVenues.map((venue:VenueData) => (
                <tr key={venue.venueId}>
                  <td>{venue.name}</td>
                  <td>{venue.address}</td>
                  <td>{venue.capacity}</td>
                  <td>
                    <select
                      className={`select select-xs ${
                        venue.status === "available" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                      }`}
                      value={venue.status}
                      onChange={(e) => handleStatusChange(venue, e.target.value as "available" | "booked")}
                    >
                      <option value="available">✅ Available</option>
                      <option value="booked">📌 Booked</option>
                    </select>
                  </td>
                  <td>{new Date(venue.createdAt).toLocaleDateString()}</td>
                  <td className="space-x-2">
                    <button onClick={() => openVenueModal(venue)} className="btn btn-xs btn-info">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(venue.venueId)} className="btn btn-xs btn-error">
                      <FaDeleteLeft />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
