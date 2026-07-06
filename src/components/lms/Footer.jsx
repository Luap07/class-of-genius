import React from "react";
import {
  GraduationCap,
  BookOpen,
  Mail,
  Globe,
  Heart,
} from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid md:grid-cols-3 gap-8">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <GraduationCap size={22} />
              </div>

              <div>
                <h2 className="font-bold text-lg text-white">
                  ClassOfGenius LMS
                </h2>

                <p className="text-sm text-slate-400">
                  Learn. Practice. Excel.
                </p>
              </div>
            </div>

            <p className="mt-4 text-slate-500 text-sm leading-7">
              A complete learning management system designed for
              interactive education, AI learning, virtual labs,
              assessments and progress tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              Quick Links
            </h3>

            <div className="space-y-3 text-slate-400">

              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                Courses
              </div>

              <div>Assignments</div>

              <div>Resources</div>

              <div>Certificates</div>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              Contact
            </h3>

            <div className="space-y-3 text-slate-400">

              <div className="flex items-center gap-2">
                <Mail size={16} />
                support@classofgenius.com
              </div>

              <div className="flex items-center gap-2">
                <Globe size={16} />
                www.classofgenius.com
              </div>

            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between">

          <p className="text-sm text-slate-500">
            © {year} . All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-500 mt-3 md:mt-0">
            Built with
            <Heart size={14} className="text-red-500 fill-red-500" />
            for students.
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;