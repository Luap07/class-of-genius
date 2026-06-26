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
import About from "./pages/VirtualLab/About";
import Services from "./pages/Services";

/* ================= NOVELS ================= */
import Novels from "./pages/Novels";
import StoryReader from "./pages/StoryReader";
import UploadNovel from "./pages/UploadNovel";

/* ================= AI ================= */
import AITutor from "./pages/AITutor";
import AITutorSession from "./pages/AITutorSession";

/* ================= CBT ================= */
import CBT from "./pages/cbt/CBT";
import SubjectSelect from "./pages/cbt/SubjectSelect";
import CBTExam from "./pages/cbt/CBTExam";

/* ================= LAYOUT ================= */
import DashboardLayout from "./layout/DashboardLayout";

/* ================= 🧪 VIRTUAL LAB ADDED ================= */
import VirtualLabLanding from "./pages/VirtualLab";
import PhysicsLab from "./pages/PhysicsLab";
import ChemistryLab from "./pages/ChemistryLab";
import BiologyLab from "./pages/BiologyLab";
import MathematicsLab from "./pages/MathematicsLab";
import WorkEnergySimulation from "./pages/WorkEnergySimulation";

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

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* HOME */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <PageWrapper><Home /></PageWrapper>
            </>
          }
        />

          {/* LAB */}
          {/* 🧪 VIRTUAL LAB */}
<Route
  path="/lab/physics"
  element={
    <ProtectedRoute>
      <PageWrapper>
        <PhysicsLab />
      </PageWrapper>
    </ProtectedRoute>
  }
/>

<Route
  path="/lab/chemistry"
  element={
    <ProtectedRoute>
      <PageWrapper>
        <ChemistryLab />
      </PageWrapper>
    </ProtectedRoute>
  }
/>

    <Route
     path="/lab/biology"
      element={
    <ProtectedRoute>
      <PageWrapper>
        <BiologyLab />
      </PageWrapper>
       </ProtectedRoute>
       }
    />

    <Route
    path="/lab/mathematics"
    element={
     <ProtectedRoute>
      <PageWrapper>
        <MathematicsLab />
      </PageWrapper>
    </ProtectedRoute>
  }
      />

     
        {/* AUTH */}
        <Route path="/login" element={<Login />} />

        {/* STATIC */}
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />

        {/* AI */}
        <Route path="/ai-tutor" element={<PageWrapper><AITutor /></PageWrapper>} />
        <Route path="/ai-tutor/session" element={<PageWrapper><AITutorSession /></PageWrapper>} />

        {/* NOVELS */}
        <Route path="/novels" element={<PageWrapper><Novels /></PageWrapper>} />
        <Route path="/story/:id" element={<PageWrapper><StoryReader /></PageWrapper>} />
        <Route path="/upload-novel" element={<PageWrapper><UploadNovel /></PageWrapper>} />

        {/* CBT */}
        <Route
          path="/cbt"
          element={
            <ProtectedRoute>
              <PageWrapper><CBT /></PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cbt/exam/:exam"
          element={
            <ProtectedRoute>
              <PageWrapper><SubjectSelect /></PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cbt/exam/:exam/:subject"
          element={
            <ProtectedRoute>
              <PageWrapper><CBTExam /></PageWrapper>
            </ProtectedRoute>
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

        <Route
  path="/lab"
  element={
    <ProtectedRoute>
      <PageWrapper>
        <VirtualLabLanding />
      </PageWrapper>
    </ProtectedRoute>
  }
/>
        {/* DASHBOARD LAYOUT ROUTES */}
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

        {/* ADMIN */}
        <Route
          path="/novels/admin"
          element={
            <ProtectedRoute>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          }
        />

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