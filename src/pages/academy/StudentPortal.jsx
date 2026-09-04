import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Trophy,
  BarChart3,
  User,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronRight,
  PlayCircle,
  Clock3,
  CheckCircle2,
  Target,
  Flame,
  Award,
  BookMarked,
  FileText,
  Bell,
  Settings,
  Sparkles,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
  Edit3,
  Lock,
} from "lucide-react";

const AUTH_TOKEN_KEY = "scholiqen_auth_token";
const AUTH_USER_KEY = "scholiqen_current_user";

const navigation = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "subjects",
    label: "My Subjects",
    icon: BookOpen,
  },
  {
    id: "lessons",
    label: "Lessons",
    icon: PlayCircle,
  },
  {
    id: "cbt",
    label: "CBT Practice",
    icon: ClipboardList,
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: FileText,
  },
  {
    id: "progress",
    label: "Progress",
    icon: BarChart3,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Trophy,
  },
  {
    id: "profile",
    label: "My Profile",
    icon: User,
  },
  {
    id: "enrollment",
    label: "Enrollment",
    icon: GraduationCap,
  },
];

const defaultSubjects = [
  {
    name: "Mathematics",
    code: "MATH",
    progress: 72,
    lessons: 24,
    completed: 17,
    icon: "∑",
    description: "Numbers, algebra, geometry and problem solving.",
  },
  {
    name: "English Language",
    code: "ENG",
    progress: 64,
    lessons: 28,
    completed: 18,
    icon: "Aa",
    description: "Grammar, comprehension, vocabulary and writing.",
  },
  {
    name: "Basic Science",
    code: "SCI",
    progress: 58,
    lessons: 22,
    completed: 13,
    icon: "⚗",
    description: "Explore living things, matter, energy and nature.",
  },
  {
    name: "Social Studies",
    code: "SOC",
    progress: 81,
    lessons: 20,
    completed: 16,
    icon: "◎",
    description: "Society, culture, citizenship and the environment.",
  },
];

const recentLessons = [
  {
    subject: "Mathematics",
    title: "Introduction to Algebra",
    duration: "24 min",
    progress: 80,
  },
  {
    subject: "English Language",
    title: "Parts of Speech",
    duration: "18 min",
    progress: 55,
  },
  {
    subject: "Basic Science",
    title: "Living and Non-Living Things",
    duration: "21 min",
    progress: 35,
  },
];

const assignments = [
  {
    title: "Algebra Practice",
    subject: "Mathematics",
    due: "Tomorrow",
    status: "Pending",
  },
  {
    title: "Comprehension Exercise",
    subject: "English Language",
    due: "Sep 7",
    status: "Pending",
  },
  {
    title: "Science Revision",
    subject: "Basic Science",
    due: "Completed",
    status: "Completed",
  },
];

const achievements = [
  {
    title: "First Step",
    description: "Completed your first lesson.",
    icon: "🚀",
    unlocked: true,
  },
  {
    title: "Quick Learner",
    description: "Complete 10 lessons.",
    icon: "⚡",
    unlocked: true,
  },
  {
    title: "7 Day Streak",
    description: "Study for seven consecutive days.",
    icon: "🔥",
    unlocked: false,
  },
  {
    title: "CBT Champion",
    description: "Score 80% or higher in five CBTs.",
    icon: "🏆",
    unlocked: false,
  },
];

function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getDisplayName(user) {
  if (!user) return "Student";

  return (
    user.firstName ||
    user.first_name ||
    user.full_name?.split(" ")[0] ||
    user.name?.split(" ")[0] ||
    user.username ||
    "Student"
  );
}

function getFullName(user) {
  if (!user) return "Student";

  return (
    user.full_name ||
    user.name ||
    [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(" ") ||
    [user.first_name, user.middle_name, user.last_name]
      .filter(Boolean)
      .join(" ") ||
    user.username ||
    "Student"
  );
}

function getGrade(user) {
  if (!user) return "Student";

  return (
    user.grade ||
    user.class_level ||
    user.class ||
    user.school_level ||
    "Academy Student"
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  iconClass = "text-cyan-400",
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-white">{value}</p>
          {detail && (
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
          {eyebrow}
        </p>
      )}

      <h2 className="text-2xl font-black tracking-tight text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function StudentPortal() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const fullName = useMemo(() => getFullName(user), [user]);
  const grade = useMemo(() => getGrade(user), [user]);

  const initials = useMemo(() => {
    const parts = fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2);

    return parts.map((part) => part[0]?.toUpperCase()).join("") || "S";
  }, [fullName]);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    navigate("/login", {
      replace: true,
    });
  };

  const goToSection = (section) => {
    setActiveSection(section);
    setMobileOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "subjects":
        return (
          <SubjectsSection
            navigate={navigate}
            grade={grade}
          />
        );

      case "lessons":
        return <LessonsSection />;

      case "cbt":
        return <CBTSection navigate={navigate} />;

      case "assignments":
        return <AssignmentsSection />;

      case "progress":
        return <ProgressSection />;

      case "achievements":
        return <AchievementsSection />;

      case "profile":
        return (
          <ProfileSection
            user={user}
            fullName={fullName}
            grade={grade}
            initials={initials}
          />
        );

      case "enrollment":
        return (
          <EnrollmentSection
            user={user}
            fullName={fullName}
            grade={grade}
          />
        );

      default:
        return (
          <OverviewSection
            displayName={displayName}
            grade={grade}
            navigate={navigate}
            goToSection={goToSection}
          />
        );
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(56,189,248,0.9) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute -right-40 top-1/3 h-[550px] w-[550px] rounded-full bg-violet-600/10 blur-[150px]" />

        <div className="absolute bottom-[-250px] left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-white/10 bg-[#070b1c]/95 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-5">
          <button
            onClick={() => goToSection("overview")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>

            <div className="text-left">
              <p className="font-black tracking-tight">SCHOLIQEN</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                Academy
              </p>
            </div>
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student mini profile */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {fullName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {grade}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            Student Portal
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => goToSection(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-cyan-400/10 text-cyan-300"
                      : "text-slate-500 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      active
                        ? "text-cyan-400"
                        : "text-slate-600 group-hover:text-slate-300"
                    }`}
                  />

                  <span>{item.label}</span>

                  {active && (
                    <motion.div
                      layoutId="portal-active"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => navigate("/settings")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-400/80 transition hover:bg-red-500/5 hover:text-red-300"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="relative min-h-screen lg:pl-[270px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-white/10 bg-[#050816]/80 px-5 backdrop-blur-2xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="hidden text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 sm:block">
                Scholiqen Academy
              </p>

              <h1 className="text-lg font-black sm:text-xl">
                {activeSection === "overview"
                  ? `Welcome, ${displayName}`
                  : navigation.find(
                      (item) => item.id === activeSection
                    )?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="relative rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </button>

            <button
              onClick={() => goToSection("profile")}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 pr-3 transition hover:bg-white/[0.06]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-black">
                {initials}
              </div>

              <span className="hidden max-w-[120px] truncate text-xs font-bold text-slate-300 sm:block">
                {displayName}
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="relative z-10 p-5 sm:p-8">
          <div className="mx-auto max-w-[1400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function OverviewSection({
  displayName,
  grade,
  navigate,
  goToSection,
}) {
  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-500/[0.09] via-blue-500/[0.06] to-violet-600/[0.09] p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />

        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            YOUR LEARNING SPACE
          </div>

          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Keep learning,
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {displayName}.
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Continue your lessons, practise with CBT questions,
            complete assignments and track your progress throughout
            your {grade} journey.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => goToSection("lessons")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-black shadow-lg shadow-blue-500/20 transition hover:scale-[1.02]"
            >
              Continue Learning
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => goToSection("cbt")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Practice CBT
              <ClipboardList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Subjects"
          value="4"
          detail="Assigned to your class"
        />

        <StatCard
          icon={CheckCircle2}
          label="Lessons Completed"
          value="64"
          detail="Out of 94 lessons"
          iconClass="text-emerald-400"
        />

        <StatCard
          icon={Target}
          label="Average Score"
          value="78%"
          detail="Across recent CBTs"
          iconClass="text-violet-400"
        />

        <StatCard
          icon={Flame}
          label="Study Streak"
          value="6 days"
          detail="Keep it going!"
          iconClass="text-orange-400"
        />
      </section>

      {/* Main grid */}
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent lessons */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Continue
              </p>
              <h3 className="mt-1 text-xl font-black">
                Recent Lessons
              </h3>
            </div>

            <button
              onClick={() => goToSection("lessons")}
              className="text-xs font-bold text-slate-500 transition hover:text-cyan-400"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentLessons.map((lesson, index) => (
              <motion.button
                key={lesson.title}
                whileHover={{ x: 3 }}
                onClick={() => goToSection("lessons")}
                className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-300">
                  <PlayCircle className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {lesson.subject}
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-white">
                    {lesson.title}
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>

                    <span className="text-[10px] font-bold text-slate-600">
                      {lesson.progress}%
                    </span>
                  </div>
                </div>

                <div className="hidden items-center gap-1 text-xs text-slate-600 sm:flex">
                  <Clock3 className="h-3.5 w-3.5" />
                  {lesson.duration}
                </div>

                <ChevronRight className="h-4 w-4 text-slate-700" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Assignments */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-violet-400">
                Tasks
              </p>

              <h3 className="mt-1 text-xl font-black">
                Assignments
              </h3>
            </div>

            <button
              onClick={() => goToSection("assignments")}
              className="text-xs font-bold text-slate-500 transition hover:text-violet-400"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {assignments.slice(0, 3).map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-black/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {item.subject}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                      item.status === "Completed"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-orange-400/10 text-orange-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {item.status === "Completed"
                    ? "Completed"
                    : `Due ${item.due}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom cards */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400/10">
              <Flame className="h-6 w-6 text-orange-400" />
            </div>

            <div>
              <p className="text-sm font-black">6 Day Study Streak</p>
              <p className="mt-1 text-xs text-slate-600">
                Study today to reach your 7-day achievement.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {["M", "T", "W", "T", "F", "S", "S"].map(
              (day, index) => (
                <div key={`${day}-${index}`} className="text-center">
                  <p className="mb-2 text-[9px] font-bold text-slate-700">
                    {day}
                  </p>

                  <div
                    className={`h-8 rounded-lg ${
                      index < 6
                        ? "bg-cyan-400/20 border border-cyan-400/20"
                        : "border border-white/10 bg-white/[0.025]"
                    }`}
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.07] to-blue-500/[0.03] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10">
              <Trophy className="h-6 w-6 text-violet-400" />
            </div>

            <div>
              <p className="text-sm font-black">
                Your next achievement
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Complete one more study session to keep your
                learning streak alive.
              </p>
            </div>
          </div>

          <button
            onClick={() => goToSection("achievements")}
            className="mt-5 inline-flex items-center gap-2 text-xs font-black text-violet-400 hover:text-violet-300"
          >
            View achievements
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   SUBJECTS
========================================================= */

function SubjectsSection({ grade }) {
  return (
    <div>
      <SectionHeader
        eyebrow="Your curriculum"
        title="My Subjects"
        description={`Subjects assigned to you for ${grade}. Your progress will update as you complete lessons, activities and assessments.`}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {defaultSubjects.map((subject) => (
          <motion.div
            key={subject.code}
            whileHover={{ y: -5 }}
            className="group rounded-3xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-cyan-400/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-lg font-black text-cyan-300">
                {subject.icon}
              </div>

              <span className="text-[10px] font-black text-slate-700">
                {subject.code}
              </span>
            </div>

            <h3 className="mt-5 text-lg font-black">
              {subject.name}
            </h3>

            <p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-600">
              {subject.description}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600">
                  Progress
                </span>

                <span className="text-xs font-black text-cyan-400">
                  {subject.progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
              <span className="text-slate-600">
                {subject.completed}/{subject.lessons} lessons
              </span>

              <button className="font-bold text-cyan-400 transition hover:text-cyan-300">
                Open
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   LESSONS
========================================================= */

function LessonsSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="Learning"
        title="Lessons"
        description="Continue your lessons and build your understanding one topic at a time."
      />

      <div className="grid gap-4">
        {recentLessons.map((lesson, index) => (
          <motion.div
            key={lesson.title}
            whileHover={{ x: 3 }}
            className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                <PlayCircle className="h-7 w-7 text-cyan-400" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {lesson.subject}
                </p>

                <h3 className="mt-1 text-lg font-black">
                  {lesson.title}
                </h3>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      style={{
                        width: `${lesson.progress}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-600">
                    {lesson.progress}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock3 className="h-4 w-4" />
                  {lesson.duration}
                </div>

                <button className="rounded-xl bg-cyan-400/10 px-4 py-2.5 text-xs font-black text-cyan-400 transition hover:bg-cyan-400/15">
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CBT
========================================================= */

function CBTSection({ navigate }) {
  return (
    <div>
      <SectionHeader
        eyebrow="Practice"
        title="CBT Practice"
        description="Test your knowledge with computer-based practice questions and improve your examination readiness."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            title: "Subject Practice",
            description:
              "Practise questions from your individual school subjects.",
            icon: BookOpen,
            action: "Start Practice",
          },
          {
            title: "Timed Test",
            description:
              "Challenge yourself with a realistic timed examination.",
            icon: Clock3,
            action: "Take Test",
          },
          {
            title: "Past Questions",
            description:
              "Review examination-style questions and explanations.",
            icon: ClipboardList,
            action: "Explore",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10">
                <Icon className="h-6 w-6 text-blue-400" />
              </div>

              <h3 className="mt-5 text-lg font-black">
                {item.title}
              </h3>

              <p className="mt-2 min-h-[50px] text-sm leading-6 text-slate-600">
                {item.description}
              </p>

              <button
                onClick={() => navigate("/cbt")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2.5 text-xs font-black"
              >
                {item.action}
                <ArrowRightIcon />
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-cyan-400/10 bg-cyan-400/[0.03] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
            <Target className="h-7 w-7 text-cyan-400" />
          </div>

          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Current performance
            </p>

            <h3 className="mt-1 text-xl font-black">
              78% Average CBT Score
            </h3>

            <p className="mt-1 text-xs text-slate-600">
              Keep practising to reach your 85% target.
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-cyan-400">
              78%
            </p>
            <p className="text-[10px] font-bold text-slate-700">
              TARGET: 85%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return <ChevronRight className="h-4 w-4" />;
}

/* =========================================================
   ASSIGNMENTS
========================================================= */

function AssignmentsSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="School work"
        title="Assignments"
        description="Keep track of your class assignments, deadlines and completed work."
      />

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.title}
            className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10">
                <FileText className="h-6 w-6 text-violet-400" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-violet-400">
                  {assignment.subject}
                </p>

                <h3 className="mt-1 text-base font-black">
                  {assignment.title}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-xs text-slate-600">
                  {assignment.status === "Completed"
                    ? "Completed"
                    : `Due ${assignment.due}`}
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-[10px] font-black ${
                    assignment.status === "Completed"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-orange-400/10 text-orange-400"
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="Performance"
        title="My Progress"
        description="See how your learning is developing across your subjects."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          icon={Target}
          label="Average Score"
          value="78%"
          detail="+6% this month"
          iconClass="text-cyan-400"
        />

        <StatCard
          icon={BookMarked}
          label="Lessons"
          value="64"
          detail="Completed this term"
          iconClass="text-blue-400"
        />

        <StatCard
          icon={Clock3}
          label="Study Time"
          value="18h"
          detail="This month"
          iconClass="text-violet-400"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
        <h3 className="text-lg font-black">Subject Performance</h3>

        <div className="mt-6 space-y-5">
          {defaultSubjects.map((subject) => (
            <div key={subject.code}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold">
                  {subject.name}
                </span>

                <span className="text-xs font-black text-cyan-400">
                  {subject.progress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${subject.progress}%`,
                  }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ACHIEVEMENTS
========================================================= */

function AchievementsSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="Milestones"
        title="Achievements"
        description="Every lesson, test and study session gets you closer to your next achievement."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.title}
            whileHover={{ y: -4 }}
            className={`rounded-3xl border p-6 ${
              achievement.unlocked
                ? "border-cyan-400/15 bg-cyan-400/[0.035]"
                : "border-white/10 bg-white/[0.02] opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-4xl">
                {achievement.icon}
              </div>

              {achievement.unlocked ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <Lock className="h-5 w-5 text-slate-700" />
              )}
            </div>

            <h3 className="mt-6 font-black">
              {achievement.title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              {achievement.description}
            </p>

            <p
              className={`mt-5 text-[10px] font-black uppercase tracking-wider ${
                achievement.unlocked
                  ? "text-emerald-400"
                  : "text-slate-700"
              }`}
            >
              {achievement.unlocked ? "Unlocked" : "Locked"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfileSection({
  user,
  fullName,
  grade,
  initials,
}) {
  const email = user?.email || "Not available";
  const username = user?.username || "Not available";
  const phone =
    user?.phone ||
    user?.studentPhone ||
    "Not available";

  return (
    <div>
      <SectionHeader
        eyebrow="Account"
        title="My Profile"
        description="View the student information associated with your Scholiqen Academy account."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-black shadow-xl shadow-blue-500/20">
            {initials}
          </div>

          <h3 className="mt-5 text-xl font-black">
            {fullName}
          </h3>

          <p className="mt-1 text-sm text-cyan-400">
            {grade}
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-left">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />

              <div>
                <p className="text-xs font-black text-emerald-300">
                  Account Active
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  Your student account is active.
                </p>
              </div>
            </div>
          </div>

          <button className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-slate-400 transition hover:text-white">
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <h3 className="text-lg font-black">
            Student Information
          </h3>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ProfileField
              label="Full Name"
              value={fullName}
            />

            <ProfileField
              label="Username"
              value={username}
            />

            <ProfileField
              label="Email Address"
              value={email}
            />

            <ProfileField
              label="Phone Number"
              value={phone}
            />

            <ProfileField
              label="Class / Grade"
              value={grade}
            />

            <ProfileField
              label="Student ID"
              value={
                user?.student_id ||
                user?.studentId ||
                "Pending"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-700">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-slate-300">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   ENROLLMENT
========================================================= */

function EnrollmentSection({
  user,
  fullName,
  grade,
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="School records"
        title="Enrollment Details"
        description="Your Academy enrollment information and student status."
      />

      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
            <GraduationCap className="h-7 w-7 text-cyan-400" />
          </div>

          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Scholiqen Academy
            </p>

            <h3 className="mt-1 text-xl font-black">
              {fullName}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              {grade}
            </p>
          </div>

          <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-400">
            ENROLLED
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileField
            label="Academic Session"
            value={
              user?.academic_session ||
              user?.academicSession ||
              "2026/2027"
            }
          />

          <ProfileField
            label="School Level"
            value={
              user?.school_level ||
              user?.schoolLevel ||
              "Secondary"
            }
          />

          <ProfileField
            label="Class / Grade"
            value={grade}
          />

          <ProfileField
            label="Enrollment Status"
            value="Active"
          />

          <ProfileField
            label="Student ID"
            value={
              user?.student_id ||
              user?.studentId ||
              "Pending"
            }
          />

          <ProfileField
            label="Enrollment Date"
            value={
              user?.enrollment_date ||
              user?.enrollmentDate ||
              "Pending"
            }
          />
        </div>

        <div className="mt-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

            <div>
              <p className="text-sm font-black">
                Keep your student credentials safe
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Your username and password are used to access your
                Academy portal. Never share your password with
                another person.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
