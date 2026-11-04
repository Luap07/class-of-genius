
import express from "express";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const LAGOS_TIME_ZONE = "Africa/Lagos";

let tablesReady = false;
let tablePromise = null;

/* =========================================================
   HELPERS
========================================================= */

const clean = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeClass = (value) =>
  clean(value).toLowerCase().replace(/\s+/g, " ");

const getToken = (req) => {
  const header = clean(req.headers.authorization);

  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  return (
    clean(req.headers["x-academy-token"]) ||
    clean(req.headers["x-student-token"])
  );
};

const sendError = (res, status, message, code = "REQUEST_FAILED") =>
  res.status(status).json({
    success: false,
    code,
    message,
  });

const parseJson = (value, fallback = {}) => {
  if (value === null || value === undefined) return fallback;

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getStudentClass = (student, enrollment) => {
  const fields = [
    enrollment?.class_name,
    enrollment?.class,
    enrollment?.grade,
    enrollment?.student_class,
    enrollment?.level,
    student?.class_name,
    student?.class,
    student?.grade,
    student?.student_class,
    student?.level,
  ];

  return clean(fields.find(Boolean));
};

const getStudentId = (student) =>
  student?.id || student?.user_id || student?.student_id || null;

const getEnrollmentId = (enrollment) =>
  enrollment?.id || enrollment?.enrollment_id || null;

const isCorrectAnswer = (given, correct) => {
  const normalize = (value) =>
    clean(value).toLowerCase().replace(/\s+/g, " ");

  if (Array.isArray(given)) {
    const left = given.map(normalize).sort();
    const right = (Array.isArray(correct) ? correct : [correct])
      .map(normalize)
      .sort();

    return (
      left.length === right.length &&
      left.every((value, index) => value === right[index])
    );
  }

  return normalize(given) === normalize(correct);
};

const getCurrentTime = () => new Date();

/* =========================================================
   DATABASE INITIALIZATION
========================================================= */

async function ensureTables() {
  if (tablesReady) return;

  if (tablePromise) {
    await tablePromise;
    return;
  }

  tablePromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_exam_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        exam_id INTEGER NOT NULL REFERENCES school_exams(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL,
        enrollment_id TEXT,
        student_reference TEXT,
        question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        answers JSONB NOT NULL DEFAULT '{}'::jsonb,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        submitted_at TIMESTAMPTZ,
        score NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_marks NUMERIC(12,2) NOT NULL DEFAULT 0,
        percentage NUMERIC(7,2) NOT NULL DEFAULT 0,
        status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_school_exam_attempts_student
      ON school_exam_attempts(student_id, exam_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_school_exam_attempts_enrollment
      ON school_exam_attempts(enrollment_id, exam_id)
    `);

    await pool.query(`
      ALTER TABLE school_exam_attempts
      ADD COLUMN IF NOT EXISTS student_reference TEXT
    `);

    tablesReady = true;
  })();

  try {
    await tablePromise;
  } finally {
    tablePromise = null;
  }
}

/* =========================================================
   STUDENT AUTHENTICATION
========================================================= */

async function authenticateStudent(req, res, next) {
  try {
    if (!JWT_SECRET) {
      return sendError(
        res,
        500,
        "JWT_SECRET is not configured.",
        "SERVER_CONFIGURATION_ERROR"
      );
    }

    const token = getToken(req);

    if (!token) {
      return sendError(
        res,
        401,
        "Student authentication is required.",
        "STUDENT_AUTH_REQUIRED"
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return sendError(
        res,
        401,
        "Your session has expired. Please log in again.",
        "INVALID_STUDENT_TOKEN"
      );
    }

    const userId =
      decoded.id ||
      decoded.userId ||
      decoded.user_id ||
      decoded.sub;

    if (!userId) {
      return sendError(
        res,
        401,
        "Student account could not be identified.",
        "STUDENT_ID_MISSING"
      );
    }

    const userResult = await pool.query(
      `
        SELECT *
        FROM academy_users
        WHERE id::text = $1
        LIMIT 1
      `,
      [String(userId)]
    );

    if (!userResult.rows.length) {
      return sendError(
        res,
        403,
        "Student account was not found.",
        "STUDENT_NOT_FOUND"
      );
    }

    const student = userResult.rows[0];

    const userType = clean(
      student.user_type || student.userType || decoded.userType
    ).toLowerCase();

    if (userType && userType !== "student") {
      return sendError(
        res,
        403,
        "Only student accounts can access school examinations.",
        "STUDENT_ACCESS_ONLY"
      );
    }

    const enrollmentResult = await pool.query(
      `
        SELECT *
        FROM academy_student_enrollments
        WHERE student_id::text = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [String(userId)]
    );

    if (!enrollmentResult.rows.length) {
      return sendError(
        res,
        403,
        "No student enrollment was found.",
        "ENROLLMENT_NOT_FOUND"
      );
    }

    const enrollment = enrollmentResult.rows[0];
    const studentClass = getStudentClass(student, enrollment);

    if (!studentClass) {
      return sendError(
        res,
        403,
        "Your class is missing from your student enrollment. Please contact the school administrator.",
        "STUDENT_CLASS_MISSING"
      );
    }

    req.schoolStudent = {
      student,
      enrollment,
      studentId: String(getStudentId(student)),
      enrollmentId: String(getEnrollmentId(enrollment)),
      studentReference: clean(
        student.student_reference ||
        student.studentReference ||
        enrollment.student_reference ||
        enrollment.studentReference
      ),
      className: studentClass,
    };

    next();
  } catch (error) {
    console.error("School exam authentication error:", error);

    return sendError(
      res,
      500,
      "Unable to authenticate student.",
      "STUDENT_AUTH_ERROR"
    );
  }
}

/* =========================================================
   EXAM ACCESS HELPERS
========================================================= */

function getExamState(exam) {
  const now = getCurrentTime();

  if (clean(exam.status).toLowerCase() !== "published") {
    return "unpublished";
  }

  if (!exam.scheduled_start_at || !exam.scheduled_end_at) {
    return "unscheduled";
  }

  const start = new Date(exam.scheduled_start_at);
  const end = new Date(exam.scheduled_end_at);

  if (now < start) return "upcoming";
  if (now > end) return "closed";

  return "available";
}

async function findEligibleExam(examId, studentClass) {
  const result = await pool.query(
    `
      SELECT *
      FROM school_exams
      WHERE id::text = $1
      LIMIT 1
    `,
    [String(examId)]
  );

  if (!result.rows.length) return null;

  const exam = result.rows[0];

  if (
    normalizeClass(exam.class_name) !==
    normalizeClass(studentClass)
  ) {
    return null;
  }

  return exam;
}

async function getAttemptForStudent(attemptId, student) {
  const result = await pool.query(
    `
      SELECT *
      FROM school_exam_attempts
      WHERE id::text = $1
        AND student_id = $2
        AND enrollment_id = $3
      LIMIT 1
    `,
    [String(attemptId), student.studentId, student.enrollmentId]
  );

  return result.rows[0] || null;
}

function publicQuestion(question) {
  return {
    id: question.id,
    question_order: question.question_order,
    question_type: question.question_type,
    question_text: question.question_text,
    options: parseJson(question.options, []),
    marks: Number(question.marks || 1),
    image_url: question.image_url,
    passage_id: question.passage_id,
    passage_title: question.passage_title,
    passage: question.passage,
    passage_order: question.passage_order,
  };
}

/* =========================================================
   GET STUDENT SCHOOL EXAMS
   GET /api/school-student-exams
========================================================= */

router.get(
  "/",
  authenticateStudent,
  async (req, res) => {
    try {
      const { className } = req.schoolStudent;

      const result = await pool.query(
        `
          SELECT
            id,
            title,
            exam_type,
            class_name,
            subject,
            duration_minutes,
            instructions,
            status,
            total_questions,
            scheduled_start_at,
            scheduled_end_at,
            created_at
          FROM school_exams
          WHERE LOWER(TRIM(class_name)) = LOWER(TRIM($1))
            AND LOWER(status) = 'published'
          ORDER BY scheduled_start_at ASC NULLS LAST, created_at DESC
        `,
        [className]
      );

      const exams = result.rows.map((exam) => ({
        ...exam,
        state: getExamState(exam),
        duration_minutes: Number(exam.duration_minutes || 0),
        total_questions: Number(exam.total_questions || 0),
      }));

      return res.json({
        success: true,
        student_class: className,
        exams,
        count: exams.length,
      });
    } catch (error) {
      console.error("Load school exams error:", error);

      return sendError(
        res,
        500,
        "Unable to load school examinations.",
        "EXAMS_LOAD_FAILED"
      );
    }
  }
);

/* =========================================================
   GET ONE SCHOOL EXAM
   GET /api/school-student-exams/:examId
========================================================= */

router.get(
  "/:examId",
  authenticateStudent,
  async (req, res) => {
    try {
      const exam = await findEligibleExam(
        req.params.examId,
        req.schoolStudent.className
      );

      if (!exam || clean(exam.status).toLowerCase() !== "published") {
        return sendError(
          res,
          404,
          "This examination is not available for your class.",
          "EXAM_NOT_FOUND"
        );
      }

      const questionsResult = await pool.query(
        `
          SELECT
            id,
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
          ORDER BY question_order ASC, id ASC
        `,
        [exam.id]
      );

      return res.json({
        success: true,
        exam: {
          id: exam.id,
          title: exam.title,
          exam_type: exam.exam_type,
          class_name: exam.class_name,
          subject: exam.subject,
          duration_minutes: Number(exam.duration_minutes || 0),
          instructions: exam.instructions,
          total_questions: questionsResult.rows.length,
          scheduled_start_at: exam.scheduled_start_at,
          scheduled_end_at: exam.scheduled_end_at,
          state: getExamState(exam),
        },
        questions: questionsResult.rows.map(publicQuestion),
      });
    } catch (error) {
      console.error("Load school exam detail error:", error);

      return sendError(
        res,
        500,
        "Unable to load examination details.",
        "EXAM_DETAIL_FAILED"
      );
    }
  }
);

/* =========================================================
   START SCHOOL EXAM
   POST /api/school-student-exams/:examId/start
========================================================= */

router.post(
  "/:examId/start",
  authenticateStudent,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const examResult = await client.query(
        `
          SELECT *
          FROM school_exams
          WHERE id::text = $1
          FOR UPDATE
        `,
        [String(req.params.examId)]
      );

      if (!examResult.rows.length) {
        await client.query("ROLLBACK");

        return sendError(res, 404, "Examination not found.", "EXAM_NOT_FOUND");
      }

      const exam = examResult.rows[0];

      if (
        normalizeClass(exam.class_name) !==
        normalizeClass(req.schoolStudent.className)
      ) {
        await client.query("ROLLBACK");

        return sendError(
          res,
          403,
          "This examination is not assigned to your class.",
          "WRONG_EXAM_CLASS"
        );
      }

      if (clean(exam.status).toLowerCase() !== "published") {
        await client.query("ROLLBACK");

        return sendError(
          res,
          403,
          "This examination has not been published.",
          "EXAM_NOT_PUBLISHED"
        );
      }

      if (!exam.scheduled_start_at || !exam.scheduled_end_at) {
        await client.query("ROLLBACK");

        return sendError(
          res,
          403,
          "This examination has not been scheduled yet.",
          "EXAM_NOT_SCHEDULED"
        );
      }

      const now = getCurrentTime();
      const start = new Date(exam.scheduled_start_at);
      const end = new Date(exam.scheduled_end_at);

      if (now < start) {
        await client.query("ROLLBACK");

        return sendError(
          res,
          403,
          "This examination has not started yet.",
          "EXAM_NOT_STARTED"
        );
      }

      if (now > end) {
        await client.query("ROLLBACK");

        return sendError(
          res,
          403,
          "The examination time has ended.",
          "EXAM_CLOSED"
        );
      }

      const existingResult = await client.query(
        `
          SELECT *
          FROM school_exam_attempts
          WHERE exam_id = $1
            AND student_id = $2
            AND enrollment_id = $3
          ORDER BY created_at DESC
          LIMIT 1
          FOR UPDATE
        `,
        [
          exam.id,
          req.schoolStudent.studentId,
          req.schoolStudent.enrollmentId,
        ]
      );

      if (existingResult.rows.length) {
        const existing = existingResult.rows[0];

        if (existing.status === "submitted") {
          await client.query("COMMIT");

          return res.json({
            success: true,
            message: "You have already submitted this examination.",
            already_submitted: true,
            attempt: existing,
          });
        }

        if (new Date(existing.expires_at) < now || now > end) {
          await client.query(
            `
              UPDATE school_exam_attempts
              SET status = 'submitted',
                  submitted_at = COALESCE(submitted_at, NOW()),
                  updated_at = NOW()
              WHERE id = $1
            `,
            [existing.id]
          );

          await client.query("COMMIT");

          return sendError(
            res,
            403,
            "Your examination time has expired.",
            "ATTEMPT_EXPIRED"
          );
        }

        await client.query("COMMIT");

        return res.json({
          success: true,
          message: "Resuming your examination.",
          attempt: {
            id: existing.id,
            exam_id: existing.exam_id,
            question_ids: parseJson(existing.question_ids, []),
            answers: parseJson(existing.answers, {}),
            started_at: existing.started_at,
            expires_at: existing.expires_at,
            status: existing.status,
          },
        });
      }

      const questionsResult = await client.query(
        `
          SELECT id
          FROM school_exam_questions
          WHERE exam_id = $1
          ORDER BY question_order ASC, id ASC
        `,
        [exam.id]
      );

      if (!questionsResult.rows.length) {
        await client.query("ROLLBACK");

        return sendError(
          res,
          400,
          "No questions have been uploaded for this examination.",
          "EXAM_HAS_NO_QUESTIONS"
        );
      }

      const questionIds = questionsResult.rows.map((row) => row.id);

      const durationMinutes = Math.max(
        1,
        Number(exam.duration_minutes || 60)
      );

      const durationExpiry = new Date(
        now.getTime() + durationMinutes * 60 * 1000
      );

      const expiresAt =
        durationExpiry < end ? durationExpiry : end;

      const insertResult = await client.query(
        `
          INSERT INTO school_exam_attempts (
            exam_id,
            student_id,
            enrollment_id,
            student_reference,
            question_ids,
            answers,
            started_at,
            expires_at,
            status
          )
          VALUES ($1, $2, $3, $4, $5::jsonb, '{}'::jsonb, NOW(), $6, 'in_progress')
          RETURNING *
        `,
        [
          exam.id,
          req.schoolStudent.studentId,
          req.schoolStudent.enrollmentId,
          req.schoolStudent.studentReference,
          JSON.stringify(questionIds),
          expiresAt,
        ]
      );

      await client.query("COMMIT");

      const attempt = insertResult.rows[0];

      return res.status(201).json({
        success: true,
        message: "Examination started successfully.",
        attempt: {
          id: attempt.id,
          exam_id: attempt.exam_id,
          question_ids: questionIds,
          answers: {},
          started_at: attempt.started_at,
          expires_at: attempt.expires_at,
          status: attempt.status,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Start school exam error:", error);

      return sendError(
        res,
        500,
        "Unable to start examination.",
        "EXAM_START_FAILED"
      );
    } finally {
      client.release();
    }
  }
);

/* =========================================================
   SAVE EXAM ANSWERS
   PUT /attempts/:attemptId/answers
========================================================= */

router.put(
  "/attempts/:attemptId/answers",
  authenticateStudent,
  async (req, res) => {
    try {
      const attempt = await getAttemptForStudent(
        req.params.attemptId,
        req.schoolStudent
      );

      if (!attempt) {
        return sendError(
          res,
          404,
          "Examination attempt not found.",
          "ATTEMPT_NOT_FOUND"
        );
      }

      if (attempt.status !== "in_progress") {
        return sendError(
          res,
          403,
          "This examination is no longer accepting answers.",
          "ATTEMPT_NOT_ACTIVE"
        );
      }

      const now = getCurrentTime();

      if (now > new Date(attempt.expires_at)) {
        return sendError(
          res,
          403,
          "Your examination time has expired.",
          "ATTEMPT_EXPIRED"
        );
      }

      const incomingAnswers =
        req.body?.answers && typeof req.body.answers === "object"
          ? req.body.answers
          : null;

      if (!incomingAnswers || Array.isArray(incomingAnswers)) {
        return sendError(
          res,
          400,
          "Provide answers as an object keyed by question ID.",
          "INVALID_ANSWERS"
        );
      }

      const allowedIds = new Set(
        parseJson(attempt.question_ids, []).map(String)
      );

      const currentAnswers = parseJson(attempt.answers, {});

      for (const [questionId, answer] of Object.entries(incomingAnswers)) {
        if (!allowedIds.has(String(questionId))) {
          return sendError(
            res,
            400,
            "An answer contains a question outside this examination.",
            "INVALID_QUESTION_ID"
          );
        }

        currentAnswers[questionId] = answer;
      }

      const updateResult = await pool.query(
        `
          UPDATE school_exam_attempts
          SET answers = $1::jsonb,
              updated_at = NOW()
          WHERE id = $2
            AND student_id = $3
            AND enrollment_id = $4
            AND status = 'in_progress'
            AND expires_at >= NOW()
          RETURNING id, answers, updated_at, expires_at
        `,
        [
          JSON.stringify(currentAnswers),
          attempt.id,
          req.schoolStudent.studentId,
          req.schoolStudent.enrollmentId,
        ]
      );

      if (!updateResult.rows.length) {
        return sendError(
          res,
          403,
          "The examination is no longer accepting answers.",
          "ATTEMPT_EXPIRED"
        );
      }

      return res.json({
        success: true,
        message: "Answers saved successfully.",
        answers: parseJson(updateResult.rows[0].answers, {}),
        expires_at: updateResult.rows[0].expires_at,
      });
    } catch (error) {
      console.error("Save school exam answers error:", error);

      return sendError(
        res,
        500,
        "Unable to save examination answers.",
        "ANSWERS_SAVE_FAILED"
      );
    }
  }
);

/* =========================================================
   SUBMIT SCHOOL EXAM
   POST /attempts/:attemptId/submit
========================================================= */

router.post(
  "/attempts/:attemptId/submit",
  authenticateStudent,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const attemptResult = await client.query(
        `
          SELECT *
          FROM school_exam_attempts
          WHERE id::text = $1
            AND student_id = $2
            AND enrollment_id = $3
          FOR UPDATE
        `,
        [
          String(req.params.attemptId),
          req.schoolStudent.studentId,
          req.schoolStudent.enrollmentId,
        ]
      );

      if (!attemptResult.rows.length) {
        await client.query("ROLLBACK");

        return sendError(
          res,
          404,
          "Examination attempt not found.",
          "ATTEMPT_NOT_FOUND"
        );
      }

      const attempt = attemptResult.rows[0];

      if (attempt.status === "submitted") {
        await client.query("COMMIT");

        return res.json({
          success: true,
          message: "This examination has already been submitted.",
          result: {
            score: Number(attempt.score),
            total_marks: Number(attempt.total_marks),
            percentage: Number(attempt.percentage),
          },
        });
      }

      if (attempt.status !== "in_progress") {
        await client.query("ROLLBACK");

        return sendError(
          res,
          403,
          "This examination cannot be submitted.",
          "ATTEMPT_NOT_ACTIVE"
        );
      }

      const questionIds = parseJson(attempt.question_ids, []);
      const answers = parseJson(attempt.answers, {});

      const questionsResult = await client.query(
        `
          SELECT id, correct_answer, marks
          FROM school_exam_questions
          WHERE exam_id = $1
            AND id = ANY($2::int[])
        `,
        [attempt.exam_id, questionIds.map(Number)]
      );

      let score = 0;
      let totalMarks = 0;

      for (const question of questionsResult.rows) {
        const marks = Number(question.marks || 1);

        totalMarks += marks;

        const givenAnswer = answers[String(question.id)];
        const correctAnswer = parseJson(
          question.correct_answer,
          question.correct_answer
        );

        if (
          givenAnswer !== undefined &&
          isCorrectAnswer(givenAnswer, correctAnswer)
        ) {
          score += marks;
        }
      }

      const percentage =
        totalMarks > 0 ? (score / totalMarks) * 100 : 0;

      const updateResult = await client.query(
        `
          UPDATE school_exam_attempts
          SET status = 'submitted',
              submitted_at = NOW(),
              score = $1,
              total_marks = $2,
              percentage = $3,
              updated_at = NOW()
          WHERE id = $4
          RETURNING id, score, total_marks, percentage, submitted_at
        `,
        [
          score,
          totalMarks,
          percentage.toFixed(2),
          attempt.id,
        ]
      );

      await client.query("COMMIT");

      const result = updateResult.rows[0];

      return res.json({
        success: true,
        message: "Examination submitted successfully.",
        result: {
          attempt_id: result.id,
          score: Number(result.score),
          total_marks: Number(result.total_marks),
          percentage: Number(result.percentage),
          submitted_at: result.submitted_at,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Submit school exam error:", error);

      return sendError(
        res,
        500,
        "Unable to submit examination.",
        "EXAM_SUBMIT_FAILED"
      );
    } finally {
      client.release();
    }
  }
);

/* =========================================================
   STUDENT EXAM RESULT
   GET /attempts/:attemptId/result
========================================================= */

router.get(
  "/attempts/:attemptId/result",
  authenticateStudent,
  async (req, res) => {
    try {
      const attempt = await getAttemptForStudent(
        req.params.attemptId,
        req.schoolStudent
      );

      if (!attempt) {
        return sendError(
          res,
          404,
          "Examination attempt not found.",
          "ATTEMPT_NOT_FOUND"
        );
      }

      if (attempt.status !== "submitted") {
        return sendError(
          res,
          403,
          "Your examination result is not available yet.",
          "RESULT_NOT_AVAILABLE"
        );
      }

      const examResult = await pool.query(
        `
          SELECT id, title, subject, class_name
          FROM school_exams
          WHERE id = $1
          LIMIT 1
        `,
        [attempt.exam_id]
      );

      return res.json({
        success: true,
        exam: examResult.rows[0] || null,
        result: {
          attempt_id: attempt.id,
          score: Number(attempt.score),
          total_marks: Number(attempt.total_marks),
          percentage: Number(attempt.percentage),
          submitted_at: attempt.submitted_at,
          status: attempt.status,
        },
      });
    } catch (error) {
      console.error("Load school exam result error:", error);

      return sendError(
        res,
        500,
        "Unable to load examination result.",
        "RESULT_LOAD_FAILED"
      );
    }
  }
);

/* =========================================================
   STUDENT EXAM HISTORY
   GET /results
========================================================= */

router.get(
  "/results",
  authenticateStudent,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
          SELECT
            a.id AS attempt_id,
            a.score,
            a.total_marks,
            a.percentage,
            a.status,
            a.started_at,
            a.submitted_at,
            e.id AS exam_id,
            e.title,
            e.subject,
            e.class_name
          FROM school_exam_attempts a
          INNER JOIN school_exams e ON e.id = a.exam_id
          WHERE a.student_id = $1
            AND a.enrollment_id = $2
          ORDER BY a.created_at DESC
        `,
        [
          req.schoolStudent.studentId,
          req.schoolStudent.enrollmentId,
        ]
      );

      return res.json({
        success: true,
        results: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error("Load school exam history error:", error);

      return sendError(
        res,
        500,
        "Unable to load examination history.",
        "EXAM_HISTORY_FAILED"
      );
    }
  }
);

/* =========================================================
   INITIALIZE AND EXPORT
========================================================= */

router.use(async (req, res, next) => {
  try {
    await ensureTables();
    next();
  } catch (error) {
    console.error("School exam database initialization error:", error);

    return sendError(
      res,
      500,
      "School examination database initialization failed.",
      "DATABASE_INITIALIZATION_FAILED"
    );
  }
});

export default router;
