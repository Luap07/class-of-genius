import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";

const SearchBar = ({
  placeholder = "Search languages, words, lessons...",
  value,
  onChange,
  onSearch,
  showFilter = false,
  onFilter,
}) => {
  const [focused, setFocused] = useState(false);

  const clearSearch = () => {
    onChange?.({
      target: {
        value: "",
      },
    });
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex w-full gap-3"
    >

      <div
        className={`flex flex-1 items-center rounded-2xl border bg-slate-900 px-5 py-4 transition ${
          focused
            ? "border-cyan-500"
            : "border-white/10"
        }`}
      >

        <Search
          size={22}
          className="text-cyan-400"
        />


        <input
          value={value}
          onChange={onChange}
          onFocus={() =>
            setFocused(true)
          }
          onBlur={() =>
            setFocused(false)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch?.();
            }
          }}
          placeholder={placeholder}
          className="ml-4 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
        />


        {value && (

          <button
            onClick={clearSearch}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >

            <X size={18} />

          </button>

        )}


      </div>



      {showFilter && (

        <button
          onClick={onFilter}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-5 text-white transition hover:border-cyan-500"
        >

          <SlidersHorizontal
            size={20}
          />

          Filter

        </button>

      )}


    </motion.div>
  );
};


export default SearchBar;