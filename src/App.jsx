// src/App.jsx

import React from "react";
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
   SCHOLIQEN ACADEMY
============================================================ */

import StudentTaskSubmission from "./pages/academy/StudentTaskSubmission";
import AcademyEnvironment from "./pages/academy/AcademyEnvironment";
import Academy from "./pages/Academy";
import Academics from "./pages/academy/Academics";
import TutorEnrollmentLogin from "./pages/academy/TutorEnrollmentLogin";
import StudentEnrollmentLogin from "./pages/academy/StudentEnrollmentLogin";
import StudentEnrollment from "./pages/academy/StudentEnrollment";
import TutorEnrollment from "./pages/academy/TutorEnrollment";
import Resources from "./pages/academy/Resources";
import Community from "./pages/academy/Community";
import OurStory from "./pages/academy/OurStory";
import TutorStudents from "./pages/academy/TutorStudents";

/* ============================================================
   STUDENT PORTAL
============================================================ */

import StudentLearningPortal from "./pages/academy/StudentLearningPortal";
import StudentOverview from "./pages/academy/StudentOverview";
import StudentSubjects from "./pages/academy/StudentSubjects";
import StudentLessons from "./pages/academy/StudentLessons";
import StudentTextbooks from "./pages/academy/StudentTextbooks";
import StudentTasks from "./pages/academy/StudentTasks";
import StudentAssignments from "./pages/academy/StudentAssignments";
import StudentCBT from "./pages/academy/StudentCBT";
import StudentLiveClasses from "./pages/academy/StudentLiveClasses";
import StudentMessages from "./pages/academy/StudentMessages";
import StudentProgress from "./pages/academy/StudentProgress";
import StudentAchievements from "./pages/academy/StudentAchievements";
import StudentProfile from "./pages/academy/StudentProfile";

/* ============================================================
   TUTOR
============================================================ */

import TutorCreateTask from "./pages/tutor/TutorCreateTask";
import TutorMyTasks from "./pages/tutor/TutorMyTasks";
import TutorTaskSubmissions from "./pages/tutor/TutorTaskSubmissions";

import TutorCreateAssignment from "./pages/tutor/TutorCreateAssignment";
import TutorAssignments from "./pages/tutor/TutorAssignments";
import TutorAssignmentSubmissions from "./pages/tutor/TutorAssignmentSubmissions";
import TutorAttendance from "./pages/tutor/TutorAttendance";
import TutorLiveClasses from "./pages/tutor/TutorLiveClasses";
import TutorLiveClassroom from "./pages/tutor/TutorLiveClassroom";

import TutorCreateLesson from "./pages/tutor/TutorCreateLesson";
import TutorLessonPlan from "./pages/tutor/TutorLessonPlan";

import TutorClassDetails from "./pages/tutor/TutorClassDetails";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import TutorClasses from "./pages/tutor/TutorClasses";
import TutorProfile from "./pages/tutor/TutorProfile";
import TutorLayout from "./components/tutor/TutorLayout";
import TutorMaterials from "./pages/tutor/TutorMaterials";
import TutorCalendar from "./pages/tutor/TutorCalendar";
import TutorStudentMessages from "./pages/tutor/TutorStudentMessages";
import TutorAnnouncements from "./pages/tutor/TutorAnnouncements";

/* ============================================================
   ADMIN
============================================================ */

import Teachers from "./pages/admin/users/Teachers";

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
import ProtectedRoute from "./components/ProtectedRoute";

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
   ACADEMY AUTH KEYS
============================================================ */

const ACADEMY_TOKEN_KEY =
  "scholiqen_academy_token";

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

/* ============================================================
   GET ACADEMY USER
============================================================ */

const getAcademyUser = () => {
  try {
    const raw =
      localStorage.getItem(
        ACADEMY_USER_KEY
      );

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
   ACADEMY STUDENT PROTECTED ROUTE
============================================================ */

const AcademyProtectedRoute = ({
  children,
}) => {
  const [
    checkingAuth,
    setCheckingAuth,
  ] = React.useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const checkAcademyAuthentication =
      () => {
        try {
          const token =
            localStorage.getItem(
              ACADEMY_TOKEN_KEY
            );

          const user =
            getAcademyUser();

          if (!token || !user) {
            if (mounted) {
              setAuthenticated(false);
              setCheckingAuth(false);
            }

            return;
          }

          const userType =
            String(
              user?.userType ||
                user?.user_type ||
                ""
            )
              .trim()
              .toLowerCase();

          if (
            userType !== "student"
          ) {
            if (mounted) {
              setAuthenticated(false);
              setCheckingAuth(false);
            }

            return;
          }

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
  const [
    checkingAuth,
    setCheckingAuth,
  ] = React.useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const checkTutorAuthentication =
      () => {
        try {
          const token =
            localStorage.getItem(
              ACADEMY_TOKEN_KEY
            );

          const user =
            getAcademyUser();

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

          const userType =
            String(
              user?.userType ||
                user?.user_type ||
                ""
            )
              .trim()
              .toLowerCase();

          if (
            userType !== "tutor"
          ) {
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

          const tutorReference =
            user?.reference ||
            user?.tutorReference ||
            user?.tutor?.reference ||
            user?.tutor
              ?.tutorReference ||
            user?.user?.reference ||
            "";

          if (
            !String(
              tutorReference
            ).trim()
          ) {
            console.warn(
              "Tutor route: Tutor reference is missing."
            );

            if (mounted) {
              setAuthenticated(false);
              setCheckingAuth(false);
            }

            return;
          }

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
  const location =
    useLocation();

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
            LOGIN
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================================================
            PROFILE
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
          element={
            <ResetPassword />
          }
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
          path="/our-story"
          element={
            <PageWrapper>
              <OurStory />
            </PageWrapper>
          }
        />

        {/* =====================================================
            SCHOLIQEN ACADEMY
        ===================================================== */}

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

        <Route
          path="/academy/sign-in"
          element={
            <PageWrapper>
              <Academy />
            </PageWrapper>
          }
        />

        {/* =====================================================
            STUDENT LOGIN
        ===================================================== */}

        <Route
          path="/academy/student-enrollment-login"
          element={
            <PageWrapper>
              <StudentEnrollmentLogin />
            </PageWrapper>
          }
        />

        {/* =====================================================
            STUDENT ENROLLMENT
        ===================================================== */}

        <Route
          path="/academy/student-enrollment"
          element={
            <PageWrapper>
              <StudentEnrollment />
            </PageWrapper>
          }
        />

        {/* =====================================================
            STUDENT LEARNING PORTAL
            PARENT LAYOUT
        ===================================================== */}

        <Route
          path="/academy/student"
          element={
            <AcademyProtectedRoute>
              <PageWrapper>
                <StudentLearningPortal />
              </PageWrapper>
            </AcademyProtectedRoute>
          }
        >

          {/* ===================================================
              STUDENT OVERVIEW
          =================================================== */}

          <Route
            index
            element={
              <StudentOverview />
            }
          />

          {/* ===================================================
              STUDENT SUBJECTS
          =================================================== */}

          <Route
            path="subjects"
            element={
              <StudentSubjects />
            }
          />

          {/* ===================================================
              STUDENT LESSONS
          =================================================== */}

          <Route
            path="lessons"
            element={
              <StudentLessons />
            }
          />

          {/* ===================================================
              STUDENT TEXTBOOKS
          =================================================== */}

          <Route
            path="textbooks"
            element={
              <StudentTextbooks />
            }
          />

          {/* ===================================================
              STUDENT TASKS
          =================================================== */}

          <Route
            path="tasks"
            element={
              <StudentTasks />
            }
          />

          {/* ===================================================
              STUDENT ASSIGNMENTS
          =================================================== */}

          <Route
            path="assignments"
            element={
              <StudentAssignments />
            }
          />

          {/* ===================================================
              STUDENT CBT
          =================================================== */}

          <Route
            path="cbt"
            element={
              <StudentCBT />
            }
          />

          {/* ===================================================
              STUDENT LIVE CLASSES
          =================================================== */}

          <Route
            path="live"
            element={
              <StudentLiveClasses />
            }
          />

          {/* ===================================================
              STUDENT MESSAGES
          =================================================== */}

          <Route
            path="messages"
            element={
              <StudentMessages />
            }
          />

          {/* ===================================================
              STUDENT PROGRESS
          =================================================== */}

          <Route
            path="progress"
            element={
              <StudentProgress />
            }
          />

          {/* ===================================================
              STUDENT ACHIEVEMENTS
          =================================================== */}

          <Route
            path="achievements"
            element={
              <StudentAchievements />
            }
          />

          {/* ===================================================
              STUDENT PROFILE
          =================================================== */}

          <Route
            path="profile"
            element={
              <StudentProfile />
            }
          />

        </Route>

        {/* =====================================================
            LEGACY STUDENT PORTAL URL
        ===================================================== */}

        <Route
          path="/academy/student-portal"
          element={
            <Navigate
              to="/academy/student"
              replace
            />
          }
        />

        {/* =====================================================
            STUDENT TASK SUBMISSION
        ===================================================== */}

        <Route
          path="/academy/student/task/:taskId"
          element={
            <AcademyProtectedRoute>
              <StudentTaskSubmission />
            </AcademyProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR ATTENDANCE
        ===================================================== */}

        <Route
          path="/academy/tutor/attendance"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Attendance">
                <TutorAttendance />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR REGISTRATION
        ===================================================== */}

        <Route
          path="/academy/tutor-register"
          element={
            <PageWrapper>
              <TutorEnrollment />
            </PageWrapper>
          }
        />

        {/* =====================================================
            TUTOR LOGIN
        ===================================================== */}

        <Route
          path="/academy/login"
          element={
            <PageWrapper>
              <TutorEnrollmentLogin />
            </PageWrapper>
          }
        />

        {/* =====================================================
            ACADEMICS
        ===================================================== */}

        <Route
          path="/academics"
          element={
            <PageWrapper>
              <Academics />
            </PageWrapper>
          }
        />

        {/* =====================================================
            COMMUNITY
        ===================================================== */}

        <Route
          path="/community"
          element={
            <PageWrapper>
              <Community />
            </PageWrapper>
          }
        />

        {/* =====================================================
            RESOURCES
        ===================================================== */}

        <Route
          path="/resources"
          element={
            <PageWrapper>
              <Resources />
            </PageWrapper>
          }
        />

        {/* =====================================================
            ABOUT
        ===================================================== */}

        <Route
          path="/about"
          element={
            <PageWrapper>
              <OurStory />
            </PageWrapper>
          }
        />

        {/* =====================================================
            TUTOR DASHBOARD
        ===================================================== */}

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

        {/* =====================================================
            TUTOR STUDENTS
        ===================================================== */}

        <Route
          path="/academy/tutor/students"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Students">
                <TutorStudents />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR CALENDAR
        ===================================================== */}

        <Route
          path="/academy/tutor/calendar"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Calendar">
                <TutorCalendar />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR LIVE CLASSES
        ===================================================== */}

        <Route
          path="/academy/tutor/live/start"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Live Classes">
                <TutorLiveClasses />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR LIVE CLASSROOM
        ===================================================== */}

        <Route
          path="/academy/tutor/live/:id"
          element={
            <TutorProtectedRoute>
              <TutorLiveClassroom />
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR MATERIALS
        ===================================================== */}

        <Route
          path="/academy/tutor/materials"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="My Materials">
                <TutorMaterials />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR CLASSES
        ===================================================== */}

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

        {/* =====================================================
            TUTOR CLASS DETAILS
        ===================================================== */}

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

        {/* =====================================================
            CREATE TASK
        ===================================================== */}

        <Route
          path="/academy/tutor/tasks/create"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Create Task">
                <TutorCreateTask />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            MY TASKS
        ===================================================== */}

        <Route
          path="/academy/tutor/tasks"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="My Tasks">
                <TutorMyTasks />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            TASK SUBMISSIONS
        ===================================================== */}

        <Route
          path="/academy/tutor/tasks/submissions"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Task Submissions">
                <TutorTaskSubmissions />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            CREATE ASSIGNMENT
        ===================================================== */}

        <Route
          path="/academy/tutor/assignments/create"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Create Assignment">
                <TutorCreateAssignment />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            ASSIGNMENT GRADING
        ===================================================== */}

        <Route
          path="/academy/tutor/assignments/grading"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Assignment Grading">
                <TutorAssignmentSubmissions />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            CREATE LESSON
        ===================================================== */}

        <Route
          path="/academy/tutor/lessons/create"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Create Lesson">
                <TutorCreateLesson />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            LESSON PLAN
        ===================================================== */}

        <Route
          path="/academy/tutor/lessons"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Lesson Plan">
                <TutorLessonPlan />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            MY ASSIGNMENTS
        ===================================================== */}

        <Route
          path="/academy/tutor/assignments"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="My Assignments">
                <TutorAssignments />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            STUDENT MESSAGES
        ===================================================== */}

        <Route
          path="/academy/tutor/messages/students"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Student Messages">
                <TutorStudentMessages />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR ANNOUNCEMENTS
        ===================================================== */}

        <Route
          path="/academy/tutor/announcements"
          element={
            <TutorProtectedRoute>
              <TutorLayout title="Tutor Announcements">
                <TutorAnnouncements />
              </TutorLayout>
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            LEGACY TASK SUBMISSIONS PATH
        ===================================================== */}

        <Route
          path="/academy/tutor/task/submissions"
          element={
            <Navigate
              to="/academy/tutor/tasks/submissions"
              replace
            />
          }
        />

        {/* =====================================================
            FUTURE TUTOR ROUTES / FALLBACK
        ===================================================== */}

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
            DASHBOARD
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

        <Route
          path="/lab/about"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <About />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            TUTOR PROFILE
        ===================================================== */}

        <Route
          path="/academy/tutor/profile"
          element={
            <TutorProtectedRoute>
              <TutorProfile />
            </TutorProtectedRoute>
          }
        />

        {/* =====================================================
            PDF
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
            VIDEO
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
