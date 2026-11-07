
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   CONFIGURATION
========================================================= */

const MAX_QUESTIONS_PER_SUBJECT = 100;
const MAX_EXAM_DURATION = 600;
const DEFAULT_EXAM_DURATION = 60;
const LAGOS_TIME_ZONE = "Africa/Lagos";

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const normalizeSubject = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const normalizeClass = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeAnswer = (value) =>
  clean(value).toLowerCase().replace(/\s+/g, " ");

const parseArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const parseObject = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
};

const uniqueSubjects = (subjects) => {
  const seen = new Set();

  return subjects
    .map((subject) => {
      if (subject && typeof subject === "object") {
        return clean(
          subject.name ||
          subject.subject ||
          subject.title
        );
      }

      return clean(subject);
    })
    .filter(Boolean)
    .filter((subject) => {
      const normalized = normalizeSubject(subject);

      if (!normalized || seen.has(normalized)) return false;

      seen.add(normalized);
      return true;
    });
};

const getJwtSecret = () =>
  clean(
    process.env.JWT_SECRET ||
    process.env.ACADEMY_JWT_SECRET ||
    process.env.AUTH_SECRET
  );

const getToken = (req) => {
  const authorization = clean(req.headers.authorization);

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
};

const asyncHandler = (handler) =>
  async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };

const getCorrectAnswer = (question) =>
  clean(
    question.correct_answer ||
    question.answer ||
    question.correctAnswer
  );

const getAttemptQuestionIds = (attempt) =>
  parseArray(attempt.question_ids).map(String);

const getAttemptAnswers = (attempt) =>
  parseObject(attempt.answers);

const getStudentClass = (student) => {
  const enrollment = student.enrollment || {};
  const user = student.user || {};

  return clean(
    enrollment.class_name ||
    enrollment.class ||
    enrollment.grade ||
    enrollment.level ||
    enrollment.student_class ||
    user.class_name ||
    user.class ||
    user.grade ||
    user.level
  );
};

const getAvailability = (startAt, endAt) => {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "upcoming";
  }

  if (now > end) return "closed";
  if (now < start) return "upcoming";

  return "available";
};

/* =========================================================
   QUESTION OPTION HELPERS
========================================================= */

const isOptionKey = (value) => {
  const normalized = clean(value).toUpperCase();
  return /^[A-Z]$/.test(normalized);
};

const getOptionText = (option, fallbackKey = "") => {
  if (typeof option === "string" || typeof option === "number") {
    return clean(option);
  }

  if (!option || typeof option !== "object") {
    return "";
  }

  const candidates = [
    option.text,
    option.content,
    option.option_text,
    option.answer,
    option.description,
    option.option,
    option.label,
    option.value,
  ];

  for (const candidate of candidates) {
    const value = clean(candidate);

    if (!value) continue;

    if (
      isOptionKey(value) &&
      normalizeAnswer(value) === normalizeAnswer(fallbackKey)
    ) {
      continue;
    }

    if (
      isOptionKey(value) &&
      candidates.some((item) => {
        const other = clean(item);

        return (
          other &&
          !isOptionKey(other) &&
          normalizeAnswer(other) !== normalizeAnswer(fallbackKey)
        );
      })
    ) {
      continue;
    }

    return value;
  }

  return "";
};

const normalizeQuestionOption = (option, index, forcedKey = "") => {
  const generatedKey = String.fromCharCode(65 + index);

  if (typeof option === "string" || typeof option === "number") {
    return {
      value: clean(forcedKey) || generatedKey,
      label: clean(option),
    };
  }

  if (!option || typeof option !== "object") {
    return null;
  }

  const explicitValue = clean(
    option.value ||
    option.key ||
    option.letter ||
    option.option_key ||
    option.optionKey
  );

  const explicitLabel = clean(option.label);
  const optionField = clean(option.option);

  let answerKey =
    clean(forcedKey) ||
    (isOptionKey(explicitValue) ? explicitValue : "") ||
    (isOptionKey(explicitLabel) ? explicitLabel : "") ||
    (isOptionKey(optionField) ? optionField : "") ||
    generatedKey;

  answerKey = answerKey.toUpperCase();

  let answerText = "";

  const textCandidates = [
    option.text,
    option.content,
    option.option_text,
    option.optionText,
    option.answer,
    option.description,
    option.option,
    option.label,
    option.value,
  ];

  for (const candidate of textCandidates) {
    const value = clean(candidate);

    if (!value) continue;

    if (isOptionKey(value) && value.toUpperCase() === answerKey) {
      continue;
    }

    answerText = value;
    break;
  }

  if (!answerText && explicitLabel && !isOptionKey(explicitLabel)) {
    answerText = explicitLabel;
  }

  if (!answerText && explicitValue && !isOptionKey(explicitValue)) {
    answerText = explicitValue;
  }

  return {
    value: answerKey,
    label: answerText,
  };
};

const parseQuestionOptions = (question) => {
  let raw = question.options;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((option, index) =>
        normalizeQuestionOption(option, index)
      )
      .filter((option) => option && option.label);
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const entries = Object.entries(raw);

    if (entries.length) {
      return entries
        .map(([key, option], index) =>
          normalizeQuestionOption(option, index, key)
        )
        .filter((option) => option && option.label);
    }
  }

  const fallbackOptions = [
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ];

  return fallbackOptions
    .map((option, index) => ({
      value: String.fromCharCode(65 + index),
      label: clean(option),
    }))
    .filter((option) => option.label);
};

/* =========================================================
   ANSWER MARKING
========================================================= */

const isCorrectAnswer = (question, submittedAnswer) => {
  const submitted = normalizeAnswer(submittedAnswer);
  const correct = normalizeAnswer(getCorrectAnswer(question));

  if (!submitted || !correct) return false;

  if (submitted === correct) {
    return true;
  }

  const options = parseQuestionOptions(question);

  const correctOption = options.find((option) =>
    normalizeAnswer(option.value) === correct ||
    normalizeAnswer(option.label) === correct
  );

  if (!correctOption) return false;

  return (
    submitted === normalizeAnswer(correctOption.value) ||
    submitted === normalizeAnswer(correctOption.label)
  );
};

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

let initializationPromise = null;

const initializeCBTDatabase = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_exam_attempts (
        id UUID PRIMARY KEY,

        exam_id BIGINT NOT NULL
          REFERENCES school_exams(id)
          ON DELETE CASCADE,

        student_id TEXT NOT NULL,
        enrollment_id TEXT NOT NULL,

        student_name TEXT DEFAULT '',
        student_email TEXT DEFAULT '',
        student_class TEXT DEFAULT '',

        subject TEXT NOT NULL,

        question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        answers JSONB NOT NULL DEFAULT '{}'::jsonb,

        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        submitted_at TIMESTAMPTZ,

        duration_seconds INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER NOT NULL DEFAULT 0,
        correct_answers INTEGER NOT NULL DEFAULT 0,
        incorrect_answers INTEGER NOT NULL DEFAULT 0,
        unanswered INTEGER NOT NULL DEFAULT 0,

        total_marks NUMERIC(10,2) NOT NULL DEFAULT 0,
        obtained_marks NUMERIC(10,2) NOT NULL DEFAULT 0,
        score NUMERIC(6,2) NOT NULL DEFAULT 0,

        status TEXT NOT NULL DEFAULT 'in_progress'
          CHECK (
            status IN (
              'in_progress',
              'submitted',
              'expired'
            )
          ),

        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_exam_schedule (
        id SMALLINT PRIMARY KEY DEFAULT 1
          CHECK (id = 1),

        start_at TIMESTAMPTZ,
        end_at TIMESTAMPTZ,

        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by TEXT
      )
    `);

    await pool.query(`
      INSERT INTO school_exam_schedule (id)
      VALUES (1)
      ON CONFLICT (id) DO NOTHING
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exam_attempts_student
      ON school_exam_attempts(student_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exam_attempts_enrollment
      ON school_exam_attempts(enrollment_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exam_attempts_exam
      ON school_exam_attempts(exam_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exam_questions_exam
      ON school_exam_questions(exam_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_school_exams_class_subject
      ON school_exams(class_name, subject)
    `);

    console.log("SCHOOL EXAMINATION DATABASE READY");
  })().catch((error) => {
    initializationPromise = null;
    throw error;
  });

  return initializationPromise;
};

/* =========================================================
   STUDENT AUTHENTICATION
========================================================= */

const authenticateStudent = async (req, res, next) => {
  try {
    const token = getToken(req);
    const secret = getJwtSecret();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Student authentication token is required.",
      });
    }

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Authentication configuration is missing.",
      });
    }

    const decoded = jwt.verify(token, secret);

    const userType = clean(
      decoded.userType ||
      decoded.type ||
      decoded.role
    ).toLowerCase();

    if (
      userType &&
      !["student", "academy_student"].includes(userType)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only authenticated students can access examinations.",
      });
    }

    const userId = clean(
      decoded.id ||
      decoded.userId ||
      decoded.user_id ||
      decoded.sub
    );

    const email = clean(decoded.email).toLowerCase();

    if (!userId && !email) {
      return res.status(401).json({
        success: false,
        message: "Invalid student session.",
      });
    }

    let userResult;

    if (userId && email) {
      userResult = await pool.query(
        `
          SELECT *
          FROM academy_users
          WHERE id::text = $1
             OR LOWER(email) = $2
          LIMIT 1
        `,
        [userId, email]
      );
    } else if (userId) {
      userResult = await pool.query(
        `
          SELECT *
          FROM academy_users
          WHERE id::text = $1
          LIMIT 1
        `,
        [userId]
      );
    } else {
      userResult = await pool.query(
        `
          SELECT *
          FROM academy_users
          WHERE LOWER(email) = $1
          LIMIT 1
        `,
        [email]
      );
    }

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Student account was not found.",
      });
    }

    const actualType = clean(
      user.user_type ||
      user.userType ||
      user.type ||
      user.role
    ).toLowerCase();

    if (
      actualType &&
      !["student", "academy_student"].includes(actualType)
    ) {
      return res.status(403).json({
        success: false,
        message: "This account is not a student account.",
      });
    }

    const accountStatus = clean(
      user.account_status ||
      user.status
    ).toLowerCase();

    if (
      ["disabled", "suspended", "blocked", "rejected"].includes(
        accountStatus
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Your student account is not active.",
      });
    }

    const studentEmail = clean(
      user.email || email
    ).toLowerCase();

    const enrollmentId = clean(
      user.student_enrollment_id ||
      user.enrollment_id ||
      decoded.enrollment_id ||
      decoded.enrollmentId
    );

    let enrollmentResult;

    if (enrollmentId && studentEmail) {
      enrollmentResult = await pool.query(
        `
          SELECT *
          FROM academy_student_enrollments
          WHERE enrollment_id::text = $1
             OR LOWER(email) = $2
          ORDER BY
            CASE
              WHEN enrollment_id::text = $1 THEN 0
              ELSE 1
            END
          LIMIT 1
        `,
        [enrollmentId, studentEmail]
      );
    } else if (enrollmentId) {
      enrollmentResult = await pool.query(
        `
          SELECT *
          FROM academy_student_enrollments
          WHERE enrollment_id::text = $1
          LIMIT 1
        `,
        [enrollmentId]
      );
    } else {
      enrollmentResult = await pool.query(
        `
          SELECT *
          FROM academy_student_enrollments
          WHERE LOWER(email) = $1
          LIMIT 1
        `,
        [studentEmail]
      );
    }

    const enrollment = enrollmentResult?.rows?.[0];

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Your student enrollment could not be found.",
      });
    }

    const enrollmentStatus = clean(
      enrollment.status ||
      enrollment.enrollment_status
    ).toLowerCase();

    if (
      ["rejected", "cancelled", "disabled", "suspended"].includes(
        enrollmentStatus
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Your enrollment is not active.",
      });
    }

    const registeredSubjects = uniqueSubjects([
      ...parseArray(enrollment.subjects),
      ...parseArray(enrollment.registered_subjects),
      ...parseArray(enrollment.course_subjects),
      ...parseArray(enrollment.selected_subjects),
      ...parseArray(enrollment.subjects_registered),
      enrollment.subject,
    ]);

    if (!registeredSubjects.length) {
      return res.status(403).json({
        success: false,
        message: "No registered subjects were found for this student.",
      });
    }

    const student = {
      id: clean(user.id),
      email: studentEmail,

      name: clean(
        user.full_name ||
        user.name ||
        user.student_name ||
        [
          user.first_name,
          user.last_name,
        ].filter(Boolean).join(" ")
      ),

      enrollmentId: clean(enrollment.enrollment_id),

      enrollment,
      user,
      subjects: registeredSubjects,
    };

    student.className = getStudentClass(student);

    if (!student.className) {
      return res.status(403).json({
        success: false,
        message: "Your enrolled class could not be identified.",
      });
    }

    req.cbtStudent = student;

    next();
  } catch (error) {
    console.error("SCHOOL EXAM STUDENT AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Your student session is invalid or expired.",
    });
  }
};

/* =========================================================
   GENERAL SCHOOL EXAMINATION SCHEDULE
========================================================= */

const getSchoolExamSchedule = async () => {
  const result = await pool.query(`
    SELECT
      id,
      start_at,
      end_at,
      updated_at
    FROM school_exam_schedule
    WHERE id = 1
    LIMIT 1
  `);

  return result.rows[0] || null;
};

const getEffectiveSchedule = (exam, schedule) => ({
  startAt:
    schedule?.start_at ||
    exam.scheduled_start_at ||
    null,

  endAt:
    schedule?.end_at ||
    exam.scheduled_end_at ||
    null,
});

/* =========================================================
   STUDENT EXAM ELIGIBILITY
========================================================= */

const getExamForStudent = async (examId, student) => {
  const result = await pool.query(
    `
      SELECT
        e.*,
        COUNT(q.id)::INTEGER AS question_count

      FROM school_exams e

      LEFT JOIN school_exam_questions q
        ON q.exam_id = e.id

      WHERE e.id = $1
        AND LOWER(e.exam_type) = LOWER('School Examination')
        AND LOWER(e.status) = 'published'

      GROUP BY e.id

      LIMIT 1
    `,
    [examId]
  );

  const exam = result.rows[0];

  if (!exam) return null;

  if (
    normalizeClass(exam.class_name) !==
    normalizeClass(student.className)
  ) {
    return null;
  }

  const eligible = student.subjects.some(
    (subject) =>
      normalizeSubject(subject) ===
      normalizeSubject(exam.subject)
  );

  if (!eligible) return null;

  const schedule = await getSchoolExamSchedule();

  const effectiveSchedule = getEffectiveSchedule(
    exam,
    schedule
  );

  if (!effectiveSchedule.startAt || !effectiveSchedule.endAt) {
    return null;
  }

  return {
    ...exam,
    scheduleStart: effectiveSchedule.startAt,
    scheduleEnd: effectiveSchedule.endAt,
    availability: getAvailability(
      effectiveSchedule.startAt,
      effectiveSchedule.endAt
    ),
  };
};

/* =========================================================
   QUESTION SANITIZATION
========================================================= */

const sanitizeQuestion = (question) => ({
  id: String(question.id),

  subject: question.subject,

  question:
    question.question_text ||
    question.question ||
    "",

  question_type:
    question.question_type ||
    "objective",

  options: parseQuestionOptions(question),

  image:
    question.image_url ||
    question.image ||
    null,

  passage_id:
    question.passage_id || null,

  passage_title:
    question.passage_title || null,

  passage:
    question.passage || null,

  passage_order:
    question.passage_order ?? null,

  marks:
    Number(question.marks) || 1,
});

const getQuestionsForAttempt = async (questionIds) => {
  if (!questionIds.length) return [];

  const result = await pool.query(
    `
      SELECT
        id,
        exam_id,
        question_order,
        question_type,
        question_text,
        options,
        image_url,
        passage_id,
        passage_title,
        passage,
        passage_order,
        marks

      FROM school_exam_questions

      WHERE id::text = ANY($1::text[])

      ORDER BY
        array_position(
          $1::text[],
          id::text
        ),
        question_order ASC
    `,
    [questionIds]
  );

  return result.rows;
};

/* =========================================================
   GET STUDENT SCHOOL EXAMINATIONS

   GET /student/cbt/exams

   Includes each student's latest attempt so the frontend
   can identify subjects that have already been submitted.
========================================================= */

router.get(
  "/student/cbt/exams",
  authenticateStudent,
  asyncHandler(async (req, res) => {
    await initializeCBTDatabase();

    const student = req.cbtStudent;
    const schedule = await getSchoolExamSchedule();

    const result = await pool.query(
      `
        SELECT
          e.*,

          COUNT(q.id)::INTEGER AS question_count,

          latest_attempt.id AS attempt_id,
          latest_attempt.status AS attempt_status,
          latest_attempt.submitted_at AS submitted_at,
          latest_attempt.started_at AS attempt_started_at,
          latest_attempt.expires_at AS attempt_expires_at,
          latest_attempt.score AS attempt_score,

          CASE
            WHEN latest_attempt.submitted_at IS NOT NULL
              OR latest_attempt.status IN ('submitted', 'expired')
            THEN TRUE
            ELSE FALSE
          END AS submitted

        FROM school_exams e

        LEFT JOIN school_exam_questions q
          ON q.exam_id = e.id

        LEFT JOIN LATERAL (
          SELECT
            a.id,
            a.status,
            a.submitted_at,
            a.started_at,
            a.expires_at,
            a.score

          FROM school_exam_attempts a

          WHERE a.exam_id = e.id
            AND a.student_id = $1
            AND a.enrollment_id = $2

          ORDER BY a.created_at DESC

          LIMIT 1
        ) latest_attempt ON TRUE

        WHERE LOWER(e.exam_type) = LOWER('School Examination')
          AND LOWER(e.status) = 'published'

        GROUP BY
          e.id,
          latest_attempt.id,
          latest_attempt.status,
          latest_attempt.submitted_at,
          latest_attempt.started_at,
          latest_attempt.expires_at,
          latest_attempt.score

        ORDER BY e.subject ASC, e.created_at DESC
      `,
      [student.id, student.enrollmentId]
    );

    const exams = result.rows
      .filter((exam) =>
        normalizeClass(exam.class_name) ===
        normalizeClass(student.className)
      )
      .filter((exam) =>
        student.subjects.some(
          (subject) =>
            normalizeSubject(subject) ===
            normalizeSubject(exam.subject)
        )
      )
      .map((exam) => {
        const effectiveSchedule = getEffectiveSchedule(
          exam,
          schedule
        );

        const startAt = effectiveSchedule.startAt;
        const endAt = effectiveSchedule.endAt;

        const availability =
          startAt && endAt
            ? getAvailability(startAt, endAt)
            : "upcoming";

        const submitted =
          Boolean(exam.submitted) ||
          Boolean(exam.submitted_at) ||
          ["submitted", "expired"].includes(
            clean(exam.attempt_status).toLowerCase()
          );

        const latestAttempt = exam.attempt_id
          ? {
              id: exam.attempt_id,
              attemptId: exam.attempt_id,
              status: exam.attempt_status,
              submittedAt: exam.submitted_at,
              submitted_at: exam.submitted_at,
              startedAt: exam.attempt_started_at,
              expiresAt: exam.attempt_expires_at,
              score: Number(exam.attempt_score) || 0,
            }
          : null;

        return {
          id: exam.id,

          title: exam.title,

          examType: exam.exam_type,

          subject: exam.subject,

          className: exam.class_name,

          description: exam.instructions || "",

          instructions: exam.instructions || "",

          durationMinutes:
            Number(exam.duration_minutes) ||
            DEFAULT_EXAM_DURATION,

          totalQuestions: Number(exam.question_count) || 0,

          questionCount: Number(exam.question_count) || 0,

          startAt,
          endAt,

          scheduled_start_at: startAt,
          scheduled_end_at: endAt,

          availability,

          status: exam.status,

          // Submission information.
          submitted,
          isSubmitted: submitted,

          submittedAt: exam.submitted_at || null,
          submitted_at: exam.submitted_at || null,

          attemptId: exam.attempt_id || null,
          attemptStatus: exam.attempt_status || null,

          latestAttempt,
          latest_attempt: latestAttempt,
        };
      });

    return res.json({
      success: true,

      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        className: student.className,
        subjects: student.subjects,
      },

      registeredSubjects: student.subjects,
      enrolledSubjects: student.subjects,

      examInfo: {
        startAt: schedule?.start_at || null,
        endAt: schedule?.end_at || null,

        scheduled_start_at: schedule?.start_at || null,
        scheduled_end_at: schedule?.end_at || null,

        updatedAt: schedule?.updated_at || null,
      },

      schedule: {
        start_at: schedule?.start_at || null,
        end_at: schedule?.end_at || null,
        updated_at: schedule?.updated_at || null,
      },

      exams,
    });
  })
);

/* =========================================================
   GET SCHOOL EXAMINATION DETAILS

   GET /student/cbt/exams/:examId
========================================================= */

router.get(
  "/student/cbt/exams/:examId",
  authenticateStudent,
  asyncHandler(async (req, res) => {
    await initializeCBTDatabase();

    const exam = await getExamForStudent(
      req.params.examId,
      req.cbtStudent
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message:
          "School Examination not found for your class or registered subjects.",
      });
    }

    res.json({
      success: true,

      exam: {
        id: exam.id,

        title: exam.title,

        examType: exam.exam_type,

        subject: exam.subject,

        className: exam.class_name,

        description: exam.instructions || "",

        instructions: exam.instructions || "",

        durationMinutes:
          Number(exam.duration_minutes) ||
          DEFAULT_EXAM_DURATION,

        totalQuestions: Number(exam.question_count) || 0,

        questionCount: Number(exam.question_count) || 0,

        startAt: exam.scheduleStart,

        endAt: exam.scheduleEnd,

        scheduled_start_at: exam.scheduleStart,

        scheduled_end_at: exam.scheduleEnd,

        availability: exam.availability,
      },
    });
  })
);

/* =========================================================
   START OR RESUME SCHOOL EXAMINATION

   POST /student/cbt/exams/:examId/start

   Completed attempts are checked BEFORE schedule checks.
========================================================= */

router.post(
  "/student/cbt/exams/:examId/start",
  authenticateStudent,
  asyncHandler(async (req, res) => {
    await initializeCBTDatabase();

    const student = req.cbtStudent;

    const exam = await getExamForStudent(
      req.params.examId,
      student
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message:
          "School Examination not found for your class or registered subjects.",
      });
    }

    const now = new Date();

    /*
      IMPORTANT:
      Check for a completed attempt before checking the schedule.
      This ensures a previously submitted exam is still identified
      as submitted even when the examination period has closed.
    */

    const existingResult = await pool.query(
      `
        SELECT *
        FROM school_exam_attempts

        WHERE exam_id = $1
          AND student_id = $2
          AND enrollment_id = $3

        ORDER BY created_at DESC

        LIMIT 1
      `,
      [
        exam.id,
        student.id,
        student.enrollmentId,
      ]
    );

    const existingAttempt = existingResult.rows[0];

    if (
      existingAttempt &&
      (
        existingAttempt.submitted_at ||
        ["submitted", "expired"].includes(existingAttempt.status)
      )
    ) {
      return res.status(409).json({
        success: false,

        code: "ATTEMPT_ALREADY_COMPLETED",

        message: "You have already completed this examination.",

        result: {
          attemptId: existingAttempt.id,

          submittedAt: existingAttempt.submitted_at,

          score: Number(existingAttempt.score),

          status: existingAttempt.status,
        },
      });
    }

    const startAt = new Date(exam.scheduleStart);
    const endAt = new Date(exam.scheduleEnd);

    if (now < startAt) {
      return res.status(403).json({
        success: false,

        code: "EXAM_NOT_STARTED",

        message: "The School Examination has not started yet.",

        startAt: exam.scheduleStart,
      });
    }

    if (now > endAt) {
      return res.status(403).json({
        success: false,

        code: "EXAM_CLOSED",

        message: "The School Examination period has ended.",

        endAt: exam.scheduleEnd,
      });
    }

    /*
      Resume an existing in-progress attempt.
    */

    if (existingAttempt) {
      if (now >= new Date(existingAttempt.expires_at)) {
        return res.status(403).json({
          success: false,

          code: "ATTEMPT_EXPIRED",

          message: "Your examination time has expired.",
        });
      }

      const questionIds = getAttemptQuestionIds(
        existingAttempt
      );

      const questions = await getQuestionsForAttempt(
        questionIds
      );

      const safeQuestions = questions.map(sanitizeQuestion);

      return res.json({
        success: true,

        resumed: true,

        attempt: {
          id: existingAttempt.id,

          startedAt: existingAttempt.started_at,

          expiresAt: existingAttempt.expires_at,

          durationMinutes:
            Number(exam.duration_minutes) ||
            DEFAULT_EXAM_DURATION,

          answers: getAttemptAnswers(existingAttempt),
        },

        exam: {
          id: exam.id,

          title: exam.title,

          subject: exam.subject,

          className: exam.class_name,

          instructions: exam.instructions || "",

          questions: safeQuestions,
        },

        questions: safeQuestions,
      });
    }

    /*
      Create a new attempt.
    */

    const questionResult = await pool.query(
      `
        SELECT
          id,
          exam_id,
          question_order,
          question_type,
          question_text,
          options,
          image_url,
          passage_id,
          passage_title,
          passage,
          passage_order,
          marks

        FROM school_exam_questions

        WHERE exam_id = $1

        ORDER BY
          question_order ASC,
          id ASC

        LIMIT $2
      `,
      [
        exam.id,
        MAX_QUESTIONS_PER_SUBJECT,
      ]
    );

    const selectedQuestions = questionResult.rows;

    if (!selectedQuestions.length) {
      return res.status(404).json({
        success: false,

        code: "NO_QUESTIONS",

        message:
          "No questions have been uploaded for this examination yet.",
      });
    }

    const questionIds = selectedQuestions.map(
      (question) => String(question.id)
    );

    const durationMinutes = Math.min(
      Math.max(
        Number(exam.duration_minutes) ||
        DEFAULT_EXAM_DURATION,
        1
      ),
      MAX_EXAM_DURATION
    );

    const calculatedExpiry = new Date(
      now.getTime() + durationMinutes * 60 * 1000
    );

    const expiresAt =
      calculatedExpiry < endAt
        ? calculatedExpiry
        : endAt;

    const attemptId = crypto.randomUUID();

    const insertResult = await pool.query(
      `
        INSERT INTO school_exam_attempts (
          id,
          exam_id,
          student_id,
          enrollment_id,
          student_name,
          student_email,
          student_class,
          subject,
          question_ids,
          answers,
          started_at,
          expires_at,
          total_questions,
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
          $8,
          $9::jsonb,
          '{}'::jsonb,
          $10,
          $11,
          $12,
          'in_progress'
        )

        RETURNING *
      `,
      [
        attemptId,

        exam.id,

        student.id,

        student.enrollmentId,

        student.name,

        student.email,

        student.className,

        exam.subject,

        JSON.stringify(questionIds),

        now,

        expiresAt,

        selectedQuestions.length,
      ]
    );

    const attempt = insertResult.rows[0];

    const safeQuestions = selectedQuestions.map(
      sanitizeQuestion
    );

    res.status(201).json({
      success: true,

      resumed: false,

      attempt: {
        id: attempt.id,

        startedAt: attempt.started_at,

        expiresAt: attempt.expires_at,

        durationMinutes,

        answers: {},
      },

      exam: {
        id: exam.id,

        title: exam.title,

        subject: exam.subject,

        className: exam.class_name,

        instructions: exam.instructions || "",

        questions: safeQuestions,
      },

      questions: safeQuestions,
    });
  })
);

/* =========================================================
   SAVE SCHOOL EXAMINATION ANSWERS

   PUT /student/cbt/attempts/:attemptId/answers
========================================================= */

router.put(
  "/student/cbt/attempts/:attemptId/answers",
  authenticateStudent,
  asyncHandler(async (req, res) => {
    await initializeCBTDatabase();

    const student = req.cbtStudent;
    const answers = req.body?.answers;

    if (
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid answers object is required.",
      });
    }

    const attemptResult = await pool.query(
      `
        SELECT *
        FROM school_exam_attempts

        WHERE id = $1
          AND student_id = $2
          AND enrollment_id = $3

        LIMIT 1
      `,
      [
        req.params.attemptId,
        student.id,
        student.enrollmentId,
      ]
    );

    const attempt = attemptResult.rows[0];

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "School Examination attempt not found.",
      });
    }

    if (attempt.status !== "in_progress") {
      return res.status(409).json({
        success: false,
        message: "This examination has already been submitted.",
      });
    }

    if (Date.now() >= new Date(attempt.expires_at).getTime()) {
      return res.status(403).json({
        success: false,

        code: "ATTEMPT_EXPIRED",

        message: "Your examination time has expired.",
      });
    }

    const allowedQuestionIds = new Set(
      getAttemptQuestionIds(attempt)
    );

    const sanitizedAnswers = {};

    for (const [questionId, answer] of Object.entries(answers)) {
      if (!allowedQuestionIds.has(String(questionId))) {
        continue;
      }

      if (
        typeof answer !== "string" &&
        typeof answer !== "number"
      ) {
        continue;
      }

      const value = clean(answer);

      if (value) {
        sanitizedAnswers[String(questionId)] = value;
      }
    }

    const previousAnswers = getAttemptAnswers(attempt);

    const mergedAnswers = {
      ...previousAnswers,
      ...sanitizedAnswers,
    };

    await pool.query(
      `
        UPDATE school_exam_attempts

        SET
          answers = $1::jsonb,
          updated_at = NOW()

        WHERE id = $2
          AND student_id = $3
          AND status = 'in_progress'
      `,
      [
        JSON.stringify(mergedAnswers),
        attempt.id,
        student.id,
      ]
    );

    res.json({
      success: true,

      message: "Examination answers saved.",

      savedAnswers: Object.keys(mergedAnswers).length,

      expiresAt: attempt.expires_at,
    });
  })
);

/* =========================================================
   SUBMIT SCHOOL EXAMINATION

   POST /student/cbt/attempts/:attemptId/submit
========================================================= */

router.post(
  "/student/cbt/attempts/:attemptId/submit",
  authenticateStudent,
  asyncHandler(async (req, res) => {
    await initializeCBTDatabase();

    const student = req.cbtStudent;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const attemptResult = await client.query(
        `
          SELECT *
          FROM school_exam_attempts

          WHERE id = $1
            AND student_id = $2
            AND enrollment_id = $3

          FOR UPDATE
        `,
        [
          req.params.attemptId,
          student.id,
          student.enrollmentId,
        ]
      );

      const attempt = attemptResult.rows[0];

      if (!attempt) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "School Examination attempt not found.",
        });
      }

      if (attempt.status !== "in_progress") {
        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          message: "This examination has already been submitted.",
        });
      }

      const questionIds = getAttemptQuestionIds(attempt);
      const previousAnswers = getAttemptAnswers(attempt);
      const incomingAnswers = req.body?.answers;

      const mergedAnswers = {
        ...previousAnswers,
      };

      if (
        incomingAnswers &&
        typeof incomingAnswers === "object" &&
        !Array.isArray(incomingAnswers)
      ) {
        const allowedQuestionIds = new Set(questionIds);

        for (const [questionId, answer] of Object.entries(
          incomingAnswers
        )) {
          if (!allowedQuestionIds.has(String(questionId))) {
            continue;
          }

          if (
            typeof answer !== "string" &&
            typeof answer !== "number"
          ) {
            continue;
          }

          const value = clean(answer);

          if (value) {
            mergedAnswers[String(questionId)] = value;
          }
        }
      }

      const questionResult = await client.query(
        `
          SELECT
            id,
            correct_answer,
            question_type,
            options,
            marks

          FROM school_exam_questions

          WHERE id::text = ANY($1::text[])
            AND exam_id = $2
        `,
        [
          questionIds,
          attempt.exam_id,
        ]
      );

      const questionMap = new Map(
        questionResult.rows.map((question) => [
          String(question.id),
          question,
        ])
      );

      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let unanswered = 0;

      let totalMarks = 0;
      let obtainedMarks = 0;

      for (const questionId of questionIds) {
        const question = questionMap.get(String(questionId));

        if (!question) {
          unanswered++;
          continue;
        }

        const marks = Math.max(
          Number(question.marks) || 1,
          0
        );

        totalMarks += marks;

        const submittedAnswer = clean(
          mergedAnswers[String(questionId)]
        );

        if (!submittedAnswer) {
          unanswered++;
          continue;
        }

        if (isCorrectAnswer(question, submittedAnswer)) {
          correctAnswers++;
          obtainedMarks += marks;
        } else {
          incorrectAnswers++;
        }
      }

      const totalQuestions = questionIds.length;

      const score =
        totalMarks > 0
          ? Number(
              (
                (obtainedMarks / totalMarks) *
                100
              ).toFixed(2)
            )
          : 0;

      const submittedAt = new Date();
      const startedAt = new Date(attempt.started_at);

      const durationSeconds = Math.max(
        0,
        Math.floor(
          (submittedAt.getTime() - startedAt.getTime()) / 1000
        )
      );

      const expired =
        submittedAt >= new Date(attempt.expires_at);

      const status = expired ? "expired" : "submitted";

      await client.query(
        `
          UPDATE school_exam_attempts

          SET
            answers = $1::jsonb,
            submitted_at = $2,
            duration_seconds = $3,
            total_questions = $4,
            correct_answers = $5,
            incorrect_answers = $6,
            unanswered = $7,
            total_marks = $8,
            obtained_marks = $9,
            score = $10,
            status = $11,
            updated_at = NOW()

          WHERE id = $12
        `,
        [
          JSON.stringify(mergedAnswers),
          submittedAt,
          durationSeconds,
          totalQuestions,
          correctAnswers,
          incorrectAnswers,
          unanswered,
          totalMarks,
          obtainedMarks,
          score,
          status,
          attempt.id,
        ]
      );

      await client.query("COMMIT");

      return res.json({
        success: true,

        message: "School Examination submitted successfully.",

        result: {
          attemptId: attempt.id,

          examId: attempt.exam_id,

          subject: attempt.subject,

          totalQuestions,

          correctAnswers,

          incorrectAnswers,

          unanswered,

          totalMarks,

          obtainedMarks,

          score,

          percentage: score,

          status,

          durationSeconds,

          submittedAt,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

/* =========================================================
   GET STUDENT EXAMINATION RESULT

   GET /student/cbt/attempts/:attemptId/result
========================================================= */

router.get(
  "/student/cbt/attempts/:attemptId/result",
  authenticateStudent,
  asyncHandler(async (req, res) => {
    await initializeCBTDatabase();

    const result = await pool.query(
      `
        SELECT
          a.*,

          e.title AS exam_title,

          e.class_name AS exam_class

        FROM school_exam_attempts a

        INNER JOIN school_exams e
          ON e.id = a.exam_id

        WHERE a.id = $1
          AND a.student_id = $2
          AND a.enrollment_id = $3

        LIMIT 1
      `,
      [
        req.params.attemptId,
        req.cbtStudent.id,
        req.cbtStudent.enrollmentId,
      ]
    );

    const attempt = result.rows[0];

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Examination result not found.",
      });
    }

    if (attempt.status === "in_progress") {
      return res.status(403).json({
        success: false,
        message: "Your examination has not been submitted.",
      });
    }

    res.json({
      success: true,

      result: {
        attemptId: attempt.id,

        examId: attempt.exam_id,

        exam: attempt.exam_title,

        student: attempt.student_name,

        className: attempt.exam_class,

        subject: attempt.subject,

        startedAt: attempt.started_at,

        submittedAt: attempt.submitted_at,

        durationSeconds: attempt.duration_seconds,

        totalQuestions: attempt.total_questions,

        correctAnswers: attempt.correct_answers,

        incorrectAnswers: attempt.incorrect_answers,

        unanswered: attempt.unanswered,

        totalMarks: Number(attempt.total_marks),

        obtainedMarks: Number(attempt.obtained_marks),

        score: Number(attempt.score),

        percentage: Number(attempt.score),

        status: attempt.status,
      },
    });
  })
);

/* =========================================================
   GET STUDENT SCHOOL EXAMINATION HISTORY

   GET /student/cbt/results
========================================================= */

router.get(
  "/student/cbt/results",
  authenticateStudent,
  asyncHandler(async (req, res) => {
    await initializeCBTDatabase();

    const result = await pool.query(
      `
        SELECT
          a.id,
          a.exam_id,
          a.subject,
          a.student_class,
          a.started_at,
          a.submitted_at,
          a.total_questions,
          a.correct_answers,
          a.incorrect_answers,
          a.unanswered,
          a.total_marks,
          a.obtained_marks,
          a.score,
          a.status,

          e.title AS exam_title

        FROM school_exam_attempts a

        INNER JOIN school_exams e
          ON e.id = a.exam_id

        WHERE a.student_id = $1
          AND a.enrollment_id = $2

        ORDER BY a.created_at DESC
      `,
      [
        req.cbtStudent.id,
        req.cbtStudent.enrollmentId,
      ]
    );

    res.json({
      success: true,

      count: result.rows.length,

      results: result.rows.map((attempt) => ({
        attemptId: attempt.id,

        examId: attempt.exam_id,

        exam: attempt.exam_title,

        subject: attempt.subject,

        className: attempt.student_class,

        startedAt: attempt.started_at,

        submittedAt: attempt.submitted_at,

        totalQuestions: attempt.total_questions,

        correctAnswers: attempt.correct_answers,

        incorrectAnswers: attempt.incorrect_answers,

        unanswered: attempt.unanswered,

        totalMarks: Number(attempt.total_marks),

        obtainedMarks: Number(attempt.obtained_marks),

        score: Number(attempt.score),

        status: attempt.status,
      })),
    });
  })
);

/* =========================================================
   ROUTER ERROR HANDLER
========================================================= */

router.use((error, req, res, next) => {
  console.error("SCHOOL EXAMINATION ROUTE ERROR:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,

    message:
      "An error occurred while processing your School Examination request.",

    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
  });
});

/* =========================================================
   EXPORTS
========================================================= */

export {
  initializeCBTDatabase,
};

export default router;
