import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSideNav } from "../dashboardDesign/AdminSidenav";
import { Menu, X } from "lucide-react";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050505] text-white relative font-sans">
      {/* Mobile Hamburger Menu */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-6 left-6 z-50 p-2 bg-[#111] text-[#C9A24D] rounded-full border border-[#C9A24D]/30 shadow-[0_0_15px_rgba(201,162,77,0.1)] hover:bg-[#1a1a1a] transition-all active:scale-95"
        aria-label="Open Sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block w-72 h-full fixed top-0 left-0 z-30 bg-[#0B0B0B] border-r border-[#C9A24D]/10 shadow-2xl">
        <AdminSideNav onNavItemClick={() => {}} />
      </aside>

      {/* Mobile Sidebar + Overlay */}
      {sidebarOpen && (
        <>
          {/* Elegant Dark overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-500"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Mobile Sidebar Slide-in */}
          <aside className="fixed top-0 left-0 z-50 w-72 h-full bg-[#0B0B0B] text-white border-r border-[#C9A24D]/20 shadow-[20px_0_50px_rgba(0,0,0,0.5)] md:hidden transform transition-transform duration-300 ease-out">
            {/* Close button for mobile accessibility */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-6 right-4 text-white/40 hover:text-[#C9A24D]"
            >
              <X size={20} />
            </button>
            <AdminSideNav onNavItemClick={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 md:ml-72 bg-[#050505] min-h-screen selection:bg-[#C9A24D]/30">
        <div className="max-w-7xl mx-auto">
          {/* Optional: Add a subtle gold glow to the top of the content */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#C9A24D]/5 to-transparent pointer-events-none opacity-50" />
          
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};