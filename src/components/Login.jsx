import React, { useState, useEffect, useContext } from "react";
import Cog from "../assets/cog.png";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { ConnectContext } from "../context/ConnectContext";

const Login = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ConnectContext);

  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      alert(
        "Account created successfully! If email confirmation is enabled, please verify your email before logging in."
      );

      setIsSignup(false);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account");
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

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4 ${
        darkMode ? "bg-black/60" : "bg-blue-900/10"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl p-8 ${
          darkMode ? "bg-slate-900 text-white" : "bg-white text-black"
        }`}
      >
        <div className="flex justify-center mb-4">
          <img src={Cog} alt="logo" className="w-14 h-14" />
        </div>

        <h2 className="text-center text-2xl font-bold text-blue-600">
          {isSignup ? "Explore as a Genius" : "Welcome back Genius"}
        </h2>

        {error && (
          <p className="text-red-500 text-center mt-3">{error}</p>
        )}

        <form
          onSubmit={isSignup ? handleSignup : handleLogin}
          className="space-y-4 mt-6"
        >
          {isSignup && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-xl"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl"
            required
          />

          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-xl"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Sign Up"
              : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 font-semibold"
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;