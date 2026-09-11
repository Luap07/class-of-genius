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

async function findTutorByReference(reference) {
  const wanted = clean(reference);

  if (!wanted) {
    return null;
  }

  const result = await pool.query(`
    SELECT *
    FROM academy_tutor_applications
    ORDER BY created_at DESC
  `);

  return (
    result.rows || []
  ).find(
    (tutor) =>
      getTutorReference(tutor) === wanted
  ) || null;
}

async function verifyTutor(reference) {
  const tutor =
    await findTutorByReference(reference);

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

  const status =
    normalizeStatus(
      tutor.application_status ||
        tutor.status
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

    tutorReference:
      task.tutor_reference || "",

    tutor_reference:
      task.tutor_reference || "",

    attachments,

    files:
      attachments,

    metadata,

    createdAt:
      task.created_at || null,

    created_at:
      task.created_at || null,

    updatedAt:
      null,

    updated_at:
      null,
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

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
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
              tutor_reference = $1
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
          [reference]
        );

      const tasks =
        (
          result.rows || []
        ).map(
          serializeTask
        );

      return res.json({
        success: true,

        reference,

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
          error?.detail || null,
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

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

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
              id = $1
              AND tutor_reference = $2
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
            reference,
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
          error?.detail || null,
      });
    }
  }
);

/* =========================================================
   UPDATE TASK
   PATCH /api/academy/tutor/tasks/:taskId
========================================================= */

router.patch(
  "/tutor/tasks/:taskId",
  async (req, res) => {
    try {
      const reference =
        clean(
          req.body?.reference ||
            req.body?.tutor_reference ||
            req.body?.tutorReference ||
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

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

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

      const existing =
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
              id = $1
              AND tutor_reference = $2
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
            reference,
          ]
        );

      if (!existing.rows.length) {
        return res.status(404).json({
          success: false,
          code:
            "TASK_NOT_FOUND",
          message:
            "Task was not found or does not belong to you.",
        });
      }

      const current =
        existing.rows[0];

      const currentMetadata =
        safeJsonParse(
          current.metadata,
          {}
        );

      const title =
        clean(
          req.body?.title ??
            current.title
        );

      if (!title) {
        return res.status(400).json({
          success: false,
          code:
            "TITLE_REQUIRED",
          message:
            "Task title is required.",
        });
      }

      const description =
        clean(
          req.body?.description ??
            current.description
        );

      const instructions =
        clean(
          req.body?.instructions ??
            currentMetadata.instructions ??
            ""
        );

      const dueDate =
        clean(
          req.body?.dueDate ??
            req.body?.due_date ??
            currentMetadata.dueDate ??
            currentMetadata.due_date ??
            ""
        );

      let maxScore =
        req.body?.maxScore ??
        req.body?.max_score ??
        currentMetadata.maxScore ??
        currentMetadata.max_score ??
        null;

      if (
        maxScore !== null &&
        maxScore !== ""
      ) {
        maxScore =
          Number(maxScore);

        if (
          Number.isNaN(maxScore) ||
          maxScore < 0
        ) {
          return res.status(400).json({
            success: false,
            code:
              "INVALID_MAX_SCORE",
            message:
              "Max score must be a valid non-negative number.",
          });
        }
      } else {
        maxScore = null;
      }

      const metadata = {
        ...currentMetadata,

        instructions:
          instructions ||
          null,

        dueDate:
          dueDate ||
          null,

        maxScore,

        activityType:
          "task",

        class:
          current.grade ||
          currentMetadata.class ||
          "",

        grade:
          current.grade ||
          currentMetadata.grade ||
          "",

        subject:
          current.subject ||
          currentMetadata.subject ||
          "",

        createdBy:
          current.tutor_reference ||
          reference,
      };

      const result =
        await pool.query(
          `
            UPDATE class_activities
            SET
              title = $1,
              description = $2,
              metadata = $3::jsonb
            WHERE
              id = $4
              AND tutor_reference = $5
              AND LOWER(
                COALESCE(
                  activity_type,
                  'task'
                )
              ) = 'task'
            RETURNING
              id,
              tutor_reference,
              grade,
              subject,
              activity_type,
              title,
              description,
              metadata,
              created_at
          `,
          [
            title,

            description ||
              null,

            JSON.stringify(
              metadata
            ),

            taskId,

            reference,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          code:
            "TASK_NOT_FOUND",
          message:
            "Task could not be updated.",
        });
      }

      const task =
        serializeTask(
          result.rows[0]
        );

      return res.json({
        success: true,

        message:
          "Task updated successfully.",

        task,

        activity:
          task,
      });
    } catch (error) {
      console.error(
        "UPDATE TASK ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TASK_UPDATE_ERROR",

        message:
          error?.message ||
          "Unable to update task.",

        detail:
          error?.detail || null,

        column:
          error?.column || null,
      });
    }
  }
);

/* =========================================================
   DELETE TASK
   DELETE /api/academy/tutor/tasks/:taskId
========================================================= */

router.delete(
  "/tutor/tasks/:taskId",
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const reference =
        clean(
          req.body?.reference ||
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

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

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

      await client.query(
        "BEGIN"
      );

      const existing =
        await client.query(
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
              id = $1
              AND tutor_reference = $2
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
            reference,
          ]
        );

      if (!existing.rows.length) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          code:
            "TASK_NOT_FOUND",
          message:
            "Task was not found or does not belong to you.",
        });
      }

      try {
        await client.query(
          `
            DELETE FROM academy_task_submissions
            WHERE task_id::text = $1
          `,
          [taskId]
        );
      } catch (submissionError) {
        console.log(
          "Task submission cleanup skipped:",
          submissionError?.message
        );
      }

      const result =
        await client.query(
          `
            DELETE FROM class_activities
            WHERE
              id = $1
              AND tutor_reference = $2
              AND LOWER(
                COALESCE(
                  activity_type,
                  'task'
                )
              ) = 'task'
            RETURNING
              id,
              tutor_reference,
              grade,
              subject,
              activity_type,
              title,
              description,
              metadata,
              created_at
          `,
          [
            taskId,
            reference,
          ]
        );

      if (!result.rows.length) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          code:
            "TASK_NOT_FOUND",
          message:
            "Task could not be deleted.",
        });
      }

      await client.query(
        "COMMIT"
      );

      return res.json({
        success: true,

        message:
          "Task deleted successfully.",

        taskId,

        task:
          serializeTask(
            result.rows[0]
          ),
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch {
        // Ignore rollback errors.
      }

      console.error(
        "DELETE TASK ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        code:
          error?.code ||
          "TASK_DELETE_ERROR",

        message:
          error?.message ||
          "Unable to delete task.",

        detail:
          error?.detail || null,
      });
    } finally {
      client.release();
    }
  }
);

export default router;
