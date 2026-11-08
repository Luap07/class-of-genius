
import React from "react";

import {
  Presentation,
  PenTool,
  Video,
  MessageCircle,
  Users,
  FolderOpen,
  Clock3,
  Radio,
  MonitorUp,
} from "lucide-react";

/* =========================================================
   CLASSROOM TOOLBAR
========================================================= */

export default function ClassroomToolbar({
  activePanel = "video",
  onPanelChange,

  isLive = false,

  screenSharing = false,
  onToggleScreenShare,

  participantCount = 0,
  duration = 0,
}) {
  /* =======================================================
     DURATION
  ======================================================= */

  const formatDuration = (seconds) => {
    const total = Math.max(0, Number(seconds) || 0);

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
      return [
        hours,
        String(minutes).padStart(2, "0"),
        String(secs).padStart(2, "0"),
      ].join(":");
    }

    return [
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  };

  /* =======================================================
     TOOL PANELS
  ======================================================= */

  const panels = [
    {
      id: "video",
      label: "Video",
      icon: Video,
    },
    {
      id: "presentation",
      label: "Presentation",
      icon: Presentation,
    },
    {
      id: "whiteboard",
      label: "Whiteboard",
      icon: PenTool,
    },
    {
      id: "chat",
      label: "Chat",
      icon: MessageCircle,
    },
    {
      id: "participants",
      label: "People",
      icon: Users,
    },
    {
      id: "resources",
      label: "Resources",
      icon: FolderOpen,
    },
  ];

  /* =======================================================
     PANEL NAVIGATION
  ======================================================= */

  const handlePanelClick = (panelId) => {
    if (typeof onPanelChange !== "function") return;

    onPanelChange(panelId);
  };

  /* =======================================================
     SCREEN SHARING
  ======================================================= */

  const handleScreenShare = () => {
    if (!isLive || typeof onToggleScreenShare !== "function") {
      return;
    }

    onToggleScreenShare();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080b12]/95 shadow-[0_-10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">

      {/* TOP ACCENT */}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

      {/* TOOLBAR */}

      <div className="px-3 py-3 sm:px-4">

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          {/* NAVIGATION BUTTONS */}

          {panels.map((panel) => {
            const Icon = panel.icon;

            const active = activePanel === panel.id;

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => handlePanelClick(panel.id)}
                aria-label={panel.label}
                aria-pressed={active}
                title={panel.label}
                className={`
                  group relative inline-flex flex-shrink-0
                  items-center justify-center gap-2
                  rounded-xl border px-3 py-2.5
                  text-xs font-semibold
                  transition-all duration-200

                  ${
                    active
                      ? `
                        border-indigo-400/30
                        bg-indigo-500/15
                        text-indigo-300
                        shadow-[0_0_20px_rgba(99,102,241,0.10)]
                      `
                      : `
                        border-white/[0.06]
                        bg-white/[0.025]
                        text-slate-400
                        hover:border-white/[0.12]
                        hover:bg-white/[0.07]
                        hover:text-white
                      `
                  }
                `}
              >

                {/* ACTIVE INDICATOR */}

                {active && (
                  <span className="absolute -bottom-[1px] left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]" />
                )}

                <Icon
                  size={17}
                  className={`
                    flex-shrink-0 transition-colors
                    ${
                      active
                        ? "text-indigo-300"
                        : "text-slate-500 group-hover:text-slate-200"
                    }
                  `}
                />

                <span className="hidden sm:inline">
                  {panel.label}
                </span>

                {/* PEOPLE COUNT */}

                {panel.id === "participants" &&
                  participantCount > 0 && (
                    <span
                      className={`
                        flex h-5 min-w-5 items-center
                        justify-center rounded-full
                        border px-1.5 text-[10px]
                        font-bold

                        ${
                          active
                            ? "border-indigo-400/20 bg-indigo-500/20 text-indigo-200"
                            : "border-white/[0.06] bg-white/[0.07] text-slate-400"
                        }
                      `}
                    >
                      {participantCount}
                    </span>
                  )}
              </button>
            );
          })}

          {/* SPACER */}

          <div className="min-w-2 flex-1" />

          {/* SCREEN SHARE */}

          {typeof onToggleScreenShare === "function" && (
            <button
              type="button"
              onClick={handleScreenShare}
              disabled={!isLive}
              title={
                !isLive
                  ? "Start the class first"
                  : screenSharing
                    ? "Stop screen sharing"
                    : "Share your screen"
              }
              className={`
                inline-flex flex-shrink-0
                items-center justify-center gap-2
                rounded-xl border px-3 py-2.5
                text-xs font-semibold
                transition-all duration-200

                ${
                  screenSharing
                    ? "border-sky-400/25 bg-sky-500/15 text-sky-300"
                    : "border-white/[0.06] bg-white/[0.025] text-slate-400 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white"
                }

                disabled:cursor-not-allowed
                disabled:opacity-30
              `}
            >
              <MonitorUp
                size={17}
                className="flex-shrink-0"
              />

              <span className="hidden lg:inline">
                {screenSharing
                  ? "Stop share"
                  : "Share screen"}
              </span>
            </button>
          )}

          {/* LIVE STATUS */}

          <div
            className={`
              flex flex-shrink-0 items-center gap-2
              rounded-xl border px-3 py-2.5

              ${
                isLive
                  ? "border-red-400/15 bg-red-500/10"
                  : "border-white/[0.06] bg-white/[0.025]"
              }
            `}
          >
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">

              {isLive && (
                <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-500/30" />
              )}

              <span
                className={`
                  relative h-2.5 w-2.5 rounded-full

                  ${
                    isLive
                      ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                      : "bg-slate-500"
                  }
                `}
              />
            </span>

            <span
              className={`
                hidden text-[10px] font-bold
                tracking-wider sm:inline

                ${
                  isLive
                    ? "text-red-400"
                    : "text-slate-500"
                }
              `}
            >
              {isLive ? "LIVE" : "NOT LIVE"}
            </span>
          </div>

          {/* TIMER */}

          {isLive && (
            <div className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 text-slate-300">

              <Clock3
                size={15}
                className="text-slate-500"
              />

              <span className="font-mono text-xs font-semibold tracking-wide">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* LIVE INFORMATION */}

      {isLive && (
        <div className="border-t border-white/[0.06] bg-white/[0.015] px-3 py-2.5 sm:px-4">

          <div className="flex items-center justify-between gap-3">

            <div className="flex min-w-0 items-center gap-2">

              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-red-400/10 bg-red-500/10">
                <Radio
                  size={14}
                  className="text-red-400"
                />
              </div>

              <span className="truncate text-[11px] text-slate-400">
                Your classroom is currently live
              </span>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">

              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-slate-400">

                <Users
                  size={13}
                  className="text-slate-500"
                />

                <span>
                  {participantCount}{" "}
                  {participantCount === 1
                    ? "participant"
                    : "participants"}
                </span>
              </div>

              <div className="hidden items-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-slate-400 sm:flex">

                <Clock3
                  size={13}
                  className="text-slate-500"
                />

                <span>
                  {formatDuration(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
