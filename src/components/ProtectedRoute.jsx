import React from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const {
    user,
    loading,
  } = useAuth();

  const location = useLocation();

  /*
    IMPORTANT:

    While AuthContext is checking the saved JWT,
    DO NOT redirect to /login.

    This prevents the authentication race condition.
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-full border-4 border-white/10" />

            <div className="absolute inset-0 w-11 h-11 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          </div>

          <p className="text-sm text-white/60">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  /*
    Authentication check is finished.

    ONLY NOW do we decide whether the user
    should be redirected.
  */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
    User is authenticated.
    Allow the protected page to render.
  */

  return children;
};

export default ProtectedRoute;