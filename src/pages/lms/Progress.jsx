// src/pages/lms/Progress.jsx

import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  TrendingUp,
  BookOpen,
  Clock3,
  Target,
  Award,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

import { AuthContext } from "../../context/AuthContext";

import ProgressCard from "../../components/lms/ProgressCard";

const Progress = () => {

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);

  const [enrollments, setEnrollments] = useState([]);

  const [lessonProgress, setLessonProgress] = useState([]);

  const [taskSubmissions, setTaskSubmissions] = useState([]);

  const [certificates, setCertificates] = useState([]);

  const [overallProgress, setOverallProgress] = useState(0);

  /* ==========================================
        LOAD PROGRESS
  ========================================== */

  useEffect(() => {

    if (!user) return;

    loadProgress();

  }, [user]);

  const loadProgress = async () => {

    try {

      setLoading(true);

      /* =====================================
            COURSE ENROLLMENTS
      ===================================== */

      const {

        data: enrollmentData,
        error: enrollmentError,

      } = await supabase

        .from("course_enrollments")

        .select(`
          *,
          courses(*)
        `)

        .eq("student_id", user.id);

      if (enrollmentError) throw enrollmentError;

      setEnrollments(enrollmentData || []);

      /* =====================================
            LESSON PROGRESS
      ===================================== */

      const {

        data: lessonData,
        error: lessonError,

      } = await supabase

        .from("lesson_progress")

        .select("*")

        .eq("student_id", user.id);

      if (lessonError) throw lessonError;

      setLessonProgress(lessonData || []);

      /* =====================================
            TASK SUBMISSIONS
      ===================================== */

      const {

        data: submissionData,
        error: submissionError,

      } = await supabase

        .from("weekly_task_submissions")

        .select("*")

        .eq("student_id", user.id);

      if (submissionError) throw submissionError;

      setTaskSubmissions(submissionData || []);

      /* =====================================
            CERTIFICATES
      ===================================== */

      const {

        data: certificateData,
        error: certificateError,

      } = await supabase

        .from("certificates")

        .select("*")

        .eq("student_id", user.id);

      if (certificateError) throw certificateError;

      setCertificates(certificateData || []);

      /* =====================================
            OVERALL %
      ===================================== */

      if ((enrollmentData || []).length > 0) {

        const total = enrollmentData.reduce(

          (sum, item) => sum + (item.progress || 0),

          0

        );

        setOverallProgress(

          Math.round(total / enrollmentData.length)

        );

      } else {

        setOverallProgress(0);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  /* ==========================================
        COURSE CARDS
  ========================================== */

  const progressCourses = useMemo(() => {

    return enrollments.map((item) => ({

      id: item.id,

      title: item.courses?.title,

      instructor: item.courses?.instructor,

      progress: item.progress || 0,

      certificate: item.completed,

      lessonsCompleted:

        lessonProgress.filter(

          lesson => lesson.completed

        ).length,

      totalLessons:

        item.courses?.lessons_count || 0,

      color:

        "from-blue-600 to-cyan-500",

    }));

  }, [enrollments, lessonProgress]);
    /* ==========================================
        STATS
  ========================================== */

  const stats = [

    {
      title: "Enrolled Courses",
      value: enrollments.length,
      icon: BookOpen,
      color: "text-blue-400",
    },

    {
      title: "Lessons Completed",
      value: lessonProgress.filter(
        lesson => lesson.completed
      ).length,
      icon: Clock3,
      color: "text-cyan-400",
    },

    {
      title: "Tasks Submitted",
      value: taskSubmissions.length,
      icon: Target,
      color: "text-orange-400",
    },

    {
      title: "Certificates",
      value: certificates.length,
      icon: Award,
      color: "text-yellow-400",
    },

  ];

  /* ==========================================
        LOADING
  ========================================== */

  if (loading) {

    return (

      <div className="flex min-h-[70vh] items-center justify-center">

        <Loader2
          size={44}
          className="animate-spin text-blue-500"
        />

      </div>

    );

  }

  return (

    <motion.div

      initial={{
        opacity: 0,
      }}

      animate={{
        opacity: 1,
      }}

      transition={{
        duration: 0.4,
      }}

      className="space-y-10"

    >

      {/* ===================================
            HEADER
      =================================== */}

      <div>

        <h1 className="text-4xl font-bold">

          Learning Progress

        </h1>

        <p className="mt-2 text-slate-400">

          Monitor your enrolled courses,
          completed lessons,
          submitted tasks
          and certificates.

        </p>

      </div>

      {/* ===================================
            STATS
      =================================== */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((item) => {

          const Icon = item.icon;

          return (

            <div

              key={item.title}

              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"

            >

              <Icon
                size={36}
                className={item.color}
              />

              <h2 className="mt-5 text-3xl font-bold">

                {item.value}

              </h2>

              <p className="mt-2 text-slate-400">

                {item.title}

              </p>

            </div>

          );

        })}

      </div>

      {/* ===================================
            OVERALL PROGRESS
      =================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-bold">

            Overall Progress

          </h2>

          <span className="text-3xl font-bold text-blue-400">

            {overallProgress}%

          </span>

        </div>

        <div className="h-5 overflow-hidden rounded-full bg-slate-800">

          <div

            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"

            style={{
              width: `${overallProgress}%`,
            }}

          />

        </div>

      </div>

      {/* ===================================
            COURSE PROGRESS
      =================================== */}

      <div>

        <h2 className="mb-6 text-3xl font-bold">

          Course Progress

        </h2>

        {progressCourses.length > 0 ? (

          <div className="grid gap-8 lg:grid-cols-2">
                        {progressCourses.map((course) => (

              <ProgressCard
                key={course.id}
                {...course}
              />

            ))}

          </div>

        ) : (

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">

            <BookOpen
              size={54}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-6 text-2xl font-bold text-white">

              No Enrolled Courses

            </h3>

            <p className="mt-3 text-slate-400">

              Enroll in a course to begin tracking your learning progress.

            </p>

          </div>

        )}

      </div>

      {/* ===================================
            CERTIFICATES
      =================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">

        <div className="mb-8 flex items-center gap-3">

          <Award
            size={28}
            className="text-yellow-400"
          />

          <h2 className="text-2xl font-bold">

            Certificates Earned

          </h2>

        </div>

        {certificates.length > 0 ? (

          <div className="grid gap-5 md:grid-cols-2">

            {certificates.map((certificate) => (

              <div

                key={certificate.id}

                className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5"

              >

                <CheckCircle2
                  size={34}
                  className="text-green-400"
                />

                <div>

                  <h3 className="font-semibold text-white">

                    Certificate #

                    {certificate.certificate_number}

                  </h3>

                  <p className="mt-1 text-sm text-slate-400">

                    Issued{" "}

                    {new Date(
                      certificate.issued_at
                    ).toLocaleDateString()}

                  </p>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">

            <Award
              size={48}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-5 text-xl font-bold">

              No Certificates Yet

            </h3>

            <p className="mt-3 text-slate-400">

              Complete courses successfully to unlock certificates.

            </p>

          </div>

        )}

      </div>

    </motion.div>

  );

};

export default Progress;