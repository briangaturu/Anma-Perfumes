import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGetCategoriesQuery } from "../features/Apis/Categories.APi";

const CategorySection: React.FC = () => {
  const { data, isLoading, isError } = useGetCategoriesQuery({ page: 1, limit: 12 });

  // Helper to get first two initials
  const getInitials = (name: string) => {
    if (!name) return "AN";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) return (
    <div className="h-40 flex justify-center items-center">
      <div className="w-6 h-6 border-2 border-[#C9A24D] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (isError) return null;

  // Mapping data based on your JSON structure
  const categories = data?.data || [];

  return (
    <section className="py-16 px-4">
      {/* HEADER */}
      <div className="flex flex-col items-center mb-12 text-center">
        <h2 className="text-3xl font-serif italic font-bold text-white mb-2">Our Collections</h2>
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-[#C9A24D]/30"></div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C9A24D]">Select Experience</span>
          <div className="h-[1px] w-8 bg-[#C9A24D]/30"></div>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="flex flex-wrap justify-center gap-10 md:gap-16 max-w-6xl mx-auto">
        {categories.map((cat: any, index: number) => {
          // Check for imageUrl specifically from your JSON
          const categoryImage = cat.imageUrl || cat.image;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/categories/${cat.id}`}
                className="group flex flex-col items-center text-center space-y-5"
              >
                <div className="relative w-28 h-28 md:w-36 md:h-36">
                  {/* Outer Glow/Ring */}
                  <div className="absolute -inset-2 rounded-full border border-[#C9A24D]/0 group-hover:border-[#C9A24D]/40 group-hover:rotate-180 transition-all duration-1000"></div>
                  
                  <div className="relative w-full h-full rounded-full overflow-hidden border-[6px] border-[#141414] shadow-2xl bg-[#1a1a1a] flex items-center justify-center">
                    {categoryImage ? (
                      <img
                        src={categoryImage}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      /* INITIALS FALLBACK */
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#000000]">
                        <span className="text-2xl md:text-3xl font-serif italic font-bold text-[#C9A24D]">
                          {getInitials(cat.name)}
                        </span>
                      </div>
                    )}
                    {/* Dark Overlay that clears on hover */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>

                <div className="relative">
                  <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em] group-hover:text-[#C9A24D] transition-colors">
                    {cat.name}
                  </h3>
                  <div className="mt-1 h-[1px] w-0 bg-[#C9A24D] mx-auto group-hover:w-full transition-all duration-500"></div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySection;