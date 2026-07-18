// src/pages/lms/Tasks.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  ClipboardList,
  ClipboardCheck,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";

import TaskCard from "../../components/lms/WeeklyTaskCard";

const Tasks = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [weeklyTasks, setWeeklyTasks] = useState([]);

  const [monthlyTasks, setMonthlyTasks] = useState([]);

  useEffect(() => {

    loadTasks();

  }, []);

  const loadTasks = async () => {

    try {

      setLoading(true);

      /* ===============================
          WEEKLY TASKS
      =============================== */

      const {

        data: weekly,

        error: weeklyError,

      } = await supabase

        .from("weekly_tasks")

        .select(`
          *,
          course_topics(
            id,
            title
          ),
          courses(
            id,
            title
          )
        `)

        .order("week", {
          ascending: true,
        });

      if (weeklyError) throw weeklyError;

      setWeeklyTasks(weekly || []);

      /* ===============================
          MONTHLY TASKS
      =============================== */

      const {

        data: monthly,

        error: monthlyError,

      } = await supabase

        .from("monthly_quizzes")

        .select(`
          *,
          course_topics(
            id,
            title
          ),
          courses(
            id,
            title
          )
        `)

        .order("quiz_number", {
          ascending: true,
        });

      if (monthlyError) throw monthlyError;

      const formattedMonthly =

        (monthly || []).map((item) => ({

          ...item,

          task_type: "monthly",

          month: item.quiz_number,

          due_date: item.available_until,

        }));

      setMonthlyTasks(formattedMonthly);

    }

    catch (error) {

      console.error(error);

    }

    finally {

      setLoading(false);

    }

  };

  const filteredWeekly = useMemo(() => {

    return weeklyTasks.filter((task) =>

      task.title
        ?.toLowerCase()
        .includes(search.toLowerCase())

      ||

      task.course_topics?.title
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [weeklyTasks, search]);

  const filteredMonthly = useMemo(() => {

    return monthlyTasks.filter((task) =>

      task.title
        ?.toLowerCase()
        .includes(search.toLowerCase())

      ||

      task.course_topics?.title
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [monthlyTasks, search]);
    if (loading) {

    return (

      <div className="flex min-h-[60vh] items-center justify-center">

        <Loader2
          size={46}
          className="animate-spin text-blue-500"
        />

      </div>

    );

  }

  return (

    <div className="space-y-8">

      {/* ======================================
            HEADER
      ====================================== */}

      <div>

        <h1 className="text-4xl font-bold text-white">

          Tasks

        </h1>

        <p className="mt-2 text-slate-400">

          Complete your weekly assignments and monthly assessments.

        </p>

      </div>

      {/* ======================================
            SEARCH
      ====================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">

        <div className="flex items-center gap-3">

          <Search
            size={20}
            className="text-slate-500"
          />

          <input

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

            placeholder="Search tasks..."

            className="
              w-full
              bg-transparent
              outline-none
              text-white
              placeholder:text-slate-500
            "

          />

        </div>

      </div>

      {/* ======================================
            STATS
      ====================================== */}

      <div className="grid gap-6 md:grid-cols-2">

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center gap-3">

            <ClipboardList
              className="text-blue-400"
              size={28}
            />

            <h2 className="text-xl font-semibold text-white">

              Weekly Tasks

            </h2>

          </div>

          <p className="mt-5 text-5xl font-bold text-white">

            {filteredWeekly.length}

          </p>

          <p className="mt-2 text-slate-400">

            Weekly activities available

          </p>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center gap-3">

            <ClipboardCheck
              className="text-purple-400"
              size={28}
            />

            <h2 className="text-xl font-semibold text-white">

              Monthly Tasks

            </h2>

          </div>

          <p className="mt-5 text-5xl font-bold text-white">

            {filteredMonthly.length}

          </p>

          <p className="mt-2 text-slate-400">

            Monthly assessments available

          </p>

        </div>

      </div>

      {/* ======================================
            WEEKLY TASKS
      ====================================== */}

      <section className="space-y-5">

        <div className="flex items-center gap-3">

          <ClipboardList
            className="text-blue-400"
            size={24}
          />

          <h2 className="text-2xl font-bold text-white">

            Weekly Tasks

          </h2>

        </div>

        <div className="grid gap-6">
          {filteredWeekly.length === 0 ? (

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">

              <ClipboardList
                size={52}
                className="mx-auto text-slate-600"
              />

              <h3 className="mt-5 text-2xl font-bold text-white">
                No Weekly Tasks
              </h3>

              <p className="mt-2 text-slate-400">
                Your instructor hasn't assigned any weekly tasks yet.
              </p>

            </div>

          ) : (

            filteredWeekly.map((task) => (

              <TaskCard
                key={task.id}
                task={task}
                type="weekly"
              />

            ))

          )}

        </div>

      </section>

      {/* ======================================
            MONTHLY TASKS
      ====================================== */}

      <section className="space-y-5">

        <div className="flex items-center gap-3">

          <ClipboardCheck
            className="text-purple-400"
            size={24}
          />

          <h2 className="text-2xl font-bold text-white">

            Monthly Tasks

          </h2>

        </div>

        <div className="grid gap-6">

          {filteredMonthly.length === 0 ? (

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">

              <ClipboardCheck
                size={52}
                className="mx-auto text-slate-600"
              />

              <h3 className="mt-5 text-2xl font-bold text-white">
                No Monthly Tasks
              </h3>

              <p className="mt-2 text-slate-400">
                Your instructor hasn't published any monthly assessment yet.
              </p>

            </div>

          ) : (

            filteredMonthly.map((task) => (

              <TaskCard
                key={task.id}
                task={task}
                type="monthly"
              />

            ))

          )}

        </div>

      </section>

    </div>

  );

};

export default Tasks;