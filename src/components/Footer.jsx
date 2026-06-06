import React from 'react';
import { FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-6 md:px-12">
      <div className="max-w-7xl  mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Contact */}
        <div>
          <h3 className="font-bold mb-4">Contact Info</h3>
          <p className="text-gray-400 text-sm mb-2">+2348104264197</p>
          <p className="text-gray-400 text-sm">classofgenius4@gmail.com</p>
        </div>

        {/* Links */}
        <div><h3 className="font-bold mb-4">Home</h3><ul className="text-gray-400 text-sm space-y-2"><li>Home</li><li>About</li><li>Contact</li><li>Blogs</li></ul></div>
        <div><h3 className="font-bold mb-4">Links</h3><ul className="text-gray-400 text-sm space-y-2"><li>Known Us</li><li>Contact Us</li><li>Privacy Policy</li></ul></div>

        {/* Social */}
        <div>
          <h3 className="font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <FaFacebook className="cursor-pointer hover:text-blue-500" />
            <FaTwitter className="cursor-pointer hover:text-blue-400" />
            <FaYoutube className="cursor-pointer hover:text-red-500" />
          </div>
        </div>
      </div>
      <div className="text-center text-gray-600 text-xs mt-12 border-t border-gray-800 pt-8">© 2026 ClassOfGenius Prime. All rights reserved.</div>
    </footer>
  );
};

export default Footer;