import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";

const LessonSidebar = ({
  courseId,
  modules = [],
  activeModuleId,
}) => {
  return (
    <aside
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        overflow-hidden
        h-fit
        sticky
        top-6
      "
    >
      {/* Header */}

      <div className="border-b border-slate-800 p-6">

        <h2 className="text-2xl font-bold">
          Course Modules
        </h2>

        <p className="text-slate-400 mt-2">
          Select a lesson to continue learning.
        </p>

      </div>

      {/* Modules */}

      <div className="p-4 space-y-3">

        {modules.length === 0 ? (

          <div className="text-center py-10">

            <BookOpen
              size={42}
              className="mx-auto text-slate-600"
            />

            <p className="mt-4 text-slate-500">
              No modules available.
            </p>

          </div>

        ) : (

          modules.map((module, index) => {
            const active =
              String(module.id) ===
              String(activeModuleId);

            return (
              <motion.div
                key={module.id}
                whileHover={{ y: -2 }}
              >
                <Link
                  to={`/lms/courses/${courseId}/${module.id}`}
                  className={`
                    block
                    rounded-2xl
                    border
                    p-4
                    transition
                    ${
                      active
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex gap-3">

                      <div className="mt-1">

                        {module.completed ? (
                          <CheckCircle2
                            size={20}
                            className="text-emerald-400"
                          />
                        ) : module.locked ? (
                          <Lock
                            size={20}
                            className="text-slate-500"
                          />
                        ) : (
                          <Circle
                            size={20}
                            className="text-slate-500"
                          />
                        )}

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Module {index + 1}
                        </p>

                        <h3 className="font-semibold mt-1">
                          {module.title}
                        </h3>

                        {module.duration && (
                          <p className="text-sm text-slate-400 mt-2">
                            {module.duration}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                </Link>
              </motion.div>
            );
          })

        )}

      </div>
    </aside>
  );
};

export default LessonSidebar;