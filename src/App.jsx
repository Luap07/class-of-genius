import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { DocumentProvider } from "./context/DocumentContext";
import { SearchProvider } from "./context/SearchContext";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Libraries from "./pages/Libraries";
import Downloads from "./pages/Downloads";
import Connects from "./pages/Connects";
import History from "./pages/History";

import DashboardLayout from "./layout/DashboardLayout";

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

/* ================= PUBLIC LAYOUT (FIXED NAVBAR ISSUE) ================= */
const PublicLayout = () => {
  const location = useLocation();

  return (
    <div>
      {/* NAVBAR ALWAYS SHOWS HERE */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

/* ================= APP ================= */
function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <DocumentProvider>
          <Router>
            <Routes>

              {/* PUBLIC ROUTES */}
              <Route path="/*" element={<PublicLayout />} />

              {/* DASHBOARD (NO NAVBAR HERE — ONLY SIDEBAR + HEADER) */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/libraries" element={<Libraries />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/history" element={<History />} />
                <Route path="/connects" element={<Connects />} />
              </Route>

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Router>
        </DocumentProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;