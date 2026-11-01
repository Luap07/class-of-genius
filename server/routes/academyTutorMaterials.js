import express from "express";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";

const router = express.Router();

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const getJwtSecret = () =>
  clean(
    process.env.JWT_SECRET ||
      process.env.ACADEMY_JWT_SECRET ||
      process.env.AUTH_SECRET
  );

const getToken = (req) => {
  const authorization = clean(req.headers.authorization);

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return clean(
    req.headers["x-academy-token"] ||
      req.headers["x-auth-token"]
  );
};

const requireVerifiedTutor = async (req, res, next) => {
  try {
    const secret = getJwtSecret();

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Academy authentication is not configured.",
      });
    }

    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Tutor authentication token is required.",
      });
    }

    const decoded = jwt.verify(token, secret);

    const accountType = clean(
      decoded.userType ||
        decoded.user_type ||
        decoded.type ||
        decoded.role
    ).toLowerCase();

    if (accountType !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Tutor access is required.",
      });
    }

    const reference = clean(
      decoded.tutorReference ||
        decoded.tutor_reference ||
        decoded.reference
    );

    if (!reference) {
      return res.status(401).json({
        success: false,
        message: "Tutor reference is missing from the token.",
      });
    }

    const tutorResult = await pool.query(
      `
        SELECT
          reference,
          application_status
        FROM academy_tutor_applications
        WHERE LOWER(TRIM(reference)) = LOWER(TRIM($1))
        LIMIT 1
      `,
      [reference]
    );

    const tutor = tutorResult.rows[0];

    if (
      !tutor ||
      clean(tutor.application_status).toLowerCase() !== "verified"
    ) {
      return res.status(403).json({
        success: false,
        message: "A verified tutor account is required.",
      });
    }

    req.tutor = {
      reference: tutor.reference,
    };

    return next();
  } catch (error) {
    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "TokenExpiredError" ||
      error?.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    console.error(
      "Tutor materials authentication error:",
      error?.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate tutor.",
    });
  }
};

/*
 * GET /api/academy/tutor/materials
 *
 * Read-only endpoint for verified tutors.
 * Admin material-management routes remain separate.
 */
router.get("/", requireVerifiedTutor, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        subject,
        level,
        material_type,
        file_url,
        created_at,
        file_name,
        file_size,
        file_mime_type,
        cover_page_url,
        back_page_url,
        is_locked
      FROM learning_materials
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      materials: result.rows,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error(
      "Tutor materials fetch error:",
      error?.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load learning materials.",
    });
  }
});

export default router;