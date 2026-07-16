import React, {
  useEffect,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  BookOpen,
  ClipboardList,
  ClipboardCheck,
  ArrowRight,
  Loader2,
  Clock3,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../../lib/supabaseClient";

const ModuleAccordion = ({ course }) => {

  const navigate = useNavigate();

  /* ======================================================
      STATE
  ====================================================== */

  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openTopic, setOpenTopic] = useState(null);

  /* ======================================================
      LOAD TOPICS
  ====================================================== */

  useEffect(() => {

    if (!course?.id) return;

    loadTopics();

  }, [course]);

  const loadTopics = async () => {

    try {

      setLoading(true);

      setError("");

      const {

        data: topicData,

        error: topicError,

      } = await supabase

        .from("course_topics")

        .select("*")

        .eq("course_id", course.id)

        .order("position", {
          ascending: true,
        });

      if (topicError) throw topicError;

      const formattedTopics = [];

      for (const topic of topicData || []) {

        const {

          count: resourceCount,

        } = await supabase

          .from("resources")

          .select("*", {
            count: "exact",
            head: true,
          })

          .eq("topic_id", topic.id);

        const {

          count: weeklyTaskCount,

        } = await supabase

          .from("weekly_tasks")

          .select("*", {
            count: "exact",
            head: true,
          })

          .eq("topic_id", topic.id);

        const {

          count: monthlyQuizCount,

        } = await supabase

          .from("monthly_quizzes")

          .select("*", {
            count: "exact",
            head: true,
          })

          .eq("topic_id", topic.id);

        formattedTopics.push({

          ...topic,

          resources:

            resourceCount || 0,

          weeklyTasks:

            weeklyTaskCount || 0,

          quizzes:

            monthlyQuizCount || 0,

        });

      }

      setTopics(formattedTopics);

      if (formattedTopics.length > 0) {

        setOpenTopic(formattedTopics[0].id);

      }

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  /* ======================================================
      HANDLERS
  ====================================================== */

  const toggleTopic = (id) => {

    setOpenTopic((previous) =>

      previous === id

        ? null

        : id

    );

  };

  const openTopicDetails = (topic) => {

    navigate(

      `/courses/${course.id}/topic/${topic.id}`

    );

  };

  /* ======================================================
      LOADING
  ====================================================== */

  if (loading) {

    return (

      <div className="flex justify-center py-24">

        <Loader2

          size={42}

          className="animate-spin text-blue-500"

        />

      </div>

    );

  }

  if (error) {

    return (

      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">

        <h2 className="text-2xl font-bold text-red-400">

          Failed to load course topics

        </h2>

        <p className="mt-3 text-slate-300">

          {error}

        </p>

      </div>

    );

  }
    /* ======================================================
      MAIN UI
  ====================================================== */

  return (

    <div className="space-y-6">

      <div>

        <h2 className="text-3xl font-bold text-white">

          Course Curriculum

        </h2>

        <p className="mt-2 text-slate-400">

          Browse each topic to access its resources,
          weekly tasks and monthly quizzes.

        </p>

      </div>

      {

        topics.length === 0 && (

          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-slate-700
              bg-slate-900
              py-20
              text-center
            "
          >

            <FolderOpen
              size={54}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-6 text-2xl font-semibold text-white">

              No Topics Yet

            </h3>

            <p className="mt-3 text-slate-400">

              This course doesn't have any topics yet.

            </p>

          </div>

        )

      }

      {

        topics.map((topic,index)=>(

          <motion.div

            key={topic.id}

            layout

            initial={{
              opacity:0,
              y:20,
            }}

            animate={{
              opacity:1,
              y:0,
            }}

            transition={{
              delay:index*0.05,
            }}

            className="
              overflow-hidden
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
            "

          >

            <button

              onClick={()=>
                toggleTopic(topic.id)
              }

              className="
                flex
                w-full
                items-center
                justify-between
                p-7
                text-left
              "

            >

              <div>

                <div className="flex items-center gap-3">

                  <FolderOpen
                    size={24}
                    className="text-blue-400"
                  />

                  <h3 className="text-2xl font-bold text-white">

                    {topic.title}

                  </h3>

                </div>

                {

                  topic.description && (

                    <p className="mt-3 text-slate-400">

                      {topic.description}

                    </p>

                  )

                }

              </div>

              <div className="flex items-center gap-5">

                <div className="flex items-center gap-2 text-slate-500">

                  <Clock3 size={16}/>

                  {topic.duration || "-"}

                </div>

                {

                  openTopic===topic.id

                  ?

                  <ChevronDown
                    className="text-slate-400"
                  />

                  :

                  <ChevronRight
                    className="text-slate-400"
                  />

                }

              </div>

            </button>

            <AnimatePresence>

              {

                openTopic===topic.id && (

                  <motion.div

                    initial={{
                      height:0,
                      opacity:0,
                    }}

                    animate={{
                      height:"auto",
                      opacity:1,
                    }}

                    exit={{
                      height:0,
                      opacity:0,
                    }}

                    className="
                      border-t
                      border-slate-800
                    "

                  >

                    <div className="grid gap-6 p-7 md:grid-cols-3">
                                            {/* ===============================
                          RESOURCES
                      =============================== */}

                      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                        <div className="flex items-center gap-3">

                          <BookOpen
                            size={22}
                            className="text-blue-400"
                          />

                          <h4 className="text-lg font-semibold text-white">

                            Resources

                          </h4>

                        </div>

                        <p className="mt-5 text-4xl font-bold text-white">

                          {topic.resources}

                        </p>

                        <p className="mt-2 text-slate-400">

                          Learning materials

                        </p>

                      </div>

                      {/* ===============================
                          WEEKLY TASKS
                      =============================== */}

                      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                        <div className="flex items-center gap-3">

                          <ClipboardList
                            size={22}
                            className="text-orange-400"
                          />

                          <h4 className="text-lg font-semibold text-white">

                            Weekly Tasks

                          </h4>

                        </div>

                        <p className="mt-5 text-4xl font-bold text-white">

                          {topic.weeklyTasks}

                        </p>

                        <p className="mt-2 text-slate-400">

                          Practice activities

                        </p>

                      </div>

                      {/* ===============================
                          MONTHLY QUIZZES
                      =============================== */}

                      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                        <div className="flex items-center gap-3">

                          <ClipboardCheck
                            size={22}
                            className="text-green-400"
                          />

                          <h4 className="text-lg font-semibold text-white">

                            Monthly Quizzes

                          </h4>

                        </div>

                        <p className="mt-5 text-4xl font-bold text-white">

                          {topic.quizzes}

                        </p>

                        <p className="mt-2 text-slate-400">

                          Assessments

                        </p>

                      </div>

                    </div>

                    {/* ===============================
                        OPEN TOPIC
                    =============================== */}

                    <div className="border-t border-slate-800 p-7">

                      <button

                        onClick={() =>
                          openTopicDetails(topic)
                        }

                        className="
                          flex
                          items-center
                          justify-center
                          gap-3
                          rounded-2xl
                          bg-gradient-to-r
                          from-blue-600
                          to-cyan-500
                          px-8
                          py-4
                          font-semibold
                          text-white
                          transition
                          hover:scale-[1.02]
                        "

                      >

                        Open Topic

                        <ArrowRight size={20} />

                      </button>

                    </div>

                  </motion.div>

                )

              }

            </AnimatePresence>

          </motion.div>

        ))

      }

    </div>

  );

};

export default ModuleAccordion;