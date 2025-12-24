import React from "react";
import { Link } from "react-router-dom";

const CustomPerfumeCTA: React.FC = () => {
  return (
    <div className="relative bg-[#1A1A1A] rounded-lg overflow-hidden shadow-lg my-8">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1350&q=80"
        alt="Custom Perfume"
        className="w-full h-60 object-cover opacity-80"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-center px-8">
        <h2 className="text-3xl font-bold text-[#C9A24D] mb-2">
          Design Your Signature Scent
        </h2>
        <p className="text-white/90 mb-4 max-w-md">
          Create a perfume that reflects your unique personality. Select notes, blends, and intensity for a scent that’s truly yours.
        </p>
        <Link
          to="/perfumes/custom"
          className="inline-block bg-[#C9A24D] text-black font-semibold px-6 py-3 rounded-md hover:bg-[#E0B860] transition"
        >
          Design Now
        </Link>
      </div>
    </div>
  );
};

export default CustomPerfumeCTA;
