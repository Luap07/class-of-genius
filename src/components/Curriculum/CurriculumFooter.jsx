// src/components/curriculum/CurriculumFooter.jsx

import React from "react";
import {
  Globe2,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const CurriculumFooter = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">

      <div className="max-w-7xl mx-auto px-8 py-16">

        <div className="grid lg:grid-cols-4 gap-12">

          {/* Logo */}

          <div>

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">

                <Globe2
                  size={30}
                  className="text-white"
                />

              </div>

              <div>

                <h2 className="text-3xl font-black text-white">
                  Global Curriculum
                </h2>

                <p className="text-cyan-400">
                  Learn Without Borders
                </p>

              </div>

            </div>

            <p className="mt-8 text-slate-400 leading-8">

              Explore curriculum frameworks from every country,
              compare education systems, learn with AI,
              perform virtual laboratory experiments,
              and study anywhere in the world.

            </p>

          </div>

          {/* Curriculum */}

          <div>

            <h3 className="text-xl font-bold text-white mb-6">
              Curriculum
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li className="hover:text-cyan-400 cursor-pointer">
                Countries
              </li>

              <li className="hover:text-cyan-400 cursor-pointer">
                Curriculum Frameworks
              </li>

              <li className="hover:text-cyan-400 cursor-pointer">
                Subjects
              </li>

              <li className="hover:text-cyan-400 cursor-pointer">
                Learning Outcomes
              </li>

              <li className="hover:text-cyan-400 cursor-pointer">
                Lesson Library
              </li>

            </ul>

          </div>

          {/* Learning */}

          <div>

            <h3 className="text-xl font-bold text-white mb-6">
              Learning
            </h3>

            <ul className="space-y-4 text-slate-400">

              <li className="flex items-center gap-2">

                <BookOpen size={16} />

                Courses

              </li>

              <li className="flex items-center gap-2">

                <GraduationCap size={16} />

                Assessments

              </li>

              <li>Virtual Labs</li>

              <li>AI Tutor</li>

              <li>Certificates</li>

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-xl font-bold text-white mb-6">
              Contact
            </h3>

            <div className="space-y-5 text-slate-400">

              <div className="flex items-center gap-3">

                <Mail size={18} />

                support@globalcurriculum.ai

              </div>

              <div className="flex items-center gap-3">

                <Phone size={18} />

                +1 (000) 000-0000

              </div>

              <div className="flex items-center gap-3">

                <MapPin size={18} />

                Global Education Network

              </div>

            </div>

          </div>

        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-slate-500 text-sm">

            © 2026 Global Curriculum Platform. All rights reserved.

          </p>

          <div className="flex gap-8 text-slate-500 text-sm">

            <span className="cursor-pointer hover:text-cyan-400">
              Privacy Policy
            </span>

            <span className="cursor-pointer hover:text-cyan-400">
              Terms of Service
            </span>

            <span className="cursor-pointer hover:text-cyan-400">
              Cookies
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default CurriculumFooter;