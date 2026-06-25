import React from "react";
import {
  FlaskConical,
  Mail,
  BookOpen,
  Brain,
  Atom,
  Globe,
} from "lucide-react";

const LabFooter = () => {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">

              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <FlaskConical
                  size={24}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <h3 className="text-white font-bold text-xl">
                  Virtual Lab
                </h3>

                <p className="text-slate-400 text-sm">
                  Scholiqen AI Learning Platform
                </p>
              </div>

            </div>

            <p className="text-slate-400 leading-relaxed">
              Explore science through interactive simulations,
              AI tutoring, virtual experiments, and immersive
              learning experiences.
            </p>
          </div>

          {/* Learning */}
          <div>

            <h4 className="text-white font-semibold mb-5">
              Subjects
            </h4>

            <ul className="space-y-3">

              <li className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">
                Physics
              </li>

              <li className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">
                Chemistry
              </li>

              <li className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">
                Biology
              </li>

              <li className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">
                Mathematics
              </li>

            </ul>

          </div>

          {/* Features */}
          <div>

            <h4 className="text-white font-semibold mb-5">
              Features
            </h4>

            <ul className="space-y-4">

              <li className="flex items-center gap-3 text-slate-400">
                <Brain size={18} />
                AI Tutor
              </li>

              <li className="flex items-center gap-3 text-slate-400">
                <Atom size={18} />
                Virtual Experiments
              </li>

              <li className="flex items-center gap-3 text-slate-400">
                <BookOpen size={18} />
                Interactive Learning
              </li>

            </ul>

          </div>

          {/* Contact */}
          <div>

            <h4 className="text-white font-semibold mb-5">
              Contact
            </h4>

            <div className="space-y-4">

              <div className="flex items-center gap-3 text-slate-400">
                <Mail size={18} />
                scholiqen@gmail.com
              </div>

              </div>

          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-8">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Scholiqen Virtual Lab. All rights reserved.
            </p>

            <div className="flex items-center gap-6">

              <button className="text-slate-500 hover:text-cyan-400 transition text-sm">
                Privacy
              </button>

              <button className="text-slate-500 hover:text-cyan-400 transition text-sm">
                Terms
              </button>

              <button className="text-slate-500 hover:text-cyan-400 transition text-sm">
                Support
              </button>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default LabFooter;