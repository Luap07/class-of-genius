import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);   // ✅ logout from Firebase
    navigate("/");         // ✅ send back to landing page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">

        <h1 className="text-3xl font-bold mb-4">
          Welcome to Dashboard
        </h1>

        <p className="text-gray-600 mb-6">
          Hello <span className="font-semibold">{user?.email}</span>
        </p>

        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Dashboard;