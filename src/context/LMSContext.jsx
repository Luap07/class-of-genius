import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const LMSContext = createContext();

export const LMSProvider = ({ children }) => {
  /* =========================
      STUDENT
  ========================= */

  const [student] = useState({
    name: "Student",
    level: "SS3",
  });

  /* =========================
      COURSES
  ========================= */

  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Physics",
      duration: "18 Hours",
      progress: 72,
      lessonsCompleted: 18,
      totalLessons: 25,
      currentLesson: "Newton's Laws",
    },
    {
      id: 2,
      title: "Chemistry",
      duration: "20 Hours",
      progress: 45,
      lessonsCompleted: 9,
      totalLessons: 20,
      currentLesson: "Acid Base Titration",
    },
    {
      id: 3,
      title: "Mathematics",
      duration: "25 Hours",
      progress: 90,
      lessonsCompleted: 27,
      totalLessons: 30,
      currentLesson: "Differentiation",
    },
  ]);

  /* =========================
      STUDY DATA
  ========================= */

  const [studyHours, setStudyHours] = useState(148);

  const [streak, setStreak] = useState(28);

  /* =========================
      WEEKLY PROGRESS
  ========================= */

  const [weeklyProgress, setWeeklyProgress] = useState([
    { day: "Mon", value: 35 },
    { day: "Tue", value: 60 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 80 },
    { day: "Fri", value: 72 },
    { day: "Sat", value: 95 },
    { day: "Sun", value: 50 },
  ]);

  /* =========================
      CONTINUE LEARNING
  ========================= */

  const continueLearning = useMemo(() => {
    return courses.filter((c) => c.progress < 100);
  }, [courses]);

  /* =========================
      COMPLETE LESSON
  ========================= */

  const completeLesson = (courseId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== courseId) return course;

        const completed = Math.min(
          course.lessonsCompleted + 1,
          course.totalLessons
        );

        return {
          ...course,
          lessonsCompleted: completed,
          progress: Math.round(
            (completed / course.totalLessons) * 100
          ),
        };
      })
    );

    setStudyHours((prev) => prev + 1);

    setWeeklyProgress((prev) => {
      const today = new Date().getDay();

      const index = today === 0 ? 6 : today - 1;

      return prev.map((item, i) =>
        i === index
          ? {
              ...item,
              value: Math.min(item.value + 5, 100),
            }
          : item
      );
    });
  };

  /* =========================
      ASSIGNMENTS
  ========================= */

  const [upcomingAssignments] = useState([
    {
      id: 1,
      title: "Physics Quiz",
      course: "Physics",
      dueDate: "Tomorrow",
      priority: "High",
    },
    {
      id: 2,
      title: "Chemistry Practical",
      course: "Chemistry",
      dueDate: "Friday",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Statistics Worksheet",
      course: "Mathematics",
      dueDate: "Next Week",
      priority: "Low",
    },
  ]);

  /* =========================
      CERTIFICATES
  ========================= */

  const certificates = useMemo(() => {
    return courses.filter((c) => c.progress === 100);
  }, [courses]);

  /* =========================
      ACHIEVEMENTS
  ========================= */

  const achievements = useMemo(() => {
    const list = [];

    if (studyHours >= 10) {
      list.push({
        id: 1,
        title: "Study Starter",
        description: "Studied for 10 hours.",
        icon: "📘",
        color: "from-blue-600 to-cyan-500",
      });
    }

    if (studyHours >= 50) {
      list.push({
        id: 2,
        title: "Dedicated Learner",
        description: "Studied for 50 hours.",
        icon: "🔥",
        color: "from-orange-500 to-red-500",
      });
    }

    if (studyHours >= 100) {
      list.push({
        id: 3,
        title: "Study Master",
        description: "Studied for 100 hours.",
        icon: "🏆",
        color: "from-yellow-500 to-amber-500",
      });
    }

    if (streak >= 7) {
      list.push({
        id: 4,
        title: "7 Day Streak",
        description: "Studied for seven consecutive days.",
        icon: "⚡",
        color: "from-purple-600 to-pink-600",
      });
    }

    certificates.forEach((course) => {
      list.push({
        id: `course-${course.id}`,
        title: `${course.title} Master`,
        description: `Completed the ${course.title} course.`,
        icon: "🎓",
        color: "from-emerald-500 to-green-600",
      });
    });

    return list;
  }, [studyHours, streak, certificates]);

  /* =========================
      TOTALS
  ========================= */

  const totalCourses = courses.length;

  const completedLessons = courses.reduce(
    (sum, c) => sum + c.lessonsCompleted,
    0
  );

  const totalLessons = courses.reduce(
    (sum, c) => sum + c.totalLessons,
    0
  );

  /* =========================
      PROVIDER
  ========================= */

  return (
    <LMSContext.Provider
      value={{
        student,

        courses,
        setCourses,

        continueLearning,

        weeklyProgress,
        setWeeklyProgress,

        totalCourses,
        completedLessons,
        totalLessons,

        studyHours,
        setStudyHours,

        streak,
        setStreak,

        certificates,

        achievements,

        upcomingAssignments,

        completeLesson,
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => useContext(LMSContext);

export default LMSContext;