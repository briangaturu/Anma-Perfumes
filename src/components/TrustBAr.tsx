import React from "react";
import { ShieldCheck, Truck, Clock, Award } from "lucide-react";

const TrustBar: React.FC = () => {
  const standards = [
    { icon: ShieldCheck, title: "Authentic", desc: "100% Original" },
    { icon: Truck, title: "Delivery", desc: "White Glove" },
    { icon: Award, title: "Purity", desc: "Lifetime Guarantee" },
    { icon: Clock, title: "Styling", desc: "Expert Advice" },
  ];

  return (
    <section className="bg-[#141414]/50 border-y border-white/5 py-8 my-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile: Horizontal Scroll | Desktop: 4 Columns */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-8 no-scrollbar pb-4 lg:pb-0">
          {standards.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center min-w-[140px] flex-shrink-0 group">
              <item.icon className="w-6 h-6 text-[#C9A24D] mb-3 opacity-80 group-hover:scale-110 transition-transform" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">
                {item.title}
              </h4>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;