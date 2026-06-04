import { useContext } from "react";
import { StudyContext } from "../context/StudyContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(StudyContext);

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to your Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Hello, <span className="font-semibold text-purple-700">{user.email}</span>! 
          You are now successfully logged into the Class Of Genius platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-2">My Progress</h3>
            <p className="text-gray-500">Track your learning journey here.</p>
          </div>
          <div className="p-6 border rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-2">Recent Courses</h3>
            <p className="text-gray-500">Access your saved material.</p>
          </div>
        </div>

        <button 
          onClick={logout} 
          className="mt-8 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;