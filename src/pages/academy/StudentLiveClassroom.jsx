import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Camera,
  CameraOff,
  Check,
  ChevronDown,
  FileText,
  Link as LinkIcon,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Monitor,
  Paperclip,
  Send,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

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
      // Ignore malformed stored values.
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
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
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

const normaliseList = (data) => {
  if (Array.isArray(data)) return data;

  return (
    data?.data ||
    data?.items ||
    data?.participants ||
    data?.messages ||
    data?.resources ||
    data?.events ||
    []
  );
};

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StudentLiveClassroom = () => {
  const navigate = useNavigate();
  const params = useParams();

  const roomCode =
    params.roomCode ||
    params.code ||
    params.id ||
    "";

  const identity = getStudentIdentity();

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const chatEndRef = useRef(null);

  const pollingRef = useRef(null);
  const mountedRef = useRef(true);

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [whiteboardEvents, setWhiteboardEvents] = useState([]);

  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);
  const [joinedClass, setJoinedClass] = useState(false);
  const [mediaConnected, setMediaConnected] = useState(false);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);

  const [remoteCameraAvailable, setRemoteCameraAvailable] =
    useState(false);

  const [sharingScreen, setSharingScreen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

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

  const addMessage = useCallback((incoming) => {
    if (!incoming) return;

    const item = incoming.message || incoming.data || incoming;

    const id =
      item.id ||
      item.message_id ||
      item.created_at ||
      `${item.sender_name || item.senderName}-${item.message}`;

    setMessages((previous) => {
      if (
        previous.some(
          (entry) =>
            String(
              entry.id ||
              entry.message_id ||
              entry.created_at ||
              `${entry.sender_name || entry.senderName}-${entry.message}`
            ) === String(id)
        )
      ) {
        return previous;
      }

      return [...previous, item];
    });
  }, []);

  const loadClassroom = useCallback(async () => {
    if (!roomCode) {
      throw new Error("Classroom room code is missing.");
    }

    const data = await apiRequest(
      `/api/academy/live-class/room/${encodeURIComponent(roomCode)}`
    );

    const room =
      data.classroom ||
      data.liveClass ||
      data.live_class ||
      data.data ||
      data;

    if (!room?.id && !room?.live_class_id) {
      throw new Error("The classroom could not be found.");
    }

    if (mountedRef.current) {
      setClassroom(room);
    }

    return room;
  }, [roomCode]);

  const loadClassroomData = useCallback(
    async (id) => {
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

        const list = normaliseList(result.value);

        switch (endpoints[index].key) {
          case "participants":
            setParticipants(list);
            break;

          case "chat":
            setMessages((previous) => {
              const combined = [...previous];

              list.forEach((item) => {
                const itemId =
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

                  return String(entryId) === String(itemId);
                });

                if (!exists) combined.push(item);
              });

              return combined;
            });
            break;

          case "whiteboard":
            setWhiteboardEvents(list);
            break;

          case "resources":
            setResources(list);
            break;

          default:
            break;
        }
      });
    },
    []
  );

  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    remoteStreamRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setMediaConnected(false);
    setRemoteCameraAvailable(false);
  }, []);

  const getOrCreatePeer = useCallback(() => {
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection(ICE_SERVERS);

    peer.ontrack = (event) => {
      const stream =
        event.streams?.[0] ||
        remoteStreamRef.current ||
        new MediaStream();

      if (!event.streams?.[0]) {
        stream.addTrack(event.track);
      }

      remoteStreamRef.current = stream;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }

      setMediaConnected(true);

      setRemoteCameraAvailable(
        stream.getVideoTracks().some(
          (track) => track.readyState === "live"
        )
      );
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      socketRef.current?.emit("webrtc:ice-candidate", {
        liveClassId: classId,
        candidate: event.candidate,
      });
    };

    peer.onconnectionstatechange = () => {
      const state = peer.connectionState;

      if (state === "connected") {
        setMediaConnected(true);
      }

      if (
        state === "failed" ||
        state === "disconnected" ||
        state === "closed"
      ) {
        setMediaConnected(false);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    peerRef.current = peer;

    return peer;
  }, [classId]);

  const startStudentMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

      localStreamRef.current = stream;

      stream.getVideoTracks().forEach((track) => {
        track.enabled = true;
      });

      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });

      setCameraEnabled(true);
      setMicrophoneEnabled(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (peerRef.current) {
        stream.getTracks().forEach((track) => {
          peerRef.current.addTrack(track, stream);
        });

        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);

        socketRef.current?.emit("webrtc:offer", {
          liveClassId: classId,
          offer,
        });
      }

      return stream;
    } catch (mediaError) {
      console.error("STUDENT MEDIA ERROR:", mediaError);

      setError(
        mediaError?.name === "NotAllowedError"
          ? "Camera or microphone permission was denied."
          : mediaError?.message ||
            "Unable to access your camera or microphone."
      );

      return null;
    }
  }, [classId]);

  const stopStudentMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;

    setCameraEnabled(false);
    setMicrophoneEnabled(false);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  const toggleStudentCamera = useCallback(async () => {
    if (!localStreamRef.current) {
      await startStudentMedia();
      return;
    }

    const track = localStreamRef.current.getVideoTracks()[0];

    if (!track) {
      await startStudentMedia();
      return;
    }

    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  }, [startStudentMedia]);

  const toggleStudentMicrophone = useCallback(async () => {
    if (!localStreamRef.current) {
      await startStudentMedia();
      return;
    }

    const track = localStreamRef.current.getAudioTracks()[0];

    if (!track) {
      await startStudentMedia();
      return;
    }

    track.enabled = !track.enabled;
    setMicrophoneEnabled(track.enabled);
  }, [startStudentMedia]);

  const connectSocket = useCallback(
    (roomId) => {
      const token = getToken();

      if (!token) {
        throw new Error("Your student login session has expired.");
      }

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
          setError(data.message || "Unable to join live signaling.");
          return;
        }

        setSocketConnected(true);
      });

      socket.on("connect_error", (socketError) => {
        console.error("STUDENT SOCKET ERROR:", socketError);
        setSocketConnected(false);
      });

      socket.on("disconnect", () => {
        setSocketConnected(false);
        setMediaConnected(false);
      });

      socket.on("live:peer-joined", () => {
        // The tutor initiates the media offer when a student joins.
      });

      socket.on("live:peer-left", () => {
        closePeer();
      });

      socket.on("webrtc:offer", async (payload) => {
        try {
          if (!payload?.offer) return;

          const peer = getOrCreatePeer();

          await peer.setRemoteDescription(
            new RTCSessionDescription(payload.offer)
          );

          const answer = await peer.createAnswer();

          await peer.setLocalDescription(answer);

          socket.emit("webrtc:answer", {
            liveClassId: roomId,
            answer,
          });
        } catch (peerError) {
          console.error("STUDENT OFFER ERROR:", peerError);
        }
      });

      socket.on("webrtc:answer", async (payload) => {
        try {
          if (!payload?.answer || !peerRef.current) return;

          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(payload.answer)
          );
        } catch (peerError) {
          console.error("STUDENT ANSWER ERROR:", peerError);
        }
      });

      socket.on("webrtc:ice-candidate", async (payload) => {
        try {
          if (!payload?.candidate || !peerRef.current) return;

          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(payload.candidate)
          );
        } catch (peerError) {
          console.error("STUDENT ICE ERROR:", peerError);
        }
      });

      socket.on("live:chat-message", addMessage);

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

      socket.on("live:whiteboard-update", (payload) => {
        const event = payload?.event || payload;

        if (!event) return;

        setWhiteboardEvents((previous) => [
          ...previous,
          event,
        ]);
      });

      socket.on("live:resource-added", (payload) => {
        const resource = payload?.resource || payload;

        if (!resource) return;

        setResources((previous) => [
          resource,
          ...previous,
        ]);
      });

      return socket;
    },
    [
      identity.className,
      identity.enrollmentId,
      identity.studentId,
      identity.studentName,
      addMessage,
      closePeer,
      getOrCreatePeer,
    ]
  );

  const joinClassroom = useCallback(async () => {
    if (joining || joinedClass) return;

    setJoining(true);
    setError("");

    try {
      const room = classroom || await loadClassroom();

      const id =
        room.id ||
        room.live_class_id ||
        room.liveClassId;

      if (!id) {
        throw new Error("Invalid classroom identifier.");
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

      setJoinedClass(true);

      await loadClassroomData(id);

      connectSocket(id);
    } catch (joinError) {
      console.error("STUDENT JOIN ERROR:", joinError);
      setError(joinError.message || "Unable to join classroom.");
    } finally {
      if (mountedRef.current) setJoining(false);
    }
  }, [
    joining,
    joinedClass,
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

      const text = message.trim();

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
              senderType: "student",
              sender_type: "student",
              enrollmentId: identity.enrollmentId,
              studentId: identity.studentId,
            }),
          }
        );

        const savedMessage =
          result.message ||
          result.data ||
          result.chat ||
          result;

        addMessage(savedMessage);

        socketRef.current?.emit("live:chat-message", {
          liveClassId: classId,
          message: savedMessage,
        });

        setMessage("");
      } catch (sendError) {
        setError(sendError.message || "Unable to send message.");
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

  const leaveClassroom = useCallback(async () => {
    const id = classId;

    socketRef.current?.emit("live:leave", {
      liveClassId: id,
      role: "student",
    });

    socketRef.current?.disconnect();
    socketRef.current = null;

    closePeer();
    stopStudentMedia();

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
        console.error("STUDENT LEAVE ERROR:", leaveError);
      }
    }

    setJoinedClass(false);
    navigate("/academy/student");
  }, [
    classId,
    closePeer,
    stopStudentMedia,
    identity.enrollmentId,
    identity.studentId,
    navigate,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    const initialise = async () => {
      try {
        await loadClassroom();
      } catch (loadError) {
        setError(loadError.message || "Unable to load classroom.");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    initialise();

    return () => {
      mountedRef.current = false;
    };
  }, [loadClassroom]);

  useEffect(() => {
    if (!joinedClass || !classId) return;

    loadClassroomData(classId);

    pollingRef.current = window.setInterval(() => {
      loadClassroomData(classId);
    }, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, [joinedClass, classId, loadClassroomData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }

      socketRef.current?.disconnect();
      closePeer();

      localStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [closePeer]);

  const getResourceUrl = (resource) =>
    resource.url ||
    resource.file_url ||
    resource.resource_url ||
    resource.link ||
    "";

  const getResourceName = (resource) =>
    resource.title ||
    resource.name ||
    resource.file_name ||
    resource.filename ||
    "Class resource";

  const getSenderName = (item) =>
    item.sender_name ||
    item.senderName ||
    item.name ||
    "Participant";

  const getMessageText = (item) =>
    item.message ||
    item.content ||
    item.text ||
    "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Loader2 className="animate-spin" size={20} />
          Loading classroom...
        </div>
      </div>
    );
  }

  if (error && !classroom) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-5">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#0b1220] p-6">
          <AlertCircle className="text-red-400 mb-3" size={28} />

          <h2 className="text-white font-bold text-lg">
            Unable to open classroom
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            {error}
          </p>

          <button
            onClick={() => navigate("/academy/student")}
            className="mt-5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm"
          >
            Return to student dashboard
          </button>
        </div>
      </div>
    );
  }

  const title =
    classroom?.title ||
    classroom?.subject ||
    "Live Classroom";

  const classLabel =
    classroom?.class_name ||
    classroom?.className ||
    identity.className ||
    "Classroom";

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <header className="h-[68px] shrink-0 border-b border-white/10 bg-[#071426] px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={leaveClassroom}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-300"
            title="Leave classroom"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-bold truncate">
              {title}
            </h1>

            <p className="text-[11px] text-slate-400 truncate">
              {classLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              socketConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />

          <span className="hidden sm:inline text-xs text-slate-300">
            {socketConnected ? "Connected" : "Reconnecting"}
          </span>

          {classroom?.status === "live" && (
            <span className="px-2.5 py-1 rounded-full bg-red-600/20 text-red-300 text-[10px] font-bold">
              LIVE
            </span>
          )}
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-3 rounded-xl border border-red-500/20 bg-red-950/30 px-3 py-2 text-xs text-red-200 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {!joinedClass ? (
        <main className="flex-1 flex items-center justify-center p-5">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1220] p-7 md:p-9 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/15 flex items-center justify-center mb-5">
              <Video className="text-blue-300" size={30} />
            </div>

            <h2 className="text-xl font-bold">
              {title}
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              You are about to join this live classroom.
            </p>

            <div className="mt-6 rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-left space-y-2">
              <div className="flex justify-between text-xs gap-3">
                <span className="text-slate-400">Student</span>
                <span className="text-white font-medium">
                  {studentName}
                </span>
              </div>

              <div className="flex justify-between text-xs gap-3">
                <span className="text-slate-400">Class</span>
                <span className="text-white font-medium">
                  {classLabel}
                </span>
              </div>

              <div className="flex justify-between text-xs gap-3">
                <span className="text-slate-400">Subject</span>
                <span className="text-white font-medium">
                  {classroom?.subject || "Live lesson"}
                </span>
              </div>
            </div>

            <button
              onClick={joinClassroom}
              disabled={joining}
              className="w-full mt-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              {joining ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
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
        <main className="flex-1 min-h-0 p-3 md:p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
          <section className="min-w-0 flex flex-col gap-4">
            <div className="relative flex-1 min-h-[300px] rounded-2xl border border-white/10 bg-[#071426] overflow-hidden">
              {mediaConnected ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full min-h-[300px] object-contain bg-black"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0c1d36] to-[#020617]">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                    <VideoOff
                      size={32}
                      className="text-blue-300"
                    />
                  </div>

                  <h3 className="mt-4 font-semibold text-sm">
                    Waiting for tutor video
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    The tutor's camera or presentation will appear here.
                  </p>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold">
                  TUTOR
                </span>

                {sharingScreen && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold">
                    SCREEN SHARING
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold drop-shadow">
                  {classroom?.tutor_name || "Tutor"}
                </span>

                <span className="text-[10px] text-slate-300">
                  {mediaConnected
                    ? "Media connected"
                    : "Waiting for media"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#071426] p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleStudentCamera}
                  className={`p-3 rounded-xl ${
                    cameraEnabled
                      ? "bg-white/10 text-white"
                      : "bg-red-600 text-white"
                  }`}
                  title="Toggle camera"
                >
                  {cameraEnabled ? (
                    <Camera size={18} />
                  ) : (
                    <CameraOff size={18} />
                  )}
                </button>

                <button
                  onClick={toggleStudentMicrophone}
                  className={`p-3 rounded-xl ${
                    microphoneEnabled
                      ? "bg-white/10 text-white"
                      : "bg-red-600 text-white"
                  }`}
                  title="Toggle microphone"
                >
                  {microphoneEnabled ? (
                    <Mic size={18} />
                  ) : (
                    <MicOff size={18} />
                  )}
                </button>

                <span className="text-[11px] text-slate-400 ml-1">
                  Your devices
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">
                  {participants.length} participant(s)
                </span>

                <button
                  onClick={leaveClassroom}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Leave class
                </button>
              </div>
            </div>

            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="hidden"
            />
          </section>

          <aside className="min-h-[400px] lg:min-h-0 rounded-2xl border border-white/10 bg-[#071426] flex flex-col overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/10">
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
                      const ownMessage =
                        sender === studentName ||
                        item.sender_type === "student" &&
                        (
                          String(item.student_id || "") ===
                          String(identity.studentId)
                        );

                      return (
                        <div
                          key={
                            item.id ||
                            item.message_id ||
                            `${index}-${item.created_at || ""}`
                          }
                          className={`flex flex-col ${
                            ownMessage ? "items-end" : "items-start"
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
                  className="p-3 border-t border-white/10 flex items-center gap-2"
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
                    disabled={!message.trim() || sendingMessage}
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

            {activeTab === "people" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  In this classroom
                </p>

                <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-200 text-xs font-bold">
                    T
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">
                      {classroom?.tutor_name || "Tutor"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Tutor
                    </p>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                {participants.map((person, index) => {
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
              </div>
            )}

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

                    return (
                      <div
                        key={resource.id || index}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                          {url ? (
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
                            className="text-[10px] text-blue-300 hover:text-blue-200 font-semibold"
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