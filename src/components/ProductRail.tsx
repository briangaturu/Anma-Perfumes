import React from "react";
import { Link } from "react-router-dom";

type Product = {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  link: string;
};

type ProductRailProps = {
  title: string;
  products?: Product[]; // make optional
};

const ProductRail: React.FC<ProductRailProps> = ({ title, products = [] }) => {
  if (products.length === 0) return null; // don't render empty rail

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-[#C9A24D] mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {products.map((product) => (
          <Link
            key={product.id}
            to={product.link}
            className="flex-shrink-0 w-40 bg-[#1A1A1A] rounded-lg p-3 shadow-md hover:scale-105 transition"
          >
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
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductRail;
