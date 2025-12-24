import React, { useState } from "react";
import { Link } from "react-router-dom";

type Product = {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  badge?: "HOT" | "NEW" | "SALE";
  availableBranches: string[];
  link: string;
};

type Props = {
  newProducts: Product[];
  bestSelling: Product[];
  newArrivals: Product[];
  userBranch: string; // Current branch for availability check
};

const TabbedProducts: React.FC<Props> = ({ newProducts, bestSelling, newArrivals, userBranch }) => {
  const [activeTab, setActiveTab] = useState<"NEW" | "BEST" | "ARRIVALS">("NEW");

  const renderProducts = () => {
    let products: Product[] = [];
    switch (activeTab) {
      case "NEW":
        products = newProducts;
        break;
      case "BEST":
        products = bestSelling;
        break;
      case "ARRIVALS":
        products = newArrivals;
        break;
    }

    return products.map((product) => {
      const isAvailable = product.availableBranches.includes(userBranch);
      return (
        <Link
          key={product.id}
          to={product.link}
          className="flex-shrink-0 w-44 bg-[#1A1A1A] rounded-lg p-3 shadow-md hover:scale-105 transition relative"
        >
          {/* Badge */}
          {product.badge && (
            <span
              className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded ${
                product.badge === "HOT"
                  ? "bg-red-500 text-white"
                  : product.badge === "NEW"
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-black"
              }`}
            >
              {product.badge}
            </span>
          )}

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-40 object-cover rounded-md mb-2"
          />
          <h3 className="text-sm font-semibold text-white mb-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#C9A24D]">
              ${product.discountedPrice}
            </span>
            {product.originalPrice > product.discountedPrice && (
              <span className="text-xs text-white/50 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <p className={`mt-1 text-xs font-medium ${isAvailable ? "text-green-400" : "text-red-400"}`}>
            {isAvailable ? "Available at your branch" : "Not available at your branch"}
          </p>
        </Link>
      );
    });
  };

  return (
    <div className="my-8">
      {/* Tabs */}
      <div className="flex space-x-4 mb-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("NEW")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "NEW"
              ? "border-b-2 border-[#C9A24D] text-[#C9A24D]"
              : "text-white/70"
          }`}
        >
          New Products
        </button>
        <button
          onClick={() => setActiveTab("BEST")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "BEST"
              ? "border-b-2 border-[#C9A24D] text-[#C9A24D]"
              : "text-white/70"
          }`}
        >
          Best Selling
        </button>
        <button
          onClick={() => setActiveTab("ARRIVALS")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "ARRIVALS"
              ? "border-b-2 border-[#C9A24D] text-[#C9A24D]"
              : "text-white/70"
          }`}
        >
          New Arrivals
        </button>
      </div>

      {/* Product Scroll */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {renderProducts()}
      </div>
    </div>
  );
};

export default TabbedProducts;
