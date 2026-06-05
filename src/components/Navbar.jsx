import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Cog from "../assets/cog.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 
      bg-gradient-to-r from-white via-blue-50/40 to-white 
      backdrop-blur-xl 
      border-b border-blue-100/50 
      shadow-sm">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <img src={Cog} alt="Logo" className="w-8 h-8" />
          <span>Class Of Genius</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 font-medium text-slate-700">
          <li><Link to="/" className="hover:text-blue-600 transition">Home</Link></li>
          <li><Link to="/about" className="hover:text-blue-600 transition">About</Link></li>
          <li><Link to="/services" className="hover:text-blue-600 transition">Services</Link></li>
          <li><Link to="/contact" className="hover:text-blue-600 transition">Contact</Link></li>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
          >
            Get Started
          </Link>

          <Link
            to="/contact"
            className="px-4 py-2 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl text-slate-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white w-full border-t border-blue-100 flex flex-col items-center py-6 gap-4 shadow-xl">
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/services" onClick={() => setIsOpen(false)}>Services</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>

          <div className="flex flex-col gap-3 mt-3 w-full px-6">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="text-center py-2 border border-blue-600 text-blue-600 rounded-full"
            >
              Get Started
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="text-center py-2 bg-blue-600 text-white rounded-full"
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;