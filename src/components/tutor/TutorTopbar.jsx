import React from "react";
import {
  Bell,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

const TutorTopbar = ({
  onMenuClick,
  tutor,
  title = "Tutor Dashboard",
}) => {
  const getTutorName = () => {
    if (!tutor) {
      return "Tutor";
    }

    const name = [
      tutor.firstName,
      tutor.middleName,
      tutor.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || "Tutor";
  };

  const getInitials = () => {
    const name = getTutorName();

    const parts = name
      .split(" ")
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-2xl">
      <div className="flex h-[76px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu size={19} />
          </button>

          <div className="min-w-0">
            <p className="hidden text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/60 sm:block">
              Scholiqen Academy
            </p>

            <h2 className="truncate text-lg font-black text-white sm:text-xl">
              {title}
            </h2>
          </div>
        </div>

        {/* Center search */}
        <div className="mx-5 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="text"
              placeholder="Search classes, students, tasks..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400/30 focus:bg-white/[0.05]"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
            title="Notifications"
          >
            <Bell size={17} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </button>

          <div className="hidden h-8 w-px bg-white/10 sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="max-w-[150px] truncate text-xs font-bold text-white">
                {getTutorName()}
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-wider text-cyan-400/60">
                Tutor
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-violet-500/15 text-xs font-black text-cyan-200">
              {getInitials()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="px-4 pb-4 md:hidden">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            type="text"
            placeholder="Search your academy..."
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/30"
          />
        </div>
      </div>
    </header>
  );
};

export default TutorTopbar;