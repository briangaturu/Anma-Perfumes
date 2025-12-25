import { NavLink } from "react-router-dom";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  User,
  LogOut,
  Gem,
  Tag,
  Camera,
  Layers,
  BarChart3,
  Settings,
  Star,
  GoalIcon,
  DecimalsArrowLeftIcon,
  CameraIcon,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../../features/Auth/Auth.slice";
import { MdCategory } from "react-icons/md";

const navItems = [
  { name: "MAnage category", path: "Manage-categories", icon: <MdCategory size={18} /> },
   { name: "MAnage Products", path: "Manage-products", icon: <GoalIcon size={18} /> },
   { name: "Manage Flashdeals", path: "flash-deals", icon: <DecimalsArrowLeftIcon size={18} /> },
   { name: "Manage ProductMedias", path: "product-media", icon: <CameraIcon size={18} /> },
    { name: "Manage Banners", path: "Manage-banners", icon: <CameraIcon size={18} /> },
  { name: "Executive Summary", path: "analytics", icon: <TrendingUp size={18} /> },
  { name: "Client Management", path: "AllUsers", icon: <Users size={18} /> },
  { name: "Bespoke Orders", path: "AllBookings", icon: <ShoppingBag size={18} /> },
  { name: "Fragrance Inventory", path: "Allvenues", icon: <Gem size={18} /> }, // Matches "Manage Perfumes"
  { name: "Gallery Assets", path: "AllMedia", icon: <Camera size={18} /> },
  { name: "Private Deals", path: "AllEvents", icon: <Tag size={18} /> }, // Matches Flash Deals
  { name: "Financial Audits", path: "AllPayments", icon: <BarChart3 size={18} /> },
  { name: "Concierge Tickets", path: "supportTickets", icon: <Star size={18} /> },
  { name: "Collection Types", path: "ticketTypes", icon: <Layers size={18} /> }, // Subcategories/Types
  { name: "Sales Reports", path: "SalesReports", icon: <BarChart3 size={18} /> },
  { name: "Admin Profile", path: "adminprofile", icon: <User size={18} /> },
  { name: "Logout", path: "#", icon: <LogOut size={18} /> },
];

export const AdminSideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearCredentials());
    onNavItemClick?.();
  };

  return (
    <aside className="h-full w-full p-6 bg-[#0B0B0B] text-white space-y-2 overflow-y-auto border-r border-[#C9A24D]/20">
      {/* LUXURY LOGO AREA */}
      <div className="mb-10 text-center">
        <h4 className="text-sm font-black uppercase tracking-[0.4em] text-[#C9A24D]">
          Maison Admin
        </h4>
        <div className="h-[1px] w-12 bg-[#C9A24D] mx-auto mt-2 opacity-50"></div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item, index) =>
          item.name === "Logout" ? (
            <button
              key={index}
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-red-950/20 text-red-500 transition-all w-full text-left group"
              aria-label="Logout"
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-[11px] uppercase tracking-widest font-bold">{item.name}</span>
            </button>
          ) : (
            <NavLink
              key={index}
              to={item.path}
              onClick={onNavItemClick}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-md transition-all group ${
                  isActive 
                    ? "bg-[#C9A24D]/10 text-[#C9A24D] border-l-2 border-[#C9A24D]" 
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className={`transition-transform group-hover:scale-110 ${
                index % 2 === 0 ? "text-[#C9A24D]" : "text-[#A68943]"
              }`}>
                {item.icon}
              </span>
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium">
                {item.name}
              </span>
            </NavLink>
          )
        )}
      </nav>

      {/* FOOTER DECOR */}
      <div className="pt-10 opacity-20 text-center">
        <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A24D]">Royal Oud Edition</p>
      </div>
    </aside>
  );
};