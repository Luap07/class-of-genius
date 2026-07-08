import React from "react";
import { ArrowUpRight } from "lucide-react";

const AdminStats = ({
  title,
  value,
  icon: Icon,
  color = "bg-blue-600",
  change = "+0%",
  description = "",
}) => {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
        transition
        hover:border-blue-500
        hover:-translate-y-1
      "
    >
      <div className="flex items-start justify-between">

        <div>

          <p className="text-slate-400 text-sm">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            {value}
          </h2>

        </div>

        <div
          className={`h-16 w-16 rounded-2xl ${color} flex items-center justify-center`}
        >
          {Icon && <Icon size={30} />}
        </div>

      </div>

      <div className="mt-6 flex items-center justify-between">

        <div>

          <div className="flex items-center gap-2 text-green-400">

            <ArrowUpRight size={16} />

            <span className="font-semibold">
              {change}
            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
};

export default AdminStats;