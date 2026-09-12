import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Monitor,
  Users,
  Video,
  X,
  PanelRight,
} from "lucide-react";

import LiveVideo from "../../components/live-class/LiveVideo";
import PresentationViewer from "../../components/live-class/PresentationViewer";
import Whiteboard from "../../components/live-class/Whiteboard";
import LiveChat from "../../components/live-class/LiveChat";
import ParticipantsPanel from "../../components/live-class/ParticipantsPanel";
import ClassroomToolbar from "../../components/live-class/ClassroomToolbar";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function getStoredUser() {
  const keys = [
    "tutor",
    "academyTutor",
    "scholiqen_user",
  ];

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      const parsed = JSON.parse(value);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // Ignore invalid localStorage values.
    }
  }

  return {};
}

function getTutorReference() {
  const tutor = getStoredUser();

  return String(
    tutor.tutorReference ||
      tutor.reference ||
      tutor.tutor_reference ||
      tutor.applicationReference ||
      tutor.application_reference ||
      tutor.id ||
      localStorage.getItem("tutorReference") ||
      ""
  ).trim();
}

function getTutorName() {
  const tutor = getStoredUser();

  return String(
    tutor.name ||
      tutor.full_name ||
      tutor.fullName ||
      tutor.tutorName ||
      "Tutor"
  ).trim();
}

async function apiRequest(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

function getClassId(classroom) {
  return String(
    classroom?.id ||
      classroom?.live_class_id ||
      classroom?.liveClassId ||
      ""
  ).trim();
}

function getClassTitle(classroom) {
  return (
    classroom?.title ||
    classroom?.class_name ||
    classroom?.className ||
    classroom?.grade ||
    "Live Classroom"
  );
}

function getSubject(classroom) {
  return (
    classroom?.subject ||
    classroom?.subject_name ||
    classroom?.subjectName ||
    ""
  );
}

function getGrade(classroom) {
  return (
    classroom?.grade ||
    classroom?.class_name ||
    classroom?.className ||
    ""
  );
}

function getStatus(classroom) {
  const status = String(
    classroom?.status || ""
  ).toLowerCase();

  if (
    status === "live" ||
    status === "started" ||
    status === "ongoing" ||
    status === "active"
  ) {
    return "live";
  }

  if (
    status === "ended" ||
    status === "completed" ||
    status === "finished"
  ) {
    return "ended";
  }

  return "scheduled";
}

function extractClassroom(data) {
  return (
    data?.liveClass ||
    data?.live_class ||
    data?.classroom ||
    data?.session ||
    data?.data ||
    data
  );
}

function extractArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

export default function TutorLiveClassroom() {
  const navigate = useNavigate();
  const params = useParams();

  const routeClassId =
    params.id ||
    params.liveClassId ||
    params.live_class_id ||
    params.classroomId ||
    "";

  const tutorReference = useMemo(
    () => getTutorReference(),
    []
  );

  const tutorName = useMemo(
    () => getTutorName(),
    []
  );

  const [classroom, setClassroom] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);

  const [presentation, setPresentation] =
    useState(null);

  /*
   * NONE = classroom is clean.
   *
   * This means Materials starts CLOSED.
   */
  const [activePanel, setActivePanel] =
    useState("none");

  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [screenSharing, setScreenSharing] =
    useState(false);

  const classId = useMemo(
    () =>
      getClassId(classroom) ||
      String(routeClassId),
    [classroom, routeClassId]
  );

  const classTitle = useMemo(
    () => getClassTitle(classroom),
    [classroom]
  );

  const subject = useMemo(
    () => getSubject(classroom),
    [classroom]
  );

  const grade = useMemo(
    () => getGrade(classroom),
    [classroom]
  );

  const status = useMemo(
    () => getStatus(classroom),
    [classroom]
  );

  const loadClassroom = useCallback(async () => {
    if (!routeClassId) {
      setError("Live classroom ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const data = await apiRequest(
        `/api/academy/tutor/live-classes/${encodeURIComponent(
          routeClassId
        )}`
      );

      const loaded = extractClassroom(data);

      if (!loaded) {
        throw new Error(
          "Live classroom could not be found."
        );
      }

      setClassroom(loaded);

      const loadedStatus = getStatus(loaded);

      setIsLive(loadedStatus === "live");
    } catch (err) {
      console.error(
        "LOAD LIVE CLASSROOM ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to load the live classroom."
      );
    } finally {
      setLoading(false);
    }
  }, [routeClassId]);

  const loadParticipants = useCallback(
    async () => {
      if (!classId) return;

      try {
        const data = await apiRequest(
          `/api/academy/tutor/live-classes/${encodeURIComponent(
            classId
          )}/participants`
        );

        setParticipants(
          extractArray(data, [
            "participants",
            "data",
          ])
        );
      } catch (err) {
        console.warn(
          "Participants could not be loaded:",
          err?.message
        );
      }
    },
    [classId]
  );

  const loadMessages = useCallback(
    async () => {
      if (!classId) return;

      try {
        const data = await apiRequest(
          `/api/academy/tutor/live-classes/${encodeURIComponent(
            classId
          )}/chat`
        );

        setMessages(
          extractArray(data, [
            "messages",
            "chat",
            "data",
          ])
        );
      } catch (err) {
        console.warn(
          "Chat could not be loaded:",
          err?.message
        );
      }
    },
    [classId]
  );

  useEffect(() => {
    loadClassroom();
  }, [loadClassroom]);

  useEffect(() => {
    if (!classId) return;

    loadParticipants();
    loadMessages();

    const interval = setInterval(() => {
      loadParticipants();
      loadMessages();
      loadClassroom();
    }, 10000);

    return () => clearInterval(interval);
  }, [
    classId,
    loadParticipants,
    loadMessages,
    loadClassroom,
  ]);

  const handleStartClass = async () => {
    if (!classId || starting || isLive) return;

    try {
      setStarting(true);
      setError("");
      setNotice("");

      const data = await apiRequest(
        `/api/academy/tutor/live-classes/${encodeURIComponent(
          classId
        )}/start`,
        {
          method: "POST",
          body: JSON.stringify({
            tutorReference,
            tutor_reference: tutorReference,
          }),
        }
      );

      const updated = extractClassroom(data);

      if (updated) {
        setClassroom((previous) => ({
          ...(previous || {}),
          ...updated,
        }));
      }

      setIsLive(true);
      setNotice(
        "Live class started successfully."
      );

      await loadClassroom();
    } catch (err) {
      console.error(
        "START LIVE CLASS ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to start the live class."
      );
    } finally {
      setStarting(false);
    }
  };

  const handleEndClass = async () => {
    if (!classId || ending) return;

    const confirmed = window.confirm(
      "Are you sure you want to end this live class?"
    );

    if (!confirmed) return;

    try {
      setEnding(true);
      setError("");
      setNotice("");

      const data = await apiRequest(
        `/api/academy/tutor/live-classes/${encodeURIComponent(
          classId
        )}/end`,
        {
          method: "POST",
          body: JSON.stringify({
            tutorReference,
            tutor_reference: tutorReference,
          }),
        }
      );

      const updated = extractClassroom(data);

      if (updated) {
        setClassroom((previous) => ({
          ...(previous || {}),
          ...updated,
        }));
      }

      setIsLive(false);
      setNotice("Live class ended.");

      await loadClassroom();
    } catch (err) {
      console.error(
        "END LIVE CLASS ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to end the live class."
      );
    } finally {
      setEnding(false);
    }
  };

  const handleLeaveClassroom = () => {
    navigate("/tutor/live-classes");
  };

  const handleScreenShareChange = (sharing) => {
    setScreenSharing(Boolean(sharing));
  };

  const handlePresentationChange = (value) => {
    setPresentation(value);
  };

  const handleNewMessage = (message) => {
    setMessages((previous) => [
      ...previous,
      message,
    ]);
  };

  const handleParticipantUpdate = (
    updatedParticipant
  ) => {
    if (!updatedParticipant) return;

    setParticipants((previous) => {
      const participantId =
        updatedParticipant.id ||
        updatedParticipant.enrollment_id ||
        updatedParticipant.enrollmentId;

      if (!participantId) {
        return previous;
      }

      const exists = previous.some(
        (participant) =>
          String(
            participant.id ||
              participant.enrollment_id ||
              participant.enrollmentId
          ) === String(participantId)
      );

      if (!exists) {
        return [
          ...previous,
          updatedParticipant,
        ];
      }

      return previous.map((participant) => {
        const id =
          participant.id ||
          participant.enrollment_id ||
          participant.enrollmentId;

        return String(id) === String(participantId)
          ? {
              ...participant,
              ...updatedParticipant,
            }
          : participant;
      });
    });
  };

  /*
   * PANEL TOGGLE
   *
   * Clicking the currently selected panel closes it.
   */
  const togglePanel = (panel) => {
    setActivePanel((current) =>
      current === panel ? "none" : panel
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />

          <p className="text-white/70">
            Loading live classroom...
          </p>
        </div>
      </div>
    );
  }

  if (error && !classroom) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 border border-white/10 rounded-2xl p-6">
          <h1 className="text-xl font-bold mb-2">
            Unable to open classroom
          </h1>

          <p className="text-white/70 mb-6">
            {error}
          </p>

          <button
            type="button"
            onClick={handleLeaveClassroom}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold"
          >
            Back to Live Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="h-16 shrink-0 border-b border-white/10 bg-slate-900/95 backdrop-blur flex items-center justify-between px-4 lg:px-6 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleLeaveClassroom}
            className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center shrink-0"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold truncate">
                {classTitle}
              </h1>

              {isLive && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/15 text-red-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

            <p className="text-xs text-white/50 truncate">
              {grade}
              {subject
                ? ` • ${subject}`
                : ""}
              {tutorName
                ? ` • ${tutorName}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notice && (
            <span className="hidden md:block text-sm text-emerald-300">
              {notice}
            </span>
          )}

          {error && (
            <button
              type="button"
              onClick={() => setError("")}
              className="hidden md:flex items-center gap-2 text-sm text-red-300"
            >
              <span>{error}</span>
              <X size={15} />
            </button>
          )}

          {!isLive && status !== "ended" && (
            <button
              type="button"
              onClick={handleStartClass}
              disabled={starting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 font-semibold text-sm"
            >
              <Video size={17} />
              {starting
                ? "Starting..."
                : "Start Class"}
            </button>
          )}

          {isLive && (
            <button
              type="button"
              onClick={handleEndClass}
              disabled={ending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 font-semibold text-sm"
            >
              <X size={17} />
              {ending
                ? "Ending..."
                : "End Class"}
            </button>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* LEFT / MAIN AREA */}
        <section className="flex-1 min-w-0 min-h-0 flex flex-col relative">
          {/* CLASSROOM STAGE */}
          <div className="flex-1 min-h-[420px] relative overflow-hidden">
            {/* PROFESSIONAL OFFICE-STYLE CLASSROOM BACKGROUND */}
            <div className="absolute inset-0 overflow-hidden bg-slate-900">
              {/* Back wall */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />

              {/* Window */}
              <div className="absolute top-[8%] left-[8%] w-[34%] h-[42%] rounded-3xl border border-white/10 bg-sky-900/30 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-sky-500/10 to-slate-900/30" />

                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />

                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />

                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-slate-950/30" />
              </div>

              {/* Wall panels */}
              <div className="absolute right-[8%] top-[10%] w-[25%] h-[18%] rounded-2xl border border-white/10 bg-white/5" />

              <div className="absolute right-[10%] top-[13%] w-[8%] h-[12%] rounded-xl border border-white/10 bg-white/5" />

              {/* Shelf */}
              <div className="absolute bottom-[19%] left-[7%] w-[38%] h-3 rounded-full bg-black/30" />

              <div className="absolute bottom-[19%] left-[9%] w-20 h-28 rounded-xl bg-white/5 border border-white/10" />

              <div className="absolute bottom-[19%] left-[22%] w-20 h-24 rounded-xl bg-white/5 border border-white/10" />

              <div className="absolute bottom-[19%] left-[35%] w-20 h-32 rounded-xl bg-white/5 border border-white/10" />

              {/* Plant */}
              <div className="absolute bottom-[20%] right-[13%]">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 blur-sm" />

                <div className="absolute bottom-0 left-5 w-8 h-14 rounded-b-xl bg-amber-700/40" />
              </div>

              {/* Desk */}
              <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-slate-950/70 border-t border-white/10" />

              <div className="absolute bottom-[15%] left-[25%] w-[50%] h-5 rounded-full bg-black/40 blur-md" />

              {/* Classroom title */}
              {activePanel === "none" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur">
                      <BookOpen
                        size={34}
                        className="text-white/70"
                      />
                    </div>

                    <h2 className="text-2xl font-bold text-white/90">
                      {classTitle}
                    </h2>

                    <p className="mt-2 text-sm text-white/40">
                      Your virtual classroom is ready
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PRESENTATION */}
            {activePanel === "presentation" && (
              <div className="absolute inset-0 z-10 bg-slate-950">
                <PresentationViewer
                  liveClassId={classId}
                  tutorReference={tutorReference}
                  presentation={presentation}
                  onPresentationChange={
                    handlePresentationChange
                  }
                />
              </div>
            )}

            {/* WHITEBOARD */}
            {activePanel === "whiteboard" && (
              <div className="absolute inset-0 z-10 bg-white">
                <Whiteboard
                  liveClassId={classId}
                  tutorReference={tutorReference}
                />
              </div>
            )}

            {/* CHAT MAIN AREA ON MOBILE */}
            {activePanel === "chat" && (
              <div className="absolute inset-0 z-10 bg-slate-900 lg:hidden">
                <LiveChat
                  liveClassId={classId}
                  tutorReference={tutorReference}
                  tutorName={tutorName}
                  messages={messages}
                  onNewMessage={handleNewMessage}
                />
              </div>
            )}

            {/* PARTICIPANTS MAIN AREA ON MOBILE */}
            {activePanel === "participants" && (
              <div className="absolute inset-0 z-10 bg-slate-900 lg:hidden">
                <ParticipantsPanel
                  liveClassId={classId}
                  participants={participants}
                  onParticipantUpdate={
                    handleParticipantUpdate
                  }
                />
              </div>
            )}

            {/* TUTOR CAMERA */}
            <div
              className={`absolute z-40 transition-all duration-300 ${
                activePanel === "video"
                  ? "inset-0"
                  : "top-4 right-4 w-[260px] sm:w-[300px] lg:w-[320px] aspect-video"
              }`}
            >
              <LiveVideo
                liveClassId={classId}
                tutorReference={tutorReference}
                tutorName={tutorName}
                isLive={isLive}
                compact={
                  activePanel !== "video"
                }
                onScreenShareChange={
                  handleScreenShareChange
                }
              />
            </div>

            {/* SCREEN SHARING INDICATOR */}
            {screenSharing && (
              <div className="absolute top-4 left-4 z-45 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold shadow-lg">
                <Monitor size={16} />
                You are sharing your screen
              </div>
            )}

            {/* FLOATING PANEL CLOSE BUTTON */}
            {activePanel !== "none" &&
              activePanel !== "video" && (
                <button
                  type="button"
                  onClick={() =>
                    setActivePanel("none")
                  }
                  className="absolute top-4 left-4 z-50 w-10 h-10 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur flex items-center justify-center border border-white/10"
                  title="Close panel"
                >
                  <X size={19} />
                </button>
              )}
          </div>

          {/* TOOLBAR */}
          <ClassroomToolbar
            activePanel={activePanel}
            onPanelChange={(panel) => {
              if (panel === "presentation") {
                togglePanel("presentation");
                return;
              }

              setActivePanel(panel);
            }}
            isLive={isLive}
            screenSharing={screenSharing}
            onScreenShareChange={
              handleScreenShareChange
            }
          />

          {/* MOBILE QUICK PANEL BUTTONS */}
          <div className="lg:hidden border-t border-white/10 bg-slate-900">
            <div className="grid grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  togglePanel("chat")
                }
                className={`p-3 flex items-center justify-center gap-2 text-sm ${
                  activePanel === "chat"
                    ? "bg-white/10 text-white"
                    : "text-white/60"
                }`}
              >
                <MessageCircle size={17} />
                Chat
              </button>

              <button
                type="button"
                onClick={() =>
                  togglePanel("participants")
                }
                className={`p-3 flex items-center justify-center gap-2 text-sm ${
                  activePanel ===
                  "participants"
                    ? "bg-white/10 text-white"
                    : "text-white/60"
                }`}
              >
                <Users size={17} />
                Students
              </button>

              <button
                type="button"
                onClick={() =>
                  togglePanel("presentation")
                }
                className={`p-3 flex items-center justify-center gap-2 text-sm ${
                  activePanel ===
                  "presentation"
                    ? "bg-white/10 text-white"
                    : "text-white/60"
                }`}
              >
                <BookOpen size={17} />
                Materials
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:flex w-[360px] shrink-0 border-l border-white/10 bg-slate-900 flex-col">
          {/* PANEL HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <PanelRight size={17} />

              <span className="font-semibold text-sm">
                Classroom
              </span>
            </div>

            {activePanel !== "none" && (
              <button
                type="button"
                onClick={() =>
                  setActivePanel("none")
                }
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                title="Close"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* PANEL BUTTONS */}
          <div className="grid grid-cols-3 border-b border-white/10">
            <button
              type="button"
              onClick={() =>
                togglePanel("chat")
              }
              className={`p-3 text-sm flex flex-col items-center gap-1 ${
                activePanel === "chat"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5"
              }`}
            >
              <MessageCircle size={18} />
              Chat
            </button>

            <button
              type="button"
              onClick={() =>
                togglePanel("participants")
              }
              className={`p-3 text-sm flex flex-col items-center gap-1 ${
                activePanel === "participants"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5"
              }`}
            >
              <Users size={18} />
              Students
            </button>

            <button
              type="button"
              onClick={() =>
                togglePanel("presentation")
              }
              className={`p-3 text-sm flex flex-col items-center gap-1 ${
                activePanel ===
                "presentation"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5"
              }`}
            >
              <BookOpen size={18} />
              Materials
            </button>
          </div>

          {/* SIDEBAR CONTENT */}
          <div className="flex-1 min-h-0">
            {activePanel === "chat" && (
              <LiveChat
                liveClassId={classId}
                tutorReference={tutorReference}
                tutorName={tutorName}
                messages={messages}
                onNewMessage={handleNewMessage}
              />
            )}

            {activePanel ===
              "participants" && (
              <ParticipantsPanel
                liveClassId={classId}
                participants={participants}
                onParticipantUpdate={
                  handleParticipantUpdate
                }
              />
            )}

            {activePanel ===
              "presentation" && (
              <div className="h-full p-4 overflow-y-auto">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h2 className="font-semibold mb-2">
                    Classroom Materials
                  </h2>

                  <p className="text-sm text-white/50">
                    Upload and present your PDF
                    or PowerPoint from the
                    presentation area.
                  </p>
                </div>
              </div>
            )}

            {activePanel === "none" && (
              <div className="h-full flex items-center justify-center p-6 text-center">
                <div>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center">
                    <PanelRight
                      size={24}
                      className="text-white/30"
                    />
                  </div>

                  <p className="text-sm text-white/40">
                    Select Chat, Students or
                    Materials
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}