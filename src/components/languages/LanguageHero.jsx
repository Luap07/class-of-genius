import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function LanguageHero({
  language,
  navigate,
}) {
  return (
    <div className="relative h-[560px] overflow-hidden">

      <img
        src={
          language.banner_image ||
          language.image ||
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
        }
        alt={language.name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/70" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />

      <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16">

        <button
          onClick={() => navigate(-1)}
          className="
            mb-8
            flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-white/10
            bg-white/10
            px-5
            py-3
            backdrop-blur-xl
            transition
            hover:bg-white/20
          "
        >
          <ArrowLeft size={18} />

          <span>
            Back
          </span>

        </button>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="
            text-6xl
            font-black
            text-white
          "
        >
          {language.name}
        </motion.h1>
                {language.native_name && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
            }}
            className="
              mt-4
              text-2xl
              font-semibold
              text-blue-400
            "
          >
            {language.native_name}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.3,
          }}
          className="
            mt-6
            max-w-4xl
            text-lg
            leading-9
            text-slate-300
          "
        >
          {language.description ||
            "Learn this language through interactive lessons, pronunciation practice, AI conversations, quizzes and real-life exercises."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4,
          }}
          className="
            mt-10
            flex
            flex-wrap
            gap-4
          "
        >
          {language.level && (
            <span className="rounded-full bg-blue-600 px-6 py-3 font-bold text-white">
              {language.level}
            </span>
          )}

          {language.region && (
            <span className="rounded-full bg-slate-800 px-6 py-3 text-white">
              {language.region}
            </span>
          )}

          {language.speakers && (
            <span className="rounded-full bg-slate-800 px-6 py-3 text-white">
              {language.speakers}
            </span>
          )}
        </motion.div>
                {language.native_name && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
            }}
            className="
              mt-4
              text-2xl
              font-semibold
              text-blue-400
            "
          >
            {language.native_name}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.3,
          }}
          className="
            mt-6
            max-w-4xl
            text-lg
            leading-9
            text-slate-300
          "
        >
          {language.description ||
            "Learn this language through interactive lessons, pronunciation practice, AI conversations, quizzes and real-life exercises."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4,
          }}
          className="
            mt-10
            flex
            flex-wrap
            gap-4
          "
        >
          {language.level && (
            <span className="rounded-full bg-blue-600 px-6 py-3 font-bold text-white">
              {language.level}
            </span>
          )}

          {language.region && (
            <span className="rounded-full bg-slate-800 px-6 py-3 text-white">
              {language.region}
            </span>
          )}

          {language.speakers && (
            <span className="rounded-full bg-slate-800 px-6 py-3 text-white">
              {language.speakers}
            </span>
          )}
        </motion.div>
                <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.55,
          }}
          className="
            mt-12
            flex
            flex-wrap
            items-center
            gap-5
          "
        >
          <button
            className="
              rounded-2xl
              bg-blue-600
              px-8
              py-4
              font-bold
              text-white
              transition
              hover:bg-blue-500
            "
          >
            Start Learning
          </button>

          <button
            className="
              rounded-2xl
              border
              border-white/20
              bg-white/10
              px-8
              py-4
              font-bold
              text-white
              backdrop-blur
              transition
              hover:bg-white/20
            "
          >
            Browse Lessons
          </button>
        </motion.div>

      </div>

    </div>
  );
}