import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function normalize(value) {
  return clean(value).toLowerCase().trim();
}

function normalizeStatus(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

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

/* =========================================================
   TUTOR HELPERS
========================================================= */

function getTutorReference(tutor) {
  return clean(
    tutor?.reference ||
      tutor?.application_reference ||
      tutor?.applicationReference ||
      tutor?.tutor_reference ||
      tutor?.tutorReference
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

/*
============================================================
FIND TUTOR

Checks the possible reference columns directly.

This is safer than loading every tutor and comparing only
one JavaScript property.
============================================================
*/

async function findTutorByReference(reference) {
  const wanted = clean(reference);

  if (!wanted) {
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
    /*
      Some databases may not have all optional columns.
      Fall back to the original flexible lookup.
    */

    console.warn(
      "Flexible tutor reference lookup failed:",
      error?.message
    );
  }

  /*
  ============================================================
  FALLBACK

  This handles databases where the tutor reference is stored
  under a JSON field or where one of the optional columns does
  not exist.
  ============================================================
  */

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM academy_tutor_applications
        ORDER BY created_at DESC
      `
    );

    return (
      result.rows || []
    ).find((tutor) => {
      const possibleReferences = [
        tutor?.reference,
        tutor?.application_reference,
        tutor?.applicationReference,
        tutor?.tutor_reference,
        tutor?.tutorReference,
      ];

      return possibleReferences.some(
        (value) =>
          normalize(value) ===
          normalize(wanted)
      );
    }) || null;
  } catch (error) {
    console.error(
      "Tutor lookup fallback error:",
      error
    );

    throw error;
  }
}

async function verifyTutor(reference) {
  const wanted = clean(reference);

  if (!wanted) {
    return {
      error: {
        status: 400,
        code: "TUTOR_REFERENCE_REQUIRED",
        message:
          "Tutor reference is required.",
      },
    };
  }

  const tutor =
    await findTutorByReference(
      wanted
    );

  if (!tutor) {
    console.log(
      "❌ Tutor not found for reference:",
      wanted
    );

    return {
      error: {
        status: 404,
        code: "TUTOR_NOT_FOUND",
        message:
          "Tutor account could not be found.",
      },
    };
  }

  const status =
    normalizeStatus(
      tutor.application_status ||
        tutor.status
    );

  console.log(
    "✅ Tutor found:",
    getTutorName(tutor),
    "| reference:",
    getTutorReference(tutor),
    "| status:",
    status
  );

  if (status !== "verified") {
    return {
      error: {
        status: 403,
        code:
          "TUTOR_NOT_VERIFIED",
        message:
          "Your tutor account has not been verified yet.",
      },
    };
  }

  return {
    tutor,
  };
}

/* =========================================================
   TASK HELPERS
========================================================= */

function getTaskTutorReference(task) {
  if (!task) {
    return "";
  }

  const metadata =
    safeJsonParse(
      task.metadata,
      {}
    );

  return clean(
    task.tutor_reference ||
      task.tutorReference ||
      metadata.tutorReference ||
      metadata.tutor_reference ||
      metadata.reference ||
      metadata.createdBy ||
      ""
  );
}

function getTaskMaxScore(task) {
  if (!task) {
    return null;
  }

  const metadata =
    safeJsonParse(
      task.metadata,
      {}
    );

  const value =
    task.max_score ??
    task.maxScore ??
    metadata.maxScore ??
    metadata.max_score ??
    null;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function isTaskActivity(activity) {
  if (!activity) {
    return false;
  }

  const metadata =
    safeJsonParse(
      activity.metadata,
      {}
    );

  const activityType =
    normalize(
      activity.activity_type ||
        activity.activityType ||
        metadata.activityType ||
        metadata.activity_type ||
        "task"
    );

  return (
    activityType === "task" ||
    activityType === "assignment"
  );
}

async function findTaskById(taskId) {
  const id = clean(taskId);

  if (!id) {
    return null;
  }

  const result =
    await pool.query(
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
  const metadata =
    safeJsonParse(
      task.metadata,
      {}
    );

  const attachments =
    Array.isArray(
      metadata.attachments
    )
      ? metadata.attachments
      : [];

  const instructions =
    task.instructions ||
    metadata.instructions ||
    "";

  const dueDate =
    task.due_date ||
    metadata.dueDate ||
    metadata.due_date ||
    "";

  const maxScore =
    task.max_score ??
    metadata.maxScore ??
    metadata.max_score ??
    null;

  const activityType =
    task.activity_type ||
    metadata.activityType ||
    "task";

  const grade =
    task.grade ||
    task.class ||
    task.class_name ||
    metadata.grade ||
    metadata.class ||
    "";

  const subject =
    task.subject ||
    task.subject_name ||
    metadata.subject ||
    "";

  const tutorReference =
    task.tutor_reference ||
    task.tutorReference ||
    metadata.tutorReference ||
    metadata.tutor_reference ||
    metadata.reference ||
    "";

  return {
    ...task,

    id: task.id,

    taskId: task.id,

    task_id: task.id,

    title:
      task.title || "",

    description:
      task.description || "",

    instructions,

    dueDate,

    due_date:
      dueDate,

    maxScore,

    max_score:
      maxScore,

    activityType,

    activity_type:
      activityType,

    grade,

    class:
      grade,

    className:
      grade,

    class_name:
      grade,

    subject,

    subject_name:
      subject,

    tutorReference,

    tutor_reference:
      tutorReference,

    attachments,

    files:
      attachments,

    metadata,

    createdAt:
      task.created_at || null,

    created_at:
      task.created_at || null,

    updatedAt:
      task.updated_at || null,

    updated_at:
      task.updated_at || null,
  };
}

/* =========================================================
   SUBMISSION HELPERS
========================================================= */

async function ensureSubmissionTable() {
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
}

function buildTutorSubmission(
  submission,
  task = null
) {
  if (!submission) {
    return null;
  }

  const metadata =
    safeJsonParse(
      submission.metadata,
      {}
    );

  const taskMetadata =
    safeJsonParse(
      task?.metadata,
      {}
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
    submission.score !== undefined
      ? Number(
          submission.score
        )
      : null;

  const maxScore =
    submission.max_score !== null &&
    submission.max_score !== undefined
      ? Number(
          submission.max_score
        )
      : getTaskMaxScore(task);

  const status =
    normalizeStatus(
      submission.status ||
        "submitted"
    );

  const isReviewed =
    Boolean(
      submission.reviewed_at
    ) ||
    [
      "reviewed",
      "returned",
      "graded",
    ].includes(status);

  const isGraded =
    score !== null ||
    status === "graded";

  let overdue = false;

  const dueDate =
    task?.due_date ||
    taskMetadata.dueDate ||
    taskMetadata.due_date ||
    "";

  if (dueDate && submittedAt) {
    const due =
      new Date(dueDate);

    const submitted =
      new Date(submittedAt);

    if (
      !Number.isNaN(
        due.getTime()
      ) &&
      !Number.isNaN(
        submitted.getTime()
      )
    ) {
      overdue =
        submitted > due;
    }
  }

  const files =
    Array.isArray(
      submission.files
    )
      ? submission.files
      : safeJsonParse(
          submission.files,
          []
        );

  return {
    ...submission,

    id:
      submission.id,

    submissionId:
      submission.id,

    submission_id:
      submission.id,

    taskId:
      submission.task_id,

    task_id:
      submission.task_id,

    taskTitle:
      submission.task_title ||
      task?.title ||
      "",

    task_title:
      submission.task_title ||
      task?.title ||
      "",

    taskDescription:
      submission.task_description ||
      task?.description ||
      "",

    task_description:
      submission.task_description ||
      task?.description ||
      "",

    taskInstructions:
      submission.task_instructions ||
      task?.instructions ||
      taskMetadata.instructions ||
      "",

    task_instructions:
      submission.task_instructions ||
      task?.instructions ||
      taskMetadata.instructions ||
      "",

    taskActivityType:
      submission.task_activity_type ||
      task?.activity_type ||
      taskMetadata.activityType ||
      "task",

    task_activity_type:
      submission.task_activity_type ||
      task?.activity_type ||
      taskMetadata.activityType ||
      "task",

    taskGrade:
      submission.task_grade ||
      task?.grade ||
      task?.class ||
      "",

    task_grade:
      submission.task_grade ||
      task?.grade ||
      task?.class ||
      "",

    taskSubject:
      submission.task_subject ||
      task?.subject ||
      "",

    task_subject:
      submission.task_subject ||
      task?.subject ||
      "",

    taskMetadata:
      safeJsonParse(
        submission.task_metadata,
        taskMetadata
      ),

    task_metadata:
      safeJsonParse(
        submission.task_metadata,
        taskMetadata
      ),

    studentId:
      submission.student_id ||
      "",

    student_id:
      submission.student_id ||
      "",

    studentName:
      submission.student_name ||
      "",

    student_name:
      submission.student_name ||
      "",

    studentEmail:
      submission.student_email ||
      "",

    student_email:
      submission.student_email ||
      "",

    submissionText:
      submission.submission_text ||
      submission.text ||
      submission.answer ||
      "",

    submission_text:
      submission.submission_text ||
      submission.text ||
      submission.answer ||
      "",

    files,

    score,

    maxScore,

    max_score:
      maxScore,

    feedback:
      submission.feedback ||
      "",

    status:
      submission.status ||
      "submitted",

    submittedAt,

    submitted_at:
      submittedAt,

    reviewedAt,

    reviewed_at:
      reviewedAt,

    reviewedBy:
      submission.reviewed_by ||
      "",

    reviewed_by:
      submission.reviewed_by ||
      "",

    isReviewed,

    isGraded,

    overdue,

    metadata,
  };
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
        clean(
          req.query?.reference ||
            req.query?.tutor_reference ||
            req.query?.tutorReference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

      const auth =
        await verifyTutor(
          reference
        );

      if (auth.error) {
        return res
          .status(
            auth.error.status
          )
          .json({
            success: false,
            code:
              auth.error.code,
            message:
              auth.error.message,
          });
      }

      const tutorReference =
        getTutorReference(
          auth.tutor
        );

      const result =
        await pool.query(
          `
            SELECT
              id,
              tutor_reference,
              grade,
              subject,
              activity_type,
              title,
              description,
              metadata,
              created_at
            FROM class_activities
            WHERE
              LOWER(
                TRIM(
                  COALESCE(
                    tutor_reference,
                    ''
                  )
                )
              ) = LOWER(
                TRIM($1)
              )
              AND LOWER(
                COALESCE(
                  activity_type,
                  'task'
                )
              ) = 'task'
            ORDER BY
              created_at DESC,
              id DESC
          `,
          [tutorReference]
        );

      const tasks =
        (
          result.rows || []
        ).map(
          serializeTask
        );

      return res.json({
        success: true,

        reference:
          tutorReference,

        tutorReference,

        tasks,

        activities:
          tasks,

        data:
          tasks,

        count:
          tasks.length,

        taskCount:
          tasks.length,
      });
    } catch (error) {
      console.error(
        "GET MY TASKS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TUTOR_TASKS_LOAD_ERROR",

        message:
          error?.message ||
          "Unable to load your tasks.",

        detail:
          error?.detail ||
          null,
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
        clean(
          req.query?.reference ||
            req.query?.tutor_reference ||
            req.query?.tutorReference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

      const taskId =
        clean(
          req.params.taskId
        );

      if (!taskId) {
        return res.status(400).json({
          success: false,

          code:
            "TASK_ID_REQUIRED",

          message:
            "Task ID is required.",
        });
      }

      const auth =
        await verifyTutor(
          reference
        );

      if (auth.error) {
        return res
          .status(
            auth.error.status
          )
          .json({
            success: false,
            code:
              auth.error.code,
            message:
              auth.error.message,
          });
      }

      const tutorReference =
        getTutorReference(
          auth.tutor
        );

      const result =
        await pool.query(
          `
            SELECT
              id,
              tutor_reference,
              grade,
              subject,
              activity_type,
              title,
              description,
              metadata,
              created_at
            FROM class_activities
            WHERE
              id::text = $1
              AND LOWER(
                TRIM(
                  COALESCE(
                    tutor_reference,
                    ''
                  )
                )
              ) = LOWER(
                TRIM($2)
              )
              AND LOWER(
                COALESCE(
                  activity_type,
                  'task'
                )
              ) = 'task'
            LIMIT 1
          `,
          [
            taskId,
            tutorReference,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,

          code:
            "TASK_NOT_FOUND",

          message:
            "Task was not found.",
        });
      }

      const task =
        serializeTask(
          result.rows[0]
        );

      return res.json({
        success: true,

        task,

        activity:
          task,
      });
    } catch (error) {
      console.error(
        "GET ONE TASK ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TASK_LOAD_ERROR",

        message:
          error?.message ||
          "Unable to load task.",

        detail:
          error?.detail ||
          null,
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
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
            req.query?.applicationReference ||
            req.query?.application_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

      console.log(
        "📥 Tutor submission request:",
        {
          reference,
          tutorReference:
            req.query?.tutorReference,
        }
      );

      const tutorCheck =
        await verifyTutor(
          reference
        );

      if (tutorCheck.error) {
        return res
          .status(
            tutorCheck.error.status
          )
          .json({
            success: false,

            code:
              tutorCheck.error.code,

            message:
              tutorCheck.error.message,
          });
      }

      const tutor =
        tutorCheck.tutor;

      const tutorReference =
        getTutorReference(
          tutor
        );

      /*
      --------------------------------------------------------
      Load submissions and their tasks.
      --------------------------------------------------------
      */

      const result =
        await pool.query(
          `
            SELECT
              s.*,

              a.title AS task_title,
              a.description AS task_description,
              a.instructions AS task_instructions,
              a.activity_type AS task_activity_type,
              a.grade AS task_grade,
              a.subject AS task_subject,
              a.metadata AS task_metadata,
              a.tutor_reference AS task_tutor_reference,
              a.due_date AS task_due_at,
              a.max_score AS task_max_score,
              a.created_at AS task_created_at

            FROM academy_task_submissions s

            LEFT JOIN class_activities a
              ON a.id::text =
                 s.task_id::text

            WHERE
              LOWER(
                TRIM(
                  COALESCE(
                    a.tutor_reference,
                    ''
                  )
                )
              ) = LOWER(
                TRIM($1)
              )

            ORDER BY
              s.submitted_at DESC NULLS LAST,
              s.created_at DESC NULLS LAST
          `,
          [tutorReference]
        );

      const submissions =
        (
          result.rows || []
        )
          .map((row) =>
            buildTutorSubmission(
              row
            )
          )
          .filter((item) =>
            isTaskActivity({
              activity_type:
                item.taskActivityType,

              metadata:
                item.taskMetadata,
            })
          );

      const awaitingReview =
        submissions.filter(
          (item) =>
            !item.isReviewed
        );

      const graded =
        submissions.filter(
          (item) =>
            item.isGraded
        );

      const overdue =
        submissions.filter(
          (item) =>
            item.overdue
        );

      return res.json({
        success: true,

        submissions,

        data:
          submissions,

        count:
          submissions.length,

        total:
          submissions.length,

        awaitingReview:
          awaitingReview.length,

        submittedCount:
          awaitingReview.length,

        gradedCount:
          graded.length,

        reviewedCount:
          submissions.filter(
            (item) =>
              item.isReviewed
          ).length,

        overdueCount:
          overdue.length,

        tutorReference,

        tutorName:
          getTutorName(tutor),
      });
    } catch (error) {
      console.error(
        "Load tutor task submissions error:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TUTOR_SUBMISSIONS_LOAD_ERROR",

        message:
          error?.message ||
          "Unable to load task submissions.",

        detail:
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,

        table:
          error?.table ||
          null,

        column:
          error?.column ||
          null,
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
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

      const submissionId =
        clean(
          req.params.submissionId
        );

      if (!submissionId) {
        return res.status(400).json({
          success: false,

          code:
            "SUBMISSION_ID_REQUIRED",

          message:
            "Submission ID is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(
          reference
        );

      if (tutorCheck.error) {
        return res
          .status(
            tutorCheck.error.status
          )
          .json({
            success: false,

            code:
              tutorCheck.error.code,

            message:
              tutorCheck.error.message,
          });
      }

      const result =
        await pool.query(
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

          code:
            "SUBMISSION_NOT_FOUND",

          message:
            "Submission could not be found.",
        });
      }

      const submission =
        result.rows[0];

      const task =
        await findTaskById(
          submission.task_id
        );

      if (!task) {
        return res.status(404).json({
          success: false,

          code:
            "TASK_NOT_FOUND",

          message:
            "The task connected to this submission could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(
          tutorCheck.tutor
        );

      const taskTutorReference =
        getTaskTutorReference(
          task
        );

      if (
        taskTutorReference &&
        normalize(
          taskTutorReference
        ) !==
          normalize(
            tutorReference
          )
      ) {
        return res.status(403).json({
          success: false,

          code:
            "SUBMISSION_NOT_YOUR_TASK",

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

        submission:
          normalized,

        task,

        studentSubmission:
          normalized.studentSubmission ||
          normalized,
      });
    } catch (error) {
      console.error(
        "Load tutor submission error:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TUTOR_SUBMISSION_LOAD_ERROR",

        message:
          error?.message ||
          "Unable to load submission.",

        detail:
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
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
        clean(
          req.body?.reference ||
            req.body?.tutorReference ||
            req.body?.tutor_reference ||
            req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

      const submissionId =
        clean(
          req.params.submissionId
        );

      if (!submissionId) {
        return res.status(400).json({
          success: false,

          code:
            "SUBMISSION_ID_REQUIRED",

          message:
            "Submission ID is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(
          reference
        );

      if (tutorCheck.error) {
        return res
          .status(
            tutorCheck.error.status
          )
          .json({
            success: false,

            code:
              tutorCheck.error.code,

            message:
              tutorCheck.error.message,
          });
      }

      const scoreValue =
        req.body?.score;

      const maxScoreValue =
        req.body?.maxScore ??
        req.body?.max_score;

      const feedback =
        clean(
          req.body?.feedback ||
            req.body?.comment ||
            req.body?.comments
        );

      let status =
        normalize(
          req.body?.status ||
            "reviewed"
        );

      if (
        ![
          "submitted",
          "reviewed",
          "returned",
        ].includes(status)
      ) {
        status =
          "reviewed";
      }

      let score = null;

      if (
        scoreValue !==
          undefined &&
        scoreValue !== null &&
        scoreValue !== ""
      ) {
        score =
          Number(scoreValue);

        if (
          !Number.isFinite(score) ||
          score < 0
        ) {
          return res.status(400).json({
            success: false,

            code:
              "INVALID_SCORE",

            message:
              "Score must be a valid non-negative number.",
          });
        }
      }

      let maxScore = null;

      if (
        maxScoreValue !==
          undefined &&
        maxScoreValue !== null &&
        maxScoreValue !== ""
      ) {
        maxScore =
          Number(maxScoreValue);

        if (
          !Number.isFinite(
            maxScore
          ) ||
          maxScore <= 0
        ) {
          return res.status(400).json({
            success: false,

            code:
              "INVALID_MAX_SCORE",

            message:
              "Maximum score must be a valid positive number.",
          });
        }
      }

      const result =
        await pool.query(
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

          code:
            "SUBMISSION_NOT_FOUND",

          message:
            "Submission could not be found.",
        });
      }

      const submission =
        result.rows[0];

      const task =
        await findTaskById(
          submission.task_id
        );

      if (!task) {
        return res.status(404).json({
          success: false,

          code:
            "TASK_NOT_FOUND",

          message:
            "The task connected to this submission could not be found.",
        });
      }

      const tutorReference =
        getTutorReference(
          tutorCheck.tutor
        );

      const taskTutorReference =
        getTaskTutorReference(
          task
        );

      if (
        taskTutorReference &&
        normalize(
          taskTutorReference
        ) !==
          normalize(
            tutorReference
          )
      ) {
        return res.status(403).json({
          success: false,

          code:
            "SUBMISSION_NOT_YOUR_TASK",

          message:
            "You cannot review a submission for another tutor's task.",
        });
      }

      if (
        maxScore === null
      ) {
        maxScore =
          submission.max_score !==
            null &&
          submission.max_score !==
            undefined
            ? Number(
                submission.max_score
              )
            : getTaskMaxScore(
                task
              );
      }

      if (
        score !== null &&
        maxScore !== null &&
        score > maxScore
      ) {
        return res.status(400).json({
          success: false,

          code:
            "SCORE_EXCEEDS_MAXIMUM",

          message:
            "Score cannot be greater than the maximum score.",
        });
      }

      const updateResult =
        await pool.query(
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

            feedback ||
              null,

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
            updateResult.rows[0],
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

        code:
          error?.code ||
          "TASK_SUBMISSION_REVIEW_ERROR",

        message:
          error?.message ||
          "Unable to review task submission.",

        detail:
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
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
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

      const taskId =
        clean(
          req.params.taskId
        );

      if (!taskId) {
        return res.status(400).json({
          success: false,

          code:
            "TASK_ID_REQUIRED",

          message:
            "Task ID is required.",
        });
      }

      const tutorCheck =
        await verifyTutor(
          reference
        );

      if (tutorCheck.error) {
        return res
          .status(
            tutorCheck.error.status
          )
          .json({
            success: false,

            code:
              tutorCheck.error.code,

            message:
              tutorCheck.error.message,
          });
      }

      const task =
        await findTaskById(
          taskId
        );

      if (!task) {
        return res.status(404).json({
          success: false,

          code:
            "TASK_NOT_FOUND",

          message:
            "The task could not be found.",
        });
      }

      if (
        !isTaskActivity(task)
      ) {
        return res.status(400).json({
          success: false,

          code:
            "INVALID_TASK",

          message:
            "This activity is not a student task.",
        });
      }

      const tutorReference =
        getTutorReference(
          tutorCheck.tutor
        );

      const taskTutorReference =
        getTaskTutorReference(
          task
        );

      if (
        taskTutorReference &&
        normalize(
          taskTutorReference
        ) !==
          normalize(
            tutorReference
          )
      ) {
        return res.status(403).json({
          success: false,

          code:
            "TASK_NOT_YOUR_TASK",

          message:
            "This task does not belong to you.",
        });
      }

      const result =
        await pool.query(
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
        result.rows.map(
          (row) =>
            buildTutorSubmission(
              row,
              task
            )
        );

      return res.json({
        success: true,

        task,

        submissions,

        data:
          submissions,

        count:
          submissions.length,

        submittedCount:
          submissions.filter(
            (item) =>
              !item.isReviewed
          ).length,

        reviewedCount:
          submissions.filter(
            (item) =>
              item.isReviewed
          ).length,

        gradedCount:
          submissions.filter(
            (item) =>
              item.isGraded
          ).length,

        overdueCount:
          submissions.filter(
            (item) =>
              item.overdue
          ).length,
      });
    } catch (error) {
      console.error(
        "Load task submissions error:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TASK_SUBMISSIONS_LOAD_ERROR",

        message:
          error?.message ||
          "Unable to load task submissions.",

        detail:
          error?.detail ||
          null,

        hint:
          error?.hint ||
          null,
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

export default router;
