import React from "react";
import {
  Play,
  Square,
  Presentation,
  PenTool,
  Video,
  MessageCircle,
  Users,
  MonitorUp,
  FolderOpen,
  Clock3,
  Radio,
} from "lucide-react";

export default function ClassroomToolbar({
  activePanel = "presentation",
  onPanelChange,
  isLive = false,
  starting = false,
  ending = false,
  onStartClass,
  onEndClass,
  screenSharing = false,
  onScreenShareChange,
  participantCount = 0,
  duration = 0,
}) {
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

  const panels = [
    {
      id: "presentation",
      label: "Presentation",
      icon: Presentation,
    },
    {
      id: "whiteboard",
      label: "Board",
      icon: PenTool,
    },
    {
      id: "video",
      label: "Video",
      icon: Video,
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

  const handlePanelClick = (panelId) => {
    if (onPanelChange) {
      onPanelChange(panelId);
    }
  };

  const handleScreenShare = () => {
    if (onScreenShareChange) {
      onScreenShareChange(!screenSharing);
    }

    if (onPanelChange) {
      onPanelChange("video");
    }
  };

  return (
    <div className="relative w-full border-t border-white/[0.08] bg-[#080b12]/95 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.35)]">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

      {/* Main toolbar */}
      <div className="px-3 sm:px-5 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          {/* Start / End */}
          {!isLive ? (
            <button
              type="button"
              onClick={onStartClass}
              disabled={starting || ending}
              className="
                group relative flex-shrink-0 inline-flex items-center gap-2
                px-4 py-2.5 rounded-xl
                bg-gradient-to-r from-emerald-500 to-emerald-600
                hover:from-emerald-400 hover:to-emerald-500
                text-white text-sm font-semibold
                shadow-[0_8px_25px_rgba(16,185,129,0.18)]
                hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)]
                border border-emerald-400/20
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <Play
                size={16}
                fill="currentColor"
                className="relative"
              />

              <span className="relative">
                {starting ? "Starting..." : "Start class"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onEndClass}
              disabled={ending}
              className="
                group relative flex-shrink-0 inline-flex items-center gap-2
                px-4 py-2.5 rounded-xl
                bg-gradient-to-r from-red-500 to-rose-600
                hover:from-red-400 hover:to-rose-500
                text-white text-sm font-semibold
                shadow-[0_8px_25px_rgba(239,68,68,0.18)]
                hover:shadow-[0_8px_30px_rgba(239,68,68,0.3)]
                border border-red-400/20
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <Square
                size={15}
                fill="currentColor"
                className="relative"
              />

              <span className="relative">
                {ending ? "Ending..." : "End class"}
              </span>
            </button>
          )}

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-white/[0.08] mx-1" />

          {/* Panels */}
          {panels.map((panel) => {
            const Icon = panel.icon;
            const active = activePanel === panel.id;

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => handlePanelClick(panel.id)}
                className={`
                  group relative flex-shrink-0
                  inline-flex items-center gap-2
                  px-3 py-2.5 rounded-xl
                  text-sm font-medium
                  border
                  transition-all duration-200

                  ${
                    active
                      ? `
                        bg-indigo-500/15
                        text-indigo-300
                        border-indigo-400/25
                        shadow-[0_0_20px_rgba(99,102,241,0.10)]
                      `
                      : `
                        bg-white/[0.025]
                        text-slate-400
                        border-white/[0.06]
                        hover:bg-white/[0.07]
                        hover:text-white
                        hover:border-white/[0.12]
                      `
                  }
                `}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-1/2 -bottom-[1px] -translate-x-1/2 w-5 h-[2px] rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]" />
                )}

                <Icon
                  size={17}
                  className={`
                    transition-transform duration-200
                    ${
                      active
                        ? "text-indigo-300"
                        : "text-slate-500 group-hover:text-slate-200"
                    }
                  `}
                />

                <span className="hidden md:inline">
                  {panel.label}
                </span>

                {panel.id === "participants" &&
                  participantCount > 0 && (
                    <span
                      className={`
                        min-w-[20px] h-5 px-1.5
                        rounded-full
                        flex items-center justify-center
                        text-[10px] font-bold
                        border
                        ${
                          active
                            ? `
                              bg-indigo-500/20
                              text-indigo-200
                              border-indigo-400/20
                            `
                            : `
                              bg-white/[0.07]
                              text-slate-400
                              border-white/[0.06]
                            `
                        }
                      `}
                    >
                      {participantCount}
                    </span>
                  )}
              </button>
            );
          })}

          {/* Screen share */}
          <button
            type="button"
            onClick={handleScreenShare}
            disabled={!isLive}
            className={`
              group relative flex-shrink-0
              inline-flex items-center gap-2
              px-3 py-2.5 rounded-xl
              text-sm font-medium
              border
              transition-all duration-200

              ${
                screenSharing
                  ? `
                    bg-sky-500/15
                    text-sky-300
                    border-sky-400/25
                    shadow-[0_0_20px_rgba(14,165,233,0.12)]
                  `
                  : `
                    bg-white/[0.025]
                    text-slate-400
                    border-white/[0.06]
                    hover:bg-white/[0.07]
                    hover:text-white
                    hover:border-white/[0.12]
                  `
              }

              disabled:opacity-30
              disabled:cursor-not-allowed
            `}
            title={
              isLive
                ? screenSharing
                  ? "Stop screen sharing"
                  : "Share your screen"
                : "Start the class first"
            }
          >
            <MonitorUp
              size={17}
              className={
                screenSharing
                  ? "text-sky-300"
                  : "text-slate-500 group-hover:text-slate-200"
              }
            />

            <span className="hidden lg:inline">
              {screenSharing ? "Stop share" : "Share screen"}
            </span>
          </button>

          {/* Spacer */}
          <div className="flex-1 min-w-2" />

          {/* Live status */}
          <div
            className={`
              flex-shrink-0
              flex items-center gap-2
              px-3 py-2
              rounded-xl
              border
              ${
                isLive
                  ? "bg-red-500/10 border-red-400/15"
                  : "bg-white/[0.025] border-white/[0.06]"
              }
            `}
          >
            <span className="relative flex items-center justify-center">
              {isLive && (
                <span className="absolute w-3 h-3 rounded-full bg-red-500/30 animate-ping" />
              )}

              <span
                className={`
                  relative w-2.5 h-2.5 rounded-full
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
                hidden sm:inline
                text-xs font-bold tracking-wider
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

          {/* Timer */}
          {isLive && (
            <div
              className="
                flex-shrink-0
                flex items-center gap-2
                px-3 py-2
                rounded-xl
                bg-white/[0.025]
                border border-white/[0.06]
                text-slate-300
              "
            >
              <Clock3
                size={15}
                className="text-slate-500"
              />

              <span className="text-sm font-mono font-medium tracking-wide">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Live information bar */}
      {isLive && (
        <div className="relative px-3 sm:px-5 py-2.5 border-t border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center justify-between gap-3">

            {/* Live message */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-500/10 border border-red-400/10">
                <Radio
                  size={14}
                  className="text-red-400"
                />
              </div>

              <span className="text-xs text-slate-400 truncate">
                Your class is currently live
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

              <div
                className="
                  flex items-center gap-1.5
                  px-2.5 py-1.5
                  rounded-lg
                  bg-white/[0.025]
                  border border-white/[0.05]
                  text-xs text-slate-400
                "
              >
                <Users size={13} className="text-slate-500" />

                <span>
                  {participantCount}{" "}
                  {participantCount === 1
                    ? "participant"
                    : "participants"}
                </span>
              </div>

              <div
                className="
                  hidden sm:flex
                  items-center gap-1.5
                  px-2.5 py-1.5
                  rounded-lg
                  bg-white/[0.025]
                  border border-white/[0.05]
                  text-xs text-slate-400
                "
              >
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
