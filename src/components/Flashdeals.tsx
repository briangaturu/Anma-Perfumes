import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type DealProduct = {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  link: string;
};

const FLASH_DEALS: DealProduct[] = [
  {
    id: "p1",
    name: "Rose Oud Perfume",
    image:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=400&q=80",
    originalPrice: 120,
    discountedPrice: 90,
    link: "/perfumes/rose-oud",
  },
  {
    id: "p2",
    name: "Gold Necklace",
    image:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=400&q=80",
    originalPrice: 250,
    discountedPrice: 180,
    link: "/jewelry/gold-necklace",
  },
  {
    id: "p3",
    name: "Luxury Lipstick",
    image:
      "https://images.unsplash.com/photo-1596464716121-74b7f0be7f80?auto=format&fit=crop&w=400&q=80",
    originalPrice: 40,
    discountedPrice: 30,
    link: "/cosmetics/lipstick",
  },
  {
    id: "p4",
    name: "Sandalwood Perfume",
    image:
      "https://images.unsplash.com/photo-1627310431593-88f9b401d030?auto=format&fit=crop&w=400&q=80",
    originalPrice: 150,
    discountedPrice: 110,
    link: "/perfumes/sandalwood",
  },
];

// Set the deal end time (static for now)
const DEAL_END_TIME = new Date(Date.now() + 1000 * 60 * 60 * 6); // 6 hours from now

const FlashDeals: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(DEAL_END_TIME.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(DEAL_END_TIME.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-[#141414] rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#C9A24D]">Flash Deals 🔥</h2>
        <span className="text-sm text-white/80">
          Ends in: {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {FLASH_DEALS.map((product) => (
          <Link
            to={product.link}
            key={product.id}
            className="flex-shrink-0 w-40 bg-[#1A1A1A] rounded-lg p-3 shadow-md hover:scale-105 transition"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
            <h3 className="text-sm font-semibold text-white mb-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#C9A24D]">
                ${product.discountedPrice}
              </span>
              <span className="text-xs text-white/50 line-through">
                ${product.originalPrice}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FlashDeals;
