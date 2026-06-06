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

  // SIGN UP
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(userCred.user, {
        displayName: username,
      });

      setIsSignup(false);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/dashboard", { replace: true }); // ✅ go straight to dashboard
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.log(err);

      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;

        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Try again later.");
          break;

        default:
          setError(err.message);
      }
    } finally {
      setLoading(false); // 🔥 THIS FIXES YOUR "LOADING FOREVER" ISSUE
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-900/10 backdrop-blur-sm z-50 p-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src={Cog} alt="logo" className="w-14 h-14" />
        </div>

        {/* TITLE */}
        <h2 className="text-center text-2xl font-bold text-blue-600">
          {isSignup ? "Explore as a Genius" : "Welcome back Genius"}
        </h2>

        <p className="text-center text-gray-500 mt-2 mb-6">
          {isSignup
            ? "Create your account to start learning"
            : "Sign in to continue your journey"}
        </p>

        {error && (
          <div className="mb-4 text-center text-red-500 text-sm">
            {error}
          </div>
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
              className="w-full p-3 border rounded-xl"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />

          {isSignup && (
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-xl"
            />
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* SWITCH */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isSignup ? (
            <button
              onClick={() => setIsSignup(false)}
              className="text-blue-600 font-semibold"
            >
              Already have an account? Login
            </button>
          ) : (
            <button
              onClick={() => setIsSignup(true)}
              className="text-blue-600 font-semibold"
            >
              Don’t have an account? Sign Up
            </button>
          )}
        </div>

      </div>
    </div>
  );
};


export default Login;