import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./AdminLayout";

/* Dashboard */
import DashboardHome from "../pages/dashboard/DashboardHome";

/* LMS */
import CoursesAdmin from "../pages/lms/CoursesAdmin";
import CreateCourse from "../pages/lms/CreateCourse";
import EditCourse from "../pages/lms/EditCourse";
import CategoriesAdmin from "../pages/lms/CategoriesAdmin";
import ModulesAdmin from "../pages/lms/ModulesAdmin";
import LessonsAdmin from "../pages/lms/LessonsAdmin";
import LearningPathsAdmin from "../pages/lms/LearningPathsAdmin";
import CertificatesAdmin from "../pages/lms/CertificatesAdmin";
import StudentsAdmin from "../pages/lms/StudentsAdmin";
import InstructorsAdmin from "../pages/lms/InstructorsAdmin";

/* Virtual Labs */
import VirtualLabsDashboard from "../pages/virtualLabs/VirtualLabsDashboard";
import PhysicsExperiments from "../pages/virtualLabs/PhysicsExperiments";
import ChemistryExperiments from "../pages/virtualLabs/ChemistryExperiments";
import BiologyExperiments from "../pages/virtualLabs/BiologyExperiments";
import MathematicsExperiments from "../pages/virtualLabs/MathematicsExperiments";
import AddExperiment from "../pages/virtualLabs/AddExperiment";
import EditExperiment from "../pages/virtualLabs/EditExperiment";

/* CBT */
import CBTDashboard from "../pages/cbt/CBTDashboard";
import SubjectsAdmin from "../pages/cbt/SubjectsAdmin";
import QuestionsAdmin from "../pages/cbt/QuestionsAdmin";
import ExamsAdmin from "../pages/cbt/ExamsAdmin";
import ResultsAdmin from "../pages/cbt/ResultsAdmin";

/* Novels */
import NovelsDashboard from "../pages/novels/NovelsDashboard";
import GenresAdmin from "../pages/novels/GenresAdmin";
import ChaptersAdmin from "../pages/novels/ChaptersAdmin";
import ReviewsAdmin from "../pages/novels/ReviewsAdmin";

/* Users */
import UsersDashboard from "../pages/users/UsersDashboard";
import Students from "../pages/users/Students";
import Teachers from "../pages/users/Teachers";
import Schools from "../pages/users/Schools";
import Admins from "../pages/users/Admins";

/* Analytics */
import DashboardAnalytics from "../pages/analytics/DashboardAnalytics";
import CourseAnalytics from "../pages/analytics/CourseAnalytics";
import CBTAnalytics from "../pages/analytics/CBTAnalytics";
import VirtualLabAnalytics from "../pages/analytics/VirtualLabAnalytics";
import NovelAnalytics from "../pages/analytics/NovelAnalytics";

/* Media */
import MediaLibrary from "../pages/media/MediaLibrary";
import Images from "../pages/media/Images";
import Videos from "../pages/media/Videos";
import PDFs from "../pages/media/PDFs";

/* Settings */
import GeneralSettings from "../pages/settings/GeneralSettings";
import Branding from "../pages/settings/Branding";
import Security from "../pages/settings/Security";
import EmailSettings from "../pages/settings/EmailSettings";

const AdminDashboard = () => {
  return (
    <Routes>

      <Route element={<AdminLayout />}>

        {/* Dashboard */}
        <Route index element={<DashboardHome />} />

        {/* LMS */}
        <Route path="lms" element={<CoursesAdmin />} />
        <Route path="lms/create" element={<CreateCourse />} />
        <Route path="lms/edit/:id" element={<EditCourse />} />
        <Route path="lms/categories" element={<CategoriesAdmin />} />
        <Route path="lms/modules" element={<ModulesAdmin />} />
        <Route path="lms/lessons" element={<LessonsAdmin />} />
        <Route path="lms/paths" element={<LearningPathsAdmin />} />
        <Route path="lms/certificates" element={<CertificatesAdmin />} />
        <Route path="lms/students" element={<StudentsAdmin />} />
        <Route path="lms/instructors" element={<InstructorsAdmin />} />

        {/* Virtual Labs */}
        <Route path="labs" element={<VirtualLabsDashboard />} />
        <Route path="labs/physics" element={<PhysicsExperiments />} />
        <Route path="labs/chemistry" element={<ChemistryExperiments />} />
        <Route path="labs/biology" element={<BiologyExperiments />} />
        <Route path="labs/mathematics" element={<MathematicsExperiments />} />
        <Route path="labs/add" element={<AddExperiment />} />
        <Route path="labs/edit/:id" element={<EditExperiment />} />

        {/* CBT */}
        <Route path="cbt" element={<CBTDashboard />} />
        <Route path="cbt/subjects" element={<SubjectsAdmin />} />
        <Route path="cbt/questions" element={<QuestionsAdmin />} />
        <Route path="cbt/exams" element={<ExamsAdmin />} />
        <Route path="cbt/results" element={<ResultsAdmin />} />

        {/* Novels */}
        <Route path="novels" element={<NovelsDashboard />} />
        <Route path="novels/genres" element={<GenresAdmin />} />
        <Route path="novels/chapters" element={<ChaptersAdmin />} />
        <Route path="novels/reviews" element={<ReviewsAdmin />} />

        {/* Users */}
        <Route path="users" element={<UsersDashboard />} />
        <Route path="users/students" element={<Students />} />
        <Route path="users/teachers" element={<Teachers />} />
        <Route path="users/schools" element={<Schools />} />
        <Route path="users/admins" element={<Admins />} />

        {/* Analytics */}
        <Route path="analytics" element={<DashboardAnalytics />} />
        <Route path="analytics/courses" element={<CourseAnalytics />} />
        <Route path="analytics/cbt" element={<CBTAnalytics />} />
        <Route path="analytics/labs" element={<VirtualLabAnalytics />} />
        <Route path="analytics/novels" element={<NovelAnalytics />} />

        {/* Media */}
        <Route path="media" element={<MediaLibrary />} />
        <Route path="media/images" element={<Images />} />
        <Route path="media/videos" element={<Videos />} />
        <Route path="media/pdfs" element={<PDFs />} />

        {/* Settings */}
        <Route path="settings" element={<GeneralSettings />} />
        <Route path="settings/branding" element={<Branding />} />
        <Route path="settings/security" element={<Security />} />
        <Route path="settings/email" element={<EmailSettings />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/admin" replace />} />

      </Route>

    </Routes>
  );
};

export default AdminDashboard;