import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import {
  ArrowUpRight,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#04070d] px-6 pb-8 pt-16 text-white">
      {/* ================= PREMIUM BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute -bottom-40 right-[-100px] h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "25px 25px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ================= TOP BRAND AREA ================= */}
        <div className="mb-14 flex flex-col justify-between gap-8 border-b border-white/10 pb-12 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              <span>Learn Without Limits</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
                Scholiqen
              </span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
              A modern learning platform designed to help students explore,
              learn, practice, and achieve more.
            </p>
          </div>

          {/* Premium CTA */}
          <Link
            to="/login"
            className="group inline-flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-500/10"
          >
            Get Started
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        {/* ================= FOOTER GRID ================= */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contact */}
          <div>
            <h3 className="mb-5 text-sm font-extrabold uppercase tracking-widest text-white">
              Contact Info
            </h3>

            <div className="space-y-4">
              <a
                href="tel:+2348104264197"
                className="group flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors group-hover:border-blue-400/20 group-hover:bg-blue-500/10">
                  <Phone className="h-4 w-4" />
                </span>

                <span>+234 810 426 4197</span>
              </a>

              <a
                href="mailto:scholiqengmail.com"
                className="group flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors group-hover:border-blue-400/20 group-hover:bg-blue-500/10">
                  <Mail className="h-4 w-4" />
                </span>

                <span>scholiqengmail.com</span>
              </a>
            </div>
          </div>

          {/* Home */}
          <div>
            <h3 className="mb-5 text-sm font-extrabold uppercase tracking-widest text-white">
              Explore
            </h3>

            <ul className="space-y-3 text-sm">
              {[
                ["/", "Home"],
                ["/about", "About"],
                ["/contact", "Contact"],
              ].map(([path, label]) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="group flex w-fit items-center gap-1 text-slate-400 transition-colors hover:text-white"
                  >
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="mb-5 text-sm font-extrabold uppercase tracking-widest text-white">
              Resources
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="group flex w-fit items-center gap-1 text-slate-400 transition-colors hover:text-white"
                >
                  Know Us
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="group flex w-fit items-center gap-1 text-slate-400 transition-colors hover:text-white"
                >
                  Contact Us
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy"
                  className="group flex w-fit items-center gap-1 text-slate-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-5 text-sm font-extrabold uppercase tracking-widest text-white">
              Follow Us
            </h3>

            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
              >
                <FaFacebook size={18} />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:bg-sky-500/10 hover:text-sky-400"
              >
                <FaTwitter size={18} />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500">
            © 2026 Scholiqen Prime. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Built for modern education</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;