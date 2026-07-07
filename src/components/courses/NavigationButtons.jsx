import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const NavigationButtons = ({
  previousModule,
  nextModule,
  courseId,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between gap-4"
    >
      {/* Previous */}

      <div>
        {previousModule ? (
          <Link
            to={`/lms/courses/${courseId}/${previousModule.id}`}
            className="
              inline-flex
              items-center
              gap-2
              rounded-2xl
              bg-slate-800
              hover:bg-slate-700
              transition
              px-6
              py-3
              font-semibold
            "
          >
            <ArrowLeft size={18} />
            Previous Module
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Next */}

      <div>
        {nextModule ? (
          <Link
            to={`/lms/courses/${courseId}/${nextModule.id}`}
            className="
              inline-flex
              items-center
              gap-2
              rounded-2xl
              bg-blue-600
              hover:bg-blue-700
              transition
              px-6
              py-3
              font-semibold
            "
          >
            Next Module
            <ArrowRight size={18} />
          </Link>
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-emerald-500/30
              bg-emerald-500/10
              px-6
              py-3
              text-emerald-400
              font-semibold
            "
          >
            🎉 Last Module Completed
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NavigationButtons;