import React from "react";
import logo from "../assets/logo.png"; // change to your real logo path

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#05070f] overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3b82f6_0%,transparent_60%)] opacity-20 animate-pulse" />

      {/* FLOATING BUBBLES */}
      <div className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-bounce-slow top-20 left-20" />
      <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse top-40 right-20" />
      <div className="absolute w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-bounce-slow bottom-20 left-1/3" />

      {/* LOGO CONTAINER */}
      <div className="relative flex items-center justify-center">

        {/* ROTATING GRADIENT RING */}
        <div className="absolute w-40 h-40 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow blur-sm opacity-70" />

        {/* INNER GLOW RING */}
        <div className="absolute w-32 h-32 rounded-full bg-white/5 blur-xl animate-pulse" />

        {/* LOGO */}
        <img
          src={logo}
          alt="logo"
          className="w-20 h-20 object-contain z-10 animate-bounce"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;