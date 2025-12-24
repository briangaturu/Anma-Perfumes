import React from "react";
import { Link } from "react-router-dom";

type Branch = {
  id: string;
  name: string;
  address: string;
  image: string;
  link: string;
};

const BRANCHES: Branch[] = [
  {
    id: "b1",
    name: "Nairobi Central",
    address: "123 Kenyatta Ave, Nairobi",
    image:
      "https://images.unsplash.com/photo-1565372912332-1285bfb9f9e2?auto=format&fit=crop&w=600&q=80",
    link: "/branches/nairobi-central",
  },
  {
    id: "b2",
    name: "Westlands",
    address: "45 Sarit Centre Rd, Nairobi",
    image:
      "https://images.unsplash.com/photo-1590411432849-2f7c15b0b1a2?auto=format&fit=crop&w=600&q=80",
    link: "/branches/westlands",
  },
  {
    id: "b3",
    name: "Mombasa",
    address: "78 Moi Ave, Mombasa",
    image:
      "https://images.unsplash.com/photo-1542690213-11f8d4f87a6f?auto=format&fit=crop&w=600&q=80",
    link: "/branches/mombasa",
  },
];

const BranchSpotlight: React.FC = () => {
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-[#C9A24D] mb-4">Our Branches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BRANCHES.map((branch) => (
          <Link
            key={branch.id}
            to={branch.link}
            className="relative rounded-lg overflow-hidden shadow-md group hover:scale-105 transition"
          >
            <img
              src={branch.image}
              alt={branch.name}
              className="w-full h-48 object-cover"
            />

            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition" />

            <div className="absolute bottom-4 left-4 z-10">
              <h3 className="text-lg font-semibold text-white">{branch.name}</h3>
              <p className="text-sm text-gray-200">{branch.address}</p>
              <span className="text-xs font-medium text-[#C9A24D] mt-1 inline-block">
                Visit →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BranchSpotlight;
