import express from "express";
import crypto from "crypto";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

const getTutorReference = (req, body = {}) => {
  return String(
    req.headers["x-tutor-reference"] ||
      body.tutorReference ||
      body.tutor_reference ||
      req.query?.tutorReference ||
      req.query?.tutor_reference ||
      ""
  ).trim();
};

const getSessionId = (req) => {
  return String(
    req.params.id ||
      req.body?.sessionId ||
      req.body?.session_id ||
      ""
  ).trim();
};

const makeRoomCode = () => {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
};

const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL?.trim() ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");
};

const makeJoinUrl = (roomCode) => {
  return `${getFrontendUrl()}/academy/live-class/${roomCode}`;
};

const isValidBigIntId = (value) => {
  return /^\d+$/.test(String(value || "").trim());
};

const normaliseSession = (row) => {
  if (!row) return null;

  return {
    id: row.id,

    title: row.title || "",
    description: row.description || "",

    tutor_reference: row.tutor_reference || "",

    grade: row.grade || "",

    class_id: row.class_id || "",
    class_name: row.class_name || "",

    subject: row.subject || "",

    scheduled_at: row.scheduled_at || row.scheduled_start || null,

    scheduled_start: row.scheduled_start || row.scheduled_at || null,

    started_at: row.started_at || row.actual_start || null,

    actual_start: row.actual_start || row.started_at || null,

    ended_at: row.ended_at || row.actual_end || null,

    actual_end: row.actual_end || row.ended_at || null,

    status: row.status || "scheduled",

    room_id: row.room_id || row.room_code || "",

    room_code: row.room_code || row.room_id || "",

    join_url: row.join_url || "",

    meeting_url:
      row.meeting_url ||
      row.join_url ||
      "",

    recording_status:
      row.recording_status || "",

    recording_url:
      row.recording_url || "",

    recording_duration:
      row.recording_duration ??
      row.duration_seconds ??
      null,

    duration_seconds:
      row.duration_seconds ??
      row.recording_duration ??
      null,

    subjects: row.subjects || null,

    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
};


/* =========================================================
   DATABASE SETUP
   IMPORTANT:
   We DO NOT convert existing BIGINT IDs to UUID.
========================================================= */

const ensureLiveClassTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_classes (
      id BIGSERIAL PRIMARY KEY,
      tutor_reference TEXT,
      grade TEXT NOT NULL,
      subjects JSONB,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'scheduled',
      scheduled_start TIMESTAMPTZ,
      actual_start TIMESTAMPTZ,
      actual_end TIMESTAMPTZ,
      room_id TEXT,
      recording_status TEXT,
      recording_url TEXT,
      duration_seconds INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      class_id TEXT,
      class_name TEXT,
      subject TEXT,
      scheduled_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      room_code TEXT,
      join_url TEXT,
      meeting_url TEXT,
      recording_duration INTEGER
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_participants (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      enrollment_id TEXT,
      student_name TEXT,
      role TEXT,
      joined_at TIMESTAMPTZ,
      left_at TIMESTAMPTZ,
      is_present BOOLEAN DEFAULT FALSE,
      total_seconds INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_chat (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      sender_id TEXT,
      sender_name TEXT,
      sender_role TEXT,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_recordings (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      tutor_reference TEXT,
      title TEXT,
      recording_url TEXT,
      thumbnail_url TEXT,
      duration_seconds INTEGER,
      file_size BIGINT,
      status TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_resources (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      resource_type TEXT,
      title TEXT,
      file_url TEXT,
      current_page INTEGER,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_live_whiteboard_events (
      id BIGSERIAL PRIMARY KEY,
      live_class_id BIGINT,
      event_type TEXT,
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};


/* =========================================================
   STARTUP
========================================================= */

ensureLiveClassTables().catch((error) => {
  console.error(
    "Live class database setup error:",
    error
  );
});


/* =========================================================
   GET ALL TUTOR LIVE CLASSES
   GET /api/academy/tutor/live-classes
========================================================= */

router.get(
  "/tutor/live-classes",
  async (req, res) => {
    try {
      const tutorReference =
        getTutorReference(req);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message: "Tutor reference is required",
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM academy_live_classes
        WHERE tutor_reference = $1
        ORDER BY
          COALESCE(scheduled_at, scheduled_start) DESC,
          id DESC
        `,
        [tutorReference]
      );

      return res.json({
        success: true,
        sessions: result.rows.map(normaliseSession),
        data: result.rows.map(normaliseSession),
      });
    } catch (error) {
      console.error(
        "GET tutor live classes error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch live classes",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   CREATE LIVE CLASS
   POST /api/academy/tutor/live-classes
========================================================= */

router.post(
  "/tutor/live-classes",
  async (req, res) => {
    try {
      const body = req.body || {};

      const tutorReference =
        getTutorReference(req, body);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message: "Tutor reference is required",
        });
      }

      const finalTitle = String(
        body.title || "Live Class"
      ).trim();

      const cleanDescription = String(
        body.description || ""
      ).trim();

      /*
       * IMPORTANT:
       * classId can be a UUID/string.
       * It belongs in class_id TEXT.
       *
       * DO NOT use it as academy_live_classes.id.
       */

      const cleanClassId = String(
        body.classId ||
          body.class_id ||
          body.grade_id ||
          body.gradeId ||
          ""
      ).trim();

      const cleanClassName = String(
        body.className ||
          body.class_name ||
          body.class ||
          body.gradeName ||
          body.grade_name ||
          ""
      ).trim();

      const cleanSubject = String(
        body.subject ||
          body.subject_name ||
          body.subjectName ||
          ""
      ).trim();

      /*
       * YOUR DATABASE HAS:
       *
       * grade TEXT NOT NULL
       *
       * So grade MUST always be supplied.
       *
       * We prefer an explicitly supplied grade,
       * otherwise use class name.
       */

      const cleanGrade = String(
        body.grade ||
          body.className ||
          body.class_name ||
          body.class ||
          body.gradeName ||
          body.grade_name ||
          cleanClassName ||
          ""
      ).trim();

      if (!cleanGrade) {
        return res.status(400).json({
          success: false,
          message:
            "Grade/class is required. The selected class could not be determined.",
        });
      }

      if (!cleanClassId) {
        return res.status(400).json({
          success: false,
          message: "Class is required",
        });
      }

      if (!cleanSubject) {
        return res.status(400).json({
          success: false,
          message: "Subject is required",
        });
      }

      const scheduledValue =
        body.scheduledAt ||
        body.scheduled_at ||
        null;

      let scheduledDate;

      if (scheduledValue) {
        scheduledDate =
          new Date(scheduledValue);
      } else {
        scheduledDate = new Date(
          Date.now() + 30 * 60 * 1000
        );
      }

      if (
        Number.isNaN(
          scheduledDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid scheduled date",
        });
      }

      const roomCode = makeRoomCode();
      const joinUrl = makeJoinUrl(roomCode);

      /*
       * IMPORTANT:
       *
       * NO id is inserted here.
       *
       * PostgreSQL generates the BIGINT id.
       *
       * The selected class ID goes into class_id.
       */

      const result = await pool.query(
        `
        INSERT INTO academy_live_classes (
          tutor_reference,
          grade,
          subjects,
          title,
          description,
          status,

          scheduled_start,
          scheduled_at,

          room_id,
          room_code,

          join_url,
          meeting_url,

          class_id,
          class_name,
          subject,

          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3::jsonb,
          $4,
          $5,
          'scheduled',

          $6,
          $6,

          $7,
          $7,

          $8,
          $8,

          $9,
          $10,
          $11,

          NOW(),
          NOW()
        )
        RETURNING *
        `,
        [
          tutorReference,
          cleanGrade,

          JSON.stringify(
            cleanSubject
              ? [cleanSubject]
              : []
          ),

          finalTitle,
          cleanDescription,

          scheduledDate.toISOString(),

          roomCode,
          joinUrl,

          cleanClassId,
          cleanClassName || cleanGrade,
          cleanSubject,
        ]
      );

      const session =
        normaliseSession(result.rows[0]);

      return res.status(201).json({
        success: true,
        message: "Live class created successfully",
        session,
        data: session,
      });
    } catch (error) {
      console.error(
        "CREATE live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to create live class",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   GET ONE LIVE CLASS
   GET /api/academy/tutor/live-classes/:id
========================================================= */

router.get(
  "/tutor/live-classes/:id",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM academy_live_classes
        WHERE id = $1::bigint
        LIMIT 1
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      return res.json({
        success: true,
        session:
          normaliseSession(
            result.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "GET live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch live class",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   START LIVE CLASS
   POST /api/academy/tutor/live-classes/:id/start
========================================================= */

router.post(
  "/tutor/live-classes/:id/start",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_classes
        SET
          status = 'live',
          started_at = COALESCE(
            started_at,
            NOW()
          ),
          actual_start = COALESCE(
            actual_start,
            NOW()
          ),
          updated_at = NOW()
        WHERE id = $1::bigint
        RETURNING *
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      return res.json({
        success: true,
        message: "Live class started",
        session:
          normaliseSession(
            result.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "START live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to start live class",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   END LIVE CLASS
   POST /api/academy/tutor/live-classes/:id/end
========================================================= */

router.post(
  "/tutor/live-classes/:id/end",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_classes
        SET
          status = 'ended',

          ended_at = COALESCE(
            ended_at,
            NOW()
          ),

          actual_end = COALESCE(
            actual_end,
            NOW()
          ),

          duration_seconds =
            CASE
              WHEN COALESCE(
                started_at,
                actual_start
              ) IS NOT NULL
              THEN GREATEST(
                0,
                EXTRACT(
                  EPOCH FROM (
                    COALESCE(
                      ended_at,
                      actual_end,
                      NOW()
                    )
                    -
                    COALESCE(
                      started_at,
                      actual_start
                    )
                  )
                )::INTEGER
              )
              ELSE duration_seconds
            END,

          updated_at = NOW()
        WHERE id = $1::bigint
        RETURNING *
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      return res.json({
        success: true,
        message: "Live class ended",
        session:
          normaliseSession(
            result.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "END live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to end live class",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   DELETE LIVE CLASS
   DELETE /api/academy/tutor/live-classes/:id
========================================================= */

router.delete(
  "/tutor/live-classes/:id",
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      await client.query("BEGIN");

      /*
       * Delete child records first because
       * they reference academy_live_classes.id.
       */

      await client.query(
        `
        DELETE FROM academy_live_chat
        WHERE live_class_id = $1::bigint
        `,
        [id]
      );

      await client.query(
        `
        DELETE FROM academy_live_participants
        WHERE live_class_id = $1::bigint
        `,
        [id]
      );

      await client.query(
        `
        DELETE FROM academy_live_recordings
        WHERE live_class_id = $1::bigint
        `,
        [id]
      );

      await client.query(
        `
        DELETE FROM academy_live_resources
        WHERE live_class_id = $1::bigint
        `,
        [id]
      );

      await client.query(
        `
        DELETE FROM academy_live_whiteboard_events
        WHERE live_class_id = $1::bigint
        `,
        [id]
      );

      const result =
        await client.query(
          `
          DELETE FROM academy_live_classes
          WHERE id = $1::bigint
          RETURNING *
          `,
          [id]
        );

      if (!result.rows.length) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      await client.query("COMMIT");

      return res.json({
        success: true,
        message: "Live class deleted successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "DELETE live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete live class",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);


/* =========================================================
   JOIN LIVE CLASS
   POST /api/academy/live-classes/:id/join
========================================================= */

router.post(
  "/live-classes/:id/join",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const enrollmentId = String(
        body.enrollmentId ||
          body.enrollment_id ||
          body.studentId ||
          body.student_id ||
          ""
      ).trim();

      const studentName = String(
        body.studentName ||
          body.student_name ||
          body.name ||
          "Student"
      ).trim();

      const role = String(
        body.role || "student"
      ).trim();

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message: "Enrollment ID is required",
        });
      }

      const classResult =
        await pool.query(
          `
          SELECT *
          FROM academy_live_classes
          WHERE id = $1::bigint
          LIMIT 1
          `,
          [id]
        );

      if (!classResult.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      const result =
        await pool.query(
          `
          INSERT INTO academy_live_participants (
            live_class_id,
            enrollment_id,
            student_name,
            role,
            joined_at,
            is_present,
            created_at
          )
          VALUES (
            $1::bigint,
            $2,
            $3,
            $4,
            NOW(),
            TRUE,
            NOW()
          )
          RETURNING *
          `,
          [
            id,
            enrollmentId,
            studentName,
            role,
          ]
        );

      return res.status(201).json({
        success: true,
        message: "Joined live class",
        participant: result.rows[0],
        session:
          normaliseSession(
            classResult.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "JOIN live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to join live class",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   LEAVE LIVE CLASS
   POST /api/academy/live-classes/:id/leave
========================================================= */

router.post(
  "/live-classes/:id/leave",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const enrollmentId = String(
        body.enrollmentId ||
          body.enrollment_id ||
          body.studentId ||
          body.student_id ||
          ""
      ).trim();

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message: "Enrollment ID is required",
        });
      }

      const result =
        await pool.query(
          `
          UPDATE academy_live_participants
          SET
            is_present = FALSE,
            left_at = NOW(),

            total_seconds =
              CASE
                WHEN joined_at IS NOT NULL
                THEN GREATEST(
                  0,
                  EXTRACT(
                    EPOCH FROM (
                      NOW() - joined_at
                    )
                  )::INTEGER
                )
                ELSE total_seconds
              END

          WHERE live_class_id = $1::bigint
            AND enrollment_id = $2
            AND is_present = TRUE

          RETURNING *
          `,
          [id, enrollmentId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Active participant record not found",
        });
      }

      return res.json({
        success: true,
        message: "Left live class",
        participant: result.rows[0],
      });
    } catch (error) {
      console.error(
        "LEAVE live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to leave live class",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   GET PARTICIPANTS
   GET /api/academy/live-classes/:id/participants
========================================================= */

router.get(
  "/live-classes/:id/participants",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            live_class_id,
            enrollment_id,
            student_name,
            role,
            joined_at,
            left_at,
            is_present,
            total_seconds,
            created_at
          FROM academy_live_participants
          WHERE live_class_id = $1::bigint
          ORDER BY joined_at ASC, id ASC
          `,
          [id]
        );

      return res.json({
        success: true,
        participants: result.rows,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "GET participants error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch participants",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   ATTENDANCE
   GET /api/academy/live-classes/:id/attendance
========================================================= */

router.get(
  "/live-classes/:id/attendance",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            enrollment_id,
            student_name,
            role,
            MIN(joined_at) AS first_joined_at,
            MAX(left_at) AS last_left_at,
            SUM(
              COALESCE(total_seconds, 0)
            )::INTEGER AS total_seconds,
            BOOL_OR(
              COALESCE(is_present, FALSE)
            ) AS is_present
          FROM academy_live_participants
          WHERE live_class_id = $1::bigint
          GROUP BY
            enrollment_id,
            student_name,
            role
          ORDER BY student_name ASC
          `,
          [id]
        );

      return res.json({
        success: true,
        attendance: result.rows,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "GET attendance error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch attendance",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   GET CHAT
   GET /api/academy/live-classes/:id/chat
========================================================= */

router.get(
  "/live-classes/:id/chat",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            live_class_id,
            sender_id,
            sender_name,
            sender_role,
            message,
            created_at
          FROM academy_live_chat
          WHERE live_class_id = $1::bigint
          ORDER BY created_at ASC, id ASC
          `,
          [id]
        );

      return res.json({
        success: true,
        messages: result.rows,
        chat: result.rows,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "GET live chat error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch live chat",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   SEND CHAT MESSAGE
   POST /api/academy/live-classes/:id/chat
========================================================= */

router.post(
  "/live-classes/:id/chat",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const senderId = String(
        body.senderId ||
          body.sender_id ||
          body.userId ||
          body.user_id ||
          ""
      ).trim();

      const senderName = String(
        body.senderName ||
          body.sender_name ||
          body.name ||
          "User"
      ).trim();

      const senderRole = String(
        body.senderRole ||
          body.sender_role ||
          body.role ||
          "student"
      ).trim();

      const message = String(
        body.message || ""
      ).trim();

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const result =
        await pool.query(
          `
          INSERT INTO academy_live_chat (
            live_class_id,
            sender_id,
            sender_name,
            sender_role,
            message,
            created_at
          )
          VALUES (
            $1::bigint,
            $2,
            $3,
            $4,
            $5,
            NOW()
          )
          RETURNING *
          `,
          [
            id,
            senderId,
            senderName,
            senderRole,
            message,
          ]
        );

      return res.status(201).json({
        success: true,
        message: "Message sent",
        chat: result.rows[0],
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "SEND live chat error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send chat message",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   SAVE WHITEBOARD STATE
   POST /api/academy/live-classes/:id/whiteboard
========================================================= */

router.post(
  "/live-classes/:id/whiteboard",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const payload =
        body.payload ??
        body.content ??
        body.state ??
        body;

      const result =
        await pool.query(
          `
          INSERT INTO academy_live_whiteboard_events (
            live_class_id,
            event_type,
            payload,
            created_at
          )
          VALUES (
            $1::bigint,
            'state',
            $2::jsonb,
            NOW()
          )
          RETURNING *
          `,
          [
            id,
            JSON.stringify(payload),
          ]
        );

      return res.status(201).json({
        success: true,
        message: "Whiteboard state saved",
        event: result.rows[0],
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "SAVE whiteboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to save whiteboard",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   GET WHITEBOARD STATE
   GET /api/academy/live-classes/:id/whiteboard
========================================================= */

router.get(
  "/live-classes/:id/whiteboard",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result =
        await pool.query(
          `
          SELECT *
          FROM academy_live_whiteboard_events
          WHERE live_class_id = $1::bigint
          ORDER BY created_at DESC, id DESC
          LIMIT 1
          `,
          [id]
        );

      const row =
        result.rows[0] || null;

      return res.json({
        success: true,
        whiteboard: row
          ? row.payload
          : null,
        event: row,
        data: row
          ? row.payload
          : null,
      });
    } catch (error) {
      console.error(
        "GET whiteboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch whiteboard",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   ADD RESOURCE
   POST /api/academy/live-classes/:id/resources
========================================================= */

router.post(
  "/live-classes/:id/resources",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const resourceType = String(
        body.resourceType ||
          body.resource_type ||
          "file"
      ).trim();

      const title = String(
        body.title || "Resource"
      ).trim();

      const fileUrl = String(
        body.fileUrl ||
          body.file_url ||
          body.url ||
          ""
      ).trim();

      const currentPage =
        body.currentPage ??
        body.current_page ??
        1;

      const result =
        await pool.query(
          `
          INSERT INTO academy_live_resources (
            live_class_id,
            resource_type,
            title,
            file_url,
            current_page,
            is_active,
            created_at
          )
          VALUES (
            $1::bigint,
            $2,
            $3,
            $4,
            $5,
            TRUE,
            NOW()
          )
          RETURNING *
          `,
          [
            id,
            resourceType,
            title,
            fileUrl,
            Number(currentPage) || 1,
          ]
        );

      return res.status(201).json({
        success: true,
        message: "Resource added",
        resource: result.rows[0],
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "ADD resource error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to add resource",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   GET RESOURCES
   GET /api/academy/live-classes/:id/resources
========================================================= */

router.get(
  "/live-classes/:id/resources",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const result =
        await pool.query(
          `
          SELECT *
          FROM academy_live_resources
          WHERE live_class_id = $1::bigint
          ORDER BY created_at ASC, id ASC
          `,
          [id]
        );

      return res.json({
        success: true,
        resources: result.rows,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "GET resources error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch resources",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   RECORDING
   POST /api/academy/live-classes/:id/recording
========================================================= */

router.post(
  "/live-classes/:id/recording",
  async (req, res) => {
    try {
      const id = getSessionId(req);

      if (!isValidBigIntId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid live class ID",
        });
      }

      const body = req.body || {};

      const recordingUrl = String(
        body.recordingUrl ||
          body.recording_url ||
          ""
      ).trim();

      const recordingStatus =
        String(
          body.status ||
            body.recordingStatus ||
            body.recording_status ||
            (recordingUrl
              ? "completed"
              : "processing")
        ).trim();

      const duration =
        Number(
          body.durationSeconds ??
            body.duration_seconds ??
            body.recordingDuration ??
            body.recording_duration ??
            0
        ) || 0;

      const result =
        await pool.query(
          `
          UPDATE academy_live_classes
          SET
            recording_url = $1,
            recording_status = $2,
            recording_duration = $3,
            duration_seconds = $3,
            updated_at = NOW()
          WHERE id = $4::bigint
          RETURNING *
          `,
          [
            recordingUrl,
            recordingStatus,
            duration,
            id,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      return res.json({
        success: true,
        message:
          "Recording information updated",
        session:
          normaliseSession(
            result.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "UPDATE recording error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update recording",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   GET RECORDINGS
   GET /api/academy/tutor/live-recordings
========================================================= */

router.get(
  "/tutor/live-recordings",
  async (req, res) => {
    try {
      const tutorReference =
        getTutorReference(req);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            r.*,
            c.title AS live_class_title
          FROM academy_live_recordings r
          LEFT JOIN academy_live_classes c
            ON c.id = r.live_class_id
          WHERE r.tutor_reference = $1
          ORDER BY r.created_at DESC, r.id DESC
          `,
          [tutorReference]
        );

      return res.json({
        success: true,
        recordings: result.rows,
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "GET recordings error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch recordings",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   GET LIVE CLASS BY ROOM CODE
   GET /api/academy/live-class/room/:roomCode
========================================================= */

router.get(
  "/live-class/room/:roomCode",
  async (req, res) => {
    try {
      const roomCode = String(
        req.params.roomCode || ""
      ).trim();

      if (!roomCode) {
        return res.status(400).json({
          success: false,
          message: "Room code is required",
        });
      }

      const result =
        await pool.query(
          `
          SELECT *
          FROM academy_live_classes
          WHERE room_code = $1
             OR room_id = $1
          LIMIT 1
          `,
          [roomCode]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Live class room not found",
        });
      }

      return res.json({
        success: true,
        session:
          normaliseSession(
            result.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "GET room live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch live class room",
        error: error.message,
      });
    }
  }
);


/* =========================================================
   EXPORT
========================================================= */

export default router;