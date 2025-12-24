import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion"; // Make sure to install: npm install framer-motion
import Navbar from "../components/Navbar";
import { useGetCategoryDetailsQuery } from "../features/Apis/Categories.APi";
import { ArrowLeft } from "lucide-react"; // Optional: lucide-react for icons

const CategoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: category, isLoading, isError } = useGetCategoryDetailsQuery(id || "");

  // Animation variants for staggered list entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A24D]/20 border-t-[#C9A24D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="h-screen bg-[#0B0B0B] flex flex-col items-center justify-center text-white">
        <h2 className="text-[#C9A24D] font-serif italic text-2xl">Collection Not Found</h2>
        <Link to="/" className="mt-4 text-[10px] uppercase tracking-widest border-b border-[#C9A24D] pb-1">Return Home</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#0B0B0B] text-white font-sans"
    >
      <Navbar />

      {/* BACK BUTTON */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <Link 
          to="/" 
          className="group flex items-center gap-2 w-fit text-[10px] uppercase tracking-[0.3em] text-[#C9A24D] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
          <span>Back to Collections</span>
        </Link>
      </div>

      {/* HERO SECTION */}
      <section className="relative h-[65vh] w-full overflow-hidden flex items-center justify-center mt-6">
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          src={category.imageUrl || "https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg"} 
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/40 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center p-4">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] text-[#C9A24D] mb-4"
          >
            Exclusive Collection
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif font-bold text-white italic mb-6"
          >
            {category.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl text-gray-400 text-xs md:text-sm leading-relaxed tracking-widest font-light uppercase"
          >
            {category.description || "Indulge in the finest selection of luxury items curated specifically for the connoisseurs of Anma."}
          </motion.p>
        </div>
      </section>

      {/* SUB-COLLECTIONS GRID */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[#C9A24D]/20 pb-8"
        >
          <div>
            <h2 className="text-3xl font-serif italic text-[#C9A24D]">Sub Collections</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mt-2">Personalize your journey</p>
          </div>
          <span className="text-[10px] text-gray-600 uppercase tracking-widest hidden md:block">
            {category.subcategories?.length || 0} Specializations
          </span>
        </motion.div>

        {category.subcategories && category.subcategories.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {category.subcategories.map((sub) => (
              <motion.div key={sub.id} variants={itemVariants}>
                <Link 
                  to={`/perfumes?subcategory=${sub.id}`}
                  className="group relative block bg-[#141414] border border-white/5 p-10 transition-all duration-700 overflow-hidden"
                >
                  {/* Subtle Background Glow on Hover */}
                  <div className="absolute inset-0 bg-[#C9A24D]/0 group-hover:bg-[#C9A24D]/5 transition-all duration-700" />
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-serif italic font-bold tracking-wide text-white group-hover:text-[#C9A24D] transition-colors">
                      {sub.name}
                    </h3>
                    <div className="mt-6 flex items-center text-[9px] uppercase tracking-[0.3em] text-gray-500 group-hover:text-white transition-all">
                      Discover Products 
                      <span className="ml-3 h-[1px] w-6 bg-[#C9A24D] group-hover:w-12 transition-all" />
                    </div>
                  </div>

                  {/* Aesthetic Background Watermark */}
                  <div className="absolute -bottom-2 -right-2 text-7xl font-serif italic text-white/[0.03] group-hover:text-[#C9A24D]/10 transition-all duration-1000">
                    {sub.name.charAt(0)}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 border border-dashed border-[#C9A24D]/20">
            <p className="text-gray-600 text-[10px] uppercase tracking-widest">No specialized collections available yet.</p>
          </div>
        )}
      </section>

      {/* FOOTER DETAIL */}
      <div className="py-20 flex flex-col items-center opacity-40">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#C9A24D] to-transparent mb-6"></div>
        <span className="text-[9px] uppercase tracking-[1.5em] text-[#C9A24D] font-light">Anma Luxury House</span>
      </div>
    </motion.div>
  );
};

export default CategoryDetails;