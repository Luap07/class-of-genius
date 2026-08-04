import React from "react";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function GrammarSearch({
  search,
  setSearch,
  category,
  setCategory,
  categories = [],
}) {
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
      transition={{
        delay: 0.15,
      }}
      className="
        mt-10
        grid
        gap-6
        lg:grid-cols-[1fr_260px]
      "
    >
      {/* Search */}

      <div
        className="
          flex
          items-center
          gap-4
          rounded-3xl
          border
          border-white/10
          bg-slate-900/80
          px-6
          py-5
          backdrop-blur-xl
        "
      >
        <Search
          size={22}
          className="text-cyan-400"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search grammar topics..."
          className="
            w-full
            bg-transparent
            text-white
            outline-none
            placeholder:text-slate-500
          "
        />
      </div>

      {/* Category Filter */}

      <div
        className="
          flex
          items-center
          gap-4
          rounded-3xl
          border
          border-white/10
          bg-slate-900/80
          px-6
          py-5
          backdrop-blur-xl
        "
      >
        <Filter
          size={20}
          className="text-cyan-400"
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="
            w-full
            bg-transparent
            text-white
            outline-none
          "
        >
          <option
            value="All"
            className="bg-slate-900"
          >
            All Categories
          </option>

          {categories.map((item) => (
            <option
              key={item}
              value={item}
              className="bg-slate-900"
            >
              {item}
            </option>
          ))}
        </select>
      </div>
    </motion.section>
  );
}