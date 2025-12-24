import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetActiveBannersQuery } from "../features/Apis/BannerApi";

const AUTO_SLIDE_INTERVAL = 6000;

const HeroBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: banners, isLoading, isError } = useGetActiveBannersQuery("hero");

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [banners]);

  if (isLoading) {
    return (
      <div className="w-full h-[380px] bg-[#050505] flex items-center justify-center border border-[#C9A24D]/10">
        <div className="w-6 h-6 border-2 border-[#C9A24D]/10 border-t-[#C9A24D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !banners || banners.length === 0) return null;
  const current = banners[currentIndex];

  return (
    <div className="relative w-full h-[380px] md:h-[420px] overflow-hidden bg-black group shadow-2xl">
      {/* IMAGE LAYERS */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className={`w-full h-full object-cover transition-transform duration-[15000ms] ease-out ${index === currentIndex ? "scale-110" : "scale-100"
              }`}
          />

          {/* INTENSIFIED DARKENING OVERLAYS */}

          {/* 1. Main Black Backdrop (Global Darken) */}
          <div className="absolute inset-0 bg-black/40 z-100" />

          {/* 2. Deep Black Gradient (Left-to-Right) - Darkened from 40% to 70% */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />

          {/* 3. Bottom Shadow (Grounding the image) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

          {/* 4. Radial Vignette (Darkens the corners for a boutique look) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] z-10 opacity-70" />

          {/* 5. Subtle Gold Tint Filter */}
          <div className="absolute inset-0 bg-[#C9A24D]/5 mix-blend-overlay z-10" />
        </div>
      ))}

      {/* CONTENT BOX */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-20 max-w-4xl">
        <div className="space-y-4">
          <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-left duration-700">
            <div className="h-px w-8 bg-[#C9A24D]"></div>
            <span className="text-[9px] uppercase tracking-[0.5em] text-[#C9A24D] font-bold">
              Anma perfumes and Jewellery
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-serif italic font-bold text-white leading-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {current.title}
          </h2>

          <p className="text-gray-300 text-[10px] md:text-xs uppercase tracking-[0.3em] mb-8 max-w-sm leading-relaxed font-light opacity-90 animate-in fade-in duration-1000 delay-300">
            {current.subtitle}
          </p>

          <div className="pt-2 animate-in fade-in zoom-in-95 duration-1000 delay-500">
            <Link
              to={current.ctaLink || "/perfumes"}
              className="relative inline-block bg-[#C9A24D] text-black text-[9px] font-black uppercase tracking-[0.4em] px-10 py-4 hover:bg-white transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            >
              {current.ctaText || "Explore House"}
            </Link>
          </div>
        </div>
      </div>

      {/* INDICATORS */}
      <div className="absolute bottom-10 left-8 md:left-20 flex items-center gap-4 z-30">
        {banners.map((_, index) => (
          <button key={index} onClick={() => setCurrentIndex(index)} className="group py-2">
            <div className={`h-[2px] transition-all duration-700 ease-in-out ${index === currentIndex ? "w-12 bg-[#C9A24D]" : "w-6 bg-white/20 group-hover:bg-white/40"
              }`} />
          </button>
        ))}
      </div>

      {/* DECORATIVE FRAME */}
      <div className="absolute inset-4 border border-[#C9A24D]/20 pointer-events-none z-20"></div>
    </div>
  );
};

export default HeroBanner;