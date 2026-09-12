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
    <div className="w-full bg-white border-t border-gray-200 shadow-sm">
      {/* Main toolbar */}
      <div className="px-3 sm:px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {/* Start / End */}
          {!isLive ? (
            <button
              type="button"
              onClick={onStartClass}
              disabled={starting || ending}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <Play size={17} fill="currentColor" />

              {starting ? "Starting..." : "Start class"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onEndClass}
              disabled={ending}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <Square size={16} fill="currentColor" />

              {ending ? "Ending..." : "End class"}
            </button>
          )}

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1" />

          {/* Panels */}
          {panels.map((panel) => {
            const Icon = panel.icon;
            const active = activePanel === panel.id;

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => handlePanelClick(panel.id)}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={17} />

                <span className="hidden md:inline">
                  {panel.label}
                </span>

                {panel.id === "participants" &&
                  participantCount > 0 && (
                    <span
                      className={`min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
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
            className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              screenSharing
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={
              isLive
                ? screenSharing
                  ? "Stop screen sharing"
                  : "Share your screen"
                : "Start the class first"
            }
          >
            <MonitorUp size={17} />

            <span className="hidden lg:inline">
              {screenSharing ? "Stop share" : "Share screen"}
            </span>
          </button>

          {/* Spacer */}
          <div className="flex-1 min-w-2" />

          {/* Live status */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLive
                  ? "bg-red-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            />

            <span
              className={`hidden sm:inline text-xs font-semibold ${
                isLive ? "text-red-600" : "text-gray-500"
              }`}
            >
              {isLive ? "LIVE" : "NOT LIVE"}
            </span>
          </div>

          {/* Timer */}
          {isLive && (
            <div className="flex-shrink-0 flex items-center gap-1.5 text-gray-600 text-sm font-mono">
              <Clock3 size={16} />

              <span>{formatDuration(duration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Live information bar */}
      {isLive && (
        <div className="px-3 sm:px-4 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Radio
                size={15}
                className="text-red-500 flex-shrink-0"
              />

              <span className="text-xs text-gray-600 truncate">
                Your class is currently live
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Users size={14} />
                <span>
                  {participantCount}{" "}
                  {participantCount === 1
                    ? "participant"
                    : "participants"}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                <Clock3 size={14} />
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}