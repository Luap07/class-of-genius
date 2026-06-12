import React, { useState, useEffect, useContext } from "react";
import Cog from "../assets/cog.png";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { ConnectContext } from "../context/ConnectContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ConnectContext);

  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [isSignup]);

  // ================= SIGN UP =================
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { username } },
      });

      if (error) throw error;

      alert("Account created successfully!");
      setIsSignup(false);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">

      {/* 🌟 PROFESSIONAL BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#05070f]" />

      {/* glow effects */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[150px] top-0 left-0" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 blur-[150px] bottom-0 right-0" />

      {/* GLASS CARD */}
      <div className="relative w-full max-w-md rounded-3xl p-8 backdrop-blur-2xl border border-white/10 bg-white/5 shadow-2xl">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <img src={Cog} className="w-14 h-14 animate-pulse" />
          <h2 className="text-xl font-bold mt-2 text-white">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-400">
            Scholiqen Learning Platform
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-400 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={isSignup ? handleSignup : handleLogin}
          className="space-y-4"
        >

          {/* USERNAME */}
          {isSignup && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-blue-500"
              required
            />
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-blue-500"
            required
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-blue-500"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
                    {/* CONFIRM PASSWORD (SIGNUP ONLY) */}
          {isSignup && (
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none border border-white/10 focus:border-blue-500"
              required
            />
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        {/* TOGGLE SIGNUP / LOGIN */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}
          </p>

          <button
            onClick={() => setIsSignup(!isSignup)}
            className="mt-2 text-blue-400 font-semibold hover:text-blue-300 transition"
          >
            {isSignup ? "Login here" : "Create one"}
          </button>
        </div>

        {/* FOOTER LINE */}
        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-500">
          Secure login powered by Scholiqen
        </div>
      </div>
    </div>
  );
};

export default Login;