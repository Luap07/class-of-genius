import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

// ============================================================
// HELPERS
// ============================================================

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const parseId = (value) => {
  const id = clean(value);

  if (!/^\d+$/.test(id)) {
    return null;
  }

  return id;
};

const getTutorReference = (req) => {
  return clean(
    req.query?.reference ||
      req.query?.tutorReference ||
      req.query?.tutor_reference ||
      req.headers?.["x-tutor-reference"] ||
      req.body?.reference ||
      req.body?.tutorReference ||
      req.body?.tutor_reference
  );
};

const normalizeStatus = (value) => {
  const status = clean(value).toLowerCase();

  if (!status) {
    return "reviewed";
  }

  if (status === "graded") {
    return "reviewed";
  }

  if (
    status === "submitted" ||
    status === "reviewed" ||
    status === "returned"
  ) {
    return status;
  }

  return null;
};

// ============================================================
// TEST ROUTE
//
// GET /api/academy/tutor/assignments/test
// ============================================================

router.get("/test", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 1 AS connected
    `);

    return res.status(200).json({
      success: true,
      message: "Tutor assignment route is working.",
      database:
        result.rows[0]?.connected === 1,
    });
  } catch (error) {
    console.error(
      "❌ Tutor assignment route test failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Tutor assignment route reached, but database failed.",
      error: error.message,
    });
  }
});

// ============================================================
// GET ASSIGNMENT DETAILS
//
// GET /api/academy/tutor/assignments/:id
// ============================================================

router.get("/:id", async (req, res) => {
  const assignmentId =
    parseId(req.params.id);

  const tutorReference =
    getTutorReference(req);

  if (!assignmentId) {
    return res.status(400).json({
      success: false,
      message: "Invalid assignment ID.",
    });
  }

  if (!tutorReference) {
    return res.status(401).json({
      success: false,
      message:
        "Tutor reference is required.",
    });
  }

  try {
    // ----------------------------------------------------------
    // ASSIGNMENT
    // ----------------------------------------------------------

    const assignmentResult =
      await pool.query(
        `
        SELECT
          a.id,
          a.tutor_reference,
          a.grade,
          a.subject,
          a.title,
          a.description,
          a.instructions,
          a.due_at,
          a.max_score,
          a.live_class_id,
          a.status,
          a.created_at,
          a.updated_at,
          a.tutor_name,
          a.due_date,
          a.total_questions,
          a.total_marks,
          a.result_released
        FROM academy_assignments AS a
        WHERE a.id = $1
          AND a.tutor_reference = $2
        LIMIT 1
        `,
        [
          assignmentId,
          tutorReference,
        ]
      );

    if (
      assignmentResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found.",
      });
    }

    const assignment =
      assignmentResult.rows[0];

    // ----------------------------------------------------------
    // QUESTIONS
    // ----------------------------------------------------------

    const questionsResult =
      await pool.query(
        `
        SELECT
          q.id,
          q.assignment_id,
          q.question_number,
          q.question,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_answer,
          q.reason,
          q.marks,
          q.created_at
        FROM academy_assignment_questions AS q
        WHERE q.assignment_id = $1
        ORDER BY
          q.question_number ASC,
          q.id ASC
        `,
        [assignmentId]
      );

    // ----------------------------------------------------------
    // SUBMISSION COUNT
    // ----------------------------------------------------------

    const submissionCountResult =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM academy_assignment_submissions AS s
        WHERE s.assignment_id = $1
        `,
        [assignmentId]
      );

    const submissionCount =
      submissionCountResult.rows[0]
        ?.count || 0;

    return res.status(200).json({
      success: true,
      assignment,
      questions:
        questionsResult.rows,
      submissionCount,
      count: submissionCount,
    });
  } catch (error) {
    console.error(
      "❌ GET tutor assignment failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load assignment.",
      error: error.message,
    });
  }
});

// ============================================================
// GET ASSIGNMENT SUBMISSIONS
//
// GET /api/academy/tutor/assignments/:id/submissions
// ============================================================

router.get(
  "/:id/submissions",
  async (req, res) => {
    const assignmentId =
      parseId(req.params.id);

    const tutorReference =
      getTutorReference(req);

    console.log(
      "📥 Tutor submissions request:",
      {
        assignmentId,
        tutorReference,
      }
    );

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid assignment ID.",
      });
    }

    if (!tutorReference) {
      return res.status(401).json({
        success: false,
        message:
          "Tutor reference is required.",
      });
    }

    try {
      // --------------------------------------------------------
      // VERIFY ASSIGNMENT BELONGS TO TUTOR
      // --------------------------------------------------------

      const assignmentResult =
        await pool.query(
          `
          SELECT
            a.id,
            a.tutor_reference,
            a.grade,
            a.subject,
            a.title,
            a.description,
            a.instructions,
            a.due_at,
            a.max_score,
            a.live_class_id,
            a.status,
            a.created_at,
            a.updated_at,
            a.tutor_name,
            a.due_date,
            a.total_questions,
            a.total_marks,
            a.result_released
          FROM academy_assignments AS a
          WHERE a.id = $1
            AND a.tutor_reference = $2
          LIMIT 1
          `,
          [
            assignmentId,
            tutorReference,
          ]
        );

      if (
        assignmentResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found or you do not have access to it.",
        });
      }

      const assignment =
        assignmentResult.rows[0];

      // --------------------------------------------------------
      // GET SUBMISSIONS
      // --------------------------------------------------------

      const submissionsResult =
        await pool.query(
          `
          SELECT
            s.id,
            s.assignment_id,
            s.enrollment_id,
            s.student_name,
            s.answer,
            s.attachment_url,
            s.submitted_at,
            s.score,
            s.feedback,
            s.status
          FROM academy_assignment_submissions AS s
          WHERE s.assignment_id = $1
          ORDER BY
            s.submitted_at DESC NULLS LAST,
            s.id DESC
          `,
          [assignmentId]
        );

      const submissions =
        submissionsResult.rows;

      // --------------------------------------------------------
      // COUNTS
      // --------------------------------------------------------

      const submittedCount =
        submissions.filter(
          (submission) => {
            const status =
              clean(
                submission.status
              ).toLowerCase();

            return (
              status === "submitted" ||
              status === ""
            );
          }
        ).length;

      const reviewedCount =
        submissions.filter(
          (submission) => {
            const status =
              clean(
                submission.status
              ).toLowerCase();

            return (
              status === "reviewed" ||
              status === "graded"
            );
          }
        ).length;

      const returnedCount =
        submissions.filter(
          (submission) => {
            const status =
              clean(
                submission.status
              ).toLowerCase();

            return (
              status === "returned"
            );
          }
        ).length;

      const awaitingReview =
        submissions.filter(
          (submission) => {
            const status =
              clean(
                submission.status
              ).toLowerCase();

            return (
              status === "submitted" ||
              status === ""
            );
          }
        ).length;

      return res.status(200).json({
        success: true,

        assignment,

        submissions,

        count:
          submissions.length,

        submissionCount:
          submissions.length,

        submittedCount,

        awaitingReview,

        reviewedCount,

        gradedCount:
          reviewedCount,

        returnedCount,
      });
    } catch (error) {
      console.error(
        "❌ GET tutor assignment submissions failed:"
      );

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to load submissions.",
        error: error.message,
      });
    }
  }
);

// ============================================================
// GET ONE SUBMISSION
//
// GET /api/academy/tutor/assignments/:id/submissions/:submissionId
// ============================================================

router.get(
  "/:id/submissions/:submissionId",
  async (req, res) => {
    const assignmentId =
      parseId(req.params.id);

    const submissionId =
      parseId(
        req.params.submissionId
      );

    const tutorReference =
      getTutorReference(req);

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid assignment ID.",
      });
    }

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid submission ID.",
      });
    }

    if (!tutorReference) {
      return res.status(401).json({
        success: false,
        message:
          "Tutor reference is required.",
      });
    }

    try {
      // --------------------------------------------------------
      // VERIFY ASSIGNMENT
      // --------------------------------------------------------

      const assignmentResult =
        await pool.query(
          `
          SELECT
            a.id,
            a.tutor_reference,
            a.grade,
            a.subject,
            a.title,
            a.description,
            a.instructions,
            a.due_at,
            a.max_score,
            a.live_class_id,
            a.status,
            a.created_at,
            a.updated_at,
            a.tutor_name,
            a.due_date,
            a.total_questions,
            a.total_marks,
            a.result_released
          FROM academy_assignments AS a
          WHERE a.id = $1
            AND a.tutor_reference = $2
          LIMIT 1
          `,
          [
            assignmentId,
            tutorReference,
          ]
        );

      if (
        assignmentResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const assignment =
        assignmentResult.rows[0];

      // --------------------------------------------------------
      // QUESTIONS
      // --------------------------------------------------------

      const questionsResult =
        await pool.query(
          `
          SELECT
            q.id,
            q.assignment_id,
            q.question_number,
            q.question,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            q.reason,
            q.marks,
            q.created_at
          FROM academy_assignment_questions AS q
          WHERE q.assignment_id = $1
          ORDER BY
            q.question_number ASC,
            q.id ASC
          `,
          [assignmentId]
        );

      // --------------------------------------------------------
      // SUBMISSION
      // --------------------------------------------------------

      const submissionResult =
        await pool.query(
          `
          SELECT
            s.id,
            s.assignment_id,
            s.enrollment_id,
            s.student_name,
            s.answer,
            s.attachment_url,
            s.submitted_at,
            s.score,
            s.feedback,
            s.status
          FROM academy_assignment_submissions AS s
          WHERE s.id = $1
            AND s.assignment_id = $2
          LIMIT 1
          `,
          [
            submissionId,
            assignmentId,
          ]
        );

      if (
        submissionResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found.",
        });
      }

      return res.status(200).json({
        success: true,
        assignment,
        questions:
          questionsResult.rows,
        submission:
          submissionResult.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ GET single tutor submission failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load submission.",
        error: error.message,
      });
    }
  }
);

// ============================================================
// GRADE / UPDATE SUBMISSION
//
// PATCH /api/academy/tutor/assignments/:id/submissions/:submissionId
// ============================================================

router.patch(
  "/:id/submissions/:submissionId",
  async (req, res) => {
    const assignmentId =
      parseId(req.params.id);

    const submissionId =
      parseId(
        req.params.submissionId
      );

    const tutorReference =
      getTutorReference(req);

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid assignment ID.",
      });
    }

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid submission ID.",
      });
    }

    if (!tutorReference) {
      return res.status(401).json({
        success: false,
        message:
          "Tutor reference is required.",
      });
    }

    try {
      // --------------------------------------------------------
      // VERIFY ASSIGNMENT
      // --------------------------------------------------------

      const assignmentResult =
        await pool.query(
          `
          SELECT
            a.id,
            a.tutor_reference,
            a.max_score,
            a.total_marks
          FROM academy_assignments AS a
          WHERE a.id = $1
            AND a.tutor_reference = $2
          LIMIT 1
          `,
          [
            assignmentId,
            tutorReference,
          ]
        );

      if (
        assignmentResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const assignment =
        assignmentResult.rows[0];

      // --------------------------------------------------------
      // VERIFY SUBMISSION
      // --------------------------------------------------------

      const existingSubmissionResult =
        await pool.query(
          `
          SELECT
            s.id,
            s.assignment_id,
            s.score,
            s.feedback,
            s.status
          FROM academy_assignment_submissions AS s
          WHERE s.id = $1
            AND s.assignment_id = $2
          LIMIT 1
          `,
          [
            submissionId,
            assignmentId,
          ]
        );

      if (
        existingSubmissionResult.rows
          .length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found.",
        });
      }

      const existingSubmission =
        existingSubmissionResult
          .rows[0];

      // --------------------------------------------------------
      // INPUT
      // --------------------------------------------------------

      const body =
        req.body || {};

      const rawScore =
        body.score !== undefined
          ? body.score
          : existingSubmission.score;

      const feedback =
        body.feedback !== undefined
          ? clean(body.feedback)
          : existingSubmission.feedback ||
            "";

      const requestedStatus =
        body.status !== undefined
          ? body.status
          : existingSubmission.status;

      const status =
        normalizeStatus(
          requestedStatus
        );

      if (status === null) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Use submitted, reviewed, or returned.",
        });
      }

      // --------------------------------------------------------
      // SCORE VALIDATION
      // --------------------------------------------------------

      let score = null;

      if (
        rawScore !== null &&
        rawScore !== undefined &&
        clean(rawScore) !== ""
      ) {
        score = Number(
          rawScore
        );

        if (
          !Number.isFinite(score)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Score must be a valid number.",
          });
        }

        if (score < 0) {
          return res.status(400).json({
            success: false,
            message:
              "Score cannot be below 0.",
          });
        }

        const maximum =
          assignment.max_score ??
          assignment.total_marks ??
          null;

        if (
          maximum !== null &&
          maximum !== undefined &&
          Number.isFinite(
            Number(maximum)
          ) &&
          score > Number(maximum)
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Score cannot be greater than ${maximum}.`,
          });
        }
      }

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      const updateResult =
        await pool.query(
          `
          UPDATE academy_assignment_submissions
          SET
            score = $1,
            feedback = $2,
            status = $3
          WHERE id = $4
            AND assignment_id = $5
          RETURNING
            id,
            assignment_id,
            enrollment_id,
            student_name,
            answer,
            attachment_url,
            submitted_at,
            score,
            feedback,
            status
          `,
          [
            score,
            feedback,
            status,
            submissionId,
            assignmentId,
          ]
        );

      if (
        updateResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Submission could not be updated.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Submission updated successfully.",
        submission:
          updateResult.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ PATCH tutor submission failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to save grade.",
        error: error.message,
      });
    }
  }
);

// ============================================================
// DELETE ASSIGNMENT
//
// DELETE /api/academy/tutor/assignments/:id
//
// Deletes:
// 1. academy_assignment_submissions
// 2. academy_assignment_questions
// 3. academy_assignments
//
// IMPORTANT:
// academy_assignment_answers DOES NOT EXIST.
// ============================================================

router.delete(
  "/:id",
  async (req, res) => {
    const assignmentId =
      parseId(req.params.id);

    const tutorReference =
      getTutorReference(req);

    console.log(
      "🗑️ Tutor delete assignment request:",
      {
        assignmentId,
        tutorReference,
      }
    );

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid assignment ID.",
      });
    }

    if (!tutorReference) {
      return res.status(401).json({
        success: false,
        message:
          "Tutor reference is required.",
      });
    }

    const client =
      await pool.connect();

    try {
      await client.query(
        "BEGIN"
      );

      // --------------------------------------------------------
      // VERIFY ASSIGNMENT BELONGS TO TUTOR
      // --------------------------------------------------------

      const assignmentResult =
        await client.query(
          `
          SELECT
            id,
            tutor_reference,
            title,
            subject,
            grade
          FROM academy_assignments
          WHERE id = $1
            AND tutor_reference = $2
          LIMIT 1
          `,
          [
            assignmentId,
            tutorReference,
          ]
        );

      if (
        assignmentResult.rows.length ===
        0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message:
            "Assignment not found or you do not have permission to delete it.",
        });
      }

      // --------------------------------------------------------
      // DELETE SUBMISSIONS
      // --------------------------------------------------------

      const submissionsDeleteResult =
        await client.query(
          `
          DELETE FROM academy_assignment_submissions
          WHERE assignment_id = $1
          `,
          [assignmentId]
        );

      // --------------------------------------------------------
      // DELETE QUESTIONS
      // --------------------------------------------------------

      const questionsDeleteResult =
        await client.query(
          `
          DELETE FROM academy_assignment_questions
          WHERE assignment_id = $1
          `,
          [assignmentId]
        );

      // --------------------------------------------------------
      // DELETE ASSIGNMENT
      // --------------------------------------------------------

      const assignmentDeleteResult =
        await client.query(
          `
          DELETE FROM academy_assignments
          WHERE id = $1
            AND tutor_reference = $2
          RETURNING
            id,
            title,
            subject,
            grade
          `,
          [
            assignmentId,
            tutorReference,
          ]
        );

      if (
        assignmentDeleteResult.rows
          .length === 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res.status(404).json({
          success: false,
          message:
            "Assignment could not be deleted.",
        });
      }

      await client.query(
        "COMMIT"
      );

      return res.status(200).json({
        success: true,
        message:
          "Assignment deleted successfully.",
        assignment:
          assignmentDeleteResult.rows[0],
        deleted: {
          submissions:
            submissionsDeleteResult.rowCount ||
            0,
          questions:
            questionsDeleteResult.rowCount ||
            0,
          assignment: 1,
        },
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
        "❌ DELETE tutor assignment failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete assignment.",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

export default router;