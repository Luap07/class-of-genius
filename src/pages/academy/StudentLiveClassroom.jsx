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
  FileText,
  Link as LinkIcon,
  Loader2,
  MessageCircle,
  Presentation,
  Send,
  Users,
  Video,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Monitor,
  Pen,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
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

const clean = (value) => (value == null ? "" : String(value).trim());

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
      const value = JSON.parse(raw);
      if (value && typeof value === "object") {
        return value.user || value.student || value;
      }
    } catch {
      // Ignore malformed local-storage entries.
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
      data.message || data.error || `Request failed (${response.status})`
    );
  }
  return data;
};

const getList = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return Array.isArray(data?.data) ? data.data : [];
};

const getResourceUrl = (resource) =>
  resource?.file_url ||
  resource?.fileUrl ||
  resource?.url ||
  resource?.resource_url ||
  resource?.link ||
  resource?.path ||
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

const getTutorProfileImageValue = (source = {}) =>
  source?.tutor_profile_image_url ||
  source?.tutorProfileImageUrl ||
  source?.profile_image_url ||
  source?.profileImageUrl ||
  source?.profileImage ||
  source?.profile_picture_url ||
  source?.profile_picture ||
  source?.avatar_url ||
  source?.avatar ||
  source?.tutor?.profile_image_url ||
  source?.tutor?.profileImageUrl ||
  source?.tutor?.profile_picture ||
  source?.tutor?.avatar_url ||
  "";

const toPublicAssetUrl = (value) => {
  const url = clean(value);
  if (!url) return "";
  if (/^(data:image|https?:\/\/)/i.test(url)) return url;
  try {
    return new URL(url, `${API_URL}/`).toString();
  } catch {
    return "";
  }
};

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

const getMessageId = (message) =>
  String(
    message?.id ||
      message?.message_id ||
      message?._id ||
      message?.created_at ||
      `${message?.sender_name || message?.senderName}-${message?.message || message?.content}`
  );

const getParticipantId = (person) =>
  String(
    person?.id ||
      person?.student_id ||
      person?.enrollment_id ||
      person?.enrollmentId ||
      person?.studentId ||
      person?.reference ||
      ""
  );

const getSenderName = (message) =>
  message?.sender_name ||
  message?.senderName ||
  message?.name ||
  "Participant";

const getMessageText = (message) =>
  message?.message || message?.content || message?.text || "";

const mergeUnique = (oldItems, newItems, getId) => {
  const result = [...oldItems];
  const ids = new Set(result.map(getId));

  newItems.forEach((item) => {
    const id = getId(item);
    if (!ids.has(id)) {
      ids.add(id);
      result.push(item);
    }
  });

  return result;
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
    return /^(data:image|https?:\/\/)/i.test(payload) ? payload : "";
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

const isClearEvent = (payload = {}) =>
  Boolean(
    payload.cleared ||
      payload.whiteboardCleared ||
      payload.action === "clear" ||
      payload.type === "clear" ||
      payload.type === "cleared"
  );

const resourceKind = (resource) => {
  const type = `${resource?.mime_type || resource?.resource_type || resource?.type || ""} ${getResourceUrl(resource)}`.toLowerCase();
  if (type.includes("pdf") || /\.pdf([?#]|$)/.test(type)) return "pdf";
  if (type.includes("image") || /\.(png|jpe?g|gif|webp)([?#]|$)/.test(type)) return "image";
  if (type.includes("video") || /\.(mp4|webm|mov)([?#]|$)/.test(type)) return "video";
  return "file";
};

function StudentLiveClassroom() {
  const navigate = useNavigate();
  const params = useParams();
  const roomCode = params.roomCode || params.code || params.id || "";
  const identity = useMemo(() => getStudentIdentity(), []);

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const tutorSocketIdRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const cameraStreamRef = useRef(null);
  const audioStreamRef = useRef(new MediaStream());
  const cameraVideoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);
  const mountedRef = useRef(true);
  const joiningRef = useRef(false);
  const joinedRef = useRef(false);
  const whiteboardImageRef = useRef("");

  const [classroom, setClassroom] = useState(null);
  const [tutorProfileImage, setTutorProfileImage] = useState("");
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
  const [presentationTotalPages, setPresentationTotalPages] = useState(1);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [activeStage, setActiveStage] = useState("waiting");
  const [activeTab, setActiveTab] = useState("chat");
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [mediaConnected, setMediaConnected] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const classId =
    classroom?.id ||
    classroom?.live_class_id ||
    classroom?.liveClassId ||
    "";
  const studentReference = identity.enrollmentId || identity.studentId || "";
  const studentName = identity.studentName;
  const classTitle =
    classroom?.title ||
    classroom?.subject ||
    classroom?.className ||
    classroom?.name ||
    "Live Classroom";
  const tutorName =
    classroom?.tutor_name ||
    classroom?.tutorName ||
    classroom?.tutor?.name ||
    "Your tutor";
  const tutorInitial = tutorName.charAt(0).toUpperCase();
  const materialUrl = getResourceUrl(activeMaterial);
  const presentationUrl = getPresentationUrl(presentation);
  const materialName = getResourceName(activeMaterial || {});
  const stageMode = activeStage;

  const attachCamera = useCallback((stream) => {
    const video = cameraVideoRef.current;
    if (!video) return;
    if (video.srcObject !== stream) video.srcObject = stream || null;
    if (stream) video.play?.().catch(() => {});
  }, []);

  useEffect(() => {
    attachCamera(cameraAvailable ? cameraStreamRef.current : null);
  }, [cameraAvailable, attachCamera]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.srcObject = audioStreamRef.current;
    if (audioEnabled && audioAvailable) {
      audio.play().catch(() => setAudioEnabled(false));
    }
  }, [audioEnabled, audioAvailable]);

  const clearWhiteboardCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

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

  const applyClassroomState = useCallback(
    (state = {}) => {
      const data =
        state.classroomState ||
        state.classroom_state ||
        state.state ||
        state.data ||
        state;

      if (!data || typeof data !== "object") return;

      const rawStage = clean(
        data.activeStage ||
          data.active_stage ||
          data.stage ||
          data.currentTool
      ).toLowerCase();

      const aliases = {
        camera: "video",
        tutor: "video",
        board: "whiteboard",
        slides: "presentation",
        resource: "material",
        materials: "material",
        idle: "waiting",
      };
      const normalizedStage = aliases[rawStage] || rawStage;

      if (
        ["video", "whiteboard", "presentation", "material", "waiting"].includes(
          normalizedStage
        )
      ) {
        setActiveStage(normalizedStage);
      }

      const boardPayload = data.whiteboard || data;
      const boardImage = getWhiteboardImage(boardPayload);

      if (boardImage) {
        whiteboardImageRef.current = boardImage;
        setWhiteboardImage(boardImage);
      }

      if (isClearEvent(boardPayload)) {
        whiteboardImageRef.current = "";
        setWhiteboardImage("");
        clearWhiteboardCanvas();
      }

      const nextPresentation =
        data.presentation ??
        data.activePresentation ??
        data.active_presentation;

      if (nextPresentation !== undefined) {
        if (!nextPresentation || isClearEvent(nextPresentation)) {
          setPresentation(null);
          setPresentationPage(1);
          setPresentationTotalPages(1);
        } else {
          setPresentation(nextPresentation);
          setPresentationPage(getPresentationPage(nextPresentation));
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

      const nextMaterial =
        data.activeMaterial ?? data.active_material;
      if (nextMaterial !== undefined) {
        setActiveMaterial(
          !nextMaterial || isClearEvent(nextMaterial)
            ? null
            : nextMaterial
        );
      }

      if (Array.isArray(data.resources)) {
        setResources((previous) =>
          mergeUnique(
            previous,
            data.resources,
            (resource) =>
              String(
                resource.id ||
                  getResourceUrl(resource) ||
                  resource.title
              )
          )
        );
      }
    },
    [clearWhiteboardCanvas]
  );

  const loadTutorProfileImage = useCallback(async (room) => {
    const directImage = toPublicAssetUrl(getTutorProfileImageValue(room));
    if (directImage) setTutorProfileImage(directImage);

    const tutorReference =
      room?.tutor_reference ||
      room?.tutorReference ||
      room?.tutor?.reference ||
      room?.tutor?.tutor_reference ||
      "";

    if (!tutorReference) return directImage;

    try {
      const response = await apiRequest(
        `/api/academy/tutor-application/${encodeURIComponent(tutorReference)}`
      );
      const profile =
        response?.tutor ||
        response?.profile ||
        response?.application ||
        response?.data?.tutor ||
        response?.data?.profile ||
        response?.data ||
        response;
      const image = toPublicAssetUrl(
        getTutorProfileImageValue(profile) ||
        getTutorProfileImageValue(response)
      );

      if (image && mountedRef.current) setTutorProfileImage(image);
      return image || directImage;
    } catch (error) {
      console.warn("Unable to load tutor profile picture:", error.message);
      return directImage;
    }
  }, []);

  const loadClassroom = useCallback(async () => {
    if (!roomCode) {
      throw new Error("Classroom room code is missing.");
    }

    const result = await apiRequest(
      `/api/academy/live-class/room/${encodeURIComponent(roomCode)}`
    );
    const room =
      result.classroom ||
      result.session ||
      result.liveClass ||
      result.live_class ||
      result.data ||
      result;

    if (!room?.id && !room?.live_class_id && !room?.liveClassId) {
      throw new Error("The classroom could not be found.");
    }

    if (mountedRef.current) setClassroom(room);
    loadTutorProfileImage(room);
    return room;
  }, [roomCode, loadTutorProfileImage]);

  const loadClassroomData = useCallback(
    async (id) => {
      if (!id) return;

      const endpoints = [
        ["participants", `/api/academy/live-classes/${id}/participants`],
        ["chat", `/api/academy/live-classes/${id}/chat`],
        ["whiteboard", `/api/academy/live-classes/${id}/whiteboard`],
        ["resources", `/api/academy/live-classes/${id}/resources`],
        ["state", `/api/academy/live-classes/${id}/state`],
      ];

      const results = await Promise.allSettled(
        endpoints.map(([, endpoint]) => apiRequest(endpoint))
      );

      if (!mountedRef.current) return;

      results.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        const [key] = endpoints[index];
        const value = result.value;

        if (key === "participants") {
          setParticipants(getList(value, ["participants", "items"]));
        }

        if (key === "chat") {
          const list = getList(value, ["messages", "chat", "items"]);
          setMessages((previous) =>
            mergeUnique(previous, list, getMessageId).sort(
              (a, b) =>
                new Date(a.created_at || a.createdAt || 0) -
                new Date(b.created_at || b.createdAt || 0)
            )
          );
        }

        if (key === "whiteboard") {
          const image = getWhiteboardImage(value);
          if (image) {
            whiteboardImageRef.current = image;
            setWhiteboardImage(image);
          }
          if (isClearEvent(value)) {
            whiteboardImageRef.current = "";
            setWhiteboardImage("");
            clearWhiteboardCanvas();
          }
        }

        if (key === "resources") {
          setResources(getList(value, ["resources", "items"]));
        }

        if (key === "state") {
          applyClassroomState(value.classroomState || value.state || value);
        }
      });
    },
    [applyClassroomState, clearWhiteboardCanvas]
  );

  const drawWhiteboardEvent = useCallback(
    (payload = {}) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const action = clean(
        payload.action || payload.type || payload.event
      ).toLowerCase();

      if (
        ["clear", "cleared", "reset"].includes(action) ||
        isClearEvent(payload)
      ) {
        clearWhiteboardCanvas();
        whiteboardImageRef.current = "";
        setWhiteboardImage("");
        return;
      }

      if (["undo", "erase-all"].includes(action)) return;

      const stroke =
        payload.stroke ||
        payload.data ||
        payload.drawing ||
        payload;
      const points =
        stroke.points ||
        stroke.path ||
        stroke.coordinates ||
        [];

      if (!Array.isArray(points) || points.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const point = (item) => {
        const x = Number(item.x ?? item.clientX ?? item[0] ?? 0);
        const y = Number(item.y ?? item.clientY ?? item[1] ?? 0);
        const normalized = Boolean(item.normalized || item.relative);
        return {
          x: normalized ? x * rect.width : x,
          y: normalized ? y * rect.height : y,
        };
      };

      const first = point(points[0]);
      context.save();
      context.strokeStyle =
        stroke.color ||
        stroke.strokeStyle ||
        payload.color ||
        "#111827";
      context.lineWidth = Number(
        stroke.lineWidth || stroke.width || payload.lineWidth || 3
      );
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalCompositeOperation =
        action === "erase" || stroke.tool === "eraser"
          ? "destination-out"
          : "source-over";
      context.beginPath();
      context.moveTo(first.x, first.y);

      points.slice(1).forEach((item) => {
        const next = point(item);
        context.lineTo(next.x, next.y);
      });

      if (points.length === 1) {
        context.lineTo(first.x + 0.1, first.y + 0.1);
      }

      context.stroke();
      context.restore();
    },
    [clearWhiteboardCanvas]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stageMode !== "whiteboard") return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const previous = document.createElement("canvas");
      previous.width = canvas.width;
      previous.height = canvas.height;
      previous.getContext("2d")?.drawImage(canvas, 0, 0);

      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));

      const context = canvas.getContext("2d");
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (previous.width && previous.height) {
        context.drawImage(
          previous,
          0,
          0,
          previous.width,
          previous.height,
          0,
          0,
          rect.width,
          rect.height
        );
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [joinedClass, stageMode]);

  useEffect(() => {
    if (!canvasRef.current || !whiteboardImage) return;
    const canvas = canvasRef.current;
    const image = new Image();

    image.onload = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      context.drawImage(image, 0, 0, rect.width, rect.height);
    };

    image.src = whiteboardImage;
  }, [whiteboardImage, stageMode]);

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    tutorSocketIdRef.current = null;
    pendingIceCandidatesRef.current = [];
    cameraStreamRef.current = null;

    audioStreamRef.current.getTracks().forEach((track) => {
      audioStreamRef.current.removeTrack(track);
    });

    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
    if (audioRef.current) audioRef.current.srcObject = null;

    setMediaConnected(false);
    setCameraAvailable(false);
    setAudioAvailable(false);
  }, []);

  const getOrCreatePeer = useCallback(
    (roomId) => {
      if (peerRef.current) return peerRef.current;

      const peer = new RTCPeerConnection(ICE_SERVERS);
      peer.addTransceiver("video", { direction: "recvonly" });
      peer.addTransceiver("audio", { direction: "recvonly" });

      peer.ontrack = (event) => {
        const track = event.track;

        if (track.kind === "video") {
          const stream =
            event.streams?.[0] || new MediaStream([track]);
          cameraStreamRef.current = stream;
          attachCamera(stream);
          setCameraAvailable(true);
          setMediaConnected(true);

          track.onended = () => {
            cameraStreamRef.current = null;
            if (cameraVideoRef.current) {
              cameraVideoRef.current.srcObject = null;
            }
            setCameraAvailable(false);
          };
          return;
        }

        if (track.kind === "audio") {
          if (
            !audioStreamRef.current
              .getAudioTracks()
              .some((item) => item.id === track.id)
          ) {
            audioStreamRef.current.addTrack(track);
          }

          setAudioAvailable(true);
          setMediaConnected(true);

          if (audioRef.current) {
            audioRef.current.srcObject = audioStreamRef.current;
            audioRef.current.play().catch(() => {
              setAudioEnabled(false);
            });
          }

          track.onended = () => {
            audioStreamRef.current.removeTrack(track);
            setAudioAvailable(
              audioStreamRef.current.getAudioTracks().length > 0
            );
          };
        }
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate || !tutorSocketIdRef.current) return;

        socketRef.current?.emit("webrtc:ice-candidate", {
          liveClassId: roomId,
          targetSocketId: tutorSocketIdRef.current,
          candidate: event.candidate,
        });
      };

      peer.onconnectionstatechange = () => {
        setMediaConnected(peer.connectionState === "connected");
        if (
          ["failed", "closed", "disconnected"].includes(
            peer.connectionState
          )
        ) {
          setMediaConnected(false);
        }
      };

      peerRef.current = peer;
      return peer;
    },
    [attachCamera]
  );

  const connectSocket = useCallback(
    (roomId) => {
      const token = getToken();
      if (!token) {
        throw new Error(
          "Your student login session has expired. Please sign in again."
        );
      }

      socketRef.current?.disconnect();

      const socket = io(API_URL, {
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
          setError(data.message || "Unable to join classroom connection.");
          return;
        }

        setSocketConnected(true);
        applyClassroomState(
          data?.classroomState || data?.state || data
        );

        socket.emit("live:student-ready", {
          liveClassId: roomId,
          role: "student",
        });
      });

      socket.on("connect_error", (socketError) => {
        console.error("STUDENT SOCKET ERROR:", socketError);
        setSocketConnected(false);
      });

      socket.on("disconnect", () => {
        setSocketConnected(false);
        setMediaConnected(false);
      });

      socket.on("live:peer-left", closePeer);

      const handleState = (payload) => applyClassroomState(payload);

      [
        "live:classroom-state",
        "live:state-sync",
        "live:activity-update",
      ].forEach((eventName) => {
        socket.on(eventName, handleState);
      });

      socket.on("webrtc:offer", async (payload) => {
        try {
          if (!payload?.offer) return;

          const tutorId =
            payload.fromSocketId ||
            payload.senderSocketId ||
            payload.socketId;

          if (!tutorId) {
            console.error("Tutor socket ID missing from offer", payload);
            return;
          }

          tutorSocketIdRef.current = tutorId;
          const peer = getOrCreatePeer(roomId);

          if (
            peer.signalingState !== "stable" &&
            peer.signalingState !== "have-remote-offer"
          ) {
            return;
          }

          await peer.setRemoteDescription(
            new RTCSessionDescription(payload.offer)
          );

          for (const candidate of pendingIceCandidatesRef.current) {
            try {
              await peer.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (candidateError) {
              console.warn("Queued ICE candidate:", candidateError);
            }
          }

          pendingIceCandidatesRef.current = [];

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          socket.emit("webrtc:answer", {
            liveClassId: roomId,
            targetSocketId: tutorId,
            answer,
          });
        } catch (offerError) {
          console.error("STUDENT WEBRTC OFFER ERROR:", offerError);
        }
      });

      socket.on("webrtc:ice-candidate", async (payload) => {
        if (!payload?.candidate) return;

        const peer = peerRef.current;
        if (!peer?.remoteDescription) {
          pendingIceCandidatesRef.current.push(payload.candidate);
          return;
        }

        try {
          await peer.addIceCandidate(
            new RTCIceCandidate(payload.candidate)
          );
        } catch (candidateError) {
          console.warn("Student ICE candidate:", candidateError);
        }
      });

      socket.on("live:presentation-update", (payload) => {
        const next =
          payload?.presentation ||
          payload?.resource ||
          payload?.data ||
          payload;

        if (!next || typeof next !== "object") return;

        if (isClearEvent(next)) {
          setPresentation(null);
          setPresentationPage(1);
          setPresentationTotalPages(1);
          setActiveStage("waiting");
          return;
        }

        setPresentation(next);
        setPresentationPage(getPresentationPage(next));
        setPresentationTotalPages(
          Math.max(
            1,
            Number(next.total_pages || next.totalPages || 1)
          )
        );
        setActiveStage("presentation");
      });

      socket.on("live:presentation-page", (payload) => {
        const page = Math.max(
          1,
          Number(
            payload?.page ||
              payload?.currentPage ||
              payload?.current_page ||
              1
          )
        );

        setPresentationPage(page);
        setPresentation((previous) =>
          previous
            ? { ...previous, current_page: page, currentPage: page }
            : previous
        );
      });

      socket.on("live:whiteboard-update", (payload = {}) => {
        if (
          isClearEvent(payload) ||
          isClearEvent(payload.whiteboard || {})
        ) {
          whiteboardImageRef.current = "";
          setWhiteboardImage("");
          clearWhiteboardCanvas();
          setActiveStage("whiteboard");
          return;
        }

        const image = getWhiteboardImage(
          payload.whiteboard ??
            payload.payload ??
            payload.event?.payload ??
            payload
        );

        if (image) {
          whiteboardImageRef.current = image;
          setWhiteboardImage(image);
        }

        setActiveStage("whiteboard");
      });

      [
        "live:whiteboard-draw",
        "live:whiteboard-stroke",
        "whiteboard:draw",
      ].forEach((eventName) => {
        socket.on(eventName, (payload) => {
          drawWhiteboardEvent(payload);
          setActiveStage("whiteboard");
        });
      });

      socket.on("live:stage-update", (payload) => {
        const profileImage = toPublicAssetUrl(
          getTutorProfileImageValue(payload || {})
        );
        if (profileImage) setTutorProfileImage(profileImage);

        const raw = clean(
          payload?.stage ||
            payload?.activeStage ||
            payload?.active_stage ||
            payload?.tool
        ).toLowerCase();

        const aliases = {
          camera: "video",
          tutor: "video",
          board: "whiteboard",
          slides: "presentation",
          resource: "material",
          materials: "material",
          idle: "waiting",
        };
        const stage = aliases[raw] || raw;

        if (
          ["video", "whiteboard", "presentation", "material", "waiting"].includes(
            stage
          )
        ) {
          setActiveStage(stage);
        }
      });

      socket.on("live:material-update", (payload) => {
        const material =
          payload?.material ||
          payload?.activeMaterial ||
          payload?.resource ||
          payload?.data ||
          payload;

        if (!material || isClearEvent(material)) {
          setActiveMaterial(null);
          setActiveStage("waiting");
          return;
        }

        setActiveMaterial(material);
        setActiveStage("material");
      });

      socket.on("live:chat-message", addMessage);

      socket.on("live:participant-update", (payload) => {
        const person =
          payload?.participant || payload?.data || payload;
        if (!person) return;

        const id = getParticipantId(person);
        if (
          payload?.action === "left" ||
          person.is_present === false
        ) {
          setParticipants((previous) =>
            previous.filter((item) => getParticipantId(item) !== id)
          );
          return;
        }

        setParticipants((previous) =>
          previous.some((item) => getParticipantId(item) === id)
            ? previous.map((item) =>
                getParticipantId(item) === id
                  ? { ...item, ...person }
                  : item
              )
            : [...previous, person]
        );
      });

      socket.on("live:resource-added", (payload) => {
        const resource =
          payload?.resource || payload?.data || payload;
        if (!resource) return;

        setResources((previous) =>
          mergeUnique(
            previous,
            [resource],
            (item) =>
              String(
                item.id ||
                  getResourceUrl(item) ||
                  item.title
              )
          )
        );
      });

      const handleEnded = () => {
        setError("The tutor has ended this live class.");
        setActiveStage("waiting");
        closePeer();
      };

      socket.on("live:ended", handleEnded);
      socket.on("live:class-ended", handleEnded);

      return socket;
    },
    [
      identity.className,
      identity.enrollmentId,
      identity.studentId,
      identity.studentName,
      addMessage,
      applyClassroomState,
      clearWhiteboardCanvas,
      closePeer,
      drawWhiteboardEvent,
      getOrCreatePeer,
    ]
  );

  const joinClassroom = useCallback(async () => {
    if (joiningRef.current || joinedRef.current) return;

    joiningRef.current = true;
    setJoining(true);
    setError("");

    try {
      const room = classroom || (await loadClassroom());
      const id =
        room.id || room.live_class_id || room.liveClassId;

      if (!id) throw new Error("Invalid classroom identifier.");

      if (!studentReference) {
        throw new Error(
          "Your student enrollment reference is missing. Please sign in again."
        );
      }

      await apiRequest(`/api/academy/live-classes/${id}/join`, {
        method: "POST",
        body: JSON.stringify({
          enrollmentId: identity.enrollmentId,
          studentId: identity.studentId,
          studentName: identity.studentName,
          className: identity.className,
        }),
      });

      if (!mountedRef.current) return;

      joinedRef.current = true;
      setJoinedClass(true);
      await loadClassroomData(id);
      connectSocket(id);
    } catch (joinError) {
      console.error("STUDENT JOIN ERROR:", joinError);
      setError(joinError.message || "Unable to join classroom.");
    } finally {
      joiningRef.current = false;
      if (mountedRef.current) setJoining(false);
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

  const sendMessage = useCallback(
    async (event) => {
      event?.preventDefault();
      const text = messageInput.trim();

      if (!text || !classId || sendingMessage) return;

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
              senderId: studentReference,
              sender_id: studentReference,
              enrollmentId: identity.enrollmentId,
              studentId: identity.studentId,
            }),
          }
        );

        const saved =
          result.chat ||
          result.messageData ||
          result.data?.chat ||
          result.data ||
          result.message;

        addMessage(
          saved && typeof saved === "object"
            ? saved
            : {
                id: `student-${Date.now()}`,
                sender_name: studentName,
                sender_role: "student",
                sender_id: studentReference,
                message: text,
                created_at: new Date().toISOString(),
              }
        );

        setMessageInput("");
      } catch (sendError) {
        setError(sendError.message || "Unable to send message.");
      } finally {
        setSendingMessage(false);
      }
    },
    [
      messageInput,
      classId,
      sendingMessage,
      studentName,
      studentReference,
      identity.enrollmentId,
      identity.studentId,
      addMessage,
    ]
  );

  const leaveClassroom = useCallback(async () => {
    const id = classId;

    try {
      socketRef.current?.emit("live:leave", {
        liveClassId: id,
        role: "student",
        enrollmentId: identity.enrollmentId,
        studentId: identity.studentId,
      });

      socketRef.current?.disconnect();
      socketRef.current = null;
      closePeer();

      if (id) {
        await apiRequest(`/api/academy/live-classes/${id}/leave`, {
          method: "POST",
          body: JSON.stringify({
            enrollmentId: identity.enrollmentId,
            studentId: identity.studentId,
            studentReference,
          }),
        }).catch(() => {});
      }
    } catch (leaveError) {
      console.error("Leave classroom error:", leaveError);
    } finally {
      joinedRef.current = false;
      joiningRef.current = false;
      setJoinedClass(false);
      setSocketConnected(false);
      setMessages([]);
      setParticipants([]);
      setResources([]);
      navigate("/academy/student");
    }
  }, [
    classId,
    identity.enrollmentId,
    identity.studentId,
    studentReference,
    closePeer,
    navigate,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    if (!roomCode) {
      setLoading(false);
      setError("Classroom room code is missing.");
      return () => {
        mountedRef.current = false;
      };
    }

    let active = true;

    const initialize = async () => {
      try {
        setLoading(true);
        setError("");
        await loadClassroom();
      } catch (loadError) {
        console.error("Classroom initialization error:", loadError);
        if (active) {
          setError(loadError.message || "Unable to load this classroom.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    initialize();

    return () => {
      active = false;
      mountedRef.current = false;
    };
  }, [roomCode, loadClassroom]);

  useEffect(() => {
    if (!joinedClass || !classId) return undefined;

    const refresh = async () => {
      try {
        await loadClassroomData(classId);
      } catch (refreshError) {
        console.warn("Classroom refresh failed:", refreshError);
      }
    };

    const interval = window.setInterval(refresh, 10000);
    return () => window.clearInterval(interval);
  }, [joinedClass, classId, loadClassroomData]);

  useEffect(() => {
    const container = chatEndRef.current;
    container?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      peerRef.current?.close();
      peerRef.current = null;

      cameraStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      audioStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  const enableAudio = useCallback(() => {
    audioStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    setAudioEnabled(true);
    audioRef.current?.play().catch(() => {});
  }, []);

  const disableAudio = useCallback(() => {
    audioStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    setAudioEnabled(false);
  }, []);

  const isConnected = socketConnected || mediaConnected;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d19] flex items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Preparing your classroom</h2>
          <p className="text-sm text-slate-400 mt-2">
            Connecting you to your tutor...
          </p>
        </div>
      </div>
    );
  }

  if (error && !classroom) {
    return (
      <div className="min-h-screen bg-[#080d19] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-[#111a2c] border border-white/10 rounded-2xl p-7 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Classroom unavailable</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/academy/student")}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-white flex flex-col">
      <header className="h-[72px] border-b border-white/10 bg-[#0d1525] flex items-center justify-between px-4 md:px-7 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={leaveClassroom}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
            title="Leave classroom"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-sm md:text-base truncate">
              {classTitle}
            </h1>
            <p className="text-xs text-slate-400 truncate">{tutorName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400">Connecting...</span>
              </>
            )}
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300">
            <Users className="w-4 h-4" />
            {participants.length} participants
          </div>
          <button
            onClick={leaveClassroom}
            className="px-3 md:px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs md:text-sm font-semibold"
          >
            Leave class
          </button>
        </div>
      </header>

      {!joinedClass ? (
        <main className="flex-1 flex items-center justify-center p-5">
          <div className="max-w-lg w-full bg-[#111a2c] border border-white/10 rounded-3xl p-7 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
              <Video className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Join your live class</h2>
            <p className="text-sm text-slate-400 mb-6">
              You are about to enter {classTitle}. Your tutor's whiteboard,
              presentation and learning materials will appear here
              automatically.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={joinClassroom}
              disabled={joining}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold flex items-center justify-center gap-2"
            >
              {joining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining classroom...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Join classroom
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 mt-4">
              Room: {roomCode}
            </p>
          </div>
        </main>
      ) : (
        <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px]">
          <section className="min-w-0 p-3 md:p-5 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-sm md:text-base">
                  Classroom stage
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Automatically synchronized with your tutor
                </p>
              </div>
              <button
                onClick={audioEnabled ? disableAudio : enableAudio}
                disabled={!audioAvailable}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40"
                title={audioEnabled ? "Mute tutor audio" : "Enable tutor audio"}
              >
                {audioEnabled ? (
                  <Volume2 className="w-5 h-5 text-blue-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>

            <div className="relative flex-1 min-h-[400px] rounded-2xl overflow-hidden bg-[#111a2c] border border-white/10">
              {stageMode === "video" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#071426] text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-200 text-2xl font-bold overflow-hidden">
                    {tutorProfileImage ? (
                      <img
                        src={tutorProfileImage}
                        alt={`${tutorName} profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      tutorInitial
                    )}
                  </div>
                  <h3 className="font-semibold mt-4">Waiting for tutor activity</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-md">
                    Your tutor's whiteboard or presentation will appear here automatically when selected.
                  </p>
                </div>
              )}

              {stageMode === "whiteboard" && (
                <div className="absolute inset-0 bg-white relative">
                  {whiteboardImage ? (
                    <img
                      src={whiteboardImage}
                      alt="Tutor whiteboard"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  ) : null}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full block"
                  />
                  <div className="absolute top-3 left-3 px-3 py-2 rounded-lg bg-black/70 text-white text-xs flex items-center gap-2 pointer-events-none">
                    <Pen className="w-4 h-4" />
                    Live whiteboard
                  </div>
                </div>
              )}

              {stageMode === "presentation" && (
                <div className="absolute inset-0 flex flex-col bg-[#111a2c]">
                  <div className="h-12 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Presentation className="w-4 h-4 text-blue-400" />
                      {presentation?.title ||
                        presentation?.name ||
                        "Tutor presentation"}
                    </div>
                    <span className="text-xs text-slate-400">
                      Page {presentationPage}
                      {presentationTotalPages > 1
                        ? ` of ${presentationTotalPages}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center p-3">
                    {presentationUrl ? (
                      <iframe
                        src={presentationUrl}
                        title="Tutor presentation"
                        className="w-full h-full rounded-lg bg-white"
                        allow="fullscreen"
                      />
                    ) : (
                      <div className="text-center text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3" />
                        <p>No presentation is currently available.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {stageMode === "material" && (
                <div className="absolute inset-0 flex flex-col bg-[#111a2c]">
                  <div className="h-12 px-4 flex items-center gap-2 border-b border-white/10 shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold truncate">
                      {materialName || "Tutor learning material"}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 p-3">
                    {materialUrl ? (
                      resourceKind(activeMaterial || {}) === "image" ? (
                        <img
                          src={materialUrl}
                          alt={materialName}
                          className="w-full h-full object-contain rounded-lg bg-white"
                        />
                      ) : resourceKind(activeMaterial || {}) === "video" ? (
                        <video
                          src={materialUrl}
                          controls
                          className="w-full h-full rounded-lg bg-black"
                        />
                      ) : (
                        <iframe
                          src={materialUrl}
                          title="Tutor learning material"
                          className="w-full h-full rounded-lg bg-white"
                        />
                      )
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                        <FileText className="w-12 h-12 mb-3" />
                        <p>No material is currently open.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!["video", "whiteboard", "presentation", "material"].includes(
                stageMode
              ) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <Monitor className="w-14 h-14 text-blue-400 mb-4" />
                  <h3 className="text-lg font-bold">Waiting for your tutor</h3>
                  <p className="text-sm text-slate-400 max-w-sm mt-2">
                    Your tutor's whiteboard, presentation or learning material
                    will appear here when opened.
                  </p>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400 mt-5" />
                </div>
              )}
              <div className="absolute z-40 bottom-4 right-4 w-24 sm:w-28 aspect-square rounded-2xl overflow-hidden border-2 border-white/20 bg-[#0b1930] shadow-2xl">
                {tutorProfileImage ? (
                  <img
                    src={tutorProfileImage}
                    alt={`${tutorName} profile picture`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-200">
                    {tutorInitial}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-center">
                  <span className="text-[9px] font-semibold text-white truncate block">
                    {tutorName}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#111a2c] border border-white/10 p-3">
                <p className="text-xs text-slate-400">Classroom</p>
                <p className="font-semibold text-sm mt-1 truncate">
                  {classTitle}
                </p>
              </div>
              <div className="rounded-xl bg-[#111a2c] border border-white/10 p-3">
                <p className="text-xs text-slate-400">Tutor</p>
                <p className="font-semibold text-sm mt-1 truncate">
                  {tutorName}
                </p>
              </div>
              <div className="hidden md:block rounded-xl bg-[#111a2c] border border-white/10 p-3">
                <p className="text-xs text-slate-400">Connection</p>
                <p
                  className={`font-semibold text-sm mt-1 ${
                    isConnected ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {isConnected ? "Connected" : "Connecting"}
                </p>
              </div>
            </div>
          </section>

          <aside className="border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0d1525] flex flex-col min-h-[500px] lg:min-h-0">
            <div className="grid grid-cols-3 border-b border-white/10">
              {[
                ["chat", MessageCircle, "Chat"],
                ["people", Users, "People"],
                ["resources", BookOpen, "Materials"],
              ].map(([tab, Icon, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-xs font-semibold flex items-center justify-center gap-2 ${
                    activeTab === tab
                      ? "text-blue-400 border-b-2 border-blue-500"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "chat" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                      <MessageCircle className="w-10 h-10 mb-3" />
                      <p className="text-sm">No messages yet.</p>
                      <p className="text-xs mt-1">
                        Send a message or ask your tutor a question.
                      </p>
                    </div>
                  ) : (
                    messages.map((item, index) => {
                      const senderId = String(
                        item.sender_id ||
                          item.senderId ||
                          item.student_id ||
                          item.studentId ||
                          ""
                      );
                      const isMine =
                        senderId === String(studentReference) ||
                        item.isMine === true;

                      return (
                        <div
                          key={getMessageId(item) || index}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                              isMine
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-white/5 text-slate-200 rounded-bl-sm"
                            }`}
                          >
                            <p className="text-[10px] opacity-70 mb-1">
                              {isMine ? "You" : getSenderName(item)}
                            </p>
                            <p className="text-sm break-words whitespace-pre-wrap">
                              {getMessageText(item)}
                            </p>
                            {(item.created_at || item.createdAt) && (
                              <p className="text-[9px] opacity-60 mt-1 text-right">
                                {new Date(
                                  item.created_at || item.createdAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form
                  onSubmit={sendMessage}
                  className="p-3 border-t border-white/10 flex items-center gap-2"
                >
                  <input
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    placeholder="Ask your tutor..."
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendingMessage}
                    className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "people" && (
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  In this classroom
                </h3>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden">
                    {tutorProfileImage ? (
                      <img
                        src={tutorProfileImage}
                        alt={`${tutorName} profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-blue-200">{tutorInitial}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {tutorName}
                    </p>
                    <p className="text-xs text-emerald-400">Tutor</p>
                  </div>
                </div>

                {participants.map((person, index) => {
                  const name =
                    person.name ||
                    person.studentName ||
                    person.student_name ||
                    "Student";

                  return (
                    <div
                      key={getParticipantId(person) || index}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-slate-500">Student</p>
                      </div>
                    </div>
                  );
                })}

                {participants.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No other participants are listed yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "resources" && (
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Shared learning materials
                </h3>

                {resources.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-3" />
                    <p className="text-sm">No materials shared yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resources.map((resource, index) => {
                      const url = getResourceUrl(resource);
                      return (
                        <div
                          key={resource.id || resource._id || index}
                          className="p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold break-words">
                                {getResourceName(resource)}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {resource.type ||
                                  resource.fileType ||
                                  resource.resource_type ||
                                  "Class resource"}
                              </p>
                              {url && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  Open material
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </aside>
        </main>
      )}

      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );
}

export default StudentLiveClassroom;
