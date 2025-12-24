import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- TYPES ---
interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  specialty: string;
  image: string;
  mapLink: string;
}

// --- BRANCH DATA ---
const BRANCHES: Branch[] = [
  {
    id: "b1",
    name: "Westlands Flagship Store",
    location: "Nairobi",
    address: "Sarit Centre, 2nd Floor, Westlands",
    phone: "+254 712 345 678",
    email: "westlands@anmabeauty.com",
    hours: "Mon - Sat: 9:00 AM - 8:00 PM",
    specialty: "High Jewelry & Fragrance Lounge",
    image: "https://images.unsplash.com/photo-1541033319083-095568399587?auto=format&fit=crop&w=800&q=80",
    mapLink: "https://maps.google.com"
  },
  {
    id: "b2",
    name: "Nairobi Central Boutique",
    location: "Nairobi",
    address: "CBD - Kenyatta Avenue, Anma Plaza",
    phone: "+254 722 987 654",
    email: "cbd@anmabeauty.com",
    hours: "Mon - Fri: 8:00 AM - 7:00 PM",
    specialty: "Full Cosmetic Range & Skin Analysis",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    mapLink: "https://maps.google.com"
  },
  {
    id: "b3",
    name: "Mombasa Coastal Elite",
    location: "Mombasa",
    address: "Nyali Centre, Ground Floor, Links Rd",
    phone: "+254 733 111 222",
    email: "mombasa@anmabeauty.com",
    hours: "Daily: 10:00 AM - 9:00 PM",
    specialty: "Luxury Watches & Summer Scents",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    mapLink: "https://maps.google.com"
  }
];

const BranchesPage: React.FC = () => {
  return (
    <main className="bg-[#0B0B0B] min-h-screen text-white">
      <Navbar />

      {/* HEADER SECTION */}
      <section className="py-24 px-4 border-b border-[#C9A24D]/20 bg-[#141414]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-serif font-bold text-[#C9A24D] mb-6 tracking-tight">Our Boutiques</h1>
          <p className="text-gray-400 uppercase tracking-[0.5em] text-xs">Experience Luxury in Person</p>
        </div>
      </section>

      {/* BRANCH LIST SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 gap-16">
          {BRANCHES.map((branch, index) => (
            <div 
              key={branch.id} 
              className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Branch Image */}
              <div className="w-full lg:w-1/2 group overflow-hidden border border-[#C9A24D]/20">
                <img 
                  src={branch.image} 
                  alt={branch.name} 
                  className="w-full h-[450px] object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
              </div>

              {/* Branch Details */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div>
                  <span className="text-[#C9A24D] text-xs font-bold uppercase tracking-widest">{branch.location}</span>
                  <h2 className="text-3xl font-bold mt-2 mb-4 tracking-tighter">{branch.name}</h2>
                  <p className="text-[#C9A24D] italic text-sm border-l-2 border-[#C9A24D] pl-4">{branch.specialty}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-400">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Visit Us</h4>
                      <p>{branch.address}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Store Hours</h4>
                      <p>{branch.hours}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Direct Line</h4>
                      <p>{branch.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Email</h4>
                      <p>{branch.email}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <a 
                    href={branch.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-transparent border border-[#C9A24D] text-[#C9A24D] px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#C9A24D] hover:text-black transition-all"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING CALL TO ACTION */}
      <section className="bg-[#141414] py-20 px-4 border-y border-[#C9A24D]/20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-serif text-white">Private Appointments</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Schedule a private viewing or professional make-up session at any of our branches. Our specialists are here to provide a personalized experience tailored to your needs.
          </p>
          <button className="text-[#C9A24D] font-bold uppercase text-xs tracking-[0.3em] hover:underline">
            Book a Consultation →
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default BranchesPage;