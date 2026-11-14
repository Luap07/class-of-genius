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
   CLASSROOM CONTROL PANEL
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
  const formatDuration = (seconds) => {
    const total = Math.max(0, Number(seconds) || 0);

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = Math.floor(total % 60);

    if (hours > 0) {
      return [
        String(hours).padStart(2, "0"),
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
    { id: "video", label: "Video", icon: Video },
    { id: "presentation", label: "Presentation", icon: Presentation },
    { id: "whiteboard", label: "Whiteboard", icon: PenTool },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "participants", label: "People", icon: Users },
    { id: "resources", label: "Resources", icon: FolderOpen },
  ];

  const handlePanelClick = (panelId) => {
    if (typeof onPanelChange === "function") {
      onPanelChange(panelId);
    }
  };

  const handleScreenShare = () => {
    if (!isLive || typeof onToggleScreenShare !== "function") return;
    onToggleScreenShare();
  };

  return (
    <div className="w-full border-t border-white/10 bg-[#050816] text-white">

      {/* CONTROL PANEL */}
      <div className="flex w-full flex-col gap-3 px-3 py-3 sm:px-4">

        {/* PANEL NAVIGATION */}
        <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

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
                  relative flex min-h-[42px] shrink-0 items-center justify-center
                  gap-2 rounded-xl border px-3 py-2
                  text-xs font-semibold transition-all duration-200

                  ${
                    active
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-[#0B1220] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-white/80" />
                )}

                <Icon
                  size={17}
                  className={active ? "text-white" : "text-slate-400"}
                />

                <span className="hidden sm:inline">
                  {panel.label}
                </span>

                {panel.id === "participants" && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1.5 text-[10px] font-bold text-slate-300">
                    {participantCount}
                  </span>
                )}
              </button>
            );
          })}

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
                flex min-h-[42px] shrink-0 items-center justify-center
                gap-2 rounded-xl border px-3 py-2
                text-xs font-semibold transition-all

                ${
                  screenSharing
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-[#0B1220] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }

                disabled:cursor-not-allowed disabled:opacity-30
              `}
            >
              <MonitorUp size={17} />

              <span className="hidden lg:inline">
                {screenSharing ? "Stop share" : "Share screen"}
              </span>
            </button>
          )}

          {/* LIVE STATUS */}
          <div className="flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isLive ? "bg-red-500" : "bg-slate-500"
              }`}
            />

            <span
              className={`hidden text-[10px] font-bold tracking-wider sm:inline ${
                isLive ? "text-red-400" : "text-slate-500"
              }`}
            >
              {isLive ? "LIVE" : "NOT LIVE"}
            </span>
          </div>

          {/* TIMER */}
          {isLive && (
            <div className="flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2 text-slate-300">
              <Clock3 size={15} className="text-slate-400" />

              <span className="font-mono text-xs font-semibold">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>

        {/* LIVE INFORMATION */}
        {isLive && (
          <div className="flex min-w-0 items-center justify-between gap-3 border-t border-white/10 pt-2">

            <div className="flex min-w-0 items-center gap-2">
              <Radio size={14} className="shrink-0 text-red-400" />

              <span className="truncate text-[11px] text-slate-400">
                Your classroom is currently live
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-[#0B1220] px-2.5 py-1.5">
              <Users size={13} className="text-slate-400" />

              <span className="text-[10px] text-slate-300">
                {participantCount}{" "}
                {participantCount === 1 ? "participant" : "participants"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
