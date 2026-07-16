import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  Loader2,
  BookOpen,
  FileText,
  ClipboardList,
  ClipboardCheck,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const TopicDetails = () => {

  const navigate = useNavigate();

  const {
    courseId,
    topicId,
  } = useParams();

  /* ===================================
      STATE
  =================================== */

  const [loading, setLoading] = useState(true);

  const [topic, setTopic] = useState(null);

  const [resources, setResources] = useState([]);

  const [weeklyTasks, setWeeklyTasks] = useState([]);

  const [monthlyQuizzes, setMonthlyQuizzes] = useState([]);

  /* ===================================
      FETCH EVERYTHING
  =================================== */

  useEffect(() => {

    fetchTopic();

  }, [topicId]);

  const fetchTopic = async () => {

    try {

      setLoading(true);

      /* ----------------------------
          Topic
      ---------------------------- */

      const {
        data: topicData,
        error: topicError,
      } = await supabase

        .from("course_topics")

        .select(`
          *,
          courses(
            id,
            title
          )
        `)

        .eq("id", topicId)

        .single();

      if (topicError) throw topicError;

      setTopic(topicData);

      /* ----------------------------
          Resources
      ---------------------------- */

      const {
        data: resourceData,
        error: resourceError,
      } = await supabase

        .from("resources")

        .select("*")

        .eq("topic_id", topicId)

        .order("created_at", {
          ascending: true,
        });

      if (resourceError) throw resourceError;

      setResources(resourceData || []);

      /* ----------------------------
          Weekly Tasks
      ---------------------------- */

      const {
        data: taskData,
        error: taskError,
      } = await supabase

        .from("weekly_tasks")

        .select("*")

        .eq("topic_id", topicId)

        .order("week", {
          ascending: true,
        });

      if (taskError) throw taskError;

      setWeeklyTasks(taskData || []);

      /* ----------------------------
          Monthly Quizzes
      ---------------------------- */

      const {
        data: quizData,
        error: quizError,
      } = await supabase

        .from("monthly_quizzes")

        .select("*")

        .eq("topic_id", topicId)

        .order("quiz_number", {
          ascending: true,
        });

      if (quizError) throw quizError;

      setMonthlyQuizzes(quizData || []);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  /* ===================================
      LOADING
  =================================== */

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center">

        <Loader2
          size={48}
          className="animate-spin text-blue-500"
        />

      </div>

    );

  }

  /* ===================================
      NOT FOUND
  =================================== */

  if (!topic) {

    return (

      <div className="flex min-h-screen items-center justify-center">

        <div className="text-center">

          <BookOpen
            size={70}
            className="mx-auto text-slate-600"
          />

          <h2 className="mt-6 text-3xl font-bold text-white">

            Topic Not Found

          </h2>

          <p className="mt-3 text-slate-400">

            This topic no longer exists.

          </p>

          <button

            onClick={() => navigate(-1)}

            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"

          >

            Go Back

          </button>

        </div>

      </div>

    );

  }

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.4,
      }}

      className="mx-auto max-w-7xl space-y-10 px-6 py-10"

    >

      {/* ===================================
          HERO
      =================================== */}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 bg-gradient-to-r from-blue-600/20 to-cyan-500/10 p-8">

          <button

            onClick={() => navigate(`/courses/${courseId}`)}

            className="mb-8 flex items-center gap-2 text-slate-400 transition hover:text-white"

          >

            <ArrowLeft size={18} />

            Back To Course

          </button>

          <h1 className="text-4xl font-bold text-white">

            {topic.title}

          </h1>

          <p className="mt-5 max-w-4xl text-slate-400">

            {topic.description ||

              "No description has been added for this topic yet."}

          </p>

        </div>

        <div className="grid gap-6 p-8 md:grid-cols-3">

          <div className="rounded-2xl border border-blue-500/20 bg-slate-950 p-6">

            <FileText
              className="mb-4 text-blue-400"
            />

            <h3 className="text-lg font-semibold text-white">

              Resources

            </h3>

            <p className="mt-2 text-3xl font-bold text-blue-400">

              {resources.length}

            </p>

          </div>

          <div className="rounded-2xl border border-green-500/20 bg-slate-950 p-6">

            <ClipboardList
              className="mb-4 text-green-400"
            />

            <h3 className="text-lg font-semibold text-white">

              Weekly Tasks

            </h3>

            <p className="mt-2 text-3xl font-bold text-green-400">

              {weeklyTasks.length}

            </p>

          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-slate-950 p-6">

            <ClipboardCheck
              className="mb-4 text-purple-400"
            />

            <h3 className="text-lg font-semibold text-white">

              Monthly Quizzes

            </h3>

            <p className="mt-2 text-3xl font-bold text-purple-400">

              {monthlyQuizzes.length}

            </p>

          </div>

        </div>

      </div>

      {/* ===========================
          RESOURCES SECTION
      =========================== */}
            {/* ===========================================
          MONTHLY QUIZZES
      =========================================== */}

      <section className="space-y-6">

        <div className="flex items-center gap-3">

          <ClipboardCheck
            size={28}
            className="text-purple-400"
          />

          <h2 className="text-2xl font-bold text-white">
            Monthly Quizzes
          </h2>

        </div>

        {

          monthlyQuizzes.length > 0 ? (

            <div className="grid gap-6 md:grid-cols-2">

              {

                monthlyQuizzes.map((quiz) => (

                  <motion.div

                    key={quiz.id}

                    whileHover={{
                      y: -5,
                    }}

                    className="
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-900
                      p-6
                    "

                  >

                    <div className="flex items-start justify-between">

                      <div>

                        <h3 className="text-xl font-semibold text-white">

                          {quiz.title}

                        </h3>

                        <p className="mt-2 text-sm text-slate-400">

                          {
                            quiz.description ||
                            "No description available."
                          }

                        </p>

                      </div>

                      <span
                        className="
                          rounded-xl
                          bg-purple-500/10
                          px-3
                          py-2
                          text-xs
                          font-medium
                          text-purple-400
                        "
                      >

                        Quiz {quiz.quiz_number}

                      </span>

                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">

                      <div className="rounded-xl bg-slate-950 p-4">

                        <p className="text-xs uppercase text-slate-500">
                          Duration
                        </p>

                        <p className="mt-2 text-lg font-semibold text-white">
                          {quiz.duration} mins
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-950 p-4">

                        <p className="text-xs uppercase text-slate-500">
                          Pass Score
                        </p>

                        <p className="mt-2 text-lg font-semibold text-green-400">
                          {quiz.passing_score}%
                        </p>

                      </div>

                    </div>

                    <div className="mt-6 flex gap-3">

                      <button

                        onClick={() =>
                          navigate(`/quiz/${quiz.id}`)
                        }

                        className="
                          flex-1
                          rounded-xl
                          bg-blue-600
                          py-3
                          font-semibold
                          text-white
                          transition
                          hover:bg-blue-500
                        "

                      >

                        Start Quiz

                      </button>

                    </div>

                  </motion.div>

                ))

              }

            </div>

          ) : (

            <div
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                p-12
                text-center
              "
            >

              <ClipboardCheck
                size={55}
                className="mx-auto text-slate-600"
              />

              <h3 className="mt-5 text-xl font-semibold text-white">
                No Monthly Quizzes
              </h3>

              <p className="mt-3 text-slate-400">
                Your instructor hasn't published any quiz for this topic yet.
              </p>

            </div>

          )

        }

      </section>

    </motion.div>

  );

};

export default TopicDetails;