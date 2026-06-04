import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-blue-900 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold mb-6 leading-tight text-white">
          Elevate Your Educational Journey
        </h2>
        <p className="text-blue-100 text-lg mb-10 leading-relaxed">
          Unlock your full potential through our state-of-the-art platform, 
          designed to bridge the gap between curiosity and mastery.
        </p>
        <Link
          to="/login"
          className="inline-block bg-white text-blue-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-xl"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
};

export default CTASection;