import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // clear fields when switching mode
  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, [isSignup]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: username,
      });

      await sendEmailVerification(userCredential.user);

      alert("Account created! Check your email for verification.");

      setIsSignup(false);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      alert("Login successful!");
    } catch (err) {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #2563eb 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      {/* Blur */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/20" />

      {/* Card */}
      <div className="relative z-[60] w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">

          <h1 className="text-3xl font-bold text-center text-blue-600">
            Class Of Genius
          </h1>

          <p className="text-center text-slate-500 mt-2 mb-6">
            {isSignup ? "Create your account" : "Welcome back"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form
            autoComplete="off"
            onSubmit={isSignup ? handleSignup : handleLogin}
            className="space-y-4"
          >

            {isSignup && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                autoComplete="off"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl pr-16 outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-semibold"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {isSignup && (
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              />
            )}

            {!isSignup && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create Account"
                : "Login"}
            </button>
          </form>

          {/* TOGGLE LINKS */}
          <div className="mt-6 text-center text-slate-600">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className="text-blue-600 font-semibold underline cursor-pointer hover:text-blue-700"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className="text-blue-600 font-semibold underline cursor-pointer hover:text-blue-700"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;