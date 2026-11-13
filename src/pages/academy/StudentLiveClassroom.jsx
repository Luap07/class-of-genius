
import React, {
  useCallback,
  useEffect,
  useMemo,
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
  FileText,
  Link as LinkIcon,
  Loader2,
  MessageCircle,
  Monitor,
  Paperclip,
  Presentation,
  Send,
  Users,
  Video,
  Wifi,
  WifiOff,
  Volume2,
} from "lucide-react";

/* ============================================================
   CONFIGURATION
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const SOCKET_URL = API_URL;
const POLL_INTERVAL = 5000;

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
  "student_token",
  "access_token",
  "token",
];

const STUDENT_KEYS = [
  "scholiqen_academy_user",
  "scholiqen_student",
  "academy_student",
  "student",
  "scholiqen_user",
];

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const getToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return "";
};

const readStoredStudent = () => {
  for (const key of STUDENT_KEYS) {
    const raw = localStorage.getItem(key);

    if (!raw) continue;

    try {
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

const getStudentIdentity = () => {
  const student = readStoredStudent();

  return {
    enrollmentId:
      student.enrollmentId ||
      student.enrollment_id ||
      student.studentEnrollmentId ||
      student.student_enrollment_id ||
      student.reference ||
      "",

    studentId:
      student.studentId ||
      student.student_id ||
      student.id ||
      student.userId ||
      student.user_id ||
      "",

    studentName:
      student.fullName ||
      student.full_name ||
      student.studentName ||
      student.student_name ||
      student.name ||
      student.username ||
      "Student",

    className:
      student.className ||
      student.class_name ||
      student.class ||
      student.grade ||
      student.level ||
      "",
  };
};

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

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

const getList = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getResourceUrl = (resource) =>
  resource?.file_url ||
  resource?.fileUrl ||
  resource?.url ||
  resource?.resource_url ||
  resource?.link ||
  "";

const getResourceName = (resource) =>
  resource?.title ||
  resource?.name ||
  resource?.file_name ||
  resource?.filename ||
  "Class resource";

const getPresentationUrl = (presentation) =>
  presentation?.url ||
  presentation?.file_url ||
  presentation?.fileUrl ||
  presentation?.resource_url ||
  presentation?.link ||
  "";

const getPresentationPage = (presentation) =>
  Math.max(
    1,
    Number(
      presentation?.current_page ||
        presentation?.currentPage ||
        presentation?.page ||
        1
    )
  );

const isPresentationResource = (resource) => {
  const type = clean(
    resource?.resource_type ||
      resource?.type ||
      resource?.category
  ).toLowerCase();

  const name = clean(
    resource?.title ||
      resource?.file_name ||
      resource?.name
  ).toLowerCase();

  return (
    type.includes("presentation") ||
    type.includes("slide") ||
    type.includes("pdf") ||
    name.endsWith(".pdf") ||
    name.endsWith(".ppt") ||
    name.endsWith(".pptx")
  );
};

const getWhiteboardImage = (response) => {
  const payload =
    response?.whiteboard ??
    response?.data?.whiteboard ??
    response?.data ??
    response?.event?.payload ??
    response?.payload ??
    response;

  if (!payload) return "";

  if (typeof payload === "string") {
    return payload.startsWith("data:image") ||
      payload.startsWith("http")
      ? payload
      : "";
  }

  return (
    payload.image ||
    payload.dataUrl ||
    payload.imageData ||
    payload.canvas ||
    payload.state?.image ||
    payload.state?.dataUrl ||
    ""
  );
};

const getMessageId = (item) =>
  String(
    item?.id ||
      item?.message_id ||
      item?.created_at ||
      `${item?.sender_name || item?.senderName}-${item?.message}`
  );

const getParticipantId = (item) =>
  String(
    item?.id ||
      item?.student_id ||
      item?.enrollment_id ||
      item?.enrollmentId ||
      item?.studentId ||
      ""
  );

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSenderName = (item) =>
  item?.sender_name ||
  item?.senderName ||
  item?.name ||
  "Participant";

const getMessageText = (item) =>
  item?.message ||
  item?.content ||
  item?.text ||
  "";

const mergeUnique = (previous, incoming, getId) => {
  const result = [...previous];
  const known = new Set(result.map(getId));

  incoming.forEach((item) => {
    const id = getId(item);

    if (!known.has(id)) {
      known.add(id);
      result.push(item);
    }
  });

  return result;
};

/* ============================================================
   WEBRTC SIGNALING HELPERS
============================================================ */

const getSocketSenderId = (payload) =>
  payload?.fromSocketId ||
  payload?.senderSocketId ||
  payload?.from ||
  payload?.socketId ||
  payload?.socket_id ||
  null;

/* ============================================================
   COMPONENT
============================================================ */

const StudentLiveClassroom = () => {
  const navigate = useNavigate();
  const params = useParams();

  const roomCode =
    params.roomCode ||
    params.code ||
    params.id ||
    "";

  const identity = useMemo(
    () => getStudentIdentity(),
    []
  );

  const socketRef = useRef(null);
  const peerRef = useRef(null);

  const tutorSocketIdRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  const screenStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const fallbackStreamRef = useRef(null);

  const screenSharingRef = useRef(false);

  const receivedVideoTracksRef = useRef(new Map());

  const tutorAudioStreamRef = useRef(new MediaStream());

  const screenVideoRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const tutorAudioRef = useRef(null);
  const chatEndRef = useRef(null);

  const pollingRef = useRef(null);
  const mountedRef = useRef(true);
  const joiningRef = useRef(false);
  const joinedRef = useRef(false);

  const refreshVideoTracksRef = useRef(null);

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinedClass, setJoinedClass] = useState(false);
  const [error, setError] = useState("");

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);

  const [whiteboardImage, setWhiteboardImage] = useState("");
  const [presentation, setPresentation] = useState(null);
  const [presentationPage, setPresentationPage] = useState(1);
  const [presentationTotalPages, setPresentationTotalPages] =
    useState(1);

  const [activeStage, setActiveStage] = useState("waiting");
  const [activeTab, setActiveTab] = useState("chat");

  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);
  const [mediaConnected, setMediaConnected] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const [tutorMediaState, setTutorMediaState] = useState({
    cameraEnabled: false,
    microphoneEnabled: false,
    screenSharing: false,
  });

  const classId =
    classroom?.id ||
    classroom?.live_class_id ||
    classroom?.liveClassId ||
    "";

  const studentReference =
    identity.enrollmentId ||
    identity.studentId ||
    "";

  const studentName = identity.studentName;

  const title =
    classroom?.title ||
    classroom?.subject ||
    "Live Classroom";

  const classLabel =
    classroom?.class_name ||
    classroom?.className ||
    identity.className ||
    "Classroom";

  const tutorName =
    classroom?.tutor_name ||
    classroom?.tutorName ||
    "Tutor";

  const tutorInitial = tutorName.charAt(0).toUpperCase();

  const presentationUrl = getPresentationUrl(presentation);

  const presentationName =
    presentation?.name ||
    presentation?.file_name ||
    presentation?.title ||
    "Class presentation";

  const presentationType = clean(
    presentation?.type ||
      presentation?.resource_type ||
      presentation?.mime_type
  ).toLowerCase();

  const isPdf =
    presentationType.includes("pdf") ||
    presentationUrl.toLowerCase().includes(".pdf");

  /* ============================================================
     VIDEO AND AUDIO ATTACHMENT
  ============================================================ */

  const attachVideo = useCallback((element, stream) => {
    if (!element) return;

    if (element.srcObject !== stream) {
      element.srcObject = stream || null;
    }

    if (stream) {
      element.play().catch((playError) => {
        console.warn("VIDEO PLAY ERROR:", playError);
      });
    }
  }, []);

  const attachTutorAudio = useCallback(() => {
    const audio = tutorAudioRef.current;
    const stream = tutorAudioStreamRef.current;

    if (!audio || !stream) return;

    if (audio.srcObject !== stream) {
      audio.srcObject = stream;
    }

    audio.play()
      .then(() => {
        setAudioBlocked(false);
      })
      .catch((playError) => {
        console.warn(
          "TUTOR AUDIO AUTOPLAY BLOCKED:",
          playError
        );

        setAudioBlocked(true);
      });
  }, []);

  const enableTutorAudio = useCallback(() => {
    attachTutorAudio();
  }, [attachTutorAudio]);

  useEffect(() => {
    attachVideo(
      screenVideoRef.current,
      screenStreamRef.current
    );
  }, [screenAvailable, attachVideo]);

  useEffect(() => {
    attachVideo(
      cameraVideoRef.current,
      cameraStreamRef.current
    );
  }, [cameraAvailable, attachVideo]);

  useEffect(() => {
    attachTutorAudio();
  }, [joinedClass, attachTutorAudio]);

  /* ============================================================
     CHAT
  ============================================================ */

  const addMessage = useCallback((incoming) => {
    if (!incoming) return;

    const item =
      incoming.chat ||
      incoming.messageData ||
      incoming.data?.chat ||
      incoming.data ||
      incoming.message ||
      incoming;

    if (!item || typeof item !== "object") return;

    setMessages((previous) =>
      mergeUnique(previous, [item], getMessageId)
    );
  }, []);

  /* ============================================================
     APPLY TUTOR CLASSROOM STATE
  ============================================================ */

  const applyClassroomState = useCallback((state = {}) => {
    const data =
      state.classroomState ||
      state.classroom_state ||
      state.state ||
      state.data ||
      state;

    if (!data || typeof data !== "object") return;

    const stage =
      data.activeStage ||
      data.active_stage ||
      data.stage ||
      data.currentTool;

    if (stage) {
      const normalized = clean(stage).toLowerCase();

      const allowedStages = [
        "whiteboard",
        "presentation",
        "screen",
        "waiting",
      ];

      if (allowedStages.includes(normalized)) {
        setActiveStage(normalized);
      }
    }

    const board =
      getWhiteboardImage(data.whiteboard || data);

    if (board) {
      setWhiteboardImage(board);
    }

    if (
      data.whiteboard?.cleared ||
      data.whiteboard?.action === "clear" ||
      data.whiteboardCleared
    ) {
      setWhiteboardImage("");
    }

    const nextPresentation =
      data.presentation ||
      data.activePresentation ||
      data.active_presentation;

    if (nextPresentation) {
      if (
        nextPresentation.cleared ||
        nextPresentation.action === "clear"
      ) {
        setPresentation(null);
        setPresentationPage(1);
      } else {
        setPresentation(nextPresentation);
        setPresentationPage(
          getPresentationPage(nextPresentation)
        );

        setPresentationTotalPages(
          Math.max(
            1,
            Number(
              nextPresentation.total_pages ||
                nextPresentation.totalPages ||
                1
            )
          )
        );
      }
    }

    const media =
      data.mediaState ||
      data.media_state ||
      data.tutorMediaState ||
      {};

    if (Object.keys(media).length) {
      const normalizedMedia = {
        ...media,
        cameraEnabled:
          media.cameraEnabled ??
          media.camera_enabled ??
          media.isCameraEnabled ??
          media.is_camera_enabled ??
          false,
        microphoneEnabled:
          media.microphoneEnabled ??
          media.microphone_enabled ??
          media.isMicrophoneEnabled ??
          media.is_microphone_enabled ??
          false,
        screenSharing:
          media.screenSharing ??
          media.screen_sharing ??
          media.isScreenSharing ??
          media.is_screen_sharing ??
          media.sharingScreen ??
          false,
      };

      setTutorMediaState((previous) => ({
        ...previous,
        ...normalizedMedia,
      }));

      const screenIsActive = Boolean(
        normalizedMedia.screenSharing
      );

      screenSharingRef.current = screenIsActive;
      setSharingScreen(screenIsActive);

      if (!screenIsActive) {
        screenStreamRef.current = null;
        setScreenAvailable(false);

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = null;
        }
      }
    }

    if (Array.isArray(data.resources)) {
      setResources((previous) =>
        mergeUnique(
          previous,
          data.resources,
          (item) =>
            String(
              item.id ||
                item.file_url ||
                item.url ||
                item.title
            )
        )
      );
    }
  }, []);

  /* ============================================================
     CLASSROOM LOOKUP
  ============================================================ */

  const loadClassroom = useCallback(async () => {
    if (!roomCode) {
      throw new Error("Classroom room code is missing.");
    }

    const result = await apiRequest(
      `/api/academy/live-class/room/${encodeURIComponent(
        roomCode
      )}`
    );

    const room =
      result.classroom ||
      result.session ||
      result.liveClass ||
      result.live_class ||
      result.data ||
      result;

    if (!room?.id && !room?.live_class_id) {
      throw new Error("The classroom could not be found.");
    }

    if (mountedRef.current) {
      setClassroom(room);
    }

    return room;
  }, [roomCode]);

  /* ============================================================
     LOAD CLASSROOM DATA
  ============================================================ */

  const loadClassroomData = useCallback(async (id) => {
    if (!id) return;

    const endpoints = [
      {
        key: "participants",
        url: `/api/academy/live-classes/${id}/participants`,
      },
      {
        key: "chat",
        url: `/api/academy/live-classes/${id}/chat`,
      },
      {
        key: "whiteboard",
        url: `/api/academy/live-classes/${id}/whiteboard`,
      },
      {
        key: "resources",
        url: `/api/academy/live-classes/${id}/resources`,
      },
    ];

    const results = await Promise.allSettled(
      endpoints.map((item) => apiRequest(item.url))
    );

    if (!mountedRef.current) return;

    results.forEach((result, index) => {
      if (result.status !== "fulfilled") return;

      const value = result.value;

      switch (endpoints[index].key) {
        case "participants": {
          setParticipants(
            getList(value, ["participants", "items"])
          );
          break;
        }

        case "chat": {
          const list = getList(value, [
            "messages",
            "chat",
            "items",
          ]);

          setMessages((previous) => {
            const combined = mergeUnique(
              previous,
              list,
              getMessageId
            );

            return combined.sort((a, b) => {
              const first = new Date(
                a.created_at || a.createdAt || 0
              ).getTime();

              const second = new Date(
                b.created_at || b.createdAt || 0
              ).getTime();

              return first - second;
            });
          });

          break;
        }

        case "whiteboard": {
          const image = getWhiteboardImage(value);

          if (image) {
            setWhiteboardImage(image);
          }

          break;
        }

        case "resources": {
          const list = getList(value, [
            "resources",
            "items",
          ]);

          setResources(list);

          const activePresentation = [...list]
            .reverse()
            .find(isPresentationResource);

          if (activePresentation) {
            setPresentation((previous) => {
              const previousUrl =
                getPresentationUrl(previous);

              const nextUrl =
                getResourceUrl(activePresentation);

              if (
                previousUrl &&
                previousUrl === nextUrl
              ) {
                return previous;
              }

              return {
                ...activePresentation,
                url: nextUrl,
              };
            });
          }

          break;
        }

        default:
          break;
      }
    });
  }, []);

  /* ============================================================
     WEBRTC CLEANUP
  ============================================================ */

  const closePeer = useCallback(() => {
    const peer = peerRef.current;

    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.oniceconnectionstatechange = null;

      peer.close();
      peerRef.current = null;
    }

    tutorSocketIdRef.current = null;
    pendingIceCandidatesRef.current = [];

    screenStreamRef.current = null;
    cameraStreamRef.current = null;
    fallbackStreamRef.current = null;
    screenSharingRef.current = false;

    receivedVideoTracksRef.current.clear();
    refreshVideoTracksRef.current = null;

    const audioStream = tutorAudioStreamRef.current;

    audioStream?.getTracks().forEach((track) => {
      audioStream.removeTrack(track);
    });

    if (tutorAudioRef.current) {
      tutorAudioRef.current.srcObject = null;
    }

    setSharingScreen(false);
    setAudioBlocked(false);

    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }

    setMediaConnected(false);
    setScreenAvailable(false);
    setCameraAvailable(false);
  }, []);

  /* ============================================================
     WEBRTC RECEIVER

     The student receives the tutor's media.
     The tutor creates the offer and sends it to this student.

     IMPORTANT:
     Do not add recvonly transceivers here before receiving
     the tutor's offer. The offer already contains the media
     transceivers that the student must answer.
  ============================================================ */

  const getOrCreatePeer = useCallback(
    (roomId) => {
      if (peerRef.current) {
        return peerRef.current;
      }

      const peer = new RTCPeerConnection(ICE_SERVERS);

      /* -----------------------------
         VIDEO TRACK HANDLING
      ----------------------------- */

      const attachReceivedVideoTracks = () => {
        const tracks = [
          ...receivedVideoTracksRef.current.values(),
        ].filter(
          (item) => item.track.readyState !== "ended"
        );

        if (!tracks.length) {
          cameraStreamRef.current = null;
          screenStreamRef.current = null;

          setCameraAvailable(false);
          setScreenAvailable(false);

          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = null;
          }

          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }

          return;
        }

        const explicitlyScreen = tracks.find(
          (item) => item.isScreen
        );

        const explicitlyCamera = tracks.find(
          (item) => item.isCamera
        );

        let cameraItem = explicitlyCamera || null;
        let screenItem = explicitlyScreen || null;

        const unclassified = tracks.filter(
          (item) =>
            item !== cameraItem &&
            item !== screenItem
        );

        if (unclassified.length === 1) {
          if (
            screenSharingRef.current &&
            !screenItem
          ) {
            screenItem = unclassified[0];
          } else if (!cameraItem) {
            cameraItem = unclassified[0];
          } else if (!screenItem) {
            screenItem = unclassified[0];
          }
        } else if (unclassified.length >= 2) {
          if (!cameraItem) {
            cameraItem = unclassified[0];
          }

          if (!screenItem) {
            screenItem = unclassified.find(
              (item) => item !== cameraItem
            );
          }
        }

        if (cameraItem) {
          cameraStreamRef.current = cameraItem.stream;
          setCameraAvailable(true);

          attachVideo(
            cameraVideoRef.current,
            cameraItem.stream
          );
        } else {
          cameraStreamRef.current = null;
          setCameraAvailable(false);

          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = null;
          }
        }

        if (screenItem) {
          screenStreamRef.current = screenItem.stream;
          setScreenAvailable(true);

          attachVideo(
            screenVideoRef.current,
            screenItem.stream
          );
        } else {
          screenStreamRef.current = null;
          setScreenAvailable(false);

          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
        }

        setMediaConnected(true);
      };

      refreshVideoTracksRef.current =
        attachReceivedVideoTracks;

      /* -----------------------------
         INCOMING MEDIA TRACKS
      ----------------------------- */

      peer.ontrack = (event) => {
        const track = event.track;

        console.log("STUDENT RECEIVED WEBRTC TRACK:", {
          kind: track.kind,
          id: track.id,
          label: track.label,
          mid: event.transceiver?.mid,
          streams: event.streams?.map(
            (stream) => stream.id
          ),
        });

        if (track.kind === "audio") {
          const audioStream = tutorAudioStreamRef.current;

          const alreadyAdded = audioStream
            .getTracks()
            .some((existing) => existing.id === track.id);

          if (!alreadyAdded) {
            audioStream.addTrack(track);
          }

          setMediaConnected(true);

          // Attach the tutor's microphone stream to the audio element.
          attachTutorAudio();

          track.onended = () => {
            const currentStream = tutorAudioStreamRef.current;

            const existingTrack = currentStream
              .getTracks()
              .find((item) => item.id === track.id);

            if (existingTrack) {
              currentStream.removeTrack(existingTrack);
            }
          };

          return;
        }

        if (track.kind !== "video") return;

        const stream = new MediaStream([track]);

        const label = clean(track.label).toLowerCase();

        const isScreen =
          /screen|display|monitor|window|desktop/.test(label);

        const isCamera =
          /camera|webcam|front|back/.test(label);

        const mid =
          event.transceiver?.mid ??
          track.id;

        receivedVideoTracksRef.current.set(
          String(mid),
          {
            track,
            stream,
            isScreen,
            isCamera,
          }
        );

        attachReceivedVideoTracks();

        track.onended = () => {
          receivedVideoTracksRef.current.delete(
            String(mid)
          );

          attachReceivedVideoTracks();
        };
      };

      /* -----------------------------
         OUTGOING ICE CANDIDATES
      ----------------------------- */

      peer.onicecandidate = (event) => {
        if (!event.candidate) return;

        const tutorSocketId =
          tutorSocketIdRef.current;

        if (!tutorSocketId) {
          console.warn(
            "Cannot send ICE candidate: tutor socket ID is missing."
          );

          return;
        }

        socketRef.current?.emit(
          "webrtc:ice-candidate",
          {
            liveClassId: roomId,
            targetSocketId: tutorSocketId,
            candidate: event.candidate,
          }
        );
      };

      /* -----------------------------
         CONNECTION STATE
      ----------------------------- */

      peer.onconnectionstatechange = () => {
        console.log(
          "STUDENT PEER CONNECTION:",
          peer.connectionState
        );

        if (peer.connectionState === "connected") {
          setMediaConnected(true);
        }

        if (
          [
            "failed",
            "disconnected",
            "closed",
          ].includes(peer.connectionState)
        ) {
          setMediaConnected(false);
        }
      };

      peer.oniceconnectionstatechange = () => {
        console.log(
          "STUDENT ICE CONNECTION:",
          peer.iceConnectionState
        );
      };

      peerRef.current = peer;

      return peer;
    },
    [attachVideo, attachTutorAudio]
  );

  /* ============================================================
     SOCKET CONNECTION
  ============================================================ */

  const connectSocket = useCallback(
    (roomId) => {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Your student login session has expired. Please sign in again."
        );
      }

      socketRef.current?.disconnect();

      const socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],

        auth: {
          token,
          liveClassId: roomId,
          role: "student",
        },

        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log(
          "STUDENT SOCKET CONNECTED:",
          socket.id
        );

        setSocketConnected(true);

        socket.emit("live:join", {
          liveClassId: roomId,
          role: "student",
          enrollmentId: identity.enrollmentId,
          studentId: identity.studentId,
          studentName: identity.studentName,
          className: identity.className,
        });
      });

      socket.on("live:joined", (data) => {
        if (data?.success === false) {
          setError(
            data.message ||
              "Unable to join the live classroom connection."
          );

          return;
        }

        setSocketConnected(true);

        applyClassroomState(
          data?.classroomState ||
            data?.state ||
            data
        );

        socket.emit("live:student-ready", {
          liveClassId: roomId,
          role: "student",
        });
      });

      socket.on("connect_error", (socketError) => {
        console.error(
          "STUDENT SOCKET ERROR:",
          socketError
        );

        setSocketConnected(false);
      });

      socket.on("disconnect", () => {
        console.warn("STUDENT SOCKET DISCONNECTED");

        setSocketConnected(false);
        setMediaConnected(false);
      });

      socket.on("live:peer-joined", (payload) => {
        console.log(
          "STUDENT PEER JOINED:",
          payload
        );
      });

      socket.on("live:peer-left", (payload) => {
        console.log(
          "STUDENT PEER LEFT:",
          payload
        );

        const senderSocketId = getSocketSenderId(payload);

        if (
          senderSocketId &&
          tutorSocketIdRef.current &&
          senderSocketId !== tutorSocketIdRef.current
        ) {
          return;
        }

        closePeer();
      });

      /* -----------------------------
         CLASSROOM STATE
      ----------------------------- */

      const handleState = (payload) => {
        applyClassroomState(payload);
      };

      socket.on("live:classroom-state", handleState);
      socket.on("live:state-sync", handleState);
      socket.on("live:activity-update", handleState);

      /* -----------------------------
         WEBRTC OFFER FROM TUTOR
      ----------------------------- */

      socket.on("webrtc:offer", async (payload) => {
        try {
          if (!payload?.offer) {
            console.warn(
              "STUDENT RECEIVED EMPTY WEBRTC OFFER:",
              payload
            );

            return;
          }

          const tutorSocketId =
            getSocketSenderId(payload);

          if (!tutorSocketId) {
            console.error(
              "Tutor socket ID missing from WebRTC offer. Check the server offer relay:",
              payload
            );

            return;
          }

          tutorSocketIdRef.current = tutorSocketId;

          const peer = getOrCreatePeer(roomId);

          /*
           * This student is the receiver.
           * Only process a new tutor offer when the peer
           * is stable. Do not set the same remote offer twice.
           */

          if (peer.signalingState !== "stable") {
            console.warn(
              "Student ignored duplicate or overlapping offer:",
              peer.signalingState
            );

            return;
          }

          await peer.setRemoteDescription(
            new RTCSessionDescription(payload.offer)
          );

          /*
           * ICE candidates may arrive before the offer.
           * Flush queued candidates after remoteDescription
           * has been successfully installed.
           */

          const pendingCandidates =
            pendingIceCandidatesRef.current;

          pendingIceCandidatesRef.current = [];

          for (const candidate of pendingCandidates) {
            try {
              await peer.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (iceError) {
              console.error(
                "STUDENT QUEUED ICE ERROR:",
                iceError
              );
            }
          }

          const answer = await peer.createAnswer();

          await peer.setLocalDescription(answer);

          socket.emit("webrtc:answer", {
            liveClassId: roomId,
            targetSocketId: tutorSocketId,
            answer: peer.localDescription,
          });

          console.log(
            "STUDENT WEBRTC ANSWER SENT TO TUTOR:",
            tutorSocketId
          );
        } catch (peerError) {
          console.error(
            "STUDENT WEBRTC OFFER ERROR:",
            peerError
          );
        }
      });

      /* -----------------------------
         WEBRTC ICE CANDIDATES
      ----------------------------- */

      socket.on(
        "webrtc:ice-candidate",
        async (payload) => {
          try {
            if (!payload?.candidate) return;

            const senderSocketId =
              getSocketSenderId(payload);

            /*
             * Remember the tutor socket ID if an ICE
             * candidate arrives before the offer.
             */
            if (
              senderSocketId &&
              !tutorSocketIdRef.current
            ) {
              tutorSocketIdRef.current = senderSocketId;
            }

            /*
             * Ignore ICE candidates from other students
             * or unrelated peers.
             */
            if (
              senderSocketId &&
              tutorSocketIdRef.current &&
              senderSocketId !== tutorSocketIdRef.current
            ) {
              return;
            }

            const peer = peerRef.current;

            if (!peer || !peer.remoteDescription) {
              pendingIceCandidatesRef.current.push(
                payload.candidate
              );

              return;
            }

            await peer.addIceCandidate(
              new RTCIceCandidate(payload.candidate)
            );
          } catch (peerError) {
            console.error(
              "STUDENT ICE ERROR:",
              peerError
            );
          }
        }
      );

      /* -----------------------------
         TUTOR MEDIA STATE
      ----------------------------- */

      socket.on("live:media-state", (payload) => {
        const state =
          payload?.mediaState ||
          payload?.media_state ||
          payload?.state ||
          payload ||
          {};

        const normalizedState = {
          ...state,
          cameraEnabled:
            state.cameraEnabled ??
            state.camera_enabled ??
            state.isCameraEnabled ??
            state.is_camera_enabled,
          microphoneEnabled:
            state.microphoneEnabled ??
            state.microphone_enabled ??
            state.isMicrophoneEnabled ??
            state.is_microphone_enabled,
          screenSharing:
            state.screenSharing ??
            state.screen_sharing ??
            state.isScreenSharing ??
            state.is_screen_sharing ??
            state.sharingScreen,
        };

        setTutorMediaState((previous) => ({
          ...previous,
          ...normalizedState,
        }));

        const screenIsActive = Boolean(
          normalizedState.screenSharing
        );

        screenSharingRef.current = screenIsActive;
        setSharingScreen(screenIsActive);

        refreshVideoTracksRef.current?.();

        if (!screenIsActive) {
          screenStreamRef.current = null;
          setScreenAvailable(false);

          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
        } else {
          setActiveStage("screen");
        }
      });

      /* -----------------------------
         SCREEN SHARE STATE
      ----------------------------- */

      socket.on("live:screen-share-state", (payload) => {
        const active = Boolean(
          payload?.active ??
            payload?.sharing ??
            payload?.screenSharing ??
            payload?.screen_sharing
        );

        screenSharingRef.current = active;
        setSharingScreen(active);

        refreshVideoTracksRef.current?.();

        if (!active) {
          screenStreamRef.current = null;
          setScreenAvailable(false);

          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
          }
        } else {
          setActiveStage("screen");
        }
      });

      /* -----------------------------
         PRESENTATION UPDATES
      ----------------------------- */

      socket.on(
        "live:presentation-update",
        (payload) => {
          const next =
            payload?.presentation ||
            payload?.resource ||
            payload?.data ||
            payload;

          if (!next || typeof next !== "object") {
            return;
          }

          if (
            next.cleared ||
            next.action === "clear" ||
            next.type === "cleared"
          ) {
            setPresentation(null);
            setPresentationPage(1);
            setActiveStage("waiting");
            return;
          }

          setPresentation(next);

          setPresentationPage(
            getPresentationPage(next)
          );

          setPresentationTotalPages(
            Math.max(
              1,
              Number(
                next.total_pages ||
                  next.totalPages ||
                  1
              )
            )
          );

          setActiveStage("presentation");
        }
      );

      /* -----------------------------
         PRESENTATION PAGE CHANGES
      ----------------------------- */

      socket.on(
        "live:presentation-page",
        (payload) => {
          const page = Number(
            payload?.page ||
              payload?.currentPage ||
              payload?.current_page ||
              1
          );

          setPresentationPage(
            Math.max(1, page)
          );
        }
      );

      /* -----------------------------
         WHITEBOARD UPDATES
      ----------------------------- */

      socket.on(
        "live:whiteboard-update",
        (payload) => {
          const image = getWhiteboardImage({
            whiteboard:
              payload?.whiteboard ??
              payload?.payload ??
              payload?.event?.payload ??
              payload,
          });

          if (image) {
            setWhiteboardImage(image);
            setActiveStage("whiteboard");
          }

          if (
            payload?.cleared ||
            payload?.action === "clear" ||
            payload?.type === "clear"
          ) {
            setWhiteboardImage("");
            setActiveStage("whiteboard");
          }
        }
      );

      /* -----------------------------
         ACTIVE STAGE CHANGES
      ----------------------------- */

      socket.on("live:stage-update", (payload) => {
        const stage = clean(
          payload?.stage ||
            payload?.activeStage ||
            payload?.active_stage ||
            payload?.tool
        ).toLowerCase();

        if (
          [
            "whiteboard",
            "presentation",
            "screen",
            "waiting",
          ].includes(stage)
        ) {
          setActiveStage(stage);
        }
      });

      /* -----------------------------
         CHAT UPDATES
      ----------------------------- */

      socket.on("live:chat-message", addMessage);

      /* -----------------------------
         PARTICIPANT UPDATES
      ----------------------------- */

      socket.on(
        "live:participant-update",
        (payload) => {
          const participant =
            payload?.participant ||
            payload?.data ||
            payload;

          if (!participant) return;

          const id = getParticipantId(participant);

          if (
            payload?.action === "left" ||
            participant.is_present === false
          ) {
            setParticipants((previous) =>
              previous.filter(
                (item) =>
                  getParticipantId(item) !== id
              )
            );

            return;
          }

          setParticipants((previous) => {
            const exists = previous.some(
              (item) =>
                getParticipantId(item) === id
            );

            if (exists) {
              return previous.map((item) =>
                getParticipantId(item) === id
                  ? { ...item, ...participant }
                  : item
              );
            }

            return [...previous, participant];
          });
        }
      );

      /* -----------------------------
         RESOURCE UPDATES
      ----------------------------- */

      socket.on(
        "live:resource-added",
        (payload) => {
          const resource =
            payload?.resource ||
            payload?.data ||
            payload;

          if (!resource) return;

          setResources((previous) =>
            mergeUnique(
              previous,
              [resource],
              (item) =>
                String(
                  item.id ||
                    item.file_url ||
                    item.url ||
                    item.title
                )
            )
          );

          if (isPresentationResource(resource)) {
            setPresentation({
              ...resource,
              url: getResourceUrl(resource),
            });

            setPresentationPage(
              getPresentationPage(resource)
            );

            setActiveStage("presentation");
          }
        }
      );

      /* -----------------------------
         CLASS END
      ----------------------------- */

      const handleClassEnded = () => {
        setError("The tutor has ended this live class.");
        setActiveStage("waiting");

        screenSharingRef.current = false;
        setSharingScreen(false);

        closePeer();
      };

      socket.on("live:ended", handleClassEnded);
      socket.on("live:class-ended", handleClassEnded);

      return socket;
    },
    [
      identity.className,
      identity.enrollmentId,
      identity.studentId,
      identity.studentName,
      addMessage,
      applyClassroomState,
      closePeer,
      getOrCreatePeer,
    ]
  );

  /* ============================================================
     JOIN CLASSROOM
  ============================================================ */

  const joinClassroom = useCallback(async () => {
    if (joiningRef.current || joinedRef.current) return;

    joiningRef.current = true;
    setJoining(true);
    setError("");

    try {
      const room = classroom || await loadClassroom();

      const id =
        room.id ||
        room.live_class_id ||
        room.liveClassId;

      if (!id) {
        throw new Error(
          "Invalid classroom identifier."
        );
      }

      if (!studentReference) {
        throw new Error(
          "Your student enrollment reference is missing. Please sign in again."
        );
      }

      await apiRequest(
        `/api/academy/live-classes/${id}/join`,
        {
          method: "POST",
          body: JSON.stringify({
            enrollmentId: identity.enrollmentId,
            studentId: identity.studentId,
            studentName: identity.studentName,
            className: identity.className,
          }),
        }
      );

      if (!mountedRef.current) return;

      joinedRef.current = true;
      setJoinedClass(true);

      await loadClassroomData(id);

      connectSocket(id);
    } catch (joinError) {
      console.error(
        "STUDENT JOIN ERROR:",
        joinError
      );

      setError(
        joinError.message ||
          "Unable to join classroom."
      );
    } finally {
      joiningRef.current = false;

      if (mountedRef.current) {
        setJoining(false);
      }
    }
  }, [
    classroom,
    loadClassroom,
    studentReference,
    identity.enrollmentId,
    identity.studentId,
    identity.studentName,
    identity.className,
    loadClassroomData,
    connectSocket,
  ]);

  /* ============================================================
     SEND CHAT
  ============================================================ */

  const sendMessage = useCallback(
    async (event) => {
      event?.preventDefault();

      const text = message.trim();

      if (!text || !classId || sendingMessage) {
        return;
      }

      setSendingMessage(true);

      try {
        const result = await apiRequest(
          `/api/academy/live-classes/${classId}/chat`,
          {
            method: "POST",
            body: JSON.stringify({
              message: text,
              senderName: studentName,
              sender_name: studentName,
              senderRole: "student",
              sender_role: "student",
              role: "student",
              senderId:
                identity.enrollmentId ||
                identity.studentId,
              sender_id:
                identity.enrollmentId ||
                identity.studentId,
              enrollmentId: identity.enrollmentId,
              studentId: identity.studentId,
            }),
          }
        );

        const savedMessage =
          result.chat ||
          result.messageData ||
          result.data?.chat ||
          result.data ||
          result.message;

        if (
          savedMessage &&
          typeof savedMessage === "object"
        ) {
          addMessage(savedMessage);
        } else {
          addMessage({
            id: `student-${Date.now()}`,
            sender_name: studentName,
            sender_role: "student",
            sender_id:
              identity.enrollmentId ||
              identity.studentId,
            message: text,
            created_at: new Date().toISOString(),
          });
        }

        setMessage("");
      } catch (sendError) {
        setError(
          sendError.message ||
            "Unable to send message."
        );
      } finally {
        setSendingMessage(false);
      }
    },
    [
      message,
      classId,
      sendingMessage,
      studentName,
      identity.enrollmentId,
      identity.studentId,
      addMessage,
    ]
  );

  /* ============================================================
     LEAVE CLASSROOM
  ============================================================ */

  const leaveClassroom = useCallback(async () => {
    const id = classId;

    socketRef.current?.emit("live:leave", {
      liveClassId: id,
      role: "student",
      enrollmentId: identity.enrollmentId,
      studentId: identity.studentId,
    });

    socketRef.current?.disconnect();
    socketRef.current = null;

    closePeer();

    joinedRef.current = false;
    setJoinedClass(false);

    if (id) {
      try {
        await apiRequest(
          `/api/academy/live-classes/${id}/leave`,
          {
            method: "POST",
            body: JSON.stringify({
              enrollmentId: identity.enrollmentId,
              studentId: identity.studentId,
            }),
          }
        );
      } catch (leaveError) {
        console.warn(
          "STUDENT LEAVE ERROR:",
          leaveError
        );
      }
    }

    navigate("/academy/student");
  }, [
    classId,
    identity.enrollmentId,
    identity.studentId,
    closePeer,
    navigate,
  ]);

  /* ============================================================
     INITIAL ROOM LOAD
  ============================================================ */

  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      try {
        await loadClassroom();
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

    initialize();

    return () => {
      mountedRef.current = false;
    };
  }, [loadClassroom]);

  /* ============================================================
     CLASSROOM POLLING
  ============================================================ */

  useEffect(() => {
    if (!joinedClass || !classId) return;

    pollingRef.current = window.setInterval(() => {
      loadClassroomData(classId);
    }, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [
    joinedClass,
    classId,
    loadClassroomData,
  ]);

  /* ============================================================
     CHAT SCROLL
  ============================================================ */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* ============================================================
     CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }

      socketRef.current?.disconnect();
      socketRef.current = null;

      if (peerRef.current) {
        peerRef.current.ontrack = null;
        peerRef.current.onicecandidate = null;
        peerRef.current.close();
        peerRef.current = null;
      }

      tutorSocketIdRef.current = null;
      pendingIceCandidatesRef.current = [];

      screenStreamRef.current = null;
      cameraStreamRef.current = null;
      fallbackStreamRef.current = null;
      screenSharingRef.current = false;

      receivedVideoTracksRef.current.clear();
      refreshVideoTracksRef.current = null;

      tutorAudioStreamRef.current
        ?.getTracks()
        .forEach((track) => {
          tutorAudioStreamRef.current.removeTrack(track);
        });

      if (tutorAudioRef.current) {
        tutorAudioRef.current.srcObject = null;
      }
    };
  }, []);

  /* ============================================================
     STAGE DISPLAY
  ============================================================ */

  const stageMode = useMemo(() => {
    if (
      activeStage === "screen" &&
      (screenAvailable || sharingScreen)
    ) {
      return "screen";
    }

    if (
      activeStage === "presentation" &&
      presentationUrl
    ) {
      return "presentation";
    }

    if (activeStage === "whiteboard") {
      return "whiteboard";
    }

    if (sharingScreen && screenAvailable) {
      return "screen";
    }

    if (
      presentationUrl &&
      activeStage === "waiting"
    ) {
      return "presentation";
    }

    if (
      whiteboardImage &&
      activeStage === "waiting"
    ) {
      return "whiteboard";
    }

    return "waiting";
  }, [
    activeStage,
    sharingScreen,
    screenAvailable,
    presentationUrl,
    whiteboardImage,
  ]);

  const screenIsMain =
    stageMode === "screen" &&
    screenAvailable;

  const cameraIsVisible =
    cameraAvailable &&
    tutorMediaState.cameraEnabled !== false;

  /* ============================================================
     LOADING SCREEN
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={35}
            className="animate-spin mx-auto text-blue-400"
          />

          <p className="text-sm text-slate-400 mt-4">
            Loading classroom...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     CLASSROOM NOT FOUND
  ============================================================ */

  if (!classroom) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-5">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#071426] p-7 text-center">
          <AlertCircle
            size={38}
            className="mx-auto text-red-400"
          />

          <h2 className="text-lg font-bold mt-4">
            Unable to load classroom
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            {error || "The classroom could not be found."}
          </p>

          <button
            onClick={() => navigate("/academy/student")}
            className="mt-6 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
          >
            Return to student dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-[#020617] text-white flex flex-col">

      {/* Hidden tutor audio receiver */}
      <audio
        ref={tutorAudioRef}
        autoPlay
        playsInline
        className="hidden"
      />

      {/* HEADER */}

      <header className="h-[68px] shrink-0 border-b border-white/10 bg-[#071426] px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/academy/student")}
            className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/10 flex items-center justify-center shrink-0"
            title="Back to dashboard"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-bold truncate">
              {title}
            </h1>

            <p className="text-[10px] md:text-xs text-slate-400 truncate">
              {classLabel} · {tutorName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
            {socketConnected ? (
              <>
                <Wifi size={14} className="text-emerald-400" />
                Live connection
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-amber-400" />
                Reconnecting
              </>
            )}
          </div>

          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
            STUDENT VIEW
          </span>

          {joinedClass && (
            <button
              onClick={leaveClassroom}
              className="px-3 md:px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-[10px] md:text-xs font-bold"
            >
              Leave class
            </button>
          )}
        </div>
      </header>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="mx-3 mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-start gap-3">
          <AlertCircle
            size={17}
            className="text-red-400 shrink-0 mt-0.5"
          />

          <p className="text-xs text-red-200 flex-1">
            {error}
          </p>

          <button
            onClick={() => setError("")}
            className="text-red-300 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* JOIN SCREEN */}

      {!joinedClass ? (
        <main className="flex-1 flex items-center justify-center p-5 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#071426] p-6 md:p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mx-auto">
              <Video
                size={30}
                className="text-blue-300"
              />
            </div>

            <div className="text-center mt-5">
              <h2 className="text-xl font-bold">
                Join live classroom
              </h2>

              <p className="text-sm text-slate-400 mt-2">
                Join the lesson and watch your tutor's live classroom activities.
              </p>
            </div>

            <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-slate-400">
                  Student
                </span>

                <span className="text-white font-medium text-right">
                  {studentName}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-xs">
                <span className="text-slate-400">
                  Class
                </span>

                <span className="text-white font-medium text-right">
                  {classLabel}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-xs">
                <span className="text-slate-400">
                  Subject
                </span>

                <span className="text-white font-medium text-right">
                  {classroom?.subject || "Live lesson"}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-xs">
                <span className="text-slate-400">
                  Tutor
                </span>

                <span className="text-white font-medium text-right">
                  {tutorName}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-blue-200 leading-relaxed">
                Your classroom is view-only. Your tutor controls the whiteboard, presentation, screen sharing and lesson activities.
              </p>
            </div>

            <button
              onClick={joinClassroom}
              disabled={joining}
              className="w-full mt-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              {joining ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Joining classroom...
                </>
              ) : (
                <>
                  <Video size={17} />
                  Join classroom
                </>
              )}
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 min-h-0 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-4">

          {/* MAIN LESSON STAGE */}

          <section className="min-w-0 min-h-[420px] flex flex-col">
            <div className="relative flex-1 min-h-[420px] rounded-2xl border border-white/10 bg-[#071426] overflow-hidden">

              {/* STAGE HEADER */}

              <div className="absolute z-30 top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 rounded-lg bg-black/75 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider">
                    {stageMode === "whiteboard"
                      ? "Tutor whiteboard"
                      : stageMode === "presentation"
                        ? "Tutor presentation"
                        : stageMode === "screen"
                          ? "Tutor screen"
                          : "Classroom stage"}
                  </span>

                  {sharingScreen && (
                    <span className="px-3 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-bold">
                      <Monitor
                        size={12}
                        className="inline mr-1"
                      />
                      SCREEN SHARING
                    </span>
                  )}
                </div>

                <span className="px-3 py-2 rounded-lg bg-black/75 backdrop-blur text-[10px] text-slate-300">
                  Following tutor
                </span>
              </div>

              {/* WHITEBOARD */}

              {stageMode === "whiteboard" && (
                <div className="absolute inset-0 bg-white flex items-center justify-center">
                  {whiteboardImage ? (
                    <img
                      src={whiteboardImage}
                      alt="Tutor's live whiteboard"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-500 p-6">
                      <BookOpen
                        size={42}
                        className="mx-auto"
                      />

                      <p className="text-sm mt-3">
                        The tutor's whiteboard is empty.
                      </p>

                      <p className="text-xs mt-1">
                        New tutor activity will appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* PRESENTATION */}

              {stageMode === "presentation" && (
                <div className="absolute inset-0 bg-[#0b1220] flex flex-col">
                  <div className="h-12 shrink-0 px-4 border-b border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Presentation
                        size={16}
                        className="text-blue-300 shrink-0"
                      />

                      <span className="text-xs font-semibold truncate">
                        {presentationName}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
                      Page {presentationPage}
                      {presentationTotalPages > 1
                        ? ` / ${presentationTotalPages}`
                        : ""}
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 bg-[#020617] flex items-center justify-center">
                    {presentationUrl && isPdf ? (
                      <iframe
                        key={`${presentationUrl}#page=${presentationPage}`}
                        src={`${presentationUrl}#toolbar=0&navpanes=0&page=${presentationPage}`}
                        title="Tutor presentation"
                        className="w-full h-full border-0 bg-white"
                      />
                    ) : presentationUrl ? (
                      <div className="text-center p-6">
                        <Presentation
                          size={42}
                          className="mx-auto text-blue-300"
                        />

                        <h3 className="text-sm font-semibold mt-4">
                          {presentationName}
                        </h3>

                        <p className="text-xs text-slate-400 mt-2">
                          This presentation format may need to be opened separately.
                        </p>

                        <a
                          href={presentationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex mt-5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                        >
                          Open presentation
                        </a>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <Presentation
                          size={36}
                          className="mx-auto"
                        />

                        <p className="text-sm mt-3">
                          Waiting for tutor presentation
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCREEN SHARE */}

              {stageMode === "screen" && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  {screenAvailable ? (
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <Monitor
                        size={44}
                        className="mx-auto text-blue-300"
                      />

                      <h3 className="mt-4 text-sm font-semibold">
                        Waiting for tutor screen
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 max-w-sm">
                        The tutor's shared screen will appear here when the stream connects.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* WAITING */}

              {stageMode === "waiting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0c1d36] to-[#020617] p-6 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                    <BookOpen
                      size={36}
                      className="text-blue-300"
                    />
                  </div>

                  <h3 className="mt-5 text-base font-bold">
                    Waiting for tutor activity
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                    When your tutor starts writing on the whiteboard, shares a presentation or shares their screen, it will appear here automatically.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-500">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        socketConnected
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                    />

                    {socketConnected
                      ? "Connected to classroom"
                      : "Reconnecting to classroom"}
                  </div>
                </div>
              )}

              {/* TUTOR CAMERA PREVIEW */}

              {cameraIsVisible && (
                <div className="absolute z-20 bottom-4 right-4 w-32 sm:w-44 md:w-52 aspect-video rounded-xl overflow-hidden border-2 border-white/20 bg-[#020617] shadow-2xl">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/65">
                    <p className="text-[9px] font-semibold text-white truncate">
                      {tutorName}
                    </p>
                  </div>
                </div>
              )}

              {/* TUTOR CAMERA PLACEHOLDER */}

              {!cameraIsVisible && (
                <div className="absolute z-20 bottom-4 right-4 w-32 sm:w-40 aspect-video rounded-xl overflow-hidden border border-white/10 bg-[#0b1930] flex flex-col items-center justify-center shadow-xl">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-200 text-sm font-bold">
                    {tutorInitial}
                  </div>

                  <span className="text-[9px] text-slate-300 mt-1">
                    {tutorName}
                  </span>
                </div>
              )}
            </div>

            {/* STAGE STATUS BAR */}

            <div className="mt-3 rounded-xl border border-white/10 bg-[#071426] px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {mediaConnected ? (
                  <CheckCircle2
                    size={15}
                    className="text-emerald-400 shrink-0"
                  />
                ) : (
                  <Wifi
                    size={15}
                    className="text-slate-500 shrink-0"
                  />
                )}

                <p className="text-[10px] text-slate-400 truncate">
                  {screenIsMain
                    ? "Watching tutor's shared screen"
                    : stageMode === "whiteboard"
                      ? "Viewing tutor's live whiteboard"
                      : stageMode === "presentation"
                        ? "Following tutor's presentation"
                        : "Connected to tutor's classroom"}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {audioBlocked && (
                  <button
                    onClick={enableTutorAudio}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold"
                  >
                    <Volume2 size={13} />
                    Enable tutor audio
                  </button>
                )}

                <span className="text-[9px] text-slate-500">
                  View only
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}

          <aside className="min-h-[400px] lg:min-h-0 rounded-2xl border border-white/10 bg-[#071426] flex flex-col overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/10 shrink-0">
              {[
                {
                  id: "chat",
                  label: "Chat",
                  icon: MessageCircle,
                },
                {
                  id: "people",
                  label: "People",
                  icon: Users,
                },
                {
                  id: "resources",
                  label: "Files",
                  icon: BookOpen,
                },
              ].map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 flex items-center justify-center gap-1.5 text-xs font-semibold border-b-2 ${
                      activeTab === tab.id
                        ? "text-blue-300 border-blue-400"
                        : "text-slate-400 border-transparent"
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* CHAT */}

            {activeTab === "chat" && (
              <>
                <div className="flex-1 min-h-[250px] overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <MessageCircle
                        size={25}
                        className="text-slate-600"
                      />

                      <p className="text-xs text-slate-400 mt-3">
                        No messages yet.
                      </p>

                      <p className="text-[10px] text-slate-500 mt-1">
                        Start the classroom conversation.
                      </p>
                    </div>
                  ) : (
                    messages.map((item, index) => {
                      const sender = getSenderName(item);

                      const senderRole = clean(
                        item.sender_role ||
                          item.senderRole ||
                          item.role ||
                          item.sender_type
                      ).toLowerCase();

                      const ownMessage =
                        senderRole === "student" &&
                        String(item.sender_id || "") ===
                          String(
                            identity.enrollmentId ||
                              identity.studentId
                          );

                      return (
                        <div
                          key={
                            item.id ||
                            item.message_id ||
                            `${index}-${item.created_at || ""}`
                          }
                          className={`flex flex-col ${
                            ownMessage
                              ? "items-end"
                              : "items-start"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-slate-400">
                              {ownMessage ? "You" : sender}
                            </span>

                            <span className="text-[9px] text-slate-600">
                              {formatTime(
                                item.created_at ||
                                  item.createdAt ||
                                  item.timestamp
                              )}
                            </span>
                          </div>

                          <div
                            className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                              ownMessage
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-white/[0.07] text-slate-200 rounded-tl-sm"
                            }`}
                          >
                            {getMessageText(item)}
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={chatEndRef} />
                </div>

                <form
                  onSubmit={sendMessage}
                  className="p-3 border-t border-white/10 flex items-center gap-2 shrink-0"
                >
                  <input
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    placeholder="Write a message..."
                    className="flex-1 min-w-0 rounded-xl bg-[#020617] border border-white/10 px-3 py-3 text-xs text-white outline-none focus:border-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={
                      !message.trim() ||
                      sendingMessage
                    }
                    className="p-3 rounded-xl bg-blue-600 disabled:opacity-40 text-white"
                  >
                    {sendingMessage ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </form>
              </>
            )}

            {/* PARTICIPANTS */}

            {activeTab === "people" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  In this classroom
                </p>

                <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-200 text-xs font-bold">
                    {tutorInitial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">
                      {tutorName}
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Tutor
                    </p>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                {participants
                  .filter(
                    (person) =>
                      person.is_present !== false
                  )
                  .map((person, index) => {
                    const name =
                      person.student_name ||
                      person.studentName ||
                      person.name ||
                      "Student";

                    return (
                      <div
                        key={
                          person.id ||
                          person.student_id ||
                          person.enrollment_id ||
                          index
                        }
                        className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                          {name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {name}
                          </p>

                          <p className="text-[10px] text-slate-500">
                            Student
                          </p>
                        </div>

                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                    );
                  })}

                {participants.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No other students are listed yet.
                  </p>
                )}
              </div>
            )}

            {/* RESOURCES */}

            {activeTab === "resources" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Shared class materials
                </p>

                {resources.length === 0 ? (
                  <div className="py-12 text-center">
                    <Paperclip
                      size={25}
                      className="mx-auto text-slate-600"
                    />

                    <p className="text-xs text-slate-400 mt-3">
                      No resources shared yet.
                    </p>
                  </div>
                ) : (
                  resources.map((resource, index) => {
                    const url = getResourceUrl(resource);

                    const isPresentation =
                      isPresentationResource(resource);

                    return (
                      <div
                        key={resource.id || index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                          {isPresentation ? (
                            <Presentation
                              size={17}
                              className="text-blue-300"
                            />
                          ) : url ? (
                            <FileText
                              size={17}
                              className="text-blue-300"
                            />
                          ) : (
                            <LinkIcon
                              size={17}
                              className="text-blue-300"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {getResourceName(resource)}
                          </p>

                          <p className="text-[10px] text-slate-500">
                            {resource.resource_type ||
                              resource.type ||
                              "Class resource"}
                          </p>
                        </div>

                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-300 hover:text-white font-semibold shrink-0"
                          >
                            Open
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </aside>
        </main>
      )}
    </div>
  );
};

export default StudentLiveClassroom;
