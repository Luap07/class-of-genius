import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Flame,
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const DailyGoal = ({
  title = "Daily Learning Goal",
  goal = 30,
  completed = 0,
  unit = "minutes",
  lessonsCompleted = 0,
  wordsLearned = 0,
}) => {
  const progress = useMemo(() => {
    if (!goal) return 0;

    return Math.min(
      100,
      Math.round((completed / goal) * 100)
    );
  }, [completed, goal]);


  const completedGoal = progress >= 100;


  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >

      {/* Header */}

      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/10 p-4">

            <Target
              size={32}
              className="text-white"
            />

          </div>


          <div>

            <h2 className="text-2xl font-black text-white">
              {title}
            </h2>

            <p className="text-emerald-100">
              Build consistency with daily practice.
            </p>

          </div>


        </div>

      </div>


      {/* Main Progress */}

      <div className="p-8">


        <div className="text-center">

          <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-8 border-white/10">

            <div className="text-center">

              <h3 className="text-4xl font-black text-white">
                {progress}%
              </h3>

              <p className="text-sm text-slate-400">
                Complete
              </p>

            </div>

          </div>


          <p className="mt-5 text-slate-300">

            {completed} / {goal} {unit}

          </p>


        </div>



        {/* Progress Bar */}

        <div className="mt-8">

          <div className="h-4 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 1,
              }}
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
            />

          </div>

        </div>


        {/* Stats */}

        <div className="mt-8 grid gap-5 md:grid-cols-3">


          <div className="rounded-2xl bg-black/20 p-5">

            <BookOpen
              size={26}
              className="text-cyan-400"
            />

            <h3 className="mt-3 text-2xl font-black text-white">
              {lessonsCompleted}
            </h3>

            <p className="text-slate-400">
              Lessons
            </p>

          </div>



          <div className="rounded-2xl bg-black/20 p-5">

            <Sparkles
              size={26}
              className="text-yellow-400"
            />

            <h3 className="mt-3 text-2xl font-black text-white">
              {wordsLearned}
            </h3>

            <p className="text-slate-400">
              Words Learned
            </p>

          </div>



          <div className="rounded-2xl bg-black/20 p-5">

            <Clock
              size={26}
              className="text-purple-400"
            />

            <h3 className="mt-3 text-2xl font-black text-white">
              {completed}
            </h3>

            <p className="text-slate-400">
              Time Spent
            </p>

          </div>


        </div>


      </div>



      {/* Status */}

      <div className="border-t border-white/10 bg-black/20 p-6">


        <div className="flex items-center gap-3">

          {completedGoal ? (

            <>

              <CheckCircle2
                size={26}
                className="text-green-400"
              />

              <p className="font-semibold text-green-300">
                Daily goal completed! Great job.
              </p>

            </>

          ) : (

            <>

              <Flame
                size={26}
                className="text-orange-400"
              />

              <p className="text-slate-300">
                Keep going! Complete your daily target.
              </p>

            </>

          )}

        </div>


      </div>


    </motion.section>
  );
};

export default DailyGoal;