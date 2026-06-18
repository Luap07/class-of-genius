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

  /* ================= RESET FIELDS ================= */
  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [isSignup]);

  /* ================= SIGN UP ================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Account created successfully 🎉 Check your email!");
      setIsSignup(false);
    }

    setLoading(false);
  };

  /* ================= LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  /* ================= FORGOT PASSWORD ================= */
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: "http://localhost:5173/reset-password",
      }
    );

    if (error) {
      setError(error.message);
    } else {
      alert("Reset link sent to your email 📩");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0b1220] to-[#05070f]" />

      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[150px] top-0 left-0" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 blur-[150px] bottom-0 right-0" />

      {/* CARD */}
      <div className="relative w-full max-w-md rounded-3xl p-8 backdrop-blur-2xl border border-white/10 bg-white/5 shadow-2xl">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-3">
          <img src={Cog} className="w-20 h-20 animate-pulse" />
          <h2 className="text-xl font-bold text-gray-200">
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
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10"
              required
            />
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10"
            required
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer right-4 top-3 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          {isSignup && (
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10"
              required
            />
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 cursor-pointer rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        {/* FORGOT PASSWORD */}
        {!isSignup && (
          <p
            onClick={handleForgotPassword}
            className="text-center text-sm text-blue-400 mt-4 cursor-pointer hover:text-blue-300"
          >
            Forgot Password?
          </p>
        )}

        {/* TOGGLE */}
        <div className="mt-6 text-center">
          <p className="text-sm justify-center gap-1 flex text-gray-400">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}
          

          <button
            onClick={() => setIsSignup(!isSignup)}
            className=" text-blue-400 cursor-pointer font-semibold"
          >
            {isSignup ? "Login here" : "Create one"}
          </button> </p>
        </div>

        {/* FOOTER */}
        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-500">
          Secure authentication powered by Scholiqen
        </div>
      </div>
    </div>
  );
};

export default Login;