import React from "react";
import { TrendingUp } from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition">
      
      {/* Top Section */}
      <div className="flex items-center justify-between">
        
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
          <Icon size={24} />
        </div>

        <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
          <TrendingUp size={16} />
          {change}
        </div>
      </div>

      {/* Value */}
      <div className="mt-5">
        <h2 className="text-3xl font-bold">
          {value}
        </h2>
        <p className="text-slate-400 mt-1 text-sm">
          {title}
        </p>
      </div>
    </div>
  );
};

export default StatCard;