
import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* ============================================================
   LIVE CLASS CHAT TABLE
============================================================ */

let tableReady = false;
let tablePromise = null;

const ensureChatTable = async () => {
  if (tableReady) return;

  if (!tablePromise) {
    tablePromise = pool.query(`
      CREATE TABLE IF NOT EXISTS academy_live_class_chat_messages (
        id BIGSERIAL PRIMARY KEY,
        live_class_id BIGINT NOT NULL,
        tutor_reference TEXT NOT NULL,
        sender_role VARCHAR(20) NOT NULL,
        sender_reference TEXT NOT NULL,
        sender_name TEXT DEFAULT 'User',
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS
        idx_academy_live_chat_class
      ON academy_live_class_chat_messages
        (live_class_id, created_at);
    `);
  }

  try {
    await tablePromise;
    tableReady = true;
  } catch (error) {
    tablePromise = null;
    throw error;
  }
};

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => String(value ?? "").trim();

const getTutorReference = (req) =>
  clean(
    req.headers["x-tutor-reference"] ||
    req.headers["x-tutor-ref"] ||
    req.headers["x-academy-tutor-reference"]
  );

const getClassroom = async (classId, tutorReference) => {
  if (!/^\d+$/.test(String(classId))) {
    throw new Error("Invalid live class ID.");
  }

  if (!tutorReference) {
    throw new Error("Tutor reference is missing.");
  }

  const result = await pool.query(
    `
      SELECT id, tutor_reference, title, status
      FROM academy_live_classes
      WHERE id = $1
      LIMIT 1
    `,
    [classId]
  );

  if (!result.rows.length) {
    throw new Error("Live classroom was not found.");
  }

  const classroom = result.rows[0];

  if (
    clean(classroom.tutor_reference) !== tutorReference
  ) {
    throw new Error(
      "You are not authorized to access this classroom."
    );
  }

  return classroom;
};

/* ============================================================
   GET LIVE CLASS CHAT
   GET /api/academy/tutor/live-classes/:id/chat
============================================================ */

router.get("/live-classes/:id/chat", async (req, res) => {
  try {
    await ensureChatTable();

    const tutorReference = getTutorReference(req);

    await getClassroom(req.params.id, tutorReference);

    const result = await pool.query(
      `
        SELECT
          id,
          live_class_id,
          sender_role,
          sender_reference,
          sender_name,
          message,
          created_at
        FROM academy_live_class_chat_messages
        WHERE live_class_id = $1
          AND tutor_reference = $2
        ORDER BY created_at ASC, id ASC
      `,
      [req.params.id, tutorReference]
    );

    return res.status(200).json({
      success: true,
      messages: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("FETCH LIVE CLASS CHAT ERROR:", error);

    const status = error.message.includes("authorized") ? 403 :
      error.message.includes("not found") ? 404 :
      error.message.includes("missing") ||
      error.message.includes("Invalid") ? 400 : 500;

    return res.status(status).json({
      success: false,
      messages: [],
      error: error.message || "Unable to load chat messages.",
    });
  }
});

/* ============================================================
   SAVE LIVE CLASS CHAT MESSAGE
   POST /api/academy/tutor/live-classes/:id/chat
============================================================ */

router.post("/live-classes/:id/chat", async (req, res) => {
  try {
    await ensureChatTable();

    const tutorReference = getTutorReference(req);

    const classroom = await getClassroom(
      req.params.id,
      tutorReference
    );

    const message = clean(req.body?.message);

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message cannot be empty.",
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "Message cannot exceed 5000 characters.",
      });
    }

    const senderName =
      clean(req.body?.senderName) || "Tutor";

    const result = await pool.query(
      `
        INSERT INTO academy_live_class_chat_messages (
          live_class_id,
          tutor_reference,
          sender_role,
          sender_reference,
          sender_name,
          message
        )
        VALUES ($1, $2, 'tutor', $2, $3, $4)
        RETURNING
          id,
          live_class_id,
          sender_role,
          sender_reference,
          sender_name,
          message,
          created_at
      `,
      [
        classroom.id,
        tutorReference,
        senderName,
        message,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Chat message saved.",
      chatMessage: result.rows[0],
    });
  } catch (error) {
    console.error("SAVE LIVE CLASS CHAT ERROR:", error);

    const status = error.message.includes("authorized") ? 403 :
      error.message.includes("not found") ? 404 :
      error.message.includes("missing") ||
      error.message.includes("Invalid") ? 400 : 500;

    return res.status(status).json({
      success: false,
      error: error.message || "Unable to save chat message.",
    });
  }
});

/* ============================================================
   GET LIVE CLASS PARTICIPANTS
   GET /api/academy/tutor/live-classes/:id/participants
============================================================ */

router.get("/live-classes/:id/participants", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    const classroom = await getClassroom(
      req.params.id,
      tutorReference
    );

    const result = await pool.query(
      `
        SELECT
          id,
          enrollment_id,
          student_name,
          role,
          is_present,
          joined_at,
          left_at
        FROM academy_live_participants
        WHERE live_class_id = $1
        ORDER BY joined_at DESC NULLS LAST, id DESC
      `,
      [classroom.id]
    );

    const participants = result.rows.map((participant) => ({
      id: participant.id,
      enrollmentId: participant.enrollment_id,
      studentName: participant.student_name || "Student",
      role: participant.role || "student",
      isPresent: Boolean(participant.is_present) &&
        !participant.left_at,
      joinedAt: participant.joined_at,
      leftAt: participant.left_at,
    }));

    return res.status(200).json({
      success: true,
      participants,
      count: participants.length,
    });
  } catch (error) {
    console.error("FETCH LIVE CLASS PARTICIPANTS ERROR:", error);

    return res.status(500).json({
      success: false,
      participants: [],
      error: error.message || "Unable to load participants.",
    });
  }
});


export default router;
