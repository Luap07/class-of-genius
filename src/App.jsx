// src/App.jsx

import React, { useState, useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

/* ============================================================
   GENERAL PAGES
============================================================ */

import Terms from "./pages/Terms";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import LearningStats from "./pages/LearningStats";
import ResetPassword from "./pages/ResetPassword";

/* ============================================================
   SCHOOLIQEN ACADEMY
============================================================ */
import AcademyEnvironment from "./pages/academy/AcademyEnvironment";

import TutorEnrollmentLogin from "./pages/academy/TutorEnrollmentLogin";
import StudentEnrollmentLogin from "./pages/academy/StudentEnrollmentLogin";
import StudentEnrollment from "./pages/academy/StudentEnrollment";
import StudentPortal from "./pages/academy/StudentPortal";
import TutorEnrollment from "./pages/academy/TutorEnrollment";

/* ============================================================
   ADMIN
============================================================ */

import Teachers from "./pages/admin/users/Teachers";

/* ============================================================
   TUTOR
============================================================ */

import TutorClassDetails from "./pages/tutor/TutorClassDetails";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import TutorClasses from "./pages/tutor/TutorClasses";
import TutorLayout from "./components/tutor/TutorLayout";

/* ============================================================
   LANGUAGE
============================================================ */

import GrammarReader from "./pages/languages/GrammarReader";
import LanguagesHome from "./pages/languages/LanguagesHome";
import LanguageDetails from "./pages/languages/LanguageDetails";

/* ============================================================
   SCHOOLS
============================================================ */

import Polytechnics from "./pages/Polytechnics/Polytechnics";
import PolytechnicDetails from "./pages/Polytechnics/PolytechnicDetails";

import Colleges from "./pages/colleges/Colleges";
import CollegeDetails from "./pages/colleges/CollegeDetails";

import Universities from "./pages/universities/Universities";
import UniversityDetails from "./pages/universities/UniversityDetails";

/* ============================================================
   ADMIN ROUTES
============================================================ */

import AdminRoutes from "./admin/AdminRoutes";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

/* ============================================================
   COMPONENTS
============================================================ */

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Contact from "./components/Contact";

/* ============================================================
   GENERAL
============================================================ */

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

/* ============================================================
   NOVELS
============================================================ */

import Novels from "./pages/Novels";
import StoryReader from "./pages/StoryReader";
import UploadNovel from "./pages/UploadNovel";
import GenrePayment from "./pages/Payment";

/* ============================================================
   LMS
============================================================ */

import LMSPortal from "./pages/lms/LMSPortal";
import Courses from "./pages/lms/Courses";
import CourseDetails from "./pages/lms/CourseDetails";
import Lesson from "./pages/lms/Lesson";
import VerifyCertificate from "./pages/lms/VerifyCertificate";

import ExploreCategories from "./pages/courses/ExploreCategories";
import ExploreCourses from "./pages/courses/ExploreCourses";
import CategorySubjects from "./pages/courses/CategorySubjects";
import SubjectCourses from "./pages/courses/SubjectCourses";
import CategorySubjectPayment from "./pages/courses/CategorySubjectPayment";

/* ============================================================
   PDF / VIDEO
============================================================ */

import PDFReader from "./pages/courses/PDFReader";
import VideoReader from "./pages/VideoReader";

/* ============================================================
   INSTRUCTOR
============================================================ */

import BecomeInstructorForm from "./pages/instructor/BecomeInstructorForm";

/* ============================================================
   AI
============================================================ */

import AITutor from "./pages/AITutor";
import AITutorSession from "./pages/AITutorSession";

/* ============================================================
   CBT
============================================================ */

import CBT from "./pages/cbt/CBT";
import SubjectSelect from "./pages/cbt/SubjectSelect";
import CBTExam from "./pages/cbt/CBTExam";
import CBTInstruction from "./pages/cbt/CBTInstruction";
import CBTPayment from "./pages/cbt/CBTPayment";

/* ============================================================
   VIRTUAL LAB
============================================================ */

import VirtualLabLanding from "./pages/VirtualLab";
import PhysicsLab from "./pages/PhysicsLab";
import ChemistryLab from "./pages/ChemistryLab";
import BiologyLab from "./pages/BiologyLab";
import MathematicsLab from "./pages/MathematicsLab";
import WorkEnergySimulation from "./pages/WorkEnergySimulation";
import About from "./pages/VirtualLab/About";
import LabPayment from "./pages/VirtualLab/LabPayment";

/* ============================================================
   SUPPORT
============================================================ */

import SupportHome from "./pages/support/SupportHome";
import FAQ from "./pages/support/FAQ";
import ChatSupport from "./pages/support/ChatSupport";

/* ============================================================
   DASHBOARD LAYOUT
============================================================ */

import DashboardLayout from "./layout/DashboardLayout";

/* ============================================================
   API CONFIG
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/* ============================================================
   NORMAL AUTH KEYS
============================================================ */

const AUTH_TOKEN_KEY = "scholiqen_auth_token";
const AUTH_USER_KEY = "scholiqen_current_user";

/* ============================================================
   ACADEMY AUTH KEYS
============================================================ */

const ACADEMY_TOKEN_KEY = "scholiqen_academy_token";
const ACADEMY_USER_KEY = "scholiqen_academy_user";

/* ============================================================
   GET ACADEMY USER
============================================================ */

const getAcademyUser = () => {
  try {
    const raw = localStorage.getItem(ACADEMY_USER_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "Unable to read Academy user:",
      error
    );

    return null;
  }
};

/* ============================================================
   NORMAL PROTECTED ROUTE
============================================================ */

const ProtectedRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        /* ======================================================
           ACADEMY USERS MUST NOT USE NORMAL AUTH
        ====================================================== */

        const academyUser = localStorage.getItem(
          ACADEMY_USER_KEY
        );

        if (academyUser) {
          try {
            const parsedAcademyUser =
              JSON.parse(academyUser);

            const academyUserType = String(
              parsedAcademyUser?.userType ||
                parsedAcademyUser?.user_type ||
                ""
            )
              .trim()
              .toLowerCase();

            if (
              academyUserType === "student" ||
              academyUserType === "tutor"
            ) {
              if (mounted) {
                setAuthenticated(false);
                setCheckingAuth(false);
              }

              return;
            }
          } catch {
            // Ignore invalid Academy session.
          }
        }

        /* ======================================================
           NORMAL TOKEN
        ====================================================== */

        const token = localStorage.getItem(
          AUTH_TOKEN_KEY
        );

        if (!token) {
          if (mounted) {
            setAuthenticated(false);
            setCheckingAuth(false);
          }

          return;
        }

        /* ======================================================
           VERIFY NORMAL TOKEN
        ====================================================== */

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        /* ======================================================
           INVALID NORMAL SESSION
        ====================================================== */

        if (!response.ok) {
          console.warn(
            "Normal authentication session is invalid or expired."
          );

          localStorage.removeItem(
            AUTH_TOKEN_KEY
          );

          localStorage.removeItem(
            AUTH_USER_KEY
          );

          if (mounted) {
            setAuthenticated(false);
            setCheckingAuth(false);
          }

          return;
        }

        /* ======================================================
           VALID NORMAL SESSION
        ====================================================== */

        if (data?.user) {
          localStorage.setItem(
            AUTH_USER_KEY,
            JSON.stringify(data.user)
          );

          if (mounted) {
            setAuthenticated(true);
            setCheckingAuth(false);
          }

          return;
        }

        /* ======================================================
           INVALID USER RESPONSE
        ====================================================== */

        localStorage.removeItem(
          AUTH_TOKEN_KEY
        );

        localStorage.removeItem(
          AUTH_USER_KEY
        );

        if (mounted) {
          setAuthenticated(false);
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error(
          "Protected Route Authentication Error:",
          error
        );

        /* ======================================================
           FALLBACK TO CACHED NORMAL USER
        ====================================================== */

        const cachedUser = localStorage.getItem(
          AUTH_USER_KEY
        );

        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(
              cachedUser
            );

            const cachedUserType =
              parsedUser?.userType ||
              parsedUser?.user_type;

            const normalizedType = String(
              cachedUserType || ""
            )
              .trim()
              .toLowerCase();

            const isAcademyUser =
              normalizedType === "student" ||
              normalizedType === "tutor";

            if (
              !isAcademyUser &&
              parsedUser?.id &&
              mounted
            ) {
              setAuthenticated(true);
              setCheckingAuth(false);

              return;
            }
          } catch {
            // Ignore invalid cached user.
          }
        }

        if (mounted) {
          setAuthenticated(false);
          setCheckingAuth(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     LOADING
  ============================================================ */

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />

          <p className="mt-4 text-sm font-semibold text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     NOT AUTHENTICATED
  ============================================================ */

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

/* ============================================================
   ACADEMY STUDENT PROTECTED ROUTE
============================================================ */

const AcademyProtectedRoute = ({
  children,
}) => {
  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAcademyAuthentication = () => {
      try {
        const token = localStorage.getItem(
          ACADEMY_TOKEN_KEY
        );

        const user = getAcademyUser();

        /* ==================================================
           NO ACADEMY SESSION
        ================================================== */

        if (!token || !user) {
          if (mounted) {
            setAuthenticated(false);
            setCheckingAuth(false);
          }

          return;
        }

        /* ==================================================
           USER TYPE
        ================================================== */

        const userType = String(
          user?.userType ||
            user?.user_type ||
            ""
        )
          .trim()
          .toLowerCase();

        /* ==================================================
           MUST BE STUDENT
        ================================================== */

        if (userType !== "student") {
          if (mounted) {
            setAuthenticated(false);
            setCheckingAuth(false);
          }

          return;
        }

        /* ==================================================
           VALID STUDENT SESSION
        ================================================== */

        if (mounted) {
          setAuthenticated(true);
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error(
          "Academy Student Authentication Error:",
          error
        );

        localStorage.removeItem(
          ACADEMY_TOKEN_KEY
        );

        localStorage.removeItem(
          ACADEMY_USER_KEY
        );

        if (mounted) {
          setAuthenticated(false);
          setCheckingAuth(false);
        }
      }
    };

    checkAcademyAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     LOADING
  ============================================================ */

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading Academy Portal...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     NOT STUDENT
  ============================================================ */

  if (!authenticated) {
    return (
      <Navigate
        to="/academy/student-enrollment-login"
        replace
      />
    );
  }

  return children;
};

/* ============================================================
   ACADEMY TUTOR PROTECTED ROUTE
============================================================ */

const TutorProtectedRoute = ({
  children,
}) => {
  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkTutorAuthentication = () => {
      try {
        const token = localStorage.getItem(
          ACADEMY_TOKEN_KEY
        );

        const user = getAcademyUser();

        /* ==================================================
           NO ACADEMY SESSION
        ================================================== */

        if (!token || !user) {
          console.warn(
            "Tutor route: Academy session not found."
          );

          if (mounted) {
            setAuthenticated(false);
            setCheckingAuth(false);
          }

          return;
        }

        /* ==================================================
           USER TYPE
        ================================================== */

        const userType = String(
          user?.userType ||
            user?.user_type ||
            ""
        )
          .trim()
          .toLowerCase();

        /* ==================================================
           MUST BE TUTOR
        ================================================== */

        if (userType !== "tutor") {
          console.warn(
            "Tutor route: Current Academy user is not a tutor.",
            userType
          );

          if (mounted) {
            setAuthenticated(false);
            setCheckingAuth(false);
          }

          return;
        }

        /* ==================================================
           REFERENCE IS REQUIRED
        ================================================== */

        if (!user?.reference) {
          console.warn(
            "Tutor route: Tutor reference is missing."
          );

          if (mounted) {
            setAuthenticated(false);
            setCheckingAuth(false);
          }

          return;
        }

        /* ==================================================
           VALID TUTOR SESSION
        ================================================== */

        if (mounted) {
          setAuthenticated(true);
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error(
          "Tutor Authentication Error:",
          error
        );

        localStorage.removeItem(
          ACADEMY_TOKEN_KEY
        );

        localStorage.removeItem(
          ACADEMY_USER_KEY
        );

        if (mounted) {
          setAuthenticated(false);
          setCheckingAuth(false);
        }
      }
    };

    checkTutorAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     LOADING
  ============================================================ */

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
        <div className="text-center">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />

            <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-300">
            Loading Tutor Workspace...
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Preparing your teaching environment
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     NOT TUTOR
  ============================================================ */

  if (!authenticated) {
    return (
      <Navigate
        to="/academy/login"
        replace
      />
    );
  }

  return children;
};

/* ============================================================
   PAGE WRAPPER
============================================================ */

const PageWrapper = ({
  children,
}) => {
  return (
    <motion.div
      className="w-full"
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.25,
      }}
    >
      {children}
    </motion.div>
  );
};

/* ============================================================
   TUTOR ERROR FALLBACK
============================================================ */

const TutorFallback = () => {
  return (
    <div className="min-h-screen bg-[#030712] px-6 py-20 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
          🎓
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          Tutor Workspace
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Your tutor account is authenticated,
          but this tutor feature has not been
          connected yet.
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "/academy/tutor";
          }}
          className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          Open Tutor Dashboard
        </button>
      </div>
    </div>
  );
};

/* ============================================================
   ANIMATED ROUTES
============================================================ */

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes
        location={location}
        key={location.pathname}
      >
        {/* =====================================================
            HOME
        ===================================================== */}

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

        {/* =====================================================
            NORMAL LOGIN
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================================================
            NORMAL PROFILE
        ===================================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Profile />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <EditProfile />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            GENERAL
        ===================================================== */}

        <Route
          path="/contact"
          element={
            <PageWrapper>
              <Contact />
            </PageWrapper>
          }
        />

        <Route
          path="/learning-stats"
          element={
            <ProtectedRoute>
              <LearningStats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/terms"
          element={<Terms />}
        />

        <Route
          path="/privacy"
          element={<Privacy />}
        />

        <Route
          path="/help"
          element={<Help />}
        />

        <Route
          path="/settings"
          element={<Settings />}
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
          path="/about"
          element={
            <PageWrapper>
              <About />
            </PageWrapper>
          }
        />

        {/* =====================================================
            SCHOLIQEN ACADEMY
        ===================================================== */}

        {/* -----------------------------------------------------
            ACADEMY ENVIRONMENT

            THIS IS THE IMPORTANT ROUTE.

            /academy DOES NOT GO TO ENROLLMENT.
        ----------------------------------------------------- */}

        <Route
          path="/academy"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <AcademyEnvironment />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* -----------------------------------------------------
            STUDENT LOGIN
        ----------------------------------------------------- */}

        <Route
          path="/academy/student-enrollment-login"
          element={
            <PageWrapper>
              <StudentEnrollmentLogin />
            </PageWrapper>
          }
        />

        {/* -----------------------------------------------------
            STUDENT ENROLLMENT
        ----------------------------------------------------- */}

        <Route
          path="/academy/student-enrollment"
          element={
            <PageWrapper>
              <StudentEnrollment />
            </PageWrapper>
          }
        />

        {/* -----------------------------------------------------
            STUDENT PORTAL
        ----------------------------------------------------- */}

        <Route
          path="/academy/student-portal"
          element={
            <AcademyProtectedRoute>
              <PageWrapper>
                <StudentPortal />
              </PageWrapper>
            </AcademyProtectedRoute>
          }
        />

        {/* -----------------------------------------------------
            TUTOR REGISTRATION
        ----------------------------------------------------- */}

        <Route
          path="/academy/tutor-register"
          element={
            <PageWrapper>
              <TutorEnrollment />
            </PageWrapper>
          }
        />

        {/* -----------------------------------------------------
            TUTOR LOGIN
        ----------------------------------------------------- */}

        <Route
          path="/academy/login"
          element={
            <PageWrapper>
              <TutorEnrollmentLogin />
            </PageWrapper>
          }
        />

        {/* -----------------------------------------------------
            TUTOR DASHBOARD
        ----------------------------------------------------- */}

        <Route
          path="/academy/tutor"
          element={
            <TutorProtectedRoute>
              <TutorLayout>
                <TutorDashboard />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* -----------------------------------------------------
            TUTOR CLASSES
        ----------------------------------------------------- */}

        <Route
          path="/academy/tutor/classes"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="My Classes">
                <TutorClasses />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* -----------------------------------------------------
            TUTOR CLASS DETAILS
        ----------------------------------------------------- */}

        <Route
          path="/academy/tutor/classes/:grade"
          element={
            <TutorProtectedRoute>
              <TutorLayout>
                <TutorClassDetails />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* -----------------------------------------------------
            FUTURE TUTOR ROUTES

            This must come AFTER the specific tutor routes.
        ----------------------------------------------------- */}

        <Route
          path="/academy/tutor/*"
          element={
            <TutorProtectedRoute>
              <TutorLayout>
                <TutorFallback />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            ADMIN TEACHERS
        ===================================================== */}

        <Route
          path="/admin/users/teachers"
          element={
            <ProtectedRoute>
              <Teachers />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            LANGUAGE
        ===================================================== */}

        <Route
          path="/languages"
          element={
            <LanguagesHome />
          }
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

        {/* =====================================================
            SUPPORT
        ===================================================== */}

        <Route
          path="/support"
          element={
            <SupportHome />
          }
        />

        <Route
          path="/support/chat"
          element={
            <ChatSupport />
          }
        />

        <Route
          path="/support/faq"
          element={
            <FAQ />
          }
        />

        {/* =====================================================
            AI TUTOR
        ===================================================== */}

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

        {/* =====================================================
            NOVELS
        ===================================================== */}

        <Route
          path="/novels"
          element={
            <PageWrapper>
              <Novels />
            </PageWrapper>
          }
        />

        <Route
          path="/genre-payment/:genre"
          element={
            <PageWrapper>
              <GenrePayment />
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

        {/* =====================================================
            INSTRUCTOR
        ===================================================== */}

        <Route
          path="/become-instructor"
          element={
            <BecomeInstructorForm />
          }
        />

        {/* =====================================================
            CERTIFICATE
        ===================================================== */}

        <Route
          path="/verify/:certificate_number"
          element={
            <VerifyCertificate />
          }
        />

        {/* =====================================================
            CONTACT INBOX
        ===================================================== */}

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

        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminRoutes />
            </ProtectedAdminRoute>
          }
        />

        {/* =====================================================
            DASHBOARD LAYOUT
        ===================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/libraries"
            element={
              <Libraries />
            }
          />

          <Route
            path="/downloads"
            element={
              <Downloads />
            }
          />

          <Route
            path="/history"
            element={
              <History />
            }
          />

          <Route
            path="/connects"
            element={
              <Connects />
            }
          />

          <Route
            path="/requests"
            element={
              <Requests />
            }
          />

          <Route
            path="/connections"
            element={
              <Connections />
            }
          />
        </Route>

        {/* =====================================================
            VIRTUAL LAB
        ===================================================== */}

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
          path="/lab/payment/:subject"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <LabPayment />
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

        {/* =====================================================
            PDF READER
        ===================================================== */}

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

        {/* =====================================================
            VIDEO READER
        ===================================================== */}

        <Route
          path="/video/:id"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <VideoReader />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            CBT
        ===================================================== */}

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
          path="/cbt/payment/:exam"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CBTPayment />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cbt/instruction"
          element={
            <ProtectedRoute>
              <CBTInstruction />
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
          path="/cbt/start"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CBTExam />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            LMS
        ===================================================== */}

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

        {/* =====================================================
            COURSES
        ===================================================== */}

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
          path="/courses/category/:categoryId/payment"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <CategorySubjectPayment />
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

        {/* =====================================================
            UNIVERSITIES
        ===================================================== */}

        <Route
          path="/universities"
          element={
            <Universities />
          }
        />

        <Route
          path="/universities/:id"
          element={
            <UniversityDetails />
          }
        />

        {/* =====================================================
            COLLEGES
        ===================================================== */}

        <Route
          path="/colleges"
          element={
            <Colleges />
          }
        />

        <Route
          path="/colleges/:id"
          element={
            <CollegeDetails />
          }
        />

        {/* =====================================================
            POLYTECHNICS
        ===================================================== */}

        <Route
          path="/polytechnics"
          element={
            <Polytechnics />
          }
        />

        <Route
          path="/polytechnics/:id"
          element={
            <PolytechnicDetails />
          }
        />

        {/* =====================================================
            404
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

/* ============================================================
   APP
============================================================ */

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;