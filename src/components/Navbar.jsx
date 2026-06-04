import { Link } from "react-router-dom";
import Cog from "../assets/cog.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-white/90 via-blue-50/90 to-white/90 backdrop-blur-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 font-bold text-2xl text-slate-900"
        >
          <img
            src={Cog}
            alt="Class Of Genius"
            className="w-11 h-11 object-contain"
          />
          <span>Class Of Genius</span>
        </Link>

        {/* Links */}
        <ul className="flex items-center gap-8 font-semibold text-slate-700">
          <li>
            <Link to="/" className="hover:text-blue-600 transition">
              Home
            </Link>
          </li>

          <li>
            <Link to="/about" className="hover:text-blue-600 transition">
              About
            </Link>
          </li>

          <li>
            <Link to="/services" className="hover:text-blue-600 transition">
              Services
            </Link>
          </li>

          <li>
            <Link to="/contact" className="hover:text-blue-600 transition">
              Contact
            </Link>
          </li>
        </ul>

        {/* Buttons */}
        <div className="flex items-center gap-4">

          <Link
            to="/login"
            className="px-5 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
          >
            Get Started
          </Link>

          <Link
            to="/contact"
            className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
          >
            Contact Us
          </Link>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;