import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Cog from "../assets/cog.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-4 backdrop-blur-xl border-b bg-white/80 border-blue-100 text-slate-900 transition-colors">
      <div className="flex justify-between items-center max-w-7xl mx-auto">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <img src={Cog} alt="Logo" className="w-8 h-8" />
          <span>Class Of Genius</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 font-medium">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm rounded-full border border-blue-600 text-blue-600"
          >
            Get Started
          </Link>

          <Link
            to="/contact"
            className="px-4 py-2 text-sm rounded-full bg-blue-600 text-white"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile Button */}
        <div className="flex md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden mt-4 px-6 py-6 space-y-4 rounded-xl shadow-lg bg-white text-slate-900">
          <Link onClick={() => setIsOpen(false)} to="/" className="block">Home</Link>
          <Link onClick={() => setIsOpen(false)} to="/about" className="block">About</Link>
          <Link onClick={() => setIsOpen(false)} to="/services" className="block">Services</Link>
          <Link onClick={() => setIsOpen(false)} to="/contact" className="block">Contact</Link>

          <hr />

          <Link
            onClick={() => setIsOpen(false)}
            to="/login"
            className="block px-4 py-2 rounded-full border border-blue-600 text-blue-600 text-center"
          >
            Get Started
          </Link>

          <Link
            onClick={() => setIsOpen(false)}
            to="/contact"
            className="block px-4 py-2 rounded-full bg-blue-600 text-white text-center"
          >
            Contact Us
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;