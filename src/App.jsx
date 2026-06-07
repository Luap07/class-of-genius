import { useContext } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { DocumentProvider } from "./context/DocumentContext";
import { SearchProvider } from "./context/SearchContext";
import { ConnectProvider } from "./context/ConnectContext";

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

/* ================= PUBLIC LAYOUT ================= */

const PublicLayout = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

/* ================= APP ================= */

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <DocumentProvider>
          <ConnectProvider>
            <Router>
              <Routes>
                {/* PUBLIC */}
                <Route path="/*" element={<PublicLayout />} />

                {/* PROTECTED */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="/dashboard"
                    element={<Dashboard />}
                  />

                  <Route
                    path="/libraries"
                    element={<Libraries />}
                  />

                  <Route
                    path="/downloads"
                    element={<Downloads />}
                  />

                  <Route
                    path="/history"
                    element={<History />}
                  />

                  <Route
                    path="/connects"
                    element={<Connects />}
                  />
                </Route>

                {/* FALLBACK */}
                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />
              </Routes>
            </Router>
          </ConnectProvider>
        </DocumentProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;