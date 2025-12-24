import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Layout Components
import CategorySidebar from "../components/CategorySidebar";
import HeroBanner from "../components/HeroBanner";
import SideBanners from "../components/SideBanners";

// Section Components
import FlashDeals from "../components/Flashdeals";
import CampaignGrid from "../components/CampaignGrid";
import ProductRail from "../components/ProductRail";
import BranchSpotlight from "../components/BranchSpotlight";
import CustomPerfumeCTA from "../components/CustomPerfumeCTA";
import RecentlyViewed from "../components/Recentlty";
import TabbedProducts from "../components/TabbedProductSection";
import AboutAnma from "../components/About";
import HolidayAlert from "../components/HolidayAlerts";
import TrustBar from "../components/TrustBAr";
import CategorySection from "../components/CAtegorySection";

const USER_BRANCH = "Westlands";

const Home: React.FC = () => {
  return (
    /* FIX: Added pt-20 (80px) to prevent the fixed navbar 
       from overlapping the hero content.
    */
    <main className="bg-[#0B0B0B] text-white min-h-screen font-sans overflow-x-hidden pt-20">
      <Navbar />

      {/* --- TOP HERO GRID --- */}
      <section className="max-w-[1440px] mx-auto px-4 py-4 lg:py-8">
        <div className="grid grid-cols-12 gap-5">
          
          {/* Left: The Anma Standard (Desktop Only) */}
          <aside className="col-span-12 lg:col-span-3 hidden lg:block h-full">
            <CategorySidebar />
          </aside>

          {/* Center: Main Banner & Seasonal Messaging */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-5">
            <HeroBanner />
            <HolidayAlert />
          </div>

          {/* Right: Vertical Carousel Banners (Desktop Only) */}
          <div className="col-span-12 lg:col-span-3 hidden lg:block h-full">
            <SideBanners />
          </div>
        </div>
      </section>

      {/* --- MOBILE TRUST BAR --- */}
      <div className="lg:hidden">
        <TrustBar />
      </div>

      {/* --- CENTERED CATEGORY COLLECTIONS --- */}
      <div className="max-w-[1440px] mx-auto px-4">
        <CategorySection />
      </div>

      {/* --- FLASH DEALS SECTION --- */}
      <section className="max-w-[1440px] mx-auto px-4 py-10">
        <div className="border-l-2 border-[#C9A24D] pl-4 mb-8">
           <h2 className="text-2xl lg:text-3xl font-serif italic font-bold">Flash Deals</h2>
           <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Timed Exclusives</p>
        </div>
        <FlashDeals products={[]} />
      </section>

      {/* --- BRAND STORY & ABOUT --- */}
      <section className="bg-[#080808] border-y border-white/5 my-12">
        <div className="max-w-[1440px] mx-auto px-4 py-16 lg:py-24">
          <AboutAnma />
        </div>
      </section>

      {/* --- CAMPAIGN TILES --- */}
      <section className="max-w-[1440px] mx-auto px-4 py-8">
        <CampaignGrid />
      </section>

      {/* --- TABBED PRODUCT DISCOVERY --- */}
      <section className="max-w-[1440px] mx-auto px-4 py-12">
        <TabbedProducts
          newProducts={[]}
          bestSelling={[]}
          newArrivals={[]}
          userBranch={USER_BRANCH}
        />
      </section>

      {/* --- CURATED PRODUCT RAILS --- */}
      <section className="max-w-[1440px] mx-auto px-4 space-y-24 py-16">
        <ProductRail title="🔥 Hot Products" products={[]} />
        <ProductRail title="✨ New Arrivals" products={[]} />
        <ProductRail title="💎 Top Discounts" products={[]} />
      </section>

      {/* --- BRANCH & MAP SPOTLIGHT --- */}
      <section className="bg-gradient-to-b from-transparent to-[#050505] py-20">
        <div className="max-w-[1440px] mx-auto px-4">
          <BranchSpotlight />
        </div>
      </section>

      {/* --- SIGNATURE EXPERIENCE (Custom Perfume) --- */}
      <section className="max-w-[1440px] mx-auto px-4 py-16">
        <div className="rounded-sm overflow-hidden border border-[#C9A24D]/20 shadow-2xl">
           <CustomPerfumeCTA />
        </div>
      </section>

      {/* --- RECENTLY VIEWED --- */}
      <section className="max-w-[1440px] mx-auto px-4 py-16 border-t border-white/5">
        <RecentlyViewed products={[]} />
      </section>

      <Footer />
    </main>
  );
};

export default Home;