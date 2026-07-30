import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  CalendarDays,
  Trophy,
  Target,
  Zap,
} from "lucide-react";

const StreakCard = ({
  streak = 0,
  longestStreak = 0,
  weeklyActivity = [],
  title = "Learning Streak",
}) => {
  const activeDays = useMemo(() => {
    return weeklyActivity.filter(
      (day) => day.completed
    ).length;
  }, [weeklyActivity]);

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

      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/20 p-4">

            <Flame
              size={34}
              className="text-white"
            />

          </div>

          <div>

            <h2 className="text-2xl font-black text-white">
              {title}
            </h2>

            <p className="text-orange-100">
              Keep your daily learning habit alive.
            </p>

          </div>

        </div>

      </div>


      {/* Main Stats */}

      <div className="grid gap-5 p-6 md:grid-cols-3">


        <div className="rounded-2xl bg-black/20 p-5">

          <Flame
            size={28}
            className="text-orange-400"
          />

          <h3 className="mt-4 text-3xl font-black text-white">
            {streak}
          </h3>

          <p className="text-slate-400">
            Current Streak
          </p>

        </div>



        <div className="rounded-2xl bg-black/20 p-5">

          <Trophy
            size={28}
            className="text-yellow-400"
          />

          <h3 className="mt-4 text-3xl font-black text-white">
            {longestStreak}
          </h3>

          <p className="text-slate-400">
            Best Streak
          </p>

        </div>



        <div className="rounded-2xl bg-black/20 p-5">

          <Target
            size={28}
            className="text-cyan-400"
          />

          <h3 className="mt-4 text-3xl font-black text-white">
            {activeDays}
          </h3>

          <p className="text-slate-400">
            Active Days
          </p>

        </div>


      </div>


      {/* Weekly Calendar */}

      <div className="border-t border-white/10 p-6">


        <div className="mb-5 flex items-center gap-3">

          <CalendarDays
            size={22}
            className="text-cyan-400"
          />

          <h3 className="font-bold text-white">
            Weekly Activity
          </h3>

        </div>



        <div className="grid grid-cols-7 gap-3">

          {weeklyActivity.length ? (
            weeklyActivity.map((day, index) => (

              <motion.div
                key={index}
                whileHover={{
                  scale: 1.05,
                }}
                className={`aspect-square rounded-2xl border flex flex-col items-center justify-center ${
                  day.completed
                    ? "border-orange-500 bg-orange-500/20"
                    : "border-white/10 bg-black/20"
                }`}
              >

                <span className="text-xs text-slate-400">
                  {day.label}
                </span>

                {day.completed && (
                  <Flame
                    size={20}
                    className="mt-2 text-orange-400"
                  />
                )}

              </motion.div>

            ))
          ) : (

            Array.from({
              length: 7,
            }).map((_, index) => (

              <div
                key={index}
                className="aspect-square rounded-2xl border border-white/10 bg-black/20"
              />

            ))

          )}

        </div>


      </div>


      {/* Motivation */}

      <div className="border-t border-white/10 bg-black/20 p-6">

        <div className="flex items-center gap-3">

          <Zap
            size={22}
            className="text-yellow-400"
          />

          <p className="text-slate-300">
            Daily practice increases your memory,
            confidence, and language speed.
          </p>

        </div>

      </div>


    </motion.section>
  );
};

export default StreakCard;