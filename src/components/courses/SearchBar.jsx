import React from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

const SearchBar = ({
  value = "",
  onChange = () => {},
  placeholder = "Search courses...",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full"
    >
      {/* Search Icon */}
      <Search
        size={20}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          py-4
          pl-14
          pr-14
          text-white
          placeholder:text-slate-500
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-500/20
        "
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            rounded-full
            p-2
            text-slate-400
            transition
            hover:bg-slate-800
            hover:text-white
          "
        >
          <X size={18} />
        </button>
      )}
    </motion.div>
  );
};

export default SearchBar;