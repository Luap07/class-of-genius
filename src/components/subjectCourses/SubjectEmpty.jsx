import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function SubjectEmpty({
  navigate,
  categoryName,
  subjectName,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[65vh] items-center justify-center"
    >
      <div className="w-full max-w-3xl rounded-[34px] border border-slate-800 bg-slate-900/70 p-12 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-cyan-500/10">
          <BookOpen
            size={56}
            className="text-cyan-400"
          />
        </div>

        <h2 className="mt-8 text-4xl font-black text-white">
          No Courses Found
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          There are currently no published courses under{" "}
          <span className="font-semibold text-cyan-400">
            {subjectName}
          </span>
          {categoryName && (
            <>
              {" "}in{" "}
              <span className="font-semibold text-cyan-400">
                {categoryName}
              </span>
            </>
          )}
          .
          <br />
          New courses will appear here automatically after they are published.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 rounded-2xl border border-slate-700 px-7 py-4 font-semibold text-white transition hover:border-cyan-500 hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/courses")}
            className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    </motion.div>
  );
}