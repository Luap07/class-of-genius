import React from "react";
import { Filter } from "lucide-react";

const AdminFilter = ({
  options = [],
  value,
  onChange,
  label = "Filter"
}) => {
  return (
    <div className="flex items-center gap-3">

      <div className="flex items-center gap-2 text-slate-400">
        <Filter size={18} />
        <span className="text-sm">
          {label}
        </span>
      </div>

      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-xl
          px-4
          py-2
          text-white
          outline-none
        "
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

    </div>
  );
};

export default AdminFilter;