import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  History,
  Heart,
  Target,
  Globe2,
  Landmark,
  PenTool,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSearch = ({
  onSearch,
  placeholder = "Search languages, words, phrases, grammar...",
}) => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const shortcuts = [
    {
      title: "Continue Learning",
      icon: BookOpen,
      color: "text-cyan-400",
      border: "hover:border-cyan-500/50",
      bg: "bg-cyan-500/10",
      path: "/languages/continue",
    },
    {
      title: "Recent Languages",
      icon: History,
      color: "text-blue-400",
      border: "hover:border-blue-500/50",
      bg: "bg-blue-500/10",
      path: "/languages/recent",
    },
    {
      title: "Favorites",
      icon: Heart,
      color: "text-rose-400",
      border: "hover:border-rose-500/50",
      bg: "bg-rose-500/10",
      path: "/languages/favorites",
    },
    {
      title: "Daily Challenge",
      icon: Target,
      color: "text-yellow-400",
      border: "hover:border-yellow-500/50",
      bg: "bg-yellow-500/10",
      path: "/languages/daily-challenge",
    },
    {
      title: "Language Families",
      icon: Globe2,
      color: "text-green-400",
      border: "hover:border-green-500/50",
      bg: "bg-green-500/10",
      path: "/languages/families",
    },
    {
      title: "Culture",
      icon: Landmark,
      color: "text-purple-400",
      border: "hover:border-purple-500/50",
      bg: "bg-purple-500/10",
      path: "/languages/culture",
    },
    {
      title: "Writing Systems",
      icon: PenTool,
      color: "text-orange-400",
      border: "hover:border-orange-500/50",
      bg: "bg-orange-500/10",
      path: "/languages/writing-systems",
    },
    {
      title: "Fun Facts",
      icon: Sparkles,
      color: "text-pink-400",
      border: "hover:border-pink-500/50",
      bg: "bg-pink-500/10",
      path: "/languages/fun-facts",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 lg:flex-row"
      >
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-14 pr-5 text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          className="rounded-2xl bg-cyan-600 px-8 py-4 font-bold transition hover:bg-cyan-500"
        >
          Search
        </button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {shortcuts.slice(0, 4).map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.title}
              whileHover={{
                y: -5,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={() => navigate(item.path)}
              className={`
                group
                flex
                items-center
                gap-4
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-5
                text-left
                transition-all
                ${item.border}
              `}
            >
              <div
                className={`
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  ${item.bg}
                `}
              >
                <Icon
                  size={26}
                  className={`${item.color} transition-transform duration-300 group-hover:scale-110`}
                />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {item.title === "Continue Learning" &&
                    "Resume where you stopped."}

                  {item.title === "Recent Languages" &&
                    "View languages you've explored."}

                  {item.title === "Favorites" &&
                    "Quick access to saved languages."}

                  {item.title === "Daily Challenge" &&
                    "Complete today's learning mission."}
                </p>
              </div>
            </motion.button>
          );
        })}
              </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {shortcuts.slice(4).map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.title}
              whileHover={{
                y: -5,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={() => navigate(item.path)}
              className={`
                group
                flex
                items-center
                gap-4
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-5
                text-left
                transition-all
                ${item.border}
              `}
            >
              <div
                className={`
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  ${item.bg}
                `}
              >
                <Icon
                  size={26}
                  className={`${item.color} transition-transform duration-300 group-hover:scale-110`}
                />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {item.title === "Language Families" &&
                    "Discover how languages are connected."}

                  {item.title === "Culture" &&
                    "Explore traditions, customs and history."}

                  {item.title === "Writing Systems" &&
                    "Learn alphabets, scripts and characters."}

                  {item.title === "Fun Facts" &&
                    "Interesting facts from around the world."}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default HeroSearch;