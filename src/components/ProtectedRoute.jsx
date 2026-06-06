import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StudyContext } from "../context/StudyContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(StudyContext);

  // 🔥 WAIT FOR FIREBASE TO FINISH CHECKING AUTH
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔥 NOT LOGGED IN → REDIRECT
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 LOGGED IN → ALLOW ACCESS
  return children;
};

export default ProtectedRoute;