import React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Lock,
  Trophy,
  Star,
  CheckCircle2,
} from "lucide-react";

const AchievementCard = ({
  title = "Achievements",
  achievements = [],
}) => {
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

      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/10 p-4">

            <Award
              size={34}
              className="text-white"
            />

          </div>

          <div>

            <h2 className="text-2xl font-black text-white">
              {title}
            </h2>

            <p className="text-purple-100">
              Unlock rewards as you improve.
            </p>

          </div>

        </div>

      </div>


      {/* Achievements */}

      <div className="grid gap-5 p-6 md:grid-cols-2">

        {achievements.length ? (

          achievements.map((achievement) => (

            <motion.div
              key={achievement.id}
              whileHover={{
                scale: 1.03,
              }}
              className={`rounded-2xl border p-5 transition ${
                achievement.unlocked
                  ? "border-purple-500/30 bg-purple-500/10"
                  : "border-white/10 bg-black/20"
              }`}
            >

              <div className="flex items-start justify-between">


                <div className="flex gap-4">


                  <div
                    className={`rounded-xl p-3 ${
                      achievement.unlocked
                        ? "bg-purple-500/20"
                        : "bg-white/5"
                    }`}
                  >

                    {achievement.unlocked ? (

                      <Trophy
                        size={26}
                        className="text-yellow-400"
                      />

                    ) : (

                      <Lock
                        size={26}
                        className="text-slate-500"
                      />

                    )}

                  </div>


                  <div>

                    <h3 className="font-black text-white">
                      {achievement.title}
                    </h3>


                    <p className="mt-1 text-sm text-slate-400">
                      {achievement.description}
                    </p>


                  </div>


                </div>


                {achievement.unlocked && (

                  <CheckCircle2
                    size={22}
                    className="text-green-400"
                  />

                )}


              </div>


              {achievement.progress !== undefined && (

                <div className="mt-5">


                  <div className="mb-2 flex justify-between text-sm">

                    <span className="text-slate-400">
                      Progress
                    </span>

                    <span className="text-purple-300">
                      {achievement.progress}%
                    </span>

                  </div>


                  <div className="h-3 overflow-hidden rounded-full bg-white/10">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${achievement.progress}%`,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    />

                  </div>


                </div>

              )}


            </motion.div>

          ))

        ) : (

          <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-10 text-center">

            <Star
              size={48}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-xl font-bold text-white">
              No Achievements Yet
            </h3>

            <p className="mt-2 text-slate-400">
              Complete lessons and challenges to unlock badges.
            </p>

          </div>

        )}

      </div>


    </motion.section>
  );
};

export default AchievementCard;