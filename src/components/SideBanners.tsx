import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetActiveBannersQuery } from "../features/Apis/BannerApi";

const SideBanners: React.FC = () => {
  const { data: banners, isLoading } = useGetActiveBannersQuery("side");
  const [startIndex, setStartIndex] = useState(0);

  // Auto-carousel: Slides to the next pair every 8 seconds
  useEffect(() => {
    if (!banners || banners.length <= 2) return;
    
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 2 >= banners.length ? 0 : prev + 2));
    }, 8000);

    return () => clearInterval(interval);
  }, [banners]);

  if (isLoading || !banners) {
    return (
      <div className="flex flex-col gap-5 h-[420px]">
        <div className="flex-1 bg-[#050505] animate-pulse border border-[#C9A24D]/10 rounded-sm" />
        <div className="flex-1 bg-[#050505] animate-pulse border border-[#C9A24D]/10 rounded-sm" />
      </div>
    );
  }

  // If there are no banners, don't render the section
  if (banners.length === 0) return null;

  // Get the current pair for the carousel
  const visibleBanners = banners.slice(startIndex, startIndex + 2);

  return (
    <div className="flex flex-col gap-5 h-[420px] relative">
      {visibleBanners.map((banner) => (
        <Link
          key={banner.id}
          // FIX: Added fallback "/" to satisfy TypeScript "To" type
          to={banner.ctaLink || "/"} 
          className="relative flex-1 overflow-hidden group shadow-2xl transition-all duration-700 ease-in-out animate-in fade-in slide-in-from-right-4"
        >
          {/* LUXURY OUTER BORDER */}
          <div className="absolute inset-0 border border-[#C9A24D]/20 z-30 pointer-events-none group-hover:border-[#C9A24D]/40 transition-colors duration-500" />

          {/* BACKGROUND IMAGE */}
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />

          {/* INTENSIFIED DARKENING LAYERS */}
          {/* 1. Global Darken */}
          <div className="absolute inset-0 bg-black/60 z-10" />
          
          {/* 2. Text Readability Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />
          
          {/* 3. Gold Luxury Tint */}
          <div className="absolute inset-0 bg-[#C9A24D]/5 mix-blend-overlay z-10" />

          {/* INNER BOUTIQUE FRAME (Appears on Hover) */}
          <div className="absolute inset-3 border border-[#C9A24D]/0 group-hover:border-[#C9A24D]/20 z-30 transition-all duration-700 pointer-events-none" />

          {/* CONTENT AREA */}
          <div className="relative z-20 h-full flex flex-col justify-center px-8">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-4 h-[1px] bg-[#C9A24D]"></div>
               <span className="text-[8px] uppercase tracking-[0.4em] text-[#C9A24D] font-bold">
                 Exclusive Offer
               </span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-serif italic font-bold text-white leading-tight mb-1 group-hover:translate-x-1 transition-transform duration-500">
              {banner.title}
            </h3>
            
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-4 opacity-80">
              {banner.subtitle}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] border-b border-[#C9A24D] pb-1 group-hover:text-[#C9A24D] transition-colors">
                {banner.ctaText || "Shop Now"} →
              </span>
            </div>
          </div>
        </Link>
      ))}

      {/* CAROUSEL INDICATORS (Vertical dots on the right) */}
      {banners.length > 2 && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
          {Array.from({ length: Math.ceil(banners.length / 2) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStartIndex(i * 2)}
              className={`w-[2px] transition-all duration-500 ${
                i === startIndex / 2 ? "h-8 bg-[#C9A24D]" : "h-4 bg-white/10 hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SideBanners;