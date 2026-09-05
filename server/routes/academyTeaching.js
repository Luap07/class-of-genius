import express from "express";
import crypto from "crypto";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   HELPERS
   ========================================================= */

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function arrayFromValue(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(clean).filter(Boolean))];
  }

  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return [...new Set(parsed.map(clean).filter(Boolean))];
      }
    } catch {}

    return [
      ...new Set(
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];
  }

  return [];
}

function normalizeSubject(value) {
  return clean(value)
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function subjectsMatch(a, b) {
  const first = normalizeSubject(a);
  const second = normalizeSubject(b);

  if (!first || !second) return false;

  if (first === second) return true;

  const aliases = {
    mathematics: ["general mathematics"],
    "general mathematics": ["mathematics"],

    "english studies": ["english language"],
    "english language": ["english studies"],
  };

  return (
    aliases[first]?.includes(second) ||
    aliases[second]?.includes(first)
  );
}

function generateRoomId() {
  return (
    "scholiqen-" +
    crypto.randomBytes(12).toString("hex")
  );
}

function normalizeTutorReference(value) {
  return clean(value);
}

function getDatabaseError(error) {
  return {
    message: error?.message || null,
    code: error?.code || null,
    detail: error?.detail || null,
    hint: error?.hint || null,
    table: error?.table || null,
    column: error?.column || null,
    constraint: error?.constraint || null,
  };
}


/* =========================================================
   GET REGISTERED TUTOR CLASSES
   ========================================================= */

router.get("/classes", async (req, res) => {
  try {
    const reference = normalizeTutorReference(
      req.query.reference
    );

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Tutor reference is required.",
      });
    }

    const tutorResult = await pool.query(
      `
      SELECT
        reference,
        first_name,
        middle_name,
        last_name,
        subjects,
        classes,
        application_status
      FROM academy_tutor_applications
      WHERE LOWER(TRIM(reference)) = LOWER(TRIM($1))
      LIMIT 1
      `,
      [reference]
    );

    if (!tutorResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Tutor account was not found.",
      });
    }

    const tutor = tutorResult.rows[0];

    if (
      clean(tutor.application_status).toLowerCase() !==
      "verified"
    ) {
      return res.status(403).json({
        success: false,
        message: "Tutor account is not verified.",
      });
    }

    const tutorClasses = arrayFromValue(tutor.classes);
    const tutorSubjects = arrayFromValue(tutor.subjects);

    /*
      IMPORTANT:

      One registered class = ONE course card.

      We do NOT multiply:
      class × subject.

      If tutor selected 7 classes,
      the API returns exactly 7 class cards.
    */

    const enrollmentsResult = await pool.query(
      `
      SELECT
        enrollment_id,
        first_name,
        middle_name,
        last_name,
        grade,
        subjects,
        enrollment_status,
        email,
        student_phone
      FROM academy_student_enrollments
      `
    );

    const enrollments = enrollmentsResult.rows;

    const classes = tutorClasses.map((grade, index) => {
      const matchingStudents = enrollments.filter((student) => {
        if (
          clean(student.grade).toLowerCase() !==
          clean(grade).toLowerCase()
        ) {
          return false;
        }

        const studentSubjects =
          arrayFromValue(student.subjects);

        return studentSubjects.some((studentSubject) =>
          tutorSubjects.some((tutorSubject) =>
            subjectsMatch(
              studentSubject,
              tutorSubject
            )
          )
        );
      });

      const verifiedStudents =
        matchingStudents.filter(
          (student) =>
            clean(student.enrollment_status).toLowerCase() ===
            "verified"
        );

      const pendingStudents =
        matchingStudents.filter(
          (student) =>
            clean(student.enrollment_status).toLowerCase() ===
            "pending"
        );

      return {
        id: `${reference}-${index}-${encodeURIComponent(
          grade
        )}`,

        grade,

        className: grade,

        schoolLevel: grade.startsWith("Primary")
          ? "Primary"
          : grade.startsWith("JSS")
          ? "Junior Secondary"
          : "Senior Secondary",

        subjects: tutorSubjects,

        active: verifiedStudents.length > 0,

        status:
          verifiedStudents.length > 0
            ? "active"
            : matchingStudents.length > 0
            ? "pending"
            : "waiting",

        studentCount: matchingStudents.length,

        verifiedStudentCount: verifiedStudents.length,

        pendingStudentCount: pendingStudents.length,

        students: matchingStudents.map((student) => ({
          enrollmentId: student.enrollment_id,

          name: [
            student.first_name,
            student.middle_name,
            student.last_name,
          ]
            .filter(Boolean)
            .join(" "),

          grade: student.grade,

          subjects: arrayFromValue(student.subjects),

          enrollmentStatus:
            student.enrollment_status,

          email: student.email,

          phone: student.student_phone,
        })),
      };
    });

    /*
      Unique students across all registered classes.
    */

    const uniqueStudents = new Map();

    classes.forEach((classItem) => {
      classItem.students.forEach((student) => {
        uniqueStudents.set(
          student.enrollmentId,
          student
        );
      });
    });

    const activeClasses = classes.filter(
      (classItem) => classItem.active
    );

    return res.json({
      success: true,

      tutor: {
        reference: tutor.reference,

        fullName: [
          tutor.first_name,
          tutor.middle_name,
          tutor.last_name,
        ]
          .filter(Boolean)
          .join(" "),
      },

      stats: {
        totalCourses: tutorClasses.length,

        totalSubjects: tutorSubjects.length,

        totalStudents: uniqueStudents.size,

        activeClasses: activeClasses.length,
      },

      classes,

      registeredClasses: tutorClasses,

      registeredSubjects: tutorSubjects,
    });
  } catch (error) {
    console.error(
      "GET /tutor/classes error:",
      getDatabaseError(error)
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load tutor classes.",
      error: getDatabaseError(error),
    });
  }
});


/* =========================================================
   CREATE LIVE CLASS
   ========================================================= */

router.post("/live-classes", async (req, res) => {
  try {
    const {
      reference,
      grade,
      subjects = [],
      title,
      description = "",
      scheduledStart = null,
    } = req.body;

    if (!reference || !grade || !title) {
      return res.status(400).json({
        success: false,
        message:
          "Tutor reference, class and title are required.",
      });
    }

    const tutorResult = await pool.query(
      `
      SELECT
        reference,
        subjects,
        classes,
        application_status
      FROM academy_tutor_applications
      WHERE LOWER(TRIM(reference)) =
            LOWER(TRIM($1))
      LIMIT 1
      `,
      [reference]
    );

    if (!tutorResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Tutor was not found.",
      });
    }

    const tutor = tutorResult.rows[0];

    if (
      clean(tutor.application_status).toLowerCase() !==
      "verified"
    ) {
      return res.status(403).json({
        success: false,
        message: "Tutor is not verified.",
      });
    }

    const registeredClasses =
      arrayFromValue(tutor.classes);

    const registeredSubjects =
      arrayFromValue(tutor.subjects);

    const registeredClass = registeredClasses.some(
      (item) =>
        clean(item).toLowerCase() ===
        clean(grade).toLowerCase()
    );

    if (!registeredClass) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot create a live class for a course you did not register to teach.",
      });
    }

    const requestedSubjects =
      arrayFromValue(subjects);

    const validSubjects =
      requestedSubjects.filter((requested) =>
        registeredSubjects.some((registered) =>
          subjectsMatch(
            requested,
            registered
          )
        )
      );

    if (!validSubjects.length) {
      return res.status(400).json({
        success: false,
        message:
          "Select at least one subject registered for this tutor.",
      });
    }

    const roomId = generateRoomId();

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
        room_id
      )
      VALUES (
        $1,
        $2,
        $3::jsonb,
        $4,
        $5,
        'scheduled',
        $6,
        $7
      )
      RETURNING *
      `,
      [
        reference,
        grade,
        JSON.stringify(validSubjects),
        title,
        description,
        scheduledStart,
        roomId,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Live class created successfully.",
      liveClass: result.rows[0],
    });
  } catch (error) {
    console.error(
      "POST /tutor/live-classes error:",
      getDatabaseError(error)
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create live class.",
      error: getDatabaseError(error),
    });
  }
});


/* =========================================================
   GET LIVE CLASSES
   ========================================================= */

router.get("/live-classes", async (req, res) => {
  try {
    const reference = clean(req.query.reference);

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Tutor reference is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        lc.*,

        (
          SELECT COUNT(*)
          FROM academy_live_participants p
          WHERE p.live_class_id = lc.id
          AND p.role = 'student'
          AND p.is_present = TRUE
        ) AS present_students,

        (
          SELECT COUNT(*)
          FROM academy_live_participants p
          WHERE p.live_class_id = lc.id
          AND p.role = 'student'
        ) AS total_joined

      FROM academy_live_classes lc

      WHERE LOWER(TRIM(lc.tutor_reference)) =
            LOWER(TRIM($1))

      ORDER BY
        COALESCE(
          lc.scheduled_start,
          lc.created_at
        ) DESC
      `,
      [reference]
    );

    return res.json({
      success: true,
      liveClasses: result.rows,
    });
  } catch (error) {
    console.error(
      "GET /tutor/live-classes error:",
      getDatabaseError(error)
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load live classes.",
    });
  }
});


/* =========================================================
   START LIVE CLASS
   ========================================================= */

router.patch(
  "/live-classes/:id/start",
  async (req, res) => {
    try {
      const { id } = req.params;
      const reference = clean(req.body.reference);

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: "Tutor reference is required.",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_classes
        SET
          status = 'live',
          actual_start = COALESCE(
            actual_start,
            NOW()
          ),
          recording_status = 'recording'
        WHERE id = $1
        AND LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($2))
        AND status = 'scheduled'
        RETURNING *
        `,
        [id, reference]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Live class was not found or cannot be started.",
        });
      }

      return res.json({
        success: true,
        message: "Live class started.",
        liveClass: result.rows[0],
      });
    } catch (error) {
      console.error(
        "START LIVE CLASS error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message: "Unable to start live class.",
      });
    }
  }
);


/* =========================================================
   END LIVE CLASS
   ========================================================= */

router.patch(
  "/live-classes/:id/end",
  async (req, res) => {
    try {
      const { id } = req.params;
      const reference = clean(req.body.reference);

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: "Tutor reference is required.",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_classes
        SET
          status = 'ended',

          actual_end = NOW(),

          recording_status =
            CASE
              WHEN recording_status = 'recording'
              THEN 'processing'
              ELSE recording_status
            END,

          duration_seconds =
            CASE
              WHEN actual_start IS NOT NULL
              THEN GREATEST(
                0,
                EXTRACT(
                  EPOCH FROM (
                    NOW() - actual_start
                  )
                )::INTEGER
              )
              ELSE duration_seconds
            END

        WHERE id = $1

        AND LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($2))

        AND status = 'live'

        RETURNING *
        `,
        [id, reference]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Live class was not found or is not currently live.",
        });
      }

      /*
        Finalize attendance records.
      */

      await pool.query(
        `
        UPDATE academy_live_participants
        SET
          left_at = COALESCE(
            left_at,
            NOW()
          ),

          is_present = FALSE,

          total_seconds =
            CASE
              WHEN joined_at IS NOT NULL
              THEN GREATEST(
                0,
                EXTRACT(
                  EPOCH FROM (
                    COALESCE(
                      left_at,
                      NOW()
                    ) - joined_at
                  )
                )::INTEGER
              )
              ELSE total_seconds
            END

        WHERE live_class_id = $1
        `,
        [id]
      );

      return res.json({
        success: true,
        message: "Live class ended.",
        liveClass: result.rows[0],
      });
    } catch (error) {
      console.error(
        "END LIVE CLASS error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message: "Unable to end live class.",
      });
    }
  }
);


/* =========================================================
   GET ONE LIVE CLASS
   ========================================================= */

router.get(
  "/live-classes/:id",
  async (req, res) => {
    try {
      const { id } = req.params;
      const reference = clean(req.query.reference);

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: "Tutor reference is required.",
        });
      }

      const classResult = await pool.query(
        `
        SELECT *
        FROM academy_live_classes
        WHERE id = $1
        AND LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($2))
        LIMIT 1
        `,
        [id, reference]
      );

      if (!classResult.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Live class not found.",
        });
      }

      const participantsResult =
        await pool.query(
          `
          SELECT *
          FROM academy_live_participants
          WHERE live_class_id = $1
          ORDER BY joined_at ASC
          `,
          [id]
        );

      const attendanceResult =
        await pool.query(
          `
          SELECT *
          FROM academy_attendance
          WHERE live_class_id = $1
          ORDER BY joined_at ASC
          `,
          [id]
        );

      const resourcesResult =
        await pool.query(
          `
          SELECT *
          FROM academy_live_resources
          WHERE live_class_id = $1
          ORDER BY created_at ASC
          `,
          [id]
        );

      const recordingsResult =
        await pool.query(
          `
          SELECT *
          FROM academy_live_recordings
          WHERE live_class_id = $1
          ORDER BY created_at DESC
          `,
          [id]
        );

      return res.json({
        success: true,

        liveClass: classResult.rows[0],

        participants:
          participantsResult.rows,

        attendance:
          attendanceResult.rows,

        resources:
          resourcesResult.rows,

        recordings:
          recordingsResult.rows,
      });
    } catch (error) {
      console.error(
        "GET LIVE CLASS error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load live classroom.",
      });
    }
  }
);


/* =========================================================
   STUDENT JOINS LIVE CLASS
   ========================================================= */

router.post(
  "/live-classes/:id/join",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        enrollmentId,
        studentName,
      } = req.body;

      if (!enrollmentId || !studentName) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID and student name are required.",
        });
      }

      const classResult = await pool.query(
        `
        SELECT *
        FROM academy_live_classes
        WHERE id = $1
        AND status = 'live'
        LIMIT 1
        `,
        [id]
      );

      if (!classResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "This live classroom is not currently live.",
        });
      }

      const liveClass = classResult.rows[0];

      /*
        Prevent duplicate active attendance.
      */

      const existing =
        await pool.query(
          `
          SELECT *
          FROM academy_live_participants
          WHERE live_class_id = $1
          AND enrollment_id = $2
          AND is_present = TRUE
          LIMIT 1
          `,
          [id, enrollmentId]
        );

      if (existing.rows.length) {
        return res.json({
          success: true,
          participant:
            existing.rows[0],
          alreadyJoined: true,
        });
      }

      const participantResult =
        await pool.query(
          `
          INSERT INTO academy_live_participants (
            live_class_id,
            enrollment_id,
            student_name,
            role,
            joined_at,
            is_present
          )
          VALUES (
            $1,
            $2,
            $3,
            'student',
            NOW(),
            TRUE
          )
          RETURNING *
          `,
          [
            id,
            enrollmentId,
            studentName,
          ]
        );

      /*
        Create attendance record immediately.

        Attendance is therefore based on actual
        live-class presence — NOT registration alone.
      */

      await pool.query(
        `
        INSERT INTO academy_attendance (
          live_class_id,
          tutor_reference,
          enrollment_id,
          student_name,
          grade,
          joined_at,
          attendance_status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          NOW(),
          'present'
        )
        `,
        [
          id,
          liveClass.tutor_reference,
          enrollmentId,
          studentName,
          liveClass.grade,
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Student joined live classroom.",
        participant:
          participantResult.rows[0],
      });
    } catch (error) {
      console.error(
        "JOIN LIVE CLASS error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to join live classroom.",
      });
    }
  }
);


/* =========================================================
   STUDENT LEAVES LIVE CLASS
   ========================================================= */

router.post(
  "/live-classes/:id/leave",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        enrollmentId,
      } = req.body;

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID is required.",
        });
      }

      const result = await pool.query(
        `
        UPDATE academy_live_participants
        SET
          left_at = NOW(),
          is_present = FALSE,

          total_seconds =
            GREATEST(
              0,
              EXTRACT(
                EPOCH FROM (
                  NOW() - joined_at
                )
              )::INTEGER
            )

        WHERE live_class_id = $1
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
            "Active student session was not found.",
        });
      }

      const participant =
        result.rows[0];

      await pool.query(
        `
        UPDATE academy_attendance
        SET
          left_at = $1,
          duration_seconds = $2,

          attendance_status =
            CASE
              WHEN $2 >= 1800
              THEN 'present'

              WHEN $2 > 0
              THEN 'partial'

              ELSE 'absent'
            END

        WHERE live_class_id = $3
        AND enrollment_id = $4
        AND left_at IS NULL
        `,
        [
          participant.left_at,
          participant.total_seconds,
          id,
          enrollmentId,
        ]
      );

      return res.json({
        success: true,
        message:
          "Student left live classroom.",
        participant,
      });
    } catch (error) {
      console.error(
        "LEAVE LIVE CLASS error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to leave live classroom.",
      });
    }
  }
);


/* =========================================================
   LIVE PARTICIPANTS
   ========================================================= */

router.get(
  "/live-classes/:id/participants",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          id,
          enrollment_id,
          student_name,
          role,
          joined_at,
          left_at,
          is_present,
          total_seconds
        FROM academy_live_participants
        WHERE live_class_id = $1
        ORDER BY
          CASE
            WHEN is_present = TRUE THEN 0
            ELSE 1
          END,
          joined_at ASC
        `,
        [id]
      );

      const present =
        result.rows.filter(
          (item) => item.is_present
        );

      return res.json({
        success: true,

        totalParticipants:
          result.rows.filter(
            (item) =>
              item.role === "student"
          ).length,

        presentStudents:
          present.filter(
            (item) =>
              item.role === "student"
          ).length,

        participants:
          result.rows,
      });
    } catch (error) {
      console.error(
        "GET PARTICIPANTS error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load participants.",
      });
    }
  }
);


/* =========================================================
   CREATE TASK
   ========================================================= */

router.post("/tasks", async (req, res) => {
  try {
    const {
      reference,
      liveClassId = null,
      grade,
      subject,
      title,
      description = "",
      instructions = "",
      dueAt = null,
      maxScore = 100,
    } = req.body;

    if (
      !reference ||
      !grade ||
      !subject ||
      !title
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reference, class, subject and title are required.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO academy_tasks (
        tutor_reference,
        live_class_id,
        grade,
        subject,
        title,
        description,
        instructions,
        due_at,
        max_score
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING *
      `,
      [
        reference,
        liveClassId,
        grade,
        subject,
        title,
        description,
        instructions,
        dueAt,
        maxScore,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE TASK error:",
      getDatabaseError(error)
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create task.",
    });
  }
});


/* =========================================================
   GET TUTOR TASKS
   ========================================================= */

router.get("/tasks", async (req, res) => {
  try {
    const reference = clean(
      req.query.reference
    );

    const result = await pool.query(
      `
      SELECT
        t.*,

        (
          SELECT COUNT(*)
          FROM academy_task_submissions s
          WHERE s.task_id = t.id
        ) AS submissions,

        (
          SELECT COUNT(*)
          FROM academy_task_submissions s
          WHERE s.task_id = t.id
          AND s.status = 'graded'
        ) AS graded_submissions

      FROM academy_tasks t

      WHERE LOWER(TRIM(t.tutor_reference)) =
            LOWER(TRIM($1))

      ORDER BY t.created_at DESC
      `,
      [reference]
    );

    return res.json({
      success: true,
      tasks: result.rows,
    });
  } catch (error) {
    console.error(
      "GET TASKS error:",
      getDatabaseError(error)
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load tasks.",
    });
  }
});


/* =========================================================
   CREATE LESSON
   ========================================================= */

router.post("/lessons", async (req, res) => {
  try {
    const {
      reference,
      liveClassId = null,
      grade,
      subject,
      title,
      objectives = [],
      content = "",
      notes = "",
      lessonDate = null,
      durationSeconds = 0,
    } = req.body;

    if (
      !reference ||
      !grade ||
      !subject ||
      !title
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reference, class, subject and title are required.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO academy_lessons (
        tutor_reference,
        live_class_id,
        grade,
        subject,
        title,
        objectives,
        content,
        notes,
        lesson_date,
        duration_seconds
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::jsonb,
        $7,
        $8,
        COALESCE($9, NOW()),
        $10
      )
      RETURNING *
      `,
      [
        reference,
        liveClassId,
        grade,
        subject,
        title,
        JSON.stringify(arrayFromValue(objectives)),
        content,
        notes,
        lessonDate,
        durationSeconds,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully.",
      lesson: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE LESSON error:",
      getDatabaseError(error)
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create lesson.",
    });
  }
});


/* =========================================================
   GET LESSON HISTORY
   ========================================================= */

router.get("/lessons", async (req, res) => {
  try {
    const reference = clean(
      req.query.reference
    );

    const result = await pool.query(
      `
      SELECT *
      FROM academy_lessons
      WHERE LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($1))
      ORDER BY lesson_date DESC
      `,
      [reference]
    );

    return res.json({
      success: true,
      lessons: result.rows,
    });
  } catch (error) {
    console.error(
      "GET LESSONS error:",
      getDatabaseError(error)
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load lessons.",
    });
  }
});


/* =========================================================
   GET ATTENDANCE
   ========================================================= */

router.get("/attendance", async (req, res) => {
  try {
    const reference = clean(
      req.query.reference
    );

    const result = await pool.query(
      `
      SELECT
        a.*,

        lc.title AS live_class_title,
        lc.subjects AS live_class_subjects,
        lc.actual_start,
        lc.actual_end

      FROM academy_attendance a

      LEFT JOIN academy_live_classes lc
        ON lc.id = a.live_class_id

      WHERE LOWER(TRIM(a.tutor_reference)) =
            LOWER(TRIM($1))

      ORDER BY a.created_at DESC
      `,
      [reference]
    );

    return res.json({
      success: true,
      attendance: result.rows,
    });
  } catch (error) {
    console.error(
      "GET ATTENDANCE error:",
      getDatabaseError(error)
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load attendance.",
    });
  }
});


/* =========================================================
   GET LIVE CLASS ATTENDANCE
   ========================================================= */

router.get(
  "/live-classes/:id/attendance",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          a.*,

          CASE
            WHEN a.duration_seconds >= 1800
            THEN 'present'

            WHEN a.duration_seconds > 0
            THEN 'partial'

            ELSE 'absent'
          END AS calculated_status

        FROM academy_attendance a

        WHERE a.live_class_id = $1

        ORDER BY a.joined_at ASC
        `,
        [id]
      );

      const present =
        result.rows.filter(
          (item) =>
            item.calculated_status ===
            "present"
        );

      const partial =
        result.rows.filter(
          (item) =>
            item.calculated_status ===
            "partial"
        );

      return res.json({
        success: true,

        totalStudents:
          result.rows.length,

        presentStudents:
          present.length,

        partialStudents:
          partial.length,

        attendance:
          result.rows,
      });
    } catch (error) {
      console.error(
        "LIVE ATTENDANCE error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load live attendance.",
      });
    }
  }
);


/* =========================================================
   CHAT
   ========================================================= */

router.get(
  "/live-classes/:id/chat",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT *
        FROM academy_live_chat
        WHERE live_class_id = $1
        ORDER BY created_at ASC
        `,
        [id]
      );

      return res.json({
        success: true,
        messages: result.rows,
      });
    } catch (error) {
      console.error(
        "GET CHAT error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load classroom chat.",
      });
    }
  }
);


router.post(
  "/live-classes/:id/chat",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        senderId = null,
        senderName,
        senderRole,
        message,
      } = req.body;

      if (
        !senderName ||
        !senderRole ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Sender and message are required.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO academy_live_chat (
          live_class_id,
          sender_id,
          sender_name,
          sender_role,
          message
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
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
        message: result.rows[0],
      });
    } catch (error) {
      console.error(
        "POST CHAT error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send classroom message.",
      });
    }
  }
);


/* =========================================================
   CREATE MATERIAL
   ========================================================= */

router.post(
  "/materials",
  async (req, res) => {
    try {
      const {
        reference,
        liveClassId = null,
        grade,
        subject,
        title,
        description = "",
        materialType,
        fileUrl = null,
        fileName = null,
        fileSize = null,
      } = req.body;

      if (
        !reference ||
        !grade ||
        !subject ||
        !title ||
        !materialType
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Reference, class, subject, title and material type are required.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO academy_materials (
          tutor_reference,
          live_class_id,
          grade,
          subject,
          title,
          description,
          material_type,
          file_url,
          file_name,
          file_size
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
        RETURNING *
        `,
        [
          reference,
          liveClassId,
          grade,
          subject,
          title,
          description,
          materialType,
          fileUrl,
          fileName,
          fileSize,
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Teaching material created.",
        material: result.rows[0],
      });
    } catch (error) {
      console.error(
        "CREATE MATERIAL error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create material.",
      });
    }
  }
);


/* =========================================================
   GET MATERIALS
   ========================================================= */

router.get(
  "/materials",
  async (req, res) => {
    try {
      const reference = clean(
        req.query.reference
      );

      const result = await pool.query(
        `
        SELECT *
        FROM academy_materials
        WHERE LOWER(TRIM(tutor_reference)) =
              LOWER(TRIM($1))
        ORDER BY created_at DESC
        `,
        [reference]
      );

      return res.json({
        success: true,
        materials: result.rows,
      });
    } catch (error) {
      console.error(
        "GET MATERIALS error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load materials.",
      });
    }
  }
);


/* =========================================================
   RECORDING
   ========================================================= */

router.post(
  "/live-classes/:id/recording",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        reference,
        title,
        recordingUrl,
        thumbnailUrl = null,
        durationSeconds = 0,
        fileSize = null,
      } = req.body;

      if (
        !reference ||
        !title ||
        !recordingUrl
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Reference, title and recording URL are required.",
        });
      }

      const classResult = await pool.query(
        `
        SELECT *
        FROM academy_live_classes
        WHERE id = $1
        AND LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($2))
        LIMIT 1
        `,
        [id, reference]
      );

      if (!classResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Live class was not found.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO academy_live_recordings (
          live_class_id,
          tutor_reference,
          title,
          recording_url,
          thumbnail_url,
          duration_seconds,
          file_size,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          'ready'
        )
        RETURNING *
        `,
        [
          id,
          reference,
          title,
          recordingUrl,
          thumbnailUrl,
          durationSeconds,
          fileSize,
        ]
      );

      await pool.query(
        `
        UPDATE academy_live_classes
        SET
          recording_status = 'ready',
          recording_url = $1,
          duration_seconds = $2
        WHERE id = $3
        `,
        [
          recordingUrl,
          durationSeconds,
          id,
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Live class recording saved.",
        recording: result.rows[0],
      });
    } catch (error) {
      console.error(
        "SAVE RECORDING error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to save recording.",
      });
    }
  }
);


/* =========================================================
   WHITEBOARD EVENTS
   ========================================================= */

router.get(
  "/live-classes/:id/whiteboard",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT *
        FROM academy_live_whiteboard_events
        WHERE live_class_id = $1
        ORDER BY created_at ASC
        `,
        [id]
      );

      return res.json({
        success: true,
        events: result.rows,
      });
    } catch (error) {
      console.error(
        "GET WHITEBOARD error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load whiteboard.",
      });
    }
  }
);


router.post(
  "/live-classes/:id/whiteboard",
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        eventType,
        payload = {},
      } = req.body;

      if (!eventType) {
        return res.status(400).json({
          success: false,
          message:
            "Whiteboard event type is required.",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO academy_live_whiteboard_events (
          live_class_id,
          event_type,
          payload
        )
        VALUES (
          $1,
          $2,
          $3::jsonb
        )
        RETURNING *
        `,
        [
          id,
          eventType,
          JSON.stringify(payload),
        ]
      );

      return res.status(201).json({
        success: true,
        event: result.rows[0],
      });
    } catch (error) {
      console.error(
        "WHITEBOARD EVENT error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to save whiteboard event.",
      });
    }
  }
);


export default router;