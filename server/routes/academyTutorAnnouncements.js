import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

function getTutorReference(req) {
  const reference =
    req.headers["x-tutor-reference"] ||
    req.body?.tutorReference ||
    req.body?.tutor_reference ||
    req.query?.tutorReference ||
    req.query?.tutor_reference;

  return reference ? String(reference).trim() : "";
}

/*
|--------------------------------------------------------------------------
| GET /api/academy/tutor/announcements
|
| Get all announcements created by the logged-in tutor
|--------------------------------------------------------------------------
*/

router.get("/announcements", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

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
        class_id,
        class_name,
        subject,
        title,
        message,
        created_at,
        updated_at
      FROM academy_tutor_announcements
      WHERE tutor_reference = $1
      ORDER BY created_at DESC
      `,
      [tutorReference]
    );

    return res.json({
      success: true,
      announcements: result.rows,
    });
  } catch (error) {
    console.error(
      "GET tutor announcements error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load announcements.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/academy/tutor/announcements/:id
|
| Get one announcement
|--------------------------------------------------------------------------
*/

router.get("/announcements/:id", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);
    const { id } = req.params;

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
        class_id,
        class_name,
        subject,
        title,
        message,
        created_at,
        updated_at
      FROM academy_tutor_announcements
      WHERE id = $1
        AND tutor_reference = $2
      LIMIT 1
      `,
      [id, tutorReference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.json({
      success: true,
      announcement: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET tutor announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load announcement.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/academy/tutor/announcements
|
| Create announcement
|--------------------------------------------------------------------------
*/

router.post("/announcements", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        message: "Tutor reference is required.",
      });
    }

    const {
      classId,
      class_id,
      className,
      class_name,
      grade,
      subject,
      subject_name,
      title,
      message,
      content,
    } = req.body;

    const finalClassId =
      classId ||
      class_id ||
      null;

    const finalClassName =
      className ||
      class_name ||
      grade ||
      "";

    const finalSubject =
      subject ||
      subject_name ||
      "";

    const finalTitle =
      typeof title === "string"
        ? title.trim()
        : "";

    const finalMessage =
      typeof message === "string"
        ? message.trim()
        : typeof content === "string"
        ? content.trim()
        : "";

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!finalTitle) {
      return res.status(400).json({
        success: false,
        message: "Announcement title is required.",
      });
    }

    if (!finalMessage) {
      return res.status(400).json({
        success: false,
        message: "Announcement message is required.",
      });
    }

    if (!finalClassName) {
      return res.status(400).json({
        success: false,
        message: "Class is required.",
      });
    }

    if (!finalSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Insert announcement
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `
      INSERT INTO academy_tutor_announcements (
        tutor_reference,
        class_id,
        class_name,
        subject,
        title,
        message
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tutor_reference,
        class_id,
        class_name,
        subject,
        title,
        message,
        created_at,
        updated_at
      `,
      [
        tutorReference,
        finalClassId
          ? String(finalClassId)
          : null,
        finalClassName,
        finalSubject,
        finalTitle,
        finalMessage,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Announcement published successfully.",
      announcement: result.rows[0],
    });
  } catch (error) {
    console.error(
      "POST tutor announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to publish announcement.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| PATCH /api/academy/tutor/announcements/:id
|
| Update announcement
|--------------------------------------------------------------------------
*/

router.patch("/announcements/:id", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);
    const { id } = req.params;

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        message: "Tutor reference is required.",
      });
    }

    const {
      classId,
      class_id,
      className,
      class_name,
      grade,
      subject,
      subject_name,
      title,
      message,
      content,
    } = req.body;

    const finalClassId =
      classId ??
      class_id ??
      null;

    const finalClassName =
      className ??
      class_name ??
      grade ??
      "";

    const finalSubject =
      subject ??
      subject_name ??
      "";

    const finalTitle =
      typeof title === "string"
        ? title.trim()
        : "";

    const finalMessage =
      typeof message === "string"
        ? message.trim()
        : typeof content === "string"
        ? content.trim()
        : "";

    if (!finalTitle) {
      return res.status(400).json({
        success: false,
        message: "Announcement title is required.",
      });
    }

    if (!finalMessage) {
      return res.status(400).json({
        success: false,
        message: "Announcement message is required.",
      });
    }

    if (!finalClassName) {
      return res.status(400).json({
        success: false,
        message: "Class is required.",
      });
    }

    if (!finalSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    const result = await pool.query(
      `
      UPDATE academy_tutor_announcements
      SET
        class_id = $1,
        class_name = $2,
        subject = $3,
        title = $4,
        message = $5,
        updated_at = NOW()
      WHERE id = $6
        AND tutor_reference = $7
      RETURNING
        id,
        tutor_reference,
        class_id,
        class_name,
        subject,
        title,
        message,
        created_at,
        updated_at
      `,
      [
        finalClassId
          ? String(finalClassId)
          : null,
        finalClassName,
        finalSubject,
        finalTitle,
        finalMessage,
        id,
        tutorReference,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found.",
      });
    }

    return res.json({
      success: true,
      message: "Announcement updated successfully.",
      announcement: result.rows[0],
    });
  } catch (error) {
    console.error(
      "PATCH tutor announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update announcement.",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE /api/academy/tutor/announcements/:id
|
| Delete announcement
|--------------------------------------------------------------------------
*/

router.delete(
  "/announcements/:id",
  async (req, res) => {
    try {
      const tutorReference =
        getTutorReference(req);

      const { id } = req.params;

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message: "Tutor reference is required.",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM academy_tutor_announcements
        WHERE id = $1
          AND tutor_reference = $2
        RETURNING id
        `,
        [id, tutorReference]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found.",
        });
      }

      return res.json({
        success: true,
        message: "Announcement deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE tutor announcement error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete announcement.",
        error: error.message,
      });
    }
  }
);

export default router;
