import React from "react";
import { Link } from "react-router-dom";
import { ConnectContext } from "../context/ConnectContext";
import { useContext } from "react";

const CTASection = () => {
  const { darkMode } = useContext(ConnectContext);
  return (
    <section
      className={`py-24 px-6 text-center transition-colors duration-300 ${
        darkMode ? "bg-slate-900 text-white" : "bg-[#070b14] text-white"
      }`}
    >
      <div>
        <h2 className="text-4xl font-bold mb-6 leading-tight">
          Elevate Your Educational Journey
        </h2>

        <p
          className={`text-lg mb-10 leading-relaxed ${
            darkMode ? "text-gray-300" : "text-blue-100"
          }`}
        >
          Unlock your full potential through our state-of-the-art platform,
          designed to bridge the gap between curiosity and mastery.
        </p>

        <Link
          to="/login"
          className={`inline-block px-10 py-4 rounded-full font-bold text-lg transition shadow-xl ${
            darkMode
              ? "bg-white text-slate-900 hover:bg-gray-200"
              : "bg-white text-blue-900 hover:bg-blue-50"
          }`}
        >
          Get Started
        </Link>
      </div>
    </section>
  );
};
export default CTASection;