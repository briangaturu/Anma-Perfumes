import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useLoginUserMutation } from "../../features/Apis/Auth.Api";
import { setCredentials } from "../../features/Auth/Auth.slice";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({ email: "", passwordHash: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Helper to clean up "double-stringified" data from the backend
   */
  const cleanData = (data: any) => {
    try {
      // If it's a string that starts with a quote or look like JSON, parse it
      if (typeof data === "string" && (data.startsWith("{") || data.startsWith("\""))) {
        return JSON.parse(data);
      }
      return data;
    } catch (e) {
      return data;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const loadingToast = toast.loading("VERIFYING CREDENTIALS...", {
      style: {
        borderRadius: '0px',
        background: '#1a1a1a',
        color: '#C9A24D',
        fontSize: '10px',
        letterSpacing: '0.2em',
        border: '1px solid #C9A24D20'
      },
    });

    try {
      const response = await loginUser(formData).unwrap();
      
      // 1. Clean the data to remove escaped quotes/extra stringification
      const user = cleanData(response.user);
      const token = cleanData(response.token);
      const role = cleanData(response.role);

      // 2. Dispatch the CLEAN objects to Redux
      dispatch(setCredentials({
        user,
        token,
        role: role || user?.role || "CUSTOMER"
      }));
      
      toast.success("WELCOME TO THE HOUSE", {
        id: loadingToast,
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

      setTimeout(() => navigate("/"), 1500);

    } catch (err: any) {
      let errorMessage = "ACCESS DENIED";
      if (err.data?.error) {
        errorMessage = Array.isArray(err.data.error) 
          ? err.data.error[0].message 
          : err.data.error;
      }

      toast.error(errorMessage.toUpperCase(), {
        id: loadingToast,
        style: {
          borderRadius: '0px',
          background: '#1a1a1a',
          color: '#ff4b4b',
          fontSize: '10px',
          letterSpacing: '0.2em',
          border: '1px solid #ff4b4b40'
        },
      });
    }
  };

  const luxuryImageUrl = "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=1200";

  return (
    <main className="bg-[#0B0B0B] h-screen w-full relative overflow-hidden font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="fixed top-0 left-0 w-full z-[100]">
        <Navbar />
      </div>

      <div className="flex h-full w-full pt-16 lg:pt-0">
        <div className="hidden lg:block lg:w-3/5 h-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-black z-0"></div>
          <img 
            src={luxuryImageUrl} 
            className="w-full h-full object-cover grayscale opacity-40 z-10 transition-transform duration-[20000ms] hover:scale-110"
            alt="Anma Aesthetic"
          />
          <div className="absolute inset-0 bg-black/40 z-20"></div>
        </div>

        <div className="w-full lg:w-2/5 h-full flex flex-col justify-center items-center p-6 md:p-12 bg-[#0B0B0B] border-l border-white/5 relative">
          <div className="w-full max-w-sm space-y-10 relative z-10">
            <header className="text-center lg:text-left">
              <h1 className="text-3xl font-serif font-bold text-[#C9A24D] mb-1 italic">Welcome Back</h1>
              <p className="text-gray-500 text-[8px] uppercase tracking-[0.3em]">Sign in to your private portal</p>
            </header>

            <form className="space-y-10" onSubmit={handleLogin}>
              <div className="relative group">
                <label className="text-[8px] uppercase font-bold text-gray-600 tracking-widest absolute -top-4 left-0 group-focus-within:text-[#C9A24D] transition-colors">
                  Member Email
                </label>
                <input 
                  name="email"
                  type="email" 
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white outline-none focus:border-[#C9A24D] transition-all"
                  placeholder="name@anmabeauty.com"
                />
              </div>

              <div className="relative group">
                <label className="text-[8px] uppercase font-bold text-gray-600 tracking-widest absolute -top-4 left-0 group-focus-within:text-[#C9A24D] transition-colors">
                  Security Key
                </label>
                <div className="relative flex items-center">
                  <input 
                    name="passwordHash"
                    type={showPassword ? "text" : "password"} 
                    required
                    value={formData.passwordHash}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white outline-none focus:border-[#C9A24D] transition-all tracking-[0.3em]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 text-gray-600 hover:text-[#C9A24D] transition-colors pb-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full bg-[#C9A24D] text-black font-black py-4 uppercase text-[9px] tracking-[0.4em] hover:bg-white transition-all duration-500 active:scale-95 disabled:opacity-70 flex justify-center items-center"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      <span>AUTHENTICATING...</span>
                    </div>
                  ) : (
                    "ENTER THE HOUSE"
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-6 border-t border-white/5">
               <button 
                type="button"
                onClick={() => navigate("/register")} 
                className="text-white font-bold uppercase text-[9px] tracking-[0.4em] border-b border-[#C9A24D]/30 hover:border-[#C9A24D] transition-all"
               >
                Create Membership
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;