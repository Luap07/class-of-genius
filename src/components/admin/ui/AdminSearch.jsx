import React from "react";
import { Search } from "lucide-react";

const AdminSearch = ({
  value,
  onChange,
  placeholder = "Search..."
}) => {
  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">

      <Search
        size={20}
        className="text-slate-400"
      />

      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="
          bg-transparent
          outline-none
          w-full
          text-white
          placeholder:text-slate-500
        "
      />

    </div>
  );
};

export default AdminSearch;