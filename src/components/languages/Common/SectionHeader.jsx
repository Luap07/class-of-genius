import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

const SectionHeader = ({
  title,
  description,
  icon = true,
  actionText,
  onAction,
  align = "left",
}) => {

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between ${
        align === "center"
          ? "text-center"
          : ""
      }`}
    >

      <div
        className={
          align === "center"
            ? "mx-auto"
            : ""
        }
      >

        <div className="flex items-center gap-3">

          {icon && (

            <div className="rounded-xl bg-cyan-500/10 p-3">

              <Sparkles
                size={22}
                className="text-cyan-400"
              />

            </div>

          )}


          <h2 className="text-3xl font-black text-white">

            {title}

          </h2>


        </div>



        {description && (

          <p className="mt-3 max-w-2xl text-slate-400">

            {description}

          </p>

        )}

      </div>



      {actionText && (

        <button
          onClick={onAction}
          className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-500"
        >

          {actionText}

          <ArrowRight size={18} />

        </button>

      )}


    </motion.div>
  );
};

export default SectionHeader;