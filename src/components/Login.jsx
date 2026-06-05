import React, { useState, useEffect } from "react";
import Cog from "../assets/cog.png";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [isSignup]);

  // ✅ SIGN UP
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCred.user, {
        displayName: username,
      });

      alert("Account created successfully!");

      setIsSignup(false);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // ✅ LOGIN (FIXED NAVIGATION)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      // 🔥 FIX: GO TO DASHBOARD
      navigate("/dashboard");

    } catch (err) {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-900/10 backdrop-blur-sm z-50 p-4">

      {/* CARD */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8">

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src={Cog} className="w-12 h-12" alt="logo" />
        </div>

        {/* TITLE */}
        <h2 className="text-center text-2xl font-bold text-blue-600">
          {isSignup ? "Explore as a Genius" : "Welcome back Genius"}
        </h2>

        <p className="text-center text-gray-500 mt-1 mb-6">
          {isSignup
            ? "Create your account to start learning"
            : "Sign in to continue your journey"}
        </p>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* FORM */}
        <form
          onSubmit={isSignup ? handleSignup : handleLogin}
          className="space-y-4"
        >
          {isSignup && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none text-gray-700"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none text-gray-700"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none text-gray-700 pr-16"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-semibold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* CONFIRM PASSWORD (SIGNUP ONLY) */}
          {isSignup && (
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none text-gray-700"
            />
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* SWITCH */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className="text-blue-600 font-semibold underline cursor-pointer"
              >
                Login
              </button>
            </p>
          ) : (
            <p>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className="text-blue-600 font-semibold underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;