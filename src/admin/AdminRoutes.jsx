// src/admin/AdminRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";

/* ================= LMS ================= */
import CoursesAdmin from "../pages/admin/lms/CoursesAdmin";
import CreateCourse from "../pages/admin/lms/CreateCourse";
import EditCourse from "../pages/admin/lms/EditCourse";
import CourseCategories from "../pages/admin/lms/CourseCategories";
import LearningPathsAdmin from "../pages/admin/lms/LearningPathsAdmin";
import QuizzesAdmin from "../pages/admin/lms/QuizzesAdmin";
import CertificatesAdmin from "../pages/admin/lms/CertificatesAdmin";
import StudentsAdmin from "../pages/admin/lms/StudentsAdmin";
import InstructorsAdmin from "../pages/admin/lms/InstructorsAdmin";

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
import QuestionsAdmin from "../pages/admin/cbt/QuestionsAdmin";
import ExamsAdmin from "../pages/admin/cbt/ExamsAdmin";
import ResultsAdmin from "../pages/admin/cbt/ResultsAdmin";
import AnalyticsAdmin from "../pages/admin/cbt/AnalyticsAdmin";

/* ================= NOVELS ================= */
import NovelsDashboard from "../pages/admin/novels/NovelsDashboard";
import NovelEditor from "../pages/admin/novels/NovelEditor";
import NovelView from "../pages/admin/novels/NovelView";
import GenresAdmin from "../pages/admin/novels/GenresAdmin";
import ChaptersAdmin from "../pages/admin/novels/ChaptersAdmin";
import NovelReviews from "../pages/admin/novels/NovelReviews";
import NovelsList from "../pages/admin/novels/NovelsList";

/*================= Topic ==========*/
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
      <Route element={<AdminLayout />}>

        {/* Dashboard */}
        <Route index element={<AdminDashboard />} />

{/* ================= LMS ================= */}


<Route
  path="lms/course/:courseId/topics"
  element={<TopicsAdmin />}
/>


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


<Route path="lms" element={<CoursesAdmin />} />


{/* ================= LEARNING UNITS ================= */}

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



{/* ================= RESOURCES ================= */}

<Route
  path="lms/topic/:topicId/resources/*"
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

{/* ================= WEEKLY TASKS ================= */}

<Route
  path="lms/topic/:topicId/tasks"
  element={<WeeklyTasksAdmin />}
/>

<Route
  path="lms/topic/:topicId/tasks/create"
  element={<CreateWeeklyTask />}
/>



{/* ================= MONTHLY QUIZZES ================= */}

<Route
  path="lms/topic/:topicId/quizzes"
  element={<MonthlyQuizAdmin />}
/>

<Route
  path="lms/topic/:topicId/quizzes/create"
  element={<CreateMonthlyQuiz />}
/>

{/* ==============lm$============ */}

<Route path="lms/topics" element={<TopicsAdmin />} />
<Route path="lms/topics/create" element={<CreateTopic />} />
<Route path="lms/topics/edit/:topicId" element={<EditTopic />} />

<Route path="lms/tasks" element={<WeeklyTasksAdmin />} />
<Route path="lms/tasks/create" element={<CreateWeeklyTask />} />

<Route path="lms/monthly-quizzes" element={<MonthlyQuizAdmin />} />
<Route path="lms/monthly-quizzes/create" element={<CreateMonthlyQuiz />} />        {/* Virtual Labs */}
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
        <Route path="cbt/analytics" element={<AnalyticsAdmin />} />

        {/* Novels */}
        <Route path="novels" element={<NovelsDashboard />} />
        <Route path="novels/list" element={<NovelsList />} />
        <Route path="novels/create" element={<NovelEditor />} />
        <Route path="novels/edit/:id" element={<NovelEditor />} />
        <Route path="novels/view/:id" element={<NovelView />} /> 
        <Route path="novels/genres" element={<GenresAdmin />} />
        <Route path="novels/chapters" element={<ChaptersAdmin />} />
        <Route path="novels/reviews" element={<NovelReviews />} />

        {/* Users */}
        <Route path="users" element={<UsersDashboard />} />
        <Route path="users/students" element={<Students />} />
        <Route path="users/instructors" element={<Instructors />} />
        <Route path="users/schools" element={<Schools />} />
        <Route path="users/admins" element={<Admins />} />
        <Route path="users/roles" element={<Roles />} />

        {/* Analytics */}
        <Route path="analytics" element={<DashboardAnalytics />} />
        <Route path="analytics/courses" element={<CourseAnalytics />} />
        <Route path="analytics/cbt" element={<CBTAnalytics />} />
        <Route path="analytics/labs" element={<LabAnalytics />} />
        <Route path="analytics/novels" element={<NovelAnalytics />} />
        <Route path="analytics/revenue" element={<RevenueAnalytics />} />

        {/* Media */}
        <Route path="media" element={<MediaLibrary />} />
        <Route path="media/images" element={<Images />} />
        <Route path="media/videos" element={<Videos />} />
        <Route path="media/pdfs" element={<PDFs />} />
        <Route path="media/audio" element={<Audio />} />

        {/* Settings */}
        <Route path="settings" element={<GeneralSettings />} />
        <Route path="settings/branding" element={<Branding />} />
        <Route path="settings/security" element={<Security />} />
        <Route path="settings/email" element={<EmailSettings />} />
        <Route path="settings/storage" element={<StorageSettings />} />
        <Route path="settings/integrations" element={<Integrations />} />
        <Route path="settings/api" element={<APIKeys />} />

      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;