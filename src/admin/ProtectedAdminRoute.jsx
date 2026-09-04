import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const auth = useContext(AuthContext);

  // Prevent crashing if AuthProvider is missing
  if (!auth) {
    console.error(
      "ProtectedAdminRoute: AuthContext is unavailable. " +
        "Make sure App is wrapped with <AuthProvider>."
    );

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">
            Authentication configuration error
          </h1>

          <p className="text-slate-400">
            AuthProvider is not available.
          </p>
        </div>
      </div>
    );
  }

  const {
    user,
    profile,
    loading,
  } = auth;

  // Don't redirect while authentication is being restored
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-400">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  // No authenticated user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role
  const role = String(
    profile?.role ||
      user?.role ||
      ""
  )
    .trim()
    .toLowerCase();

  console.log("Admin route authentication:", {
    user,
    profile,
    role,
  });

  // Authenticated but not admin
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;