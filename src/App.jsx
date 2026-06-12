import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

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
import Contact from "./components/Contact";

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

/* ================= PAGE WRAPPER ================= */

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

/* ================= ROUTES COMPONENT (IMPORTANT) ================= */

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <>
              <Navbar />
              <PageWrapper>
                <Home />
              </PageWrapper>
            </>
          }
        />

        {/* CONTACT PAGE */}
        <Route
          path="/contact"
          element={
            <PageWrapper>
              <Contact />
            </PageWrapper>
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="libraries" element={<PageWrapper><Libraries /></PageWrapper>} />
          <Route path="downloads" element={<PageWrapper><Downloads /></PageWrapper>} />
          <Route path="history" element={<PageWrapper><History /></PageWrapper>} />
          <Route path="connects" element={<PageWrapper><Connects /></PageWrapper>} />
          <Route path="requests" element={<PageWrapper><Requests /></PageWrapper>} />
          <Route path="connections" element={<PageWrapper><Connections /></PageWrapper>} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  );
};

/* ================= APP ================= */

function App() {
  return (
    <AuthProvider>
      <ConnectProvider>
        <SearchProvider>
          <DocumentProvider>
            <Router>
              <AnimatedRoutes />
            </Router>
          </DocumentProvider>
        </SearchProvider>
      </ConnectProvider>
    </AuthProvider>
  );
}

export default App;