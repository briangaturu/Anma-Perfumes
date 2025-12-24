import React from "react";
import { Link } from "react-router-dom";

const KENYAN_EVENTS = [
  { name: "Valentine's Day", month: 1, day: 14, length: 2, message: "🌹 The Art of Romance. Discover the Anma Signature Selection for your beloved." },
  { name: "Girlfriend's Day", month: 7, day: 1, length: 1, message: "✨ A Tribute to Her. Explore our most refined jewelry and essence pairings." },
  { name: "Boyfriend's Day", month: 9, day: 3, length: 1, message: "👔 The Modern Connoisseur. Refined scents for the man who appreciates the finer things." },
  { name: "Christmas Season", month: 11, day: 24, length: 3, message: "🎄 Season of Giving. Share the legacy of Anma with our limited-edition holiday archives." },
  { name: "Boxing Day", month: 11, day: 26, length: 1, message: "🎁 Pure Indulgence. A curated selection of scents to complete your festive season." },
  { name: "New Year", month: 0, day: 1, length: 2, message: "✨ A New Legacy. Begin 2026 with a scent that defines your future aspirations." },
  { name: "Madaraka Day", month: 5, day: 1, length: 1, message: "🇰🇪 Kenyan Heritage. Celebrating local brilliance and the spirit of self-determination." },
  { name: "Jamhuri Day", month: 11, day: 12, length: 1, message: "🇰🇪 National Pride. Anma honors the rich culture and history of our republic." },
];

const HolidayAlert: React.FC = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const activeEvent = KENYAN_EVENTS.find((event) => {
    return (
      currentMonth === event.month &&
      currentDate >= event.day &&
      currentDate < event.day + event.length
    );
  });

  // Default state focuses on service and experience rather than "free" items
  if (!activeEvent) {
    return (
      <div className="bg-[#141414] border border-[#C9A24D]/20 p-4 rounded-sm">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A24D] font-bold">
            Experience White-Glove Concierge Service in Westlands & Karen
          </p>
          <Link to="/branches" className="text-[8px] border border-[#C9A24D]/40 px-3 py-1 text-gray-400 uppercase tracking-widest hover:border-[#C9A24D] hover:text-[#C9A24D] transition-all">
            Visit Boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#C9A24D] p-5 rounded-sm shadow-xl">
      <div className="relative z-10 flex flex-col items-center gap-3">
        <p className="text-[11px] md:text-[13px] uppercase tracking-[0.2em] text-black font-black text-center max-w-2xl leading-relaxed">
          {activeEvent.message}
        </p>
        <Link 
          to="/perfumes" 
          className="text-[9px] bg-black text-white px-8 py-2 uppercase tracking-[0.4em] font-bold hover:bg-zinc-900 transition-colors shadow-2xl"
        >
          Explore Collection
        </Link>
      </div>
    </div>
  );
};

export default HolidayAlert;