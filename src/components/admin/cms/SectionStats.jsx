import React from "react";

import {
  FileText,
  Languages,
  CheckCircle2,
  Clock3,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-800
        bg-[#111827]
        p-6
        shadow-lg
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            {value}
          </h2>
        </div>

        <div
          className={`
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            ${color}
          `}
        >
          <Icon size={30} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function SectionStats({
  totalSections,
  totalLanguages,
  publishedSections,
  draftSections,
}) {
  const stats = [
    {
      title: "Total Sections",
      value: totalSections,
      icon: FileText,
      color: "bg-blue-600",
    },
    {
      title: "Languages",
      value: totalLanguages,
      icon: Languages,
      color: "bg-purple-600",
    },
        {
      title: "Published",
      value: publishedSections,
      icon: CheckCircle2,
      color: "bg-emerald-600",
    },
    {
      title: "Drafts",
      value: draftSections,
      icon: Clock3,
      color: "bg-amber-600",
    },
  ];

  return (
    <div
      className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-4
      "
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}