import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthContext, AuthProvider } from "./context/AuthContext";
import { ConnectProvider } from "./context/ConnectContext";
import { DocumentProvider } from "./context/DocumentContext";
import { SearchProvider } from "./context/SearchContext";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Libraries from "./pages/Libraries";
import Downloads from "./pages/Downloads";
import Connects from "./pages/Connects";
import Requests from "./pages/Requests";
import Connections from "./pages/Connections";
import History from "./pages/History";

import DashboardLayout from "./layout/DashboardLayout";

/* ================= PROTECTED ROUTE ================= */

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

/* ================= APP ================= */

function App() {
  return (
    <AuthProvider>
      <ConnectProvider>
        <SearchProvider>
          <DocumentProvider>
            <Router>
              <Routes>

                {/* PUBLIC ROUTES */}
                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/"
                  element={
                    <>
                      <Navbar />
                      <Home />
                    </>
                  }
                />

                {/* PROTECTED ROUTES WRAPPED PROPERLY */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="dashboard"
                    element={<Dashboard />}
                  />

                  <Route
                    path="libraries"
                    element={<Libraries />}
                  />

                  <Route
                    path="downloads"
                    element={<Downloads />}
                  />

                  <Route
                    path="history"
                    element={<History />}
                  />

                  <Route
                    path="connects"
                    element={<Connects />}
                  />

                  <Route
                    path="requests"
                    element={<Requests />}
                  />

                  <Route
                    path="connections"
                    element={<Connections />}
                  />
                </Route>

                {/* FALLBACK */}
                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />

              </Routes>
            </Router>
          </DocumentProvider>
        </SearchProvider>
      </ConnectProvider>
    </AuthProvider>
  );
}

export default App;