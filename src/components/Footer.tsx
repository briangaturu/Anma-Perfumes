import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#141414] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="text-[#C9A24D] font-bold mb-4">About Anma</h3>
          <p className="text-gray-300 text-sm">
            Luxury fragrances • Premium cosmetics • Elegant jewellery. Explore our exquisite collections at all Anma branches.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-[#C9A24D] font-bold mb-4">Quick Links</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li><Link to="/" className="hover:text-[#C9A24D]">Home</Link></li>
            <li><Link to="/perfumes" className="hover:text-[#C9A24D]">Perfumes</Link></li>
            <li><Link to="/cosmetics" className="hover:text-[#C9A24D]">Cosmetics</Link></li>
            <li><Link to="/jewelry" className="hover:text-[#C9A24D]">Jewelry</Link></li>
            <li><Link to="/branches" className="hover:text-[#C9A24D]">Branches</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[#C9A24D] font-bold mb-4">Contact Us</h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>Email: support@anma.co.ke</li>
            <li>Phone: +254 700 123 456</li>
            <li>Address: Nairobi, Kenya</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-[#C9A24D] font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-[#C9A24D] transition">Facebook</a>
            <a href="#" className="text-gray-300 hover:text-[#C9A24D] transition">Instagram</a>
            <a href="#" className="text-gray-300 hover:text-[#C9A24D] transition">Twitter</a>
          </div>
        </div>
      </div>

      <div className="bg-[#111111] text-gray-500 text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} Anma. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
