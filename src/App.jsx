import { useContext } from "react";
import AdminDashboard from "./pages/AdminDashboard";
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
import Services from "./pages/Services";

/* ================= NOVELS ================= */
import Novels from "./pages/Novels";
import StoryReader from "./pages/StoryReader";
import UploadNovel from "./pages/UploadNovel";

/* ================= AI ================= */
import AITutor from "./pages/AITutor";
import AITutorSession from "./pages/AITutorSession";

/* ================= CBT ================= */
import ExamDashboard from "./pages/CBT/ExamDashboard.jsx";
import CBTSession from "./pages/CBT/CBTSession.jsx";
import ExamSelect from "./pages/CBT/ExamSelect.jsx";

/* 🔥 FIXED CBT ADMIN IMPORTS */
import SubjectUploader from "./pages/CBT/SubjectUploder.jsx";
import AdminQuestionUploader from "./pages/CBT/AdminQuestionUploader.jsx";

/* ================= LAYOUT ================= */
import DashboardLayout from "./layout/DashboardLayout";

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

/* ================= PAGE WRAPPER ================= */
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="w-full"
  >
    {children}
  </motion.div>
);

/* ================= ROUTES ================= */
const AnimatedRoutes = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/cbt");

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* HOME */}
        <Route
          path="/"
          element={
            <>
              {!hideNavbar && <Navbar />}
              <PageWrapper><Home /></PageWrapper>
            </>
          }
        />

        {/* ADMIN NOVELS */}
        <Route
          path="/novels/admin"
          element={
            <ProtectedRoute>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* STATIC PAGES */}
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />

        {/* NOVELS */}
        <Route path="/novels" element={<PageWrapper><Novels /></PageWrapper>} />
        <Route path="/story/:id" element={<PageWrapper><StoryReader /></PageWrapper>} />
        <Route path="/upload-novel" element={<PageWrapper><UploadNovel /></PageWrapper>} />

        {/* AI */}
        <Route path="/ai-tutor" element={<PageWrapper><AITutor /></PageWrapper>} />
        <Route path="/ai-tutor/session" element={<AITutorSession />} />

        {/* CBT MAIN */}
        <Route path="/cbt" element={<PageWrapper><ExamDashboard /></PageWrapper>} />
        <Route path="/cbt/select" element={<PageWrapper><ExamSelect /></PageWrapper>} />
        <Route path="/cbt/session/:examType" element={<PageWrapper><CBTSession /></PageWrapper>} />

        {/* ✅ CBT ADMIN ROUTES (FIXED) */}
        <Route
          path="/cbt/admin/subjects"
          element={
            <ProtectedRoute>
              <PageWrapper><SubjectUploader /></PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cbt/admin/questions"
          element={
            <ProtectedRoute>
              <PageWrapper><AdminQuestionUploader /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* PROTECTED */}
        <Route
          path="/contact-inbox"
          element={
            <ProtectedRoute>
              <PageWrapper><ContactInbox /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* DASHBOARD LAYOUT */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="libraries" element={<Libraries />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="history" element={<History />} />
          <Route path="connects" element={<Connects />} />
          <Route path="requests" element={<Requests />} />
          <Route path="connections" element={<Connections />} />
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