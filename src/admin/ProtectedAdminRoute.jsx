import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const ProtectedAdminRoute = ({ children }) => {

  const {
    user,
    profile,
    loading
  } = useContext(AuthContext);



  // Wait until auth/profile check finishes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070f] text-white">
        Checking access...
      </div>
    );
  }



  // User not logged in
  if (!user) {
    return (
      <Navigate to="/login" replace />
    );
  }



  // User logged in but not admin
  if (profile?.role !== "admin") {
    return (
      <Navigate to="/" replace />
    );
  }



  // Admin allowed
  return children;

};


export default ProtectedAdminRoute;