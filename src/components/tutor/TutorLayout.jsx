import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import TutorSidebar from "./TutorSidebar";
import TutorTopbar from "./TutorTopbar";

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

const TutorLayout = ({
  children,
  title,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [tutor, setTutor] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(
          ACADEMY_USER_KEY
        );

      if (!storedUser) {
        navigate(
          "/academy/login",
          { replace: true }
        );

        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      const userType =
        parsedUser?.userType ||
        parsedUser?.user_type;

      if (userType !== "tutor") {
        navigate(
          "/academy/login",
          { replace: true }
        );

        return;
      }

      setTutor(parsedUser);
    } catch (error) {
      console.error(
        "Tutor session error:",
        error
      );

      localStorage.removeItem(
        ACADEMY_USER_KEY
      );

      localStorage.removeItem(
        "scholiqen_academy_token"
      );

      navigate(
        "/academy/login",
        { replace: true }
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const pageTitle = useMemo(() => {
    if (title) {
      return title;
    }

    const path = location.pathname;

    if (
      path === "/academy/tutor"
    ) {
      return "Tutor Dashboard";
    }

    if (
      path.includes("/classes")
    ) {
      return "My Classes";
    }

    if (
      path.includes("/tasks")
    ) {
      return "Tasks";
    }

    if (
      path.includes("/assignments")
    ) {
      return "Assignments";
    }

    if (
      path.includes("/lessons")
    ) {
      return "Lessons";
    }

    if (
      path.includes("/materials")
    ) {
      return "Learning Materials";
    }

    if (
      path.includes("/live")
    ) {
      return "Live Classroom";
    }

    if (
      path.includes("/whiteboard")
    ) {
      return "Whiteboard";
    }

    if (
      path.includes("/students")
    ) {
      return "Students";
    }

    if (
      path.includes("/attendance")
    ) {
      return "Attendance";
    }

    if (
      path.includes("/progress")
    ) {
      return "Student Progress";
    }

    if (
      path.includes("/announcements")
    ) {
      return "Announcements";
    }

    if (
      path.includes("/messages")
    ) {
      return "Messages";
    }

    if (
      path.includes("/profile")
    ) {
      return "My Profile";
    }

    if (
      path.includes("/settings")
    ) {
      return "Settings";
    }

    return "Tutor Portal";
  }, [
    location.pathname,
    title,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <div className="text-center">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/10" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
            </div>
          </div>

          <p className="mt-4 text-xs font-bold text-slate-500">
            Loading Tutor Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.025] blur-[130px]" />

        <div className="absolute right-[-10%] top-[30%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize:
              "26px 26px",
          }}
        />
      </div>

      <TutorSidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        activePath={
          location.pathname
        }
        tutor={tutor}
      />

      <div className="relative min-h-screen lg:pl-[285px]">
        <TutorTopbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          tutor={tutor}
          title={pageTitle}
        />

        <main className="relative px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TutorLayout;