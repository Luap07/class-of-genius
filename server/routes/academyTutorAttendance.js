import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

router.get("/attendance/classes", async (req, res) => {
  try {
    const tutorReference =
      req.headers["x-tutor-reference"] ||
      req.query.tutorReference ||
      req.query.tutor_reference;

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        message: "Tutor reference is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        tutor_reference,
        grade,
        title,
        status,
        class_id,
        class_name,
        subject,
        scheduled_at,
        scheduled_start,
        started_at,
        actual_start,
        ended_at,
        actual_end,
        room_code
      FROM public.academy_live_classes
      WHERE tutor_reference = $1
      ORDER BY COALESCE(
        scheduled_at,
        scheduled_start,
        created_at
      ) DESC
      `,
      [String(tutorReference)]
    );

    return res.json({
      success: true,
      classes: result.rows.map((row) => ({
        id: row.id,
        tutorReference: row.tutor_reference,
        grade: row.grade,
        title: row.title,
        status: row.status,
        classId: row.class_id,
        className: row.class_name,
        subject: row.subject,
        scheduledAt: row.scheduled_at,
        scheduledStart: row.scheduled_start,
        startedAt: row.started_at,
        actualStart: row.actual_start,
        endedAt: row.ended_at,
        actualEnd: row.actual_end,
        roomCode: row.room_code,
      })),
    });
  } catch (error) {
    console.error("Attendance classes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load live classes.",
      error: error.message,
    });
  }
});


router.get("/attendance", async (req, res) => {
  try {
    const tutorReference =
      req.headers["x-tutor-reference"] ||
      req.query.tutorReference ||
      req.query.tutor_reference;

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        message: "Tutor reference is required.",
      });
    }

    const liveClassId =
      req.query.liveClassId ||
      req.query.live_class_id;

    if (!liveClassId) {
      return res.status(400).json({
        success: false,
        message: "Live class ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.live_class_id,
        p.enrollment_id,
        p.student_name,
        p.role,
        p.joined_at,
        p.left_at,
        p.is_present,
        p.total_seconds,

        lc.title,
        lc.grade,
        lc.class_id,
        lc.class_name,
        lc.subject,
        lc.status,
        lc.scheduled_at,
        lc.started_at,
        lc.ended_at,
        lc.room_code

      FROM public.academy_live_participants p

      INNER JOIN public.academy_live_classes lc
        ON lc.id = p.live_class_id

      WHERE lc.tutor_reference = $1
        AND p.live_class_id = $2
        AND LOWER(COALESCE(p.role, 'student')) = 'student'

      ORDER BY p.joined_at DESC
      `,
      [
        String(tutorReference),
        liveClassId,
      ]
    );

    return res.json({
      success: true,

      attendance: result.rows.map((row) => ({
        id: row.id,
        liveClassId: row.live_class_id,

        enrollmentId: row.enrollment_id,
        studentName: row.student_name,

        role: row.role,

        joinedAt: row.joined_at,
        leftAt: row.left_at,

        isPresent: row.is_present,

        totalSeconds: row.total_seconds,
        durationSeconds: row.total_seconds,

        attendanceStatus:
          row.is_present === true
            ? "present"
            : "ended",

        title: row.title,
        grade: row.grade,

        classId: row.class_id,
        className: row.class_name,
        subject: row.subject,

        classStatus: row.status,

        scheduledAt: row.scheduled_at,
        startedAt: row.started_at,
        endedAt: row.ended_at,

        roomCode: row.room_code,
      })),
    });
  } catch (error) {
    console.error("Attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load attendance.",
      error: error.message,
    });
  }
});


export default router;