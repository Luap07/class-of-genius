import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   BASIC HELPERS
========================================================= */

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const normalize = (value) =>
  clean(value).toLowerCase();

const normalizeStatus = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

function safeJsonParse(value, fallback = {}) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function firstValue(...values) {
  return values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );
}

/* =========================================================
   TUTOR HELPERS
========================================================= */

function getTutorReference(tutor) {
  const candidates = [
    tutor?.reference,
    tutor?.application_reference,
    tutor?.applicationReference,
    tutor?.tutor_reference,
    tutor?.tutorReference,
  ];

  return (
    candidates
      .map(clean)
      .find((value) =>
        /^SQA-/i.test(value)
      ) || ""
  );
}

function getTutorName(tutor) {
  return clean(
    tutor?.full_name ||
      tutor?.fullName ||
      tutor?.name ||
      [
        tutor?.first_name,
        tutor?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
  );
}

async function findTutorByReference(reference) {
  const wanted = clean(reference);

  if (!/^SQA-/i.test(wanted)) {
    return null;
  }

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM academy_tutor_applications
        WHERE
          LOWER(TRIM(COALESCE(reference, ''))) =
            LOWER(TRIM($1))
          OR LOWER(TRIM(COALESCE(application_reference, ''))) =
            LOWER(TRIM($1))
          OR LOWER(TRIM(COALESCE(tutor_reference, ''))) =
            LOWER(TRIM($1))
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [wanted]
    );

    if (result.rows.length) {
      return result.rows[0];
    }
  } catch (error) {
    console.warn(
      "Tutor reference lookup fallback:",
      error.message
    );
  }

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM academy_tutor_applications
        ORDER BY created_at DESC
      `
    );

    return (
      result.rows.find((tutor) => {
        const candidates = [
          tutor?.reference,
          tutor?.application_reference,
          tutor?.applicationReference,
          tutor?.tutor_reference,
          tutor?.tutorReference,
        ];

        return candidates.some(
          (value) =>
            normalize(value) ===
            normalize(wanted)
        );
      }) || null
    );
  } catch (error) {
    console.error(
      "Tutor lookup error:",
      error
    );

    throw error;
  }
}

async function verifyTutor(reference) {
  const wanted = clean(reference);

  if (!/^SQA-/i.test(wanted)) {
    return {
      error: {
        status: 400,
        code: "TUTOR_REFERENCE_REQUIRED",
        message:
          "A valid SQA tutor reference is required.",
      },
    };
  }

  const tutor =
    await findTutorByReference(wanted);

  if (!tutor) {
    return {
      error: {
        status: 404,
        code: "TUTOR_NOT_FOUND",
        message:
          "Tutor account could not be found.",
      },
    };
  }

  const status = normalizeStatus(
    tutor.application_status ||
      tutor.status
  );

  if (status !== "verified") {
    return {
      error: {
        status: 403,
        code: "TUTOR_NOT_VERIFIED",
        message:
          "Your tutor account has not been verified yet.",
      },
    };
  }

  return { tutor };
}

function getRequestTutorReference(req) {
  return clean(
    req.body?.reference ||
      req.body?.tutorReference ||
      req.body?.tutor_reference ||
      req.body?.applicationReference ||
      req.body?.application_reference ||
      req.query?.reference ||
      req.query?.tutorReference ||
      req.query?.tutor_reference ||
      req.query?.applicationReference ||
      req.query?.application_reference ||
      req.headers["x-tutor-reference"] ||
      req.headers["x-tutor-ref"]
  );
}

/* =========================================================
   TASK HELPERS
========================================================= */

function getTaskMetadata(task) {
  return safeJsonParse(
    task?.metadata,
    {}
  );
}

function getTaskTutorReference(task) {
  if (!task) return "";

  const metadata =
    getTaskMetadata(task);

  const candidates = [
    task.tutor_reference,
    task.tutorReference,
    metadata.tutorReference,
    metadata.tutor_reference,
    metadata.applicationReference,
    metadata.application_reference,
    metadata.reference,
    metadata.createdBy,
  ];

  return (
    candidates
      .map(clean)
      .find((value) =>
        /^SQA-/i.test(value)
      ) || ""
  );
}

function getTaskMaxScore(task) {
  if (!task) return null;

  const metadata =
    getTaskMetadata(task);

  const value = firstValue(
    task.max_score,
    task.maxScore,
    metadata.maxScore,
    metadata.max_score
  );

  if (value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function getTaskDueDate(task) {
  if (!task) return "";

  const metadata =
    getTaskMetadata(task);

  return clean(
    firstValue(
      task.due_date,
      task.dueDate,
      metadata.dueDate,
      metadata.due_date,
      metadata.deadline,
      metadata.deadlineDate
    )
  );
}

function isTaskActivity(activity) {
  if (!activity) return false;

  const metadata =
    getTaskMetadata(activity);

  const type = normalize(
    firstValue(
      activity.activity_type,
      activity.activityType,
      metadata.activityType,
      metadata.activity_type,
      "task"
    )
  );

  return [
    "task",
    "assignment",
  ].includes(type);
}

async function findTaskById(taskId) {
  const id = clean(taskId);

  if (!id) return null;

  const result = await pool.query(
    `
      SELECT *
      FROM class_activities
      WHERE id::text = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

/* =========================================================
   TASK SERIALIZATION
========================================================= */

function serializeTask(task) {
  if (!task) return null;

  const metadata =
    getTaskMetadata(task);

  const attachments =
    Array.isArray(metadata.attachments)
      ? metadata.attachments
      : [];

  const instructions = clean(
    firstValue(
      task.instructions,
      metadata.instructions,
      metadata.taskInstructions,
      metadata.task_instructions,
      ""
    )
  );

  const dueDate =
    getTaskDueDate(task);

  const maxScore =
    getTaskMaxScore(task);

  const activityType = clean(
    firstValue(
      task.activity_type,
      metadata.activityType,
      metadata.activity_type,
      "task"
    )
  );

  const grade = clean(
    firstValue(
      task.grade,
      task.class,
      task.class_name,
      metadata.grade,
      metadata.class,
      ""
    )
  );

  const subject = clean(
    firstValue(
      task.subject,
      task.subject_name,
      metadata.subject,
      ""
    )
  );

  const tutorReference =
    getTaskTutorReference(task);

  return {
    ...task,

    id: task.id,
    taskId: task.id,
    task_id: task.id,

    title: task.title || "",
    description: task.description || "",

    instructions,

    dueDate,
    due_date: dueDate,

    maxScore,
    max_score: maxScore,

    activityType,
    activity_type: activityType,

    grade,
    class: grade,
    className: grade,
    class_name: grade,

    subject,
    subject_name: subject,

    tutorReference,
    tutor_reference: tutorReference,

    attachments,
    files: attachments,

    metadata,

    createdAt: task.created_at || null,
    created_at: task.created_at || null,

    updatedAt: task.updated_at || null,
    updated_at: task.updated_at || null,
  };
}

/* =========================================================
   SUBMISSION TABLE
========================================================= */

let submissionTableReady = false;

async function ensureSubmissionTable() {
  if (submissionTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_task_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id TEXT NOT NULL,
      student_id TEXT,
      student_name TEXT,
      student_email TEXT,
      submission_text TEXT,
      file_url TEXT,
      file_name TEXT,
      files JSONB DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'submitted',
      score NUMERIC,
      max_score NUMERIC,
      feedback TEXT,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      reviewed_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  submissionTableReady = true;
}

/* =========================================================
   SUBMISSION SERIALIZATION
========================================================= */

function buildTutorSubmission(
  submission,
  task = null
) {
  if (!submission) return null;

  const metadata =
    safeJsonParse(
      submission.metadata,
      {}
    );

  const taskMetadata =
    safeJsonParse(
      submission.task_metadata,
      getTaskMetadata(task)
    );

  const submittedAt =
    submission.submitted_at ||
    submission.created_at ||
    null;

  const reviewedAt =
    submission.reviewed_at ||
    null;

  const score =
    submission.score !== null &&
    submission.score !== undefined &&
    submission.score !== ""
      ? Number(submission.score)
      : null;

  const submittedMaxScore =
    firstValue(
      submission.max_score,
      submission.task_max_score,
      getTaskMaxScore(task)
    );

  const maxScore =
    submittedMaxScore === undefined
      ? null
      : Number(submittedMaxScore);

  const status = normalizeStatus(
    submission.status || "submitted"
  );

  const isReviewed =
    Boolean(reviewedAt) ||
    [
      "reviewed",
      "returned",
      "graded",
    ].includes(status);

  const isGraded =
    score !== null ||
    status === "graded";

  const dueDate = clean(
    firstValue(
      submission.task_due_at,
      getTaskDueDate(task),
      taskMetadata.dueDate,
      taskMetadata.due_date,
      ""
    )
  );

  let overdue = false;

  if (dueDate && submittedAt) {
    const due = new Date(dueDate);
    const submitted = new Date(submittedAt);

    if (
      !Number.isNaN(due.getTime()) &&
      !Number.isNaN(submitted.getTime())
    ) {
      overdue = submitted > due;
    }
  }

  let files = submission.files;

  if (typeof files === "string") {
    files = safeJsonParse(files, []);
  }

  if (!Array.isArray(files)) {
    files = [];
  }

  if (
    !files.length &&
    submission.file_url
  ) {
    files = [
      {
        url: submission.file_url,
        fileUrl: submission.file_url,
        name: submission.file_name || "Attachment",
        fileName: submission.file_name || "Attachment",
      },
    ];
  }

  const submissionText = clean(
    firstValue(
      submission.submission_text,
      submission.text,
      submission.answer,
      submission.content,
      ""
    )
  );

  const taskTitle = clean(
    firstValue(
      submission.task_title,
      task?.title,
      ""
    )
  );

  const taskDescription = clean(
    firstValue(
      submission.task_description,
      task?.description,
      ""
    )
  );

  const taskInstructions = clean(
    firstValue(
      submission.task_instructions,
      task?.instructions,
      taskMetadata.instructions,
      taskMetadata.taskInstructions,
      taskMetadata.task_instructions,
      ""
    )
  );

  const taskGrade = clean(
    firstValue(
      submission.task_grade,
      task?.grade,
      task?.class,
      taskMetadata.grade,
      taskMetadata.class,
      ""
    )
  );

  const taskSubject = clean(
    firstValue(
      submission.task_subject,
      task?.subject,
      taskMetadata.subject,
      ""
    )
  );

  const normalized = {
    ...submission,

    id: submission.id,
    submissionId: submission.id,
    submission_id: submission.id,

    taskId: submission.task_id,
    task_id: submission.task_id,

    taskTitle,
    task_title: taskTitle,

    taskDescription,
    task_description: taskDescription,

    taskInstructions,
    task_instructions: taskInstructions,

    taskGrade,
    task_grade: taskGrade,

    taskSubject,
    task_subject: taskSubject,

    taskActivityType: clean(
      firstValue(
        submission.task_activity_type,
        task?.activity_type,
        taskMetadata.activityType,
        "task"
      )
    ),

    task_activity_type: clean(
      firstValue(
        submission.task_activity_type,
        task?.activity_type,
        taskMetadata.activityType,
        "task"
      )
    ),

    taskMetadata,
    task_metadata: taskMetadata,

    studentId: submission.student_id || "",
    student_id: submission.student_id || "",

    studentName: submission.student_name || "",
    student_name: submission.student_name || "",

    studentEmail: submission.student_email || "",
    student_email: submission.student_email || "",

    submissionText,
    submission_text: submissionText,

    answer: submissionText,
    text: submissionText,

    files,

    fileUrl: submission.file_url || "",
    file_url: submission.file_url || "",

    fileName: submission.file_name || "",
    file_name: submission.file_name || "",

    score,
    maxScore,
    max_score: maxScore,

    feedback: submission.feedback || "",

    status: submission.status || "submitted",

    submittedAt,
    submitted_at: submittedAt,

    reviewedAt,
    reviewed_at: reviewedAt,

    reviewedBy: submission.reviewed_by || "",
    reviewed_by: submission.reviewed_by || "",

    dueDate,
    due_date: dueDate,

    isReviewed,
    isGraded,
    overdue,

    metadata,
  };

  normalized.studentSubmission = {
    id: normalized.id,
    submissionId: normalized.id,
    taskId: normalized.taskId,

    studentId: normalized.studentId,
    studentName: normalized.studentName,
    studentEmail: normalized.studentEmail,

    answer: normalized.submissionText,
    text: normalized.submissionText,
    submissionText: normalized.submissionText,

    files: normalized.files,

    fileUrl: normalized.fileUrl,
    fileName: normalized.fileName,

    submittedAt: normalized.submittedAt,
    status: normalized.status,
  };

  return normalized;
}

/* =========================================================
   GET ALL TASKS CREATED BY CURRENT TUTOR
   GET /api/academy/tutor/tasks
========================================================= */

router.get(
  "/tutor/tasks",
  async (req, res) => {
    try {
      const reference =
        getRequestTutorReference(req);

      const auth =
        await verifyTutor(reference);

      if (auth.error) {
        return res
          .status(auth.error.status)
          .json({
            success: false,
            code: auth.error.code,
            message: auth.error.message,
          });
      }

      const tutorReference =
        getTutorReference(auth.tutor);

      const result = await pool.query(
        `
          SELECT *
          FROM class_activities
          WHERE
            LOWER(TRIM(COALESCE(tutor_reference, ''))) =
              LOWER(TRIM($1))
          ORDER BY created_at DESC NULLS LAST
        `,
        [tutorReference]
      );

      const tasks = result.rows
        .filter(isTaskActivity)
        .map(serializeTask);

      return res.json({
        success: true,
        reference: tutorReference,
        tutorReference,
        tasks,
        activities: tasks,
        data: tasks,
        count: tasks.length,
        taskCount: tasks.length,
      });
    } catch (error) {
      console.error(
        "GET MY TASKS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        code: error?.code || "TUTOR_TASKS_LOAD_ERROR",
        message: error?.message || "Unable to load your tasks.",
        detail: error?.detail || null,
      });
    }
  }
);

/* =========================================================
   GET ONE TASK
   GET /api/academy/tutor/tasks/:taskId
========================================================= */

router.get(
  "/tutor/tasks/:taskId",
  async (req, res) => {
    try {
      const reference =
        getRequestTutorReference(req);

      const taskId =
        clean(req.params.taskId);

      if (!taskId) {
        return res.status(400).json({
          success: false,
          code: "TASK_ID_REQUIRED",
          message: "Task ID is required.",
        });
      }

      const auth =
        await verifyTutor(reference);

      if (auth.error) {
        return res
          .status(auth.error.status)
          .json({
            success: false,
            code: auth.error.code,
            message: auth.error.message,
          });
      }

      const task =
        await findTaskById(taskId);

      if (!task || !isTaskActivity(task)) {
        return res.status(404).json({
          success: false,
          code: "TASK_NOT_FOUND",
          message: "Task was not found.",
        });
      }

      const tutorReference =
        getTutorReference(auth.tutor);

      const owner =
        getTaskTutorReference(task);

      if (
        !owner ||
        normalize(owner) !== normalize(tutorReference)
      ) {
        return res.status(403).json({
          success: false,
          code: "TASK_NOT_YOUR_TASK",
          message: "This task does not belong to you.",
        });
      }

      const serialized =
        serializeTask(task);

      return res.json({
        success: true,
        task: serialized,
        activity: serialized,
      });
    } catch (error) {
      console.error(
        "GET ONE TASK ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        code: error?.code || "TASK_LOAD_ERROR",
        message: error?.message || "Unable to load task.",
        detail: error?.detail || null,
      });
    }
  }
);

/* =========================================================
   TUTOR GET ALL TASK SUBMISSIONS
   GET /api/academy/tutor/task-submissions
========================================================= */

router.get(
  "/tutor/task-submissions",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        getRequestTutorReference(req);

      const tutorCheck =
        await verifyTutor(reference);

      if (tutorCheck.error) {
        return res
          .status(tutorCheck.error.status)
          .json({
            success: false,
            code: tutorCheck.error.code,
            message: tutorCheck.error.message,
          });
      }

      const tutorReference =
        getTutorReference(tutorCheck.tutor);

      /*
       * Do not reference a.due_date or a.max_score here.
       * Those values are stored in task metadata.
       */
      const result = await pool.query(
        `
          SELECT
            s.*,

            a.title AS task_title,
            a.description AS task_description,

            COALESCE(
              a.metadata->>'instructions',
              a.metadata->>'taskInstructions',
              a.metadata->>'task_instructions',
              ''
            ) AS task_instructions,

            a.activity_type AS task_activity_type,
            a.grade AS task_grade,
            a.subject AS task_subject,
            a.metadata AS task_metadata,
            a.tutor_reference AS task_tutor_reference,

            COALESCE(
              a.metadata->>'dueDate',
              a.metadata->>'due_date',
              a.metadata->>'deadline',
              ''
            ) AS task_due_at,

            COALESCE(
              a.metadata->>'maxScore',
              a.metadata->>'max_score'
            ) AS task_max_score,

            a.created_at AS task_created_at

          FROM academy_task_submissions s

          LEFT JOIN class_activities a
            ON a.id::text = s.task_id::text

          ORDER BY
            s.submitted_at DESC NULLS LAST,
            s.created_at DESC NULLS LAST
        `
      );

      const submissions = result.rows
        .filter((row) => {
          const owner = clean(
            row.task_tutor_reference ||
              getTaskTutorReference({
                metadata: row.task_metadata,
              })
          );

          return (
            owner &&
            normalize(owner) ===
              normalize(tutorReference)
          );
        })
        .map((row) =>
          buildTutorSubmission(row)
        )
        .filter((item) =>
          isTaskActivity({
            activity_type: item.taskActivityType,
            metadata: item.taskMetadata,
          })
        );

      const awaitingReview =
        submissions.filter(
          (item) => !item.isReviewed
        );

      const graded =
        submissions.filter(
          (item) => item.isGraded
        );

      const overdue =
        submissions.filter(
          (item) => item.overdue
        );

      return res.json({
        success: true,

        submissions,
        data: submissions,

        count: submissions.length,
        total: submissions.length,

        awaitingReview: awaitingReview.length,
        submittedCount: awaitingReview.length,

        gradedCount: graded.length,

        reviewedCount:
          submissions.filter(
            (item) => item.isReviewed
          ).length,

        overdueCount: overdue.length,

        tutorReference,

        tutorName:
          getTutorName(tutorCheck.tutor),
      });
    } catch (error) {
      console.error(
        "Load tutor task submissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        code: error?.code || "TUTOR_SUBMISSIONS_LOAD_ERROR",
        message:
          error?.message ||
          "Unable to load task submissions.",
        detail: error?.detail || null,
        hint: error?.hint || null,
        table: error?.table || null,
        column: error?.column || null,
      });
    }
  }
);

/* =========================================================
   TUTOR GET SINGLE SUBMISSION
   GET /api/academy/tutor/task-submissions/:submissionId
========================================================= */

router.get(
  "/tutor/task-submissions/:submissionId",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        getRequestTutorReference(req);

      const submissionId =
        clean(req.params.submissionId);

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          code: "SUBMISSION_ID_REQUIRED",
          message: "Submission ID is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(reference);

      if (tutorCheck.error) {
        return res
          .status(tutorCheck.error.status)
          .json({
            success: false,
            code: tutorCheck.error.code,
            message: tutorCheck.error.message,
          });
      }

      const result = await pool.query(
        `
          SELECT *
          FROM academy_task_submissions
          WHERE id::text = $1
          LIMIT 1
        `,
        [submissionId]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          code: "SUBMISSION_NOT_FOUND",
          message: "Submission could not be found.",
        });
      }

      const submission = result.rows[0];

      const task =
        await findTaskById(submission.task_id);

      if (!task || !isTaskActivity(task)) {
        return res.status(404).json({
          success: false,
          code: "TASK_NOT_FOUND",
          message:
            "The task connected to this submission could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(tutorCheck.tutor);

      const owner =
        getTaskTutorReference(task);

      if (
        !owner ||
        normalize(owner) !== normalize(tutorReference)
      ) {
        return res.status(403).json({
          success: false,
          code: "SUBMISSION_NOT_YOUR_TASK",
          message:
            "This submission does not belong to one of your tasks.",
        });
      }

      const normalized =
        buildTutorSubmission(
          submission,
          task
        );

      return res.json({
        success: true,
        submission: normalized,
        task: serializeTask(task),
        studentSubmission:
          normalized.studentSubmission,
      });
    } catch (error) {
      console.error(
        "Load tutor submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        code: error?.code || "TUTOR_SUBMISSION_LOAD_ERROR",
        message:
          error?.message ||
          "Unable to load submission.",
        detail: error?.detail || null,
        hint: error?.hint || null,
      });
    }
  }
);

/* =========================================================
   TUTOR REVIEW / GRADE SUBMISSION
   PATCH /api/academy/tutor/task-submissions/:submissionId/review
========================================================= */

router.patch(
  "/tutor/task-submissions/:submissionId/review",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        getRequestTutorReference(req);

      const submissionId =
        clean(req.params.submissionId);

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          code: "SUBMISSION_ID_REQUIRED",
          message: "Submission ID is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(reference);

      if (tutorCheck.error) {
        return res
          .status(tutorCheck.error.status)
          .json({
            success: false,
            code: tutorCheck.error.code,
            message: tutorCheck.error.message,
          });
      }

      const result = await pool.query(
        `
          SELECT *
          FROM academy_task_submissions
          WHERE id::text = $1
          LIMIT 1
        `,
        [submissionId]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          code: "SUBMISSION_NOT_FOUND",
          message: "Submission could not be found.",
        });
      }

      const submission = result.rows[0];

      const task =
        await findTaskById(submission.task_id);

      if (!task || !isTaskActivity(task)) {
        return res.status(404).json({
          success: false,
          code: "TASK_NOT_FOUND",
          message:
            "The task connected to this submission could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(tutorCheck.tutor);

      const owner =
        getTaskTutorReference(task);

      if (
        !owner ||
        normalize(owner) !== normalize(tutorReference)
      ) {
        return res.status(403).json({
          success: false,
          code: "SUBMISSION_NOT_YOUR_TASK",
          message:
            "You cannot review a submission for another tutor's task.",
        });
      }

      const scoreValue = req.body?.score;

      let score = null;

      if (
        scoreValue !== undefined &&
        scoreValue !== null &&
        scoreValue !== ""
      ) {
        score = Number(scoreValue);

        if (
          !Number.isFinite(score) ||
          score < 0
        ) {
          return res.status(400).json({
            success: false,
            code: "INVALID_SCORE",
            message:
              "Score must be a valid non-negative number.",
          });
        }
      }

      const maxScoreValue =
        req.body?.maxScore ??
        req.body?.max_score;

      let maxScore = null;

      if (
        maxScoreValue !== undefined &&
        maxScoreValue !== null &&
        maxScoreValue !== ""
      ) {
        maxScore = Number(maxScoreValue);

        if (
          !Number.isFinite(maxScore) ||
          maxScore <= 0
        ) {
          return res.status(400).json({
            success: false,
            code: "INVALID_MAX_SCORE",
            message:
              "Maximum score must be a valid positive number.",
          });
        }
      } else {
        maxScore =
          submission.max_score !== null &&
          submission.max_score !== undefined
            ? Number(submission.max_score)
            : getTaskMaxScore(task);
      }

      if (
        score !== null &&
        maxScore !== null &&
        score > maxScore
      ) {
        return res.status(400).json({
          success: false,
          code: "SCORE_EXCEEDS_MAXIMUM",
          message:
            "Score cannot be greater than the maximum score.",
        });
      }

      const feedback = clean(
        req.body?.feedback ||
          req.body?.comment ||
          req.body?.comments
      );

      let status = normalize(
        req.body?.status || "reviewed"
      );

      if (
        ![
          "submitted",
          "reviewed",
          "returned",
        ].includes(status)
      ) {
        status = "reviewed";
      }

      const updated = await pool.query(
        `
          UPDATE academy_task_submissions
          SET
            status = $1,
            score = $2,
            max_score = $3,
            feedback = $4,
            reviewed_at = NOW(),
            reviewed_by = $5,
            updated_at = NOW()
          WHERE id::text = $6
          RETURNING *
        `,
        [
          status,
          score,
          maxScore,
          feedback || null,
          tutorReference,
          submissionId,
        ]
      );

      return res.json({
        success: true,
        message:
          "Task submission reviewed successfully.",
        submission:
          buildTutorSubmission(
            updated.rows[0],
            task
          ),
      });
    } catch (error) {
      console.error(
        "Review task submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        code: error?.code || "TASK_SUBMISSION_REVIEW_ERROR",
        message:
          error?.message ||
          "Unable to review task submission.",
        detail: error?.detail || null,
        hint: error?.hint || null,
      });
    }
  }
);

/* =========================================================
   TUTOR GET SUBMISSIONS FOR ONE TASK
   GET /api/academy/tutor/tasks/:taskId/submissions
========================================================= */

router.get(
  "/tutor/tasks/:taskId/submissions",
  async (req, res) => {
    try {
      await ensureSubmissionTable();

      const reference =
        getRequestTutorReference(req);

      const taskId =
        clean(req.params.taskId);

      if (!taskId) {
        return res.status(400).json({
          success: false,
          code: "TASK_ID_REQUIRED",
          message: "Task ID is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(reference);

      if (tutorCheck.error) {
        return res
          .status(tutorCheck.error.status)
          .json({
            success: false,
            code: tutorCheck.error.code,
            message: tutorCheck.error.message,
          });
      }

      const task =
        await findTaskById(taskId);

      if (!task || !isTaskActivity(task)) {
        return res.status(404).json({
          success: false,
          code: "TASK_NOT_FOUND",
          message: "The task could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(tutorCheck.tutor);

      const owner =
        getTaskTutorReference(task);

      if (
        !owner ||
        normalize(owner) !== normalize(tutorReference)
      ) {
        return res.status(403).json({
          success: false,
          code: "TASK_NOT_YOUR_TASK",
          message: "This task does not belong to you.",
        });
      }

      const result = await pool.query(
        `
          SELECT *
          FROM academy_task_submissions
          WHERE task_id::text = $1
          ORDER BY
            submitted_at DESC NULLS LAST,
            created_at DESC NULLS LAST
        `,
        [taskId]
      );

      const submissions =
        result.rows.map((row) =>
          buildTutorSubmission(row, task)
        );

      return res.json({
        success: true,

        task: serializeTask(task),

        submissions,
        data: submissions,

        count: submissions.length,

        submittedCount:
          submissions.filter(
            (item) => !item.isReviewed
          ).length,

        reviewedCount:
          submissions.filter(
            (item) => item.isReviewed
          ).length,

        gradedCount:
          submissions.filter(
            (item) => item.isGraded
          ).length,

        overdueCount:
          submissions.filter(
            (item) => item.overdue
          ).length,
      });
    } catch (error) {
      console.error(
        "Load task submissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        code: error?.code || "TASK_SUBMISSIONS_LOAD_ERROR",
        message:
          error?.message ||
          "Unable to load task submissions.",
        detail: error?.detail || null,
        hint: error?.hint || null,
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

export default router;