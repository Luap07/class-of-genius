import React from "react";
import { motion } from "framer-motion";
import {
  Inbox,
  SearchX,
  BookOpen,
  RefreshCcw,
} from "lucide-react";

const EmptyState = ({
  title = "Nothing Here Yet",
  description = "There is no content available at the moment.",
  icon = "default",
  actionText,
  onAction,
}) => {

  const icons = {
    default: Inbox,
    search: SearchX,
    lessons: BookOpen,
  };

  const Icon =
    icons[icon] || icons.default;


  return (
    <motion.section
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className="flex min-h-[350px] items-center justify-center rounded-3xl border border-white/10 bg-slate-900 p-8"
    >

      <div className="max-w-md text-center">


        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/10"
        >

          <Icon
            size={45}
            className="text-cyan-400"
          />

        </motion.div>



        <h2 className="mt-8 text-3xl font-black text-white">

          {title}

        </h2>



        <p className="mt-3 leading-relaxed text-slate-400">

          {description}

        </p>



        {actionText && (

          <button
            onClick={onAction}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-500"
          >

            <RefreshCcw size={18} />

            {actionText}

          </button>

        )}


      </div>


    </motion.section>
  );
};


export default EmptyState;