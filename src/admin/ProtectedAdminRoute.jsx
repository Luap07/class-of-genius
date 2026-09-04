import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const {
    user,
    profile,
    loading,
  } = useContext(AuthContext);

  // Wait for Neon authentication check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070f] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="text-sm font-medium text-slate-300">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Neon role
  const role = profile?.role || user?.role;

  // Logged in but not admin
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin
  return children;
};

export default ProtectedAdminRoute;