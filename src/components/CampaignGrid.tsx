import React from "react";
import { Link } from "react-router-dom";

type Campaign = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    title: "Winter Fragrance Sale",
    subtitle: "Up to 40% off select perfumes",
    image:
      "https://images.unsplash.com/photo-1603786038326-f07db71f8031?auto=format&fit=crop&w=600&q=80",
    ctaText: "Shop Now",
    ctaLink: "/perfumes",
  },
  {
    id: "c2",
    title: "Jewelry New Arrivals",
    subtitle: "Exclusive pieces for you",
    image:
      "https://images.unsplash.com/photo-1611954285385-4b2a144de90f?auto=format&fit=crop&w=600&q=80",
    ctaText: "Explore",
    ctaLink: "/jewelry",
  },
  {
    id: "c3",
    title: "Luxury Cosmetics Deals",
    subtitle: "Makeup and skincare essentials",
    image:
      "https://images.unsplash.com/photo-1612122215300-204de84999ff?auto=format&fit=crop&w=600&q=80",
    ctaText: "Shop Cosmetics",
    ctaLink: "/cosmetics",
  },
  {
    id: "c4",
    title: "Custom Perfume Experience",
    subtitle: "Create your unique scent",
    image:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80",
    ctaText: "Design Yours",
    ctaLink: "/perfumes/custom",
  },
];

const CampaignGrid: React.FC = () => {
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-[#C9A24D] mb-4">Campaigns & Offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CAMPAIGNS.map((campaign) => (
          <Link
            key={campaign.id}
            to={campaign.ctaLink}
            className="relative rounded-lg overflow-hidden shadow-md group hover:scale-105 transition"
          >
            {/* Image */}
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full h-48 object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition" />

            {/* Text */}
            <div className="absolute bottom-4 left-4 z-10">
              <h3 className="text-lg font-semibold text-white">{campaign.title}</h3>
              <p className="text-sm text-gray-200 mb-2">{campaign.subtitle}</p>
              <span className="text-xs font-medium text-[#C9A24D] uppercase tracking-wide">
                {campaign.ctaText} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CampaignGrid;
