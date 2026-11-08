import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Monitor,
  Users,
  Video,
  X,
  Pen,
  FileText,
} from "lucide-react";

import LiveVideo from "../../components/live-class/LiveVideo";
import PresentationViewer from "../../components/live-class/PresentationViewer";
import Whiteboard from "../../components/live-class/Whiteboard";
import LiveChat from "../../components/live-class/LiveChat";
import ParticipantsPanel from "../../components/live-class/ParticipantsPanel";
import ClassroomToolbar from "../../components/live-class/ClassroomToolbar";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const SOCKET_URL = API_BASE_URL;
const POLL_INTERVAL = 10000;

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const TOKEN_KEYS = [
  "scholiqen_academy_token",
  "scholiqen_token",
  "academy_token",
  "admin_token",
  "access_token",
  "token",
];

const getToken = () => {
  for (const key of TOKEN_KEYS) {
    try {
      const value = localStorage.getItem(key);
      if (value) return value;
    } catch {
      return "";
    }
  }

  return "";
};

const readTutor = () => {
  const keys = [
    "tutor",
    "academyTutor",
    "scholiqen_user",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // Ignore invalid stored values.
    }
  }

  return {};
};

const getTutorReference = () => {
  const tutor = readTutor();

  return (
    tutor.tutorReference ||
    tutor.tutor_reference ||
    tutor.reference ||
    tutor.applicationReference ||
    tutor.application_reference ||
    localStorage.getItem("tutorReference") ||
    ""
  );
};

const getTutorName = () => {
  const tutor = readTutor();

  return (
    tutor.fullName ||
    tutor.full_name ||
    tutor.name ||
    tutor.tutorName ||
    tutor.tutor_name ||
    "Tutor"
  );
};

const getHeaders = () => {
  const token = getToken();
  const reference = getTutorReference();

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...(reference
      ? {
          "x-tutor-reference": reference,
          "x-tutor-ref": reference,
          "x-academy-tutor-reference": reference,
        }
      : {}),
  };
};

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      credentials: "include",
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Request failed (${response.status})`
    );
  }

  return data;
};

const extractList = (data) => {
  if (Array.isArray(data)) return data;

  return (
    data?.participants ||
    data?.messages ||
    data?.resources ||
    data?.data ||
    data?.items ||
    []
  );
};

const getParticipantName = (participant) =>
  participant.student_name ||
  participant.studentName ||
  participant.name ||
  participant.full_name ||
  "Student";

const getRoomFromResponse = (data) =>
  data?.classroom ||
  data?.liveClass ||
  data?.live_class ||
  data?.data ||
  data;

/* =========================================================
   PANEL CONFIGURATION
========================================================= */

const PANEL_TITLES = {
  video: "Video",
  presentation: "Presentation",
  whiteboard: "Whiteboard",
  chat: "Chat",
  participants: "People",
  resources: "Resources",
};

const getPanelIcon = (panel) => {
  switch (panel) {
    case "presentation":
      return BookOpen;

    case "whiteboard":
      return Pen;

    case "chat":
      return MessageCircle;

    case "participants":
      return Users;

    case "resources":
      return FileText;

    default:
      return Video;
  }
};

/* =========================================================
   REMOTE VIDEO
========================================================= */

const RemoteVideoTile = ({ stream, socketId }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;
    video.play().catch(() => {});

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="h-full w-full object-cover"
      data-peer={socketId}
    />
  );
};

/* =========================================================
   RESOURCES PANEL
========================================================= */

const ResourcesPanel = ({ classroom }) => {
  const resources =
    classroom?.resources ||
    classroom?.materials ||
    classroom?.attachments ||
    classroom?.files ||
    [];

  const resourceList = Array.isArray(resources)
    ? resources
    : [];

  const getResourceUrl = (resource) =>
    resource.url ||
    resource.file_url ||
    resource.fileUrl ||
    resource.path ||
    resource.download_url ||
    "";

  const getResourceName = (resource, index) =>
    resource.title ||
    resource.name ||
    resource.file_name ||
    resource.filename ||
    `Class resource ${index + 1}`;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#071426] text-white">
      <div className="border-b border-white/10 p-4">
        <h3 className="text-sm font-bold">
          Class resources
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Learning materials and files for this classroom.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {resourceList.length === 0 ? (
          <div className="flex min-h-[180px] h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-5 text-center">
            <BookOpen
              size={28}
              className="mb-3 text-slate-500"
            />

            <p className="text-sm font-semibold text-slate-300">
              No resources available
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Resources attached to this classroom will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {resourceList.map((resource, index) => {
              const url = getResourceUrl(resource);
              const name = getResourceName(resource, index);

              return (
                <div
                  key={
                    resource.id ||
                    resource.file_id ||
                    index
                  }
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0B1930] p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                    <BookOpen size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">
                      {name}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {resource.type ||
                        resource.file_type ||
                        "Learning material"}
                    </p>
                  </div>

                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-blue-500"
                    >
                      Open
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN CLASSROOM
========================================================= */

const TutorLiveClassroom = () => {
  const navigate = useNavigate();
  const params = useParams();

  const classId =
    params.id ||
    params.classId ||
    params.liveClassId ||
    "";

  const tutorReference = getTutorReference();
  const tutorName = getTutorName();

  const socketRef = useRef(null);
  const peersRef = useRef(new Map());
  const mediaRef = useRef(null);
  const mountedRef = useRef(true);
  const pollingRef = useRef(null);

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLive, setIsLive] = useState(false);
  const [startingClass, setStartingClass] = useState(false);
  const [endingClass, setEndingClass] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);

  const [activePanel, setActivePanel] = useState("video");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const [screenSharing, setScreenSharing] = useState(false);
  const [presentation, setPresentation] = useState(null);

  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectedStudents, setConnectedStudents] = useState([]);

  const [notice, setNotice] = useState("");

  /* =======================================================
     REMOTE STREAMS
  ======================================================= */

  const updateRemoteStream = useCallback((socketId, stream) => {
    if (!socketId || !stream) return;

    setRemoteStreams((previous) => ({
      ...previous,
      [socketId]: stream,
    }));
  }, []);

  const removeRemoteStream = useCallback((socketId) => {
    setRemoteStreams((previous) => {
      const next = { ...previous };
      delete next[socketId];
      return next;
    });

    setConnectedStudents((previous) =>
      previous.filter((id) => id !== socketId)
    );
  }, []);

  /* =======================================================
     LOAD CLASSROOM
  ======================================================= */

  const loadClassroom = useCallback(async () => {
    if (!classId) {
      throw new Error("Live classroom ID is missing.");
    }

    const data = await apiRequest(
      `/api/academy/tutor/live-classes/${encodeURIComponent(classId)}`
    );

    const room = getRoomFromResponse(data);

    if (!room || (!room.id && !room.live_class_id)) {
      throw new Error("The live classroom could not be found.");
    }

    if (mountedRef.current) {
      setClassroom(room);

      setIsLive(
        room.status === "live" ||
        room.status === "active"
      );

      setPresentation(
        room.presentation ||
        room.current_presentation ||
        null
      );
    }

    return room;
  }, [classId]);

  /* =======================================================
     LOAD CLASSROOM DATA
  ======================================================= */

  const loadClassroomData = useCallback(async () => {
    if (!classId) return;

    const results = await Promise.allSettled([
      apiRequest(
        `/api/academy/tutor/live-classes/${encodeURIComponent(classId)}/participants`
      ),
      apiRequest(
        `/api/academy/tutor/live-classes/${encodeURIComponent(classId)}/chat`
      ),
      apiRequest(
        `/api/academy/tutor/live-classes/${encodeURIComponent(classId)}`
      ),
    ]);

    if (!mountedRef.current) return;

    if (results[0].status === "fulfilled") {
      setParticipants(extractList(results[0].value));
    }

    if (results[1].status === "fulfilled") {
      setMessages((previous) => {
        const latest = extractList(results[1].value);
        const combined = [...previous];

        latest.forEach((item) => {
          const id =
            item.id ||
            item.message_id ||
            item.created_at ||
            `${item.sender_name || item.senderName}-${item.message}`;

          const exists = combined.some((entry) => {
            const entryId =
              entry.id ||
              entry.message_id ||
              entry.created_at ||
              `${entry.sender_name || entry.senderName}-${entry.message}`;

            return String(entryId) === String(id);
          });

          if (!exists) combined.push(item);
        });

        return combined;
      });
    }

    if (results[2].status === "fulfilled") {
      const room = getRoomFromResponse(results[2].value);

      if (room) {
        setClassroom(room);

        setIsLive(
          room.status === "live" ||
          room.status === "active"
        );

        setPresentation(
          room.presentation ||
          room.current_presentation ||
          null
        );
      }
    }
  }, [classId]);

  /* =======================================================
     WEBRTC PEER CLEANUP
  ======================================================= */

  const closePeer = useCallback(
    (socketId) => {
      const peer = peersRef.current.get(socketId);

      if (peer) {
        peer.ontrack = null;
        peer.onicecandidate = null;
        peer.onconnectionstatechange = null;

        peer.close();
        peersRef.current.delete(socketId);
      }

      removeRemoteStream(socketId);
    },
    [removeRemoteStream]
  );

  const closeAllPeers = useCallback(() => {
    peersRef.current.forEach((peer) => {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.close();
    });

    peersRef.current.clear();

    setRemoteStreams({});
    setConnectedStudents([]);
  }, []);

  /* =======================================================
     OUTGOING MEDIA TRACKS
  ======================================================= */

  const getOutgoingTracks = useCallback(() => {
    const media = mediaRef.current;

    if (!media) return [];

    const cameraStream = media.cameraStream;
    const screenStream = media.screenStream;

    const videoTrack =
      screenStream?.getVideoTracks()?.[0] ||
      cameraStream?.getVideoTracks()?.[0];

    const audioTrack =
      cameraStream?.getAudioTracks()?.[0] ||
      screenStream?.getAudioTracks()?.[0];

    return [videoTrack, audioTrack].filter(
      (track) => track && track.readyState === "live"
    );
  }, []);

  /* =======================================================
     SYNC PEER TRACKS
  ======================================================= */

  const syncPeerTracks = useCallback(
    async (peer, socketId) => {
      if (!peer) return;

      const tracks = getOutgoingTracks();

      const desired = {
        audio:
          tracks.find((track) => track.kind === "audio") ||
          null,
        video:
          tracks.find((track) => track.kind === "video") ||
          null,
      };

      for (const kind of ["audio", "video"]) {
        const sender = peer
          .getSenders()
          .find((item) => item.track?.kind === kind);

        if (sender) {
          await sender.replaceTrack(desired[kind]);
        } else if (desired[kind]) {
          peer.addTrack(
            desired[kind],
            new MediaStream([desired[kind]])
          );
        }
      }

      if (
        peer.signalingState === "stable" &&
        peer.connectionState !== "closed"
      ) {
        const offer = await peer.createOffer();

        await peer.setLocalDescription(offer);

        socketRef.current?.emit("webrtc:offer", {
          liveClassId: classId,
          to: socketId,
          offer,
        });
      }
    },
    [classId, getOutgoingTracks]
  );

  /* =======================================================
     CREATE STUDENT PEER
  ======================================================= */

  const createPeerForStudent = useCallback(
    async (socketId) => {
      if (!socketId || peersRef.current.has(socketId)) {
        return peersRef.current.get(socketId);
      }

      const peer = new RTCPeerConnection(ICE_SERVERS);

      peersRef.current.set(socketId, peer);

      getOutgoingTracks().forEach((track) => {
        peer.addTrack(
          track,
          new MediaStream([track])
        );
      });

      peer.onicecandidate = (event) => {
        if (!event.candidate) return;

        socketRef.current?.emit("webrtc:ice-candidate", {
          liveClassId: classId,
          to: socketId,
          candidate: event.candidate,
        });
      };

      peer.ontrack = (event) => {
        const stream =
          event.streams?.[0] ||
          new MediaStream([event.track]);

        updateRemoteStream(socketId, stream);
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") {
          setConnectedStudents((previous) =>
            previous.includes(socketId)
              ? previous
              : [...previous, socketId]
          );
        }

        if (
          peer.connectionState === "failed" ||
          peer.connectionState === "disconnected" ||
          peer.connectionState === "closed"
        ) {
          removeRemoteStream(socketId);
        }
      };

      const offer = await peer.createOffer();

      await peer.setLocalDescription(offer);

      socketRef.current?.emit("webrtc:offer", {
        liveClassId: classId,
        to: socketId,
        offer,
      });

      return peer;
    },
    [
      classId,
      getOutgoingTracks,
      updateRemoteStream,
      removeRemoteStream,
    ]
  );

  /* =======================================================
     SOCKET CONNECTION
  ======================================================= */

  const connectSocket = useCallback(() => {
    const token = getToken();

    if (!token) {
      throw new Error("Your tutor login session has expired.");
    }

    if (!tutorReference) {
      throw new Error("Tutor reference is missing.");
    }

    socketRef.current?.disconnect();

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token,
        liveClassId: classId,
        role: "tutor",
        tutorReference,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);

      socket.emit("live:join", {
        liveClassId: classId,
        role: "tutor",
        tutorReference,
        tutorName,
      });
    });

    socket.on("live:joined", (payload) => {
      if (payload?.success === false) {
        setError(
          payload.message ||
          "Unable to join classroom signaling."
        );
        return;
      }

      setSocketConnected(true);
    });

    socket.on("connect_error", (socketError) => {
      console.error("TUTOR SOCKET ERROR:", socketError);
      setSocketConnected(false);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("live:peer-joined", async (payload) => {
      const socketId =
        payload?.socketId ||
        payload?.socket_id ||
        payload?.id;

      if (!socketId) return;

      if (payload.role && payload.role !== "student") {
        return;
      }

      try {
        await createPeerForStudent(socketId);
      } catch (peerError) {
        console.error(
          "CREATE STUDENT PEER ERROR:",
          peerError
        );
      }
    });

    socket.on("live:peer-left", (payload) => {
      const socketId =
        payload?.socketId ||
        payload?.socket_id ||
        payload?.id;

      if (socketId) closePeer(socketId);
    });

    socket.on("webrtc:answer", async (payload) => {
      try {
        const socketId =
          payload?.from ||
          payload?.socketId ||
          payload?.socket_id;

        const peer = peersRef.current.get(socketId);

        if (!peer || !payload?.answer) return;

        await peer.setRemoteDescription(
          new RTCSessionDescription(payload.answer)
        );
      } catch (peerError) {
        console.error("TUTOR ANSWER ERROR:", peerError);
      }
    });

    socket.on("webrtc:offer", async (payload) => {
      try {
        const socketId =
          payload?.from ||
          payload?.socketId ||
          payload?.socket_id;

        if (!socketId || !payload?.offer) return;

        let peer = peersRef.current.get(socketId);

        if (!peer) {
          peer = new RTCPeerConnection(ICE_SERVERS);
          peersRef.current.set(socketId, peer);

          getOutgoingTracks().forEach((track) => {
            peer.addTrack(
              track,
              new MediaStream([track])
            );
          });

          peer.onicecandidate = (event) => {
            if (!event.candidate) return;

            socket.emit("webrtc:ice-candidate", {
              liveClassId: classId,
              to: socketId,
              candidate: event.candidate,
            });
          };

          peer.ontrack = (event) => {
            updateRemoteStream(
              socketId,
              event.streams?.[0] ||
                new MediaStream([event.track])
            );
          };

          peer.onconnectionstatechange = () => {
            if (peer.connectionState === "connected") {
              setConnectedStudents((previous) =>
                previous.includes(socketId)
                  ? previous
                  : [...previous, socketId]
              );
            }
          };
        }

        await peer.setRemoteDescription(
          new RTCSessionDescription(payload.offer)
        );

        const answer = await peer.createAnswer();

        await peer.setLocalDescription(answer);

        socket.emit("webrtc:answer", {
          liveClassId: classId,
          to: socketId,
          answer,
        });
      } catch (peerError) {
        console.error("TUTOR OFFER ERROR:", peerError);
      }
    });

    socket.on("webrtc:ice-candidate", async (payload) => {
      try {
        const socketId =
          payload?.from ||
          payload?.socketId ||
          payload?.socket_id;

        const peer = peersRef.current.get(socketId);

        if (!peer || !payload?.candidate) return;

        await peer.addIceCandidate(
          new RTCIceCandidate(payload.candidate)
        );
      } catch (peerError) {
        console.error("TUTOR ICE ERROR:", peerError);
      }
    });

    socket.on("live:chat-message", (payload) => {
      const item =
        payload?.message ||
        payload?.data ||
        payload;

      if (!item) return;

      setMessages((previous) => {
        const id =
          item.id ||
          item.message_id ||
          item.created_at ||
          `${item.sender_name || item.senderName}-${item.message}`;

        const exists = previous.some((entry) => {
          const entryId =
            entry.id ||
            entry.message_id ||
            entry.created_at ||
            `${entry.sender_name || entry.senderName}-${entry.message}`;

          return String(entryId) === String(id);
        });

        return exists ? previous : [...previous, item];
      });
    });

    socket.on("live:participant-update", (payload) => {
      const participant = payload?.participant || payload;

      if (!participant) return;

      setParticipants((previous) => {
        const id =
          participant.id ||
          participant.student_id ||
          participant.enrollment_id;

        const exists = previous.some(
          (item) =>
            String(
              item.id ||
              item.student_id ||
              item.enrollment_id
            ) === String(id)
        );

        if (exists) {
          return previous.map((item) =>
            String(
              item.id ||
              item.student_id ||
              item.enrollment_id
            ) === String(id)
              ? { ...item, ...participant }
              : item
          );
        }

        return [...previous, participant];
      });
    });

    return socket;
  }, [
    classId,
    tutorReference,
    tutorName,
    createPeerForStudent,
    closePeer,
    getOutgoingTracks,
    updateRemoteStream,
  ]);

  /* =======================================================
     MEDIA HANDLERS
  ======================================================= */

  const handleMediaStreamChange = useCallback(
    async (media) => {
      mediaRef.current = media;

      setScreenSharing(Boolean(media?.screenSharing));

      const peers = [...peersRef.current.entries()];

      for (const [socketId, peer] of peers) {
        try {
          await syncPeerTracks(peer, socketId);
        } catch (mediaError) {
          console.error(
            "SYNC STUDENT MEDIA ERROR:",
            mediaError
          );
        }
      }
    },
    [syncPeerTracks]
  );

  const handleScreenShareChange = useCallback((enabled) => {
    setScreenSharing(Boolean(enabled));
  }, []);

  /* =======================================================
     PRESENTATION
  ======================================================= */

  const handlePresentationChange = useCallback(
    (nextPresentation) => {
      setPresentation(nextPresentation);

      socketRef.current?.emit(
        "live:presentation-update",
        {
          liveClassId: classId,
          presentation: nextPresentation,
        }
      );
    },
    [classId]
  );

  /* =======================================================
     CHAT
  ======================================================= */

  const handleNewMessage = useCallback((incoming) => {
    if (!incoming) return;

    setMessages((previous) => {
      const item =
        incoming.message ||
        incoming.data ||
        incoming;

      const id =
        item.id ||
        item.message_id ||
        item.created_at ||
        `${item.sender_name || item.senderName}-${item.message}`;

      const exists = previous.some((entry) => {
        const entryId =
          entry.id ||
          entry.message_id ||
          entry.created_at ||
          `${entry.sender_name || entry.senderName}-${entry.message}`;

        return String(entryId) === String(id);
      });

      return exists ? previous : [...previous, item];
    });
  }, []);

  /* =======================================================
     PARTICIPANTS
  ======================================================= */

  const handleParticipantUpdate = useCallback((incoming) => {
    if (!incoming) return;

    const participant =
      incoming.participant ||
      incoming.data ||
      incoming;

    setParticipants((previous) => {
      const id =
        participant.id ||
        participant.student_id ||
        participant.enrollment_id;

      const exists = previous.some(
        (item) =>
          String(
            item.id ||
            item.student_id ||
            item.enrollment_id
          ) === String(id)
      );

      if (exists) {
        return previous.map((item) =>
          String(
            item.id ||
            item.student_id ||
            item.enrollment_id
          ) === String(id)
            ? { ...item, ...participant }
            : item
        );
      }

      return [...previous, participant];
    });
  }, []);

  /* =======================================================
     PANEL NAVIGATION

     Video = wide main area.
     Other tools = smaller right-side panel.
  ======================================================= */

  const openRightPanel = useCallback((panel) => {
    setActivePanel(panel);
    setIsRightPanelOpen(true);
  }, []);

  const handlePanelChange = useCallback(
    (panel) => {
      const aliases = {
        people: "participants",
        participants: "participants",
        board: "whiteboard",
        whiteboard: "whiteboard",
        presentation: "presentation",
        chat: "chat",
        resources: "resources",
        resource: "resources",
        video: "video",
      };

      const selectedPanel =
        aliases[panel] || panel;

      const rightPanelItems = [
        "chat",
        "participants",
        "presentation",
        "whiteboard",
        "resources",
      ];

      setActivePanel(selectedPanel);

      if (rightPanelItems.includes(selectedPanel)) {
        setIsRightPanelOpen(true);
      } else {
        setIsRightPanelOpen(false);
      }
    },
    []
  );

  /* =======================================================
     START CLASS
  ======================================================= */

  const startClass = useCallback(async () => {
    if (startingClass || isLive) return;

    setStartingClass(true);
    setError("");

    try {
      await apiRequest(
        `/api/academy/tutor/live-classes/${encodeURIComponent(classId)}/start`,
        {
          method: "POST",
          body: JSON.stringify({
            tutorReference,
            tutor_reference: tutorReference,
          }),
        }
      );

      setIsLive(true);

      await loadClassroom();

      if (!socketRef.current) {
        connectSocket();
      }

      setNotice("Your live classroom has started.");
    } catch (startError) {
      console.error("START CLASS ERROR:", startError);

      setError(
        startError.message ||
        "Unable to start classroom."
      );
    } finally {
      setStartingClass(false);
    }
  }, [
    startingClass,
    isLive,
    classId,
    tutorReference,
    loadClassroom,
    connectSocket,
  ]);

  /* =======================================================
     END CLASS
  ======================================================= */

  const endClass = useCallback(async () => {
    if (endingClass) return;

    const confirmed = window.confirm(
      "Are you sure you want to end this live classroom?"
    );

    if (!confirmed) return;

    setEndingClass(true);
    setError("");

    try {
      await apiRequest(
        `/api/academy/tutor/live-classes/${encodeURIComponent(classId)}/end`,
        {
          method: "POST",
          body: JSON.stringify({
            tutorReference,
            tutor_reference: tutorReference,
          }),
        }
      );

      socketRef.current?.emit("live:end", {
        liveClassId: classId,
        tutorReference,
      });

      socketRef.current?.disconnect();
      socketRef.current = null;

      closeAllPeers();

      setIsLive(false);
      setNotice("The live classroom has ended.");

      await loadClassroom();
    } catch (endError) {
      console.error("END CLASS ERROR:", endError);

      setError(
        endError.message ||
        "Unable to end classroom."
      );
    } finally {
      setEndingClass(false);
    }
  }, [
    endingClass,
    classId,
    tutorReference,
    closeAllPeers,
    loadClassroom,
  ]);

  /* =======================================================
     INITIALIZE CLASSROOM
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    const initialise = async () => {
      try {
        const room = await loadClassroom();

        const live =
          room.status === "live" ||
          room.status === "active";

        if (live) {
          connectSocket();
        }
      } catch (loadError) {
        setError(
          loadError.message ||
          "Unable to load classroom."
        );
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initialise();

    return () => {
      mountedRef.current = false;
    };
  }, [loadClassroom, connectSocket]);

  /* =======================================================
     CLASSROOM POLLING
  ======================================================= */

  useEffect(() => {
    if (!classId) return;

    pollingRef.current = window.setInterval(() => {
      loadClassroomData();
    }, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, [classId, loadClassroomData]);

  /* =======================================================
     FINAL CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }

      socketRef.current?.disconnect();
      socketRef.current = null;

      closeAllPeers();
    };
  }, [closeAllPeers]);

  /* =======================================================
     REMOTE VIDEO DISPLAY
  ======================================================= */

  const renderRemoteVideos = () => {
    const entries = Object.entries(remoteStreams);

    if (entries.length === 0) return null;

    return (
      <div className="absolute bottom-4 left-4 z-20 flex max-w-[70%] flex-wrap gap-2">
        {entries.map(([socketId, stream]) => (
          <div
            key={socketId}
            className="relative h-24 w-36 overflow-hidden rounded-xl border border-white/20 bg-black shadow-xl"
          >
            <RemoteVideoTile
              stream={stream}
              socketId={socketId}
            />

            <div className="absolute bottom-1 left-2 right-2 truncate text-[9px] font-semibold text-white drop-shadow">
              {getParticipantName(
                participants.find(
                  (person) =>
                    person.socket_id === socketId ||
                    person.socketId === socketId
                ) || {}
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* =======================================================
     PANEL CONTENT
  ======================================================= */

  const renderPanelContent = () => {
    switch (activePanel) {
      case "whiteboard":
        return (
          <div className="h-full min-h-0 w-full overflow-hidden bg-white">
            <Whiteboard
              liveClassId={classId}
              tutorReference={tutorReference}
            />
          </div>
        );

      case "chat":
        return (
          <LiveChat
            liveClassId={classId}
            tutorReference={tutorReference}
            tutorName={tutorName}
            messages={messages}
            onNewMessage={handleNewMessage}
          />
        );

      case "participants":
        return (
          <ParticipantsPanel
            liveClassId={classId}
            participants={participants}
            onParticipantUpdate={handleParticipantUpdate}
          />
        );

      case "presentation":
        return (
          <PresentationViewer
            liveClassId={classId}
            tutorReference={tutorReference}
            presentation={presentation}
            onPresentationChange={handlePresentationChange}
          />
        );

      case "resources":
        return (
          <ResourcesPanel
            classroom={classroom}
          />
        );

      default:
        return null;
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Loader2 size={20} className="animate-spin" />
          Loading tutor classroom...
        </div>
      </div>
    );
  }

  /* =======================================================
     CLASSROOM ERROR
  ======================================================= */

  if (!classroom) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] p-5">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1220] p-6">
          <AlertCircle
            className="mb-3 text-red-400"
            size={28}
          />

          <h2 className="text-lg font-bold text-white">
            Classroom unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error ||
              "This live classroom could not be loaded."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  const ActivePanelIcon = getPanelIcon(activePanel);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#020617] text-white">

      {/* HEADER */}

      <header className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#071426] px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl p-2 text-slate-300 hover:bg-white/10"
            title="Go back"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold md:text-base">
              {classroom.title ||
                classroom.subject ||
                "Live Classroom"}
            </h1>

            <p className="truncate text-[11px] text-slate-400">
              {classroom.class_name ||
                classroom.className ||
                "Class"}{" "}
              {classroom.subject
                ? `• ${classroom.subject}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              socketConnected
                ? "bg-emerald-400"
                : "bg-amber-400"
            }`}
          />

          <span className="hidden text-[11px] text-slate-400 md:inline">
            {socketConnected
              ? "Signaling connected"
              : "Signaling disconnected"}
          </span>

          {isLive ? (
            <span className="rounded-full bg-red-600/20 px-2.5 py-1 text-[10px] font-bold text-red-300">
              LIVE
            </span>
          ) : (
            <span className="rounded-full bg-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-300">
              NOT LIVE
            </span>
          )}
        </div>
      </header>

      {/* NOTICES */}

      {(error || notice) && (
        <div
          className={`mx-4 mt-3 flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs ${
            error
              ? "border border-red-500/20 bg-red-950/40 text-red-200"
              : "border border-emerald-500/20 bg-emerald-950/30 text-emerald-200"
          }`}
        >
          <span>{error || notice}</span>

          <button
            onClick={() => {
              setError("");
              setNotice("");
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* CLASSROOM BODY */}

      <main className="flex min-h-0 flex-1 gap-3 overflow-hidden p-2 md:p-4">

        {/* LEFT MAIN VIDEO AREA */}

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">

          {/* WIDE VIDEO STAGE */}

          <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#071426]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1930] via-[#071426] to-[#020617]" />

            <div className="relative z-10 flex h-full w-full items-center justify-center p-2 md:p-4">
              <div className="h-full w-full">
                <LiveVideo
                  liveClassId={classId}
                  tutorReference={tutorReference}
                  tutorName={tutorName}
                  isLive={isLive}
                  compact={false}
                  onScreenShareChange={handleScreenShareChange}
                  onMediaStreamChange={handleMediaStreamChange}
                />
              </div>
            </div>

            {renderRemoteVideos()}

            {/* VIDEO STATUS */}

            <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-[10px] text-white backdrop-blur">
                <Users size={13} />
                {participants.length} participant(s)
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-[10px] text-white backdrop-blur">
                <Video size={13} />
                {connectedStudents.length} video connection(s)
              </div>
            </div>
          </div>

          {/* CLASS CONTROLS */}

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#071426] p-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                {screenSharing ? (
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <Monitor size={14} />
                    Screen sharing active
                  </span>
                ) : (
                  "Classroom controls"
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isLive ? (
                <button
                  onClick={startClass}
                  disabled={startingClass}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {startingClass ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  Start class
                </button>
              ) : (
                <button
                  onClick={endClass}
                  disabled={endingClass}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {endingClass ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <X size={15} />
                  )}
                  End class
                </button>
              )}
            </div>
          </div>

          {/* TOOLBAR */}

          <div className="shrink-0">
            <ClassroomToolbar
              activePanel={activePanel}
              onPanelChange={handlePanelChange}
              isLive={isLive}
              screenSharing={screenSharing}
              onScreenShareChange={handleScreenShareChange}
            />
          </div>
        </section>

        {/* DESKTOP RIGHT SIDE PANEL */}

        {isRightPanelOpen && (
          <aside className="hidden w-[300px] min-w-[280px] max-w-[32%] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#071426] lg:flex">

            {/* PANEL HEADER */}

            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <ActivePanelIcon
                  size={15}
                  className="shrink-0 text-blue-300"
                />

                <span className="truncate text-xs font-bold">
                  {PANEL_TITLES[activePanel] || activePanel}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsRightPanelOpen(false);
                  setActivePanel("video");
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
                title="Close panel"
              >
                <X size={15} />
              </button>
            </div>

            {/* PANEL BODY */}

            <div
              className={`min-h-0 flex-1 ${
                activePanel === "whiteboard"
                  ? "overflow-hidden bg-white"
                  : "overflow-y-auto"
              }`}
            >
              {renderPanelContent()}
            </div>
          </aside>
        )}
      </main>

      {/* MOBILE RIGHT SIDE PANEL */}

      {isRightPanelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60 lg:hidden"
          onClick={() => {
            setIsRightPanelOpen(false);
            setActivePanel("video");
          }}
        >
          <div
            className="flex h-[48vh] max-h-[480px] min-h-[280px] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#071426] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* MOBILE PANEL HEADER */}

            <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <ActivePanelIcon
                  size={15}
                  className="shrink-0 text-blue-300"
                />

                <span className="truncate text-xs font-bold">
                  {PANEL_TITLES[activePanel] || activePanel}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsRightPanelOpen(false);
                  setActivePanel("video");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
                title="Close panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* MOBILE PANEL CONTENT */}

            <div
              className={`min-h-0 flex-1 ${
                activePanel === "whiteboard"
                  ? "overflow-hidden bg-white"
                  : "overflow-y-auto"
              }`}
            >
              {renderPanelContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorLiveClassroom;