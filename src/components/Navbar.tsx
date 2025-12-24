import React, { useState, useRef, useEffect, useMemo } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { 
  LogOut, User, ChevronDown, ShoppingBag, 
  LayoutDashboard, X, Home, Sparkles, 
  Palette, Gem, MapPin, Pipette 
} from "lucide-react";
import type { RootState } from "../App/store";
import { clearCredentials } from "../features/Auth/Auth.slice";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, role } = useSelector((state: RootState) => state.auth);

  // Handle scroll effect for transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault(); 
      setMenuOpen(false);
      toast.dismiss();
      toast("Kindly sign in to view cart", {
        id: "auth-requirement-toast",
        icon: '🔒',
        duration: 3000,
        style: {
          borderRadius: '0px',
          background: '#1a1a1a',
          color: '#C9A24D',
          fontSize: '10px',
          fontWeight: 'bold',
          letterSpacing: '0.2em',
          border: '1px solid #C9A24D'
        },
      });
      navigate("/login");
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    setMenuOpen(false);
    toast.dismiss();
    toast.success("Signed out successfully", {
      id: "logout-toast",
      icon: '✨',
      duration: 3000,
      style: {
        borderRadius: '0px',
        background: '#1a1a1a',
        color: '#C9A24D',
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '0.2em',
        border: '1px solid #C9A24D'
      },
    });
    navigate("/login");
  };

  const dashboardConfig = useMemo(() => {
    if (role === "SUPER_ADMIN" || role === "BRANCH_MANAGER") {
      return { path: "/dashboard", label: "Admin Dashboard" };
    }
    return { path: "/customer-dashboard", label: "Customer Dashboard" };
  }, [role]);

  const activeStyle = ({ isActive }: { isActive: boolean }) => 
    `flex items-center transition-all duration-300 py-2 border-b-2 ${
      isActive 
      ? "text-[#C9A24D] border-[#C9A24D]" 
      : "text-gray-400 border-transparent hover:text-[#C9A24D]"
    }`;

  const activeMobileStyle = ({ isActive }: { isActive: boolean }) => 
    `flex items-center px-5 py-3 text-xs uppercase tracking-widest transition-colors ${
      isActive 
      ? "text-[#C9A24D] bg-white/5 font-bold" 
      : "text-gray-300 hover:bg-white/5"
    }`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${
      scrolled 
      ? "bg-[#0B0B0B]/90 backdrop-blur-md border-white/10 shadow-xl py-0" 
      : "bg-[#141414] border-transparent py-1"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LOGO SECTION */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 mr-3 overflow-hidden rounded-full border border-[#C9A24D]/30 bg-black">
              <img 
                src="https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=100&h=100" 
                alt="Anma" 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[#C9A24D] font-serif font-bold text-xl sm:text-2xl tracking-tighter leading-none">Anma</span>
              <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.4em] text-gray-500 mt-1 font-medium">Boutique</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex space-x-8 items-center text-[10px] uppercase tracking-[0.2em] font-bold">
            <NavLink to="/" end className={activeStyle}><Home size={13} className="mr-1.5" /> Home</NavLink>
            <NavLink to="/perfumes" className={activeStyle}><Sparkles size={13} className="mr-1.5" /> Perfumes</NavLink>
            <NavLink to="/cosmetics" className={activeStyle}><Palette size={13} className="mr-1.5" /> Cosmetics</NavLink>
            <NavLink to="/jewels" className={activeStyle}><Gem size={13} className="mr-1.5" /> Jewels</NavLink>
            <NavLink to="/branches" className={activeStyle}><MapPin size={13} className="mr-1.5" /> Branches</NavLink>
            <NavLink to="/custom-perfume" className={activeStyle}><Pipette size={13} className="mr-1.5" /> Custom Perfume</NavLink>
          </div>

          <div className="flex items-center space-x-4">
            {/* DESKTOP CART */}
            <NavLink 
              to="/cart" 
              onClick={handleCartClick}
              className={({ isActive }) => `hidden lg:block relative p-2 transition ${isActive && isAuthenticated ? 'text-[#C9A24D]' : 'text-gray-400 hover:text-white'}`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute top-1 right-1 bg-[#C9A24D] text-black text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full">0</span>
            </NavLink>

            {/* SHARED MENU */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-2 rounded-sm text-[#C9A24D] hover:bg-white/10 transition"
              >
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 rounded-full bg-[#C9A24D] flex items-center justify-center text-[10px] text-black font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:block">{user?.username}</span>
                  </div>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest font-bold">Account</span>
                )}
                {menuOpen ? <X size={14} /> : <ChevronDown size={14} />}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#111111] border border-white/10 shadow-2xl py-3 rounded-sm z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="lg:hidden flex flex-col border-b border-white/5 pb-2 mb-2">
                    <NavLink to="/cart" onClick={handleCartClick} className={activeMobileStyle}>
                      <ShoppingBag size={16} className="mr-3" /> Shopping Bag
                    </NavLink>
                    <NavLink to="/" end className={activeMobileStyle} onClick={() => setMenuOpen(false)}><Home size={16} className="mr-3" /> Home</NavLink>
                    <NavLink to="/perfumes" className={activeMobileStyle} onClick={() => setMenuOpen(false)}><Sparkles size={16} className="mr-3" /> Perfumes</NavLink>
                    <NavLink to="/cosmetics" className={activeMobileStyle} onClick={() => setMenuOpen(false)}><Palette size={16} className="mr-3" /> Cosmetics</NavLink>
                    <NavLink to="/jewels" className={activeMobileStyle} onClick={() => setMenuOpen(false)}><Gem size={16} className="mr-3" /> Jewels</NavLink>
                    <NavLink to="/branches" className={activeMobileStyle} onClick={() => setMenuOpen(false)}><MapPin size={16} className="mr-3" /> Branches</NavLink>
                    <NavLink to="/custom-perfume" className={activeMobileStyle} onClick={() => setMenuOpen(false)}><Pipette size={16} className="mr-3" /> Custom Perfume</NavLink>
                  </div>

                  <div className="px-5 py-2">
                    <p className="text-[8px] text-gray-500 uppercase tracking-[0.2em] mb-1">Status</p>
                    <p className="text-[11px] text-white font-medium truncate mb-3">{isAuthenticated ? user?.username : "Guest Member"}</p>
                    
                    {isAuthenticated ? (
                      <>
                        <NavLink to={dashboardConfig.path} className={activeMobileStyle} onClick={() => setMenuOpen(false)}>
                          <LayoutDashboard size={14} className="mr-3" /> {dashboardConfig.label}
                        </NavLink>
                        <button onClick={handleLogout} className="flex items-center w-full px-5 py-2 text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500/5 mt-2 transition-colors">
                          <LogOut size={14} className="mr-3" /> Sign Out
                        </button>
                      </>
                    ) : (
                      <NavLink to="/login" className={activeMobileStyle} onClick={() => setMenuOpen(false)}>
                        <User size={14} className="mr-3" /> Member Access
                      </NavLink>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;