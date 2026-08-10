import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Contact */}
        <div>
          <h3 className="font-bold mb-4 text-white">Contact Info</h3>

          <a
            href="tel:+2348104264197"
            className="block text-gray-400 text-sm mb-2 hover:text-white transition-colors"
          >
            +2348104264197
          </a>

          <a
            href="mailto:scholiqengmail.com"
            className="block text-gray-400 text-sm hover:text-white transition-colors"
          >
            scholiqengmail.com
          </a>
        </div>

        {/* Home Links */}
        <div>
          <h3 className="font-bold mb-4 text-white">Home</h3>

          <ul className="text-gray-400 text-sm space-y-2">
            <li>
              <Link
                to="/"
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="hover:text-white transition-colors"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>

            <li>
              <Link
                to="/blogs"
                className="hover:text-white transition-colors"
              >
                Blogs
              </Link>
            </li>
          </ul>
        </div>

        {/* Important Links */}
        <div>
          <h3 className="font-bold mb-4 text-white">Links</h3>

          <ul className="text-gray-400 text-sm space-y-2">
            <li>
              <Link
                to="/about"
                className="hover:text-white transition-colors"
              >
                Know Us
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </li>

            <li>
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-bold mb-4 text-white">Follow Us</h3>

          <div className="flex items-center space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <FaFacebook size={20} />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <FaTwitter size={20} />
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <FaYoutube size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto text-center text-gray-600 text-xs mt-12 border-t border-gray-800 pt-8">
        © 2026 Scholiqen Prime. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;