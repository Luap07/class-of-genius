import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  User,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  RefreshCw,
  Search,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const getParticipantId = (participant) =>
  String(
    participant?.id ||
      participant?.enrollment_id ||
      participant?.enrollmentId ||
      participant?.student_id ||
      participant?.studentId ||
      Math.random()
  );

const getParticipantName = (participant) =>
  participant?.student_name ||
  participant?.studentName ||
  participant?.name ||
  participant?.full_name ||
  participant?.fullName ||
  "Student";

const getParticipantRole = (participant) =>
  String(participant?.role || "student").toLowerCase();

const getPresence = (participant) => {
  if (participant?.is_present !== undefined) {
    return Boolean(participant.is_present);
  }

  if (participant?.isPresent !== undefined) {
    return Boolean(participant.isPresent);
  }

  return !participant?.left_at && !participant?.leftAt;
};

export default function ParticipantsPanel({
  liveClassId,
  tutorReference,
  tutorName = "Tutor",
  participants = [],
  onParticipantUpdate,
}) {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [localParticipants, setLocalParticipants] = useState(
    Array.isArray(participants) ? participants : []
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalParticipants(
      Array.isArray(participants) ? participants : []
    );
  }, [participants]);

  const refreshParticipants = async () => {
    if (!liveClassId) return;

    try {
      setRefreshing(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/academy/tutor/live-classes/${encodeURIComponent(
          liveClassId
        )}/participants`
      );

      if (!response.ok) {
        throw new Error("Unable to load participants");
      }

      const data = await response.json();

      const incoming =
        data?.participants ||
        data?.data?.participants ||
        data?.data ||
        [];

      const list = Array.isArray(incoming) ? incoming : [];

      setLocalParticipants(list);

      if (onParticipantUpdate) {
        list.forEach((participant) => {
          onParticipantUpdate(participant);
        });
      }
    } catch (err) {
      console.error("PARTICIPANTS ERROR:", err);
      setError(err.message || "Unable to load participants");
    } finally {
      setRefreshing(false);
    }
  };

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return localParticipants;

    return localParticipants.filter((participant) =>
      getParticipantName(participant)
        .toLowerCase()
        .includes(query)
    );
  }, [localParticipants, search]);

  const onlineParticipants = localParticipants.filter(getPresence);

  const offlineParticipants = localParticipants.filter(
    (participant) => !getPresence(participant)
  );

  const renderParticipant = (participant) => {
    const name = getParticipantName(participant);
    const role = getParticipantRole(participant);
    const isTutor =
      role === "tutor" ||
      role === "teacher" ||
      role === "admin";

    const isPresent = getPresence(participant);

    const cameraOn =
      participant?.camera_on ??
      participant?.cameraOn ??
      false;

    const micOn =
      participant?.mic_on ??
      participant?.micOn ??
      false;

    return (
      <div
        key={getParticipantId(participant)}
        className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 last:border-b-0"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isTutor
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isTutor ? (
              <Crown size={18} />
            ) : (
              <User size={18} />
            )}
          </div>

          <span
            className={`absolute right-0 bottom-0 w-3 h-3 rounded-full border-2 border-white ${
              isPresent ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-gray-900 truncate">
              {name}
            </p>

            {isTutor && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold">
                TUTOR
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500">
            {isPresent ? "Present" : "Left class"}
          </p>
        </div>

        {/* Media indicators */}
        <div className="flex items-center gap-1.5 text-gray-400">
          {isPresent && (
            <>
              {micOn ? (
                <Mic size={15} className="text-green-600" />
              ) : (
                <MicOff size={15} />
              )}

              {cameraOn ? (
                <Video size={15} className="text-green-600" />
              ) : (
                <VideoOff size={15} />
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users size={19} className="text-indigo-600" />

              <h3 className="font-semibold text-gray-900">
                Participants
              </h3>

              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                {localParticipants.length}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              {onlineParticipants.length} currently in class
            </p>
          </div>

          <button
            type="button"
            onClick={refreshParticipants}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50"
            title="Refresh participants"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
          {error}
        </div>
      )}

      {/* Participants */}
      <div className="flex-1 overflow-y-auto">
        {/* Tutor */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">
            Instructor
          </p>
        </div>

        <div>
          {renderParticipant({
            id: `tutor-${tutorReference || "current"}`,
            enrollment_id: tutorReference,
            student_name: tutorName,
            role: "tutor",
            is_present: true,
            mic_on: true,
            camera_on: true,
          })}
        </div>

        {/* Students */}
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">
              Students
            </p>

            <span className="text-xs text-gray-400">
              {onlineParticipants.filter(
                (participant) =>
                  getParticipantRole(participant) !== "tutor" &&
                  getParticipantRole(participant) !== "teacher"
              ).length}{" "}
              online
            </span>
          </div>
        </div>

        {filteredParticipants.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Users size={22} />
            </div>

            <p className="mt-3 text-sm font-medium text-gray-700">
              No students found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Students who join this class will appear here.
            </p>
          </div>
        ) : (
          <div>
            {filteredParticipants
              .filter((participant) => {
                const role = getParticipantRole(participant);
                return role !== "tutor" && role !== "teacher";
              })
              .map(renderParticipant)}
          </div>
        )}

        {/* Offline */}
        {offlineParticipants.length > 0 && (
          <div className="px-4 pt-5 pb-3">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">
              Attendance
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {offlineParticipants.length} participant
              {offlineParticipants.length !== 1 ? "s" : ""} have
              left the class.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}