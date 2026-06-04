import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StudyContext } from "../context/StudyContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(StudyContext);

  // If there is no user, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user exists, return the children (the page they wanted to visit)
  return children;
};

export default ProtectedRoute;