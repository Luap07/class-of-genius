import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  History,
  Heart,
  Target,
  Globe2,
  Landmark,
  PenTool,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const HeroSearch = ({ onSearch }) => {
  const shortcuts = [
    {
      title: "Continue Learning",
      icon: BookOpen,
      color: "text-cyan-400",
      border: "hover:border-cyan-500/50",
      bg: "bg-cyan-500/10",
      description: "Resume where you stopped.",
    },
    {
      title: "Recent Languages",
      icon: History,
      color: "text-blue-400",
      border: "hover:border-blue-500/50",
      bg: "bg-blue-500/10",
      description: "View languages you've explored.",
    },
    {
      title: "Favorites",
      icon: Heart,
      color: "text-rose-400",
      border: "hover:border-rose-500/50",
      bg: "bg-rose-500/10",
      description: "Quick access to saved languages.",
    },
    {
      title: "Daily Challenge",
      icon: Target,
      color: "text-yellow-400",
      border: "hover:border-yellow-500/50",
      bg: "bg-yellow-500/10",
      description: "Complete today's learning mission.",
    },
    {
      title: "Language Families",
      icon: Globe2,
      color: "text-green-400",
      border: "hover:border-green-500/50",
      bg: "bg-green-500/10",
      description: "Discover how languages are connected.",
    },
    {
      title: "Culture",
      icon: Landmark,
      color: "text-purple-400",
      border: "hover:border-purple-500/50",
      bg: "bg-purple-500/10",
      description: "Explore traditions, customs and history.",
    },
    {
      title: "Writing Systems",
      icon: PenTool,
      color: "text-orange-400",
      border: "hover:border-orange-500/50",
      bg: "bg-orange-500/10",
      description: "Learn alphabets, scripts and characters.",
    },
    {
      title: "Fun Facts",
      icon: Sparkles,
      color: "text-pink-400",
      border: "hover:border-pink-500/50",
      bg: "bg-pink-500/10",
      description: "Interesting facts from around the world.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 backdrop-blur-xl"
    >
      {/* HERO */}

      <div className="relative overflow-hidden border-b border-white/10 p-10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,.15),transparent_35%)]" />

        <div className="relative z-10">

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2">

            <Sparkles
              size={16}
              className="text-cyan-400"
            />

            <span className="text-sm font-semibold text-cyan-300">
              Language Learning Hub
            </span>

          </div>

          <h2 className="mt-6 text-4xl font-black text-white lg:text-5xl">
            Discover Languages
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Faster Than Ever
            </span>
          </h2>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Explore alphabets, grammar, vocabulary,
            pronunciation, writing systems and cultures from
            around the world using beautifully organized lessons.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            {[
              "Arabic",
              "French",
              "Spanish",
              "Grammar",
              "Vocabulary",
              "Alphabet",
              "Pronunciation",
              "Culture",
            ].map((item) => (

              <button
                key={item}
                onClick={() => onSearch?.(item)}
                className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500 hover:text-white"
              >
                {item}
              </button>

            ))}

          </div>

          <div className="mt-10 flex items-center gap-3 text-cyan-300">

            <ArrowRight size={18} />

            <span className="font-semibold">
              Quick Access
            </span>

          </div>

        </div>

      </div>

      {/* SHORTCUT CARDS */}
            <div className="p-6">

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {shortcuts.slice(0, 4).map((item) => {

            const Icon = item.icon;

            return (

              <motion.div

                key={item.title}

                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}

                transition={{
                  duration: 0.25,
                }}

                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-gradient-to-br
                  from-slate-900
                  via-slate-900/95
                  to-slate-800/90
                  p-6
                  ${item.border}
                `}
              >

                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,.15),transparent_45%)]" />

                <div className="relative z-10">

                  <div
                    className={`
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      ${item.bg}
                    `}
                  >

                    <Icon
                      size={30}
                      className={`${item.color} transition-transform duration-300 group-hover:scale-110`}
                    />

                  </div>

                  <h3 className="mt-6 text-xl font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>

                </div>

              </motion.div>

            );

          })}

        </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {shortcuts.slice(4).map((item) => {

            const Icon = item.icon;

            return (

              <motion.div

                key={item.title}

                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}

                transition={{
                  duration: 0.25,
                }}

                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-gradient-to-br
                  from-slate-900
                  via-slate-900/95
                  to-slate-800/90
                  p-6
                  ${item.border}
                `}
              >

                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,.15),transparent_45%)]" />

                <div className="relative z-10">

                  <div
                    className={`
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      ${item.bg}
                    `}
                  >

                    <Icon
                      size={30}
                      className={`${item.color} transition-transform duration-300 group-hover:scale-110`}
                    />

                  </div>

                  <h3 className="mt-6 text-xl font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>

                </div>

              </motion.div>

            );

          })}

        </div>

      </div>

    </motion.div>

  );

}

export default HeroSearch;