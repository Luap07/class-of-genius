import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
} from "react-icons/fa";
import {
  Home,
  Info,
  Settings,
  Phone,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import Cog from "../assets/cog.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full text-white">
      {/* ================= PREMIUM BACKGROUND ================= */}
      <div className="absolute inset-0 border-b border-white/10 bg-[#050914]/80 shadow-lg shadow-black/10 backdrop-blur-2xl" />

      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-[-120px] h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute right-1/4 top-[-150px] h-72 w-72 rounded-full bg-indigo-500/10 blur-[110px]" />
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 md:px-10">
        {/* ================= LOGO + NAME ================= */}
        {/* Both logo and name link to Home */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="Scholiqen Home"
          className="group flex items-center gap-3"
        >
          {/* Logo container */}
          <div className="relative flex h-11 w-11 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md transition-all duration-300 group-hover:bg-blue-400/30" />

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] shadow-lg backdrop-blur-xl">
              <img
                src={Cog}
                alt="Scholiqen logo"
                className="h-8 w-8 object-contain transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Brand name */}
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white transition-colors duration-300 group-hover:text-blue-300 sm:text-xl">
              Scholiqen
            </span>

            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block">
              Learn Without Limits
            </span>
          </div>
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <ul className="hidden items-center gap-2 md:flex">
          <li>
            <Link
              to="/"
              className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-white/[0.05] hover:text-white"
            >
              <Home className="h-4 w-4 text-slate-500 transition-colors group-hover:text-blue-400" />
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/about"
              className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-white/[0.05] hover:text-white"
            >
              <Info className="h-4 w-4 text-slate-500 transition-colors group-hover:text-blue-400" />
              About
            </Link>
          </li>

          <li>
            <Link
              to="/services"
              className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-white/[0.05] hover:text-white"
            >
              <Settings className="h-4 w-4 text-slate-500 transition-colors group-hover:text-blue-400" />
              Services
            </Link>
          </li>

          <li>
            <Link
              to="/contact"
              className="group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-white/[0.05] hover:text-white"
            >
              <Phone className="h-4 w-4 text-slate-500 transition-colors group-hover:text-blue-400" />
              Contact
            </Link>
          </li>
        </ul>

        {/* ================= DESKTOP ACTIONS ================= */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-slate-200 backdrop-blur-xl transition-all duration-300 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            Get Started
          </Link>

          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/20"
          >
            Contact Us
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition-all duration-300 hover:border-blue-400/30 hover:bg-blue-500/10 md:hidden"
        >
          {isOpen ? (
            <FaTimes className="text-lg" />
          ) : (
            <FaBars className="text-lg" />
          )}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`relative overflow-hidden border-t border-white/5 bg-[#070b14]/95 backdrop-blur-2xl transition-all duration-300 md:hidden ${
          isOpen
            ? "max-h-[600px] opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 pb-6 pt-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3 shadow-2xl">
            <Link
              onClick={closeMenu}
              to="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.05] hover:text-white"
            >
              <Home className="h-5 w-5 text-blue-400" />
              Home
            </Link>

            <Link
              onClick={closeMenu}
              to="/about"
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.05] hover:text-white"
            >
              <Info className="h-5 w-5 text-blue-400" />
              About
            </Link>

            <Link
              onClick={closeMenu}
              to="/services"
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.05] hover:text-white"
            >
              <Settings className="h-5 w-5 text-blue-400" />
              Services
            </Link>

            <Link
              onClick={closeMenu}
              to="/contact"
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.05] hover:text-white"
            >
              <Phone className="h-5 w-5 text-blue-400" />
              Contact
            </Link>

            <div className="my-3 h-px bg-white/10" />

            <Link
              onClick={closeMenu}
              to="/login"
              className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 py-3.5 text-sm font-bold text-blue-300 transition-all hover:bg-blue-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Get Started
            </Link>

            <Link
              onClick={closeMenu}
              to="/contact"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-all hover:from-blue-500 hover:to-indigo-500"
            >
              Contact Us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;