import { NavLink } from "react-router-dom";
import {
  TrendingUp,
  Users,
  ClipboardList,
  User,
  LogOut,
  DollarSign,
  Ticket,
  Camera,
  Calendar,
  FileText,
  House,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../features/Auth/AuthSlice";

const navItems = [
  { name: "Analytics", path: "analytics", icon: <TrendingUp className="text-indigo-400" /> },
  { name: "Manage Users", path: "AllUsers", icon: <Users className="text-blue-400" /> },
  { name: "Manage Bookings", path: "AllBookings", icon: <ClipboardList className="text-pink-500" /> },
  { name: "Manage Venues", path: "Allvenues", icon: <House className="text-green-400" /> },
  { name: "Manage Medias", path: "AllMedia", icon: <Camera className="text-yellow-400" /> },
  { name: "Manage Events", path: "AllEvents", icon: <Calendar className="text-orange-400" /> },
  { name: "Manage Payments", path: "AllPayments", icon: <DollarSign className="text-yellow-900" /> },
  { name: "Manage Support Tickets", path: "supportTickets", icon: <Ticket className="text-purple-400" /> },
  { name: "Manage Ticket Types", path: "ticketTypes", icon: <FileText className="text-teal-400" /> },
  { name: "Sales Report", path: "SalesReports", icon: <User className="text-red-400" /> },
  { name: "My Profile", path: "adminprofile", icon: <User className="text-purple-400" /> },
  { name: "Logout", path: "#", icon: <LogOut className="text-red-500" /> },
];

export const AdminSideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearCredentials());
    onNavItemClick?.();
  };

  return (
    <aside className="h-full w-full p-4 bg-base-200 text-base-content space-y-2 overflow-y-auto rounded-lg shadow-md border border-blue-500 mt-17 border-r-2 border-b-4">
      <h4 className="mt-1 mb-4 flex items-center justify-center text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-yellow-500">
        <span className="mr-2">🛠️</span>
        Admin Panel
        <span className="ml-2">👑</span>
      </h4>

      {navItems.map((item, index) =>
        item.name === "Logout" ? (
          <button
            key={index}
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-base-300 transition w-full text-left"
            aria-label="Logout"
          >
            {item.icon}
            <span className="font-chewy">{item.name}</span>
          </button>
        ) : (
          <NavLink
            key={index}
            to={item.path}
            onClick={onNavItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition hover:bg-base-300 ${
                isActive ? "bg-base-300 font-semibold text-primary" : ""
              }`
            }
            aria-label={`Go to ${item.name}`}
          >
            {item.icon}
            <span className="font-chewy">{item.name}</span>
          </NavLink>
        )
      )}
    </aside>
  );
};
