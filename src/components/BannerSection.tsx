import React from "react";
import HeroBanner from "./HeroBanner";
import SideBanners from "./SideBanners";

const BannerSection: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Main Grid Container: 
          - 1 column on mobile 
          - 3 columns on desktop (Hero takes 2, Side takes 1)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 1: HERO SLIDER (Left) */}
        <div className="lg:col-span-2">
          <HeroBanner />
        </div>

        {/* SECTION 2: SIDE BANNERS (Right) */}
        <div className="lg:col-span-1">
          <SideBanners />
        </div>
        
      </div>
    </div>
  );
};

export default BannerSection;