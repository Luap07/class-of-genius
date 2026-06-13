import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

/* ================= CONTEXTS ================= */
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { ConnectProvider } from "./context/ConnectContext";
import { DocumentProvider } from "./context/DocumentContext";
import { SearchProvider } from "./context/SearchContext";

/* ================= COMPONENTS ================= */
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Contact from "./components/Contact";
import ContactInbox from "./pages/ContactInbox";

/* ================= PAGES ================= */
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Libraries from "./pages/Libraries";
import Downloads from "./pages/Downloads";
import Connects from "./pages/Connects";
import Requests from "./pages/Requests";
import Connections from "./pages/Connections";
import History from "./pages/History";
import About from "./pages/About";
import Services from "./pages/Services"; // ✅ ADDED

/* ================= LAYOUT ================= */
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

/* ================= ROUTES ================= */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* PUBLIC ROUTES */}
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

        <Route path="/login" element={<Login />} />

        <Route
          path="/contact"
          element={
            <PageWrapper>
              <Contact />
            </PageWrapper>
          }
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <PageWrapper>
                <About />
              </PageWrapper>
            </>
          }
        />

        {/* SERVICES (NEW) */}
        <Route
          path="/services"
          element={
            <>
              <Navbar />
              <PageWrapper>
                <Services />
              </PageWrapper>
            </>
          }
        />

        {/* CONTACT INBOX */}
        <Route
          path="/contact-inbox"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <ContactInbox />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* DASHBOARD (PROTECTED) */}
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