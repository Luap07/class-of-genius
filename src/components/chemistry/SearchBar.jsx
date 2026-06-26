import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="relative mb-5">
      <Search
        size={18}
        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-slate-400
        "
      />

      <input
        type="text"
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
        placeholder="Search element..."
        className="
          w-full
          pl-11
          pr-4
          py-3
          rounded-xl
          bg-slate-900
          border
          border-slate-700
          text-white
          placeholder:text-slate-500
          outline-none
          focus:border-cyan-500
          focus:ring-1
          focus:ring-cyan-500
          transition-all
        "
      />
    </div>
  );
}