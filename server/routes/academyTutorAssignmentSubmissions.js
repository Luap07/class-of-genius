import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import pool from "../lib/db.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_ROOT = path.resolve(__dirname, "..");
const UPLOAD_DIR = path.resolve(
  SERVER_ROOT,
  "uploads",
  "academy-assignments"
);

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeTutorReference = (value) => {
  const references = clean(value)
    .split(",")
    .map((item) => item.trim());

  const reference = references.find((item) =>
    /^SQA-[A-Z0-9-]+$/i.test(item)
  );

  return reference ? reference.toUpperCase() : "";
};

const getTutorReference = (req) => {
  const candidates = [
    req.headers["x-tutor-reference"],
    req.headers["x-tutor-ref"],
    req.query?.tutorReference,
    req.query?.tutor_reference,
    req.query?.reference,
    req.query?.applicationReference,
    req.query?.application_reference,
    req.body?.tutorReference,
    req.body?.tutor_reference,
    req.body?.reference,
    req.body?.applicationReference,
    req.body?.application_reference,
  ];

  for (const candidate of candidates) {
    const reference = normalizeTutorReference(candidate);

    if (reference) {
      return reference;
    }
  }

  return "";
};

const validTutorReference = (reference) =>
  /^SQA-[A-Z0-9-]+$/i.test(clean(reference));

const columnsCache = new Map();

const getColumns = async (tableName) => {
  if (columnsCache.has(tableName)) {
    return columnsCache.get(tableName);
  }

  const result = await pool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName]
  );

  const columns = new Set(
    result.rows.map((row) => row.column_name)
  );

  columnsCache.set(tableName, columns);

  return columns;
};

const identifier = (name) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error("Invalid database column.");
  }

  return `"${name}"`;
};

const tableExists = async (tableName) => {
  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [tableName]
  );

  return Boolean(result.rows[0]?.exists);
};

const isValidId = (value) =>
  /^\d+$/.test(clean(value)) && Number(value) > 0;

const calculateGrade = (percentage) => {
  const value = Number(percentage) || 0;

  if (value >= 80) return "A";
  if (value >= 70) return "B";
  if (value >= 60) return "C";
  if (value >= 50) return "D";
  if (value >= 40) return "E";

  return "F";
};

const isTutorAssignmentOwner = (
  assignment,
  tutorReference
) => {
  const storedReferences = clean(
    assignment?.tutor_reference
  )
    .split(",")
    .map((item) => item.trim().toUpperCase());

  return storedReferences.includes(
    clean(tutorReference).toUpperCase()
  );
};

/* ============================================================
   ASSIGNMENT OWNERSHIP
============================================================ */

const getAssignmentForTutor = async (
  assignmentId,
  tutorReference
) => {
  if (!isValidId(assignmentId)) {
    return null;
  }

  const columns = await getColumns("academy_assignments");

  if (
    !columns.has("id") ||
    !columns.has("tutor_reference")
  ) {
    throw new Error(
      "The academy_assignments table is missing required columns."
    );
  }

  const result = await pool.query(
    `
      SELECT *
      FROM academy_assignments
      WHERE id::text = $1
        AND (
          UPPER(TRIM(tutor_reference)) = $2
          OR EXISTS (
            SELECT 1
            FROM UNNEST(
              STRING_TO_ARRAY(tutor_reference, ',')
            ) AS tutor_ref(value)
            WHERE UPPER(TRIM(tutor_ref.value)) = $2
          )
        )
      LIMIT 1
    `,
    [String(assignmentId), tutorReference]
  );

  return result.rows[0] || null;
};

const getOwnedSubmission = async (
  submissionId,
  tutorReference
) => {
  if (!isValidId(submissionId)) {
    return null;
  }

  const submissionColumns = await getColumns(
    "academy_assignment_submissions"
  );

  const assignmentColumns = await getColumns(
    "academy_assignments"
  );

  if (
    !submissionColumns.has("id") ||
    !submissionColumns.has("assignment_id") ||
    !assignmentColumns.has("id") ||
    !assignmentColumns.has("tutor_reference")
  ) {
    throw new Error(
      "The assignment submission database schema is incomplete."
    );
  }

  const assignmentFields = [
    ["title", "assignment_title"],
    ["subject", "assignment_subject"],
    ["tutor_reference", "assignment_tutor_reference"],
    ["max_score", "assignment_max_score"],
    ["total_marks", "assignment_total_marks"],
    ["result_released", "assignment_result_released"],
    ["class_name", "assignment_class"],
    ["grade", "assignment_grade"],
    ["status", "assignment_status"],
  ]
    .filter(([column]) => assignmentColumns.has(column))
    .map(
      ([column, alias]) =>
        `a.${identifier(column)} AS ${identifier(alias)}`
    );

  const selectFields = [
    "s.*",
    ...assignmentFields,
  ];

  const result = await pool.query(
    `
      SELECT ${selectFields.join(", ")}
      FROM academy_assignment_submissions s
      INNER JOIN academy_assignments a
        ON a.id = s.assignment_id
      WHERE s.id::text = $1
        AND (
          UPPER(TRIM(a.tutor_reference)) = $2
          OR EXISTS (
            SELECT 1
            FROM UNNEST(
              STRING_TO_ARRAY(a.tutor_reference, ',')
            ) AS tutor_ref(value)
            WHERE UPPER(TRIM(tutor_ref.value)) = $2
          )
        )
      LIMIT 1
    `,
    [String(submissionId), tutorReference]
  );

  return result.rows[0] || null;
};

/* ============================================================
   SUBMITTED FILE HELPERS
============================================================ */

const isInsideUploadDirectory = (filePath) => {
  const resolved = path.resolve(filePath);
  const root = path.resolve(UPLOAD_DIR);

  return (
    resolved.startsWith(`${root}${path.sep}`) ||
    resolved === root
  );
};

const getStoredSubmissionFileValue = (submission) => {
  const candidates = [
    submission?.attachment_url,
    submission?.attachment_path,
    submission?.file_path,
    submission?.document_path,
  ];

  return clean(
    candidates.find((value) => clean(value)) || ""
  );
};

const getSubmissionFileName = (submission) => {
  const storedValue = getStoredSubmissionFileValue(submission);

  if (!storedValue) {
    return "";
  }

  let decoded = storedValue;

  try {
    decoded = decodeURIComponent(storedValue);
  } catch {
    // Preserve values that are not URI-encoded.
  }

  decoded = decoded.split("?")[0].split("#")[0];

  /*
   * The database may contain:
   * - A generated filename.
   * - uploads/academy-assignments/generated-file.pdf
   * - A legacy URL ending in the actual filename.
   *
   * Only the basename is used for filesystem access.
   */
  const filename = path.basename(
    decoded.replace(/\\/g, "/")
  );

  if (
    !filename ||
    filename === "." ||
    filename === ".."
  ) {
    return "";
  }

  return filename;
};

const resolveSubmissionFile = (submission) => {
  const storedValue = getStoredSubmissionFileValue(submission);
  const filename = getSubmissionFileName(submission);

  if (!filename) {
    return {
      filename: "",
      path: null,
      candidates: [],
    };
  }

  const candidates = [
    path.resolve(UPLOAD_DIR, filename),
  ];

  /*
   * Older records may store a path relative to SERVER_ROOT.
   * Resolve it only if the result remains inside UPLOAD_DIR.
   */
  const normalizedStoredValue = storedValue
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  if (
    normalizedStoredValue &&
    !/^https?:\/\//i.test(normalizedStoredValue)
  ) {
    const relativeCandidate = path.resolve(
      SERVER_ROOT,
      normalizedStoredValue
    );

    if (isInsideUploadDirectory(relativeCandidate)) {
      candidates.push(relativeCandidate);
    }
  }

  const uniqueCandidates = [...new Set(candidates)];

  for (const candidate of uniqueCandidates) {
    if (!isInsideUploadDirectory(candidate)) {
      continue;
    }

    try {
      if (
        fs.existsSync(candidate) &&
        fs.statSync(candidate).isFile()
      ) {
        return {
          filename: path.basename(candidate),
          path: candidate,
          candidates: uniqueCandidates,
        };
      }
    } catch {
      // Try the next candidate.
    }
  }

  return {
    filename,
    path: null,
    candidates: uniqueCandidates,
  };
};

const getMimeType = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();

  const types = {
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
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".zip": "application/zip",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };

  return types[extension] || "application/octet-stream";
};

/* ============================================================
   ANSWER RECORDS
============================================================ */

const getSubmissionAnswers = async (submissionId) => {
  if (!(await tableExists("academy_assignment_answers"))) {
    return [];
  }

  const answerColumns = await getColumns(
    "academy_assignment_answers"
  );

  if (!answerColumns.has("submission_id")) {
    return [];
  }

  const questionTableExists = await tableExists(
    "academy_assignment_questions"
  );

  const questionColumns = questionTableExists
    ? await getColumns("academy_assignment_questions")
    : new Set();

  const selectedAnswerFields = [
    "id",
    "submission_id",
    "question_id",
    "student_answer",
    "correct_answer",
    "is_correct",
    "marks_awarded",
    "created_at",
  ]
    .filter((column) => answerColumns.has(column))
    .map(
      (column) =>
        `aa.${identifier(column)} AS ${identifier(column)}`
    );

  const selectedQuestionFields = questionColumns.has("id")
    ? [
        ["question_number", "question_number"],
        ["question", "question_text"],
        ["question_text", "question_text_fallback"],
        ["option_a", "option_a"],
        ["option_b", "option_b"],
        ["option_c", "option_c"],
        ["option_d", "option_d"],
        ["marks", "question_marks"],
        ["reason", "reason"],
      ]
        .filter(([column]) => questionColumns.has(column))
        .map(
          ([column, alias]) =>
            `aq.${identifier(column)} AS ${identifier(alias)}`
        )
    : [];

  const canJoinQuestions =
    questionColumns.has("id") &&
    answerColumns.has("question_id");

  const orderBy = [];

  if (
    canJoinQuestions &&
    questionColumns.has("question_number")
  ) {
    orderBy.push("aq.question_number ASC NULLS LAST");
  }

  if (answerColumns.has("id")) {
    orderBy.push("aa.id ASC");
  }

  const result = await pool.query(
    `
      SELECT
        ${
          selectedAnswerFields.length
            ? selectedAnswerFields.join(", ")
            : "aa.submission_id"
        }
        ${
          selectedQuestionFields.length
            ? `, ${selectedQuestionFields.join(", ")}`
            : ""
        }
      FROM academy_assignment_answers aa
      ${
        canJoinQuestions
          ? `
            LEFT JOIN academy_assignment_questions aq
              ON aq.id = aa.question_id
          `
          : ""
      }
      WHERE aa.submission_id = $1
      ${
        orderBy.length
          ? `ORDER BY ${orderBy.join(", ")}`
          : ""
      }
    `,
    [submissionId]
  );

  return result.rows.map((row) => {
    const question =
      row.question_text ||
      row.question_text_fallback ||
      "";

    return {
      id: row.id ?? null,
      submissionId: row.submission_id,
      questionId: row.question_id ?? null,
      questionNumber: row.question_number ?? null,
      question,
      questionText: question,
      optionA: row.option_a || "",
      optionB: row.option_b || "",
      optionC: row.option_c || "",
      optionD: row.option_d || "",
      studentAnswer: row.student_answer ?? "",
      correctAnswer: row.correct_answer ?? "",
      isCorrect:
        row.is_correct === true ||
        row.is_correct === "true",
      marksAwarded: toNumber(row.marks_awarded, 0),
      questionMarks: toNumber(row.question_marks, 1),
      reason: row.reason || "",
      createdAt: row.created_at || null,
    };
  });
};

/* ============================================================
   GET ALL SUBMISSIONS FOR THIS TUTOR
   GET /api/academy/tutor/assignments/submissions
============================================================ */

router.get("/submissions", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!validTutorReference(tutorReference)) {
      return res.status(401).json({
        success: false,
        message: "A valid SQA tutor reference is required.",
      });
    }

    if (
      !(await tableExists("academy_assignment_submissions")) ||
      !(await tableExists("academy_assignments"))
    ) {
      return res.status(500).json({
        success: false,
        message: "The assignment submission database tables were not found.",
      });
    }

    const submissionColumns = await getColumns(
      "academy_assignment_submissions"
    );

    const assignmentColumns = await getColumns(
      "academy_assignments"
    );

    if (
      !submissionColumns.has("id") ||
      !submissionColumns.has("assignment_id") ||
      !assignmentColumns.has("id") ||
      !assignmentColumns.has("tutor_reference")
    ) {
      return res.status(500).json({
        success: false,
        message:
          "The assignment submission database schema is incomplete.",
      });
    }

    const selectedSubmissionFields = [
      "id",
      "assignment_id",
      "enrollment_id",
      "student_name",
      "attachment_url",
      "attachment_path",
      "file_path",
      "document_path",
      "answer",
      "submitted_at",
      "score",
      "max_score",
      "percentage",
      "grade",
      "feedback",
      "status",
      "graded_at",
    ]
      .filter((column) => submissionColumns.has(column))
      .map(
        (column) =>
          `s.${identifier(column)} AS ${identifier(column)}`
      );

    const selectedAssignmentFields = [
      ["title", "assignment_title"],
      ["subject", "assignment_subject"],
      ["grade", "assignment_grade"],
      ["class_name", "assignment_class"],
      ["class", "assignment_class_value"],
      ["due_date", "assignment_due_date"],
      ["due_at", "assignment_due_at"],
      ["max_score", "assignment_max_score"],
      ["total_marks", "assignment_total_marks"],
      ["total_questions", "assignment_total_questions"],
      ["result_released", "assignment_result_released"],
    ]
      .filter(([column]) => assignmentColumns.has(column))
      .map(
        ([column, alias]) =>
          `a.${identifier(column)} AS ${identifier(alias)}`
      );

    const orderBy = submissionColumns.has("submitted_at")
      ? "s.submitted_at DESC NULLS LAST, s.id DESC"
      : "s.id DESC";

    const result = await pool.query(
      `
        SELECT
          ${[
            ...selectedSubmissionFields,
            ...selectedAssignmentFields,
          ].join(", ")}
        FROM academy_assignment_submissions s
        INNER JOIN academy_assignments a
          ON a.id = s.assignment_id
        WHERE EXISTS (
          SELECT 1
          FROM UNNEST(
            STRING_TO_ARRAY(a.tutor_reference, ',')
          ) AS tutor_ref(value)
          WHERE UPPER(TRIM(tutor_ref.value)) = $1
        )
        ORDER BY ${orderBy}
      `,
      [tutorReference]
    );

    const submissions = await Promise.all(
      result.rows.map(async (row) => {
        const file = resolveSubmissionFile(row);

        /*
         * Attach answer rows to each submission so the tutor
         * can review MCQ responses from the same response.
         */
        const answers = await getSubmissionAnswers(row.id);

        const assignmentClass =
          row.assignment_class ||
          row.assignment_class_value ||
          row.assignment_grade ||
          "";

        const maxScore =
          row.max_score ??
          row.assignment_max_score ??
          row.assignment_total_marks ??
          null;

        const score =
          row.score === undefined ? null : row.score;

        const percentage =
          row.percentage ??
          (
            score !== null &&
            Number(maxScore) > 0
              ? Number(
                  (
                    (Number(score) / Number(maxScore)) *
                    100
                  ).toFixed(2)
                )
              : null
          );

        return {
          ...row,

          id: row.id,
          assignmentId: row.assignment_id,

          studentName: row.student_name || "Student",

          assignmentTitle:
            row.assignment_title || "Assignment",

          assignmentSubject:
            row.assignment_subject || "",

          assignmentClass,

          maxScore,
          max_score: maxScore,

          percentage,
          grade:
            row.grade ||
            (
              percentage !== null
                ? calculateGrade(percentage)
                : null
            ),

          feedback: row.feedback || "",

          resultReleased: Boolean(
            row.assignment_result_released
          ),

          answers,
          answerRecords: answers,

          fileName: file.filename,
          hasAttachment: Boolean(file.path),

          submissionFileUrl: file.path
            ? `/api/academy/tutor/assignments/submissions/${encodeURIComponent(
                row.id
              )}/file`
            : null,

          submissionType: file.path
            ? "document"
            : "questions",
        };
      })
    );

    return res.json({
      success: true,
      submissions,
      data: submissions,
      results: submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error(
      "GET tutor assignment submissions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load student submissions.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

/* ============================================================
   GET ONE SUBMISSION WITH ITS ANSWERS
   GET /api/academy/tutor/assignments/submissions/:id
============================================================ */

router.get(
  "/submissions/:submissionId",
  async (req, res, next) => {
    /*
     * Keep the file route separate. This handler only matches
     * a single submission ID and does not handle "/file".
     */
    if (req.params.submissionId === "file") {
      return next();
    }

    try {
      const tutorReference = getTutorReference(req);

      if (!validTutorReference(tutorReference)) {
        return res.status(401).json({
          success: false,
          message: "A valid SQA tutor reference is required.",
        });
      }

      const submission = await getOwnedSubmission(
        req.params.submissionId,
        tutorReference
      );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found, or you are not authorized to access it.",
        });
      }

      const answers = await getSubmissionAnswers(
        submission.id
      );

      const file = resolveSubmissionFile(submission);

      return res.json({
        success: true,
        submission: {
          ...submission,
          answers,
          answerRecords: answers,
          fileName: file.filename,
          hasAttachment: Boolean(file.path),
          submissionFileUrl: file.path
            ? `/api/academy/tutor/assignments/submissions/${encodeURIComponent(
                submission.id
              )}/file`
            : null,
        },
        answers,
        answerRecords: answers,
      });
    } catch (error) {
      console.error(
        "GET tutor assignment submission detail error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load submission details.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* ============================================================
   OPEN A STUDENT'S SUBMITTED DOCUMENT
   GET /api/academy/tutor/assignments/submissions/:id/file
============================================================ */

router.get(
  "/submissions/:submissionId/file",
  async (req, res) => {
    try {
      const tutorReference = getTutorReference(req);

      if (!validTutorReference(tutorReference)) {
        return res.status(401).json({
          success: false,
          message: "A valid SQA tutor reference is required.",
        });
      }

      const submission = await getOwnedSubmission(
        req.params.submissionId,
        tutorReference
      );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found, or you are not authorized to access it.",
        });
      }

      const file = resolveSubmissionFile(submission);

      if (!file.filename) {
        return res.status(404).json({
          success: false,
          message: "This submission has no uploaded document.",
        });
      }

      if (!file.path) {
        console.error(
          "TUTOR SUBMISSION FILE NOT FOUND",
          {
            submissionId: req.params.submissionId,
            storedValue: getStoredSubmissionFileValue(submission),
            candidates: file.candidates,
          }
        );

        return res.status(404).json({
          success: false,
          message:
            "The student's uploaded document could not be found on the server.",
        });
      }

      res.setHeader(
        "Content-Type",
        getMimeType(file.filename)
      );

      res.setHeader("X-Content-Type-Options", "nosniff");

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.filename.replace(
          /["\r\n]/g,
          "_"
        )}"`
      );

      res.setHeader(
        "Cache-Control",
        "private, no-store, max-age=0"
      );

      return res.sendFile(file.path);
    } catch (error) {
      console.error(
        "GET student submission file error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to open the student's submitted document.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* ============================================================
   SAVE SCORE AND FEEDBACK
   PATCH /api/academy/tutor/assignments/submissions/:id/grade
============================================================ */

router.patch(
  "/submissions/:submissionId/grade",
  async (req, res) => {
    let client;

    try {
      const tutorReference = getTutorReference(req);

      if (!validTutorReference(tutorReference)) {
        return res.status(401).json({
          success: false,
          message: "A valid SQA tutor reference is required.",
        });
      }

      const submission = await getOwnedSubmission(
        req.params.submissionId,
        tutorReference
      );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found, or you are not authorized to grade it.",
        });
      }

      const submissionColumns = await getColumns(
        "academy_assignment_submissions"
      );

      const assignmentColumns = await getColumns(
        "academy_assignments"
      );

      if (!submissionColumns.has("score")) {
        return res.status(500).json({
          success: false,
          message:
            "The academy_assignment_submissions table has no score column.",
        });
      }

      const scoreValue = req.body?.score;

      const maxScoreValue =
        req.body?.maxScore ??
        req.body?.max_score ??
        submission.max_score ??
        submission.assignment_max_score ??
        submission.assignment_total_marks;

      const score = Number(scoreValue);
      const maxScore = Number(maxScoreValue);

      if (
        scoreValue === undefined ||
        !Number.isFinite(score) ||
        !Number.isFinite(maxScore) ||
        maxScore <= 0 ||
        score < 0 ||
        score > maxScore
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Provide a valid score and maximum score. The score must be between zero and the maximum.",
        });
      }

      const feedback = clean(
        req.body?.feedback ?? req.body?.comment
      );

      const percentage = Number(
        ((score / maxScore) * 100).toFixed(2)
      );

      const grade = calculateGrade(percentage);

      const updates = [];
      const values = [];

      const addUpdate = (column, value) => {
        if (!submissionColumns.has(column)) {
          return;
        }

        values.push(value);
        updates.push(
          `${identifier(column)} = $${values.length}`
        );
      };

      addUpdate("score", score);
      addUpdate("feedback", feedback);

      addUpdate("max_score", maxScore);
      addUpdate("percentage", percentage);
      addUpdate("grade", grade);
      addUpdate("status", "graded");

      if (submissionColumns.has("graded_at")) {
        updates.push('"graded_at" = CURRENT_TIMESTAMP');
      }

      if (submissionColumns.has("updated_at")) {
        updates.push('"updated_at" = CURRENT_TIMESTAMP');
      }

      if (!updates.length) {
        return res.status(500).json({
          success: false,
          message: "No grading fields are available to update.",
        });
      }

      client = await pool.connect();

      await client.query("BEGIN");

      values.push(submission.id);

      const updateResult = await client.query(
        `
          UPDATE academy_assignment_submissions
          SET ${updates.join(", ")}
          WHERE id = $${values.length}
          RETURNING *
        `,
        values
      );

      /*
       * Update the assignment's maximum score only when the
       * tutor explicitly supplies it. Do not change it merely
       * because a stored fallback value was used.
       */
      const maxScoreExplicitlySupplied =
        req.body?.maxScore !== undefined ||
        req.body?.max_score !== undefined;

      if (
        maxScoreExplicitlySupplied &&
        assignmentColumns.has("id") &&
        assignmentColumns.has("tutor_reference")
      ) {
        const assignmentUpdates = [];
        const assignmentValues = [];

        if (assignmentColumns.has("max_score")) {
          assignmentValues.push(maxScore);
          assignmentUpdates.push(
            `"max_score" = $${assignmentValues.length}`
          );
        }

        if (assignmentColumns.has("total_marks")) {
          assignmentValues.push(maxScore);
          assignmentUpdates.push(
            `"total_marks" = $${assignmentValues.length}`
          );
        }

        if (assignmentUpdates.length) {
          assignmentValues.push(submission.assignment_id);
          const assignmentIdParameter =
            assignmentValues.length;

          assignmentValues.push(tutorReference);
          const tutorReferenceParameter =
            assignmentValues.length;

          await client.query(
            `
              UPDATE academy_assignments
              SET ${assignmentUpdates.join(", ")}
              WHERE id = $${assignmentIdParameter}
                AND EXISTS (
                  SELECT 1
                  FROM UNNEST(
                    STRING_TO_ARRAY(tutor_reference, ',')
                  ) AS tutor_ref(value)
                  WHERE UPPER(TRIM(tutor_ref.value)) =
                    $${tutorReferenceParameter}
                )
            `,
            assignmentValues
          );
        }
      }

      await client.query("COMMIT");

      const answers = await getSubmissionAnswers(
        submission.id
      );

      return res.json({
        success: true,
        message: "Score and feedback saved successfully.",
        submission: {
          ...updateResult.rows[0],
          answers,
          answerRecords: answers,
        },
        result: {
          score,
          maxScore,
          max_score: maxScore,
          percentage,
          grade,
          feedback,
        },
      });
    } catch (error) {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // Ignore rollback errors.
        }
      }

      console.error("PATCH submission grade error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to save the student's grade.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* ============================================================
   RELEASE OR HIDE ASSIGNMENT RESULTS
   PATCH /api/academy/tutor/assignments/:id/release-results
============================================================ */

router.patch(
  "/:id/release-results",
  async (req, res) => {
    try {
      const tutorReference = getTutorReference(req);

      if (!validTutorReference(tutorReference)) {
        return res.status(401).json({
          success: false,
          message: "A valid SQA tutor reference is required.",
        });
      }

      const assignment = await getAssignmentForTutor(
        req.params.id,
        tutorReference
      );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found.",
        });
      }

      const assignmentColumns = await getColumns(
        "academy_assignments"
      );

      if (!assignmentColumns.has("result_released")) {
        return res.status(500).json({
          success: false,
          message:
            "The academy_assignments table has no result_released column.",
        });
      }

      let release = true;

      if (req.body?.released !== undefined) {
        const value = String(req.body.released).toLowerCase();

        if (!["true", "false"].includes(value)) {
          return res.status(400).json({
            success: false,
            message:
              "The released field must be true or false.",
          });
        }

        release = value === "true";
      }

      const result = await pool.query(
        `
          UPDATE academy_assignments
          SET result_released = $1
          WHERE id::text = $2
            AND EXISTS (
              SELECT 1
              FROM UNNEST(
                STRING_TO_ARRAY(tutor_reference, ',')
              ) AS tutor_ref(value)
              WHERE UPPER(TRIM(tutor_ref.value)) = $3
            )
          RETURNING id, result_released
        `,
        [
          release,
          String(req.params.id),
          tutorReference,
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found.",
        });
      }

      return res.json({
        success: true,
        message: release
          ? "Assignment results released successfully."
          : "Assignment results are now hidden from students.",
        assignment: result.rows[0],
      });
    } catch (error) {
      console.error(
        "PATCH release assignment results error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to change the assignment result release status.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      });
    }
  }
);

export default router;