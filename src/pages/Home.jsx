import React, { useState } from "react";
import home_bg from "../assets/home_bg.png";
import Solutions from "../components/Solutions";
import CTASection from "../components/CTASection";
import Login from "../components/Login";
import SubjectCarousel from "../components/SubjectCarousel";
// 1. Import the new components
import TestimonialSection from "../components/TestimonialSection";
import Footer from "../components/Footer";

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen relative bg-white">
      {/* ... Hero Section remains the same ... */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-white relative">
        {/* ... (Hero content) ... */}
      </div>

      {/* 2. SOLUTIONS, CTA, SUBJECTS, TESTIMONIALS, FOOTER */}
      <div className={`relative z-10 transition-all duration-500 ${showLogin ? "blur-md" : ""}`}>
        <Solutions />
        <CTASection />

        <section className="max-w-7xl mx-auto px-6 py-20">
          <SubjectCarousel />
        </section>

        {/* 2. Add Testimonials and Footer here */}
        <TestimonialSection />
        <Footer />
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-blue-900/10 backdrop-blur-sm">
          <div className="relative bg-white p-8 rounded-2xl shadow-2xl">
            <button onClick={() => setShowLogin(false)} className="absolute -top-10 right-0 text-gray-800 font-bold hover:text-red-600">Close</button>
            <Login />
          </div>
        </div>
      )}

      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } } .animate-float { animation: float 6s ease-in-out infinite; }`}</style>
    </div>
  );
};

export default Home;