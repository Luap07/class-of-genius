
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import http from "node:http";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "node:url";
import { Server as SocketIOServer } from "socket.io";

import pool from "./lib/db.js";

// ============================================================
// ROUTES
// ============================================================

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import courseCategoryRoutes from "./routes/courseCategoryRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import novelRoutes from "./routes/novelRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import learningMaterialsRouter from "./routes/learningMaterials.js";
import tutorAssignmentsRouter from "./routes/academyTutorAssignments.js";

// ============================================================
// ACADEMY ROUTES
// ============================================================

import academyTaskManagementRoutes from "./routes/academyTaskManagementRoutes.js";
import academyTaskSubmissionRoutes from "./routes/academyTaskSubmissionRoutes.js";
import academyRoutes from "./routes/academyRoutes.js";
import academyTeachingRoutes from "./routes/academyTeaching.js";
import academyAssignmentRoutes from "./routes/academyAssignmentRoutes.js";
import academyLessonRoutes from "./routes/academyLessonRoutes.js";
import academyLiveClassRoutes from "./routes/academyLiveClassRoutes.js";
import academyTutorAttendanceRoutes from "./routes/academyTutorAttendance.js";
import academyTutorMessages from "./routes/academyTutorMessages.js";
import academyTutorAnnouncements from "./routes/academyTutorAnnouncements.js";
import academyEnrollmentRoutes from "./routes/academyEnrollmentRoutes.js";
import academyStudentMaterialsRoutes from "./routes/academyStudentMaterials.js";
import cbtQuestionsRoutes from "./routes/cbtQuestionsRoutes.js";
import schoolExamsRoutes from "./routes/schoolExamsRoutes.js";
import academyCbtRoutes from "./routes/academyCbtRoutes.js";
import schoolStudentExamRoutes from "./routes/schoolStudentExamRoutes.js";
import academyTutorMaterialsRoutes from "./routes/academyTutorMaterials.js";
import academyLiveClassChatRoutes from "./routes/academyLiveClassChatRoutes.js";

// ============================================================
// PATHS AND ENVIRONMENT
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT_DIR, ".env");

const envResult = dotenv.config({
  path: ENV_PATH,
  override: false,
});

if (envResult.error) {
  console.warn("Could not load .env:", envResult.error.message);
  console.warn("Expected:", ENV_PATH);
} else {
  console.log(`Environment loaded from: ${ENV_PATH}`);
}

const app = express();
app.disable("x-powered-by");

const PORT = Number(process.env.PORT) || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL?.trim() ||
  "http://localhost:5173";

const DATABASE_URL = process.env.DATABASE_URL?.trim();

const JWT_SECRET =
  process.env.JWT_SECRET?.trim() ||
  process.env.ACADEMY_JWT_SECRET?.trim() ||
  process.env.AUTH_SECRET?.trim();

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY?.trim();

const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

const databaseConfigured = Boolean(DATABASE_URL);
const jwtConfigured = Boolean(JWT_SECRET);
const paystackConfigured = Boolean(PAYSTACK_SECRET_KEY);
const groqConfigured = Boolean(GROQ_API_KEY);

// ============================================================
// PAYMENT CONFIGURATION
// ============================================================

const PREMIUM_PRICE_NAIRA = 100;
const PREMIUM_PRICE_KOBO = PREMIUM_PRICE_NAIRA * 100;

const PREMIUM_PRODUCTS = {
  cbt: {
    name: "CBT Practice",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },
  novel: {
    name: "Premium Novels",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },
  multilingual: {
    name: "Multilingual Access",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },
  lms: {
    name: "LMS Premium Access",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },
  virtual_lab: {
    name: "Virtual Laboratory",
    priceNaira: PREMIUM_PRICE_NAIRA,
    priceKobo: PREMIUM_PRICE_KOBO,
  },
};

const paystackMode = PAYSTACK_SECRET_KEY?.startsWith("sk_live_")
  ? "live"
  : PAYSTACK_SECRET_KEY?.startsWith("sk_test_")
    ? "test"
    : "not-configured";

console.log("");
console.log("==================================================");
console.log("SCHOLIQEN ENVIRONMENT CHECK");
console.log("==================================================");
console.log(`Root .env:       ${ENV_PATH}`);
console.log(`PostgreSQL:      ${databaseConfigured ? "FOUND" : "MISSING"}`);
console.log(`JWT Secret:      ${jwtConfigured ? "FOUND" : "MISSING"}`);
console.log(`Paystack:        ${paystackConfigured ? "FOUND" : "MISSING"}`);
console.log(`Groq:            ${groqConfigured ? "FOUND" : "MISSING"}`);
console.log(`Test Price:      ₦${PREMIUM_PRICE_NAIRA}`);
console.log(`Paystack Amount: ${PREMIUM_PRICE_KOBO} kobo`);
console.log(`Paystack Mode:   ${paystackMode}`);
console.log("==================================================");

// ============================================================
// UPLOAD DIRECTORIES
// ============================================================

const UPLOADS_DIR = path.join(__dirname, "uploads");

const ACADEMY_ASSIGNMENTS_DIR = path.join(
  UPLOADS_DIR,
  "academy-assignments"
);

const NOVEL_COVERS_DIR = path.join(UPLOADS_DIR, "covers");
const DOCUMENTS_DIR = path.join(UPLOADS_DIR, "documents");
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, "thumbnails");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");

const TASK_SUBMISSIONS_DIR = path.join(
  UPLOADS_DIR,
  "task-submissions"
);

for (const directory of [
  UPLOADS_DIR,
  ACADEMY_ASSIGNMENTS_DIR,
  NOVEL_COVERS_DIR,
  DOCUMENTS_DIR,
  THUMBNAILS_DIR,
  VIDEOS_DIR,
  TASK_SUBMISSIONS_DIR,
]) {
  try {
    fs.mkdirSync(directory, { recursive: true });
  } catch (error) {
    console.error(
      `Unable to prepare upload directory: ${directory}`,
      error?.message
    );
  }
}

// ============================================================
// CORS
// ============================================================

const allowedOrigins = new Set([
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const corsOptions = {
  origin: (origin, callback) => {
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
    "x-paystack-signature",
    "x-tutor-reference",
    "x-tutor-ref",
    "x-academy-tutor-reference",
    "x-academy-token",
    "x-student-token",
    "x-material-access-token",
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// ============================================================
// HTTP SERVER
// ============================================================

const server = http.createServer(app);

// ============================================================
// SOCKET.IO
// ============================================================

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6,
});

// ============================================================
// LIVE CLASSROOM STATE
// ============================================================

const liveClassroomStates = new Map();

const createDefaultClassroomState = () => ({
  stage: "video",
  presentation: null,
  activeMaterial: null,
  updatedAt: new Date().toISOString(),
});

const getClassroomState = (classId) => {
  const key = String(classId);

  if (!liveClassroomStates.has(key)) {
    liveClassroomStates.set(
      key,
      createDefaultClassroomState()
    );
  }

  return liveClassroomStates.get(key);
};

const updateClassroomState = (classId, updates = {}) => {
  const current = getClassroomState(classId);

  const next = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  liveClassroomStates.set(String(classId), next);

  return next;
};

const sendClassroomState = (socket, classId) => {
  socket.emit("live:classroom-state", {
    classId: String(classId),
    ...getClassroomState(classId),
  });
};

// ============================================================
// LIVE CLASSROOM HELPERS
// ============================================================

const clean = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const getSocketToken = (socket) => {
  const authToken = clean(socket.handshake?.auth?.token);

  if (authToken) {
    return authToken.replace(/^Bearer\s+/i, "");
  }

  const authorization = clean(
    socket.handshake?.headers?.authorization
  );

  if (authorization) {
    return authorization.replace(/^Bearer\s+/i, "");
  }

  return "";
};

const getTokenRole = (payload) => {
  const role = clean(
    payload?.userType ||
    payload?.user_type ||
    payload?.type ||
    payload?.role
  ).toLowerCase();

  if (["tutor", "academy_tutor"].includes(role)) {
    return "tutor";
  }

  if (
    ["student", "academy_student", "academystudent"].includes(role)
  ) {
    return "student";
  }

  return "";
};

const getTutorReference = (payload) => {
  return clean(
    payload?.tutorReference ||
    payload?.tutor_reference ||
    payload?.reference
  );
};

const getEnrollmentReference = (payload) => {
  return clean(
    payload?.enrollmentId ||
    payload?.enrollment_id ||
    payload?.studentEnrollmentId ||
    payload?.student_enrollment_id ||
    payload?.enrollmentReference ||
    payload?.enrollment_reference
  );
};

const getLiveRoomName = (classId) => {
  return `scholiqen-live-${String(classId)}`;
};

const getSocketError = (message, code = "LIVE_CLASS_ERROR") => ({
  success: false,
  code,
  message,
});

const getWebRTCTargetId = (payload = {}) => {
  return clean(
    payload.targetSocketId ||
    payload.target_socket_id ||
    payload.to ||
    payload.socketId ||
    payload.socket_id
  );
};

const validateSocketPayload = (value, maxBytes = 30000) => {
  try {
    return (
      Buffer.byteLength(
        JSON.stringify(value ?? null),
        "utf8"
      ) <= maxBytes
    );
  } catch {
    return false;
  }
};

// ============================================================
// SOCKET AUTHENTICATION
// ============================================================

io.use((socket, next) => {
  try {
    if (!JWT_SECRET) {
      return next(
        new Error("Server JWT authentication is not configured.")
      );
    }

    const token = getSocketToken(socket);

    if (!token) {
      return next(new Error("Authentication token is required."));
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const role = getTokenRole(payload);

    if (!role) {
      return next(new Error("Invalid classroom account role."));
    }

    if (role === "tutor") {
      const tutorReference = getTutorReference(payload);

      if (!tutorReference) {
        return next(new Error("Tutor reference is missing."));
      }

      socket.data.identity = {
        role: "tutor",
        tutorReference,
        tokenPayload: payload,
      };
    }

    if (role === "student") {
      const enrollmentId = getEnrollmentReference(payload);

      if (!enrollmentId) {
        return next(
          new Error(
            "Student enrollment reference is missing from the login token."
          )
        );
      }

      socket.data.identity = {
        role: "student",
        enrollmentId,
        tokenPayload: payload,
      };
    }

    return next();
  } catch (error) {
    console.error("LIVE SOCKET AUTH ERROR:", error?.message);

    return next(
      new Error("Invalid or expired classroom authentication token.")
    );
  }
});

// ============================================================
// VERIFY CLASSROOM ACCESS
// ============================================================

const authorizeLiveClass = async (socket, classId) => {
  const identity = socket.data.identity;

  if (!identity) {
    throw new Error("Socket identity is missing.");
  }

  if (!classId || !/^\d+$/.test(String(classId))) {
    throw new Error("A valid live classroom ID is required.");
  }

  const classroomResult = await pool.query(
    `
      SELECT
        id,
        tutor_reference,
        status,
        title,
        room_id,
        room_code
      FROM academy_live_classes
      WHERE id = $1
      LIMIT 1
    `,
    [classId]
  );

  if (!classroomResult.rows.length) {
    throw new Error("Live classroom was not found.");
  }

  const classroom = classroomResult.rows[0];
  const status = clean(classroom.status).toLowerCase();

  if (
    ["ended", "completed", "cancelled", "canceled"].includes(status)
  ) {
    throw new Error("This live classroom has already ended.");
  }

  if (identity.role === "tutor") {
    const tutorResult = await pool.query(
      `
        SELECT
          tutor_reference,
          application_status
        FROM academy_tutor_applications
        WHERE tutor_reference = $1
        LIMIT 1
      `,
      [identity.tutorReference]
    );

    if (!tutorResult.rows.length) {
      throw new Error("Verified tutor account was not found.");
    }

    const tutorStatus = clean(
      tutorResult.rows[0].application_status
    ).toLowerCase();

    if (tutorStatus !== "verified") {
      throw new Error("Only verified tutors can host live classes.");
    }

    if (
      clean(classroom.tutor_reference) !==
      identity.tutorReference
    ) {
      throw new Error(
        "You are not authorized to host this classroom."
      );
    }
  }

  if (identity.role === "student") {
    const participantResult = await pool.query(
      `
        SELECT
          id,
          enrollment_id,
          student_name,
          role,
          is_present,
          left_at
        FROM academy_live_participants
        WHERE live_class_id = $1
          AND enrollment_id = $2
          AND is_present = TRUE
          AND left_at IS NULL
        ORDER BY id DESC
        LIMIT 1
      `,
      [classId, identity.enrollmentId]
    );

    if (!participantResult.rows.length) {
      throw new Error(
        "You have not joined this classroom as an authorized participant."
      );
    }

    socket.data.participant = participantResult.rows[0];
  }

  return classroom;
};

// ============================================================
// SOCKET TARGET VALIDATION
// ============================================================

const getAuthorizedTarget = async (socket, targetSocketId) => {
  const targetId = clean(targetSocketId);

  if (!targetId) {
    throw new Error("Target socket ID is required.");
  }

  const targetSocket = io.sockets.sockets.get(targetId);

  if (!targetSocket) {
    throw new Error("The other classroom participant is offline.");
  }

  const sender = socket.data.liveClass;
  const target = targetSocket.data.liveClass;

  if (!sender || !target) {
    throw new Error("Both participants must join the classroom first.");
  }

  if (String(sender.classId) !== String(target.classId)) {
    throw new Error("Participants are not in the same classroom.");
  }

  if (sender.role === target.role) {
    throw new Error("Invalid signaling destination.");
  }

  return targetSocket;
};

// ============================================================
// SOCKET CONNECTION
// ============================================================

io.on("connection", (socket) => {
  console.log("Live socket authenticated:", socket.id);

  socket.emit("socket:connected", {
    success: true,
    socketId: socket.id,
    role: socket.data.identity?.role,
    message: "Authenticated live connection established.",
  });

  // JOIN CLASSROOM

  socket.on("live:join", async (payload = {}, callback) => {
    try {
      const classId = clean(
        payload.classId ||
        payload.liveClassId ||
        payload.live_class_id
      );

      const classroom = await authorizeLiveClass(
        socket,
        classId
      );

      const room = getLiveRoomName(classId);

      if (socket.data.liveClass?.room) {
        socket.leave(socket.data.liveClass.room);
      }

      socket.join(room);

      socket.data.liveClass = {
        classId: String(classId),
        room,
        role: socket.data.identity.role,
        tutorReference:
          socket.data.identity.tutorReference || "",
        enrollmentId:
          socket.data.identity.enrollmentId || "",
        joinedAt: new Date().toISOString(),
      };

      const response = {
        success: true,
        socketId: socket.id,
        classId: String(classId),
        room,
        role: socket.data.identity.role,
        classroomTitle: classroom.title || "",
        message: "You have joined the live classroom.",
      };

      socket.emit("live:joined", response);

      if (typeof callback === "function") {
        callback(response);
      }

      sendClassroomState(socket, classId);

      socket.to(room).emit("live:peer-joined", {
        socketId: socket.id,
        role: socket.data.identity.role,
        classId: String(classId),
      });

      if (socket.data.identity.role === "tutor") {
        socket.to(room).emit("live:tutor-available", {
          tutorSocketId: socket.id,
          classId: String(classId),
        });
      }

      if (socket.data.identity.role === "student") {
        socket.to(room).emit("live:student-ready", {
          studentSocketId: socket.id,
          classId: String(classId),
        });

        const tutorSocket = [
          ...io.sockets.sockets.values(),
        ].find((connectedSocket) => {
          const connectedClass = connectedSocket.data.liveClass;

          return (
            connectedClass &&
            connectedClass.role === "tutor" &&
            String(connectedClass.classId) === String(classId)
          );
        });

        if (tutorSocket?.data?.mediaState) {
          socket.emit("live:media-state", {
            socketId: tutorSocket.id,
            role: "tutor",
            classId: String(classId),
            ...tutorSocket.data.mediaState,
          });
        }
      }

      console.log(
        `LIVE JOIN: ${socket.data.identity.role} ${socket.id} -> class ${classId}`
      );
    } catch (error) {
      console.error("LIVE JOIN ERROR:", error?.message);

      const response = getSocketError(
        error?.message || "Unable to join live classroom.",
        "LIVE_JOIN_FAILED"
      );

      socket.emit("live:error", response);

      if (typeof callback === "function") {
        callback(response);
      }
    }
  });

  // STUDENT READY

  socket.on("live:ready", () => {
    const liveClass = socket.data.liveClass;

    if (!liveClass || liveClass.role !== "student") {
      return;
    }

    socket.to(liveClass.room).emit("live:student-ready", {
      studentSocketId: socket.id,
      classId: liveClass.classId,
    });
  });

  // TUTOR CHANGES CLASSROOM STAGE

  socket.on("live:stage-update", (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass || liveClass.role !== "tutor") {
        throw new Error("Only the tutor can change the classroom stage.");
      }

      const allowedStages = [
        "video",
        "whiteboard",
        "presentation",
        "material",
      ];

      const stage = clean(payload.stage).toLowerCase();

      if (!allowedStages.includes(stage)) {
        throw new Error("Invalid classroom stage.");
      }

      const state = updateClassroomState(
        liveClass.classId,
        { stage }
      );

      socket.to(liveClass.room).emit("live:stage-update", {
        classId: liveClass.classId,
        stage,
        updatedAt: state.updatedAt,
      });

      if (typeof callback === "function") {
        callback({ success: true, stage });
      }
    } catch (error) {
      console.error("LIVE STAGE ERROR:", error.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "STAGE_UPDATE_FAILED")
        );
      }
    }
  });

  // PRESENTATION UPDATES

  socket.on(
    "live:presentation-update",
    (payload = {}, callback) => {
      try {
        const liveClass = socket.data.liveClass;

        if (!liveClass || liveClass.role !== "tutor") {
          throw new Error(
            "Only the tutor can update the presentation."
          );
        }

        const presentation =
          payload.presentation ?? payload.data ?? null;

        if (!validateSocketPayload(presentation, 100000)) {
          throw new Error("Presentation update is too large.");
        }

        const state = updateClassroomState(
          liveClass.classId,
          {
            presentation,
            stage: presentation ? "presentation" : "video",
          }
        );

        const update = {
          classId: liveClass.classId,
          presentation: state.presentation,
          stage: state.stage,
          updatedAt: state.updatedAt,
        };

        socket.to(liveClass.room).emit(
          "live:presentation-update",
          update
        );

        socket.to(liveClass.room).emit("live:stage-update", {
          classId: liveClass.classId,
          stage: state.stage,
          updatedAt: state.updatedAt,
        });

        if (typeof callback === "function") {
          callback({ success: true });
        }
      } catch (error) {
        console.error(
          "LIVE PRESENTATION ERROR:",
          error.message
        );

        if (typeof callback === "function") {
          callback(
            getSocketError(
              error.message,
              "PRESENTATION_UPDATE_FAILED"
            )
          );
        }
      }
    }
  );

  // TUTOR OPENS A LEARNING MATERIAL

  socket.on("live:material-update", (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass || liveClass.role !== "tutor") {
        throw new Error(
          "Only the tutor can open classroom materials."
        );
      }

      const material =
        payload.material ?? payload.activeMaterial ?? null;

      if (!validateSocketPayload(material, 100000)) {
        throw new Error("Material information is too large.");
      }

      const state = updateClassroomState(
        liveClass.classId,
        {
          activeMaterial: material,
          stage: material ? "material" : "video",
        }
      );

      socket.to(liveClass.room).emit("live:material-update", {
        classId: liveClass.classId,
        material: state.activeMaterial,
        stage: state.stage,
        updatedAt: state.updatedAt,
      });

      socket.to(liveClass.room).emit("live:stage-update", {
        classId: liveClass.classId,
        stage: state.stage,
        updatedAt: state.updatedAt,
      });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      console.error("LIVE MATERIAL ERROR:", error.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "MATERIAL_UPDATE_FAILED")
        );
      }
    }
  });

  // WHITEBOARD DRAWING EVENTS

  socket.on("live:whiteboard-draw", (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass || liveClass.role !== "tutor") {
        throw new Error(
          "Only the tutor can draw on the whiteboard."
        );
      }

      const drawing = payload.drawing ?? payload;

      if (!validateSocketPayload(drawing, 30000)) {
        throw new Error("Whiteboard drawing data is too large.");
      }

      const state = updateClassroomState(
        liveClass.classId,
        { stage: "whiteboard" }
      );

      socket.to(liveClass.room).emit("live:whiteboard-draw", {
        classId: liveClass.classId,
        drawing,
        updatedAt: state.updatedAt,
      });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      console.error("WHITEBOARD DRAW ERROR:", error.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "WHITEBOARD_DRAW_FAILED")
        );
      }
    }
  });

  // WHITEBOARD UPDATE EVENTS

  socket.on("live:whiteboard-update", (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass || liveClass.role !== "tutor") {
        throw new Error(
          "Only the tutor can update the whiteboard."
        );
      }

      const drawing = payload.drawing ?? payload.data ?? null;

      if (!validateSocketPayload(drawing, 30000)) {
        throw new Error(
          "Whiteboard update is too large for live broadcasting."
        );
      }

      const state = updateClassroomState(
        liveClass.classId,
        { stage: "whiteboard" }
      );

      socket.to(liveClass.room).emit("live:whiteboard-update", {
        classId: liveClass.classId,
        drawing,
        updatedAt: state.updatedAt,
      });

      socket.to(liveClass.room).emit("live:stage-update", {
        classId: liveClass.classId,
        stage: "whiteboard",
        updatedAt: state.updatedAt,
      });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      console.error("WHITEBOARD UPDATE ERROR:", error.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "WHITEBOARD_UPDATE_FAILED")
        );
      }
    }
  });

  // STUDENT QUESTIONS

  socket.on("live:student-question", (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass || liveClass.role !== "student") {
        throw new Error(
          "Only students can send classroom questions."
        );
      }

      const message = clean(payload.message);

      if (!message) {
        throw new Error("Please enter your question.");
      }

      if (message.length > 5000) {
        throw new Error("Your question is too long.");
      }

      const question = {
        id: `${socket.id}-${Date.now()}`,
        classId: liveClass.classId,
        senderId: liveClass.enrollmentId,
        senderName: clean(
          payload.senderName ||
          socket.data.participant?.student_name ||
          "Student"
        ),
        senderRole: "student",
        message,
        createdAt: new Date().toISOString(),
      };

      socket.to(liveClass.room).emit(
        "live:student-question",
        question
      );

      if (typeof callback === "function") {
        callback({
          success: true,
          question,
        });
      }
    } catch (error) {
      console.error("STUDENT QUESTION ERROR:", error.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "STUDENT_QUESTION_FAILED")
        );
      }
    }
  });

  // TUTOR RESPONDS TO A STUDENT QUESTION

  socket.on(
    "live:tutor-question-response",
    (payload = {}, callback) => {
      try {
        const liveClass = socket.data.liveClass;

        if (!liveClass || liveClass.role !== "tutor") {
          throw new Error(
            "Only the tutor can respond to classroom questions."
          );
        }

        const message = clean(payload.message);

        if (!message) {
          throw new Error("Response cannot be empty.");
        }

        if (message.length > 5000) {
          throw new Error("Your response is too long.");
        }

        const response = {
          id: `${socket.id}-${Date.now()}`,
          classId: liveClass.classId,
          senderId: liveClass.tutorReference,
          senderName: clean(payload.senderName || "Tutor"),
          senderRole: "tutor",
          message,
          replyTo: clean(payload.questionId),
          createdAt: new Date().toISOString(),
        };

        socket.to(liveClass.room).emit(
          "live:tutor-question-response",
          response
        );

        if (typeof callback === "function") {
          callback({
            success: true,
            response,
          });
        }
      } catch (error) {
        console.error("TUTOR QUESTION RESPONSE ERROR:", error.message);

        if (typeof callback === "function") {
          callback(
            getSocketError(error.message, "TUTOR_RESPONSE_FAILED")
          );
        }
      }
    }
  );

  // WEBRTC OFFER: TUTOR -> STUDENT

  socket.on("webrtc:offer", async (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass || liveClass.role !== "tutor") {
        throw new Error("Only the classroom tutor can send offers.");
      }

      if (!payload.offer) {
        throw new Error("WebRTC offer data is missing.");
      }

      const target = await getAuthorizedTarget(
        socket,
        getWebRTCTargetId(payload)
      );

      if (target.data.liveClass.role !== "student") {
        throw new Error("WebRTC offer must be sent to a student.");
      }

      target.emit("webrtc:offer", {
        offer: payload.offer,
        fromSocketId: socket.id,
        classId: liveClass.classId,
      });

      if (typeof callback === "function") {
        callback({
          success: true,
          targetSocketId: target.id,
        });
      }
    } catch (error) {
      console.error("WEBRTC OFFER ERROR:", error?.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "WEBRTC_OFFER_FAILED")
        );
      }
    }
  });

  // WEBRTC ANSWER: STUDENT -> TUTOR

  socket.on("webrtc:answer", async (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass || liveClass.role !== "student") {
        throw new Error("Only students can answer classroom offers.");
      }

      if (!payload.answer) {
        throw new Error("WebRTC answer data is missing.");
      }

      const target = await getAuthorizedTarget(
        socket,
        getWebRTCTargetId(payload)
      );

      if (target.data.liveClass.role !== "tutor") {
        throw new Error("WebRTC answer must be sent to the tutor.");
      }

      target.emit("webrtc:answer", {
        answer: payload.answer,
        fromSocketId: socket.id,
        classId: liveClass.classId,
      });

      if (typeof callback === "function") {
        callback({
          success: true,
          targetSocketId: target.id,
        });
      }
    } catch (error) {
      console.error("WEBRTC ANSWER ERROR:", error?.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "WEBRTC_ANSWER_FAILED")
        );
      }
    }
  });

  // ICE CANDIDATE RELAY

  socket.on(
    "webrtc:ice-candidate",
    async (payload = {}, callback) => {
      try {
        const liveClass = socket.data.liveClass;

        if (!liveClass) {
          throw new Error(
            "Join the classroom before sending ICE candidates."
          );
        }

        if (!payload.candidate) {
          throw new Error("ICE candidate data is missing.");
        }

        const target = await getAuthorizedTarget(
          socket,
          getWebRTCTargetId(payload)
        );

        target.emit("webrtc:ice-candidate", {
          candidate: payload.candidate,
          fromSocketId: socket.id,
          classId: liveClass.classId,
        });

        if (typeof callback === "function") {
          callback({
            success: true,
            targetSocketId: target.id,
          });
        }
      } catch (error) {
        console.error("ICE CANDIDATE ERROR:", error?.message);

        if (typeof callback === "function") {
          callback(
            getSocketError(error.message, "ICE_CANDIDATE_FAILED")
          );
        }
      }
    }
  );

  // MEDIA STATE

  socket.on("live:media-state", (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass) {
        throw new Error(
          "Join the classroom before publishing media state."
        );
      }

      const media = payload.mediaState || payload;

      const mediaState = {
        cameraEnabled: Boolean(media.cameraEnabled),
        microphoneEnabled: Boolean(media.microphoneEnabled),
        screenSharing: Boolean(media.screenSharing),
      };

      socket.data.mediaState = mediaState;

      socket.to(liveClass.room).emit("live:media-state", {
        socketId: socket.id,
        role: liveClass.role,
        classId: liveClass.classId,
        ...mediaState,
      });

      if (typeof callback === "function") {
        callback({
          success: true,
          mediaState,
        });
      }
    } catch (error) {
      console.error("LIVE MEDIA STATE ERROR:", error.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "MEDIA_STATE_FAILED")
        );
      }
    }
  });

  // END CLASSROOM

  socket.on("live:end", (payload = {}, callback) => {
    try {
      const liveClass = socket.data.liveClass;

      if (!liveClass || liveClass.role !== "tutor") {
        throw new Error("Only the tutor can end the classroom.");
      }

      io.to(liveClass.room).emit("live:ended", {
        classId: liveClass.classId,
        message: "The tutor has ended this live class.",
      });

      liveClassroomStates.delete(String(liveClass.classId));

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      console.error("LIVE END ERROR:", error.message);

      if (typeof callback === "function") {
        callback(
          getSocketError(error.message, "LIVE_END_FAILED")
        );
      }
    }
  });

  // LEAVE CLASSROOM

  socket.on("live:leave", () => {
    const liveClass = socket.data.liveClass;

    if (!liveClass) return;

    socket.to(liveClass.room).emit("live:peer-left", {
      socketId: socket.id,
      role: liveClass.role,
      classId: liveClass.classId,
    });

    socket.leave(liveClass.room);

    socket.data.liveClass = null;
    socket.data.mediaState = null;
    socket.data.participant = null;

    console.log("LIVE LEAVE:", {
      socketId: socket.id,
      role: liveClass.role,
      classId: liveClass.classId,
    });
  });

  // DISCONNECT

  socket.on("disconnect", (reason) => {
    const liveClass = socket.data.liveClass;

    if (liveClass) {
      socket.to(liveClass.room).emit("live:peer-left", {
        socketId: socket.id,
        role: liveClass.role,
        classId: liveClass.classId,
      });
    }

    console.log(
      "Live socket disconnected:",
      socket.id,
      reason
    );
  });
});

// ============================================================
// BODY PARSERS
// ============================================================

// Paystack webhook must receive the raw request body.
app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
    limit: "2mb",
  })
);

// Increased from 2mb to 25mb for Base64 whiteboard PNG images.
app.use(
  express.json({
    limit: "25mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb",
  })
);

// ============================================================
// REQUEST LOGGER
// ============================================================

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================================
// ACADEMY CBT ROUTES
// ============================================================

app.use("/api/academy", academyCbtRoutes);

app.use(
  "/api/school-student-exams",
  schoolStudentExamRoutes
);

app.use(
  "/api/admin/school-exams",
  schoolExamsRoutes
);

// ============================================================
// STATIC UPLOADS
// ============================================================

app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    fallthrough: true,
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", FRONTEND_URL);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

      res.setHeader(
        "Access-Control-Allow-Headers",
        [
          "Origin",
          "Content-Type",
          "Authorization",
          "Accept",
          "X-Requested-With",
          "x-academy-token",
          "x-student-token",
          "x-material-access-token",
          "x-tutor-reference",
          "x-tutor-ref",
        ].join(", ")
      );

      res.setHeader("Cache-Control", "public, max-age=3600");

      const lowerPath = String(filePath || "").toLowerCase();

      const mimeTypes = {
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };

      const extension = path.extname(lowerPath);

      if (mimeTypes[extension]) {
        res.setHeader("Content-Type", mimeTypes[extension]);
      }

      if ([".pdf", ".mp4", ".webm", ".mov"].includes(extension)) {
        res.setHeader("Content-Disposition", "inline");
      }

      if ([".pdf", ".doc", ".docx"].includes(extension)) {
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
    },
  })
);

// ============================================================
// MATERIAL ROUTES
// ============================================================

app.use(
  "/api/academy/tutor/assignments",
  tutorAssignmentsRouter
);

app.use(
  "/api/admin/lms/materials",
  learningMaterialsRouter
);

app.use(
  "/api/academy/student/materials",
  academyStudentMaterialsRoutes
);

app.use(
  "/api/academy/tutor/materials",
  academyTutorMaterialsRoutes
);

app.use(
  "/api/admin/cbt/questions",
  cbtQuestionsRoutes
);

// ============================================================
// ACADEMY ENROLLMENT
// ============================================================

app.use("/api/academy", academyEnrollmentRoutes);

// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Scholiqen Backend is running.",
    server: "online",
    environment: process.env.NODE_ENV || "development",
    frontend: FRONTEND_URL,

    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      courses: "/api/courses",
      courseCategories: "/api/course-categories",
      documents: "/api/documents",
      resources: "/api/resources",
      tasks: "/api/tasks",
      novels: "/api/novels",
      tutor: "/api/tutor",
      payments: "/api/payments",
      academy: "/api/academy",
      health: "/api/health",
      liveConnection: "Socket.IO",
      liveJoinEvent: "live:join",
      liveOfferEvent: "webrtc:offer",
      liveAnswerEvent: "webrtc:answer",
      liveIceEvent: "webrtc:ice-candidate",
      liveMediaStateEvent: "live:media-state",
      liveStageEvent: "live:stage-update",
      livePresentationEvent: "live:presentation-update",
      liveMaterialEvent: "live:material-update",
      liveWhiteboardEvent: "live:whiteboard-draw",
      liveQuestionEvent: "live:student-question",
      liveTutorResponseEvent: "live:tutor-question-response",
    },

    database: {
      provider: "PostgreSQL / Neon",
      configured: databaseConfigured,
    },

    authentication: {
      provider: "JWT",
      configured: databaseConfigured && jwtConfigured,
    },

    payment: {
      testPriceNaira: PREMIUM_PRICE_NAIRA,
      testPriceKobo: PREMIUM_PRICE_KOBO,
      currency: "NGN",
      mode: paystackMode,
      products: Object.keys(PREMIUM_PRODUCTS),
    },

    services: {
      authentication: databaseConfigured && jwtConfigured,
      database: databaseConfigured,
      novels: true,
      resources: true,
      tasks: true,
      admin: databaseConfigured && jwtConfigured,
      paystack: paystackConfigured,
      groq: groqConfigured,
      academy: databaseConfigured,
      academyTeaching: databaseConfigured,
      academyTaskManagement: databaseConfigured,
      academyTaskSubmissions: databaseConfigured,
      academyTutorAttendance: databaseConfigured,
      academyTutorMessages: databaseConfigured,
      academyTutorAnnouncements: databaseConfigured,
      studentMaterials: databaseConfigured,
      tutorMaterials: databaseConfigured && jwtConfigured,
      studentAssignments: databaseConfigured,
      adminMaterials: databaseConfigured && jwtConfigured,
      academyCBT: databaseConfigured && jwtConfigured,
      socketIO: true,
      webRTCSignaling: true,
    },
  });
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", async (req, res) => {
  let databaseStatus = databaseConfigured;

  let databaseMessage = databaseConfigured
    ? "configured"
    : "missing";

  if (databaseConfigured) {
    try {
      await pool.query("SELECT 1");
      databaseStatus = true;
      databaseMessage = "connected";
    } catch (error) {
      databaseStatus = false;
      databaseMessage = "connection failed";

      console.error(
        "PostgreSQL health check failed:",
        error?.message
      );
    }
  }

  res.status(200).json({
    success: true,
    server: "online",
    service: "Scholiqen Backend",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
    frontend: FRONTEND_URL,
    authentication: databaseConfigured && jwtConfigured,

    database: {
      provider: "PostgreSQL / Neon",
      configured: databaseConfigured,
      connected: databaseStatus,
      status: databaseMessage,
    },

    databaseConfigured,
    jwtConfigured,
    groqConfigured,
    paystackConfigured,
    paystackMode,

    academyCBTConfigured: databaseConfigured && jwtConfigured,

    liveClassroom: {
      socketIO: true,
      authentication: jwtConfigured,
      signalingHandlers: true,
      mediaStateRelay: true,
      classroomStateRelay: true,
      stageBroadcast: true,
      presentationBroadcast: true,
      materialBroadcast: true,
      whiteboardBroadcast: true,
      studentQuestions: true,
      tutorResponses: true,
      transport: "WebRTC + Socket.IO",
    },

    payment: {
      currency: "NGN",
      testPriceNaira: PREMIUM_PRICE_NAIRA,
      testPriceKobo: PREMIUM_PRICE_KOBO,
      products: Object.keys(PREMIUM_PRODUCTS),
    },

    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// CBT QUESTIONS
// ============================================================

app.get("/api/cbt/questions", async (req, res) => {
  try {
    const exam = String(req.query.exam || "").trim();

    const subjectsParam = String(
      req.query.subjects || ""
    ).trim();

    if (!exam) {
      return res.status(400).json({
        success: false,
        questions: [],
        count: 0,
        total: 0,
        error: "Exam is required.",
      });
    }

    const subjects = subjectsParam
      ? subjectsParam
          .split(",")
          .map((subject) => subject.trim())
          .filter(Boolean)
      : [];

    let query = `
      SELECT
        id,
        exam,
        subject,
        question,
        options,
        answer,
        image,
        created_at,
        reason,
        question_type,
        passage_id,
        passage_title,
        passage,
        passage_order,
        "optionA",
        "optionB",
        "optionC",
        "optionD",
        active,
        source_question_id,
        generated_for,
        is_rephrased
      FROM cbt_questions
      WHERE LOWER(TRIM(exam)) = LOWER(TRIM($1))
    `;

    const values = [exam];

    if (subjects.length > 0) {
      const placeholders = subjects.map(
        (_, index) => `$${index + 2}`
      );

      query += `
        AND LOWER(TRIM(subject))
        IN (
          ${placeholders
            .map((placeholder) => `LOWER(TRIM(${placeholder}))`)
            .join(", ")}
        )
      `;

      values.push(...subjects);
    }

    query += `
      ORDER BY subject ASC, created_at DESC
    `;

    const result = await pool.query(query, values);

    const subjectCounts = {};

    result.rows.forEach((row) => {
      const subject = row.subject || "Unknown";

      subjectCounts[subject] =
        (subjectCounts[subject] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      questions: result.rows,
      count: result.rows.length,
      total: result.rows.length,
      subjectCounts,
    });
  } catch (error) {
    console.error("CBT QUESTIONS API ERROR:", error);

    return res.status(500).json({
      success: false,
      questions: [],
      count: 0,
      total: 0,
      error: "Unable to fetch CBT questions.",
      details:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
    });
  }
});

// ============================================================
// CBT QUESTION COUNT
// ============================================================

app.get("/api/cbt/questions/count", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*)::integer AS count
      FROM cbt_questions
    `);

    const count = Number(result.rows[0]?.count || 0);

    return res.status(200).json({
      success: true,
      count,
      total: count,
      questionCount: count,
    });
  } catch (error) {
    console.error("CBT QUESTION COUNT ERROR:", error);

    return res.status(500).json({
      success: false,
      count: 0,
      total: 0,
      questionCount: 0,
      error: "Unable to fetch CBT question count.",
      details:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
    });
  }
});

// ============================================================
// EXISTING API ROUTES
// ============================================================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/course-categories", courseCategoryRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/novels", novelRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/payments", paymentRoutes);

// ============================================================
// ACADEMY ROUTES
// ============================================================

app.use("/api/academy", academyTaskSubmissionRoutes);
app.use("/api/academy", academyTaskManagementRoutes);
app.use("/api/academy", academyRoutes);
app.use("/api/academy", academyAssignmentRoutes);
app.use("/api/academy", academyLessonRoutes);
app.use("/api/academy", academyTeachingRoutes);
app.use("/api/academy", academyLiveClassRoutes);

app.use(
  "/api/academy/tutor",
  academyTutorAttendanceRoutes
);

app.use(
  "/api/academy/tutor",
  academyTutorMessages
);

app.use(
  "/api/academy/tutor",
  academyTutorAnnouncements
);

app.use(
  "/api/academy/tutor",
  academyLiveClassChatRoutes
);

// ============================================================
// LEGACY ASSIGNMENT FILE URL COMPATIBILITY
// ============================================================

app.get("/:filename", (req, res, next) => {
  try {
    const filename = String(req.params.filename || "");

    if (
      !filename ||
      filename !== path.basename(filename) ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return next();
    }

    const extension = path.extname(filename).toLowerCase();

    const mimeTypes = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".txt": "text/plain; charset=utf-8",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".avif": "image/avif",
      ".zip": "application/zip",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
    };

    if (!Object.prototype.hasOwnProperty.call(mimeTypes, extension)) {
      return next();
    }

    const assignmentRoot = path.resolve(ACADEMY_ASSIGNMENTS_DIR);
    const filePath = path.resolve(assignmentRoot, filename);

    if (!filePath.startsWith(`${assignmentRoot}${path.sep}`)) {
      return next();
    }

    if (!fs.existsSync(filePath)) {
      return next();
    }

    const fileStats = fs.statSync(filePath);

    if (!fileStats.isFile()) {
      return next();
    }

    res.setHeader("Content-Type", mimeTypes[extension]);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, max-age=3600");

    const previewExtensions = new Set([
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".avif",
      ".mp4",
      ".webm",
      ".mov",
      ".txt",
    ]);

    if (previewExtensions.has(extension)) {
      res.setHeader("Content-Disposition", "inline");
    } else {
      const safeFilename = filename.replace(/["\\\r\n]/g, "_");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFilename}"`
      );
    }

    return res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) {
        if (error.statusCode === 404) {
          return next();
        }

        console.error("Legacy assignment file delivery failed:", {
          filename,
          message: error.message,
        });

        return res.status(error.statusCode || 500).json({
          success: false,
          error: "Unable to open assignment file.",
        });
      }
    });
  } catch (error) {
    console.error(
      "Legacy assignment file route error:",
      error?.message
    );

    return next(error);
  }
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  console.warn(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  return res.status(404).json({
    success: false,
    error: "Route not found.",
    path: req.originalUrl,
    method: req.method,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {
  console.error("");
  console.error("==================================================");
  console.error("SCHOLIQEN SERVER ERROR");
  console.error("==================================================");
  console.error("Method:", req.method);
  console.error("URL:", req.originalUrl);
  console.error("Message:", error?.message);
  console.error("Stack:", error?.stack);
  console.error("==================================================");

  if (res.headersSent) {
    return next(error);
  }

  return res.status(error?.status || 500).json({
    success: false,
    error: error?.message || "Internal server error.",
  });
});

// ============================================================
// START SERVER
// ============================================================

server.listen(PORT, () => {
  console.log("");
  console.log("==================================================");
  console.log("SCHOLIQEN BACKEND SERVER");
  console.log("==================================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Uploads: ${UPLOADS_DIR}`);
  console.log(`Assignment uploads: ${ACADEMY_ASSIGNMENTS_DIR}`);
  console.log(`Task submission uploads: ${TASK_SUBMISSIONS_DIR}`);

  console.log(
    `Database: ${databaseConfigured ? "Configured" : "Not configured"}`
  );

  console.log(
    `JWT: ${jwtConfigured ? "Configured" : "Missing"}`
  );

  console.log(
    `Groq: ${groqConfigured ? "Configured" : "Missing"}`
  );

  console.log(
    `Paystack: ${paystackConfigured ? "Configured" : "Not configured"}`
  );

  console.log("");
  console.log("LIVE CLASSROOM:");
  console.log("   Socket.IO: ENABLED");
  console.log("   JWT authentication: ENABLED");
  console.log("   Classroom authorization: ENABLED");
  console.log("   WebRTC signaling: ENABLED");
  console.log("   Offer / Answer / ICE relay: ENABLED");
  console.log("   Classroom state sync: ENABLED");
  console.log("   Stage broadcasting: ENABLED");
  console.log("   Presentation broadcasting: ENABLED");
  console.log("   Material broadcasting: ENABLED");
  console.log("   Whiteboard event broadcasting: ENABLED");
  console.log("   Student questions: ENABLED");
  console.log("   Tutor responses: ENABLED");

  console.log("");
  console.log("HEALTH:");
  console.log("   GET /api/health");

  console.log("");
  console.log("==================================================");
  console.log("SCHOLIQEN SERVER READY");
  console.log("==================================================");
});

// ============================================================
// SERVER ERROR
// ============================================================

server.on("error", (error) => {
  console.error("SERVER STARTUP ERROR:", error);

  if (error?.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
  }
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  io.disconnectSockets(true);

  server.close(async () => {
    try {
      await pool.end();
      console.log("Database connection pool closed.");
    } catch (error) {
      console.error(
        "Error closing database pool:",
        error?.message
      );
    }

    console.log("Server shutdown complete.");
    process.exit(0);
  });

  io.close();

  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ============================================================
// EXPORTS
// ============================================================

export { app, server, io };
