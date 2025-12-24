import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetCategoryDetailsQuery } from "../features/Apis/Categories.APi";

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
  };
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  const [isHovered, setIsHovered] = useState(false);

  const { data: details, isFetching } = useGetCategoryDetailsQuery(category.id, {
    skip: !isHovered,
  });

  return (
    <li
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* UPDATED LINK: Now points to the Category Details Page */}
      <Link
        to={`/categories/${category.id}`}
        className="flex items-center justify-between px-5 py-4 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-300 hover:text-[#C9A24D] hover:bg-white/[0.03] transition-all duration-300"
      >
        <span>{category.name}</span>
        <span className="text-gray-600 text-lg group-hover:text-[#C9A24D] group-hover:translate-x-1 transition-all">
          ›
        </span>
      </Link>

      {/* SUB-CATEGORY DROPDOWN */}
      {isHovered && (
        <div className="absolute top-0 left-full ml-[2px] w-72 bg-[#0B0B0B] border border-[#C9A24D]/30 shadow-[25px_0_60px_rgba(0,0,0,0.9)] z-[110] animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="p-4 border-b border-white/5 bg-[#C9A24D]/5 flex justify-between items-center">
            <h3 className="text-[8px] uppercase tracking-[0.4em] text-[#C9A24D] font-black">
              Explore {category.name}
            </h3>
            {isFetching && (
              <div className="w-2.5 h-2.5 border-2 border-[#C9A24D]/20 border-t-[#C9A24D] rounded-full animate-spin"></div>
            )}
          </div>

          <ul className="py-2 min-h-[40px]">
            {details?.subcategories && details.subcategories.length > 0 ? (
              details.subcategories.map((sub: any) => (
                <li key={sub.id}>
                  {/* Subcategories still link directly to products */}
                  <Link
                    to={`/perfumes?category=${category.id}&subcategory=${sub.id}`}
                    className="block px-6 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-400 hover:text-[#C9A24D] hover:bg-white/[0.05] transition-all"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))
            ) : (
              !isFetching && (
                <li className="px-6 py-6 text-[9px] text-gray-600 italic tracking-widest text-center">
                  No specialized collections
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </li>
  );
};

export default CategoryItem;