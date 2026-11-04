
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
const DEFAULT_QUESTIONS_PER_SUBJECT = 40;

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

const parseArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const uniqueSubjects = (subjects) => {
  const seen = new Set();

  return subjects
    .map((subject) => {
      if (typeof subject === "object" && subject !== null) {
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

      if (!normalized || seen.has(normalized)) {
        return false;
      }

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
  const authorization = clean(
    req.headers.authorization
  );

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

/* =========================================================
   DATABASE INITIALIZATION

   Creates the examination schedule and attempt tables.
   Existing cbt_questions remains your question bank.
========================================================= */

let initializationPromise = null;

const initializeCBTDatabase = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS academy_cbt_exams (
        id BIGSERIAL PRIMARY KEY,

        title TEXT NOT NULL,

        description TEXT DEFAULT '',

        exam_code TEXT UNIQUE,

        subjects TEXT[] NOT NULL DEFAULT '{}',

        questions_per_subject INTEGER
          NOT NULL DEFAULT 40,

        duration_minutes INTEGER
          NOT NULL DEFAULT 120,

        start_at TIMESTAMPTZ NOT NULL,

        end_at TIMESTAMPTZ NOT NULL,

        status TEXT NOT NULL DEFAULT 'draft'
          CHECK (
            status IN (
              'draft',
              'published',
              'cancelled',
              'completed'
            )
          ),

        created_at TIMESTAMPTZ DEFAULT NOW(),

        updated_at TIMESTAMPTZ DEFAULT NOW(),

        CHECK (duration_minutes > 0),

        CHECK (questions_per_subject > 0),

        CHECK (end_at > start_at)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS academy_cbt_attempts (
        id UUID PRIMARY KEY,

        exam_id BIGINT NOT NULL
          REFERENCES academy_cbt_exams(id)
          ON DELETE CASCADE,

        student_id TEXT NOT NULL,

        enrollment_id TEXT,

        student_name TEXT DEFAULT '',

        student_email TEXT DEFAULT '',

        subjects TEXT[] NOT NULL DEFAULT '{}',

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
      CREATE INDEX IF NOT EXISTS
      idx_academy_cbt_attempts_student
      ON academy_cbt_attempts(student_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_academy_cbt_attempts_exam
      ON academy_cbt_attempts(exam_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_academy_cbt_attempts_enrollment
      ON academy_cbt_attempts(enrollment_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_academy_cbt_questions_exam_subject
      ON cbt_questions(exam, subject)
    `);

    console.log("ACADEMY CBT DATABASE READY");
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
      console.error("CBT JWT SECRET IS NOT CONFIGURED");

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
        message: "Only authenticated students can access CBT.",
      });
    }

    const userId = clean(
      decoded.id ||
      decoded.userId ||
      decoded.user_id ||
      decoded.sub
    );

    const email = clean(
      decoded.email
    ).toLowerCase();

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
    } else if (studentEmail) {
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

    req.cbtStudent = {
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

      enrollmentId: clean(
        enrollment.enrollment_id
      ),

      enrollment,

      user,

      subjects: registeredSubjects,
    };

    next();
  } catch (error) {
    console.error("CBT STUDENT AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Your student session is invalid or expired.",
    });
  }
};

/* =========================================================
   QUESTION HELPERS
========================================================= */

const parseQuestionOptions = (question) => {
  const parsed = parseArray(question.options);

  if (parsed.length) {
    return parsed.map((option, index) => {
      if (typeof option === "string") {
        return {
          value: String.fromCharCode(65 + index),
          label: option,
        };
      }

      return {
        value: clean(
          option.value ||
          option.key ||
          String.fromCharCode(65 + index)
        ),

        label: clean(
          option.label ||
          option.text ||
          option.option ||
          option.value
        ),
      };
    });
  }

  return [
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ]
    .filter((option) => option !== null && option !== undefined)
    .map((option, index) => ({
      value: String.fromCharCode(65 + index),
      label: clean(option),
    }));
};

const sanitizeQuestion = (question) => ({
  id: question.id,

  subject: question.subject,

  question: question.question,

  question_type: question.question_type || "objective",

  options: parseQuestionOptions(question),

  image: question.image || null,

  passage_title: question.passage_title || null,

  passage: question.passage || null,

  passage_image: question.passage_image || null,
});

const normalizeAnswer = (value) =>
  clean(value).toLowerCase().replace(/\s+/g, " ");

const getCorrectAnswer = (question) =>
  clean(
    question.answer ||
    question.correct_answer ||
    question.correctAnswer
  );

const getExamQuestionIds = (attempt) => {
  return parseArray(attempt.question_ids).map(String);
};

const getAttemptAnswers = (attempt) => {
  const answers = attempt.answers;

  if (!answers || typeof answers !== "object") {
    return {};
  }

  return answers;
};

const isWithinExamWindow = (exam) => {
  const now = Date.now();

  return (
    now >= new Date(exam.start_at).getTime() &&
    now <= new Date(exam.end_at).getTime()
  );
};

/* =========================================================
   EXAM ACCESS HELPERS
========================================================= */

const getExamForStudent = async (examId, student) => {
  const result = await pool.query(
    `
      SELECT *
      FROM academy_cbt_exams
      WHERE id = $1
        AND status = 'published'
      LIMIT 1
    `,
    [examId]
  );

  const exam = result.rows[0];

  if (!exam) {
    return null;
  }

  const examSubjects = uniqueSubjects(
    parseArray(exam.subjects)
  );

  const studentSubjects = student.subjects;

  const eligibleSubjects = examSubjects.filter(
    (examSubject) =>
      studentSubjects.some(
        (studentSubject) =>
          normalizeSubject(studentSubject) ===
          normalizeSubject(examSubject)
      )
  );

  if (!eligibleSubjects.length) {
    return null;
  }

  return {
    ...exam,
    eligibleSubjects,
  };
};

/* =========================================================
   GET STUDENT EXAMINATIONS

   GET /student/cbt/exams
========================================================= */

router.get(
  "/student/cbt/exams",
  authenticateStudent,
  asyncHandler(async (req, res) => {
    await initializeCBTDatabase();

    const student = req.cbtStudent;

    const result = await pool.query(
      `
        SELECT *
        FROM academy_cbt_exams
        WHERE status = 'published'
        ORDER BY start_at ASC
      `
    );

    const exams = result.rows
      .map((exam) => {
        const examSubjects = uniqueSubjects(
          parseArray(exam.subjects)
        );

        const eligibleSubjects = examSubjects.filter(
          (subject) =>
            student.subjects.some(
              (registered) =>
                normalizeSubject(registered) ===
                normalizeSubject(subject)
            )
        );

        if (!eligibleSubjects.length) {
          return null;
        }

        const now = Date.now();

        const startsAt = new Date(
          exam.start_at
        ).getTime();

        const endsAt = new Date(
          exam.end_at
        ).getTime();

        let availability = "upcoming";

        if (now > endsAt) {
          availability = "closed";
        } else if (now >= startsAt) {
          availability = "available";
        }

        return {
          id: exam.id,

          title: exam.title,

          description: exam.description,

          examCode: exam.exam_code,

          subjects: eligibleSubjects,

          questionsPerSubject:
            exam.questions_per_subject,

          durationMinutes:
            exam.duration_minutes,

          startAt: exam.start_at,

          endAt: exam.end_at,

          availability,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,

      student: {
        name: student.name,

        subjects: student.subjects,
      },

      exams,
    });
  })
);

/* =========================================================
   GET EXAM DETAILS
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
        message: "Examination not found or not available for your registered subjects.",
      });
    }

    res.json({
      success: true,

      exam: {
        id: exam.id,

        title: exam.title,

        description: exam.description,

        subjects: exam.eligibleSubjects,

        questionsPerSubject:
          exam.questions_per_subject,

        durationMinutes:
          exam.duration_minutes,

        startAt: exam.start_at,

        endAt: exam.end_at,

        availability: isWithinExamWindow(exam)
          ? "available"
          : Date.now() < new Date(exam.start_at).getTime()
            ? "upcoming"
            : "closed",
      },
    });
  })
);

/* =========================================================
   START OR RESUME EXAMINATION

   POST /student/cbt/exams/:examId/start
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
        message: "Examination not found or unavailable for your registered subjects.",
      });
    }

    const now = new Date();

    if (now < new Date(exam.start_at)) {
      return res.status(403).json({
        success: false,
        code: "EXAM_NOT_STARTED",

        message: "This examination has not started yet.",

        startAt: exam.start_at,
      });
    }

    if (now > new Date(exam.end_at)) {
      return res.status(403).json({
        success: false,
        code: "EXAM_CLOSED",

        message: "The examination period has ended.",
      });
    }

    const existingResult = await pool.query(
      `
        SELECT *
        FROM academy_cbt_attempts
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

    if (existingAttempt) {
      if (
        existingAttempt.status === "submitted" ||
        existingAttempt.status === "expired"
      ) {
        return res.status(409).json({
          success: false,
          code: "ATTEMPT_ALREADY_COMPLETED",

          message: "You have already completed this examination.",

          result: {
            attemptId: existingAttempt.id,

            score: Number(existingAttempt.score),

            status: existingAttempt.status,
          },
        });
      }

      if (
        now >= new Date(existingAttempt.expires_at) ||
        now > new Date(exam.end_at)
      ) {
        return res.status(403).json({
          success: false,
          code: "ATTEMPT_EXPIRED",

          message: "Your examination time has expired. Submit your answers.",
        });
      }

      const questionIds = getExamQuestionIds(
        existingAttempt
      );

      const questionResult = await pool.query(
        `
          SELECT
            id,
            exam,
            subject,
            question,
            question_type,
            options,
            optionA,
            optionB,
            optionC,
            optionD,
            image,
            passage_title,
            passage,
            passage_image
          FROM cbt_questions
          WHERE id::text = ANY($1::text[])
          ORDER BY array_position(
            $1::text[],
            id::text
          )
        `,
        [questionIds]
      );

      return res.json({
        success: true,

        resumed: true,

        attempt: {
          id: existingAttempt.id,

          startedAt: existingAttempt.started_at,

          expiresAt: existingAttempt.expires_at,

          durationMinutes: exam.duration_minutes,

          answers: getAttemptAnswers(existingAttempt),
        },

        exam: {
          id: exam.id,

          title: exam.title,

          subjects: exam.eligibleSubjects,

          questions: questionResult.rows.map(
            sanitizeQuestion
          ),
        },
      });
    }

    const questionsPerSubject = Math.min(
      Math.max(
        Number(exam.questions_per_subject) ||
        DEFAULT_QUESTIONS_PER_SUBJECT,
        1
      ),
      MAX_QUESTIONS_PER_SUBJECT
    );

    const selectedQuestions = [];

    for (const subject of exam.eligibleSubjects) {
      const questionResult = await pool.query(
        `
          SELECT
            id,
            exam,
            subject,
            question,
            question_type,
            options,
            optionA,
            optionB,
            optionC,
            optionD,
            image,
            passage_title,
            passage,
            passage_image
          FROM cbt_questions
          WHERE LOWER(TRIM(subject)) = LOWER(TRIM($1))
            AND (
              active = TRUE
              OR active IS NULL
            )
          ORDER BY RANDOM()
          LIMIT $2
        `,
        [
          subject,
          questionsPerSubject,
        ]
      );

      selectedQuestions.push(
        ...questionResult.rows
      );
    }

    if (!selectedQuestions.length) {
      return res.status(404).json({
        success: false,
        code: "NO_QUESTIONS",

        message: "No examination questions are available for your registered subjects.",
      });
    }

    const questionIds = selectedQuestions.map(
      (question) => String(question.id)
    );

    const durationMinutes = Math.min(
      Math.max(
        Number(exam.duration_minutes) || 120,
        1
      ),
      MAX_EXAM_DURATION
    );

    const calculatedExpiry = new Date(
      now.getTime() + durationMinutes * 60 * 1000
    );

    const examEnd = new Date(exam.end_at);

    const expiresAt =
      calculatedExpiry < examEnd
        ? calculatedExpiry
        : examEnd;

    const attemptId = crypto.randomUUID();

    const insertResult = await pool.query(
      `
        INSERT INTO academy_cbt_attempts (
          id,
          exam_id,
          student_id,
          enrollment_id,
          student_name,
          student_email,
          subjects,
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
          $8::jsonb,
          '{}'::jsonb,
          $9,
          $10,
          $11,
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

        exam.eligibleSubjects,

        JSON.stringify(questionIds),

        now,

        expiresAt,

        selectedQuestions.length,
      ]
    );

    const attempt = insertResult.rows[0];

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

        subjects: exam.eligibleSubjects,

        questions: selectedQuestions.map(
          sanitizeQuestion
        ),
      },
    });
  })
);

/* =========================================================
   SAVE EXAM ANSWERS

   PUT /student/cbt/attempts/:attemptId/answers

   Body:
   {
     "answers": {
       "questionId": "A",
       "questionId2": "C"
     }
   }
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
        FROM academy_cbt_attempts
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
        message: "Examination attempt not found.",
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
      getExamQuestionIds(attempt)
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

    const previousAnswers = getAttemptAnswers(
      attempt
    );

    const mergedAnswers = {
      ...previousAnswers,
      ...sanitizedAnswers,
    };

    await pool.query(
      `
        UPDATE academy_cbt_attempts
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

      savedAnswers: Object.keys(
        mergedAnswers
      ).length,

      expiresAt: attempt.expires_at,
    });
  })
);

/* =========================================================
   SUBMIT EXAMINATION

   POST /student/cbt/attempts/:attemptId/submit

   Body:
   {
     "answers": {
       "questionId": "A"
     }
   }
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
          FROM academy_cbt_attempts
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
          message: "Examination attempt not found.",
        });
      }

      if (attempt.status !== "in_progress") {
        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          message: "This examination has already been submitted.",
        });
      }

      const questionIds = getExamQuestionIds(
        attempt
      );

      const previousAnswers = getAttemptAnswers(
        attempt
      );

      const incomingAnswers = req.body?.answers;

      const mergedAnswers = {
        ...previousAnswers,
      };

      if (
        incomingAnswers &&
        typeof incomingAnswers === "object" &&
        !Array.isArray(incomingAnswers)
      ) {
        const allowedQuestionIds = new Set(
          questionIds
        );

        for (const [questionId, answer] of Object.entries(
          incomingAnswers
        )) {
          if (
            !allowedQuestionIds.has(String(questionId))
          ) {
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
            answer,
            correct_answer,
            "correctAnswer",
            question_type
          FROM cbt_questions
          WHERE id::text = ANY($1::text[])
        `,
        [questionIds]
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

      for (const questionId of questionIds) {
        const question = questionMap.get(
          String(questionId)
        );

        if (!question) {
          unanswered++;
          continue;
        }

        const submittedAnswer = clean(
          mergedAnswers[String(questionId)]
        );

        if (!submittedAnswer) {
          unanswered++;
          continue;
        }

        const correctAnswer = getCorrectAnswer(
          question
        );

        if (
          normalizeAnswer(submittedAnswer) ===
          normalizeAnswer(correctAnswer)
        ) {
          correctAnswers++;
        } else {
          incorrectAnswers++;
        }
      }

      const totalQuestions = questionIds.length;

      const score =
        totalQuestions > 0
          ? Number(
              (
                (correctAnswers / totalQuestions) *
                100
              ).toFixed(2)
            )
          : 0;

      const submittedAt = new Date();

      const startedAt = new Date(
        attempt.started_at
      );

      const durationSeconds = Math.max(
        0,
        Math.floor(
          (submittedAt.getTime() - startedAt.getTime()) /
          1000
        )
      );

      const expired =
        submittedAt >= new Date(attempt.expires_at);

      const status = expired
        ? "expired"
        : "submitted";

      await client.query(
        `
          UPDATE academy_cbt_attempts
          SET
            answers = $1::jsonb,

            submitted_at = $2,

            duration_seconds = $3,

            total_questions = $4,

            correct_answers = $5,

            incorrect_answers = $6,

            unanswered = $7,

            score = $8,

            status = $9,

            updated_at = NOW()

          WHERE id = $10
        `,
        [
          JSON.stringify(mergedAnswers),

          submittedAt,

          durationSeconds,

          totalQuestions,

          correctAnswers,

          incorrectAnswers,

          unanswered,

          score,

          status,

          attempt.id,
        ]
      );

      await client.query("COMMIT");

      return res.json({
        success: true,

        message: "Examination submitted successfully.",

        result: {
          attemptId: attempt.id,

          totalQuestions,

          correctAnswers,

          incorrectAnswers,

          unanswered,

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
          a.id,
          a.exam_id,
          a.student_name,
          a.subjects,
          a.started_at,
          a.submitted_at,
          a.duration_seconds,
          a.total_questions,
          a.correct_answers,
          a.incorrect_answers,
          a.unanswered,
          a.score,
          a.status,
          e.title AS exam_title

        FROM academy_cbt_attempts a

        INNER JOIN academy_cbt_exams e
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

        exam: attempt.exam_title,

        student: attempt.student_name,

        subjects: attempt.subjects,

        startedAt: attempt.started_at,

        submittedAt: attempt.submitted_at,

        durationSeconds: attempt.duration_seconds,

        totalQuestions: attempt.total_questions,

        correctAnswers: attempt.correct_answers,

        incorrectAnswers: attempt.incorrect_answers,

        unanswered: attempt.unanswered,

        score: Number(attempt.score),

        status: attempt.status,
      },
    });
  })
);

/* =========================================================
   GET STUDENT CBT HISTORY

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
          a.subjects,
          a.started_at,
          a.submitted_at,
          a.total_questions,
          a.correct_answers,
          a.incorrect_answers,
          a.unanswered,
          a.score,
          a.status,
          e.title AS exam_title

        FROM academy_cbt_attempts a

        INNER JOIN academy_cbt_exams e
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

        subjects: attempt.subjects,

        startedAt: attempt.started_at,

        submittedAt: attempt.submitted_at,

        totalQuestions: attempt.total_questions,

        correctAnswers: attempt.correct_answers,

        incorrectAnswers: attempt.incorrect_answers,

        unanswered: attempt.unanswered,

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
  console.error("ACADEMY CBT ROUTE ERROR:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message: "An error occurred while processing your CBT request.",
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
