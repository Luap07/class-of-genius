import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import {
  Home,
  Info,
  Settings,
  Phone,
  Sparkles,
} from "lucide-react";

import Cog from "../assets/cog.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 text-white">

      {/* BACKGROUND */}
      <div className="
        absolute inset-0
        bg-gradient-to-r from-[#05070f] via-[#0b1220] to-[#05070f]
        backdrop-blur-xl
        border-b border-white/10
      " />

      {/* MAIN CONTAINER (FIXED PADDING PROPERLY) */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-4 flex justify-between items-center">

        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="flex items-center gap-3 font-bold text-xl"
        >
          <img
            src={Cog}
            alt="logo"
            className="w-9 h-9 hover:rotate-12 transition duration-300"
          />

          <span className="tracking-wide">
            Scholiqen
          </span>
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <ul className="hidden md:flex items-center gap-10 text-sm font-medium">

          <li>
            <Link className="flex items-center gap-2 hover:text-blue-400 transition" to="/">
              <Home size={16} />
              Home
            </Link>
          </li>

          <li>
            <Link className="flex items-center gap-2 hover:text-blue-400 transition" to="/about">
              <Info size={16} />
              About
            </Link>
          </li>

          <li>
            <Link className="flex items-center gap-2 hover:text-blue-400 transition" to="/services">
              <Settings size={16} />
              Services
            </Link>
          </li>

          <li>
            <Link className="flex items-center gap-2 hover:text-blue-400 transition" to="/contact">
              <Phone size={16} />
              Contact
            </Link>
          </li>

        </ul>

        {/* ================= RIGHT BUTTON ================= */}
        <div className="hidden md:flex items-center gap-3">

          <Link
            to="/login"
            className="px-5 py-2 rounded-full border border-blue-500 text-blue-300 hover:bg-blue-500/10 transition"
          >
            Get Started
          </Link>

          <Link
            to="/contact"
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
          >
            Contact Us
          </Link>

        </div>

        {/* ================= MOBILE BUTTON ================= */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {isOpen && (
        <div className="
          md:hidden mx-4 mt-3 p-5 rounded-2xl
          bg-[#0b1220]/95 border border-white/10
          backdrop-blur-xl space-y-4
        ">

          <Link onClick={() => setIsOpen(false)} className="flex items-center gap-2" to="/">
            <Home size={16} /> Home
          </Link>

          <Link onClick={() => setIsOpen(false)} className="flex items-center gap-2" to="/about">
            <Info size={16} /> About
          </Link>

          <Link onClick={() => setIsOpen(false)} className="flex items-center gap-2" to="/services">
            <Settings size={16} /> Services
          </Link>

          <Link onClick={() => setIsOpen(false)} className="flex items-center gap-2" to="/contact">
            <Phone size={16} /> Contact
          </Link>

          <hr className="border-white/10" />

          <Link
            onClick={() => setIsOpen(false)}
            to="/login"
            className="block text-center py-2 rounded-full border border-blue-500 text-blue-300"
          >
            Get Started
          </Link>

          <Link
            onClick={() => setIsOpen(false)}
            to="/contact"
            className="block text-center py-2 rounded-full bg-blue-600"
          >
            Contact Us
          </Link>

        </div>
      )}
    </nav>
  );
};

export default Navbar;