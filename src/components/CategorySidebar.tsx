import React from "react";
import { ShieldCheck, Truck, Clock, Award } from "lucide-react";

const CategorySidebar: React.FC = () => {
  return (
    <div className="relative bg-[#141414] rounded-sm shadow-2xl border border-white/5 h-full overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A24D]">The Anma Standard</h2>
      </div>

      {/* LUXURY SERVICE LIST */}
      <div className="p-6 space-y-8">
        
        {/* ITEM 1 */}
        <div className="flex items-start gap-4 group">
          <ShieldCheck className="w-5 h-5 text-[#C9A24D] opacity-70 group-hover:opacity-100 transition-opacity" />
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Authentic Scent</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed font-light">100% certified original oils and rare essences.</p>
          </div>
        </div>

        {/* ITEM 2 */}
        <div className="flex items-start gap-4 group">
          <Truck className="w-5 h-5 text-[#C9A24D] opacity-70 group-hover:opacity-100 transition-opacity" />
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">White Glove Delivery</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed font-light">Same-day delivery across Nairobi in premium packaging.</p>
          </div>
        </div>

        {/* ITEM 3 */}
        <div className="flex items-start gap-4 group">
          <Award className="w-5 h-5 text-[#C9A24D] opacity-70 group-hover:opacity-100 transition-opacity" />
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Elite Jewelry</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed font-light">Handcrafted pieces with a lifetime purity guarantee.</p>
          </div>
        </div>

        {/* ITEM 4 */}
        <div className="flex items-start gap-4 group">
          <Clock className="w-5 h-5 text-[#C9A24D] opacity-70 group-hover:opacity-100 transition-opacity" />
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Private Styling</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed font-light">Book a virtual consultation with our scent experts.</p>
          </div>
        </div>

      </div>

      {/* FOOTER CTA */}
      <div className="mt-4 p-6 bg-white/[0.01] border-t border-white/5">
        <button className="w-full py-3 border border-[#C9A24D]/30 text-[#C9A24D] text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-[#C9A24D] hover:text-black transition-all duration-500">
          Join the Membership
        </button>
      </div>
    </div>
  );
};

export default CategorySidebar;