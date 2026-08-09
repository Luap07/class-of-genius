import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";

/* ================= LANGUAGES ================= */

import LanguageCMSAdmin from "../pages/admin/languages/LanguageCMSAdmin";
import LanguageContentManager from "../components/admin/languages/LanguageContentManager";
import LanguagesAdmin from "../pages/admin/languages/LanguagesAdmin";

/* ================= NEWSLETTER ================= */

import NewsletterAdmin from "../pages/admin/NewsletterAdmin";

/* ================= SCHOOLS ================= */

import SchoolsAdmin from "../pages/admin/schools/SchoolsAdmin";

import UniversitiesAdmin from "../pages/admin/schools/UniversitiesAdmin";
import UniversityForm from "../pages/admin/schools/UniversityForm";

import CollegesAdmin from "../pages/admin/schools/CollegesAdmin";
import CollegeForm from "../pages/admin/schools/CollegeForm";

import PolytechnicsAdmin from "../pages/admin/schools/PolytechnicsAdmin";
import PolytechnicForm from "../pages/admin/schools/PolytechnicForm";

import SchoolDetailsAdmin from "../pages/admin/schools/SchoolDetailsAdmin";
import FacultyManager from "../pages/admin/schools/FacultyManager";

/* ================= LMS ================= */

import CoursesAdmin from "../pages/admin/lms/CoursesAdmin";
import CreateCourse from "../pages/admin/lms/CreateCourse";
import EditCourse from "../pages/admin/lms/EditCourse";

import LearningPathsAdmin from "../pages/admin/lms/LearningPathsAdmin";
import QuizzesAdmin from "../pages/admin/lms/QuizzesAdmin";
import CertificatesAdmin from "../pages/admin/lms/CertificatesAdmin";
import StudentsAdmin from "../pages/admin/lms/StudentsAdmin";
import InstructorsAdmin from "../pages/admin/lms/InstructorsAdmin";

import MaterialsAdmin from "../pages/admin/lms/MaterialsAdmin";
import CreateMaterial from "../pages/admin/lms/CreateMaterial";

import EditWeeklyTask from "../pages/admin/lms/EditWeeklyTask";
import EditMonthlyQuiz from "../pages/admin/lms/EditMonthlyQuiz";
import ViewMonthlyQuiz from "../pages/admin/lms/ViewMonthlyQuiz";

import CourseCategories from "../pages/admin/lms/CourseCategories";

import TopicsAdmin from "../pages/admin/lms/TopicsAdmin";
import CreateTopic from "../pages/admin/lms/CreateTopic";
import EditTopic from "../pages/admin/lms/EditTopic";

import ResourcesAdmin from "../pages/admin/lms/ResourcesAdmin";
import CreateResource from "../pages/admin/lms/CreateResource";
import EditResource from "../pages/admin/lms/EditResource";

import WeeklyTasksAdmin from "../pages/admin/lms/WeeklyTasksAdmin";
import CreateWeeklyTask from "../pages/admin/lms/CreateWeeklyTask";

import MonthlyQuizAdmin from "../pages/admin/lms/MonthlyQuizAdmin";
import CreateMonthlyQuiz from "../pages/admin/lms/CreateMonthlyQuiz";

import DocumentsAdmin from "./DocumentsAdmin";

/* ================= VIRTUAL LABS ================= */

import VirtualLabsDashboard from "../pages/admin/virtualLabs/VirtualLabsDashboard";
import PhysicsExperiments from "../pages/admin/virtualLabs/PhysicsExperiments";
import ChemistryExperiments from "../pages/admin/virtualLabs/ChemistryExperiments";
import BiologyExperiments from "../pages/admin/virtualLabs/BiologyExperiments";
import MathematicsExperiments from "../pages/admin/virtualLabs/MathematicsExperiments";
import AddExperiment from "../pages/admin/virtualLabs/AddExperiment";
import EditExperiment from "../pages/admin/virtualLabs/EditExperiment";

/* ================= CBT ================= */

import CBTDashboard from "../pages/admin/cbt/CBTDashboard";
import SubjectsAdmin from "../pages/admin/cbt/SubjectsAdmin";
import ExamsAdmin from "../pages/admin/cbt/ExamsAdmin";
import ResultsAdmin from "../pages/admin/cbt/ResultsAdmin";
import AnalyticsAdmin from "../pages/admin/cbt/AnalyticsAdmin";
import QuestionUpload from "../pages/admin/cbt/QuestionUpload";
import QuestionsAdmin from "../pages/admin/cbt/QuestionsAdmin";

/* ================= NOVELS ================= */

import NovelsDashboard from "../pages/admin/novels/NovelsDashboard";
import NovelEditor from "../pages/admin/novels/NovelEditor";
import NovelView from "../pages/admin/novels/NovelView";
import GenresAdmin from "../pages/admin/novels/GenresAdmin";
import ChaptersAdmin from "../pages/admin/novels/ChaptersAdmin";
import NovelReviews from "../pages/admin/novels/NovelReviews";
import NovelsList from "../pages/admin/novels/NovelsList";

/* ================= USERS ================= */

import UsersDashboard from "../pages/admin/users/UsersDashboard";
import Students from "../pages/admin/users/Students";
import Instructors from "../pages/admin/users/Instructors";
import Schools from "../pages/admin/users/Schools";
import Admins from "../pages/admin/users/Admins";
import Roles from "../pages/admin/users/Roles";

/* ================= ANALYTICS ================= */

import DashboardAnalytics from "../pages/admin/analytics/DashboardAnalytics";
import CourseAnalytics from "../pages/admin/analytics/CourseAnalytics";
import CBTAnalytics from "../pages/admin/analytics/CBTAnalytics";
import LabAnalytics from "../pages/admin/analytics/LabAnalytics";
import NovelAnalytics from "../pages/admin/analytics/NovelAnalytics";
import RevenueAnalytics from "../pages/admin/analytics/RevenueAnalytics";

/* ================= MEDIA ================= */

import MediaLibrary from "../pages/admin/media/MediaLibrary";
import Images from "../pages/admin/media/Images";
import Videos from "../pages/admin/media/Videos";
import PDFs from "../pages/admin/media/PDFs";
import Audio from "../pages/admin/media/Audio";

/* ================= SETTINGS ================= */

import GeneralSettings from "../pages/admin/settings/GeneralSettings";
import Branding from "../pages/admin/settings/Branding";
import Security from "../pages/admin/settings/Security";
import EmailSettings from "../pages/admin/settings/EmailSettings";
import StorageSettings from "../pages/admin/settings/StorageSettings";
import Integrations from "../pages/admin/settings/Integrations";
import APIKeys from "../pages/admin/settings/APIKeys";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* =====================================================
          ADMIN LAYOUT
      ===================================================== */}

      <Route element={<AdminLayout />}>

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route index element={<AdminDashboard />} />

        {/* =================================================
            LMS
        ================================================= */}

        <Route
          path="lms"
          element={<CoursesAdmin />}
        />

        <Route
          path="lms/create"
          element={<CreateCourse />}
        />

        <Route
          path="lms/edit/:id"
          element={<EditCourse />}
        />

        <Route
          path="lms/course/:courseId/topics"
          element={<TopicsAdmin />}
        />

        <Route
          path="lms/course/:courseId/topics/create"
          element={<CreateTopic />}
        />

        <Route
          path="lms/course/:courseId/topics/edit/:topicId"
          element={<EditTopic />}
        />

        <Route
          path="lms/tasks/edit/:id"
          element={<EditWeeklyTask />}
        />

        {/* RESOURCES */}

        <Route
          path="lms/topic/:topicId/resources"
          element={<ResourcesAdmin />}
        />

        <Route
          path="lms/topic/:topicId/resources/create"
          element={<CreateResource />}
        />

        <Route
          path="lms/topic/:topicId/resources/edit/:resourceId"
          element={<EditResource />}
        />

        <Route
          path="lms/categories"
          element={<CourseCategories />}
        />

        <Route
          path="resources"
          element={<ResourcesAdmin />}
        />

        {/* WEEKLY TASKS */}

        <Route
          path="lms/topic/:topicId/tasks"
          element={<WeeklyTasksAdmin />}
        />

        <Route
          path="lms/topic/:topicId/tasks/create"
          element={<CreateWeeklyTask />}
        />

        <Route
          path="lms/topic/:topicId/tasks/edit/:id"
          element={<EditWeeklyTask />}
        />

        {/* MONTHLY QUIZZES */}

        <Route
          path="lms/topic/:topicId/quizzes"
          element={<MonthlyQuizAdmin />}
        />

        <Route
          path="lms/topic/:topicId/quizzes/create"
          element={<CreateMonthlyQuiz />}
        />

        <Route
          path="lms/topic/:topicId/quizzes/edit/:id"
          element={<EditMonthlyQuiz />}
        />

        <Route
          path="lms/topic/:topicId/quizzes/view/:id"
          element={<ViewMonthlyQuiz />}
        />

        {/* MATERIALS */}

        <Route
          path="lms/course/:courseId/materials"
          element={<MaterialsAdmin />}
        />

        <Route
          path="lms/materials/create"
          element={<CreateMaterial />}
        />

        {/* =================================================
            LANGUAGES
        ================================================= */}

        <Route
          path="languages"
          element={<LanguagesAdmin />}
        />

        <Route
          path="languages/content"
          element={<LanguageContentManager />}
        />

        <Route
          path="languages/cms"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/overview"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/workspace"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/alphabet"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/grammar"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/vocabulary"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/culture"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/listening"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/speaking"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/writing"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/lessons"
          element={<LanguageCMSAdmin />}
        />

        <Route
          path="languages/cms/ai"
          element={<LanguageCMSAdmin />}
        />

        {/* =================================================
            SCHOOLS
        ================================================= */}

        <Route
          path="schools"
          element={<SchoolsAdmin />}
        />

        {/* =================================================
            UNIVERSITIES
        ================================================= */}

        <Route
          path="schools/universities"
          element={<UniversitiesAdmin />}
        />

        {/* ADD UNIVERSITY */}

        <Route
          path="schools/universities/new"
          element={<UniversityForm />}
        />

        {/* EDIT UNIVERSITY */}

        <Route
          path="schools/universities/:id/edit"
          element={<UniversityForm />}
        />

        {/* VIEW UNIVERSITY */}

        <Route
          path="schools/universities/:id"
          element={<SchoolDetailsAdmin />}
        />

        {/* =================================================
            COLLEGES
        ================================================= */}

        <Route
          path="schools/colleges"
          element={<CollegesAdmin />}
        />

        <Route
          path="schools/colleges/new"
          element={<CollegeForm />}
        />

        <Route
          path="schools/colleges/:id/edit"
          element={<CollegeForm />}
        />

        <Route
          path="schools/colleges/:id"
          element={<SchoolDetailsAdmin />}
        />

        {/* =================================================
            POLYTECHNICS
        ================================================= */}

        <Route
          path="schools/polytechnics"
          element={<PolytechnicsAdmin />}
        />

        <Route
          path="schools/polytechnics/new"
          element={<PolytechnicForm />}
        />

        <Route
          path="schools/polytechnics/:id/edit"
          element={<PolytechnicForm />}
        />

        <Route
          path="schools/polytechnics/:id"
          element={<SchoolDetailsAdmin />}
        />

        {/* =================================================
            SCHOOL DETAILS
        ================================================= */}

        <Route
          path="schools/:type/:id"
          element={<SchoolDetailsAdmin />}
        />

        {/* =================================================
            FACULTIES
            The schoolId comes directly from the URL.
            FacultyManager uses useParams() to read it.
        ================================================= */}

        <Route
          path="schools/:type/:schoolId/faculties"
          element={<FacultyManager />}
        />

        {/* =================================================
            IMPORTANT:
            NO PROGRAM MANAGER ROUTE
        ================================================= */}

        {/* =================================================
            CBT
        ================================================= */}

        <Route
          path="cbt"
          element={<CBTDashboard />}
        />

        <Route
          path="cbt/questions/upload"
          element={<QuestionUpload />}
        />

        <Route
          path="cbt/questions"
          element={<QuestionsAdmin />}
        />

        <Route
          path="cbt/subjects"
          element={<SubjectsAdmin />}
        />

        <Route
          path="cbt/exams"
          element={<ExamsAdmin />}
        />

        <Route
          path="cbt/results"
          element={<ResultsAdmin />}
        />

        <Route
          path="cbt/analytics"
          element={<AnalyticsAdmin />}
        />

        {/* =================================================
            DOCUMENTS
        ================================================= */}

        <Route
          path="documents"
          element={<DocumentsAdmin />}
        />

        {/* =================================================
            NOVELS
        ================================================= */}

        <Route
          path="novels"
          element={<NovelsDashboard />}
        />

        <Route
          path="novels/list"
          element={<NovelsList />}
        />

        <Route
          path="novels/create"
          element={<NovelEditor />}
        />

        <Route
          path="novels/edit/:id"
          element={<NovelEditor />}
        />

        <Route
          path="novels/view/:id"
          element={<NovelView />}
        />

        <Route
          path="novels/genres"
          element={<GenresAdmin />}
        />

        <Route
          path="novels/chapters"
          element={<ChaptersAdmin />}
        />

        <Route
          path="novels/reviews"
          element={<NovelReviews />}
        />

        {/* =================================================
            NEWSLETTER
        ================================================= */}

        <Route
          path="newsletter"
          element={<NewsletterAdmin />}
        />

        {/* =================================================
            USERS
        ================================================= */}

        <Route
          path="users"
          element={<UsersDashboard />}
        />

        <Route
          path="users/students"
          element={<Students />}
        />

        <Route
          path="users/instructors"
          element={<Instructors />}
        />

        <Route
          path="users/schools"
          element={<Schools />}
        />

        <Route
          path="users/admins"
          element={<Admins />}
        />

        <Route
          path="users/roles"
          element={<Roles />}
        />

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <Route
          path="analytics"
          element={<DashboardAnalytics />}
        />

        <Route
          path="analytics/courses"
          element={<CourseAnalytics />}
        />

        <Route
          path="analytics/cbt"
          element={<CBTAnalytics />}
        />

        <Route
          path="analytics/labs"
          element={<LabAnalytics />}
        />

        <Route
          path="analytics/novels"
          element={<NovelAnalytics />}
        />

        <Route
          path="analytics/revenue"
          element={<RevenueAnalytics />}
        />

        {/* =================================================
            MEDIA
        ================================================= */}

        <Route
          path="media"
          element={<MediaLibrary />}
        />

        <Route
          path="media/images"
          element={<Images />}
        />

        <Route
          path="media/videos"
          element={<Videos />}
        />

        <Route
          path="media/pdfs"
          element={<PDFs />}
        />

        <Route
          path="media/audio"
          element={<Audio />}
        />

        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="settings"
          element={<GeneralSettings />}
        />

        <Route
          path="settings/branding"
          element={<Branding />}
        />

        <Route
          path="settings/security"
          element={<Security />}
        />

        <Route
          path="settings/email"
          element={<EmailSettings />}
        />

        <Route
          path="settings/storage"
          element={<StorageSettings />}
        />

        <Route
          path="settings/integrations"
          element={<Integrations />}
        />

        <Route
          path="settings/api"
          element={<APIKeys />}
        />
      </Route>

      {/* =====================================================
          UNKNOWN ADMIN ROUTES
          MUST BE LAST
      ===================================================== */}

      <Route
        path="*"
        element={<Navigate to="/admin" replace />}
      />
    </Routes>
  );
};

export default AdminRoutes;
