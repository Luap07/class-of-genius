import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import GrammarReader from "./pages/languages/GrammarReader";
import { AnimatePresence, motion } from "framer-motion";

/* =========================== CONTEXTS =========================== */

import { AuthContext } from "./context/AuthContext";
import { CourseProvider } from "./context/LMSContext/CourseContext";
import { SearchProvider } from "./context/SearchContext";
import { DocumentProvider } from "./context/DocumentContext";

/* ===========================LANGUAGE=========================== */
import LanguagesHome from "./pages/languages/LanguagesHome";
import LanguageDetails from "./pages/languages/LanguageDetails";

/* ===========================ADMIN=========================== */

import AdminRoutes from "./admin/AdminRoutes";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

/* =========================== COMPONENTS =========================== */

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Contact from "./components/Contact";

/* =========================== GENERAL PAGES=========================== */

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Libraries from "./pages/Libraries";
import Downloads from "./pages/Downloads";
import History from "./pages/History";
import Connects from "./pages/Connects";
import Requests from "./pages/Requests";
import Connections from "./pages/Connections";
import Services from "./pages/Services";
import ContactInbox from "./pages/ContactInbox";

/* ===========================
   NOVELS
=========================== */

import Novels from "./pages/Novels";
import StoryReader from "./pages/StoryReader";
import UploadNovel from "./pages/UploadNovel";

/* ===========================  LMS=========================== */
import LMSPortal from "./pages/lms/LMSPortal";
import Courses from "./pages/lms/Courses";
import CourseDetails from "./pages/lms/CourseDetails";
import Lesson from "./pages/lms/Lesson";
import VerifyCertificate from "./pages/lms/VerifyCertificate";
import PDFReader from "./pages/courses/PDFReader";
import ExploreCategories from "./pages/courses/ExploreCategories";
import ExploreCourses from "./pages/courses/ExploreCourses";
import CategorySubjects from "./pages/courses/CategorySubjects";
import SubjectCourses from "./pages/courses/SubjectCourses";

import BecomeInstructorForm from "./pages/instructor/BecomeInstructorForm";

/* =========================== AI ========================== */

import AITutor from "./pages/AITutor";
import AITutorSession from "./pages/AITutorSession";

/* ===========================  CBT ========================== */

import CBT from "./pages/cbt/CBT";
import SubjectSelect from "./pages/cbt/SubjectSelect";
import CBTExam from "./pages/cbt/CBTExam";

/* =========================== VIRTUAL LAB ========================== */

import VirtualLabLanding from "./pages/VirtualLab";
import PhysicsLab from "./pages/PhysicsLab";
import ChemistryLab from "./pages/ChemistryLab";
import BiologyLab from "./pages/BiologyLab";
import MathematicsLab from "./pages/MathematicsLab";
import WorkEnergySimulation from "./pages/WorkEnergySimulation";
import About from "./pages/VirtualLab/About";

/* ===========================
   SUPPORT
=========================== */

import SupportHome from "./pages/support/SupportHome";
import FAQ from "./pages/support/FAQ";
import ChatSupport from "./pages/support/ChatSupport";

/* ===========================
   LAYOUT
=========================== */

import DashboardLayout from "./layout/DashboardLayout";

/* ============================================================
   PROTECTED ROUTE
============================================================ */

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

/* ============================================================
   PAGE WRAPPER
============================================================ */

const PageWrapper = ({ children }) => (
  <motion.div
    className="w-full"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

/* ============================================================
   ROUTES
============================================================ */

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes
        location={location}
        key={location.pathname}
      >
                {/* ================= HOME ================= */}

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

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/contact"
          element={
            <PageWrapper>
              <Contact />
            </PageWrapper>
          }
        />

        <Route
          path="/about"
          element={
            <PageWrapper>
              <About />
            </PageWrapper>
          }
        />

        <Route
          path="/services"
          element={
            <PageWrapper>
              <Services />
            </PageWrapper>
          }
        />

<Route
  path="/languages"
  element={<LanguagesHome />}
/>

<Route
  path="/languages/:id"
  element={
    <PageWrapper>
      <LanguageDetails />
    </PageWrapper>
  }
/>

<Route
  path="/grammar/:id"
  element={
    <ProtectedRoute>
      <PageWrapper>
        <GrammarReader />
      </PageWrapper>
    </ProtectedRoute>
  }
/>
        {/* ================= SUPPORT ================= */}

        <Route
          path="/support"
          element={<SupportHome />}
        />

        <Route
          path="/support/chat"
          element={<ChatSupport />}
        />

        <Route
          path="/support/faq"
          element={<FAQ />}
        />

        {/* ================= AI ================= */}

        <Route
          path="/ai-tutor"
          element={
            <PageWrapper>
              <AITutor />
            </PageWrapper>
          }
        />

        <Route
          path="/ai-tutor/session"
          element={
            <PageWrapper>
              <AITutorSession />
            </PageWrapper>
          }
        />

        {/* ================= NOVELS ================= */}

        <Route
          path="/novels"
          element={
            <PageWrapper>
              <Novels />
            </PageWrapper>
          }
        />

        <Route
          path="/story/:id"
          element={
            <PageWrapper>
              <StoryReader />
            </PageWrapper>
          }
        />

        <Route
          path="/upload-novel"
          element={
            <PageWrapper>
              <UploadNovel />
            </PageWrapper>
          }
        />

        {/* ================= INSTRUCTOR ================= */}

        <Route
          path="/become-instructor"
          element={<BecomeInstructorForm />}
        />

        {/* ================= VERIFY CERTIFICATE ================= */}

        <Route
          path="/verify/:certificate_number"
          element={<VerifyCertificate />}
        />

        {/* ================= CONTACT INBOX ================= */}

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

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminRoutes />
            </ProtectedAdminRoute>
          }
        />
                {/* ================= DASHBOARD LAYOUT ================= */}

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

          <Route
            path="/requests"
            element={<Requests />}
          />

          <Route
            path="/connections"
            element={<Connections />}
          />
        </Route>

        {/* ================= VIRTUAL LAB ================= */}

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

        <Route
          path="/lab/work-energy"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <WorkEnergySimulation />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* PDF */}
        <Route
  path="/pdf/:id"
  element={
    <ProtectedRoute>
      <PageWrapper>
        <PDFReader />
      </PageWrapper>
    </ProtectedRoute>
  }
/>

        {/* ================= CBT ================= */}

        <Route
          path="/cbt"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CBT />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cbt/exam/:exam"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <SubjectSelect />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cbt/exam/:exam/:subject"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CBTExam />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
                {/* ================= LMS ================= */}

        <Route
          path="/lms"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <LMSPortal />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lms/courses"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Courses />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Courses />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <ExploreCategories />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <ExploreCourses />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
  path="/courses/category/:categoryId"
  element={
    <ProtectedRoute>
      <PageWrapper>
        <CategorySubjects />
      </PageWrapper>
    </ProtectedRoute>
  }
/>
        <Route
          path="/courses/:category/:subject"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <SubjectCourses />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CourseDetails />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CourseDetails />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lms/course/:id"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CourseDetails />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lms/course/:id/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Lesson />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
              </Routes>
    </AnimatePresence>
  );
};

/* ==========================================================
   APP
========================================================== */

function App() {
  return (
    <SearchProvider>
      <CourseProvider>
        <DocumentProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </DocumentProvider>
      </CourseProvider>
    </SearchProvider>
  );
}

export default App;